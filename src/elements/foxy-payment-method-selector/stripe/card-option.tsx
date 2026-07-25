import type { PaymentController, PaymentMethodSelectorOption } from "../types";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "styled-components";
import type { DesignSystemTheme } from "@foxy.io/design-system/theme";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import type { StripeCardElementOptions, StripeElementsOptions } from "@stripe/stripe-js";
import { deriveInputMetrics } from "@/lib/theme-attribute-sync";
import { resolveStripeLocale, resolveStripePublishableKey } from "./shared";
import {
  buildStripeCardElementStyle,
  extractColorFromShorthand,
  getStripeFontsForAppearance,
  mergeStripeAppearance,
  useStripeTokenAppearance,
} from "./style-hooks";

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
  const onControllerReadyRef = useRef(onControllerReady);
  onControllerReadyRef.current = onControllerReady;
  const stableOnControllerReady = useCallback(
    (controller: PaymentController | null) => {
      onControllerReadyRef.current?.(controller);
    },
    [],
  );
  const [isShadowContext, setIsShadowContext] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const stripeConfig = option.stripeCardElement;
  const publishableKey = resolveStripePublishableKey(
    stripeConfig?.publishableKey,
  );
  const stripeLocale = useMemo(
    () => resolveStripeLocale(stripeConfig?.locale),
    [stripeConfig?.locale],
  );

  const { tokens } = useTheme() as { tokens: DesignSystemTheme };

  const cardOptions = useMemo(
    () =>
      ({
        style: buildStripeCardElementStyle(tokens),
        ...(stripeConfig?.cardElementOptions as
          | StripeCardElementOptions
          | undefined),
        hidePostalCode: true,
        disabled: Boolean(disabled),
      }) satisfies StripeCardElementOptions,
    [disabled, stripeConfig?.cardElementOptions, tokens],
  );

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  const { appearance, appearanceSignature } = useStripeTokenAppearance(
    Boolean(stripeConfig && publishableKey),
  );
  const metrics = deriveInputMetrics({
    controlSize: tokens.size.control,
    borderWidth: tokens.size.borderWidth,
    fontBody: tokens.font.body,
  });

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
      setIsFocused(false);
      stableOnControllerReady(null);
    }
  }, [stableOnControllerReady]);

  useEffect(() => {
    if (isShadowContext !== false) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const syncFocusedState = () => {
      const stripeElement = container.querySelector(".StripeElement");

      setIsFocused(
        stripeElement instanceof HTMLElement &&
          stripeElement.classList.contains("StripeElement--focus"),
      );
    };

    syncFocusedState();

    const observer = new MutationObserver(() => {
      syncFocusedState();
    });

    observer.observe(container, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      setIsFocused(false);
    };
  }, [appearanceSignature, isShadowContext]);

  if (isShadowContext === true) {
    return (
      <div ref={containerRef} style={{ display: "grid", gap: "0.5rem" }}>
        <p
          style={{
            color: tokens.color.error,
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
          color: tokens.color.error,
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
      <div
        style={{
          border: isFocused ? tokens.border.fieldFocus : tokens.border.field,
          borderRadius: tokens.borderRadius.sm,
          background: tokens.background.field,
          boxSizing: "border-box",
          boxShadow: isFocused
            ? `0 0 0 3px ${extractColorFromShorthand(tokens.outline.primary) ?? tokens.color.primary}`
            : "none",
          padding: `${metrics.paddingY} ${metrics.paddingX}`,
          minHeight: tokens.size.control,
          display: "grid",
          alignItems: "center",
          transition:
            "border-color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)",
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
            onControllerReady={stableOnControllerReady}
            onError={setErrorMessage}
          />
        </Elements>
      </div>

      {errorMessage ? (
        <p
          style={{
            color: tokens.color.error,
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
