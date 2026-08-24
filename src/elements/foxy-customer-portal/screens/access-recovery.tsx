import { useId, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { useApi } from "@/lib/customer-api";
import { CUSTOMER_FIELD_LIMITS } from "../field-constraints";
import { messages } from "../messages";
import { useFieldValidation } from "../use-field-validation";

export function AccessRecoveryScreen({ onBack }: { onBack: () => void }) {
  const intl = useIntl();
  const { api } = useApi();
  const emailId = useId();

  const [email, setEmail] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const rules = useMemo(() => ({ email: CUSTOMER_FIELD_LIMITS.email }), []);
  const { errors, validateField, validateAll } = useFieldValidation(rules);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!validateAll({ email })) return;

    setIsBusy(true);
    setHasFailed(false);

    try {
      await api.sendPasswordResetEmail({ email });
      setIsDone(true);
    } catch {
      setHasFailed(true);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div>
      <h1>{intl.formatMessage(messages.recoverHeading)}</h1>

      {isDone ? (
        // Deliberately identical whether or not the account exists — the API
        // does not disclose it, and neither should the UI.
        <Alert.Root>
          <Alert.Description>
            {intl.formatMessage(messages.recoverDone)}
          </Alert.Description>
        </Alert.Root>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <p>{intl.formatMessage(messages.recoverHint)}</p>

          {hasFailed && (
            <Alert.Root $variant="destructive">
              <Alert.Description>
                {intl.formatMessage(messages.errorUnknown)}
              </Alert.Description>
            </Alert.Root>
          )}

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

          <Button type="submit" disabled={isBusy}>
            {intl.formatMessage(
              isBusy ? messages.recoverBusy : messages.recoverSubmit,
            )}
          </Button>
        </form>
      )}

      <Button type="button" $variant="link" onClick={onBack}>
        {intl.formatMessage(messages.recoverBack)}
      </Button>
    </div>
  );
}
