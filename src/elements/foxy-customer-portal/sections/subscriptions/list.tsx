import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { ButtonGroup } from "@foxy.io/design-system/button-group";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import { messages } from "../../messages";
import { SubscriptionCard, type SubscriptionResource } from "./card";
import { ManageDialog, type PortalSettings } from "./manage-dialog";

type CustomerWithLinks = {
  _links: Record<string, FollowableLink<never> & { href: string }>;
};

type Props = {
  customer: CustomerWithLinks;
  settings?: PortalSettings | null;
};

export function SubscriptionsSection({ customer, settings }: Props) {
  const intl = useIntl();
  const [showActive, setShowActive] = useState(true);
  const [managed, setManaged] = useState<SubscriptionResource | null>(null);

  const link = customer._links["fx:subscriptions"];

  // Both states are separate server-side queries. Partitioning one result set
  // in the browser would make `total_items` describe the wrong collection.
  // The href never changes here — only `query` does — so the reset that
  // matters for this toggle is the one keyed on `href + serialiseQuery(query)`,
  // not the href-only reset.
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
          onManage={() => setManaged(subscription)}
          onPayments={() => {}}
        />
      ))}

      {/* Mounted only while a subscription is being managed, rather than kept
          mounted with a nullable subscription: `ManageDialog` seeds its
          frequency state from `subscription` once, on mount, so reusing one
          instance across different subscriptions would leak the previous
          subscription's frequency into the next. The `key` guards the same
          case if a card is ever managed while another dialog is still up. */}
      {managed ? (
        <ManageDialog
          key={managed._links.self.href}
          subscription={managed}
          settings={settings ?? null}
          open
          onClose={() => setManaged(null)}
        />
      ) : null}

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
