import { useId, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { useApi, WriteError } from "@/lib/customer-api";
import { AccountPageLayout } from "../account-page-layout";
import { messages } from "../messages";
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
      <form onSubmit={handleSubmit}>
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
            required
            autoComplete="current-password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
          />
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
            required
            autoComplete="new-password"
            value={next}
            onChange={(event) => setNext(event.target.value)}
          />
        </Field.Root>

        <Button type="submit" disabled={isBusy}>
          {intl.formatMessage(
            isBusy ? messages.passwordSaving : messages.passwordSave,
          )}
        </Button>
      </form>
    </AccountPageLayout>
  );
}
