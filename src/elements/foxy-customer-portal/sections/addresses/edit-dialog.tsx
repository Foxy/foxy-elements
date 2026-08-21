import { useId, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { Select } from "@foxy.io/design-system/select";
import { WriteError, useApi } from "@/lib/customer-api";
import { messages } from "../../messages";
import { PortalDialog } from "../../portal-dialog";
import { usePortalContainer } from "../../portal-container";
import { patchResource } from "../../write";
import { COUNTRIES } from "./countries";
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
  const countryId = useId();
  const regionId = useId();
  const portalContainer = usePortalContainer();

  const [addressName, setAddressName] = useState(address.address_name);
  const [firstName, setFirstName] = useState(address.first_name);
  const [lastName, setLastName] = useState(address.last_name);
  const [company, setCompany] = useState(address.company);
  const [phone, setPhone] = useState(address.phone);
  const [address1, setAddress1] = useState(address.address1);
  const [address2, setAddress2] = useState(address.address2);
  const [city, setCity] = useState(address.city);
  const [postalCode, setPostalCode] = useState(address.postal_code);
  const [country, setCountry] = useState(address.country);
  const [region, setRegion] = useState(address.region);
  const [isBusy, setIsBusy] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.code === country);
  const hasRegionList = (selectedCountry?.regions.length ?? 0) > 0;

  // Without an `items` map, Base UI's closed-trigger `Select.Value` falls
  // back to rendering the raw stored value (the country/region code)
  // instead of looking up its display name.
  const countryItems = useMemo(
    () => Object.fromEntries(COUNTRIES.map((c) => [c.code, c.name])),
    [],
  );

  const regionItems = useMemo(
    () =>
      Object.fromEntries(
        (selectedCountry?.regions ?? []).map((r) => [r.code, r.name]),
      ),
    [selectedCountry],
  );

  // A customer switching e.g. US -> Canada must not keep a stale US state
  // code silently mislabeled as a Canadian province -- v1's AddressForm.ts:49
  // does the same reset for the same reason.
  function handleCountryChange(next: string | null) {
    if (!next) return;
    setCountry(next);
    setRegion("");
  }

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
        country,
        region,
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
            required
            maxLength={100}
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
            maxLength={50}
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
            maxLength={50}
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
            maxLength={50}
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
            maxLength={50}
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
            required
            maxLength={100}
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
            maxLength={100}
            value={address2}
            onChange={(event) => setAddress2(event.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={countryId}>
            {intl.formatMessage(messages.addressCountry)}
          </Field.Label>
          <Select.Root
            value={country}
            onValueChange={handleCountryChange}
            items={countryItems}
          >
            <Select.Trigger id={countryId}>
              <Select.Value />
            </Select.Trigger>
            {/* Select.Portal defaults to <body>, which is outside this
                element's shadow root -- the popup would render unstyled.
                `?? undefined` because Base UI reads an explicit null as
                "container unresolved" and never renders. */}
            <Select.Portal container={portalContainer ?? undefined}>
              <Select.Positioner>
                <Select.Popup>
                  <Select.List>
                    {COUNTRIES.map((c) => (
                      <Select.Item key={c.code} value={c.code}>
                        <Select.ItemText>{c.name}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={regionId}>
            {intl.formatMessage(messages.addressRegion)}
          </Field.Label>
          {hasRegionList ? (
            <Select.Root
              value={region}
              onValueChange={(next: string | null) => next && setRegion(next)}
              items={regionItems}
            >
              <Select.Trigger id={regionId}>
                <Select.Value
                  placeholder={intl.formatMessage(
                    messages.addressRegionPlaceholder,
                  )}
                />
              </Select.Trigger>
              <Select.Portal container={portalContainer ?? undefined}>
                <Select.Positioner>
                  <Select.Popup>
                    <Select.List>
                      {selectedCountry!.regions.map((r) => (
                        <Select.Item key={r.code} value={r.code}>
                          <Select.ItemText>{r.name}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          ) : (
            <Input
              id={regionId}
              type="text"
              autoComplete="address-level1"
              maxLength={50}
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            />
          )}
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={cityId}>
            {intl.formatMessage(messages.addressCity)}
          </Field.Label>
          <Input
            id={cityId}
            type="text"
            autoComplete="address-level2"
            maxLength={50}
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
            maxLength={50}
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
