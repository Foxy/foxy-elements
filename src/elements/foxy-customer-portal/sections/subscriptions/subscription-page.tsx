import { useId, useMemo, useState } from "react";
import { FormattedDate, FormattedNumber, useIntl } from "react-intl";
import styled from "styled-components";
import { Alert } from "@foxy.io/design-system/alert";
import { Badge } from "@foxy.io/design-system/badge";
import { Button } from "@foxy.io/design-system/button";
import { Calendar } from "@foxy.io/design-system/calendar";
import { Field } from "@foxy.io/design-system/field";
import { Select } from "@foxy.io/design-system/select";
import { Separator } from "@foxy.io/design-system/separator";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { SummaryTable } from "@foxy.io/design-system/summary-table";
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
import { visibleItemDetails } from "./item-details";
import { Pagination } from "../pagination";
import {
  OrderHeaderCell,
  OrderHeaderRow,
  OrderRow,
  SUBSCRIPTION_ORDER_COLUMNS,
  type OrderResource,
} from "../orders/row";
import { getSubscriptionStatus } from "./status";
import type { SubscriptionResource } from "./card";
import { useSubscriptionById } from "./use-subscription-by-id";

const ITEMS_PER_PAGE = 3;

const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
`;

const TitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.h1};
  color: ${(props) => props.theme.tokens.color.body};
`;

const TitleId = styled.span`
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const Note = styled.p`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const AlertSlot = styled.div`
  margin-top: 24px;
`;

// The DS Alert has no Title part. Worth adding upstream if a second caller
// ever needs one; for now this is the one place that does.
const AlertTitle = styled.div`
  font: ${(props) => props.theme.tokens.font.bodyEmphasis};
  color: inherit;
`;

// The rail keeps a fixed width beside a column that may hold a wide table;
// `minmax(0, 1fr)` is what stops that table pushing the rail off screen.
const Columns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: clamp(24px, 4vw, 48px);
  margin-top: 32px;
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  min-width: 0;
`;

const Rail = styled.aside`
  position: sticky;
  top: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;

  /* Once the columns stack there is nothing to stay level with, and a
     sticky rail would just pin itself mid-scroll. */
  @media (max-width: 860px) {
    position: static;
  }
`;

const SectionHeading = styled.h2`
  margin: 0 0 16px;
  font: ${(props) => props.theme.tokens.font.h2};
  color: ${(props) => props.theme.tokens.color.body};
`;

const ItemCard = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 16px;
  border: ${(props) => props.theme.tokens.border.field};
  border-radius: ${(props) => props.theme.tokens.borderRadius.md};
  background: ${(props) => props.theme.tokens.background.surface};
`;

const ItemThumb = styled.div`
  width: 56px;
  aspect-ratio: 1;
  flex-shrink: 0;
  align-self: flex-start;
  border-radius: ${(props) => props.theme.tokens.borderRadius.sm};
  background: ${(props) => props.theme.tokens.background.disabledField};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const ItemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1 1 auto;
`;

const ItemName = styled.div`
  font: ${(props) => props.theme.tokens.font.label};
  color: ${(props) => props.theme.tokens.color.body};
`;

const DetailRow = styled.div`
  display: flex;
  gap: 6px;
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const DetailValue = styled.span`
  color: ${(props) => props.theme.tokens.color.body};
`;

const ItemPrice = styled.div`
  font: ${(props) => props.theme.tokens.font.bodyEmphasis};
  color: ${(props) => props.theme.tokens.color.body};
  flex-shrink: 0;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  border: ${(props) => props.theme.tokens.border.field};
  border-radius: ${(props) => props.theme.tokens.borderRadius.md};
  background: ${(props) => props.theme.tokens.background.surface};
`;

const PanelRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 16px;

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PanelLabel = styled.div`
  font: ${(props) => props.theme.tokens.font.label};
  color: ${(props) => props.theme.tokens.color.body};
`;

const PanelNote = styled.div`
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const PanelAction = styled.div`
  flex-shrink: 0;

  @media (max-width: 560px) {
    width: 100%;
  }
`;

const PanelValue = styled.div`
  flex-shrink: 0;
  font: ${(props) => props.theme.tokens.font.label};
  color: ${(props) => props.theme.tokens.color.body};
`;

