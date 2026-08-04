import "../../foxy-ach-field/element";
import type {
  AchHostedFieldName,
  AchFieldElement,
  AchTokenizationErrorEventDetail,
} from "../../foxy-ach-field/element";
import type { HostedFieldStyleAttributes } from "../stripe/style-hooks";
import type { PaymentController, PaymentMethodSelectorOption } from "../types";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Checkbox } from "@foxy.io/design-system/checkbox";
import { Field } from "@foxy.io/design-system/field";
import { styled } from "styled-components";

// space.md is the rhythm the design system's Field.Group uses between fields.
// This was sm, which put the tokenization error closer to the fields than
// anywhere else.
const AchFieldsRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.tokens.space.md};
`;

const AchFieldGrid = styled(Field.Group)`
  grid-template-columns: 1fr;
  column-gap: ${(props) => props.theme.tokens.space.md};

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

// Field.Root's own base styles are \`display: grid\` (label stacked above
// control). This section only ever needs the old shadcn Field's
// \`orientation="horizontal"\` layout (checkbox beside its label), which the
// new Field.Root has no equivalent prop for, so it's baked in here instead.
const AchOwnerConfirmationField = styled(Field.Root)`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.tokens.space.sm};
`;

const ErrorText = styled.p`
  all: unset;
  display: block;
  margin: 0;
  font: ${(props) => props.theme.tokens.font.body};
  font-size: 0.875rem;
  color: ${(props) => props.theme.tokens.color.error};
`;

const AchOwnerConfirmationError = styled(ErrorText)`
  grid-column: 1 / -1;
`;

const StyledAchField = styled("foxy-ach-field")`
  border: ${(props) => props.theme.tokens.border.field};
  border-radius: ${(props) => props.theme.tokens.borderRadius.sm};
  display: block;
  width: 100%;
  /* Without this, min-height sizes the content box, so the 2px border adds on
     top of it: the field renders 4px taller than a design system control and
     leaves 4px of dead space below the 36px hosted iframe. */
  box-sizing: border-box;
  min-height: ${(props) => props.theme.tokens.size.control};
  overflow: hidden;
  position: relative;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:state(focused) {
    border: ${(props) => props.theme.tokens.border.fieldFocus};
    outline: ${(props) => props.theme.tokens.outline.primary};
  }

  &:state(user-invalid) {
    border: ${(props) => props.theme.tokens.border.fieldInvalid};
    outline: ${(props) => props.theme.tokens.outline.error};
  }

  &:state(disabled) {
    background: ${(props) => props.theme.tokens.background.disabledField};
    opacity: 0.5;
  }
`;

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

        return await firstMounted.tokenize(requestId);
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
    <AchFieldsRoot>
      <Field.Set>
        <AchFieldGrid>
          {ACH_FIELDS.map((fieldName) => {
            const label =
              option.hostedFields?.labels?.[fieldName] ??
              defaultLabelsByField[fieldName] ??
              "";

            return (
              <Field.Root key={fieldName}>
                <Field.Label>{label}</Field.Label>
                <StyledAchField
                  type={fieldName}
                  group={group}
                  lang={lang}
                  placeholder={option.hostedFields?.placeholders?.[fieldName]}
                  account-type-values={
                    fieldName === "account-type"
                      ? option.hostedFields?.accountTypeValues?.join(",")
                      : undefined
                  }
                  disabled={disabled || undefined}
                  theme-background-field={styleAttributes.inputBackground}
                  theme-color-secondary={styleAttributes.inputPlaceholderColor}
                  theme-font-body={styleAttributes.inputFont}
                  theme-color-body={styleAttributes.inputTextColor}
                  theme-color-error={styleAttributes.inputTextColorError}
                  ref={(node: Element | null) => {
                    refs.current[fieldName] = node as AchFieldElement | null;
                  }}
                />
              </Field.Root>
            );
          })}
          <AchOwnerConfirmationField>
            <Checkbox.Root
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
            >
              <Checkbox.Indicator>
                <Check size="0.875rem" />
              </Checkbox.Indicator>
            </Checkbox.Root>
            <Field.Label htmlFor={`ach-owner-confirmation-${option.id}`}>
              {ownerConfirmationLabel}
            </Field.Label>
          </AchOwnerConfirmationField>
          {ownerConfirmationError ? (
            <AchOwnerConfirmationError>
              {ownerConfirmationErrorMessage}
            </AchOwnerConfirmationError>
          ) : null}
        </AchFieldGrid>
      </Field.Set>
      {error ? <ErrorText>{tokenizeErrorMessage}</ErrorText> : null}
    </AchFieldsRoot>
  );
}
