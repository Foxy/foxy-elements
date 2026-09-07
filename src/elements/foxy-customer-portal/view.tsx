import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import {
  accountPageKey,
  accountPageToSearchParams,
  parseAccountPageFromSearch,
  type AccountPage,
} from "./account-page";
import { customerPortalEvents } from "./events";
import { usePortalContainer } from "./portal-container";
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
/**
 * A fresh id for one history entry. `randomUUID` where it exists, a counter
 * otherwise -- these only need to be unique within one document's lifetime,
 * never guessable or stable across loads.
 */
let scrollKeyCounter = 0;
function newScrollKey(): string {
  return typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `fc-${Date.now()}-${scrollKeyCounter++}`;
}

export function Portal({
  api,
  cache,
  fullNameTemplate,
  skipPasswordReset,
  urlSync,
  onEvent,
}: {
  api: API;
  cache: RequestCache;
  fullNameTemplate: string;
  skipPasswordReset: boolean;
  urlSync: boolean;
  onEvent: (type: string, detail?: unknown) => void;
}) {
  // Presence of the session key is not enough — see `hasValidSession`. An
  // expired session would otherwise open on the account screen, whose first
  // request clears the session and comes back 401.
  const [screen, setScreen] = useState<PortalScreen>(() =>
    hasValidSession(api) ? "account" : "sign-in",
  );

  // Lives here, alongside `screen` rather than inside `AccountScreen`, so a
  // deep link queued while signed out (`screen` starts at `"sign-in"`
  // regardless) survives the transition to `"account"` once `afterSignIn`
  // flips `screen` — no special "resume" code needed, this falls out of the
  // two states changing independently.
  const [accountPage, setAccountPageState] = useState<AccountPage>(() =>
    urlSync
      ? parseAccountPageFromSearch(window.location.search)
      : { type: "home" },
  );

  const portalContainer = usePortalContainer();

  // Where the customer was, keyed by HISTORY ENTRY rather than by page, so
  // visiting home twice at different offsets remembers both. A page-keyed map
  // holds one position per page, and a Back stack that passes through home
  // more than once then restores the newest offset every time.
  //
  // With `urlSync` off there are no history entries to key on -- the portal
  // pushes nothing -- so it falls back to the page identity there. Less
  // precise, and the only thing available in that mode.
  const scrollPositions = useRef(new Map<string, number>());

  // The entry the customer is on now. Tracked in a ref rather than read from
  // `history.state` at use time: by the time `popstate` fires, `history.state`
  // is already the entry being moved TO, so the one being left could no
  // longer be identified.
  const currentScrollKey = useRef<string>("");

  // What to do once the next page has actually rendered. Scrolling inside the
  // navigate callback would run against the OLD page: restoring 1868px while
  // a short form is still mounted clamps to that form's height and lands
  // nowhere near where the customer was.
  const pendingScroll = useRef<"top" | number | null>(null);

  // Read inside `navigateAccountPage` without making it depend on the current
  // page, which would rebuild the callback -- and every consumer's memo --
  // on every navigation.
  const accountPageRef = useRef(accountPage);

  /**
   * Brings the top of the portal into view after a navigation.
   *
   * Swapping `accountPage` replaces what is rendered but leaves the
   * document's scroll offset alone, so opening a short page from far down a
   * long one lands the customer at its end -- on mobile, tapping Edit at the
   * bottom of Home opened the address form scrolled past everything in it.
   *
   * Scrolls this element's own container rather than the window: the portal
   * is embedded in someone else's page, which may have a header or content
   * above it, and `window.scrollTo(0, 0)` would discard a position the
   * widget does not own.
   *
   * Instant rather than smooth. A long smooth scroll on navigation is slow
   * and disorienting, and jumping sidesteps `prefers-reduced-motion`
   * entirely.
   *
   * Deliberately NOT called from the `popstate` handler below: the browser
   * restores scroll for a Back or Forward itself, and overriding it there
   * would throw away the position the customer is returning to.
   */
  const scrollToPortalTop = useCallback(() => {
    portalContainer?.scrollIntoView({ block: "start" });
  }, [portalContainer]);

  useLayoutEffect(() => {
    accountPageRef.current = accountPage;

    const target = pendingScroll.current;
    if (target === null) return;
    pendingScroll.current = null;

    if (target === "top") {
      scrollToPortalTop();
    } else {
      // An offset the customer was already at, so restoring it imposes
      // nothing the way a blanket scroll-to-zero would.
      window.scrollTo(0, target);
    }
  });

  /**
   * The scroll bookkeeping's view of `history.state`.
   *
   * `fcScrollKey` identifies the entry; `fcCameFrom` is the entry that was
   * current when this one was pushed. The in-portal Back needs the second
   * because it *pushes* a new entry rather than popping -- it cannot read the
   * position off the entry it is returning to, since that is not where it is
   * going. Pushing rather than calling `history.back()` is deliberate: a
   * customer who arrived by deep link has no portal entry behind them, and
   * `back()` would take them off the site entirely.
   */
  type ScrollState = { fcScrollKey?: string; fcCameFrom?: string };

  const readScrollState = useCallback(
    () => (history.state ?? null) as ScrollState | null,
    [],
  );

  /**
   * Identifies the current entry, falling back to the page when the portal
   * owns no history entries (`urlSync` off).
   */
  const keyForNow = useCallback(
    () =>
      (urlSync ? readScrollState()?.fcScrollKey : null) ??
      accountPageKey(accountPageRef.current),
    [urlSync, readScrollState],
  );

  // Seeds the entry the portal starts on. Without this the first navigation
  // records its scroll under a key nothing ever reads back, so returning to
  // where the customer began would silently land at the top. Spreads the
  // existing state -- the host page may keep its own routing data there.
  useEffect(() => {
    if (!urlSync) {
      currentScrollKey.current = accountPageKey(accountPageRef.current);
      return;
    }

    const existing = readScrollState()?.fcScrollKey;
    if (existing) {
      currentScrollKey.current = existing;
      return;
    }

    const seeded = newScrollKey();
    currentScrollKey.current = seeded;
    history.replaceState(
      { ...(history.state ?? {}), fcScrollKey: seeded },
      "",
      window.location.href,
    );
  }, [urlSync, readScrollState]);

  // Mutates `url.searchParams` surgically -- deleting only the two keys this
  // element owns and setting whatever the codec returns -- rather than
  // replacing `url.search` wholesale. The host page may have its own params
  // (`?utm_source=...`) on the same URL; the `fc_` prefix on these two keys
  // only means something if the rest of the query string survives a portal
  // navigation untouched.
  const navigateAccountPage = useCallback(
    (page: AccountPage, options?: { restoreScroll?: boolean }) => {
      // Remember the spot being left before anything re-renders.
      const leavingKey = currentScrollKey.current || keyForNow();
      scrollPositions.current.set(leavingKey, window.scrollY);

      // `restoreScroll` is set only by the in-portal Back control, so a
      // forward navigation to a page visited earlier still opens at its top.
      // Inferring "this is a Back" from the target page would get that wrong:
      // Home is both what Back returns to and what half the forward links go
      // to.
      //
      // The position comes from the entry this one was pushed FROM, not from
      // the target page: Back pushes a new entry, so there is nothing on the
      // destination to read.
      const cameFrom = urlSync
        ? readScrollState()?.fcCameFrom
        : accountPageKey(page);

      const saved =
        options?.restoreScroll && cameFrom
          ? scrollPositions.current.get(cameFrom)
          : undefined;

      pendingScroll.current = saved ?? "top";
      setAccountPageState(page);
      if (!urlSync) {
        currentScrollKey.current = accountPageKey(page);
        return;
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("fc_page");
      url.searchParams.delete("fc_id");
      for (const [key, value] of accountPageToSearchParams(page)) {
        url.searchParams.set(key, value);
      }

      const nextKey = newScrollKey();
      currentScrollKey.current = nextKey;
      history.pushState(
        { fcAccountPage: true, fcScrollKey: nextKey, fcCameFrom: leavingKey },
        "",
        url,
      );
    },
    [urlSync, keyForNow, readScrollState],
  );

  // Sign-out uses this, not `navigateAccountPage`: a customer signing in
  // again on a shared computer must not land on a stale sub-page from the
  // previous session, and `replaceState` (not `pushState`) keeps that reset
  // from adding a spurious Back stop on top of everything the previous
  // session actually navigated through. Same surgical-delete-then-set
  // pattern as `navigateAccountPage` above, for the same reason.
  const resetAccountPage = useCallback(() => {
    scrollPositions.current.clear();
    currentScrollKey.current = "";
    pendingScroll.current = "top";
    setAccountPageState({ type: "home" });
    if (!urlSync) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("fc_page");
    url.searchParams.delete("fc_id");
    for (const [key, value] of accountPageToSearchParams({ type: "home" })) {
      url.searchParams.set(key, value);
    }
    history.replaceState({ fcAccountPage: true }, "", url);
  }, [urlSync]);

  // Registered only while `urlSync` is on, and torn down the moment it turns
  // off or this unmounts -- the listener lives on `window`, not on this
  // element, so it would otherwise outlive the element's own lifecycle.
  // Re-parses on *every* popstate, including one that lands on a URL with no
  // `fc_page` at all (the customer backed past every portal-related entry
  // into the host page's own prior state) -- `parseAccountPageFromSearch`'s
  // fallback to `home` is what makes that safe rather than a case to handle
  // here. Calls `setAccountPageState` directly, never `navigateAccountPage`
  // -- that would push a fresh entry on top of the one the browser just
  // popped to, breaking Back.
  //
  // Scroll is restored from the same map the in-portal Back uses, so both
  // Backs behave identically. That also fixes the browser's own attempt,
  // which cannot work here: it restores as the entry is popped, while React
  // has yet to render the taller page, so the offset clamps to the height of
  // the page being left.
  //
  // Taking `scrollRestoration` off `auto` is a document-global change, and
  // this element is a guest on someone else's page -- so it is scoped to
  // `urlSync` (the mode where the portal already owns history entries) and
  // the previous value is handed back on cleanup.
  useEffect(() => {
    if (!urlSync) return;

    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";

    function handlePopState() {
      const page = parseAccountPageFromSearch(window.location.search);

      // `history.state` is already the entry being moved TO, which is why the
      // one being left has to come from the ref.
      if (currentScrollKey.current) {
        scrollPositions.current.set(currentScrollKey.current, window.scrollY);
      }

      const arrivingKey =
        (history.state as ScrollState | null)?.fcScrollKey ??
        accountPageKey(page);
      currentScrollKey.current = arrivingKey;

      // No recorded position means the customer arrived by deep link or
      // reload and has never stood on this entry in this session -- its top
      // is the only honest answer.
      pendingScroll.current = scrollPositions.current.get(arrivingKey) ?? "top";

      setAccountPageState(page);
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      history.scrollRestoration = previousRestoration;
    };
  }, [urlSync]);

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
        accountPage={accountPage}
        onNavigateAccountPage={navigateAccountPage}
        onResetAccountPage={resetAccountPage}
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
  accountPage,
  onNavigateAccountPage,
  onResetAccountPage,
  fullNameTemplate,
  skipPasswordReset,
  onEvent,
}: {
  screen: PortalScreen;
  setScreen: (screen: PortalScreen) => void;
  accountPage: AccountPage;
  onNavigateAccountPage: (
    page: AccountPage,
    options?: { restoreScroll?: boolean },
  ) => void;
  onResetAccountPage: () => void;
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

  // Covers both paths back to sign-in -- explicit sign-out and a 401/403 via
  // `handleUnauthenticated` (see its doc comment in `Portal` above) -- so
  // `onResetAccountPage` fires exactly once per session end regardless of
  // which one triggered it. `accountPage.resource` is a second channel that
  // can carry a customer's data (a full address, order or subscription
  // object) across the same shared-computer boundary `cache.clear()` already
  // guards below; leaving it out here would let it survive into the next
  // customer's session even though the cache itself was cleared.
  useEffect(() => {
    const from = previousScreen.current;
    previousScreen.current = screen;

    if (
      screen === "sign-in" &&
      (from === "account" || from === "password-reset")
    ) {
      cache.clear();
      onResetAccountPage();
    }
  }, [screen, cache, onResetAccountPage]);

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
        // No `onResetAccountPage()` call here -- this transitions `screen` to
        // `"sign-in"`, which the effect above already resets `accountPage`
        // for (alongside `cache.clear()`), the same as every other path back
        // to sign-in. One place, not duplicated.
        setScreen("sign-in");
      }}
      settings={settings}
      accountPage={accountPage}
      onNavigate={onNavigateAccountPage}
    />
  );
}