const EditLink = styled.a`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

  const [frequency, setFrequency] = useState(subscription.frequency);
  const [nextDate, setNextDate] = useState<Date | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [itemPage, setItemPage] = useState(1);

  const hasEnded =
    !!subscription.end_date &&
    subscription.end_date !== "0000-00-00" &&
    new Date(subscription.end_date).getTime() <= Date.now();

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
  const hasEndDate = !!endsAt;

  const status = getSubscriptionStatus(subscription);
  const isFailed = status === "failed" || status === "failed_and_ended";
  const isEnded = status === "ended" || status === "inactive";
  const isScheduled = status === "will_start";

  const statusMessage = isFailed
    ? messages.subscriptionStatusPastDue
    : isEnded
      ? messages.subscriptionStatusEnded
      : isScheduled
        ? messages.subscriptionStatusScheduled
        : messages.subscriptionStatusActive;

  const statusVariant = isFailed
    ? "destructive"
    : isEnded || isScheduled
      ? "secondary"
      : "default";

  const template = subscription._embedded?.["fx:transaction_template"];
  const currency = template?.currency_code ?? "USD";
  const items = template?._embedded?.["fx:items"] ?? [];
  const title = items.map((item) => item.name).join(", ");

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

  // Items are already in hand from the embed, so this pager is local state
  // over a fixed array rather than another `useCollection`.
  const itemOffset = (itemPage - 1) * ITEMS_PER_PAGE;
  const visibleItems = items.slice(itemOffset, itemOffset + ITEMS_PER_PAGE);

  const showStartDate = cartDisplayConfig?.show_sub_startdate ?? true;
  const showEndDate = cartDisplayConfig?.show_sub_enddate ?? true;
  const showFrequency = cartDisplayConfig?.show_sub_frequency ?? true;
  const showNextDate = cartDisplayConfig?.show_sub_nextdate ?? true;

  // Items are zoomed per transaction, not read off the subscription, so a
  // subscription that was later modified still shows what was actually
  // charged at the time of each payment.
  const paymentsLink = subscription._links["fx:transactions"];
  const paymentsQuery = useMemo(() => ({ zoom: "items", limit: 10 }), []);

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

  async function handleSave() {
    // Only the fields the customer actually touched go in the body -- see
    // the original ManageDialog's comment on why sending `frequency`
    // unconditionally is wrong even when the Select never rendered a change.
    const changes: Partial<SubscriptionResource> = {};
    if (frequency !== subscription.frequency) changes.frequency = frequency;
    if (nextDate) changes.next_transaction_date = toLocalDateString(nextDate);

    if (Object.keys(changes).length === 0) {
      onBack();
      return;
    }

    setIsBusy(true);
    setHasFailed(false);

    try {
      await patchResource(subscription._links.self as never, changes);
      cache.clear();
      onBack();
    } catch (caught) {
      // This page sends no credentials, so 401/403 can only mean the session
      // died — the password page is the one place 401 means "wrong value".
      if (caught instanceof WriteError && caught.isUnauthorized) {
        onUnauthenticated();
        return;
      }

      setHasFailed(true);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <AccountPageLayout onBack={onBack} maxWidth="1080px">
      <HeaderRow>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TitleLine>
            <PageTitle>
              {title}{" "}
              <TitleId>
                {intl.formatMessage(messages.subscriptionTitleId, {
                  id: subscriptionId,
                })}
              </TitleId>
            </PageTitle>
            <Badge $variant={statusVariant}>
              {intl.formatMessage(statusMessage)}
            </Badge>
          </TitleLine>

          {isEnded && endsAt ? (
            <Note>
              {intl.formatMessage(messages.subscriptionEndedNote, {
                date: intl.formatDate(endsAt, { dateStyle: "medium" }),
              })}
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
              {intl.formatMessage(messages.subscriptionPastDueBody, {
                amount: intl.formatNumber(subscription.past_due_amount ?? 0, {
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
          {hasFailed ? (
            <Alert.Root $variant="destructive">
              <Alert.Description>
                {intl.formatMessage(messages.errorUnknown)}
              </Alert.Description>
            </Alert.Root>
          ) : null}

          {/* Read-only. The spec is explicit that start and end dates are not
          editable here: v1's SubscriptionForm only allows it when portal
          settings are absent, which never happens inside the portal. Cancel
          still sets an end date, via the link-out below. */}
          <SummaryTable.Root>
            <SummaryTable.Entry
              title={intl.formatMessage(messages.manageId)}
              subtitle={subscriptionId}
            />
            {showStartDate ? (
              <SummaryTable.Entry
                title={intl.formatMessage(messages.manageStarted)}
                value={
                  startedAt ? (
                    <FormattedDate value={startedAt} dateStyle="medium" />
                  ) : null
                }
              />
            ) : null}
            {endsAt && showEndDate ? (
              <SummaryTable.Entry
                title={intl.formatMessage(messages.manageEnds)}
                value={<FormattedDate value={endsAt} dateStyle="medium" />}
              />
            ) : null}
          </SummaryTable.Root>

          {showFrequency && frequencies.length > 0 ? (
            <Field.Root>
              <Field.Label htmlFor={frequencyId}>
                {intl.formatMessage(messages.manageFrequency)}
              </Field.Label>

              <Select.Root
                value={frequency}
                onValueChange={(next: string | null) =>
                  next && setFrequency(next)
                }
              >
                <Select.Trigger id={frequencyId}>
                  <Select.Value />
                </Select.Trigger>

                <Select.Portal container={portalContainer ?? undefined}>
                  <Select.Positioner>
                    <Select.Popup>
                      <Select.List>
                        {frequencies.map((value) => (
                          <Select.Item key={value} value={value}>
                            <Select.ItemText>{value}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
            </Field.Root>
          ) : null}

          {showNextDate && dateRules !== false ? (
            <Field.Root>
              <Field.Label>
                {intl.formatMessage(messages.manageNextPayment)}
              </Field.Label>
              <Calendar
                mode="single"
                selected={nextDate}
                onSelect={setNextDate}
                startMonth={
                  "startMonth" in bounds ? bounds.startMonth : undefined
                }
                endMonth={"endMonth" in bounds ? bounds.endMonth : undefined}
                disabled={bounds.disabled}
              />
            </Field.Root>
          ) : null}

          {tokenHref ? (
            <a
              href={
                hasEndDate
                  ? undefined
                  : tokenLink(tokenHref, { sub_cancel: "true" })
              }
              aria-disabled={hasEndDate ? "true" : undefined}
            >
              {intl.formatMessage(messages.manageCancel)}
            </a>
          ) : null}

          {modifyHref ? (
            <a
              href={hasEnded ? undefined : modifyHref}
              aria-disabled={hasEnded ? "true" : undefined}
            >
              {intl.formatMessage(messages.manageModify)}
            </a>
          ) : null}

          {tokenHref ? (
            <a
              href={
                hasEnded
                  ? undefined
                  : tokenLink(tokenHref, {
                      cart: "checkout",
                      sub_restart: "auto",
                    })
              }
              aria-disabled={hasEnded ? "true" : undefined}
            >
              {intl.formatMessage(messages.manageUpdateBilling)}
            </a>
          ) : null}

          <Button type="button" onClick={handleSave} disabled={isBusy}>
            {intl.formatMessage(
              isBusy ? messages.manageSaving : messages.manageSave,
            )}
          </Button>

          <section>
            <SectionHeading>
              {intl.formatMessage(messages.subscriptionItemsHeading, {
                count: items.length,
              })}
            </SectionHeading>

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
                      <EditLink
                        href={tokenLink(tokenHref, {
                          cart: "checkout",
                          sub_restart: "auto",
                        })}
                      >
                        {intl.formatMessage(messages.addressEdit)}
                      </EditLink>
                    </PanelAction>
                  ) : null}
                </PanelRow>
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
                    // The customer is already looking at this subscription --
                    // there is nowhere else for a click to take them. The
                    // row's own Receipt link is the way out to the document,
                    // so the click target stays (rather than being removed)
                    // to avoid a row that looks clickable and isn't.
                    onOpen={() => {}}
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
        <Rail>{/* Task 8 */}</Rail>
      </Columns>
    </AccountPageLayout>
  );
}
