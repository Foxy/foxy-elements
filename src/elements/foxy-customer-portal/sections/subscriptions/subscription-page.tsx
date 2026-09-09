import { useId, useMemo, useState, type ReactNode } from "react";
import { FormattedDate, FormattedNumber, useIntl } from "react-intl";
import styled from "styled-components";
import { CalendarDays, ChevronDown, ExternalLink } from "lucide-react";
import { Alert } from "@foxy.io/design-system/alert";
import { Badge } from "@foxy.io/design-system/badge";
import { Calendar } from "@foxy.io/design-system/calendar";
import { Field } from "@foxy.io/design-system/field";
import { Popover } from "@foxy.io/design-system/popover";
import { Select } from "@foxy.io/design-system/select";
import { Separator } from "@foxy.io/design-system/separator";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import {
  getAllowedFrequencies,
  getNextTransactionDateConstraints,
} from "@foxy.io/sdk/customer";
import {
  useApi,
  useCollection,
  useResource,
  WriteError,
  type FollowableLink,
} from "@/lib/customer-api";
import { toCalendarDate } from "../../calendar-date";
import { messages } from "../../messages";
import { AccountPageLayout } from "../../account-page-layout";
import { usePortalContainer } from "../../portal-container";
import { patchResource } from "../../write";
import {
  formatCardLabel,
  hasSavedCard,
  type DefaultPaymentMethodResource,
} from "../payment-method";
import type { CartDisplayConfig } from "./cart-display-config";
import { toDatePickerBounds, toLocalDateString } from "./date-constraints";
import { frequencyLabel } from "./frequency-label";
import {
  AlertSlot,
  CardList,
  Columns,
  DetailRow,
  DetailValue,
  HeaderRow,
  ItemBody,
  ItemCard,
  ItemName,
  ItemPrice,
  ItemThumb,
  Main,
  Note,
  PageTitle,
  Panel,
  PanelAction,
  PanelLabel,
  PanelNote,
  PanelRow,
  PanelValue,
  Rail,
  RailCard,
  RailList,
  RailRow,
  RailTitle,
  SectionHeader,
  SectionHeading,
  TitleId,
  TitleLine,
} from "../../detail-page-layout";
import { visibleItemDetails } from "./item-details";
import { Pagination } from "../pagination";
import {
  OrderHeaderCell,
  OrderHeaderRow,
  OrderRow,
  SUBSCRIPTION_ORDER_COLUMNS,
  type OrderResource,
} from "../orders/row";
import { lineItemsTitle } from "../../line-items";
import { getSubscriptionStatus, type SubscriptionStatus } from "./status";
import type { SubscriptionResource } from "./card";
import { useSubscriptionById } from "./use-subscription-by-id";

const ITEMS_PER_PAGE = 3;

/**
 * Which of `getSubscriptionStatus`'s statuses mean "this subscription is
 * over" for the purposes of this page's gating: no editable controls, no
 * Billing & shipping panel (spec §6.4), no cancel link, and an "Ended on
 * {date}" note in the header (spec §6.1).
 *
 * A total map over `SubscriptionStatus` rather than a chain of equality
 * checks, so a status added to `status.ts` fails to compile here instead of
 * silently defaulting to "still live". That default is exactly what
 * `failed_and_ended` used to get: it is `ended` with a payment failure on
 * top, and every gate here read it as live -- which left a dead
 * subscription showing a working `cart=checkout&sub_restart=auto` link and
 * never telling the customer it had ended.
 *
 * `will_end` and `will_end_after_payment` stay `false` on purpose: those
 * carry a *scheduled* end date that has not arrived, so the subscription is
 * still live and still editable. (A non-null `endsAt` is what stops a
 * second cancellation being queued for them -- see the Cancel block.)
 */
const ENDED_STATUSES: Record<SubscriptionStatus, boolean> = {
  will_start: false,
  will_end: false,
  will_end_after_payment: false,
  next_payment: false,
  ended: true,
  failed: false,
  failed_and_ended: true,
  inactive: true,
};

// The DS Alert has no Title part. Worth adding upstream if a second caller
// ever needs one; for now this is the one place that does.
const AlertTitle = styled.div`
  font: ${(props) => props.theme.tokens.font.bodyEmphasis};
  color: inherit;
`;

const EditLink = styled.a`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.tokens.space["2xs"]};
  height: ${(props) => props.theme.tokens.size.controlSm};
  padding: 0 calc(${(props) => props.theme.tokens.size.controlSm} / 3);
  border: ${(props) => props.theme.tokens.border.field};
  border-radius: ${(props) => props.theme.tokens.borderRadius.sm};
  font: ${(props) => props.theme.tokens.font.buttonSm};
  color: ${(props) => props.theme.tokens.color.body};
  text-decoration: none;

  &:focus-visible {
    outline: ${(props) => props.theme.tokens.outline.primary};
    outline-offset: 2px;
  }

  @media (max-width: 560px) {
    width: 100%;
  }
`;

