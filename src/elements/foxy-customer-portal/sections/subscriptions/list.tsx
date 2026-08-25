import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";
import { Alert } from "@foxy.io/design-system/alert";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import type { AccountPage } from "../../account-page";
import { messages } from "../../messages";
import { Pagination } from "../pagination";
import type { CartDisplayConfig } from "./cart-display-config";
import { SubscriptionCard, type SubscriptionResource } from "./card";

type CustomerWithLinks = {
  _links: Record<string, FollowableLink<never> & { href: string }>;
};

type Props = {
  customer: CustomerWithLinks;
  cartDisplayConfig?: CartDisplayConfig | null;
  onNavigate: (page: AccountPage) => void;
};

const Tabs = styled.div`
  display: flex;
  gap: ${(props) => props.theme.tokens.space.xl};
  border-bottom: ${(props) => props.theme.tokens.border.default};
  margin-bottom: ${(props) => props.theme.tokens.space.xl};
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $current: boolean }>`
  all: unset;
  display: inline-flex;
  white-space: nowrap;
  cursor: pointer;
  padding-bottom: ${(props) => props.theme.tokens.space.sm};
  font: ${(props) =>
    props.$current
      ? props.theme.tokens.font.bodyEmphasis
      : props.theme.tokens.font.body};
  color: ${(props) =>
    props.$current
      ? props.theme.tokens.color.primary
      : props.theme.tokens.color.secondary};
  border-bottom: 2px solid
    ${(props) => (props.$current ? props.theme.tokens.color.primary : "transparent")};
`;

const Heading = styled.h2`
  margin: 0 0 ${(props) => props.theme.tokens.space.lg};
  font: ${(props) => props.theme.tokens.font.h2};
  color: ${(props) => props.theme.tokens.color.body};
`;

/** The customer-scoped subscription resource has no top-level `id`; the last
 * segment of its self link is the identifier the customer recognises --
 * matching `subscription-page.tsx`'s own derivation. */
function subscriptionId(subscription: SubscriptionResource): string {
  return (
    subscription._links.self.href.replace(/\/+$/, "").split("/").pop() ?? ""
  );
}

export function SubscriptionsSection({
  customer,
  cartDisplayConfig,
  onNavigate,
}: Props) {
  const intl = useIntl();
  const [showActive, setShowActive] = useState(true);

  const link = customer._links["fx:subscriptions"];

  // Both states are separate server-side queries. Partitioning one result set
  // in the browser would make `total_items` describe the wrong collection.
  const query = useMemo(
    () => ({
      filters: [`is_active=${showActive}`],
      zoom: "transaction_template:items",
      limit: 10,
    }),
    [showActive],
  );

  const {
    items,
    error,
    isLoading,
    isUnauthenticated,
    totalItems,
    offset,
    limit,
    loadNext,
    loadPrev,
    goToPage,
  } = useCollection<SubscriptionResource>(link as never, query);

  const activeCountQuery = useMemo(
    () => ({ filters: ["is_active=true"], limit: 1 }),
    [],
  );
  const inactiveCountQuery = useMemo(
    () => ({ filters: ["is_active=false"], limit: 1 }),
    [],
  );
  const { totalItems: activeCount } = useCollection<SubscriptionResource>(
    link as never,
    activeCountQuery,
  );
  const { totalItems: inactiveCount } = useCollection<SubscriptionResource>(
    link as never,
    inactiveCountQuery,
  );

  function goToSubscription(subscription: SubscriptionResource) {
    onNavigate({
      type: "subscription",
      id: subscriptionId(subscription),
      resource: subscription,
    });
  }

  const toggle = (
    <Tabs>
      <Tab
        type="button"
        $current={showActive}
        onClick={() => setShowActive(true)}
      >
        {intl.formatMessage(messages.subscriptionsActive, {
          count: activeCount,
        })}
      </Tab>
      <Tab
        type="button"
        $current={!showActive}
        onClick={() => setShowActive(false)}
      >
        {intl.formatMessage(messages.subscriptionsInactive, {
          count: inactiveCount,
        })}
      </Tab>
    </Tabs>
  );

  return (
    <section>
      <Heading>{intl.formatMessage(messages.subscriptionsHeading)}</Heading>
      {toggle}

      {isLoading || isUnauthenticated ? <Skeleton /> : null}

      {error && !isUnauthenticated ? (
        <Alert.Root $variant="destructive">
          <Alert.Description>
            {intl.formatMessage(messages.errorUnknown)}
          </Alert.Description>
        </Alert.Root>
      ) : null}

      {items.map((subscription) => (
        <SubscriptionCard
          key={subscription._links.self.href}
          subscription={subscription}
          cartDisplayConfig={cartDisplayConfig}
          onManage={() => goToSubscription(subscription)}
          onNavigate={onNavigate}
        />
      ))}

      {totalItems > limit ? (
        <Pagination
          offset={offset}
          limit={limit}
          totalItems={totalItems}
          onGoToPage={goToPage}
          onPrev={loadPrev}
          onNext={loadNext}
        />
      ) : null}
    </section>
  );
}
