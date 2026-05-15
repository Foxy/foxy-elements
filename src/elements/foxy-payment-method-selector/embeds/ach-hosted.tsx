import "../../foxy-ach-field/element";
import type {
  AchHostedFieldName,
  AchFieldElement,
  AchTokenizationErrorEventDetail,
} from "../../foxy-ach-field/element";
import type { HostedFieldStyleAttributes } from "../stripe/style-hooks";
import type { PaymentController, PaymentMethodSelectorOption } from "../types";

import { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@foxy.io/design-system/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@foxy.io/design-system/ui/field";

const ACH_FIELDS: AchHostedFieldName[] = [
  "routing-number",
  "account-number",
  "account-type",
  "account-holder-name",
];

type AchHostedEmbedProps = {
  option: PaymentMethodSelectorOption;
  lang?: string;
  disabled?: boolean;
  styleAttributes: HostedFieldStyleAttributes;
  onControllerReady?: (controller: PaymentController | null) => void;
  defaultLabelsByField: Partial<Record<AchHostedFieldName, string>>;
  ownerConfirmationLabel: string;
  ownerConfirmationErrorMessage: string;
  tokenizeErrorMessage: string;
};

export default function AchOptionEmbed({
  option,
  lang,
  disabled,
  styleAttributes,
  onControllerReady,
  defaultLabelsByField,
  ownerConfirmationLabel,
  ownerConfirmationErrorMessage,
  tokenizeErrorMessage,
}: AchHostedEmbedProps) {
  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [ownerConfirmationError, setOwnerConfirmationError] = useState(false);
  const [error, setError] = useState<
    AchTokenizationErrorEventDetail["code"] | null
  >(null);
  const refs = useRef<
    Partial<Record<AchHostedFieldName, AchFieldElement | null>>
  >({});
  const group = useMemo(
    () => option.hostedFields?.group ?? crypto.randomUUID(),
    [option.hostedFields?.group],
  );

  useEffect(() => {
    const fields = option.hostedFields;
    if (!fields) return;

    for (const fieldName of ACH_FIELDS) {
      const element = refs.current[fieldName];
      if (!element) continue;

      element.group = group;
      element.type = fieldName;
      element.placeholder = fields.placeholders?.[fieldName];
      element.accountTypeValues =
        fieldName === "account-type" ? fields.accountTypeValues : undefined;
      element.disabled = Boolean(disabled);
    }
  }, [disabled, option.hostedFields, group]);

  useEffect(() => {
    if (!option.hostedFields) return;

    const firstMounted = ACH_FIELDS.map((field) => refs.current[field]).find(
      Boolean,
    );
    if (!firstMounted) return;

    const controller: PaymentController = {
      tokenize: async (requestId?: string) => {
        if (!ownerConfirmed) {
          setOwnerConfirmationError(true);
          throw new Error(ownerConfirmationErrorMessage);
        }

        const payload = await firstMounted.tokenize(requestId);
        if (!payload.requestId) {
          throw new Error("ACH tokenization response is missing a request id.");
        }

        return {
          token: payload.token,
          requestId: payload.requestId,
        };
      },
    };

    const onTokenizeSuccess = () => {
      setError(null);
      setOwnerConfirmationError(false);
    };
    const onTokenizeError = (event: Event) => {
      const detail = (event as CustomEvent<AchTokenizationErrorEventDetail>)
        .detail;
      setError(detail.code);
    };

    firstMounted.addEventListener("tokenizationsuccess", onTokenizeSuccess);
    firstMounted.addEventListener("tokenizationerror", onTokenizeError);
    onControllerReady?.(controller);

    return () => {
      firstMounted.removeEventListener(
        "tokenizationsuccess",
        onTokenizeSuccess,
      );
      firstMounted.removeEventListener("tokenizationerror", onTokenizeError);
      onControllerReady?.(null);
    };
  }, [
    onControllerReady,
    option.hostedFields,
    ownerConfirmed,
    ownerConfirmationErrorMessage,
  ]);

  if (!option.hostedFields) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <FieldSet>
        <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          {ACH_FIELDS.map((fieldName) => {
            const label =
              option.hostedFields?.labels?.[fieldName] ??
              defaultLabelsByField[fieldName] ??
              "";

            return (
              <Field key={fieldName}>
                <FieldLabel>{label}</FieldLabel>
                <foxy-ach-field
                  lang={lang}
                  className="border-input dark:bg-input/30 state-focused:border-ring state-focused:ring-ring/50 state-user-invalid:border-destructive state-user-invalid:ring-destructive/20 dark:state-user-invalid:ring-destructive/40 state-user-invalid:ring-3 state-focused:ring-3 state-disabled:bg-input/50 dark:state-disabled:bg-input/80 state-disabled:opacity-50 rounded-lg border transition-colors relative flex w-full min-w-0 items-center overflow-hidden outline-none block min-h-8"
                  theme-input-height={styleAttributes.inputHeight}
                  theme-input-padding={styleAttributes.inputPadding}
                  theme-input-padding-x={styleAttributes.inputPaddingX}
                  theme-input-padding-y={styleAttributes.inputPaddingY}
                  theme-input-placeholder-color={
                    styleAttributes.inputPlaceholderColor
                  }
                  theme-font-sans={styleAttributes.inputFont}
                  theme-input-text-color={styleAttributes.inputTextColor}
                  theme-input-error-text-color={
                    styleAttributes.inputTextColorError
                  }
                  theme-input-font-size={styleAttributes.inputTextSize}
                  ref={(node: Element | null) => {
                    refs.current[fieldName] = node as AchFieldElement | null;
                  }}
                />
              </Field>
            );
          })}
          <Field orientation="horizontal" className="sm:col-span-2">
            <Checkbox
              id={`ach-owner-confirmation-${option.id}`}
              checked={ownerConfirmed}
              disabled={disabled}
              data-ach-owner-confirmation="true"
              onCheckedChange={(checked) => {
                const isChecked = Boolean(checked);
                setOwnerConfirmed(isChecked);
                if (isChecked) {
                  setOwnerConfirmationError(false);
                }
              }}
              aria-label={ownerConfirmationLabel}
            />
            <FieldLabel htmlFor={`ach-owner-confirmation-${option.id}`}>
              {ownerConfirmationLabel}
            </FieldLabel>
          </Field>
          {ownerConfirmationError ? (
            <p className="m-0 text-sm text-destructive sm:col-span-2">
              {ownerConfirmationErrorMessage}
            </p>
          ) : null}
        </FieldGroup>
      </FieldSet>
      {error ? (
        <p className="m-0 text-sm text-destructive">{tokenizeErrorMessage}</p>
      ) : null}
    </div>
  );
}
