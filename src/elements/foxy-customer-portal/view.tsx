import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { API } from "@foxy.io/sdk/customer";
import { useApi, useResource, type FollowableLink } from "@/lib/customer-api";
import { customerPortalEvents } from "./events";
import { messages } from "./messages";
import type { PortalScreen } from "./types";
import { AccessRecoveryScreen } from "./screens/access-recovery";
import { AccountScreen } from "./screens/account";
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

// Only the slice of `fx:customer_portal_settings` this task reads — FX-275
// widens it.
type PortalSettings = {
  sign_up?: {
    enabled: boolean;
    verification: { type: "hcaptcha"; site_key: string };
  };
};

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
function useSettingsLink(): FollowableLink<PortalSettings> | null {
  const { api } = useApi();

  return useMemo(() => {
    const href = new URL("./customer_portal_settings", api.base).toString();
    return {
      href,
      get: async () => {
        const response = await fetch(href);
        if (!response.ok) throw new Error("Failed to load portal settings.");
        return { json: async () => (await response.json()) as PortalSettings };
      },
    };
  }, [api]);
}

/**
 * Portal root: routes between the five screens and dispatches the element's
 * public events. `element.tsx` turns `onEvent` into real `CustomEvent`s.
 */
export function Portal({
  fullNameTemplate,
  skipPasswordReset,
  onEvent,
}: {
  fullNameTemplate: string;
  skipPasswordReset: boolean;
  onEvent: (type: string, detail?: unknown) => void;
}) {
  const { api } = useApi();
  const settingsLink = useSettingsLink();
  const { data: settings } = useResource<PortalSettings>(settingsLink);

  const [screen, setScreen] = useState<PortalScreen>(() =>
    api.storage.getItem(API.SESSION) ? "account" : "sign-in",
  );

  const canSignUp = settings?.sign_up?.enabled === true;
  const siteKey = settings?.sign_up?.verification.site_key ?? "";

  function afterSignIn() {
    onEvent(customerPortalEvents.signIn);
    const needsReset = api.usesTemporaryPassword && !skipPasswordReset;
    setScreen(needsReset ? "password-reset" : "account");
  }

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
        onSignedUp={afterSignIn}
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
    />
  );
}
