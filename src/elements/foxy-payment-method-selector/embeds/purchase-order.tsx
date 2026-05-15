import type { PaymentController, PaymentMethodSelectorOption } from "../types";

import { useEffect, useRef, useState } from "react";
import { Field, FieldLabel } from "@foxy.io/design-system/ui/field";
import { Input } from "@foxy.io/design-system/ui/input";

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
    <div className="flex flex-col gap-2">
      <Field>
        <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
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
      </Field>
      {error ? <p className="m-0 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
