import { FormattedNumber, useIntl } from "react-intl";
import type { MessageDescriptor } from "react-intl";
import { Badge } from "@foxy.io/design-system/badge";
import { Button } from "@foxy.io/design-system/button";
import { Item } from "@foxy.io/design-system/item";
import { toCalendarDate } from "../../calendar-date";
import { messages } from "../../messages";
import type { CartDisplayConfig } from "./cart-display-config";
import { getSubscriptionStatus, type SubscriptionStatus } from "./status";

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
const STATUS_MESSAGES: Record<SubscriptionStatus, MessageDescriptor> = {
  will_start: messages.statusWillStart,
  will_end: messages.statusWillEnd,
  will_end_after_payment: messages.statusWillEndAfterPayment,
  next_payment: messages.statusNextPayment,
  ended: messages.statusEnded,
  failed: messages.statusFailed,
  failed_and_ended: messages.statusFailedAndEnded,
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
  const status = getSubscriptionStatus(subscription);
  const nextPaymentDate = toCalendarDate(subscription.next_transaction_date);
  const showFrequency = cartDisplayConfig?.show_sub_frequency ?? true;
  const showNextDate = cartDisplayConfig?.show_sub_nextdate ?? true;

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

        {showNextDate && nextPaymentDate ? (
          <Item.Description>
            {intl.formatMessage(messages.subscriptionNextPayment, {
              // A plain formatted string, not a `<FormattedDate>` element:
              // interpolating a React element here made react-intl emit an
              // unkeyed array of chunks, which React then warned about.
              //
              // `nextPaymentDate` is a `Date` built from the store's calendar
              // day (see `toCalendarDate`), not the raw API string -- passing
              // the raw string here would let `formatDate` parse it as an
              // instant and re-render it in the viewer's timezone, shifting
              // the day for any viewer east of the store.
              date: intl.formatDate(nextPaymentDate, {
                dateStyle: "medium",
              }),
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
          <Badge>{intl.formatMessage(STATUS_MESSAGES[status])}</Badge>
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
