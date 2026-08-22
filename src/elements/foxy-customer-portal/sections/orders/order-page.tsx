import styled from "styled-components";
import { FormattedNumber, useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { SummaryTable } from "@foxy.io/design-system/summary-table";
import type { FollowableLink } from "@/lib/customer-api";
import { messages } from "../../messages";
import { AccountPageLayout } from "../../account-page-layout";
import { useOrderById } from "./use-order-by-id";
import type { OrderResource } from "./row";

// Its own block, set apart with a divider and heavier weight, rather than a
// fourth line in the `<dl>` above: see the comment at its call site.
const GrandTotal = styled.dl`
  display: flex;
  justify-content: space-between;
  margin-top: ${(props) => props.theme.tokens.space.sm};
  padding-top: ${(props) => props.theme.tokens.space.sm};
  border-top: ${(props) => props.theme.tokens.border.default};
  font: ${(props) => props.theme.tokens.font.bodyEmphasis};

  dt,
  dd {
    margin: 0;
  }
`;

type CollectionPage = {
  total_items?: number;
  _embedded?: Record<string, unknown[]>;
};

type ContainerProps = {
  id: string;
  resource?: OrderResource;
  ordersLink: FollowableLink<CollectionPage> | null;
  onBack: () => void;
};

/**
 * Resolves `resource` when navigation didn't already carry it -- same
 * pattern as `subscriptions/subscription-page.tsx`'s
 * `SubscriptionPageContainer`.
 */
export function OrderPageContainer({
  id,
  resource,
  ordersLink,
  onBack,
}: ContainerProps) {
  const intl = useIntl();
  const fetched = useOrderById(resource ? null : ordersLink, id);
  const order = resource ?? fetched.order;

  if (!resource && (fetched.isLoading || fetched.isUnauthenticated)) {
    return (
      <AccountPageLayout onBack={onBack}>
        <Skeleton />
      </AccountPageLayout>
    );
  }

  if (!order) {
    return (
      <AccountPageLayout onBack={onBack}>
        <Alert.Root $variant="destructive">
          <Alert.Description>
            {intl.formatMessage(messages.errorUnknown)}
          </Alert.Description>
        </Alert.Root>
      </AccountPageLayout>
    );
  }

  return <OrderPage order={order} onBack={onBack} />;
}

type Props = { order: OrderResource; onBack: () => void };

export function OrderPage({ order, onBack }: Props) {
  const intl = useIntl();
  const items = order._embedded?.["fx:items"] ?? [];
  const receiptHref = order._links["fx:receipt"]?.href;

  return (
    <AccountPageLayout
      title={intl.formatMessage(messages.orderDetailHeading, {
        id: order.display_id,
      })}
      onBack={onBack}
    >
      <SummaryTable.Root>
        {items.map((item, index) => (
          <SummaryTable.Entry
            key={index}
            title={item.name}
            subtitle={intl.formatMessage(messages.orderItemQuantity, {
              quantity: item.quantity,
              price: intl.formatNumber(item.price, {
                style: "currency",
                currency: order.currency_code,
              }),
            })}
          />
        ))}
      </SummaryTable.Root>

      <dl>
        <dt>{intl.formatMessage(messages.orderItemsTotal)}</dt>
        <dd>
          <FormattedNumber
            value={Number(order.total_item_price)}
            style="currency"
            currency={order.currency_code}
          />
        </dd>

        <dt>{intl.formatMessage(messages.orderTax)}</dt>
        <dd>
          <FormattedNumber
            value={Number(order.total_tax)}
            style="currency"
            currency={order.currency_code}
          />
        </dd>

        <dt>{intl.formatMessage(messages.orderShipping)}</dt>
        <dd>
          <FormattedNumber
            value={Number(order.total_shipping)}
            style="currency"
            currency={order.currency_code}
          />
        </dd>
      </dl>

      {/* total_order, total_item_price, total_tax and total_shipping are
          each reported independently by the API and are not guaranteed to
          sum -- a coupon discount is the known reason a gap can appear, and
          this resource graph has no field to label it, so Total is its own
          authoritative figure here, not a fourth line implying a running
          sum of the three above. Do not "fix" this back into one flat list. */}
      <GrandTotal>
        <dt>{intl.formatMessage(messages.orderTotal)}</dt>
        <dd>
          <FormattedNumber
            value={order.total_order}
            style="currency"
            currency={order.currency_code}
          />
        </dd>
      </GrandTotal>

      <a href={receiptHref}>{intl.formatMessage(messages.orderReceipt)}</a>
    </AccountPageLayout>
  );
}
