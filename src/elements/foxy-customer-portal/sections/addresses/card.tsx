import { useIntl } from "react-intl";
import styled from "styled-components";
import { Badge } from "@foxy.io/design-system/badge";
import { Button } from "@foxy.io/design-system/button";
import { COUNTRIES } from "./countries";
import { messages } from "../../messages";

export type AddressResource = {
  address_name: string;
  first_name: string;
  last_name: string;
  company: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  is_default_billing: boolean;
  is_default_shipping: boolean;
  date_created: string;
  date_modified: string;
  _links: { self: { href: string } } & Record<
    string,
    { href: string } | undefined
  >;
};

const isFilled = (part: string | undefined): part is string =>
  !!part && part.trim().length > 0;

export type AddressLines = {
  name: string;
  line1: string;
  cityStateZip: string;
  country: string;
};

/**
 * The same address `formatFullAddress` joins into one line, kept as the four
 * separate lines a postal address is normally written on. The summary in
 * Billing & Shipping shows it this way; the cards in the list below still use
 * the joined form, and both resolve region and country codes through
 * `COUNTRIES` here so they never disagree about what "IL" is called.
 */
export function formatAddressLines(address: AddressResource): AddressLines {
  const country = COUNTRIES.find((c) => c.code === address.country);
  const region =
    country?.regions.find((r) => r.code === address.region)?.name ??
    address.region;
  const fullName = [address.first_name, address.last_name]
    .filter(isFilled)
    .join(" ");
  const cityAndRegion = [address.city, region].filter(isFilled).join(", ");

  return {
    name: fullName || address.address_name,
    line1: [address.address1, address.address2].filter(isFilled).join(", "),
    cityStateZip: [cityAndRegion, address.postal_code]
      .filter(isFilled)
      .join(" "),
    country: country?.name ?? address.country,
  };
}

export function formatFullAddress(address: AddressResource): string {
  const country = COUNTRIES.find((c) => c.code === address.country);
  const region =
    country?.regions.find((r) => r.code === address.region)?.name ??
    address.region;

  return [
    address.address1,
    address.address2,
    address.city,
    region,
    address.postal_code,
  ]
    .filter((part) => part && part.trim().length > 0)
    .join(", ");
}

type Props = { address: AddressResource; onEdit: () => void };

// Matches the card treatment the rest of the page uses (payment method,
// subscriptions) rather than the DS Item primitive it used before, which
// carried its own spacing and left this list looking like a leftover from
// the previous design.
const Card = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.tokens.space.md};
  padding: 14px 16px;
  border: ${(props) => props.theme.tokens.border.field};
  border-radius: ${(props) => props.theme.tokens.borderRadius.md};
  background: ${(props) => props.theme.tokens.background.surface};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1 1 220px;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.tokens.space.sm};
  font: ${(props) => props.theme.tokens.font.label};
  color: ${(props) => props.theme.tokens.color.body};
`;

const Line = styled.div`
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const Actions = styled.div`
  flex-shrink: 0;
  align-self: center;
`;

export function AddressCard({ address, onEdit }: Props) {
  const intl = useIntl();
  const fullName = [address.first_name, address.last_name]
    .filter((part) => part && part.trim().length > 0)
    .join(" ");
  const fullAddress = formatFullAddress(address);
  // The title falls back through address_name -> fullName -> fullAddress.
  // Whichever one wins the title must not also repeat as its own
  // description line below -- see 56c7c951, which fixed this exact class of
  // duplicate-text bug for SubscriptionCard's status badge/description pair.
  const title = address.address_name || fullName || fullAddress;

  return (
    <Card>
      <Content>
        <Title>
          {title}
          {address.is_default_billing ? (
            <Badge $variant="secondary">
              {intl.formatMessage(messages.addressDefaultBilling)}
            </Badge>
          ) : null}
          {address.is_default_shipping ? (
            <Badge $variant="secondary">
              {intl.formatMessage(messages.addressDefaultShipping)}
            </Badge>
          ) : null}
        </Title>

        {fullName && title !== fullName ? <Line>{fullName}</Line> : null}
        {title !== fullAddress ? <Line>{fullAddress}</Line> : null}
        {address.company ? <Line>{address.company}</Line> : null}
        {address.phone ? <Line>{address.phone}</Line> : null}
      </Content>

      <Actions>
        <Button type="button" $variant="outline" $size="sm" onClick={onEdit}>
          {intl.formatMessage(messages.addressEdit)}
        </Button>
      </Actions>
    </Card>
  );
}
