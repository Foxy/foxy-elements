import type { CardEmbedTokenizeErrorCode } from "@foxy.io/sdk/checkout";
import "../../foxy-payment-card-field/element";
import type { PaymentCardFieldElement } from "../../foxy-payment-card-field/element";
import type { HostedFieldStyleAttributes } from "../stripe/style-hooks";
import type { PaymentController, PaymentMethodSelectorOption } from "../types";

import { useEffect, useRef, useState } from "react";
import { Field } from "@foxy.io/design-system/field";
import { styled } from "styled-components";

const CardFieldRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.tokens.space.xs};
`;

const ErrorText = styled.p`
  all: unset;
  display: block;
  margin: 0;
  font: ${(props) => props.theme.tokens.font.body};
  font-size: 0.875rem;
  color: ${(props) => props.theme.tokens.color.error};
`;

const StyledPaymentCardField = styled("foxy-payment-card-field")`
  border: ${(props) => props.theme.tokens.border.field};
  border-radius: ${(props) => props.theme.tokens.borderRadius.sm};
  display: block;
  width: 100%;
  /* Without this the 2px border sits outside the 100% width, so the field
     overhangs its container by 4px and a max-width means 4px more than asked. */
  box-sizing: border-box;
  overflow: hidden;
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

  /* A security-code-only field holds three or four digits, so it stops growing
     well before the full card field (number + expiry + CSC in one row) does.
     Driven by an attribute this file sets rather than a styled-components prop
     (adding a generic to styled("foxy-payment-card-field") drops the custom
     element's own JSX attribute typings) and rather than the element's own
     reflected \`mode\` (which stays absent when the mode is the default). */
  &[data-csc-only] {
    max-width: 20rem;
  }
`;

type CardHostedEmbedProps = {
  option: PaymentMethodSelectorOption;
  lang?: string;
  disabled?: boolean;
  styleAttributes: HostedFieldStyleAttributes;
  onControllerReady?: (controller: PaymentController | null) => void;
  fullFieldLabel: string;
  cscFieldLabel: string;
  tokenizeErrorMessage: string;
};

export default function CardOptionEmbed({
  option,
  lang,
  disabled,
  styleAttributes,
  onControllerReady,
  fullFieldLabel,
  cscFieldLabel,
  tokenizeErrorMessage,
}: CardHostedEmbedProps) {
  const elementRef = useRef<PaymentCardFieldElement | null>(null);
  const [error, setError] = useState<CardEmbedTokenizeErrorCode | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !option.hostedCard) return;

    element.mode = option.hostedCard.mode;
    // INTERIM: see docs/superpowers/specs/2026-07-27-card-token-vaulting-design.md
    element.templateSetId = option.hostedCard.templateSetId;
    element.disabled = Boolean(disabled);

    const controller: PaymentController = {
      tokenize: async (requestId?: string) => {
        const payload = await element.tokenize(requestId);
        if (!payload.requestId) {
          throw new Error(
            "Card tokenization response is missing a request id.",
          );
        }

        return {
          token: payload.token,
          requestId: payload.requestId,
          cardBrand: payload.cardBrand,
          last4: payload.last4,
          expirationMonth: payload.expirationMonth,
          expirationYear: payload.expirationYear,
        };
      },
    };

    const onTokenizeSuccess = () => setError(null);
    const onTokenizeError = (event: Event) => {
      const detail = (
        event as CustomEvent<{ code: CardEmbedTokenizeErrorCode }>
      ).detail;
      setError(detail.code);
    };

    element.addEventListener("tokenizationsuccess", onTokenizeSuccess);
    element.addEventListener("tokenizationerror", onTokenizeError);
    onControllerReady?.(controller);

    return () => {
      element.removeEventListener("tokenizationsuccess", onTokenizeSuccess);
      element.removeEventListener("tokenizationerror", onTokenizeError);
      onControllerReady?.(null);
    };
  }, [disabled, onControllerReady, option.hostedCard]);

  if (!option.hostedCard) {
    return null;
  }

  const fieldId = `card-hosted-field-${option.id}`;
  const fieldLabel =
    option.hostedCard.mode === "card_csc" ? cscFieldLabel : fullFieldLabel;

  return (
    <CardFieldRoot>
      <Field.Root>
        <Field.Label htmlFor={fieldId}>{fieldLabel}</Field.Label>
      </Field.Root>
      <StyledPaymentCardField
        data-csc-only={
          option.hostedCard.mode === "card_csc" ? "true" : undefined
        }
        id={fieldId}
        lang={lang}
        mode={option.hostedCard.mode}
        translation-card-number-label={
          option.hostedCard.translationCardNumberLabel
        }
        translation-card-number-placeholder={
          option.hostedCard.translationCardNumberPlaceholder
        }
        translation-card-expiration-label={
          option.hostedCard.translationCardExpirationLabel
        }
        translation-card-expiration-placeholder={
          option.hostedCard.translationCardExpirationPlaceholder
        }
        translation-card-csc-label={option.hostedCard.translationCardCscLabel}
        translation-card-csc-placeholder={
          option.hostedCard.translationCardCscPlaceholder
        }
        theme-background-field={styleAttributes.inputBackground}
        theme-color-secondary={styleAttributes.inputPlaceholderColor}
        theme-font-body={styleAttributes.inputFont}
        theme-color-body={styleAttributes.inputTextColor}
        theme-color-error={styleAttributes.inputTextColorError}
        ref={(node: Element | null) => {
          elementRef.current = node as PaymentCardFieldElement | null;
        }}
      />
      {error ? <ErrorText>{tokenizeErrorMessage}</ErrorText> : null}
    </CardFieldRoot>
  );
}
