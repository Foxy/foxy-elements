import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import { messages } from "../../messages";
import { OrderDetailDialog } from "./detail-dialog";
import { OrderRow, type OrderResource } from "./row";

type CustomerWithLinks = {
  _links: Record<string, FollowableLink<never> & { href: string }>;
};

type Props = {
  customer: CustomerWithLinks;
};

// Verified against a live store (see the spec, §2 and §5.2): a single
// `:in` filter is honoured, while two `:not` values on one property are
// silently ignored and return the full unfiltered set with a 200. This list
// excludes `subscription_renewal` (shown in the subscription's own Payments
// dialog) and `updateinfo` (a zero-dollar card-update record, not an order)
// by naming every type that IS an order, rather than the two that are not.
//
// Trade-off, stated rather than hidden: this silently omits any transaction
// type Foxy adds later. Of the three types listed, only `transaction` has
// been directly observed against a live store; the other two are inferred
// from the SDK's type union.
const ORDER_TYPES_FILTER =
  "type:in=transaction,subscription_modification,subscription_cancellation";

export function OrdersSection({ customer }: Props) {
  const intl = useIntl();
  const [opened, setOpened] = useState<OrderResource | null>(null);

  const link = customer._links["fx:transactions"];

  const query = useMemo(
    () => ({ filters: [ORDER_TYPES_FILTER], zoom: "items", limit: 10 }),
    [],
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
  } = useCollection<OrderResource>(link as never, query);

  // A section with nothing to show renders nothing -- no empty heading. This
  // differs from `SubscriptionsSection`, which keeps its heading and toggle
  // even when empty for a stated reason (an empty Active tab is not an empty
  // section); there is no such ambiguity here, so the general rule applies.
  if (!isLoading && !error && !isUnauthenticated && items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2>{intl.formatMessage(messages.ordersHeading)}</h2>

      {isLoading || isUnauthenticated ? <Skeleton /> : null}

      {error && !isUnauthenticated ? (
        <Alert.Root $variant="destructive">
          <Alert.Description>
            {intl.formatMessage(messages.errorUnknown)}
          </Alert.Description>
        </Alert.Root>
      ) : null}

      {items.map((order) => (
        <OrderRow
          key={order._links.self.href}
          order={order}
          onOpen={() => setOpened(order)}
        />
      ))}

      {opened ? (
        <OrderDetailDialog
          key={opened._links.self.href}
          order={opened}
          open
          onClose={() => setOpened(null)}
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
