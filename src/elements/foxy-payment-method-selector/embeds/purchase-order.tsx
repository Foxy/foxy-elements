import type { PaymentController, PaymentMethodSelectorOption } from "../types";

import { useEffect, useRef, useState } from "react";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { styled } from "styled-components";

type PurchaseOrderEmbedProps = {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  onControllerReady?: (controller: PaymentController | null) => void;
  label: string;
  placeholder: string;
  requiredErrorMessage: string;
  tooLongErrorMessage: string;
  maxLength: number;
};

function getPurchaseOrderErrorMessage(
  value: string,
  requiredErrorMessage: string,
  tooLongErrorMessage: string,
  maxLength: number,
): string | null {
  const normalized = value.trim();

  if (!normalized) {
    return requiredErrorMessage;
  }

  if (normalized.length > maxLength) {
    return tooLongErrorMessage;
  }

  return null;
}

const PurchaseOrderRoot = styled.div`
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

export default function PurchaseOrderOptionEmbed({
  option,
  disabled,
  onControllerReady,
  label,
  placeholder,
  requiredErrorMessage,
  tooLongErrorMessage,
  maxLength,
}: PurchaseOrderEmbedProps) {
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const purchaseOrderNumberRef = useRef("");

  useEffect(() => {
    purchaseOrderNumberRef.current = purchaseOrderNumber;
  }, [purchaseOrderNumber]);

  useEffect(() => {
    const controller: PaymentController = {
      tokenize: async () => {
        const nextError = getPurchaseOrderErrorMessage(
          purchaseOrderNumberRef.current,
          requiredErrorMessage,
          tooLongErrorMessage,
          maxLength,
        );

        if (nextError) {
          setError(nextError);
          throw new Error(nextError);
        }

        setError(null);

        return {
          requestId: crypto.randomUUID(),
          purchaseOrderNumber: purchaseOrderNumberRef.current.trim(),
        };
      },
    };

    onControllerReady?.(controller);

    return () => {
      onControllerReady?.(null);
    };
  }, [maxLength, onControllerReady, requiredErrorMessage, tooLongErrorMessage]);

  useEffect(() => {
    setPurchaseOrderNumber("");
    purchaseOrderNumberRef.current = "";
    setError(null);
  }, [option.id]);

  const fieldId = `purchase-order-number-${option.id}`;

  return (
    <PurchaseOrderRoot>
      <Field.Root>
        <Field.Label htmlFor={fieldId}>{label}</Field.Label>
        <Input
          id={fieldId}
          data-purchase-order-number="true"
          type="text"
          value={purchaseOrderNumber}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          required
          onChange={(event) => {
            const nextValue = event.target.value;
            purchaseOrderNumberRef.current = nextValue;
            setPurchaseOrderNumber(nextValue);

            if (error) {
              setError(
                getPurchaseOrderErrorMessage(
                  nextValue,
                  requiredErrorMessage,
                  tooLongErrorMessage,
                  maxLength,
                ),
              );
            }
          }}
        />
      </Field.Root>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </PurchaseOrderRoot>
  );
}
