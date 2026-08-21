import { FormattedNumber, useIntl } from "react-intl";
import { SummaryTable } from "@foxy.io/design-system/summary-table";
import { messages } from "../../messages";
import { PortalDialog } from "../../portal-dialog";
import type { OrderResource } from "./row";

type Props = {
  order: OrderResource;
  open: boolean;
  onClose: () => void;
};

export function OrderDetailDialog({ order, open, onClose }: Props) {
  const intl = useIntl();
  const items = order._embedded?.["fx:items"] ?? [];
  const receiptHref = order._links["fx:receipt"]?.href;

  return (
    <PortalDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={intl.formatMessage(messages.orderDetailHeading, {
        id: order.display_id,
      })}
    >
      <SummaryTable.Root>
        {items.map((item, index) => (
          <SummaryTable.Entry
            // Items carry no id on the wire; index is stable because this
            // list is never reordered or filtered client-side.
            key={index}
            title={item.name}
            // `item.price` is the SDK-documented *unit* price (before item
            // option modifiers), never a line total -- and this section's
            // `zoom=items` never fetches `fx:item_options`, so there is no
            // reliable line total to compute here. Folding quantity and
            // unit price into one subtitle, with no separate `value` column,
            // avoids presenting a number that reads as "what this line cost"
            // when it is actually "what one unit costs".
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

        <dt>{intl.formatMessage(messages.orderTotal)}</dt>
        <dd>
          <FormattedNumber
            value={order.total_order}
            style="currency"
            currency={order.currency_code}
          />
        </dd>
      </dl>

      {/* Withheld entirely, not merely disabled, when the link is absent --
          matching `payments-dialog.tsx` and `manage-dialog.tsx`'s existing
          convention for a resource that may not carry every optional link. */}
      <a href={receiptHref}>{intl.formatMessage(messages.orderReceipt)}</a>
    </PortalDialog>
  );
}
