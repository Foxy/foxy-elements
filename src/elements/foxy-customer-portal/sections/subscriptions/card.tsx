import { ArrowRight } from "lucide-react";
import { useIntl } from "react-intl";
import styled from "styled-components";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Separator } from "@foxy.io/design-system/separator";
import type { AccountPage } from "../../account-page";
import { toCalendarDate } from "../../calendar-date";
import { useResource, type FollowableLink } from "@/lib/customer-api";
import { messages } from "../../messages";
import {
  groupLineItems,
  itemLabel,
  lineItemsTitle,
  type LineItem,
} from "../../line-items";
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
import { ThumbnailGrid } from "../../thumbnail-grid";
import { parseFrequency } from "./price-line";
import type { CartDisplayConfig } from "./cart-display-config";
import type { OrderResource } from "../orders/row";

export type SubscriptionResource = {
  frequency: string;
  start_date: string;
  next_transaction_date: string;
  end_date: string | null;
  is_active: boolean;
  error_message: string;
  first_failed_transaction_date: string | null;
  past_due_amount?: number;
  _links: { self: { href: string } } & Record<
    string,
    (FollowableLink<OrderResource> & { href: string }) | { href: string }
  >;
  _embedded?: {
    "fx:transaction_template"?: {
      currency_code?: string;
      total_order?: number;
      // Unlike `total_order`, the SDK types these as decimal STRINGS -- see
      // `sections/orders/row.tsx`'s own note on the same trap. Callers must
      // run them through `Number()` before arithmetic or `FormattedNumber`.
      total_shipping?: string;
      total_tax?: string;
      shipping_address1?: string;
      shipping_address2?: string;
      shipping_city?: string;
      shipping_state?: string;
      shipping_postal_code?: string;
      shipping_country?: string;
      _embedded?: { "fx:items"?: LineItem[] };
    };
  };
};

type Props = {
  subscription: SubscriptionResource;
  onManage: () => void;
  onNavigate: (page: AccountPage) => void;
  /**
   * The store's `cart_display_config`, from the same `customer_portal_settings`
   * response `subscription-page.tsx` already reads. `null`/`undefined` (settings
   * still loading, or a store on an older template config that omits the key)
   * means every flag defaults to `true` -- see each flag's read below.
   */
  cartDisplayConfig?: CartDisplayConfig | null;
};

// A plain inline link, not the DS link Button, whose button-sized padding
// pushed this cell past its grid track and wrapped "View" onto a second line.
const ViewLink = styled.button`
  all: unset;
  cursor: pointer;
  color: ${(props) => props.theme.tokens.color.primary};
  text-decoration: underline;

  &:focus-visible {
    outline: ${(props) => props.theme.tokens.outline.primary};
    outline-offset: 2px;
  }
`;

