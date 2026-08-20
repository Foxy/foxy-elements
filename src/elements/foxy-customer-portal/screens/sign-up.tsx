import { useEffect, useId, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { useApi } from "@/lib/customer-api";
import { loadHCaptcha } from "../hcaptcha";
import { messages } from "../messages";

type Props = {
  siteKey: string;
  onSignedUp: () => void;
  onBack: () => void;
};

type SignUpError = "taken" | "invalid" | "unknown" | "verification";

export function SignUpScreen({ siteKey, onSignedUp, onBack }: Props) {
  const intl = useIntl();
  const { api } = useApi();
  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const captchaHost = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<SignUpError | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadHCaptcha().then((hcaptcha) => {
      if (cancelled || !captchaHost.current) return;
      hcaptcha.render(captchaHost.current, {
        sitekey: siteKey,
        callback: setToken,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // signUp() rejects without a token, so stop here with a useful message
    // rather than surfacing a generic INVALID_FORM from the server.
    if (!token) {
      setError("verification");
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      await api.signUp({
        verification: { type: "hcaptcha", token },
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        email,
        password,
      });

      onSignedUp();
    } catch (caught) {
      const code = (caught as { code?: string }).code;
      if (code === "UNAVAILABLE") setError("taken");
      else if (code === "INVALID_FORM") setError("invalid");
      else setError("unknown");
    } finally {
      setIsBusy(false);
    }
  }

  const errorMessage =
    error === "taken"
      ? messages.errorEmailTaken
      : error === "invalid"
        ? messages.errorInvalidForm
        : error === "verification"
          ? messages.signUpVerificationPending
          : messages.errorUnknown;

  return (
    <form onSubmit={handleSubmit}>
      <h1>{intl.formatMessage(messages.signUpHeading)}</h1>

      {error && (
        <Alert.Root $variant="destructive">
          <Alert.Description>
            {intl.formatMessage(errorMessage)}
          </Alert.Description>
        </Alert.Root>
      )}

      <Field.Root>
        <Field.Label htmlFor={firstNameId}>
          {intl.formatMessage(messages.signUpFirstName)}
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
          {intl.formatMessage(messages.signUpLastName)}
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
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field.Root>

      <div ref={captchaHost} data-testid="hcaptcha" />

      <Button type="submit" disabled={isBusy}>
        {intl.formatMessage(
          isBusy ? messages.signUpBusy : messages.signUpSubmit,
        )}
      </Button>

      <Button type="button" $variant="link" onClick={onBack}>
        {intl.formatMessage(messages.signUpBack)}
      </Button>
    </form>
  );
}
