import { ArrowRight } from "lucide-react";
import { FormattedNumber, useIntl } from "react-intl";
import styled from "styled-components";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Separator } from "@foxy.io/design-system/separator";
import type { AccountPage } from "../../account-page";
import { toCalendarDate } from "../../calendar-date";
import { useResource, type FollowableLink } from "@/lib/customer-api";
import { messages } from "../../messages";
import { groupSubscriptionItems, type SubscriptionTemplateItem } from "./item-grouping";
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
  _links: { self: { href: string } } & Record<
    string,
    (FollowableLink<OrderResource> & { href: string }) | { href: string }
  >;
  _embedded?: {
    "fx:transaction_template"?: {
      currency_code?: string;
      total_order?: number;
      _embedded?: { "fx:items"?: SubscriptionTemplateItem[] };
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

const Card = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${(props) => props.theme.tokens.space.lg};
  padding: ${(props) => props.theme.tokens.space.xl};
  background: ${(props) => props.theme.tokens.background.surface};
  border: ${(props) => props.theme.tokens.border.default};
  border-radius: ${(props) => props.theme.tokens.borderRadius.md};
`;

const Thumbnails = styled.div<{ $multi: boolean }>`
  flex-shrink: 0;
  width: 6rem;
  height: 6rem;
  display: grid;
  grid-template-columns: ${(props) => (props.$multi ? "repeat(2, 1fr)" : "1fr")};
  gap: ${(props) => props.theme.tokens.space.xs};
`;

const Thumbnail = styled.div`
  width: 100%;
  height: 100%;
  border-radius: ${(props) => props.theme.tokens.borderRadius.sm};
  background: ${(props) => props.theme.tokens.background.itemHighlighted};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 220px;
  min-width: 220px;
  gap: ${(props) => props.theme.tokens.space.md};
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${(props) => props.theme.tokens.space.sm};
`;

const Title = styled.div`
  font: ${(props) => props.theme.tokens.font.h3};
  color: ${(props) => props.theme.tokens.color.body};
`;

const Price = styled.div`
  font: ${(props) => props.theme.tokens.font.h3};
  color: ${(props) => props.theme.tokens.color.body};
`;

const Frequency = styled.div`
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const ChildList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ChildLine = styled.div`
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: ${(props) => props.theme.tokens.space.md};
`;

const CellLabel = styled.div`
  font: ${(props) => props.theme.tokens.font.bodySmall};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const CellValue = styled.div<{ $error?: boolean }>`
  font: ${(props) => props.theme.tokens.font.bodyEmphasis};
  color: ${(props) =>
    props.$error ? props.theme.tokens.color.error : props.theme.tokens.color.body};
`;

const ManageSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
`;

function itemLabel(item: SubscriptionTemplateItem): string {
  return item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name;
}

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

  const { parents, children } = groupSubscriptionItems(items);
  const isBundle = parents.length === 1 && children.length > 0;
  const titleText = isBundle
    ? parents[0].name
    : items.map(itemLabel).join(", ");

  const thumbnailItems = items.slice(0, 4);
  const isMultiItem = thumbnailItems.length > 1;

  const startDate = toCalendarDate(subscription.start_date);
  const nextDate = toCalendarDate(subscription.next_transaction_date);
  const endDate = toCalendarDate(subscription.end_date);

  const showStartDate =
    (cartDisplayConfig?.show_sub_startdate ?? true) && startDate !== null;
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

  // Assumes the SDK enriches `fx:last_transaction` with a working `.get()`
  // the same way it enriches every other link on a resource it returns
  // (see `account.tsx`'s doc comment on `CustomerLinks`) -- including on a
  // subscription reached through a *collection* page's embedded items, not
  // only a top-level `useResource` result. This has not been verified
  // against a live store from inside this element specifically; if the
  // Storybook/manual verification step at the end of this plan shows the
  // Last Payment cell never appearing even for a subscription with real
  // payment history, this assumption is the first thing to check.
  const lastTransactionLink = subscription._links["fx:last_transaction"] as
    | (FollowableLink<OrderResource> & { href: string })
    | undefined;
  const { data: lastTransaction } = useResource<OrderResource>(
    lastTransactionLink ?? null,
  );
  const lastPaymentDate = lastTransaction
    ? toCalendarDate(lastTransaction.transaction_date)
    : null;

  const manageButtonVariant = subscription.is_active ? "default" : "outline";

  return (
    <Card>
      <Thumbnails $multi={isMultiItem}>
        {thumbnailItems.map((item, index) => (
          <Thumbnail key={`${item.name}-${index}`}>
            {item.image ? <img src={item.image} alt="" loading="lazy" /> : null}
          </Thumbnail>
        ))}
      </Thumbnails>

      <Body>
        <TitleRow>
          <Title>{titleText}</Title>
          {template?.total_order !== undefined ? (
            <Price>
              <FormattedNumber
                value={template.total_order}
                style="currency"
                currency={template.currency_code ?? "USD"}
              />
            </Price>
          ) : null}
        </TitleRow>

        {showFrequency ? (
          <Frequency>
            {intl.formatMessage(messages.subscriptionFrequency, {
              frequency: subscription.frequency,
            })}
          </Frequency>
        ) : null}

        {subscription.error_message ? (
          <Alert.Root $variant="destructive">
            <Alert.Description>{subscription.error_message}</Alert.Description>
          </Alert.Root>
        ) : null}

        {isBundle ? (
          <ChildList>
            {children.map((child, index) => (
              <ChildLine key={`${child.name}-${index}`}>
                {itemLabel(child)}
              </ChildLine>
            ))}
          </ChildList>
        ) : null}

        <Separator />

        <InfoGrid>
          {lastPaymentDate ? (
            <div>
              <CellLabel>
                {intl.formatMessage(messages.subscriptionLastPayment)}
              </CellLabel>
              <CellValue>
                {intl.formatDate(lastPaymentDate, { dateStyle: "medium" })}{" "}
                <Button
                  type="button"
                  $variant="link"
                  onClick={() =>
                    onNavigate({
                      type: "order",
                      id: String(lastTransaction!.id),
                      resource: lastTransaction!,
                    })
                  }
                >
                  {intl.formatMessage(messages.subscriptionLastPaymentView)}
                </Button>
              </CellValue>
            </div>
          ) : null}

          {showStartDate ? (
            <div>
              <CellLabel>
                {intl.formatMessage(messages.subscriptionStartDate)}
              </CellLabel>
              <CellValue>
                {intl.formatDate(startDate!, { dateStyle: "medium" })}
              </CellValue>
            </div>
          ) : null}

          {showNextDate ? (
            <div>
              <CellLabel>
                {intl.formatMessage(messages.subscriptionNextPayment)}
              </CellLabel>
              <CellValue>
                {intl.formatDate(nextDate!, { dateStyle: "medium" })}
              </CellValue>
            </div>
          ) : null}

          {showEndDate ? (
            <div>
              <CellLabel>
                {intl.formatMessage(
                  endIsFuture
                    ? messages.subscriptionCancels
                    : messages.subscriptionEnded,
                )}
              </CellLabel>
              <CellValue $error>
                {intl.formatDate(endDate!, { dateStyle: "medium" })}
              </CellValue>
            </div>
          ) : null}

          <div>
            <CellLabel>{intl.formatMessage(messages.subscriptionId)}</CellLabel>
            <CellValue>
              {subscription._links.self.href.replace(/\/+$/, "").split("/").pop()}
            </CellValue>
          </div>

          <ManageSlot>
            <Button type="button" $variant={manageButtonVariant} onClick={onManage}>
              {intl.formatMessage(messages.subscriptionManage)} <ArrowRight size={16} />
            </Button>
          </ManageSlot>
        </InfoGrid>
      </Body>
    </Card>
  );
}
