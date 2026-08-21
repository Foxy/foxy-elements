import styled from "styled-components";
import { FormattedNumber, useIntl } from "react-intl";
import { Badge } from "@foxy.io/design-system/badge";
import { toCalendarDate } from "../../calendar-date";
import { messages } from "../../messages";
import { getTransactionStatusMessage } from "../../transaction-status";

export type OrderResource = {
  id: number;
  display_id: string | number;
  transaction_date: string;
  total_order: number;
  // The SDK types these three as decimal STRINGS, unlike `total_order`
  // above -- see Task 2's "string-totals trap". This row does not render
  // them, but the type lives here so the row and the detail dialog share one
  // shape fetched by one query, rather than the dialog extending or
  // re-declaring a variant of this type.
  total_item_price: string;
  total_tax: string;
  total_shipping: string;
  currency_code: string;
  // Not narrowed to the SDK's status union: this value comes straight off
  // the wire, and `getTransactionStatusMessage` stays honest about that by
  // falling back to the raw string instead of assuming the union is
  // exhaustive -- matching `payments-dialog.tsx`'s existing convention.
  status: string;
  _links: {
    self: { href: string };
    "fx:receipt"?: { href: string };
  } & Record<string, { href: string } | undefined>;
  _embedded?: {
    "fx:items"?: { name: string; quantity: number; price: number }[];
  };
};

type Props = {
  order: OrderResource;
  onOpen: () => void;
};

const Row = styled.button`
  display: grid;
  grid-template-columns: 6rem 1fr auto auto;
  align-items: center;
  gap: ${(props) => props.theme.tokens.space.md};
  width: 100%;
  padding: ${(props) => props.theme.tokens.space.sm} 0;
  border: none;
  border-bottom: ${(props) => props.theme.tokens.border.default};
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;

  @media (max-width: 480px) {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
  }
`;

const Summary = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function OrderRow({ order, onOpen }: Props) {
  const intl = useIntl();
  const date = toCalendarDate(order.transaction_date);
  const statusMessage = getTransactionStatusMessage(order.status);
  const items = order._embedded?.["fx:items"] ?? [];
  const summary = items
    .map((item) => `${item.name} ×${item.quantity}`)
    .join(", ");

  return (
    <Row type="button" onClick={onOpen}>
      <span>{date ? intl.formatDate(date, { dateStyle: "medium" }) : ""}</span>

      <Summary>
        {intl.formatMessage(messages.orderSummary, {
          id: order.display_id,
          summary,
        })}
      </Summary>

      <Badge>
        {statusMessage ? intl.formatMessage(statusMessage) : order.status}
      </Badge>

      <FormattedNumber
        value={order.total_order}
        style="currency"
        currency={order.currency_code}
      />
    </Row>
  );
}
