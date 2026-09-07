import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { Select } from "@foxy.io/design-system/select";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import {
  useApi,
  useResource,
  WriteError,
  type FollowableLink,
} from "@/lib/customer-api";
import {
  loadRegionMessages,
  toCountryOptions,
  toRegionOptions,
} from "@foxy.io/sdk/checkout";
import { messages } from "../../messages";
import { AccountPageLayout } from "../../account-page-layout";
import { Actions, Form, Pair } from "../../form-layout";
import { ADDRESS_FIELD_LIMITS } from "../../field-constraints";
import { usePortalContainer } from "../../portal-container";
import { useFieldValidation } from "../../use-field-validation";
import { patchResource } from "../../write";
import {
  addressTypeFor,
  codesFrom,
  withSavedCode,
  type CountryOptionsLink,
  type RegionOptionsLink,
} from "./address-options";
import type { AddressResource } from "./card";
import { useAddressById } from "./use-address-by-id";

/**
 * The five region labels Foxy uses, keyed by a country's `regions_type`.
 *
 * `""` covers both a country with no `regions_type` and one the API has not
 * classified, and resolves to the generic "Region" -- the label this form
 * used for every country before the store's own lists were available.
 */
const REGION_LABELS: Record<string, (typeof messages)[keyof typeof messages]> = {
  state: messages.addressRegionState,
  province: messages.addressRegionProvince,
  county: messages.addressRegionCounty,
  canton: messages.addressRegionCanton,
  prefecture: messages.addressRegionPrefecture,
  "": messages.addressRegion,
};

type CollectionPage = {
  total_items?: number;
  _embedded?: Record<string, unknown[]>;
};

type ContainerProps = {
  id: string;
  resource?: AddressResource;
  addressesLink: FollowableLink<CollectionPage> | null;
  countriesLink?: CountryOptionsLink | null;
  regionsLink?: RegionOptionsLink | null;
  onBack: () => void;
};

/**
 * Resolves `resource` when navigation didn't already carry it -- same
 * pattern as `subscriptions/subscription-page.tsx`'s
 * `SubscriptionPageContainer`.
 */
export function AddressPageContainer({
  id,
  resource,
  addressesLink,
  countriesLink,
  regionsLink,
  onBack,
}: ContainerProps) {
  const intl = useIntl();
  const fetched = useAddressById(resource ? null : addressesLink, id);
  const address = resource ?? fetched.address;

  if (!resource && (fetched.isLoading || fetched.isUnauthenticated)) {
    return (
      <AccountPageLayout onBack={onBack}>
        <Skeleton />
      </AccountPageLayout>
    );
  }

  if (!address) {
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
    <AddressPage
      address={address}
      countriesLink={countriesLink}
      regionsLink={regionsLink}
      onBack={onBack}
    />
  );
}

type Props = {
  address: AddressResource;
  /**
   * The store's country and region lists. Optional: when either is missing --
   * an older API, or a read that failed -- the matching control degrades to
   * free text rather than blocking the form. See FX-369's failure rules.
   */
  countriesLink?: CountryOptionsLink | null;
  regionsLink?: RegionOptionsLink | null;
  onBack: () => void;
};

