import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import {
  useApi,
  useResource,
  type FollowableLink,
  type ReadResponse,
} from "@/lib/customer-api";
import { PortalHeader, type SignOutState } from "../sections/header";
import { PasswordDialog } from "../sections/password-dialog";
import {
  ProfileDialog,
  type CustomerResource,
} from "../sections/profile-dialog";
import {
  SubscriptionsSection,
  type CartDisplayConfig,
  type PortalSettings as SubscriptionsSettings,
} from "../sections/subscriptions";
import { messages } from "../messages";

/** How long the sign-out button stays in its error state. Matches v1. */
const SIGN_OUT_ERROR_MS = 1000;

/**
 * The full `customer_portal_settings` payload, as `view.tsx` fetches it and
 * casts to this type (FX-275 widens it from a `sign_up`-only slice). Declared
 * with `subscriptions` optional — unlike `SubscriptionsSettings` below, which
 * requires it — because this type also has to describe the settings request's
 * own loading window (`null` flows straight through `view.tsx`'s
 * `useResource`) and a store whose response omits the key. Presence is
 * re-checked at the mount point below before anything is handed to
 * `SubscriptionsSection`.
 */
export type PortalSettings = {
  sign_up?: {
    enabled: boolean;
    verification: { type: "hcaptcha"; site_key: string };
  };
  /**
   * Declared independently of `SubscriptionsSettings` below, not folded into
   * it: that type's `subscriptions` field is a separate key on the same
   * `customer_portal_settings` response, and a payload can carry one without
   * the other. Gating this behind the `subscriptions` presence check the way
   * `subscriptionsSettings` does below would silently drop the store's
   * display flags whenever a response omits `subscriptions`.
   */
  cart_display_config?: CartDisplayConfig;
} & Partial<SubscriptionsSettings>;

type Props = {
  fullNameTemplate: string;
  onSignedOut: () => void;
  /** `null` while the settings request is still in flight. */
  settings: PortalSettings | null;
};

export function AccountScreen({
  fullNameTemplate,
  onSignedOut,
  settings,
}: Props) {
  const intl = useIntl();
  const { api } = useApi();

  // The customer API's root graph *is* the customer, so `api.get()` returns it.
  // Wrapped as a link rather than cast: `API` has no `href`, and the cache keys
  // on `href`. Status checking lives in the hook — see `assertReadSucceeded`.
  //
  // The cast below covers the whole response, not just the parsed body: the
  // SDK's `get()` resolves a `Response` whose `ok`/`status` are real inherited
  // members (safe as-is), but whose `json()` resolves a `FollowableResource`,
  // not `CustomerResource` — the SDK types nullable customer fields as
  // `string | null`, while our screens use `undefined` for "absent"
  // throughout (see `CustomerProps`). The cast is widening the type to match
  // that, not papering over a runtime mismatch.
  const rootLink = useMemo<FollowableLink<CustomerResource>>(
    () => ({
      href: api.base.toString(),
      get: () =>
        api.get() as unknown as Promise<ReadResponse<CustomerResource>>,
    }),
    [api],
  );

  const { data, error, isLoading, isUnauthenticated, refresh } =
    useResource<CustomerResource>(rootLink);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [signOutState, setSignOutState] = useState<SignOutState>("idle");
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimer.current !== null) clearTimeout(errorTimer.current);
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    setSignOutState("busy");

    try {
      await api.signOut();
      onSignedOut();
    } catch {
      // `API.signOut` throws before clearing local session state, so the
      // customer is still signed in here. Show the failure for a second and go
      // back to idle so they can try again — same behaviour as v1.
      setSignOutState("error");
      errorTimer.current = setTimeout(
        () => setSignOutState("idle"),
        SIGN_OUT_ERROR_MS,
      );
    }
  }, [api, onSignedOut]);

  // `settings.subscriptions` may be missing even though `SubscriptionsSettings`
  // requires it: the settings request may still be in flight (`settings` is
  // `null` then), or this store's `customer_portal_settings` response may omit
  // the key. `getAllowedFrequencies`/`getNextTransactionDateConstraints`
  // downstream only survive that by throwing inside their own try/catch, which
  // silently drops the frequency and date controls — checking here instead
  // makes the fallback to "no settings yet" explicit rather than incidental.
  const subscriptionsSettings: SubscriptionsSettings | null =
    settings?.subscriptions ? (settings as SubscriptionsSettings) : null;

  // Read off `settings` directly, not through `subscriptionsSettings` above --
  // see `PortalSettings`'s doc comment on this field for why the two need
  // separate gates.
  const cartDisplayConfig: CartDisplayConfig | null =
    settings?.cart_display_config ?? null;

  // `useResource` already fires `onUnauthenticated` (from `useApi()`, the
  // same callback this screen used to be handed as a prop) from an effect
  // the moment `error` is an `UnauthenticatedError` -- see `hooks.tsx`'s
  // `useEntry`. Routing centralised there so every resource and collection
  // in the element inherits it, not just this one.
  //
  // Hold the loading shape rather than flashing "we couldn't load your
  // account" on the way back to sign in.
  if (isLoading || isUnauthenticated) return <Skeleton />;

  if (error || !data) {
    return (
      <Alert.Root $variant="destructive">
        <Alert.Description>
          {intl.formatMessage(messages.accountLoadFailed)}
        </Alert.Description>
        <Button type="button" onClick={refresh}>
          {intl.formatMessage(messages.retry)}
        </Button>
      </Alert.Root>
    );
  }

  return (
    <div>
      <PortalHeader
        customer={data}
        fullNameTemplate={fullNameTemplate}
        onEditProfile={() => setIsProfileOpen(true)}
        onSignOut={handleSignOut}
        signOutState={signOutState}
      />

      <Button
        type="button"
        $variant="link"
        onClick={() => setIsPasswordOpen(true)}
      >
        {intl.formatMessage(messages.profileChangePassword)}
      </Button>

      <ProfileDialog
        customer={data}
        open={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          refresh();
        }}
      />

      <PasswordDialog
        customer={data}
        open={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
      />

      {/* `CustomerResource` types `_links` down to just `self`, because that's
          the only link the two dialogs above read. The SDK's real response
          enriches every link on the resource the same way (FollowableResource,
          see `Response.json()`), so this cast widens the type to say so,
          rather than papering over a runtime mismatch. */}
      <SubscriptionsSection
        customer={
          data as unknown as ComponentProps<
            typeof SubscriptionsSection
          >["customer"]
        }
        settings={subscriptionsSettings}
        cartDisplayConfig={cartDisplayConfig}
      />

      {/* FX-276 orders, FX-277 payment methods and addresses mount here, in
          this order. */}
    </div>
  );
}
