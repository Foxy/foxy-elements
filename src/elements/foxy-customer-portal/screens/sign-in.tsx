import { useId, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { useApi } from "@/lib/customer-api";
import { messages } from "../messages";

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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
    <form onSubmit={handleSubmit}>
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
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field.Root>

      <Field.Root>
        <Field.Label htmlFor={passwordId}>
          {intl.formatMessage(messages.signInPassword)}
        </Field.Label>
        <Input
          id={passwordId}
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
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
