import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { useApi } from "@/lib/customer-api";
import { CUSTOMER_FIELD_LIMITS } from "../field-constraints";
import { loadHCaptcha, type HCaptchaApi } from "../hcaptcha";
import { messages } from "../messages";
import { useFieldValidation } from "../use-field-validation";

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

  const rules = useMemo(
    () => ({
      firstName: CUSTOMER_FIELD_LIMITS.firstName,
      lastName: CUSTOMER_FIELD_LIMITS.lastName,
      email: CUSTOMER_FIELD_LIMITS.email,
      // Deliberately not required -- a blank password means "email me a
      // generated one," an existing, intentional flow this validation must
      // not block. See this plan's Global Constraints.
      password: CUSTOMER_FIELD_LIMITS.password,
    }),
    [],
  );

  const { errors, validateField, validateAll } = useFieldValidation(rules);

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

    if (!validateAll({ firstName, lastName, email, password })) return;

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
    <form onSubmit={handleSubmit} noValidate>
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
          {intl.formatMessage(messages.signUpLastName)}
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
        <Field.Label htmlFor={passwordId}>
          {intl.formatMessage(messages.signInPassword)}
        </Field.Label>
        <Input
          id={passwordId}
          type="password"
          autoComplete="new-password"
          maxLength={CUSTOMER_FIELD_LIMITS.password.maxLength}
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
