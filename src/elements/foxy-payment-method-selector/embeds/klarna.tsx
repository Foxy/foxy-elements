import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import type { KlarnaSdkInstance } from "@foxy.io/sdk/checkout";
import type { PaymentMethodSelectorOption } from "../types";

import { useEffect, useRef, useState } from "react";

type KlarnaOptionEmbedProps = {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  onAvailabilityChange?: (category: string, available: boolean) => void;
  loadingMessage: string;
  unavailableMessage: string;
  loadErrorMessage: string;
};

type KlarnaStatus = "loading" | "ready" | "unavailable" | "error";

type KlarnaPaymentsError = {
  invalid_fields?: string[];
  [key: string]: unknown;
};

type KlarnaPaymentsLoadResult = {
  show_form: boolean;
  error?: KlarnaPaymentsError;
};

type CheckoutClientLike = {
  klarna?: KlarnaSdkInstance | null;
};

function loadKlarnaWidget(
  klarna: KlarnaSdkInstance,
  container: HTMLElement,
  paymentMethodCategory: string,
): Promise<KlarnaPaymentsLoadResult> {
  return new Promise((resolve) => {
    klarna.Payments.load(
      {
        container,
        payment_method_category: paymentMethodCategory,
      },
      {},
      resolve,
    );
  });
}

export default function KlarnaOptionEmbed({
  option,
  disabled,
  onAvailabilityChange,
  loadingMessage,
  unavailableMessage,
  loadErrorMessage,
}: KlarnaOptionEmbedProps) {
  const [status, setStatus] = useState<KlarnaStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const klarnaOption = option.klarna;
    const container = containerRef.current;

    if (!klarnaOption || !container) {
      return;
    }

    const klarna = (checkoutClient as CheckoutClientLike).klarna;
    const category = klarnaOption.category.identifier;

    container.innerHTML = "";
    setStatus("loading");
    setError(null);

    if (!klarna?.Payments) {
      setStatus("error");
      setError(loadErrorMessage);
      return;
    }

    let cancelled = false;

    loadKlarnaWidget(klarna, container, category)
      .then((result) => {
        if (cancelled) {
          return;
        }

        if (result.show_form) {
          setStatus("ready");
          setError(null);
          onAvailabilityChange?.(category, true);
          return;
        }

        setStatus("unavailable");
        setError(unavailableMessage);
        onAvailabilityChange?.(category, false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setStatus("error");
        setError(loadErrorMessage);
      });

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [
    loadErrorMessage,
    onAvailabilityChange,
    option.id,
    option.klarna?.category.identifier,
    unavailableMessage,
  ]);

  if (!option.klarna) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        data-klarna-widget="true"
        data-klarna-widget-status={status}
        aria-disabled={disabled ? "true" : undefined}
        className="border rounded bg-white w-full p-2"
      />
      {status === "loading" ? (
        <p className="m-0 text-sm text-muted-foreground">{loadingMessage}</p>
      ) : null}
      {error ? <p className="m-0 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
