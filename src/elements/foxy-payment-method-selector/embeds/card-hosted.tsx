import type { CardEmbedTokenizeErrorCode } from "@foxy.io/sdk/checkout";
import "../../foxy-payment-card-field/element";
import type { PaymentCardFieldElement } from "../../foxy-payment-card-field/element";
import type { HostedFieldStyleAttributes } from "../stripe/style-hooks";
import type { PaymentController, PaymentMethodSelectorOption } from "../types";

import { useEffect, useRef, useState } from "react";
import { Field, FieldLabel } from "@foxy.io/design-system/ui/field";

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
    <div className="flex flex-col gap-2">
      <Field>
        <FieldLabel htmlFor={fieldId}>{fieldLabel}</FieldLabel>
      </Field>
      <foxy-payment-card-field
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
        className="border-input dark:bg-input/30 [&:state(focused)]:border-ring [&:state(focused)]:ring-ring/50 [&:state(user-invalid)]:border-destructive [&:state(user-invalid)]:ring-destructive/20 dark:[&:state(user-invalid)]:ring-destructive/40 [&:state(user-invalid)]:ring-3 [&:state(focused)]:ring-3 [&:state(disabled)]:bg-input/50 dark:[&:state(disabled)]:bg-input/80 [&:state(disabled)]:opacity-50 rounded-[var(--radius)] border transition-colors block w-full overflow-hidden"
        theme-background={styleAttributes.inputBackground}
        theme-input-placeholder-color={styleAttributes.inputPlaceholderColor}
        theme-input-height={styleAttributes.inputHeight}
        theme-input-padding={styleAttributes.inputPadding}
        theme-input-padding-x={styleAttributes.inputPaddingX}
        theme-input-padding-y={styleAttributes.inputPaddingY}
        theme-font-sans={styleAttributes.inputFont}
        theme-input-text-color={styleAttributes.inputTextColor}
        theme-input-error-text-color={styleAttributes.inputTextColorError}
        theme-input-font-size={styleAttributes.inputTextSize}
        ref={(node: Element | null) => {
          elementRef.current = node as PaymentCardFieldElement | null;
        }}
      />
      {error ? (
        <p className="m-0 text-sm text-destructive">{tokenizeErrorMessage}</p>
      ) : null}
    </div>
  );
}
