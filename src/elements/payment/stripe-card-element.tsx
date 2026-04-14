import type { PaymentMethodSelectorOption } from "./option-types";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  type StripeCardElementOptions,
  type StripeElementsOptions,
} from "@stripe/stripe-js";
import {
  resolveStripeLocale,
  resolveStripePublishableKey,
} from "./stripe-shared";
import {
  getStripeFontsForAppearance,
  mergeStripeAppearance,
  useStripeTokenAppearance,
} from "./style-hooks";

type PaymentController = {
  tokenize: (requestId?: string) => Promise<Record<string, unknown>>;
};

function StripeCardField({
  cardOptions,
  onControllerReady,
  onError,
}: {
  cardOptions: StripeCardElementOptions;
  onControllerReady?: (controller: PaymentController | null) => void;
  onError: (message: string | null) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const tokenize = useCallback(async () => {
    if (!stripe || !elements) {
      throw new Error("Stripe Card Element is not ready yet.");
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      throw new Error("Stripe Card Element is not mounted.");
    }

    const result = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (result.error || !result.paymentMethod?.id) {
      throw new Error(
        result.error?.message ?? "Unable to tokenize Stripe payment details.",
      );
    }

    const card = result.paymentMethod.card;
    return {
      paymentMethodId: result.paymentMethod.id,
      cardBrand: card?.brand,
      last4: card?.last4,
      expirationMonth: card?.exp_month,
      expirationYear: card?.exp_year,
    };
  }, [elements, stripe]);

  useEffect(() => {
    onControllerReady?.(null);
    return () => {
      onControllerReady?.(null);
    };
  }, [onControllerReady]);

  return (
    <CardElement
      options={cardOptions}
      onReady={() => {
        onControllerReady?.({ tokenize });
      }}
      onChange={(event) => {
        onError(event.error?.message ?? null);
      }}
    />
  );
}

export function StripeCardElementOption({
  option,
  disabled,
  onControllerReady,
}: {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  onControllerReady?: (controller: PaymentController | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isShadowContext, setIsShadowContext] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const stripeConfig = option.stripeCardElement;
  const publishableKey = resolveStripePublishableKey(
    stripeConfig?.publishableKey,
  );
  const stripeLocale = useMemo(
    () => resolveStripeLocale(stripeConfig?.locale),
    [stripeConfig?.locale],
  );

  const cardOptions = useMemo(
    () =>
      ({
        ...(stripeConfig?.cardElementOptions as
          | StripeCardElementOptions
          | undefined),
        disabled: Boolean(disabled),
      }) satisfies StripeCardElementOptions,
    [disabled, stripeConfig?.cardElementOptions],
  );

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  const { probeRef, appearance, appearanceSignature } =
    useStripeTokenAppearance(Boolean(stripeConfig && publishableKey));

  const mergedAppearance = useMemo(
    () =>
      mergeStripeAppearance(
        appearance,
        stripeConfig?.appearance as StripeElementsOptions["appearance"],
      ),
    [appearance, stripeConfig?.appearance],
  );

  const stripeFonts = useMemo(
    () => getStripeFontsForAppearance(mergedAppearance),
    [mergedAppearance],
  );

  useEffect(() => {
    const rootNode = containerRef.current?.getRootNode();
    const isShadow = rootNode instanceof ShadowRoot;
    setIsShadowContext(isShadow);

    if (isShadow) {
      onControllerReady?.(null);
    }
  }, [onControllerReady]);

  if (isShadowContext === true) {
    return (
      <div ref={containerRef} style={{ display: "grid", gap: "0.5rem" }}>
        <div ref={probeRef} className="sr-only" aria-hidden />
        <p
          style={{
            color: "var(--destructive, #b91c1c)",
            fontSize: "0.875rem",
            margin: 0,
          }}
        >
          Stripe Card Element is not supported inside Shadow DOM.
        </p>
      </div>
    );
  }

  if (isShadowContext === null) {
    return <div ref={containerRef} />;
  }

  if (!stripePromise || !publishableKey || !stripeConfig) {
    return (
      <p
        style={{
          color: "var(--destructive, #b91c1c)",
          fontSize: "0.875rem",
          margin: 0,
        }}
      >
        Stripe configuration is missing for this payment option.
      </p>
    );
  }

  return (
    <div ref={containerRef} style={{ display: "grid", gap: "0.5rem" }}>
      <div ref={probeRef} className="sr-only" aria-hidden />
      <div
        style={{
          border: "1px solid var(--input, #d1d5db)",
          borderRadius: "var(--radius, 0.625rem)",
          padding:
            "var(--input-padding, var(--input-padding-y, 0.25rem) var(--input-padding-x, 0.625rem))",
          minHeight: "calc(var(--input-height, calc(2rem - 2px)) + 2px)",
          display: "grid",
          alignItems: "center",
        }}
      >
        <Elements
          key={appearanceSignature}
          stripe={stripePromise}
          options={{
            locale: stripeLocale,
            appearance: mergedAppearance,
            ...(stripeFonts ? { fonts: stripeFonts } : {}),
          }}
        >
          <StripeCardField
            cardOptions={cardOptions}
            onControllerReady={onControllerReady}
            onError={setErrorMessage}
          />
        </Elements>
      </div>

      {errorMessage ? (
        <p
          style={{
            color: "var(--destructive, #b91c1c)",
            fontSize: "0.875rem",
            margin: 0,
          }}
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
