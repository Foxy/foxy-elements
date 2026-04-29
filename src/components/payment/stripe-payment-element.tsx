import type { PaymentMethodSelectorOption } from "./option-types";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
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

type PaymentElementOptionsMap = Record<string, unknown>;

const DEFAULT_BILLING_ADDRESS_SETTINGS = {
  billingDetails: {
    name: "never",
    email: "never",
    phone: "never",
    address: {
      country: "never",
      line1: "never",
      line2: "never",
      city: "never",
      state: "never",
      postalCode: "never",
    },
  },
} as const;

function parseElementsOptions(
  locale: StripeElementsOptions["locale"],
  appearance: StripeElementsOptions["appearance"],
  config: PaymentElementOptionsMap | undefined,
): {
  elementsOptions: StripeElementsOptions;
  paymentElementOptions: PaymentElementOptionsMap;
} {
  const paymentElementOptions = { ...(config ?? {}) };

  const configuredLayout =
    typeof paymentElementOptions.layout === "object" &&
    paymentElementOptions.layout
      ? (paymentElementOptions.layout as Record<string, unknown>)
      : undefined;
  const configuredFields =
    typeof paymentElementOptions.fields === "object" &&
    paymentElementOptions.fields
      ? (paymentElementOptions.fields as Record<string, unknown>)
      : undefined;
  const configuredBillingDetails =
    configuredFields && typeof configuredFields.billingDetails === "object"
      ? (configuredFields.billingDetails as Record<string, unknown>)
      : undefined;
  const configuredBillingAddress =
    configuredBillingDetails &&
    typeof configuredBillingDetails.address === "object"
      ? (configuredBillingDetails.address as Record<string, unknown>)
      : undefined;

  paymentElementOptions.layout = {
    ...(configuredLayout ?? {}),
    type: "tabs",
  };

  paymentElementOptions.fields = {
    ...(configuredFields ?? {}),
    billingDetails: {
      ...(configuredBillingDetails ?? {}),
      ...DEFAULT_BILLING_ADDRESS_SETTINGS.billingDetails,
      address: {
        ...(configuredBillingAddress ?? {}),
        ...DEFAULT_BILLING_ADDRESS_SETTINGS.billingDetails.address,
      },
    },
  };

  const clientSecret =
    typeof paymentElementOptions.clientSecret === "string"
      ? paymentElementOptions.clientSecret
      : undefined;
  const mode =
    typeof paymentElementOptions.mode === "string"
      ? (paymentElementOptions.mode as StripeElementsOptions["mode"])
      : undefined;
  const amount =
    typeof paymentElementOptions.amount === "number"
      ? paymentElementOptions.amount
      : undefined;
  const currency =
    typeof paymentElementOptions.currency === "string"
      ? paymentElementOptions.currency
      : undefined;
  const configuredFonts = Array.isArray(paymentElementOptions.fonts)
    ? (paymentElementOptions.fonts as NonNullable<
        StripeElementsOptions["fonts"]
      >)
    : undefined;
  const fonts = getStripeFontsForAppearance(appearance, configuredFonts);

  delete paymentElementOptions.clientSecret;
  delete paymentElementOptions.mode;
  delete paymentElementOptions.amount;
  delete paymentElementOptions.currency;
  delete paymentElementOptions.fonts;
  delete paymentElementOptions.excludedPaymentMethodTypes;

  const elementsOptions: StripeElementsOptions = {
    locale,
    appearance,
    ...(fonts ? { fonts } : {}),
    ...(clientSecret
      ? { clientSecret }
      : mode
        ? {
            mode,
            amount: amount ?? 2204,
            currency: currency ?? "usd",
          }
        : {}),
  };

  return { elementsOptions, paymentElementOptions };
}

function StripePaymentField({
  disabled,
  paymentElementOptions,
  onControllerReady,
  onError,
}: {
  disabled?: boolean;
  paymentElementOptions: PaymentElementOptionsMap;
  onControllerReady?: (controller: PaymentController | null) => void;
  onError: (message: string | null) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const tokenize = useCallback(async () => {
    if (!stripe || !elements) {
      throw new Error("Stripe Payment Element is not ready yet.");
    }

    if (typeof elements.submit === "function") {
      const submitResult = await elements.submit();
      if (submitResult.error) {
        throw new Error(
          submitResult.error.message ?? "Payment details are incomplete.",
        );
      }
    }

    const result = await stripe.createPaymentMethod({
      elements,
      params: {},
    });

    if (result.error || !result.paymentMethod?.id) {
      throw new Error(
        result.error?.message ?? "Unable to create Stripe payment method.",
      );
    }

    const card = result.paymentMethod.card;
    return {
      paymentMethodId: result.paymentMethod.id,
      paymentMethodType: result.paymentMethod.type,
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
    <PaymentElement
      options={{
        ...paymentElementOptions,
        readOnly: Boolean(disabled),
      }}
      onReady={() => {
        onControllerReady?.({ tokenize });
      }}
      onChange={(event) => {
        const detail = event as { error?: { message?: string } };
        onError(detail.error?.message ?? null);
      }}
      onLoadError={(event) => {
        const detail = event as { error?: { message?: string } };
        onError(
          detail.error?.message ??
            "Stripe Payment Element initialization failed.",
        );
        onControllerReady?.(null);
      }}
    />
  );
}

export function StripePaymentElementOption({
  option,
  disabled,
  onControllerReady,
}: {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  onControllerReady?: (controller: PaymentController | null) => void;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const stripeConfig = option.stripePaymentElement;
  const publishableKey = resolveStripePublishableKey(
    stripeConfig?.publishableKey,
  );
  const stripeLocale = useMemo(
    () => resolveStripeLocale(stripeConfig?.locale),
    [stripeConfig?.locale],
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

  const { elementsOptions, paymentElementOptions } = useMemo(
    () =>
      parseElementsOptions(
        stripeLocale,
        mergedAppearance,
        stripeConfig?.paymentElementOptions,
      ),
    [mergedAppearance, stripeConfig?.paymentElementOptions, stripeLocale],
  );

  if (!stripePromise || !publishableKey || !stripeConfig) {
    return (
      <p
        style={{
          color: "var(--destructive, #b91c1c)",
          fontSize: "0.875rem",
          margin: 0,
        }}
      >
        Stripe Payment Element configuration is missing for this payment option.
      </p>
    );
  }

  return (
    <div className="grid gap-5" ref={probeRef}>
      <Elements
        key={appearanceSignature}
        stripe={stripePromise}
        options={elementsOptions}
      >
        <StripePaymentField
          disabled={disabled}
          paymentElementOptions={paymentElementOptions}
          onControllerReady={onControllerReady}
          onError={setErrorMessage}
        />
      </Elements>

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
