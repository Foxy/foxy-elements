import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";
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
import {
  BillingShippingSection,
  AddressPageContainer,
} from "../sections/addresses";
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
import type { PortalVariant } from "../types";

/** How long the sign-out button stays in its error state. Matches v1. */
const SIGN_OUT_ERROR_MS = 1000;

// The page the whole account overview sits on. Every section's own heading
// zeroes its top margin, so the gap here is the only thing separating
// sections -- the UA default heading margins that used to provide it are
// gone.
//
// The measurements are the design's, not the token scale's: a 48px/96px
// vertical frame and a gap that grows with the viewport. Those are layout
// decisions specific to this page rather than reusable steps, so they stay
// literals; only the colors and fonts come from tokens.
//
// No width of its own, matching `AccountPageLayout`'s container: the portal
// is an embeddable element, so page width belongs to the host embedding it.
const HomeContent = styled.div`
  /* A shadow root gets no page-level reset, so a host that does set a width
     on the element would otherwise get that width *plus* this padding. */
  box-sizing: border-box;
  padding: 48px clamp(16px, 5vw, 32px) 96px;
  display: flex;
  flex-direction: column;
  gap: clamp(32px, 6vw, 56px);
  background: ${(props) => props.theme.tokens.background.page};
  color: ${(props) => props.theme.tokens.color.body};
`;

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
  onSignedOut: () => void;
  /** `null` while the settings request is still in flight. */
  settings: PortalSettings | null;
  accountPage: AccountPage;
  /** Which selling shape the home page is laid out for -- see `PortalVariant`. */
  variant: PortalVariant;
  onNavigate: (page: AccountPage, options?: { restoreScroll?: boolean }) => void;
};

export function AccountScreen({
  onSignedOut,
  settings,
  accountPage,
  variant,
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

  // The in-portal Back control. Asks for the previous scroll position back:
  // a customer who opened an address from the bottom of a long list should
  // return to that address, not to the top of the list.
  //
  // Only Back passes this. A forward link to home (there are several) still
  // opens at the top, which is why the flag is explicit rather than inferred
  // from the target page.
  const goHome = useCallback(
    () => onNavigate({ type: "home" }, { restoreScroll: true }),
    [onNavigate],
  );

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
        paymentMethodLink={
          (data._links as unknown as CustomerLinks)[
            "fx:default_payment_method"
          ] as unknown as ComponentProps<
            typeof SubscriptionPageContainer
          >["paymentMethodLink"]
        }
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
        cartDisplayConfig={cartDisplayConfig}
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
        // The store's own country and region lists. Absent on an API that
        // predates them, which the form handles by degrading to free text
        // rather than blocking the edit.
        countriesLink={
          (data._links as unknown as Record<string, unknown>)[
            "fx:countries"
          ] as ComponentProps<typeof AddressPageContainer>["countriesLink"]
        }
        regionsLink={
          (data._links as unknown as Record<string, unknown>)[
            "fx:regions"
          ] as ComponentProps<typeof AddressPageContainer>["regionsLink"]
        }
        onBack={goHome}
      />
    );
  }

  // Every other `accountPage.type` returned above, so this only ever renders
  // for `"home"` -- narrowed by TypeScript too, which is why the content
  // below is unconditional rather than guarded by another `accountPage.type`
  // check.
  return (
    <HomeContent>
      <PortalHeader
        customer={data}
        onEditProfile={() => onNavigate({ type: "profile" })}
        onChangePassword={() => onNavigate({ type: "password" })}
        onSignOut={handleSignOut}
        signOutState={signOutState}
      />

      {/* `CustomerResource` types `_links` down to just `self`. The SDK's
          real response enriches every link on the resource the same way
          (FollowableResource, see `Response.json()`), so the casts below
          (and the ones in three of the five early returns above -- the
          per-item pages, each reading a different rel) widen the type to say
          so, rather than papering over a runtime mismatch. */}
      {/* Dropped entirely under `variant="orders"`: a store that mostly
          sells products has nothing to lead with here, and the section keeps
          its heading and Active/Inactive toggle even when empty (see
          `SubscriptionsSection`), so leaving it in would show an empty frame
          on every such store's home page.

          The `subscription` page above is deliberately NOT gated with it --
          there is no entry point from here, but a bookmarked or emailed
          subscription URL keeps resolving. */}
      {variant === "subscriptions" ? (
        <SubscriptionsSection
          customer={
            data as unknown as ComponentProps<
              typeof SubscriptionsSection
            >["customer"]
          }
          cartDisplayConfig={cartDisplayConfig}
          onNavigate={onNavigate}
        />
      ) : null}

      <OrdersSection
        customer={
          data as unknown as ComponentProps<typeof OrdersSection>["customer"]
        }
        variant={variant}
        onNavigate={onNavigate}
      />

      <BillingShippingSection
        customer={
          data as unknown as ComponentProps<
            typeof BillingShippingSection
          >["customer"]
        }
        onNavigate={onNavigate}
      />
    </HomeContent>
  );
}
