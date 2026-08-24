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

type Props = {
  onSignedIn: () => void;
  onRecoverAccess: () => void;
  onSignUp: () => void;
  canSignUp: boolean;
};

export function SignInScreen({
  onSignedIn,
  onRecoverAccess,
  onSignUp,
  canSignUp,
}: Props) {
  const intl = useIntl();
  const { api } = useApi();
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<"unauthorized" | "unknown" | null>(null);

  const rules = useMemo(
    () => ({
      email: CUSTOMER_FIELD_LIMITS.email,
      // Sign-in verifies an existing password, not a newly created one, so
      // the 50-character length cap does not apply here -- see
      // `password-page.tsx`'s `current` field for the same reasoning.
      password: { required: true },
    }),
    [],
  );

  const { errors, validateField, validateAll } = useFieldValidation(rules);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!validateAll({ email, password })) return;

    setIsBusy(true);
    setError(null);

    try {
      await api.signIn({ email, password });
      onSignedIn();
    } catch (caught) {
      const code = (caught as { code?: string }).code;
      setError(code === "UNAUTHORIZED" ? "unauthorized" : "unknown");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1>{intl.formatMessage(messages.signInHeading)}</h1>

      {error && (
        <Alert.Root $variant="destructive">
          <Alert.Description>
            {intl.formatMessage(
              error === "unauthorized"
                ? messages.errorUnauthorized
                : messages.errorUnknown,
            )}
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
        {errors.email ? <Field.Error match>{errors.email}</Field.Error> : null}
      </Field.Root>

      <Field.Root>
        <Field.Label htmlFor={passwordId}>
          {intl.formatMessage(messages.signInPassword)}
        </Field.Label>
        <Input
          id={passwordId}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => {
            const value = event.target.value;
            setPassword(value);
            if (errors.password) validateField("password", value);
          }}
          onBlur={(event) => validateField("password", event.target.value)}
        />
        {errors.password ? (
          <Field.Error match>{errors.password}</Field.Error>
        ) : null}
      </Field.Root>

      <Button type="submit" disabled={isBusy}>
        {intl.formatMessage(
          isBusy ? messages.signInBusy : messages.signInSubmit,
        )}
      </Button>

      <Button type="button" $variant="link" onClick={onRecoverAccess}>
        {intl.formatMessage(messages.signInRecover)}
      </Button>

      {canSignUp && (
        <Button type="button" $variant="link" onClick={onSignUp}>
          {intl.formatMessage(messages.signInCreate)}
        </Button>
      )}
    </form>
  );
}
