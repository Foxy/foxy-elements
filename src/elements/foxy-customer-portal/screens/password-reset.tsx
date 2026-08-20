import { useEffect, useId, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { useApi, type FollowableLink } from "@/lib/customer-api";
import { messages } from "../messages";

type Props = {
  onCompleted: () => void;
  onSkipped: () => void;
  canSkip: boolean;
};

// Named distinctly from Task 11's exported `CustomerResource` — this screen
// only needs the write link, not the customer's props.
type CustomerWithSelfLink = { _links: { self: FollowableLink<unknown> } };

export function PasswordResetScreen({
  onCompleted,
  onSkipped,
  canSkip,
}: Props) {
  const intl = useIntl();
  const { api } = useApi();
  const newId = useId();
  const confirmId = useId();

  const [self, setSelf] = useState<FollowableLink<unknown> | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<"mismatch" | "unknown" | null>(null);

  // The customer's own `self` link is the write target for the password.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const resource = (await (await api.get()).json()) as CustomerWithSelfLink;
      if (!cancelled) setSelf(resource._links.self);
    })();

    return () => {
      cancelled = true;
    };
  }, [api]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (password !== confirmation) {
      setError("mismatch");
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      await self?.patch?.({ password });
      api.usesTemporaryPassword = false;
      onCompleted();
    } catch {
      setError("unknown");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div>
      <h1>{intl.formatMessage(messages.passwordResetHeading)}</h1>
      <p>{intl.formatMessage(messages.passwordResetHint)}</p>

      {error && (
        <Alert.Root $variant="destructive">
          <Alert.Description>
            {intl.formatMessage(
              error === "mismatch"
                ? messages.passwordMismatch
                : messages.errorUnknown,
            )}
          </Alert.Description>
        </Alert.Root>
      )}

      <form onSubmit={handleSubmit}>
        <Field.Root>
          <Field.Label htmlFor={newId}>
            {intl.formatMessage(messages.passwordNew)}
          </Field.Label>
          <Input
            id={newId}
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label htmlFor={confirmId}>
            {intl.formatMessage(messages.passwordConfirm)}
          </Field.Label>
          <Input
            id={confirmId}
            type="password"
            required
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </Field.Root>

        <Button type="submit" disabled={isBusy || !self}>
          {intl.formatMessage(
            isBusy ? messages.passwordSaving : messages.passwordSave,
          )}
        </Button>
      </form>

      {canSkip && (
        <Button type="button" $variant="link" onClick={onSkipped}>
          {intl.formatMessage(messages.passwordSkip)}
        </Button>
      )}
    </div>
  );
}
