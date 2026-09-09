import { ArrowRight, ExternalLink } from "lucide-react";
import { useIntl } from "react-intl";
import styled from "styled-components";
import { Badge } from "@foxy.io/design-system/badge";
import { Button } from "@foxy.io/design-system/button";
import { Separator } from "@foxy.io/design-system/separator";
import { toCalendarDate } from "../../calendar-date";
import {
  Card,
  CardActionSlot,
  CardBody,
  CardCellLabel,
  CardCellValue,
  CardChildLine,
  CardChildList,
  CardInfoGrid,
  CardPrice,
  CardTitle,
  CardTitleRow,
} from "../../card-layout";
import { groupLineItems, itemLabel, lineItemsTitle } from "../../line-items";
import { messages } from "../../messages";
import { ThumbnailGrid } from "../../thumbnail-grid";
import {
  getTransactionStatusMessage,
  getTransactionStatusVariant,
} from "../../transaction-status";
import type { OrderResource } from "./row";

type Props = {
  order: OrderResource;
  /** Opens the order's own page. */
  onOpen: () => void;
};

// Paired with the View order button in the action slot rather than given a
// caption cell of its own: a cell would need a "Receipt" label above a
// "Receipt" link. A secondary text link beside a primary button says the same
// thing once.
const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: ${(props) => props.theme.tokens.space.md};
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

/**
 * One past payment, presented the way `SubscriptionCard` presents a
 * subscription: the items' own images and names first, the amount beside
 * them, and the record-keeping details as captions underneath.
 *
 * This is the `variant="orders"` presentation of the payment history.
 * `OrderRow` is the other one -- see `list.tsx`, which picks between them.
 */
export function OrderCard({ order, onOpen }: Props) {
  const intl = useIntl();
  const items = order._embedded?.["fx:items"] ?? [];

  const { parents, children } = groupLineItems(items);
  const isBundle = parents.length === 1 && children.length > 0;

  // A transaction can arrive with nothing embedded -- a response on an older
  // zoom, or a record with no items. Its number is then the only thing that
  // identifies it, so the title falls back to that rather than to empty.
  const itemsTitle = lineItemsTitle(items);
  const title =
    itemsTitle ||
    intl.formatMessage(messages.orderDetailHeading, { id: order.display_id });

  const date = toCalendarDate(order.transaction_date);
  const statusMessage = getTransactionStatusMessage(order.status);
  const statusVariant = getTransactionStatusVariant(order.status);
  const receiptHref = order._links["fx:receipt"]?.href;

  return (
    <Card>
      <ThumbnailGrid items={items} />

      <CardBody>
        <CardTitleRow>
          <CardTitle>{title}</CardTitle>
          <CardPrice>
            {intl.formatNumber(order.total_order, {
              style: "currency",
              currency: order.currency_code,
            })}
          </CardPrice>
        </CardTitleRow>

        {isBundle ? (
          <CardChildList>
            {children.map((child, index) => (
              <CardChildLine key={`${child.name}-${index}`}>
                {itemLabel(child)}
              </CardChildLine>
            ))}
          </CardChildList>
        ) : null}

        <Separator />

        <CardInfoGrid>
          <div>
            <CardCellLabel>
              {intl.formatMessage(messages.ordersColumnOrder)}
            </CardCellLabel>
            <CardCellValue>{order.display_id}</CardCellValue>
          </div>

          {date ? (
            <div>
              <CardCellLabel>
                {intl.formatMessage(messages.ordersColumnDate)}
              </CardCellLabel>
              <CardCellValue>
                {intl.formatDate(date, { dateStyle: "medium" })}
              </CardCellValue>
            </div>
          ) : null}

          <div>
            <CardCellLabel>
              {intl.formatMessage(messages.ordersColumnStatus)}
            </CardCellLabel>
            {/* Not wrapped in CardCellValue: the Badge carries its own font
                and colour, which that caption font would fight. */}
            <Badge $variant={statusVariant}>
              {statusMessage ? intl.formatMessage(statusMessage) : order.status}
            </Badge>
          </div>

          <CardActionSlot>
            <Actions>
              {receiptHref ? (
                <ReceiptLink
                  href={receiptHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {intl.formatMessage(messages.paymentsReceipt)}{" "}
                  <ExternalLink size={14} />
                </ReceiptLink>
              ) : null}

              <Button type="button" $variant="outline" onClick={onOpen}>
                {intl.formatMessage(messages.ordersView)}{" "}
                <ArrowRight size={16} />
              </Button>
            </Actions>
          </CardActionSlot>
        </CardInfoGrid>
      </CardBody>
    </Card>
  );
}
