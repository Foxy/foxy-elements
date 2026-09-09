import { useState } from "react";
import { ExternalLink } from "lucide-react";
import styled from "styled-components";
import { FormattedNumber, useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Badge } from "@foxy.io/design-system/badge";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import type { FollowableLink } from "@/lib/customer-api";
import { messages } from "../../messages";
import { AccountPageLayout } from "../../account-page-layout";
import { toCalendarDate } from "../../calendar-date";
import {
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
  Rail,
  RailCard,
  RailList,
  RailRow,
  RailTitle,
  RailTotalRow,
  SectionHeading,
  TitleLine,
} from "../../detail-page-layout";
import {
  getTransactionStatusMessage,
  getTransactionStatusVariant,
} from "../../transaction-status";
import type { CartDisplayConfig } from "../subscriptions/cart-display-config";
// Both imported across sections rather than copied: they read fields of
// `fx:item`, which is one resource type shared by a transaction's items and a
// subscription template's (see `line-items.ts`). The subscription page is
// simply where they were first needed.
import { groupItemsByShipment } from "../../line-items";
import { frequencyLabel } from "../subscriptions/frequency-label";
import { visibleItemDetails } from "../subscriptions/item-details";
import { Pagination } from "../pagination";
import {
  OrderBillingShipping,
  useOrderShipments,
} from "./billing-shipping";
import { useOrderById } from "./use-order-by-id";
import type { OrderResource } from "./row";

// A plain inline link rather than the subscription page's bordered `LinkOut`:
// that control sits beside a section heading as a button-shaped affordance,
// while this one is the last line of the totals rail.
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
 * Higher than the subscription page's three: an order is a whole cart, so ten
 * lines is a normal size rather than an unusual one, and paging at three
 * would turn most orders into a pager. Ten still keeps a 30-item order from
 * rendering as one very long page.
 */
const ITEMS_PER_PAGE = 10;

// A destination's name above its lines. `h3` sits under the section's own
// `h2` ("Items (4)"), so the page's heading outline stays in order.
const GroupHeading = styled.h3`
  margin: 0 0 10px;
  font: ${(props) => props.theme.tokens.font.label};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  & + & {
    margin-top: 24px;
  }
`;

type CollectionPage = {
  total_items?: number;
  _embedded?: Record<string, unknown[]>;
};

type ContainerProps = {
  id: string;
  resource?: OrderResource;
  ordersLink: FollowableLink<CollectionPage> | null;
  /**
   * The store's `cart_display_config`, from the same `customer_portal_settings`
   * response the subscription page already reads. `null`/`undefined` means
   * every flag defaults to `true` -- see `visibleItemDetails`.
   */
  cartDisplayConfig?: CartDisplayConfig | null;
  onBack: () => void;
};

/**
 * Resolves `resource` when navigation didn't already carry it -- same
 * pattern as `subscriptions/subscription-page.tsx`'s
 * `SubscriptionPageContainer`.
 */
export function OrderPageContainer({
  id,
  resource,
  ordersLink,
  cartDisplayConfig,
  onBack,
}: ContainerProps) {
  const intl = useIntl();
  const fetched = useOrderById(resource ? null : ordersLink, id);
  const order = resource ?? fetched.order;

  if (!resource && (fetched.isLoading || fetched.isUnauthenticated)) {
    return (
      <AccountPageLayout onBack={onBack}>
        <Skeleton />
      </AccountPageLayout>
    );
  }

  if (!order) {
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
    <OrderPage
      order={order}
      cartDisplayConfig={cartDisplayConfig}
      onBack={onBack}
    />
  );
}

type Props = {
  order: OrderResource;
  cartDisplayConfig?: CartDisplayConfig | null;
  onBack: () => void;
};

