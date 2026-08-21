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
            subtitle={intl.formatMessage(messages.orderItemQuantity, {
              quantity: item.quantity,
            })}
            value={
              <FormattedNumber
                value={item.price}
                style="currency"
                currency={order.currency_code}
              />
            }
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
