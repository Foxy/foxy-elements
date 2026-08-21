import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import type { API } from "@foxy.io/sdk/customer";
import { Alert } from "@foxy.io/design-system/alert";
import {
  ApiProvider,
  hasValidSession,
  useApi,
  useResource,
  type FollowableLink,
  type RequestCache,
} from "@/lib/customer-api";
import { customerPortalEvents } from "./events";
import { messages } from "./messages";
import type { PortalScreen } from "./types";
import { AccessRecoveryScreen } from "./screens/access-recovery";
import { AccountScreen, type PortalSettings } from "./screens/account";
import { PasswordResetScreen } from "./screens/password-reset";
import { SignInScreen } from "./screens/sign-in";
import { SignUpScreen } from "./screens/sign-up";

export function MissingStoreDomain() {
  const intl = useIntl();

  return (
    <Alert.Root $variant="destructive">
      <Alert.Description>
        {intl.formatMessage(messages.missingStoreDomain)}
      </Alert.Description>
    </Alert.Root>
  );
}

// `PortalSettings` (imported above) is `account.tsx`'s widened view of the
// full `customer_portal_settings` payload — FX-275 did the widening there,
// since that is where the `subscriptions` key it added is actually consumed.
// This screen only reads `sign_up` off the same object.

/**
 * Portal settings live inside the customer base path, at
 * `<base>customer_portal_settings` (e.g. `.../s/customer/customer_portal_settings`),
 * and are public, so this is the one place in the element that reaches for
 * `fetch` directly instead of going through the SDK. Confirmed against two
 * real consumers of the live Customer API: v1's portal
 * (`new URL('./customer_portal_settings', this.base)`) and Inflow
 * (`` `${this.base}customer_portal_settings` ``) — both resolve here, not one
 * level up.
 */
function useSettingsLink(api: API): FollowableLink<PortalSettings> | null {
  return useMemo(() => {
    const href = new URL("./customer_portal_settings", api.base).toString();
    return {
      href,
      // Status checking lives in the hook — see `assertReadSucceeded`.
      get: async () => {
        const response = await fetch(href);
        return {
          ok: response.ok,
          status: response.status,
          json: async () => (await response.json()) as PortalSettings,
        };
      },
    };
  }, [api]);
}

/**
 * Portal root: owns the API context and the screen state that both
 * `onUnauthenticated` (below) and `PortalScreens` need, then hands the rest of
 * the routing to `PortalScreens`.
 *
 * `ApiProvider` lives here rather than in `element.tsx` so `handleUnauthenticated`
 * — which needs `setScreen` — can be part of the context value every write in
 * the tree reads through `useApi()`. `useSettingsLink` and `useResource` (used
 * by `PortalScreens`) both require that context, so they cannot run in this
 * component itself; they run one level down, inside the provider.
 */
export function Portal({
  api,
  cache,
  fullNameTemplate,
  skipPasswordReset,
  onEvent,
}: {
  api: API;
  cache: RequestCache;
  fullNameTemplate: string;
  skipPasswordReset: boolean;
  onEvent: (type: string, detail?: unknown) => void;
}) {
  // Presence of the session key is not enough — see `hasValidSession`. An
  // expired session would otherwise open on the account screen, whose first
  // request clears the session and comes back 401.
  const [screen, setScreen] = useState<PortalScreen>(() =>
    hasValidSession(api) ? "account" : "sign-in",
  );

  /**
   * A request came back 401 or 403: the session is gone or was never valid.
   * Drop it so `hasValidSession` cannot route back here on the next mount, and
   * return to sign-in. No `signout` event — the customer did not sign out, and
   * firing one would tell integrators a session was cleared on request.
   *
   * Reads route here through `UnauthenticatedError`; writes call it directly
   * from `useApi().onUnauthenticated` — see `ApiProvider`'s doc comment for why
   * that has to be the caller's choice rather than a rule in the hook.
   */
  const handleUnauthenticated = useCallback(() => {
    api.storage.clear();
    setScreen("sign-in");
  }, [api]);

  return (
    <ApiProvider
      api={api}
      cache={cache}
      onUnauthenticated={handleUnauthenticated}
    >
      <PortalScreens
        screen={screen}
        setScreen={setScreen}
        fullNameTemplate={fullNameTemplate}
        skipPasswordReset={skipPasswordReset}
        onEvent={onEvent}
      />
    </ApiProvider>
  );
}

