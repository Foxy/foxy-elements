import { useMemo } from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";
import { Alert } from "@foxy.io/design-system/alert";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import type { AccountPage } from "../../account-page";
import { messages } from "../../messages";
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
const ORDER_TYPES_FILTER =
  "type:in=transaction,subscription_modification,subscription_cancellation";

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

export function OrdersSection({ customer, onNavigate }: Props) {
  const intl = useIntl();

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
    goToPage,
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
      <Heading>{intl.formatMessage(messages.paymentHistoryHeading)}</Heading>

      {isLoading || isUnauthenticated ? <Skeleton /> : null}

      {error && !isUnauthenticated ? (
        <Alert.Root $variant="destructive">
          <Alert.Description>
            {intl.formatMessage(messages.errorUnknown)}
          </Alert.Description>
        </Alert.Root>
      ) : null}

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
