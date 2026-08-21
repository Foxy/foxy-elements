import { useId, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { WriteError, useApi } from "@/lib/customer-api";
import { messages } from "../../messages";
import { PortalDialog } from "../../portal-dialog";
import { patchResource } from "../../write";
import type { AddressResource } from "./card";

type Props = {
  address: AddressResource;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export function AddressEditDialog({ address, open, onClose, onSaved }: Props) {
  const intl = useIntl();
  const { onUnauthenticated } = useApi();
  const labelId = useId();
  const firstNameId = useId();
  const lastNameId = useId();
  const companyId = useId();
  const phoneId = useId();
  const line1Id = useId();
  const line2Id = useId();
  const cityId = useId();
  const postalCodeId = useId();

  const [addressName, setAddressName] = useState(address.address_name);
  const [firstName, setFirstName] = useState(address.first_name);
  const [lastName, setLastName] = useState(address.last_name);
  const [company, setCompany] = useState(address.company);
  const [phone, setPhone] = useState(address.phone);
  const [address1, setAddress1] = useState(address.address1);
  const [address2, setAddress2] = useState(address.address2);
  const [city, setCity] = useState(address.city);
  const [postalCode, setPostalCode] = useState(address.postal_code);
  const [isBusy, setIsBusy] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsBusy(true);
    setHasFailed(false);

    try {
      // Every field here is one this form lets the customer edit. Neither
      // `is_default_billing` nor `is_default_shipping` is a state variable
      // above, so there is no way for this object to carry either -- that's
      // what makes an unconditional full-object PATCH safe for this dialog
      // specifically (see the plan's Global Constraints).
      await patchResource(address._links.self as never, {
        address_name: addressName,
        first_name: firstName,
        last_name: lastName,
        company,
        phone,
        address1,
        address2,
        city,
        postal_code: postalCode,
      });

      onSaved?.();
      onClose();
    } catch (caught) {
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
    <PortalDialog
      open={open}
      onOpenChange={(next: boolean) => !next && onClose()}
      title={intl.formatMessage(messages.addressEditHeading)}
    >
      <form onSubmit={handleSubmit}>
        {hasFailed ? (
          <Alert.Root $variant="destructive">
            <Alert.Description>
              {intl.formatMessage(messages.errorUnknown)}
            </Alert.Description>
          </Alert.Root>
        ) : null}

        <Field.Root>
          <Field.Label htmlFor={labelId}>
            {intl.formatMessage(messages.addressLabel)}
          </Field.Label>
          <Input
            id={labelId}
            type="text"
            value={addressName}
            onChange={(event) => setAddressName(event.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={firstNameId}>
            {intl.formatMessage(messages.addressFirstName)}
          </Field.Label>
          <Input
            id={firstNameId}
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={lastNameId}>
            {intl.formatMessage(messages.addressLastName)}
          </Field.Label>
          <Input
            id={lastNameId}
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={companyId}>
            {intl.formatMessage(messages.addressCompany)}
          </Field.Label>
          <Input
            id={companyId}
            type="text"
            autoComplete="organization"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={phoneId}>
            {intl.formatMessage(messages.addressPhone)}
          </Field.Label>
          <Input
            id={phoneId}
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={line1Id}>
            {intl.formatMessage(messages.addressLine1)}
          </Field.Label>
          <Input
            id={line1Id}
            type="text"
            autoComplete="address-line1"
            value={address1}
            onChange={(event) => setAddress1(event.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={line2Id}>
            {intl.formatMessage(messages.addressLine2)}
          </Field.Label>
          <Input
            id={line2Id}
            type="text"
            autoComplete="address-line2"
            value={address2}
            onChange={(event) => setAddress2(event.target.value)}
          />
        </Field.Root>

        {/* Task 4 inserts the country and region controls here, between
            address line 2 and city -- matching v1's AddressForm field order. */}

        <Field.Root>
          <Field.Label htmlFor={cityId}>
            {intl.formatMessage(messages.addressCity)}
          </Field.Label>
          <Input
            id={cityId}
            type="text"
            autoComplete="address-level2"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={postalCodeId}>
            {intl.formatMessage(messages.addressPostalCode)}
          </Field.Label>
          <Input
            id={postalCodeId}
            type="text"
            autoComplete="postal-code"
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
          />
        </Field.Root>

        <Button type="submit" disabled={isBusy}>
          {intl.formatMessage(
            isBusy ? messages.addressSaving : messages.addressSave,
          )}
        </Button>

        <Button type="button" $variant="outline" onClick={onClose}>
          {intl.formatMessage(messages.addressCancel)}
        </Button>
      </form>
    </PortalDialog>
  );
}