/**
 * Routes between the five screens and dispatches the element's public events.
 * `element.tsx` turns `onEvent` into real `CustomEvent`s. Split out of `Portal`
 * so this can sit inside `ApiProvider` and use `useResource` for the settings
 * read, while `Portal` itself stays outside it and owns the provider.
 *
 * `api` and `cache` come from `useApi()` rather than props: this component
 * only ever renders inside the `ApiProvider` `Portal` sets up with the same
 * values, so threading them through as props too would just be a second,
 * redundant source of truth.
 */
function PortalScreens({
  screen,
  setScreen,
  fullNameTemplate,
  skipPasswordReset,
  onEvent,
}: {
  screen: PortalScreen;
  setScreen: (screen: PortalScreen) => void;
  fullNameTemplate: string;
  skipPasswordReset: boolean;
  onEvent: (type: string, detail?: unknown) => void;
}) {
  const { api, cache } = useApi();
  const settingsLink = useSettingsLink(api);
  // `customer_portal_settings` is public and unrelated to the customer's
  // session (see `useSettingsLink`'s doc comment) and this runs on every
  // screen, including sign-in -- a 401/403 from a misconfigured store must
  // not clear a signed-in customer's session and bounce them out.
  const { data: settings } = useResource<PortalSettings>(
    settingsLink,
    undefined,
    { skipUnauthenticatedRouting: true },
  );

  const canSignUp = settings?.sign_up?.enabled === true;
  const siteKey = settings?.sign_up?.verification?.site_key ?? "";

  /**
   * The account resource is keyed on the store's base URL, which is identical
   * for every customer of that store, so a warm cache serves one customer's
   * name, email and tax ID to the next one on a shared computer — and seeds the
   * profile dialog with the first customer's `self` link, so a save would PATCH
   * their href. Both ends of a session therefore drop the cache.
   *
   * The two directions cannot use the same mechanism:
   *
   * - Entering a session, this runs while the sign-in screen is still the only
   *   thing mounted, so clearing here starts nothing.
   * - Leaving one, the account screen is still mounted and subscribed, and a
   *   synchronous clear would make it re-read the customer with no session. The
   *   effect below runs after the commit that unmounted it.
   */
  function afterSignIn() {
    cache.clear();
    onEvent(customerPortalEvents.signIn);
    const needsReset = api.usesTemporaryPassword && !skipPasswordReset;
    setScreen(needsReset ? "password-reset" : "account");
  }

  const previousScreen = useRef(screen);

  useEffect(() => {
    const from = previousScreen.current;
    previousScreen.current = screen;

    if (
      screen === "sign-in" &&
      (from === "account" || from === "password-reset")
    ) {
      cache.clear();
    }
  }, [screen, cache]);

  if (screen === "sign-in") {
    return (
      <SignInScreen
        canSignUp={canSignUp}
        onSignedIn={afterSignIn}
        onRecoverAccess={() => setScreen("access-recovery")}
        onSignUp={() => setScreen("sign-up")}
      />
    );
  }

  if (screen === "access-recovery") {
    return <AccessRecoveryScreen onBack={() => setScreen("sign-in")} />;
  }

  if (screen === "sign-up") {
    return (
      <SignUpScreen
        siteKey={siteKey}
        onSignedIn={afterSignIn}
        onBack={() => setScreen("sign-in")}
      />
    );
  }

  if (screen === "password-reset") {
    return (
      <PasswordResetScreen
        canSkip={!skipPasswordReset}
        onCompleted={() => {
          onEvent(customerPortalEvents.passwordReset, { result: "completed" });
          setScreen("account");
        }}
        onSkipped={() => {
          onEvent(customerPortalEvents.passwordReset, { result: "skipped" });
          setScreen("account");
        }}
      />
    );
  }

  return (
    <AccountScreen
      fullNameTemplate={fullNameTemplate}
      onSignedOut={() => {
        onEvent(customerPortalEvents.signOut);
        setScreen("sign-in");
      }}
      settings={settings}
    />
  );
}
