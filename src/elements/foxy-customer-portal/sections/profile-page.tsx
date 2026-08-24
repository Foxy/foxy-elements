import { useId, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { WriteError, useApi, type FollowableLink } from "@/lib/customer-api";
import { AccountPageLayout } from "../account-page-layout";
import { messages } from "../messages";
import { patchResource } from "../write";
import { CUSTOMER_FIELD_LIMITS } from "../field-constraints";
import { useFieldValidation } from "../use-field-validation";
import type { CustomerProps } from "./header";

export type CustomerResource = CustomerProps & {
  _links: { self: FollowableLink<unknown> };
};

type Props = { customer: CustomerResource; onBack: () => void };

export function ProfilePage({ customer, onBack }: Props) {
  const intl = useIntl();
  const { onUnauthenticated, cache } = useApi();
  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const taxIdId = useId();

  const [firstName, setFirstName] = useState(customer.first_name ?? "");
  const [lastName, setLastName] = useState(customer.last_name ?? "");
  const [email, setEmail] = useState(customer.email ?? "");
  const [taxId, setTaxId] = useState(customer.tax_id ?? "");
  const [isBusy, setIsBusy] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const rules = useMemo(
    () => ({
      firstName: CUSTOMER_FIELD_LIMITS.firstName,
      lastName: CUSTOMER_FIELD_LIMITS.lastName,
      email: CUSTOMER_FIELD_LIMITS.email,
      taxId: CUSTOMER_FIELD_LIMITS.taxId,
    }),
    [],
  );

  const { errors, validateField, validateAll } = useFieldValidation(rules);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!validateAll({ firstName, lastName, email, taxId })) return;

    setIsBusy(true);
    setHasFailed(false);

    try {
      // Password is deliberately absent — it has its own page.
      // patchResource, not patch?.(), so an unwritable link fails instead of
      // navigating back as though the save succeeded.
      await patchResource(customer._links.self, {
        first_name: firstName,
        last_name: lastName,
        email,
        tax_id: taxId,
      });

      cache.clear();
      onBack();
    } catch (caught) {
      // This page sends no credentials, so a 401/403 can only mean the
      // session died. The password page is the one place where 401 means
      // "the value you typed was wrong" — it must not route.
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
      title={intl.formatMessage(messages.profileHeading)}
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} noValidate>
        {hasFailed && (
          <Alert.Root $variant="destructive">
            <Alert.Description>
              {intl.formatMessage(messages.errorUnknown)}
            </Alert.Description>
          </Alert.Root>
        )}

        <Field.Root>
          <Field.Label htmlFor={firstNameId}>
            {intl.formatMessage(messages.profileFirstName)}
          </Field.Label>
          <Input
            id={firstNameId}
            type="text"
            autoComplete="given-name"
            maxLength={CUSTOMER_FIELD_LIMITS.firstName.maxLength}
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
            {intl.formatMessage(messages.profileLastName)}
          </Field.Label>
          <Input
            id={lastNameId}
            type="text"
            autoComplete="family-name"
            maxLength={CUSTOMER_FIELD_LIMITS.lastName.maxLength}
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

        <Field.Root>
          <Field.Label htmlFor={emailId}>
            {intl.formatMessage(messages.signInEmail)}
          </Field.Label>
          <Input
            id={emailId}
            type="email"
            autoComplete="email"
            required
            maxLength={CUSTOMER_FIELD_LIMITS.email.maxLength}
            value={email}
            onChange={(event) => {
              const value = event.target.value;
              setEmail(value);
              if (errors.email) validateField("email", value);
            }}
            onBlur={(event) => validateField("email", event.target.value)}
          />
          {errors.email ? (
            <Field.Error match>{errors.email}</Field.Error>
          ) : null}
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={taxIdId}>
            {intl.formatMessage(messages.profileTaxId)}
          </Field.Label>
          <Input
            id={taxIdId}
            type="text"
            maxLength={CUSTOMER_FIELD_LIMITS.taxId.maxLength}
            value={taxId}
            onChange={(event) => {
              const value = event.target.value;
              setTaxId(value);
              if (errors.taxId) validateField("taxId", value);
            }}
            onBlur={(event) => validateField("taxId", event.target.value)}
          />
          {errors.taxId ? (
            <Field.Error match>{errors.taxId}</Field.Error>
          ) : null}
        </Field.Root>

        <Button type="submit" disabled={isBusy}>
          {intl.formatMessage(
            isBusy ? messages.profileSaving : messages.profileSave,
          )}
        </Button>
      </form>
    </AccountPageLayout>
  );
}
