import { useId, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { useApi, WriteError } from "@/lib/customer-api";
import { AccountPageLayout } from "../account-page-layout";
import { Actions, Form } from "../form-layout";
import { CUSTOMER_FIELD_LIMITS } from "../field-constraints";
import { messages } from "../messages";
import { useFieldValidation } from "../use-field-validation";
import { patchResource } from "../write";
import type { CustomerResource } from "./profile-page";

type Props = { customer: CustomerResource; onBack: () => void };

export function PasswordPage({ customer, onBack }: Props) {
  const intl = useIntl();
  const { cache } = useApi();
  const currentId = useId();
  const nextId = useId();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<"current" | "unknown" | null>(null);

  const rules = useMemo(
    () => ({
      // `current` verifies an existing password, not a newly created one, so
      // the 50-character length cap does not apply -- see `sign-in.tsx`'s
      // `password` field for the same reasoning.
      current: { required: true },
      next: { ...CUSTOMER_FIELD_LIMITS.password, required: true },
    }),
    [],
  );

  const { errors, validateField, validateAll } = useFieldValidation(rules);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!validateAll({ current, next })) return;

    setIsBusy(true);
    setError(null);

    try {
      await patchResource(customer._links.self, {
        password: next,
        password_old: current,
      });

      cache.clear();
      onBack();
    } catch (caught) {
      // A wrong current password is a field-level problem, not a form-level
      // one — that is the reason this is its own page.
      //
      // The status is what says so. A link's `patch` never throws the SDK's
      // `AuthError`, so there is no `code` to read here: `AuthError` comes only
      // from `signIn`, `signUp`, `sendPasswordResetEmail` and `signOut`.
      const isWrongPassword =
        caught instanceof WriteError && caught.isUnauthorized;

      setError(isWrongPassword ? "current" : "unknown");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <AccountPageLayout
      title={intl.formatMessage(messages.profileChangePassword)}
      onBack={onBack}
    >
      <Form onSubmit={handleSubmit} noValidate>
        {error === "unknown" && (
          <Alert.Root $variant="destructive">
            <Alert.Description>
              {intl.formatMessage(messages.errorUnknown)}
            </Alert.Description>
          </Alert.Root>
        )}

        <Field.Root>
          <Field.Label htmlFor={currentId}>
            {intl.formatMessage(messages.passwordCurrent)}
          </Field.Label>
          <Input
            id={currentId}
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(event) => {
              const value = event.target.value;
              setCurrent(value);
              if (errors.current) validateField("current", value);
            }}
            onBlur={(event) => validateField("current", event.target.value)}
          />
          {errors.current ? (
            <Field.Error match>{errors.current}</Field.Error>
          ) : null}
          {error === "current" && (
            <Field.Error match>
              {intl.formatMessage(messages.errorWrongCurrentPassword)}
            </Field.Error>
          )}
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={nextId}>
            {intl.formatMessage(messages.passwordNew)}
          </Field.Label>
          <Input
            id={nextId}
            type="password"
            autoComplete="new-password"
            required
            maxLength={CUSTOMER_FIELD_LIMITS.password.maxLength}
            value={next}
            onChange={(event) => {
              const value = event.target.value;
              setNext(value);
              if (errors.next) validateField("next", value);
            }}
            onBlur={(event) => validateField("next", event.target.value)}
          />
          {errors.next ? <Field.Error match>{errors.next}</Field.Error> : null}
        </Field.Root>

        <Actions>
          <Button type="submit" disabled={isBusy}>
            {intl.formatMessage(
              isBusy ? messages.passwordSaving : messages.passwordSave,
            )}
          </Button>
        </Actions>
      </Form>
    </AccountPageLayout>
  );
}
