import styled, { css } from "styled-components";
import { FormattedNumber, useIntl } from "react-intl";
import { ExternalLink } from "lucide-react";
import { Badge } from "@foxy.io/design-system/badge";
import { toCalendarDate } from "../../calendar-date";
import { messages } from "../../messages";
import {
  getTransactionStatusMessage,
  getTransactionStatusVariant,
} from "../../transaction-status";

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
  // exhaustive -- matching `subscription-page.tsx`'s existing convention.
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

/** Below this the table stops being a table and each row becomes a card. */
const MOBILE = "@media (max-width: 640px)";

/**
 * One track per column: Order, Date, Summary, Amount, Status, Receipt. The
 * header row and every data row share it so the columns line up, which is
 * the whole reason it is a shared constant rather than repeated per rule.
 */
export const ORDER_COLUMNS = "110px 110px 1fr 90px 100px 140px";

const rowGrid = css`
  display: grid;
  grid-template-columns: ${ORDER_COLUMNS};
  gap: 12px;
  align-items: center;
`;

export const OrderHeaderRow = styled.div`
  ${rowGrid};
  padding: 0 0 10px;
  border-bottom: ${(props) => props.theme.tokens.border.default};

  ${MOBILE} {
    display: none;
  }
`;

export const OrderHeaderCell = styled.div`
  font: ${(props) => props.theme.tokens.font.bodySmall};
  color: ${(props) => props.theme.tokens.color.faint};
`;

const Row = styled.div`
  ${rowGrid};
  padding: 14px 0;
  border-bottom: ${(props) => props.theme.tokens.border.default};

  /* The click target is a descendant that cannot paint its own ring (see
     OpenButton), so the row draws it instead. */
  &:has(button:focus-visible) {
    outline: ${(props) => props.theme.tokens.outline.primary};
    outline-offset: 2px;
    border-radius: ${(props) => props.theme.tokens.borderRadius.xs};
  }

  ${MOBILE} {
    grid-template-columns: 1fr auto;
    row-gap: 4px;
    padding: 12px 0;
  }
`;

/**
 * Spans every column except Receipt, which has to stay a real link outside
 * it -- an <a> inside a <button> is invalid and unclickable.
 *
 * `subgrid` is what keeps the cells aligned to the header: the button is a
 * real box (so it is focusable, unlike `display: contents`, which drops an
 * element from the focus order entirely) while its children still lay
 * themselves out on the row's own tracks rather than a nested grid of their
 * own.
 */
const OpenButton = styled.button`
  all: unset;
  grid-column: 1 / 6;
  display: grid;
  grid-template-columns: subgrid;
  align-items: center;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;

  ${MOBILE} {
    grid-column: 1 / 3;
    row-gap: 2px;
  }
`;

const IdCell = styled.div`
  font: ${(props) => props.theme.tokens.font.bodyEmphasis};
  color: ${(props) => props.theme.tokens.color.body};
  white-space: nowrap;

  ${MOBILE} {
    grid-column: 1;
    grid-row: 1;
  }
`;

const DateCell = styled.div`
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
  white-space: nowrap;

  ${MOBILE} {
    grid-column: 1 / 3;
    grid-row: 2;
  }
`;

const SummaryCell = styled.div`
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${MOBILE} {
    grid-column: 1 / 3;
    grid-row: 3;
    white-space: normal;
  }
`;

const AmountCell = styled.div`
  font: ${(props) => props.theme.tokens.font.bodyEmphasis};
  color: ${(props) => props.theme.tokens.color.body};
  white-space: nowrap;

  ${MOBILE} {
    grid-column: 2;
    grid-row: 1;
    text-align: right;
  }
`;

const StatusCell = styled.div`
  ${MOBILE} {
    grid-column: 1;
    grid-row: 4;
    margin-top: 4px;
  }
`;

const ReceiptCell = styled.div`
  text-align: right;

  ${MOBILE} {
    grid-column: 2;
    grid-row: 2;
    align-self: end;
  }
`;

const ReceiptLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.tokens.space["2xs"]};
  font: ${(props) => props.theme.tokens.font.body};
  font-weight: 500;
  color: ${(props) => props.theme.tokens.color.primary};
  text-decoration: underline;
`;

export function OrderRow({ order, onOpen }: Props) {
  const intl = useIntl();
  const date = toCalendarDate(order.transaction_date);
  const statusMessage = getTransactionStatusMessage(order.status);
  const statusVariant = getTransactionStatusVariant(order.status);
  const items = order._embedded?.["fx:items"] ?? [];
  const summary = items
    .map((item) => `${item.name} ×${item.quantity}`)
    .join(", ");
  const receiptHref = order._links["fx:receipt"]?.href;

  return (
    <Row>
      <OpenButton type="button" onClick={onOpen}>
        <IdCell>{order.display_id}</IdCell>

        <DateCell>
          {date ? intl.formatDate(date, { dateStyle: "medium" }) : ""}
        </DateCell>

        {/* Truncated to one line, so the full text has to stay reachable on
            hover for the rows this clips. */}
        <SummaryCell title={summary}>{summary}</SummaryCell>

        <AmountCell>
          <FormattedNumber
            value={order.total_order}
            style="currency"
            currency={order.currency_code}
          />
        </AmountCell>

        <StatusCell>
          <Badge $variant={statusVariant}>
            {statusMessage ? intl.formatMessage(statusMessage) : order.status}
          </Badge>
        </StatusCell>
      </OpenButton>

      <ReceiptCell>
        {receiptHref ? (
          <ReceiptLink href={receiptHref} target="_blank" rel="noreferrer">
            {intl.formatMessage(messages.paymentsReceipt)}{" "}
            <ExternalLink size={14} />
          </ReceiptLink>
        ) : null}
      </ReceiptCell>
    </Row>
  );
}
