import { FormattedNumber, useIntl } from "react-intl";
import type { MessageDescriptor } from "react-intl";
import { Badge } from "@foxy.io/design-system/badge";
import { Button } from "@foxy.io/design-system/button";
import { Item } from "@foxy.io/design-system/item";
import { toCalendarDate } from "../../calendar-date";
import { messages } from "../../messages";
import type { CartDisplayConfig } from "./cart-display-config";
import {
  getExtendedSubscriptionStatus,
  type ExtendedSubscriptionStatus,
} from "./status";

type TemplateItem = { name: string; quantity: number };

export type SubscriptionResource = {
  frequency: string;
  start_date: string;
  next_transaction_date: string;
  end_date: string | null;
  is_active: boolean;
  error_message: string;
  first_failed_transaction_date: string | null;
  _links: { self: { href: string } } & Record<string, { href: string }>;
  _embedded?: {
    "fx:transaction_template"?: {
      currency_code?: string;
      total_order?: number;
      _embedded?: { "fx:items"?: TemplateItem[] };
    };
  };
};

// `messages.statusWillStart` etc. are referenced here, not by name lookup, so
// this map itself is the "user" the messages catalog test requires for each.
// `Record<ExtendedSubscriptionStatus, ...>` makes a missing entry a
// compile-time error rather than a runtime crash on an unvalidated status.
const STATUS_MESSAGES: Record<ExtendedSubscriptionStatus, MessageDescriptor> =
  {
    will_start: messages.statusWillStart,
    will_start_no_startdate: messages.statusWillStartNoStartdate,
    will_end: messages.statusWillEnd,
    will_end_no_enddate: messages.statusWillEndNoEnddate,
    will_end_after_payment: messages.statusWillEndAfterPayment,
    will_end_after_payment_no_nextdate:
      messages.statusWillEndAfterPaymentNoNextdate,
    will_end_after_payment_no_enddate:
      messages.statusWillEndAfterPaymentNoEnddate,
    next_payment: messages.statusNextPayment,
    next_payment_no_nextdate: messages.statusNextPaymentNoNextdate,
    ended: messages.statusEnded,
    ended_no_enddate: messages.statusEndedNoEnddate,
    failed: messages.statusFailed,
    failed_and_ended: messages.statusFailedAndEnded,
    failed_and_ended_no_enddate: messages.statusFailedAndEndedNoEnddate,
    inactive: messages.statusInactive,
  };

type Props = {
  subscription: SubscriptionResource;
  onManage: () => void;
  onPayments: () => void;
  /**
   * The store's `cart_display_config`, from the same `customer_portal_settings`
   * response `manage-dialog.tsx` already reads. `null`/`undefined` (settings
   * still loading, or a store on an older template config that omits the key)
   * means every flag defaults to `true` -- see each flag's read below.
   */
  cartDisplayConfig?: CartDisplayConfig | null;
};

export function SubscriptionCard({
  subscription,
  onManage,
  onPayments,
  cartDisplayConfig,
}: Props) {
  const intl = useIntl();
  const template = subscription._embedded?.["fx:transaction_template"];
  const items = template?._embedded?.["fx:items"] ?? [];
  const status = getExtendedSubscriptionStatus(
    subscription,
    cartDisplayConfig,
  );
  const nextPaymentDate = toCalendarDate(subscription.next_transaction_date);
  const showFrequency = cartDisplayConfig?.show_sub_frequency ?? true;

  // Every date `STATUS_MESSAGES` might reference, pre-formatted through
  // `toCalendarDate` -- never the raw API string -- so the badge renders the
  // store's calendar day, not the viewer's UTC-shifted one (see
  // `calendar-date.ts`). Passing a superset of what any one status message
  // actually references is safe: react-intl only substitutes the
  // placeholders a message's own ICU pattern names, and silently ignores the
  // rest. A date that fails to parse formats to `""` rather than throwing --
  // `getExtendedSubscriptionStatus` already steers `status` away from any
  // variant that would reference an unformattable date, except
  // `first_failed_transaction_date`, which has no such fallback (see that
  // function's doc comment).
  const formatStatusDate = (raw: string | null) => {
    const date = toCalendarDate(raw);
    return date ? intl.formatDate(date, { dateStyle: "medium" }) : "";
  };

  const statusDates = {
    start_date: formatStatusDate(subscription.start_date),
    next_transaction_date: nextPaymentDate
      ? intl.formatDate(nextPaymentDate, { dateStyle: "medium" })
      : "",
    end_date: formatStatusDate(subscription.end_date),
    first_failed_transaction_date: formatStatusDate(
      subscription.first_failed_transaction_date,
    ),
  };

  const summary = items
    .map((item) => `${item.name} ×${item.quantity}`)
    .join(", ");

  return (
    <Item.Root $variant="outline">
      <Item.Content>
        <Item.Title>{summary}</Item.Title>

        {showFrequency ? (
          <Item.Description>
            {intl.formatMessage(messages.subscriptionFrequency, {
              frequency: subscription.frequency,
            })}
          </Item.Description>
        ) : null}

        {/* Data about the subscription, not a UI error — see the spec's error
            model, which reserves Alert for failures of the portal itself. */}
        {subscription.error_message ? (
          <Item.Description>{subscription.error_message}</Item.Description>
        ) : null}
      </Item.Content>

      <Item.Actions>
        {template?.total_order !== undefined ? (
          <FormattedNumber
            value={template.total_order}
            style="currency"
            currency={template.currency_code ?? "USD"}
          />
        ) : null}

        {status ? (
          <Badge>
            {intl.formatMessage(STATUS_MESSAGES[status], statusDates)}
          </Badge>
        ) : null}

        <Button type="button" onClick={onManage}>
          {intl.formatMessage(messages.subscriptionManage)}
        </Button>

        <Button type="button" $variant="outline" onClick={onPayments}>
          {intl.formatMessage(messages.subscriptionPayments)}
        </Button>
      </Item.Actions>
    </Item.Root>
  );
}
