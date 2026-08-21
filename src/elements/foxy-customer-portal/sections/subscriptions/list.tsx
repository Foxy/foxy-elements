import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { ButtonGroup } from "@foxy.io/design-system/button-group";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import { messages } from "../../messages";
import { SubscriptionCard, type SubscriptionResource } from "./card";

type CustomerWithLinks = {
  _links: Record<string, FollowableLink<never> & { href: string }>;
};

type Props = { customer: CustomerWithLinks };

export function SubscriptionsSection({ customer }: Props) {
  const intl = useIntl();
  const [showActive, setShowActive] = useState(true);

  const link = customer._links["fx:subscriptions"];

  // Both states are separate server-side queries. Partitioning one result set
  // in the browser would make `total_items` describe the wrong collection.
  // Changing `filters` changes the cache key, and `useCollection` resets its
  // offset when the href changes — that reset exists for this toggle.
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
    totalItems,
    offset,
    limit,
    loadNext,
    loadPrev,
  } = useCollection<SubscriptionResource>(link as never, query);

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

      {isLoading ? <Skeleton /> : null}

      {error ? (
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
          onManage={() => {}}
          onPayments={() => {}}
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
