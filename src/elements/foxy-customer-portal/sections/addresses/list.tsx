import { useMemo } from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { useCollection, type FollowableLink } from "@/lib/customer-api";
import type { AccountPage } from "../../account-page";
import { messages } from "../../messages";
import { Pagination } from "../pagination";
import {
  PaymentMethod,
  type DefaultPaymentMethodResource,
} from "../payment-method";
import { AddressCard, formatFullAddress, type AddressResource } from "./card";

type CustomerWithLinks = {
  _links: Record<string, FollowableLink<never> & { href: string }>;
};

type Props = {
  customer: CustomerWithLinks;
  onNavigate: (page: AccountPage) => void;
};

/** No top-level `id` on this resource; the last segment of its self link is
 * the identifier the customer recognises. */
function addressId(address: AddressResource): string {
  return address._links.self.href.replace(/\/+$/, "").split("/").pop() ?? "";
}

const Heading = styled.h2`
  margin: 0 0 ${(props) => props.theme.tokens.space.lg};
  font: ${(props) => props.theme.tokens.font.h2};
  color: ${(props) => props.theme.tokens.color.body};
`;

const SubHeading = styled.h3`
  margin: 0 0 ${(props) => props.theme.tokens.space.md};
  font: ${(props) => props.theme.tokens.font.h3};
  color: ${(props) => props.theme.tokens.color.body};
`;

const Split = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${(props) => props.theme.tokens.space["2xl"]};
  margin-bottom: ${(props) => props.theme.tokens.space["2xl"]};

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const AddressSummary = styled.div`
  margin-bottom: ${(props) => props.theme.tokens.space.lg};
`;

const AddressLine = styled.p`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};

  &:first-of-type {
    color: ${(props) => props.theme.tokens.color.body};
  }
`;

const Empty = styled.p`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

export function BillingShippingSection({ customer, onNavigate }: Props) {
  const intl = useIntl();

  const addressesLink = customer._links["fx:customer_addresses"];
  const paymentMethodLink = customer._links["fx:default_payment_method"] as
    | (FollowableLink<DefaultPaymentMethodResource> & { href: string })
    | undefined;

  const query = useMemo(() => ({ limit: 10 }), []);

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
  } = useCollection<AddressResource>(addressesLink as never, query);

  const billingAddress = items.find((a) => a.is_default_billing) ?? null;
  const shippingAddress = items.find((a) => a.is_default_shipping) ?? null;

  // `items` is `[]` both before the read resolves and after it fails, which
  // would otherwise make `renderSummary()` claim "no address set" during a
  // load or an error -- a false negative, not a real answer. Only render the
  // summaries once the read has actually succeeded.
  const addressesLoaded = !isLoading && !error;

  function editAddress(address: AddressResource) {
    onNavigate({
      type: "address",
      id: addressId(address),
      resource: address,
    });
  }

  function renderSummary(
    address: AddressResource | null,
    heading: string,
    emptyMessage: string,
  ) {
    const name = address
      ? [address.first_name, address.last_name].filter(Boolean).join(" ") ||
        address.address_name
      : "";

    return (
      <AddressSummary>
        <SubHeading>{heading}</SubHeading>
        {address ? (
          <>
            <AddressLine>{name}</AddressLine>
            <AddressLine>{formatFullAddress(address)}</AddressLine>
            <Button
              type="button"
              $variant="outline"
              onClick={() => editAddress(address)}
            >
              {intl.formatMessage(messages.addressEdit)}
            </Button>
          </>
        ) : (
          <Empty>{emptyMessage}</Empty>
        )}
      </AddressSummary>
    );
  }

  return (
    <section>
      <Heading>{intl.formatMessage(messages.billingShippingHeading)}</Heading>

      <Split>
        <div>
          <PaymentMethod link={paymentMethodLink} />
        </div>

        <div>
          {addressesLoaded ? (
            <>
              {renderSummary(
                billingAddress,
                intl.formatMessage(messages.billingAddressHeading),
                intl.formatMessage(messages.noBillingAddress),
              )}
              {renderSummary(
                shippingAddress,
                intl.formatMessage(messages.shippingAddressHeading),
                intl.formatMessage(messages.noShippingAddress),
              )}
            </>
          ) : null}
        </div>
      </Split>

      {isLoading || isUnauthenticated ? <Skeleton /> : null}

      {error && !isUnauthenticated ? (
        <Alert.Root $variant="destructive">
          <Alert.Description>
            {intl.formatMessage(messages.errorUnknown)}
          </Alert.Description>
        </Alert.Root>
      ) : null}

      {items.map((address) => (
        <AddressCard
          key={address._links.self.href}
          address={address}
          onEdit={() => editAddress(address)}
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