export function SubscriptionCard({
  subscription,
  onManage,
  onNavigate,
  cartDisplayConfig,
}: Props) {
  const intl = useIntl();
  const template = subscription._embedded?.["fx:transaction_template"];
  const items = template?._embedded?.["fx:items"] ?? [];
  const showFrequency = cartDisplayConfig?.show_sub_frequency ?? true;

  const { parents, children } = groupLineItems(items);
  const isBundle = parents.length === 1 && children.length > 0;
  const titleText = lineItemsTitle(items);

  const startDate = toCalendarDate(subscription.start_date);
  const nextDate = toCalendarDate(subscription.next_transaction_date);
  const endDate = toCalendarDate(subscription.end_date);

  // Only while it is still ahead: once a subscription has started, the date it
  // started on is history, and the cell would take a column away from
  // Next payment and the rest for the whole life of the subscription.
  const showStartDate =
    (cartDisplayConfig?.show_sub_startdate ?? true) &&
    startDate !== null &&
    startDate.getTime() > Date.now();
  const showNextDate =
    (cartDisplayConfig?.show_sub_nextdate ?? true) &&
    nextDate !== null &&
    subscription.is_active;
  const showEndDate =
    (cartDisplayConfig?.show_sub_enddate ?? true) && endDate !== null;
  // Also gated on `is_active`: a cancelled subscription isn't going to cancel
  // again in the future, so an inactive subscription with a future
  // `end_date` should still read "Ended", not "Cancels".
  const endIsFuture =
    endDate !== null && endDate.getTime() > Date.now() && subscription.is_active;

  // The SDK enriches `fx:last_transaction` with a working `.get()` the same
  // way it enriches every other link on a resource it returns -- including on
  // a subscription reached through a *collection* page's embedded items,
  // not only a top-level `useResource` result. Verified in the SDK rather
  // than assumed: `addFollowableLinks` (core/API/Response.ts) recurses into
  // `_embedded`, mapping every embedded item through itself, so nesting depth
  // does not matter. The order page's Billing & shipping panel relies on the
  // same guarantee for `fx:shipments`/`fx:payments`.
  const lastTransactionLink = subscription._links["fx:last_transaction"] as
    | (FollowableLink<OrderResource> & { href: string })
    | undefined;
  const { data: lastTransaction } = useResource<OrderResource>(
    lastTransactionLink ?? null,
  );
  const lastPaymentDate = lastTransaction
    ? toCalendarDate(lastTransaction.transaction_date)
    : null;

  // Price and billing period render as one value ("$24.00/mo"), so the amount
  // is formatted to a string here rather than by <FormattedNumber>, which
  // would return a node the period message cannot interpolate. An
  // unparseable frequency (or a store that hides the period) falls back to
  // the bare amount rather than guessing a suffix.
  const priceText =
    template?.total_order !== undefined
      ? intl.formatNumber(template.total_order, {
          style: "currency",
          currency: template.currency_code ?? "USD",
        })
      : null;
  const frequencyParts = showFrequency
    ? parseFrequency(subscription.frequency)
    : null;
  const priceLine =
    priceText === null
      ? null
      : frequencyParts
        ? intl.formatMessage(frequencyParts.message, {
            price: priceText,
            count: frequencyParts.count,
          })
        : priceText;

  const manageButtonVariant = subscription.is_active ? "default" : "outline";

  return (
    <Card>
      <ThumbnailGrid items={items} />

      <CardBody>
        <CardTitleRow>
          <CardTitle>{titleText}</CardTitle>
          {priceLine ? <CardPrice>{priceLine}</CardPrice> : null}
        </CardTitleRow>

        {subscription.error_message ? (
          <Alert.Root $variant="destructive">
            <Alert.Description>{subscription.error_message}</Alert.Description>
          </Alert.Root>
        ) : null}

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
          {lastPaymentDate ? (
            <div>
              <CardCellLabel>
                {intl.formatMessage(messages.subscriptionLastPayment)}
              </CardCellLabel>
              <CardCellValue>
                {intl.formatDate(lastPaymentDate, { dateStyle: "medium" })}{" "}
                <ViewLink
                  type="button"
                  onClick={() =>
                    onNavigate({
                      type: "order",
                      id: String(lastTransaction!.id),
                      resource: lastTransaction!,
                    })
                  }
                >
                  {intl.formatMessage(messages.subscriptionLastPaymentView)}
                </ViewLink>
              </CardCellValue>
            </div>
          ) : null}

          {showStartDate ? (
            <div>
              <CardCellLabel>
                {intl.formatMessage(messages.subscriptionStartDate)}
              </CardCellLabel>
              <CardCellValue>
                {intl.formatDate(startDate!, { dateStyle: "medium" })}
              </CardCellValue>
            </div>
          ) : null}

          {showNextDate ? (
            <div>
              <CardCellLabel>
                {intl.formatMessage(messages.subscriptionNextPayment)}
              </CardCellLabel>
              <CardCellValue>
                {intl.formatDate(nextDate!, { dateStyle: "medium" })}
              </CardCellValue>
            </div>
          ) : null}

          {showEndDate ? (
            <div>
              <CardCellLabel>
                {intl.formatMessage(
                  endIsFuture
                    ? messages.subscriptionCancels
                    : messages.subscriptionEnded,
                )}
              </CardCellLabel>
              <CardCellValue $error>
                {intl.formatDate(endDate!, { dateStyle: "medium" })}
              </CardCellValue>
            </div>
          ) : null}

          <div>
            <CardCellLabel>{intl.formatMessage(messages.subscriptionId)}</CardCellLabel>
            <CardCellValue>
              {subscription._links.self.href.replace(/\/+$/, "").split("/").pop()}
            </CardCellValue>
          </div>

          <CardActionSlot>
            <Button type="button" $variant={manageButtonVariant} onClick={onManage}>
              {intl.formatMessage(messages.subscriptionManage)} <ArrowRight size={16} />
            </Button>
          </CardActionSlot>
        </CardInfoGrid>
      </CardBody>
    </Card>
  );
}
