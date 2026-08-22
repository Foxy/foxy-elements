import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { ButtonGroup } from "@foxy.io/design-system/button-group";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import type { AccountPage } from "../../account-page";
import { messages } from "../../messages";
import type { CartDisplayConfig } from "./cart-display-config";
import { SubscriptionCard, type SubscriptionResource } from "./card";

type CustomerWithLinks = {
  _links: Record<string, FollowableLink<never> & { href: string }>;
};

type Props = {
  customer: CustomerWithLinks;
  cartDisplayConfig?: CartDisplayConfig | null;
  onNavigate: (page: AccountPage) => void;
};

/** The customer-scoped subscription resource has no top-level `id`; the last
 * segment of its self link is the identifier the customer recognises --
 * matching `subscription-page.tsx`'s own derivation. */
function subscriptionId(subscription: SubscriptionResource): string {
  return (
    subscription._links.self.href.replace(/\/+$/, "").split("/").pop() ?? ""
  );
}

export function SubscriptionsSection({
  customer,
  cartDisplayConfig,
  onNavigate,
}: Props) {
  const intl = useIntl();
  const [showActive, setShowActive] = useState(true);

  const link = customer._links["fx:subscriptions"];

  // Both states are separate server-side queries. Partitioning one result set
  // in the browser would make `total_items` describe the wrong collection.
  const query = useMemo(
    () => ({
      filters: [`is_active=${showActive}`],
      zoom: "transaction_template:items",
      limit: 10,
    }),
    [showActive],
  );

  const {
    items,
    error,
    isLoading,
    isUnauthenticated,
    totalItems,
    offset,
    limit,
    loadNext,
    loadPrev,
  } = useCollection<SubscriptionResource>(link as never, query);

  function goToSubscription(subscription: SubscriptionResource) {
    onNavigate({
      type: "subscription",
      id: subscriptionId(subscription),
      resource: subscription,
    });
  }

  const toggle = (
    <ButtonGroup>
      <Button
        type="button"
        $variant={showActive ? "default" : "outline"}
        onClick={() => setShowActive(true)}
      >
        {intl.formatMessage(messages.subscriptionsActive)}
      </Button>
      <Button
        type="button"
        $variant={showActive ? "outline" : "default"}
        onClick={() => setShowActive(false)}
      >
        {intl.formatMessage(messages.subscriptionsInactive)}
      </Button>
    </ButtonGroup>
  );

  return (
    <section>
      <h2>{intl.formatMessage(messages.subscriptionsHeading)}</h2>
      {toggle}

      {isLoading || isUnauthenticated ? <Skeleton /> : null}

      {error && !isUnauthenticated ? (
        <Alert.Root $variant="destructive">
          <Alert.Description>
            {intl.formatMessage(messages.errorUnknown)}
          </Alert.Description>
        </Alert.Root>
      ) : null}

      {items.map((subscription) => (
        <SubscriptionCard
          key={subscription._links.self.href}
          subscription={subscription}
          cartDisplayConfig={cartDisplayConfig}
          onManage={() => goToSubscription(subscription)}
          onPayments={() => goToSubscription(subscription)}
        />
      ))}

      {totalItems > limit ? (
        <div>
          <Button type="button" onClick={loadPrev} disabled={offset === 0}>
            {"<"}
          </Button>
          <span>
            {offset + 1}&ndash;{Math.min(offset + limit, totalItems)} /{" "}
            {totalItems}
          </span>
          <Button
            type="button"
            onClick={loadNext}
            disabled={offset + limit >= totalItems}
          >
            {">"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
