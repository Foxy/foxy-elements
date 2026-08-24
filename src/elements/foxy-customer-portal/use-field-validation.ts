import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { messages } from "./messages";
import type { FieldRules } from "./field-constraints";

export type { FieldRule, FieldRules } from "./field-constraints";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Turns a static set of per-field rules into live error state. A field's
 * entry in `errors` is `undefined` until it has been validated at least
 * once (via `validateField` or `validateAll`) -- callers use that to decide
 * whether to render a `Field.Error` at all, so a field never shows an error
 * before the customer has touched it or attempted to submit.
 */
export function useFieldValidation(rules: FieldRules) {
  const intl = useIntl();
  const [errors, setErrors] = useState<Record<string, string | null | undefined>>(
    {},
  );

  const messageFor = useCallback(
    (field: string, value: string): string | null => {
      const rule = rules[field];
      if (!rule) return null;

      if (rule.required && value.trim() === "") {
        return intl.formatMessage(messages.validationRequired);
      }

      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        return intl.formatMessage(messages.validationMaxLength, {
          max: rule.maxLength,
        });
      }

      if (rule.email && value !== "" && !EMAIL_PATTERN.test(value)) {
        return intl.formatMessage(messages.validationEmail);
      }

      return null;
    },
    [rules, intl],
  );

  const validateField = useCallback(
    (field: string, value: string) => {
      setErrors((current) => ({ ...current, [field]: messageFor(field, value) }));
    },
    [messageFor],
  );

  const validateAll = useCallback(
    (values: Record<string, string>): boolean => {
      const nextErrors: Record<string, string | null> = {};
      let isValid = true;

      for (const field of Object.keys(rules)) {
        const message = messageFor(field, values[field] ?? "");
        nextErrors[field] = message;
        if (message) isValid = false;
      }

      setErrors(nextErrors);
      return isValid;
    },
    [rules, messageFor],
  );

  return { errors, validateField, validateAll };
}
