import { useMemo } from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";
import { Alert } from "@foxy.io/design-system/alert";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import type { AccountPage } from "../../account-page";
import { messages } from "../../messages";
import type { PortalVariant } from "../../types";
import { OrderCard } from "./card";
import { Pagination } from "../pagination";
import {
  OrderHeaderCell,
  OrderHeaderRow,
  OrderRow,
  type OrderResource,
} from "./row";

type CustomerWithLinks = {
  _links: Record<string, FollowableLink<never> & { href: string }>;
};

type Props = {
  customer: CustomerWithLinks;
  onNavigate: (page: AccountPage) => void;
  /** Defaults to `"subscriptions"` -- the dense-row presentation. */
  variant?: PortalVariant;
};

// Verified against a live store (see the spec, §2 and §5.2): a single
// `:in` filter is honoured, while two `:not` values on one property are
// silently ignored and return the full unfiltered set with a 200. This list
// excludes `subscription_renewal` (shown in the subscription page's own
// payment history) and `updateinfo` (a zero-dollar card-update record, not
// an order) by naming every type that IS an order, rather than the two that
// are not.
//
// Trade-off, stated rather than hidden: this silently omits any transaction
// type Foxy adds later. Of the three types listed, only `transaction` has
// been directly observed against a live store; the other two are inferred
// from the SDK's type union.
const ORDER_TYPES = [
  "transaction",
  "subscription_modification",
  "subscription_cancellation",
];

/**
 * `variant="orders"` adds `subscription_renewal`. That type is excluded above
 * because the subscription page's own payment history lists it -- but that
 * page is unreachable from a home page with no subscriptions section, so
 * without this a renewal charge would appear nowhere in the portal at all.
 *
 * `updateinfo` stays excluded in both variants: it is a zero-dollar
 * card-update record, not a payment.
 */
const ORDERS_VARIANT_TYPES = [...ORDER_TYPES, "subscription_renewal"];

function typesFilter(variant: PortalVariant): string {
  const types = variant === "orders" ? ORDERS_VARIANT_TYPES : ORDER_TYPES;
  return `type:in=${types.join(",")}`;
}

const Heading = styled.h2`
  margin: 0 0 20px;
  font: ${(props) => props.theme.tokens.font.h2};
  color: ${(props) => props.theme.tokens.color.body};
`;

// The table keeps its column widths rather than crushing them, and scrolls
// sideways instead, on any viewport too narrow to hold them -- but only down
// to the point where the rows restack into cards (see row.tsx's MOBILE),
// below which there are no columns left to preserve.
const TableScroll = styled.div`
  overflow-x: auto;
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 640px;

  @media (max-width: 640px) {
    min-width: 0;
  }
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// Matches `sections/addresses/list.tsx`'s own empty line, so the two sections
// say "nothing here" the same way.
const Empty = styled.p`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

export function OrdersSection({
  customer,
  onNavigate,
  variant = "subscriptions",
}: Props) {
  const intl = useIntl();

  const link = customer._links["fx:transactions"];

  // The zoom is two levels deep, and the second level is load-bearing: this
  // is the request that supplies `order-page.tsx` when the customer opens an
  // order, and that page's item cards read
  // `item._embedded["fx:item_options"]` (see `item-details.ts`). Dropping
  // `:item_options` costs no test and no error -- the option rows just
  // silently stop existing against the real API -- so `list.test.tsx` pins
  // this exact string.
  const query = useMemo(
    () => ({
      filters: [typesFilter(variant)],
      zoom: "items:item_options",
      limit: 10,
    }),
    [variant],
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
    goToPage,
  } = useCollection<OrderResource>(link as never, query);

  const isEmpty =
    !isLoading && !error && !isUnauthenticated && items.length === 0;

  // A section with nothing to show renders nothing -- no empty heading. This
  // differs from `SubscriptionsSection`, which keeps its heading and toggle
  // even when empty for a stated reason (an empty Active tab is not an empty
  // section); there is no such ambiguity here, so the general rule applies.
  //
  // Except under `variant="orders"`, where this section is the whole home
  // page below the header: returning nothing there leaves a customer with no
  // payments looking at a blank page rather than at an answer.
  if (isEmpty && variant !== "orders") {
    return null;
  }

  return (
    <section>
      <Heading>
        {intl.formatMessage(
          variant === "orders"
            ? messages.ordersHeading
            : messages.paymentHistoryHeading,
        )}
      </Heading>

      {isLoading || isUnauthenticated ? <Skeleton /> : null}

      {error && !isUnauthenticated ? (
        <Alert.Root $variant="destructive">
          <Alert.Description>
            {intl.formatMessage(messages.errorUnknown)}
          </Alert.Description>
        </Alert.Root>
      ) : null}

      {/* Shared with the subscription page's own payment history, which says
          the same thing about one subscription's payments rather than about
          every payment the customer has made. Reword it for one and it
          rewords for both. */}
      {isEmpty ? (
        <Empty>{intl.formatMessage(messages.paymentsEmpty)}</Empty>
      ) : variant === "orders" ? (
        <CardList>
          {items.map((order) => (
            <OrderCard
              key={order._links.self.href}
              order={order}
              onOpen={() =>
                onNavigate({
                  type: "order",
                  id: String(order.id),
                  resource: order,
                })
              }
            />
          ))}
        </CardList>
      ) : (
        <TableScroll>
          <Table>
            <OrderHeaderRow>
              <OrderHeaderCell>
                {intl.formatMessage(messages.ordersColumnOrder)}
              </OrderHeaderCell>
              <OrderHeaderCell>
                {intl.formatMessage(messages.ordersColumnDate)}
              </OrderHeaderCell>
              <OrderHeaderCell>
                {intl.formatMessage(messages.ordersColumnSummary)}
              </OrderHeaderCell>
              <OrderHeaderCell>
                {intl.formatMessage(messages.ordersColumnAmount)}
              </OrderHeaderCell>
              <OrderHeaderCell>
                {intl.formatMessage(messages.ordersColumnStatus)}
              </OrderHeaderCell>
              <div />
            </OrderHeaderRow>

            {items.map((order) => (
              <OrderRow
                key={order._links.self.href}
                order={order}
                onOpen={() =>
                  onNavigate({
                    type: "order",
                    id: String(order.id),
                    resource: order,
                  })
                }
              />
            ))}
          </Table>
        </TableScroll>
      )}

      {totalItems > limit ? (
        <Pagination
          offset={offset}
          limit={limit}
          totalItems={totalItems}
          onGoToPage={goToPage}
          onPrev={loadPrev}
          onNext={loadNext}
        />
      ) : null}
    </section>
  );
}