/**
 * A link that leaves the portal for Foxy's hosted cart: Modify items, and the
 * shipping address Edit.
 *
 * It exists to keep three things that have to agree in one place -- the new
 * tab, the `rel` that must accompany it, and the icon that tells the customer
 * to expect one. Spread across call sites, they drift: an icon over a
 * same-tab navigation is a promise the customer only discovers is false once
 * they have lost the page they were on.
 */
function LinkOut({ href, children }: { href: string; children: ReactNode }) {
  return (
    <EditLink href={href} target="_blank" rel="noreferrer">
      {children}
      <ExternalLink size={14} aria-hidden="true" />
    </EditLink>
  );
}

const SaveNote = styled.p`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.bodySmall};
  color: ${(props) => props.theme.tokens.color.faint};
`;

const CancelBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 4px;
`;

const CancelLink = styled.a`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.tokens.space["2xs"]};
  font: ${(props) => props.theme.tokens.font.body};
  font-weight: 500;
  color: ${(props) => props.theme.tokens.color.error};
  text-decoration: underline;
  cursor: pointer;
`;

/**
 * Raw (snake_case) shape of a single next-date modification rule, as the API
 * returns it. Mirrors `CustomerPortalSettings['props']['subscriptions']
 * ['allow_next_date_modification']` from `@foxy.io/sdk`, which is not
 * exported from any public subpath, so the shape is declared here instead of
 * cast through `unknown` at the call site.
 */
type NextDateModificationRule = {
  min?: string;
  max?: string;
  jsonata_query: string;
  disallowed_dates?: string[];
  allowed_days?:
    { type: "day"; days: number[] } | { type: "month"; days: number[] };
};

type NextDateModificationRules = boolean | NextDateModificationRule[];

export type PortalSettings = {
  subscriptions: {
    allow_frequency_modification: unknown;
    allow_next_date_modification: NextDateModificationRules;
  };
};

type CollectionPage = {
  total_items?: number;
  _embedded?: Record<string, unknown[]>;
};

/** Builds a hosted-cart link from the subscription's token URL. */
function tokenLink(href: string, params: Record<string, string>): string {
  const url = new URL(href);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

type ContainerProps = {
  id: string;
  resource?: SubscriptionResource;
  subscriptionsLink: FollowableLink<CollectionPage> | null;
  settings: PortalSettings | null;
  cartDisplayConfig?: CartDisplayConfig | null;
  paymentMethodLink?:
    | (FollowableLink<DefaultPaymentMethodResource> & { href: string })
    | undefined;
  onBack: () => void;
};

/**
 * Resolves `resource` when navigation didn't already carry it before handing
 * off to the presentational `SubscriptionPage` -- see `useSubscriptionById`'s
 * doc comment for why this goes through a collection scan rather than a
 * constructed href.
 */
export function SubscriptionPageContainer({
  id,
  resource,
  subscriptionsLink,
  settings,
  cartDisplayConfig,
  paymentMethodLink,
  onBack,
}: ContainerProps) {
  const intl = useIntl();
  const fetched = useSubscriptionById(resource ? null : subscriptionsLink, id);
  const subscription = resource ?? fetched.subscription;

  if (!resource && (fetched.isLoading || fetched.isUnauthenticated)) {
    return (
      <AccountPageLayout onBack={onBack}>
        <Skeleton />
      </AccountPageLayout>
    );
  }

  if (!subscription) {
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

  return (
    <SubscriptionPage
      subscription={subscription}
      settings={settings}
      cartDisplayConfig={cartDisplayConfig}
      paymentMethodLink={paymentMethodLink}
      onBack={onBack}
    />
  );
}

type Props = {
  subscription: SubscriptionResource;
  settings: PortalSettings | null;
  cartDisplayConfig?: CartDisplayConfig | null;
  paymentMethodLink?:
    | (FollowableLink<DefaultPaymentMethodResource> & { href: string })
    | undefined;
  onBack: () => void;
};

export function SubscriptionPage({
  subscription,
  settings,
  cartDisplayConfig,
  paymentMethodLink,
  onBack,
}: Props) {
  const intl = useIntl();
  const { onUnauthenticated, cache } = useApi();
  const portalContainer = usePortalContainer();
  const frequencyId = useId();
  const cancelNoteId = useId();
  const nextDateId = useId();
  const [nextDateOpen, setNextDateOpen] = useState(false);

  const [frequency, setFrequency] = useState(subscription.frequency);
  const [nextDate, setNextDate] = useState<Date | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [itemPage, setItemPage] = useState(1);

  // The SDK normalises snake_case at its own boundary, so `settings` goes in
  // exactly as the API returned it. Converting the keys here would produce
  // undefined JSONata queries and silently wrong gating.
  const frequencies = useMemo(() => {
    if (!settings) return [];
    try {
      return Array.from(
        getAllowedFrequencies({
          settings: settings as never,
          subscription: subscription as never,
        }),
      );
    } catch {
      return [];
    }
  }, [settings, subscription]);

  // Three shapes: `false` means the store switched this off entirely, `true`
  // means any date, an object means translate the rules into picker bounds.
  const dateRules = useMemo(() => {
    if (!settings) return false;
    try {
      return getNextTransactionDateConstraints(
        subscription as never,
        settings.subscriptions.allow_next_date_modification,
      );
    } catch {
      return false;
    }
  }, [settings, subscription]);

  const bounds = useMemo(
    () =>
      typeof dateRules === "object"
        ? toDatePickerBounds(dateRules)
        : { disabled: [] as never[] },
    [dateRules],
  );

  const tokenHref = subscription._links["fx:sub_token_url"]?.href;

  // The second of the two hosted link-outs spec §3 lists. Unlike the billing
  // one it is a ready-made URL, not `sub_token_url` plus query params.
  const modifyHref = subscription._links["fx:sub_modification_url"]?.href;

  // The customer-scoped subscription resource exposes no `id` — only
  // `third_party_id`, which is set solely for external systems like PayPal
  // Express and is usually empty. The identifier the customer recognises is
  // the last segment of the self link.
  const subscriptionId = subscription._links.self.href
    .replace(/\/+$/, "")
    .split("/")
    .pop();

  const endsAt = toCalendarDate(subscription.end_date);
  const startedAt = toCalendarDate(subscription.start_date);
  const nextAt = toCalendarDate(subscription.next_transaction_date);

  // What the date picker trigger reads, and where its calendar opens: the
  // customer's pending pick if there is one, otherwise the subscription's
  // own next payment date. Deliberately NOT `nextDate` alone -- an empty
  // trigger beside a date the page states twice elsewhere reads as missing
  // data. `nextDate` stays the only thing `handleSave` looks at.
  const shownNextDate = nextDate ?? nextAt;

  // `past_due_amount` is typed as a number on `SubscriptionResource`, but the
  // rail's row is coerced through `Number()` anyway -- belt-and-suspenders
  // against a store that ever sends the numeric-string shape the sibling
  // `total_*` fields use, so `"0"` reads as "do not render" too.
  const pastDueAmount = Number(subscription.past_due_amount ?? 0);

  const status = getSubscriptionStatus(subscription);
  const isFailed = status === "failed" || status === "failed_and_ended";
  const isEnded = status !== null && ENDED_STATUSES[status];
  const isScheduled = status === "will_start";

  // `getSubscriptionStatus` returns `null` when the subscription carries no
  // date it can reason from (`start_date: null`, or a `next_transaction_date`
  // that is missing on an otherwise active record). The old chain fell
  // through to "Active" there, badging a subscription whose state is
  // genuinely unknown as a healthy one. There is nothing honest to say, so
  // the badge is omitted -- the header still shows the title and id, and the
  // rail still shows whatever dates the record does carry.
  //
  // `isFailed` is tested first in both chains, so `failed_and_ended` badges
  // as Past due rather than Ended. That is spec §6.1's own row order ("any
  // failed state" above "ended / inactive"), and it is deliberate: such a
  // subscription shows the Past due badge, the past-due alert *and* the
  // "Ended on {date}" note together, which is the full truth about it.
  const statusMessage =
    status === null
      ? null
      : isFailed
        ? messages.subscriptionStatusPastDue
        : isEnded
          ? messages.subscriptionStatusEnded
          : isScheduled
            ? messages.subscriptionStatusScheduled
            : messages.subscriptionStatusActive;

  // Four bodies over two axes.
  //
  // Amount: a subscription can carry a failure date with no
  // `past_due_amount`, and "A payment of $0.00 could not be taken" states a
  // figure the store never sent. Gated on the same `pastDueAmount` the
  // rail's Past due row uses, so the two can never disagree about whether
  // there is an amount to name.
  //
  // Ended: spec §6.2's copy ends "Update your payment method on the portal
  // home page to continue using this subscription", which is right while
  // the subscription is running and incoherent once it is not --
  // `failed_and_ended` would be told to fix a payment method for a
  // subscription the same page says, four lines up, will take no further
  // payments. The ended variants report the failure and stop.
  //
  // `amount` is passed to all four; the no-amount ones simply have no
  // placeholder to fill.
  const pastDueBody = isEnded
    ? pastDueAmount > 0
      ? messages.subscriptionPastDueEndedBody
      : messages.subscriptionPastDueEndedBodyNoAmount
    : pastDueAmount > 0
      ? messages.subscriptionPastDueBody
      : messages.subscriptionPastDueBodyNoAmount;

  const statusVariant = isFailed
    ? "destructive"
    : isEnded || isScheduled
      ? "secondary"
      : "default";

  const template = subscription._embedded?.["fx:transaction_template"];
  const currency = template?.currency_code ?? "USD";
  const items = template?._embedded?.["fx:items"] ?? [];
  // The same derivation the home page's card uses, so the heading the
  // customer clicked and the heading they land on agree. Joining raw
  // `item.name`s here made a bundle's card read "Coffee Subscription -- Dark
  // Roast" and its page read "Coffee Subscription -- Dark Roast, Extra
  // Filters, Coffee Mugs".
  //
  // The Items section below deliberately does NOT group: spec §6.3 counts
  // and pages the full item array, and a bundle's children are items the
  // customer is paying for. Grouping there would hide them and make the
  // "Items ({count})" heading disagree with the list beneath it.
  const title = lineItemsTitle(items);

  const shippingLine1 = [template?.shipping_address1, template?.shipping_address2]
    .filter((part) => part && part.trim())
    .join(", ");
  const shippingLine2 = [
    [template?.shipping_city, template?.shipping_state]
      .filter((part) => part && part.trim())
      .join(", "),
    template?.shipping_postal_code,
    template?.shipping_country,
  ]
    .filter((part) => part && String(part).trim())
    .join(" ");

  // A transaction template for a digital-only subscription carries no
  // shipping fields at all. Without this the row still rendered its heading
  // and its Edit link-out over two empty lines -- an "edit" affordance for
  // an address the store does not have.
  const hasShippingAddress = !!(shippingLine1 || shippingLine2);

  // Items are already in hand from the embed, so this pager is local state
  // over a fixed array rather than another `useCollection`.
  const itemOffset = (itemPage - 1) * ITEMS_PER_PAGE;
  const visibleItems = items.slice(itemOffset, itemOffset + ITEMS_PER_PAGE);

  const showStartDate = cartDisplayConfig?.show_sub_startdate ?? true;
  const showEndDate = cartDisplayConfig?.show_sub_enddate ?? true;
  const showFrequency = cartDisplayConfig?.show_sub_frequency ?? true;
  const showNextDate = cartDisplayConfig?.show_sub_nextdate ?? true;

  // Reconstructs the exact condition that gates the editable frequency
  // `Select` below (`!isEnded` wrap, then `showFrequency &&
  // frequencies.length > 0`), so the read-only Frequency row's own condition
  // -- `showFrequency && !frequencySelectVisible` -- can never show both the
  // Select and the read-only row, and never show neither while
  // `showFrequency` is on: ended, or live-but-the-store-disallows-changing-
  // it (`frequencies` empty), both fall through to the read-only row.
  const frequencySelectVisible =
    !isEnded && showFrequency && frequencies.length > 0;

  // The date picker's own gate, hoisted so the save note can be gated on
  // whether *anything* editable rendered above it. With `settings: null`
  // (a store that answered nothing, or a settings read still in flight)
  // both controls are absent, and the rail used to still promise "Changes
  // save immediately and apply to the next payment." -- copy describing
  // edits the customer cannot make, over an empty card.
  const nextDateCalendarVisible =
    !isEnded && showNextDate && dateRules !== false;
  const hasEditableControls =
    frequencySelectVisible || nextDateCalendarVisible;

  // No `zoom: "items"`, unlike the home page's order list. That embed feeds
  // only `OrderRow`'s Summary cell (see `orders/row.tsx`), and this table
  // passes `withSummary={false}` -- every payment here is for the same
  // subscription, so a per-row summary would repeat the page's own title.
  // Asking for it fetched an item array per transaction that nothing
  // rendered.
  const paymentsLink = subscription._links["fx:transactions"];
  const paymentsQuery = useMemo(() => ({ limit: 10 }), []);

  const {
    items: payments,
    error: paymentsError,
    isLoading: paymentsLoading,
    isUnauthenticated: paymentsUnauthenticated,
    totalItems: paymentsTotal,
    offset: paymentsOffset,
    limit: paymentsLimit,
    loadNext: loadNextPayment,
    loadPrev: loadPrevPayment,
    goToPage: goToPagePayment,
  } = useCollection<OrderResource>(paymentsLink as never, paymentsQuery);

  // Decorative label only -- the payment-method row never shows a spinner,
  // an error, or a placeholder for it, so `isLoading`/`error` from this read
  // are deliberately not consulted below. `cardLabel` is `null` the entire
  // time the resource is loading, missing, or unresolved, and the row
  // renders exactly the same (label + note, no value) in every one of those
  // cases as it does for a customer who genuinely has no card on file.
  const { data: paymentMethodData } = useResource<DefaultPaymentMethodResource>(
    paymentMethodLink ?? null,
  );
  const cardLabel = hasSavedCard(paymentMethodData)
    ? formatCardLabel(paymentMethodData)
    : null;

  /**
   * Writes one touched field and stays on the page.
   *
   * The rail's note has always told the customer "Changes save immediately",
   * and now that is literally true: each control writes as it changes and
   * there is no Save button to press. Two consequences worth naming:
   *
   * - It does NOT call `onBack()`. That used to fire on a successful save,
   *   which is right for a form the customer submits once and wrong for a
   *   control they may adjust twice -- it would throw them off the page on
   *   the first change.
   * - `revert` puts the control back to the value the server still holds
   *   when the write fails. Without a Save button there is nothing left to
   *   signal "not saved yet", so a control that kept a rejected value would
   *   simply be lying about the subscription.
   * - It does NOT `cache.clear()`. It used to, which was harmless only
   *   because the old flow cleared and then immediately navigated home,
   *   remounting the list. Clearing while STAYING here drops the cached
   *   resources under this page, so it unmounts to a skeleton and back --
   *   taking the local `frequency`/`nextDate` with it. The page then falls
   *   back to the `subscription` prop it was handed, which is the value
   *   from before the write, so a save that succeeded looked like it had
   *   silently reverted. The clear now happens on the way out (`handleBack`),
   *   which is the moment it was ever actually doing anything.
   *
   * Only the touched field goes in the body -- see the original
   * ManageDialog's comment on why sending `frequency` unconditionally is
   * wrong even when the Select never rendered a change.
   */
  async function saveChange(
    changes: Partial<SubscriptionResource>,
    revert: () => void,
  ) {
    setIsBusy(true);
    setHasFailed(false);

    try {
      await patchResource(subscription._links.self as never, changes);
      setHasSaved(true);
    } catch (caught) {
      // This page sends no credentials, so 401/403 can only mean the session
      // died — the password page is the one place 401 means "wrong value".
      if (caught instanceof WriteError && caught.isUnauthorized) {
        onUnauthenticated();
        return;
      }

      revert();
      setHasFailed(true);
    } finally {
      setIsBusy(false);
    }
  }

  /**
   * Leaves the page, refreshing everything behind it first if anything was
   * actually written. The rest of the portal -- the home page's subscription
   * card above all -- renders this subscription's frequency and next payment
   * date from cached collections, so without this it would still show the old
   * values after the customer edited them here.
   */
  function handleBack() {
    if (hasSaved) cache.clear();
    onBack();
  }

  /**
   * A frequency as the customer should read it -- "Monthly", not "1m".
   *
   * Falls back to the raw string when `frequencyLabel` cannot read it. The
   * Select's values stay the wire format either way: it is what the API
   * sent and what `handleFrequencyChange` PATCHes back.
   */
  function formatFrequency(value: string) {
    const label = frequencyLabel(value);
    return label
      ? intl.formatMessage(label.message, { count: label.count })
      : value;
  }

  function handleFrequencyChange(next: string) {
    if (next === frequency) return;

    const previous = frequency;
    setFrequency(next);
    void saveChange({ frequency: next }, () => setFrequency(previous));
  }

  function handleNextDateChange(date: Date | undefined) {
    if (!date) return;

    const previous = nextDate;
    setNextDate(date);
    void saveChange(
      { next_transaction_date: toLocalDateString(date) },
      () => setNextDate(previous),
    );
  }

  return (
    <AccountPageLayout onBack={handleBack}>
      <HeaderRow>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TitleLine>
            <PageTitle>
              {/* A template with no items leaves nothing to name the
              subscription by. Without this the heading read " (#1042)",
              leading space and all. */}
              {title ? <>{title} </> : null}
              <TitleId>
                {intl.formatMessage(messages.subscriptionTitleId, {
                  id: subscriptionId,
                })}
              </TitleId>
            </PageTitle>
            {statusMessage ? (
              <Badge $variant={statusVariant}>
                {intl.formatMessage(statusMessage)}
              </Badge>
            ) : null}
          </TitleLine>

          {isEnded && endsAt ? (
            <Note>
              {/* Named date gated on the same `showEndDate` the rail's Ends
              row and the cancel-scheduled note use. Before this branch
              `failed_and_ended` never reached this note at all, so a store
              with `show_sub_enddate: false` could not see the leak; finding
              3's fix is what routes that state here, which makes it ours.
              The note itself is not gated -- that the subscription ended
              and will take no further payments is the substance of it, and
              is true whether or not the date can be shown. */}
              {showEndDate
                ? intl.formatMessage(messages.subscriptionEndedNote, {
                    date: intl.formatDate(endsAt, { dateStyle: "medium" }),
                  })
                : intl.formatMessage(messages.subscriptionEndedNoteNoDate)}
            </Note>
          ) : null}
        </div>
      </HeaderRow>

      {isFailed ? (
        <AlertSlot>
          <Alert.Root $variant="destructive">
            <AlertTitle>
              {intl.formatMessage(messages.subscriptionPastDueTitle)}
            </AlertTitle>
            <Alert.Description>
              {intl.formatMessage(pastDueBody, {
                amount: intl.formatNumber(pastDueAmount, {
                  style: "currency",
                  currency,
                }),
              })}
            </Alert.Description>
          </Alert.Root>
        </AlertSlot>
      ) : null}

      <Columns>
        <Main>
          <section>
            <SectionHeader>
              <SectionHeading $flush>
                {intl.formatMessage(messages.subscriptionItemsHeading, {
                  count: items.length,
                })}
              </SectionHeading>

              {/* Spec §3 and §9: changing what is in a subscription is a
              hosted-cart flow, not a customer-API write, so this stays the
              link-out it has always been. It lives beside the Items heading
              because the items are what it modifies. Hidden once the
              subscription has ended, like the page's other link-outs --
              there is nothing left to modify. */}
              {modifyHref && !isEnded ? (
                <LinkOut href={modifyHref}>
                  {intl.formatMessage(messages.manageModify)}
                </LinkOut>
              ) : null}
            </SectionHeader>

            <CardList>
              {visibleItems.map((item, index) => (
                <ItemCard key={`${item.name}-${itemOffset + index}`}>
                  <ItemThumb>
                    {item.image ? (
                      <img src={item.image} alt="" loading="lazy" />
                    ) : null}
                  </ItemThumb>

                  <ItemBody>
                    <ItemName>{item.name}</ItemName>
                    {visibleItemDetails(item, cartDisplayConfig).map(
                      (row, i) => (
                        <DetailRow key={`${row.kind}-${i}`}>
                          <span>
                            {row.kind === "option"
                              ? row.name
                              : intl.formatMessage(
                                  row.kind === "weight"
                                    ? messages.subscriptionItemWeight
                                    : messages.subscriptionItemCode,
                                )}
                          </span>
                          <DetailValue>{row.value}</DetailValue>
                        </DetailRow>
                      ),
                    )}
                  </ItemBody>

                  {item.price !== undefined ? (
                    <ItemPrice>
                      <FormattedNumber
                        value={item.price * (item.quantity ?? 1)}
                        style="currency"
                        currency={currency}
                      />
                    </ItemPrice>
                  ) : null}
                </ItemCard>
              ))}
            </CardList>

            {items.length > ITEMS_PER_PAGE ? (
              <Pagination
                offset={itemOffset}
                limit={ITEMS_PER_PAGE}
                totalItems={items.length}
                onGoToPage={setItemPage}
                onPrev={() => setItemPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setItemPage((p) =>
                    Math.min(Math.ceil(items.length / ITEMS_PER_PAGE), p + 1),
                  )
                }
              />
            ) : null}
          </section>

          {!isEnded ? (
            <section>
              <SectionHeading>
                {intl.formatMessage(messages.subscriptionBillingHeading)}
              </SectionHeading>

              <Panel>
                <PanelRow>
                  <div>
                    <PanelLabel>
                      {intl.formatMessage(messages.subscriptionPaymentMethodLabel)}
                    </PanelLabel>
                    <PanelNote>
                      {intl.formatMessage(messages.subscriptionPaymentMethodNote)}
                    </PanelNote>
                  </div>

                  {cardLabel ? <PanelValue>{cardLabel}</PanelValue> : null}
                </PanelRow>

                {/* Separator and row go together: leaving the rule behind
                would draw a divider under the panel's only remaining row. */}
                {hasShippingAddress ? (
                  <>
                    <Separator />

                    <PanelRow>
                      <div>
                        <PanelLabel>
                          {intl.formatMessage(messages.subscriptionShippingLabel)}
                        </PanelLabel>
                        <PanelNote>{shippingLine1}</PanelNote>
                        <PanelNote>{shippingLine2}</PanelNote>
                      </div>

                      {tokenHref ? (
                        <PanelAction>
                          <LinkOut
                            href={tokenLink(tokenHref, {
                              cart: "checkout",
                              sub_restart: "auto",
                            })}
                          >
                            {intl.formatMessage(messages.addressEdit)}
                          </LinkOut>
                        </PanelAction>
                      ) : null}
                    </PanelRow>
                  </>
                ) : null}
              </Panel>
            </section>
          ) : null}

          <section>
            <SectionHeading>
              {intl.formatMessage(messages.paymentHistoryHeading)}
            </SectionHeading>

            {paymentsLoading || paymentsUnauthenticated ? <Skeleton /> : null}

            {paymentsError && !paymentsUnauthenticated ? (
              <Alert.Root $variant="destructive">
                <Alert.Description>
                  {intl.formatMessage(messages.errorUnknown)}
                </Alert.Description>
              </Alert.Root>
            ) : null}

            {!paymentsLoading && !paymentsError && payments.length === 0 ? (
              <p>{intl.formatMessage(messages.paymentsEmpty)}</p>
            ) : null}

            {!paymentsLoading && !paymentsError && payments.length > 0 ? (
              <>
                <OrderHeaderRow $columns={SUBSCRIPTION_ORDER_COLUMNS}>
                  <OrderHeaderCell>
                    {intl.formatMessage(messages.ordersColumnOrder)}
                  </OrderHeaderCell>
                  <OrderHeaderCell>
                    {intl.formatMessage(messages.ordersColumnDate)}
                  </OrderHeaderCell>
                  <OrderHeaderCell>
                    {intl.formatMessage(messages.ordersColumnAmount)}
                  </OrderHeaderCell>
                  <OrderHeaderCell>
                    {intl.formatMessage(messages.ordersColumnStatus)}
                  </OrderHeaderCell>
                  <div />
                </OrderHeaderRow>

                {payments.map((payment) => (
                  <OrderRow
                    key={payment._links.self.href}
                    order={payment}
                    // No `onOpen`: the customer is already looking at this
                    // subscription, so there is nowhere else for a click to
                    // take them. `OrderRow` then renders the cells without
                    // the button wrapper -- nothing focusable, no pointer
                    // cursor, no focus ring. The row's own Receipt link is
                    // the way out to the document and stays reachable.
                    columns={SUBSCRIPTION_ORDER_COLUMNS}
                    withSummary={false}
                  />
                ))}
              </>
            ) : null}

            {paymentsTotal > paymentsLimit ? (
              <Pagination
                offset={paymentsOffset}
                limit={paymentsLimit}
                totalItems={paymentsTotal}
                onGoToPage={goToPagePayment}
                onPrev={loadPrevPayment}
                onNext={loadNextPayment}
              />
            ) : null}
          </section>
        </Main>
        <Rail>
          <RailCard>
            <RailTitle>
              {intl.formatMessage(messages.subscriptionSummaryHeading)}
            </RailTitle>

            <RailList>
              <RailRow>
                <span>
                  {intl.formatMessage(messages.subscriptionSummaryShipping)}
                </span>
                <span>
                  <FormattedNumber
                    value={Number(template?.total_shipping ?? 0)}
                    style="currency"
                    currency={currency}
                  />
                </span>
              </RailRow>
              <RailRow>
                <span>
                  {intl.formatMessage(messages.subscriptionSummaryTax)}
                </span>
                <span>
                  <FormattedNumber
                    value={Number(template?.total_tax ?? 0)}
                    style="currency"
                    currency={currency}
                  />
                </span>
              </RailRow>
              <RailRow>
                <span>
                  {intl.formatMessage(messages.subscriptionSummaryTotal)}
                </span>
                <span>
                  <FormattedNumber
                    value={template?.total_order ?? 0}
                    style="currency"
                    currency={currency}
                  />
                </span>
              </RailRow>
              {pastDueAmount > 0 ? (
                <RailRow $error>
                  <span>
                    {intl.formatMessage(messages.subscriptionSummaryPastDue)}
                  </span>
                  <span>
                    <FormattedNumber
                      value={pastDueAmount}
                      style="currency"
                      currency={currency}
                    />
                  </span>
                </RailRow>
              ) : null}
            </RailList>

            <Separator />

            {/* Read-only. The spec is explicit that start and end dates are
            not editable here: v1's SubscriptionForm only allows it when
            portal settings are absent, which never happens inside the
            portal. Cancel still sets an end date, via the link-out below.
            Frequency appears here (as text) once the subscription has
            ended, and also while it's live if the store disallows changing
            it (`frequencySelectVisible` false, see its definition above) --
            the editable Select below only covers the remaining case. */}
            <RailList>
              {showStartDate ? (
                <RailRow>
                  <span>
                    {intl.formatMessage(messages.subscriptionStarted)}
                  </span>
                  <span>
                    {startedAt ? (
                      <FormattedDate value={startedAt} dateStyle="medium" />
                    ) : null}
                  </span>
                </RailRow>
              ) : null}
              {endsAt && showEndDate ? (
                <RailRow>
                  <span>{intl.formatMessage(messages.manageEnds)}</span>
                  <span>
                    <FormattedDate value={endsAt} dateStyle="medium" />
                  </span>
                </RailRow>
              ) : null}
              {showFrequency && !frequencySelectVisible ? (
                <RailRow>
                  <span>{intl.formatMessage(messages.manageFrequency)}</span>
                  <span>{formatFrequency(subscription.frequency)}</span>
                </RailRow>
              ) : null}
            </RailList>

            {hasEditableControls ? (
              <>
                {frequencySelectVisible ? (
                  <Field.Root>
                    <Field.Label htmlFor={frequencyId}>
                      {intl.formatMessage(messages.manageFrequency)}
                    </Field.Label>

                    <Select.Root
                      value={frequency}
                      disabled={isBusy}
                      onValueChange={(next: string | null) =>
                        next && handleFrequencyChange(next)
                      }
                    >
                      <Select.Trigger id={frequencyId}>
                        {/* Explicit children rather than a bare
                            `Select.Value`, which renders the raw API string
                            ("1m") the Item was keyed by -- the value has to
                            stay the wire format for `onValueChange`. */}
                        <Select.Value>{formatFrequency(frequency)}</Select.Value>
                        {/* `Select.Icon` rotates 180 degrees while the popup
                            is open, so the chevron doubles as the open/closed
                            state. */}
                        <Select.Icon>
                          <ChevronDown size={16} aria-hidden="true" />
                        </Select.Icon>
                      </Select.Trigger>

                      <Select.Portal container={portalContainer ?? undefined}>
                        <Select.Positioner>
                          <Select.Popup>
                            <Select.List>
                              {frequencies.map((value) => (
                                <Select.Item key={value} value={value}>
                                  <Select.ItemText>
                                    {formatFrequency(value)}
                                  </Select.ItemText>
                                </Select.Item>
                              ))}
                            </Select.List>
                          </Select.Popup>
                        </Select.Positioner>
                      </Select.Portal>
                    </Select.Root>
                  </Field.Root>
                ) : null}

                {nextDateCalendarVisible ? (
                  <Field.Root>
                    <Field.Label htmlFor={nextDateId}>
                      {intl.formatMessage(messages.manageNextPayment)}
                    </Field.Label>

                    <Popover.Root
                      open={nextDateOpen}
                      onOpenChange={setNextDateOpen}
                    >
                      <Popover.Trigger
                        id={nextDateId}
                        $variant="field"
                        disabled={isBusy}
                      >
                        {shownNextDate ? (
                          <FormattedDate
                            value={shownNextDate}
                            dateStyle="medium"
                          />
                        ) : (
                          intl.formatMessage(messages.manageNextPaymentEmpty)
                        )}
                        <CalendarDays size={16} aria-hidden="true" />
                      </Popover.Trigger>

                      <Popover.Portal
                        container={portalContainer ?? undefined}
                      >
                        <Popover.Positioner sideOffset={4}>
                          <Popover.Popup>
                            <Calendar
                              mode="single"
                              // `selected` and `defaultMonth` read the
                              // subscription's own date, so the picker opens
                              // on the date the customer already has rather
                              // than on an empty month.
                              selected={shownNextDate ?? undefined}
                              defaultMonth={shownNextDate ?? undefined}
                              onSelect={(date: Date | undefined) => {
                                handleNextDateChange(date);
                                if (date) setNextDateOpen(false);
                              }}
                              startMonth={
                                "startMonth" in bounds
                                  ? bounds.startMonth
                                  : undefined
                              }
                              endMonth={
                                "endMonth" in bounds
                                  ? bounds.endMonth
                                  : undefined
                              }
                              disabled={bounds.disabled}
                            />
                          </Popover.Popup>
                        </Popover.Positioner>
                      </Popover.Portal>
                    </Popover.Root>
                  </Field.Root>
                ) : null}

                {/* Beside the controls, not in the left column where the
                    page's other failures render. With no Save button there
                    is no moment the customer is watching for a result, so an
                    error about a rail control has to appear in the rail --
                    on a wide host the left column's alert can be a whole
                    column away, and once stacked it is off screen. */}
                {hasFailed ? (
                  <Alert.Root $variant="destructive" role="alert">
                    <Alert.Description>
                      {intl.formatMessage(messages.subscriptionSaveFailed)}
                    </Alert.Description>
                  </Alert.Root>
                ) : null}

                <SaveNote aria-live="polite">
                  {intl.formatMessage(
                    isBusy
                      ? messages.subscriptionSaving
                      : messages.subscriptionSaveNote,
                  )}
                </SaveNote>
              </>
            ) : null}
          </RailCard>

          {!isEnded && tokenHref ? (
            <CancelBlock>
              {endsAt ? (
                // A cancellation is already queued, so the link is inert.
                // `aria-disabled` alone announces "unavailable" and stops
                // there; this note says why, and `aria-describedby` ties the
                // two together so it is read with the link rather than
                // stumbled on afterwards. It sits directly under the link,
                // above the "Access continues until" line spec §6.7 keeps
                // for every live subscription -- this one is still live, it
                // just has an end date on the books.
                <>
                  <CancelLink aria-disabled="true" aria-describedby={cancelNoteId}>
                    {intl.formatMessage(messages.manageCancel)}
                  </CancelLink>
                  <SaveNote id={cancelNoteId}>
                    {/* Named date gated on the same `showEndDate` the rail's
                    Ends row uses, two blocks up -- otherwise a store that
                    sets `show_sub_enddate: false` gets the Ends row
                    correctly suppressed and then reads the same date here.
                    The note itself is not gated: explaining why the link is
                    inert is its whole job, and that is true with or without
                    a date to show. */}
                    {showEndDate
                      ? intl.formatMessage(
                          messages.subscriptionCancelScheduled,
                          {
                            date: intl.formatDate(endsAt, {
                              dateStyle: "medium",
                            }),
                          },
                        )
                      : intl.formatMessage(
                          messages.subscriptionCancelScheduledNoDate,
                        )}
                  </SaveNote>
                </>
              ) : (
                // Opens in a new tab, like the Receipt links in the table
                // above. The icon is the reason: it promises a new tab, so
                // navigating in place would make it a lie. Keeping the portal
                // open behind the hosted cancel flow also means the customer
                // still has this page to come back to.
                //
                // The inert branch above deliberately has no icon -- it opens
                // nothing at all.
                <CancelLink
                  href={tokenLink(tokenHref, { sub_cancel: "true" })}
                  target="_blank"
                  rel="noreferrer"
                >
                  {intl.formatMessage(messages.manageCancel)}
                  <ExternalLink size={14} aria-hidden="true" />
                </CancelLink>
              )}

              {nextAt ? (
                <SaveNote>
                  {intl.formatMessage(messages.subscriptionAccessUntil, {
                    date: intl.formatDate(nextAt, { dateStyle: "medium" }),
                  })}
                </SaveNote>
              ) : null}
            </CancelBlock>
          ) : null}
        </Rail>
      </Columns>
    </AccountPageLayout>
  );
}