export function OrderPage({ order, cartDisplayConfig, onBack }: Props) {
  const intl = useIntl();
  const items = order._embedded?.["fx:items"] ?? [];
  const receiptHref = order._links["fx:receipt"]?.href;
  const currency = order.currency_code;

  const [itemPage, setItemPage] = useState(1);
  const itemOffset = (itemPage - 1) * ITEMS_PER_PAGE;
  const visibleItems = items.slice(itemOffset, itemOffset + ITEMS_PER_PAGE);

  // Whether this order is multiship is a fact about the WHOLE order, decided
  // once from every line; the grouping then covers only the page on screen.
  // Deciding it per page instead would drop the headings from any page whose
  // ten lines happen to share one destination -- the customer would then see
  // a grouped page one and an ungrouped page two of the same order.
  //
  // Groups keep the full order's destination order, and a group with nothing
  // on this page is dropped rather than rendered as an empty heading.
  const visible = new Set(visibleItems);
  const shipmentGroups = groupItemsByShipment(items)
    ?.map((group) => ({
      shipto: group.shipto,
      items: group.items.filter((item) => visible.has(item)),
    }))
    .filter((group) => group.items.length > 0);

  // Same request the Billing & shipping panel makes -- `RequestCache` hands
  // both hooks one entry, so this costs no extra fetch.
  const shipments = useOrderShipments(order);

  // Per-destination lines replace the single combined figure once an order
  // ships to more than one place: printing both would put $12.00 beside the
  // $4.00 and $8.00 that make it up.
  //
  // Keyed on how many shipments came back, not on whether the ITEMS look
  // multiship: the rail lists shipment costs, so the shipments are the honest
  // source. While the request is in flight this is 0, so the rail shows the
  // order-level figure -- always available, always correct -- and swaps once
  // the parts arrive, rather than leaving a gap where a total should be.
  const perDestinationShipping = shipments.items.length > 1;

  const date = toCalendarDate(order.transaction_date);
  const statusMessage = getTransactionStatusMessage(order.status);
  const statusVariant = getTransactionStatusVariant(order.status);

  /**
   * One item card. Shared by the flat list and the grouped one so the two
   * presentations can never drift -- only how they are arranged differs.
   *
   * `index` is the item's offset within the whole order, not within its
   * group, so keys stay stable across pages and groups.
   */
  function renderItem(item: (typeof items)[number], index: number) {
    // A non-empty `subscription_frequency` means this line started
    // or renewed a subscription. An unparseable one falls back to
    // no marker at all rather than naming a period it cannot
    // read -- the same rule `frequencyLabel` documents.
    const frequency = item.subscription_frequency
      ? frequencyLabel(item.subscription_frequency)
      : null;

    return (
      <ItemCard key={`${item.name}-${index}`}>
        <ItemThumb>
          {item.image ? <img src={item.image} alt="" loading="lazy" /> : null}
        </ItemThumb>

        <ItemBody>
          <ItemName>{item.name}</ItemName>

          {frequency ? (
            <div>
              <Badge>
                {intl.formatMessage(messages.orderItemSubscription, {
                  frequency: intl.formatMessage(frequency.message, {
                    count: frequency.count,
                  }),
                })}
              </Badge>
            </div>
          ) : null}

          <DetailRow>
            <span>
              {intl.formatMessage(messages.orderItemQuantity, {
                quantity: item.quantity,
                // `price` is optional on the shared `LineItem`
                // type, so a response that omits it formats as a
                // zero rather than as the "NaN"
                // `formatNumber(undefined)` would print.
                price: intl.formatNumber(item.price ?? 0, {
                  style: "currency",
                  currency,
                }),
              })}
            </span>
          </DetailRow>

          {visibleItemDetails(item, cartDisplayConfig).map((row, i) => (
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
          ))}
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
    );
  }

  return (
    <AccountPageLayout onBack={onBack}>
      <HeaderRow>
        <div>
          <TitleLine>
            <PageTitle>
              {intl.formatMessage(messages.orderDetailHeading, {
                id: order.display_id,
              })}
            </PageTitle>

            <Badge $variant={statusVariant}>
              {statusMessage ? intl.formatMessage(statusMessage) : order.status}
            </Badge>
          </TitleLine>

          {date ? (
            <Note>{intl.formatDate(date, { dateStyle: "medium" })}</Note>
          ) : null}
        </div>
      </HeaderRow>

      <Columns>
        <Main>
          <section>
            <SectionHeading>
              {intl.formatMessage(messages.orderItemsHeading, {
                count: items.length,
              })}
            </SectionHeading>

            {shipmentGroups ? (
              shipmentGroups.map((group) => (
                <Group key={group.shipto || "unshipped"}>
                  {/* No heading for the unshipped group: those lines go
                      nowhere, so naming a destination would invent one. */}
                  {group.shipto ? (
                    <GroupHeading>{group.shipto}</GroupHeading>
                  ) : null}

                  {group.items.map((item) =>
                    renderItem(item, items.indexOf(item)),
                  )}
                </Group>
              ))
            ) : (
              <CardList>
                {visibleItems.map((item, index) =>
                  renderItem(item, itemOffset + index),
                )}
              </CardList>
            )}

            {items.length > ITEMS_PER_PAGE ? (
              <Pagination
                offset={itemOffset}
                limit={ITEMS_PER_PAGE}
                totalItems={items.length}
                onGoToPage={setItemPage}
                onPrev={() => setItemPage((page) => Math.max(1, page - 1))}
                onNext={() =>
                  setItemPage((page) =>
                    Math.min(
                      Math.ceil(items.length / ITEMS_PER_PAGE),
                      page + 1,
                    ),
                  )
                }
              />
            ) : null}
          </section>

          {/* Renders nothing when the order carries no shipment and no
              labellable payment -- an older API response, or a digital order
              with a gateway this cannot name. */}
          <OrderBillingShipping order={order} />
        </Main>

        <Rail>
          <RailCard>
            <RailTitle>
              {intl.formatMessage(messages.orderSummaryHeading)}
            </RailTitle>

            <RailList>
              <RailRow>
                <span>{intl.formatMessage(messages.orderItemsTotal)}</span>
                <span>
                  <FormattedNumber
                    value={Number(order.total_item_price)}
                    style="currency"
                    currency={currency}
                  />
                </span>
              </RailRow>

              <RailRow>
                <span>{intl.formatMessage(messages.orderTax)}</span>
                <span>
                  <FormattedNumber
                    value={Number(order.total_tax)}
                    style="currency"
                    currency={currency}
                  />
                </span>
              </RailRow>

              {perDestinationShipping ? (
                shipments.items.map((shipment, index) => (
                  <RailRow key={`shipping-${index}`}>
                    <span>
                      {intl.formatMessage(messages.orderShippingTo, {
                        destination: shipment.address_name,
                      })}
                    </span>
                    <span>
                      <FormattedNumber
                        value={shipment.total_shipping ?? 0}
                        style="currency"
                        currency={currency}
                      />
                    </span>
                  </RailRow>
                ))
              ) : (
                <RailRow>
                  <span>{intl.formatMessage(messages.orderShipping)}</span>
                  <span>
                    <FormattedNumber
                      value={Number(order.total_shipping)}
                      style="currency"
                      currency={currency}
                    />
                  </span>
                </RailRow>
              )}

              {/* Its own authoritative figure, not a sum of the three above --
                  see `RailTotalRow`'s doc comment for why that distinction is
                  load-bearing. */}
              <RailTotalRow>
                <span>{intl.formatMessage(messages.orderTotal)}</span>
                <span>
                  <FormattedNumber
                    value={order.total_order}
                    style="currency"
                    currency={currency}
                  />
                </span>
              </RailTotalRow>
            </RailList>

            {receiptHref ? (
              <ReceiptLink href={receiptHref} target="_blank" rel="noreferrer">
                {intl.formatMessage(messages.orderReceipt)}{" "}
                <ExternalLink size={14} />
              </ReceiptLink>
            ) : null}
          </RailCard>
        </Rail>
      </Columns>
    </AccountPageLayout>
  );
}
