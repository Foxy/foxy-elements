import { useIntl } from "react-intl";
import { Badge } from "@foxy.io/design-system/badge";
import { Button } from "@foxy.io/design-system/button";
import { Item } from "@foxy.io/design-system/item";
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
    <Item.Root $variant="outline">
      <Item.Content>
        <Item.Title>{title}</Item.Title>
        {fullName && title !== fullName ? (
          <Item.Description>{fullName}</Item.Description>
        ) : null}
        {title !== fullAddress ? (
          <Item.Description>{fullAddress}</Item.Description>
        ) : null}
        {address.company ? (
          <Item.Description>{address.company}</Item.Description>
        ) : null}
        {address.phone ? (
          <Item.Description>{address.phone}</Item.Description>
        ) : null}
      </Item.Content>

      <Item.Actions>
        {address.is_default_billing ? (
          <Badge>{intl.formatMessage(messages.addressDefaultBilling)}</Badge>
        ) : null}
        {address.is_default_shipping ? (
          <Badge>{intl.formatMessage(messages.addressDefaultShipping)}</Badge>
        ) : null}
        <Button type="button" onClick={onEdit}>
          {intl.formatMessage(messages.addressEdit)}
        </Button>
      </Item.Actions>
    </Item.Root>
  );
}
