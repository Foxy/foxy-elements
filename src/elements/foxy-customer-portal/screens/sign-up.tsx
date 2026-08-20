import { useEffect, useId, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { useApi } from "@/lib/customer-api";
import { loadHCaptcha, type HCaptchaApi } from "../hcaptcha";
import { messages } from "../messages";

type Props = {
  siteKey: string;
  /** Called once registration is complete *and* a session exists. */
  onSignedIn: () => void;
  onBack: () => void;
};

type SignUpError =
  "taken" | "invalid" | "unknown" | "verification" | "sign-in-failed";

export function SignUpScreen({ siteKey, onSignedIn, onBack }: Props) {
  const intl = useIntl();
  const { api } = useApi();
  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const captchaHost = useRef<HTMLDivElement>(null);
  const widget = useRef<{ api: HCaptchaApi; id: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<SignUpError | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadHCaptcha().then((hcaptcha) => {
      if (cancelled || !captchaHost.current) return;
      const id = hcaptcha.render(captchaHost.current, {
        sitekey: siteKey,
        callback: setToken,
      });
      widget.current = { api: hcaptcha, id };
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
        password: password || undefined,
      });
    } catch (caught) {
      const code = (caught as { code?: string }).code;
      if (code === "UNAVAILABLE") setError("taken");
      else if (code === "INVALID_FORM") setError("invalid");
      else setError("unknown");

      // hCaptcha tokens are single-use and expire, so a stale token can
      // never satisfy signUp() again. Clear it and reset the widget so the
      // customer solves a fresh challenge before retrying; `error` above is
      // already set to the real reason, so this alone won't be read back as
      // "no challenge attempted".
      setToken(null);
      if (widget.current) widget.current.api.reset(widget.current.id);
      setIsBusy(false);
      return;
    }

    // Past this point the account exists. `signUp` only POSTs — it stores no
    // session — so registration on its own leaves the customer unauthenticated,
    // and routing to the account screen here would render it with no session.

    // A blank password is supported and means Foxy generates one and emails it,
    // so there is nothing to sign in with. Confirm and stop: no session, no
    // `signin` event, no account screen.
    if (!password) {
      setIsDone(true);
      setIsBusy(false);
      return;
    }

    try {
      await api.signIn({ email, password });
      onSignedIn();
    } catch {
      // The account was created, so this is a sign-in problem, not a sign-up
      // one. The captcha is deliberately not reset: re-submitting this form
      // would try to register the same email twice and come back "already
      // registered", which reads as though nothing worked.
      setError("sign-in-failed");
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
          : error === "sign-in-failed"
            ? messages.errorSignInAfterSignUp
            : messages.errorUnknown;

  // Registration without a password succeeded: same shape as the "done" state
  // in `access-recovery.tsx` — a confirmation in place of the form, with the
  // way back to sign in still available.
  if (isDone) {
    return (
      <div>
        <h1>{intl.formatMessage(messages.signUpHeading)}</h1>

        <Alert.Root>
          <Alert.Description>
            {intl.formatMessage(messages.signUpCheckEmail)}
          </Alert.Description>
        </Alert.Root>

        <Button type="button" $variant="link" onClick={onBack}>
          {intl.formatMessage(messages.signUpBack)}
        </Button>
      </div>
    );
  }

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
