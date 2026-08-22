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
import type { AccountPage } from "../account-page";
import { AccountPageLayout } from "../account-page-layout";
import { AddressesSection, AddressPageContainer } from "../sections/addresses";
import { PortalHeader, type SignOutState } from "../sections/header";
import { OrderPageContainer, OrdersSection } from "../sections/orders";
import { PasswordPage } from "../sections/password-page";
import { ProfilePage, type CustomerResource } from "../sections/profile-page";
import {
  SubscriptionPageContainer,
  SubscriptionsSection,
  type CartDisplayConfig,
  type PortalSettings as SubscriptionsSettings,
} from "../sections/subscriptions";
import { messages } from "../messages";

/** How long the sign-out button stays in its error state. Matches v1. */
const SIGN_OUT_ERROR_MS = 1000;

/**
 * `CustomerResource` types `_links` down to just `self`, so indexing it by
 * any other rel (e.g. `fx:subscriptions`, `fx:transactions`) fails before the
 * `as unknown as ComponentProps<...>[...]` cast at each call site ever
 * applies -- that cast only widens the *result* type, not the property
 * access itself. This widens `_links` to an indexable shape first.
 */
type CustomerLinks = Record<
  string,
  { href: string } & Partial<FollowableLink<unknown>>
>;

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
  accountPage: AccountPage;
  onNavigate: (page: AccountPage) => void;
};

export function AccountScreen({
  fullNameTemplate,
  onSignedOut,
  settings,
  accountPage,
  onNavigate,
}: Props) {
  const intl = useIntl();
  const { api } = useApi();

  // The customer API's root graph *is* the customer, so `api.get()` returns it.
  // Wrapped as a link rather than cast: `API` has no `href`, and the cache keys
  // on `href`. Status checking lives in the hook — see `assertReadSucceeded`.
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

  const subscriptionsSettings: SubscriptionsSettings | null =
    settings?.subscriptions ? (settings as SubscriptionsSettings) : null;

  const cartDisplayConfig: CartDisplayConfig | null =
    settings?.cart_display_config ?? null;

  const goHome = useCallback(() => onNavigate({ type: "home" }), [onNavigate]);

  // Both the loading and error states below stay Back-aware for any non-home
  // page: a deep link (or a browser Back/Forward) that lands here while the
  // root customer resource is still loading, or fails to load, must not
  // strand the customer on a bare skeleton or an alert with no way out.
  if (isLoading || isUnauthenticated) {
    return accountPage.type === "home" ? (
      <Skeleton />
    ) : (
      <AccountPageLayout onBack={goHome}>
        <Skeleton />
      </AccountPageLayout>
    );
  }

  if (error || !data) {
    const body = (
      <Alert.Root $variant="destructive">
        <Alert.Description>
          {intl.formatMessage(messages.accountLoadFailed)}
        </Alert.Description>
        <Button type="button" onClick={refresh}>
          {intl.formatMessage(messages.retry)}
        </Button>
      </Alert.Root>
    );

    return accountPage.type === "home" ? (
      body
    ) : (
      <AccountPageLayout onBack={goHome}>{body}</AccountPageLayout>
    );
  }

  if (accountPage.type === "profile") {
    return <ProfilePage customer={data} onBack={goHome} />;
  }

  if (accountPage.type === "password") {
    return <PasswordPage customer={data} onBack={goHome} />;
  }

  if (accountPage.type === "subscription") {
    return (
      <SubscriptionPageContainer
        id={accountPage.id}
        resource={accountPage.resource}
        subscriptionsLink={
          (data._links as unknown as CustomerLinks)[
            "fx:subscriptions"
          ] as unknown as ComponentProps<
            typeof SubscriptionPageContainer
          >["subscriptionsLink"]
        }
        settings={subscriptionsSettings}
        cartDisplayConfig={cartDisplayConfig}
        onBack={goHome}
      />
    );
  }

  if (accountPage.type === "order") {
    return (
      <OrderPageContainer
        id={accountPage.id}
        resource={accountPage.resource}
        ordersLink={
          (data._links as unknown as CustomerLinks)[
            "fx:transactions"
          ] as unknown as ComponentProps<
            typeof OrderPageContainer
          >["ordersLink"]
        }
        onBack={goHome}
      />
    );
  }

  if (accountPage.type === "address") {
    return (
      <AddressPageContainer
        id={accountPage.id}
        resource={accountPage.resource}
        addressesLink={
          (data._links as unknown as CustomerLinks)[
            "fx:customer_addresses"
          ] as unknown as ComponentProps<
            typeof AddressPageContainer
          >["addressesLink"]
        }
        onBack={goHome}
      />
    );
  }

  return (
    <div>
      {accountPage.type === "home" ? (
        <>
          <PortalHeader
            customer={data}
            fullNameTemplate={fullNameTemplate}
            onEditProfile={() => onNavigate({ type: "profile" })}
            onSignOut={handleSignOut}
            signOutState={signOutState}
          />

          <Button
            type="button"
            $variant="link"
            onClick={() => onNavigate({ type: "password" })}
          >
            {intl.formatMessage(messages.profileChangePassword)}
          </Button>
        </>
      ) : null}

      {/* `CustomerResource` types `_links` down to just `self`, because that's
          the only link the two pages above read. The SDK's real response
          enriches every link on the resource the same way (FollowableResource,
          see `Response.json()`), so this cast widens the type to say so,
          rather than papering over a runtime mismatch. */}
      <SubscriptionsSection
        customer={
          data as unknown as ComponentProps<
            typeof SubscriptionsSection
          >["customer"]
        }
        cartDisplayConfig={cartDisplayConfig}
        onNavigate={onNavigate}
      />

      <OrdersSection
        customer={
          data as unknown as ComponentProps<typeof OrdersSection>["customer"]
        }
        onNavigate={onNavigate}
      />

      <AddressesSection
        customer={
          data as unknown as ComponentProps<typeof AddressesSection>["customer"]
        }
        onNavigate={onNavigate}
      />

      {/* FX-289 payment methods mount here, once built. */}
    </div>
  );
}
