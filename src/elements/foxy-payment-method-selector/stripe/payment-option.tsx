import type {
  PaymentController,
  PaymentMethodSelectorOption,
} from "../types";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { styled, useTheme } from "styled-components";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import {
  resolveStripeLocale,
  resolveStripePublishableKey,
} from "./shared";
import {
  getStripeFontsForAppearance,
  mergeStripeAppearance,
  useStripeTokenAppearance,
} from "./style-hooks";

const PaymentElementLayout = styled.div`
  display: grid;
  gap: ${(props) => props.theme.tokens.space.md};
`;

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
  nativeClientSecret: string | undefined,
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
    nativeClientSecret ??
    (typeof paymentElementOptions.clientSecret === "string"
      ? paymentElementOptions.clientSecret
      : undefined);
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
  clientSecret,
  returnUrl,
  onControllerReady,
  onError,
  onPaymentMethodTypeChange,
}: {
  disabled?: boolean;
  paymentElementOptions: PaymentElementOptionsMap;
  clientSecret?: string;
  returnUrl?: string;
  onControllerReady?: (controller: PaymentController | null) => void;
  onError: (message: string | null) => void;
  onPaymentMethodTypeChange?: (type: string | null) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const paymentElementOptionsRef = useRef(paymentElementOptions);
  paymentElementOptionsRef.current = paymentElementOptions;
  const clientSecretRef = useRef(clientSecret);
  clientSecretRef.current = clientSecret;
  const returnUrlRef = useRef(returnUrl);
  returnUrlRef.current = returnUrl;

  const tokenize = useCallback(async () => {
    if (!stripe || !elements) {
      throw new Error("Stripe Payment Element is not ready yet.");
    }

    const currentClientSecret = clientSecretRef.current;

    if (currentClientSecret) {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrlRef.current ?? window.location.href,
        },
        redirect: "if_required",
      });

      if (result.error || !result.paymentIntent?.id) {
        throw new Error(
          result.error?.message ?? "Unable to confirm Stripe payment.",
        );
      }

      return { paymentIntentId: result.paymentIntent.id };
    }

    if (typeof elements.submit === "function") {
      const submitResult = await elements.submit();
      if (submitResult.error) {
        throw new Error(
          submitResult.error.message ?? "Payment details are incomplete.",
        );
      }
    }

    const defaultValues = paymentElementOptionsRef.current.defaultValues as
      | {
          billingDetails?: {
            name?: string;
            email?: string;
            phone?: string;
            address?: {
              city?: string;
              country?: string;
              line1?: string;
              line2?: string;
              postal_code?: string;
              state?: string;
            };
          };
        }
      | undefined;
    const billingDetails = defaultValues?.billingDetails;

    const result = await stripe.createConfirmationToken({
      elements,
      ...(billingDetails
        ? { params: { payment_method_data: { billing_details: billingDetails } } }
        : {}),
    });

    if (result.error || !result.confirmationToken?.id) {
      throw new Error(
        result.error?.message ?? "Unable to create Stripe confirmation token.",
      );
    }

    return {
      confirmationTokenId: result.confirmationToken.id,
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
        const detail = event as { value?: { type?: string }; error?: { message?: string } };
        onPaymentMethodTypeChange?.(detail.value?.type ?? null);
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
  onPaymentMethodTypeChange,
}: {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  onControllerReady?: (controller: PaymentController | null) => void;
  onPaymentMethodTypeChange?: (type: string | null) => void;
}) {
  const onControllerReadyRef = useRef(onControllerReady);
  onControllerReadyRef.current = onControllerReady;
  const stableOnControllerReady = useCallback(
    (controller: PaymentController | null) => {
      onControllerReadyRef.current?.(controller);
    },
    [],
  );

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

  const { appearance, appearanceSignature } = useStripeTokenAppearance(
    Boolean(stripeConfig && publishableKey),
  );
  const { tokens } = useTheme();

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
        stripeConfig?.clientSecret,
      ),
    [mergedAppearance, stripeConfig?.clientSecret, stripeConfig?.paymentElementOptions, stripeLocale],
  );

  if (!stripePromise || !publishableKey || !stripeConfig) {
    return (
      <p
        style={{
          color: tokens.color.error,
          fontSize: "0.875rem",
          margin: 0,
        }}
      >
        Stripe Payment Element configuration is missing for this payment option.
      </p>
    );
  }

  return (
    <PaymentElementLayout>
      <Elements
        key={appearanceSignature}
        stripe={stripePromise}
        options={elementsOptions}
      >
        <StripePaymentField
          disabled={disabled}
          paymentElementOptions={paymentElementOptions}
          clientSecret={stripeConfig.clientSecret}
          returnUrl={stripeConfig.returnUrl}
          onControllerReady={stableOnControllerReady}
          onError={setErrorMessage}
          onPaymentMethodTypeChange={onPaymentMethodTypeChange}
        />
      </Elements>

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
    </PaymentElementLayout>
  );
}