export function AddressPage({
  address,
  countriesLink,
  regionsLink,
  onBack,
}: Props) {
  const intl = useIntl();
  const { onUnauthenticated, cache } = useApi();
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

  const { errors, validateField, validateAll } = useFieldValidation(
    ADDRESS_FIELD_LIMITS,
  );

  // Which list governs this address. Billing and shipping addresses are
  // always separate records, so there is exactly one and no intersection to
  // compute; an address flagged neither is inferred as shipping.
  const addressType = addressTypeFor(address);

  // Sent as `filters`, not as loose keys. The SDK's `Node.get()` destructures
  // exactly `{ filters, fields, offset, limit, order, zoom }` and drops
  // anything else without a word, so `{ address_type }` would produce a bare
  // URL and a response scoped to nothing. `filters` splits each entry on its
  // first `=` and appends the halves as a query param, which is also how this
  // element already sends `is_active=true` and `type:in=...`.
  const { data: countryData } = useResource(countriesLink ?? null, {
    filters: [`address_type=${addressType}`],
  });

  // Asked for per country rather than all at once: a customer edits one
  // address at a time, and the cache keeps the previous country's list for
  // the way back.
  const { data: regionData } = useResource(
    country.trim() ? (regionsLink ?? null) : null,
    {
      filters: [
        `address_type=${addressType}`,
        `country_code=${country.trim()}`,
      ],
    },
  );

  const countryEntries = countryData?.values;
  const selectedCountry = countryEntries?.[country];

  // `codesFrom` rather than the map itself: the SDK helpers take an array and
  // return `[]` for anything else, so passing `values` straight in would
  // empty the dropdown with no error at all.
  const countryCodes = useMemo(
    () => withSavedCode(codesFrom(countryEntries), country),
    [countryEntries, country],
  );

  // No list at all means the read failed or the API predates it. The control
  // falls back to free text -- a customer must never be blocked from fixing
  // their own address because a reference list did not load.
  const hasCountryList = countryCodes.length > 0;

  const regionCodes = useMemo(
    () => withSavedCode(codesFrom(regionData?.values), region),
    [regionData, region],
  );

  // Gated on the country's own `has_regions`, not on whether the region read
  // happened to return anything: a country that genuinely has no regions
  // takes free text, and that is a different state from a list still loading.
  const hasRegionList = Boolean(selectedCountry?.has_regions) && regionCodes.length > 0;

  const countryOptions = useMemo(
    () => toCountryOptions(countryCodes, intl.locale),
    [countryCodes, intl.locale],
  );

  // Region names ship with the SDK, lazily per locale. The API's own `default`
  // is English only, so it is the floor rather than the display value.
  const [regionNames, setRegionNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    loadRegionMessages(intl.locale).then((loaded) => {
      if (active) setRegionNames(loaded);
    });
    return () => {
      active = false;
    };
  }, [intl.locale]);

  const regionOptions = useMemo(
    () => toRegionOptions(regionCodes, country),
    [regionCodes, country],
  );

  // Without an `items` map, Base UI's closed-trigger `Select.Value` falls
  // back to rendering the raw stored value (the country/region code)
  // instead of looking up its display name.
  const countryItems = useMemo(
    () => Object.fromEntries(countryOptions.map((o) => [o.value, o.label])),
    [countryOptions],
  );

  const regionLabelFor = useCallback(
    (option: { value: string; messageId: string }) =>
      regionNames[option.messageId] ??
      regionData?.values?.[option.value]?.default ??
      option.value,
    [regionNames, regionData],
  );

  const regionItems = useMemo(
    () =>
      Object.fromEntries(regionOptions.map((o) => [o.value, regionLabelFor(o)])),
    [regionOptions, regionLabelFor],
  );

  // "State", "Prefecture", "Canton" -- whatever this country calls them. The
  // generic "Region" is the fallback when the country list does not say.
  const regionLabel = REGION_LABELS[selectedCountry?.regions_type ?? ""];

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

    if (
      !validateAll({
        addressName,
        firstName,
        lastName,
        company,
        phone,
        address1,
        address2,
        city,
        country,
        region,
        postalCode,
      })
    ) {
      return;
    }

    setIsBusy(true);
    setHasFailed(false);

    try {
      // Every field here is one this form lets the customer edit. Neither
      // `is_default_billing` nor `is_default_shipping` is a state variable
      // above, so there is no way for this object to carry either -- that's
      // what makes an unconditional full-object PATCH safe for this page
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

      cache.clear();
      onBack();
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
    <AccountPageLayout
      title={intl.formatMessage(messages.addressEditHeading)}
      onBack={onBack}
    >
      <Form onSubmit={handleSubmit} noValidate $maxWidth="640px">
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
            maxLength={ADDRESS_FIELD_LIMITS.addressName.maxLength}
            value={addressName}
            onChange={(event) => {
              const value = event.target.value;
              setAddressName(value);
              if (errors.addressName) validateField("addressName", value);
            }}
            onBlur={(event) => validateField("addressName", event.target.value)}
          />
          {errors.addressName ? (
            <Field.Error match>{errors.addressName}</Field.Error>
          ) : null}
        </Field.Root>

        <Pair>
          <Field.Root>
            <Field.Label htmlFor={firstNameId}>
              {intl.formatMessage(messages.addressFirstName)}
            </Field.Label>
            <Input
              id={firstNameId}
              type="text"
              autoComplete="given-name"
              maxLength={ADDRESS_FIELD_LIMITS.firstName.maxLength}
              value={firstName}
              onChange={(event) => {
                const value = event.target.value;
                setFirstName(value);
                if (errors.firstName) validateField("firstName", value);
              }}
              onBlur={(event) => validateField("firstName", event.target.value)}
            />
            {errors.firstName ? (
              <Field.Error match>{errors.firstName}</Field.Error>
            ) : null}
          </Field.Root>

          <Field.Root>
            <Field.Label htmlFor={lastNameId}>
              {intl.formatMessage(messages.addressLastName)}
            </Field.Label>
            <Input
              id={lastNameId}
              type="text"
              autoComplete="family-name"
              maxLength={ADDRESS_FIELD_LIMITS.lastName.maxLength}
              value={lastName}
              onChange={(event) => {
                const value = event.target.value;
                setLastName(value);
                if (errors.lastName) validateField("lastName", value);
              }}
              onBlur={(event) => validateField("lastName", event.target.value)}
            />
            {errors.lastName ? (
              <Field.Error match>{errors.lastName}</Field.Error>
            ) : null}
          </Field.Root>
        </Pair>

        <Field.Root>
          <Field.Label htmlFor={companyId}>
            {intl.formatMessage(messages.addressCompany)}
          </Field.Label>
          <Input
            id={companyId}
            type="text"
            autoComplete="organization"
            maxLength={ADDRESS_FIELD_LIMITS.company.maxLength}
            value={company}
            onChange={(event) => {
              const value = event.target.value;
              setCompany(value);
              if (errors.company) validateField("company", value);
            }}
            onBlur={(event) => validateField("company", event.target.value)}
          />
          {errors.company ? (
            <Field.Error match>{errors.company}</Field.Error>
          ) : null}
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={phoneId}>
            {intl.formatMessage(messages.addressPhone)}
          </Field.Label>
          <Input
            id={phoneId}
            type="tel"
            autoComplete="tel"
            maxLength={ADDRESS_FIELD_LIMITS.phone.maxLength}
            value={phone}
            onChange={(event) => {
              const value = event.target.value;
              setPhone(value);
              if (errors.phone) validateField("phone", value);
            }}
            onBlur={(event) => validateField("phone", event.target.value)}
          />
          {errors.phone ? (
            <Field.Error match>{errors.phone}</Field.Error>
          ) : null}
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
            maxLength={ADDRESS_FIELD_LIMITS.address1.maxLength}
            value={address1}
            onChange={(event) => {
              const value = event.target.value;
              setAddress1(value);
              if (errors.address1) validateField("address1", value);
            }}
            onBlur={(event) => validateField("address1", event.target.value)}
          />
          {errors.address1 ? (
            <Field.Error match>{errors.address1}</Field.Error>
          ) : null}
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={line2Id}>
            {intl.formatMessage(messages.addressLine2)}
          </Field.Label>
          <Input
            id={line2Id}
            type="text"
            autoComplete="address-line2"
            maxLength={ADDRESS_FIELD_LIMITS.address2.maxLength}
            value={address2}
            onChange={(event) => {
              const value = event.target.value;
              setAddress2(value);
              if (errors.address2) validateField("address2", value);
            }}
            onBlur={(event) => validateField("address2", event.target.value)}
          />
          {errors.address2 ? (
            <Field.Error match>{errors.address2}</Field.Error>
          ) : null}
        </Field.Root>

        <Pair>
          <Field.Root>
            <Field.Label htmlFor={countryId}>
              {intl.formatMessage(messages.addressCountry)}
            </Field.Label>
            {hasCountryList ? (
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
                        {countryOptions.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            <Select.ItemText>{option.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
            ) : (
              // No list reached us. Free text rather than an empty Select:
              // the customer must still be able to fix their own address.
              <Input
                id={countryId}
                type="text"
                autoComplete="country"
                maxLength={ADDRESS_FIELD_LIMITS.country.maxLength}
                value={country}
                onChange={(event) => {
                  const value = event.target.value;
                  handleCountryChange(value);
                  if (errors.country) validateField("country", value);
                }}
                onBlur={(event) => validateField("country", event.target.value)}
              />
            )}
          </Field.Root>

          <Field.Root>
            <Field.Label htmlFor={regionId}>
              {intl.formatMessage(regionLabel)}
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
                        {regionOptions.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            <Select.ItemText>
                              {regionLabelFor(option)}
                            </Select.ItemText>
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
                maxLength={ADDRESS_FIELD_LIMITS.region.maxLength}
                value={region}
                onChange={(event) => {
                  const value = event.target.value;
                  setRegion(value);
                  if (errors.region) validateField("region", value);
                }}
                onBlur={(event) => validateField("region", event.target.value)}
              />
            )}
            {errors.region ? (
              <Field.Error match>{errors.region}</Field.Error>
            ) : null}
          </Field.Root>
        </Pair>

        <Pair>
          <Field.Root>
            <Field.Label htmlFor={cityId}>
              {intl.formatMessage(messages.addressCity)}
            </Field.Label>
            <Input
              id={cityId}
              type="text"
              autoComplete="address-level2"
              maxLength={ADDRESS_FIELD_LIMITS.city.maxLength}
              value={city}
              onChange={(event) => {
                const value = event.target.value;
                setCity(value);
                if (errors.city) validateField("city", value);
              }}
              onBlur={(event) => validateField("city", event.target.value)}
            />
            {errors.city ? (
              <Field.Error match>{errors.city}</Field.Error>
            ) : null}
          </Field.Root>

          <Field.Root>
            <Field.Label htmlFor={postalCodeId}>
              {intl.formatMessage(messages.addressPostalCode)}
            </Field.Label>
            <Input
              id={postalCodeId}
              type="text"
              autoComplete="postal-code"
              maxLength={ADDRESS_FIELD_LIMITS.postalCode.maxLength}
              value={postalCode}
              onChange={(event) => {
                const value = event.target.value;
                setPostalCode(value);
                if (errors.postalCode) validateField("postalCode", value);
              }}
              onBlur={(event) => validateField("postalCode", event.target.value)}
            />
            {errors.postalCode ? (
              <Field.Error match>{errors.postalCode}</Field.Error>
            ) : null}
          </Field.Root>
        </Pair>

        <Actions>
          <Button type="submit" disabled={isBusy}>
            {intl.formatMessage(
              isBusy ? messages.addressSaving : messages.addressSave,
            )}
          </Button>
        </Actions>
      </Form>
    </AccountPageLayout>
  );
}
