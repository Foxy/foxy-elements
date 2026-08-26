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
  /**
   * Omit it when there is nowhere for a click to go. The row then renders
   * its cells without the button wrapper -- see `CellGroup`.
   */
  onOpen?: () => void;
  /** Defaults to the home page's six-column set. */
  columns?: string;
  /** The subscription page drops this cell -- see SUBSCRIPTION_ORDER_COLUMNS. */
  withSummary?: boolean;
};

/** Below this the table stops being a table and each row becomes a card. */
const MOBILE = "@media (max-width: 640px)";

/**
 * One track per column: Order, Date, Summary, Amount, Status, Receipt. The
 * header row and every data row share it so the columns line up, which is
 * the whole reason it is a shared constant rather than repeated per rule.
 */
export const ORDER_COLUMNS = "110px 110px 1fr 90px 100px 140px";

/**
 * The subscription page's own set: no Summary column, because every row in
 * that table is a payment for the same subscription and the summary would
 * repeat the page's title on every line.
 */
export const SUBSCRIPTION_ORDER_COLUMNS =
  "minmax(90px,1fr) 100px 76px 92px 70px";

const rowGrid = css<{ $columns?: string }>`
  display: grid;
  grid-template-columns: ${(props) => props.$columns ?? ORDER_COLUMNS};
  gap: 12px;
  align-items: center;
`;

export const OrderHeaderRow = styled.div<{ $columns?: string }>`
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

const Row = styled.div<{ $columns?: string }>`
  ${rowGrid};
  padding: 14px 0;
  border-bottom: ${(props) => props.theme.tokens.border.default};

  /* The click target is a descendant that cannot paint its own ring (see
     OpenButton), so the row draws it instead. A row with no onOpen has no
     button at all, so this simply never matches for one. */
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
 * The box holding every column except Receipt, which has to stay a real link
 * outside it -- an <a> inside a <button> is invalid and unclickable.
 *
 * `subgrid` is what keeps the cells aligned to the header: this is a real box
 * (not `display: contents`, which would drop it from the focus order when it
 * is a button) while its children still lay themselves out on the row's own
 * tracks rather than a nested grid of their own.
 *
 * Shared by both variants below so that whether a row is clickable changes
 * only its interactivity, never its layout.
 */
const rowCells = css<{ $span: number }>`
  grid-column: ${(props) => `1 / ${props.$span + 1}`};
  display: grid;
  grid-template-columns: subgrid;
  align-items: center;
  text-align: left;

  ${MOBILE} {
    grid-column: 1 / 3;
    row-gap: 2px;
  }
`;

const OpenButton = styled.button<{ $span: number }>`
  all: unset;
  ${rowCells};
  font: inherit;
  color: inherit;
  cursor: pointer;
`;

/**
 * The same box with none of the button: used when the caller passes no
 * `onOpen`. The subscription page's payment history has nowhere for a click
 * to go -- the customer is already looking at that subscription -- and a
 * button wired to a no-op is worse than no button: a keyboard user stops on
 * every row for nothing and a mouse user gets a pointer cursor over a dead
 * row. `<div>` needs no `all: unset` (its only UA style is `display: block`,
 * which `rowCells` overrides) and inherits font and colour on its own.
 */
const CellGroup = styled.div<{ $span: number }>`
  ${rowCells};
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

const StatusCell = styled.div<{ $withSummary: boolean }>`
  ${MOBILE} {
    grid-column: 1;
    /* Row 4 sits below Summary's row 3; drop straight to row 3 when there is
       no Summary cell, or the mobile subgrid keeps an empty fourth track. */
    grid-row: ${(props) => (props.$withSummary ? 4 : 3)};
    margin-top: 4px;
  }
`;

const ReceiptCell = styled.div`
  text-align: right;

  ${MOBILE} {
    grid-column: 2;
    grid-row: 2;
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

export function OrderRow({
  order,
  onOpen,
  columns,
  withSummary = true,
}: Props) {
  const intl = useIntl();
  const date = toCalendarDate(order.transaction_date);
  const statusMessage = getTransactionStatusMessage(order.status);
  const statusVariant = getTransactionStatusVariant(order.status);
  const items = order._embedded?.["fx:items"] ?? [];
  const summary = items
    .map((item) => `${item.name} ×${item.quantity}`)
    .join(", ");
  const receiptHref = order._links["fx:receipt"]?.href;

  const span = withSummary ? 5 : 4;

  const cells = (
    <>
      <IdCell>{order.display_id}</IdCell>

      <DateCell>
        {date ? intl.formatDate(date, { dateStyle: "medium" }) : ""}
      </DateCell>

      {withSummary ? (
        // Truncated to one line, so the full text has to stay reachable on
        // hover for the rows this clips.
        <SummaryCell title={summary}>{summary}</SummaryCell>
      ) : null}

      <AmountCell>
        <FormattedNumber
          value={order.total_order}
          style="currency"
          currency={order.currency_code}
        />
      </AmountCell>

      <StatusCell $withSummary={withSummary}>
        <Badge $variant={statusVariant}>
          {statusMessage ? intl.formatMessage(statusMessage) : order.status}
        </Badge>
      </StatusCell>
    </>
  );

  return (
    <Row $columns={columns}>
      {onOpen ? (
        <OpenButton type="button" onClick={onOpen} $span={span}>
          {cells}
        </OpenButton>
      ) : (
        <CellGroup $span={span}>{cells}</CellGroup>
      )}

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
