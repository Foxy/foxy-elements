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
): {
  /** null when the order cannot be described to Stripe — see below. */
  elementsOptions: StripeElementsOptions | null;
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

  const mode =
    paymentElementOptions.mode === "setup" ||
    paymentElementOptions.mode === "subscription"
      ? paymentElementOptions.mode
      : ("payment" as const);
  const amount =
    typeof paymentElementOptions.amount === "number"
      ? paymentElementOptions.amount
      : undefined;
  const currency =
    typeof paymentElementOptions.currency === "string"
      ? paymentElementOptions.currency
      : undefined;
  // Both mirror the PaymentIntent the backend creates on submit. Stripe
  // compares them against the fetched intent when confirming a deferred one,
  // and they also change which payment methods the element offers.
  const captureMethod =
    paymentElementOptions.captureMethod === "manual"
      ? ("manual" as const)
      : undefined;
  const setupFutureUsage =
    paymentElementOptions.setupFutureUsage === "off_session"
      ? ("off_session" as const)
      : paymentElementOptions.setupFutureUsage === "on_session"
        ? ("on_session" as const)
        : undefined;
  const configuredFonts = Array.isArray(paymentElementOptions.fonts)
    ? (paymentElementOptions.fonts as NonNullable<
        StripeElementsOptions["fonts"]
      >)
    : undefined;
  const fonts = getStripeFontsForAppearance(appearance, configuredFonts);

  delete paymentElementOptions.mode;
  delete paymentElementOptions.amount;
  delete paymentElementOptions.currency;
  delete paymentElementOptions.captureMethod;
  delete paymentElementOptions.setupFutureUsage;
  delete paymentElementOptions.fonts;
  delete paymentElementOptions.excludedPaymentMethodTypes;

  // Always deferred: the intent does not exist until the shopper submits, so
  // there is no client secret to create Elements with. It arrives later, on the
  // `confirm_intent` next action, and is passed to `confirmPayment` alone —
  // never back into these options, which would remount Elements and destroy the
  // instance holding the shopper's card.
  const sharedOptions = {
    locale,
    appearance,
    ...(fonts ? { fonts } : {}),
    ...(captureMethod ? { captureMethod } : {}),
    ...(setupFutureUsage ? { setupFutureUsage } : {}),
  };

  // No placeholder amount or currency. Stripe checks both against the
  // PaymentIntent when confirming, and by then the intent exists and the
  // transaction is locked — a guessed value turns a missing total into a failed
  // payment. Refusing to mount fails it at the payment form instead.
  if (!currency || (mode !== "setup" && amount === undefined)) {
    return { elementsOptions: null, paymentElementOptions };
  }

  const elementsOptions: StripeElementsOptions =
    mode === "setup"
      ? { ...sharedOptions, mode, currency }
      : { ...sharedOptions, mode, amount: amount as number, currency };

  return { elementsOptions, paymentElementOptions };
}

type StripeBillingDetails = {
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

/** The billing details the checkout collected, as the element was given them. */
function readBillingDetails(
  paymentElementOptions: PaymentElementOptionsMap,
): StripeBillingDetails | undefined {
  const defaultValues = paymentElementOptions.defaultValues as
    | { billingDetails?: StripeBillingDetails }
    | undefined;

  return defaultValues?.billingDetails;
}

function StripePaymentField({
  disabled,
  paymentElementOptions,
  returnUrl,
  onControllerReady,
  onError,
  onPaymentMethodTypeChange,
}: {
  disabled?: boolean;
  paymentElementOptions: PaymentElementOptionsMap;
  returnUrl?: string;
  onControllerReady?: (controller: PaymentController | null) => void;
  onError: (message: string | null) => void;
  onPaymentMethodTypeChange?: (type: string | null) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const paymentElementOptionsRef = useRef(paymentElementOptions);
  paymentElementOptionsRef.current = paymentElementOptions;
  const returnUrlRef = useRef(returnUrl);
  returnUrlRef.current = returnUrl;

  // Nothing is tokenized on this path: the card stays in the iframe until the
  // backend hands back the intent to confirm. All this does is validate the
  // form and let wallets collect their data, which Stripe requires before a
  // deferred intent can be confirmed — and doing it before the submit request
  // means an incomplete form fails without creating an intent at all.
  const tokenize = useCallback(async () => {
    if (!stripe || !elements) {
      throw new Error("Stripe Payment Element is not ready yet.");
    }

    // Every billing field is set to "never" (the checkout collects them
    // itself), so Stripe requires their values at confirmation time. Checked
    // here rather than there: by confirmation the intent exists and the
    // transaction is locked, so the same missing data costs the shopper a
    // retry instead of a corrected form.
    if (!readBillingDetails(paymentElementOptionsRef.current)) {
      throw new Error("Billing details are required to pay with Stripe.");
    }

    if (typeof elements.submit === "function") {
      const submitResult = await elements.submit();
      if (submitResult.error) {
        throw new Error(
          submitResult.error.message ?? "Payment details are incomplete.",
        );
      }
    }

    // Proof that this ran, which the selector requires before it will let the
    // checkout submit: without it, a Payment Element that never mounted would
    // submit as an empty payload and only fail once the intent exists.
    return { ready: true };
  }, [elements, stripe]);

  const confirm = useCallback(
    async ({ clientSecret }: { clientSecret: string }) => {
      if (!stripe || !elements) {
        throw new Error("Stripe Payment Element is not ready yet.");
      }

      const billingDetails = readBillingDetails(
        paymentElementOptionsRef.current,
      );

      // `elements` — not a bare client secret — is what carries the shopper's
      // card: the intent the backend created has no payment method attached.
      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: returnUrlRef.current ?? window.location.href,
          ...(billingDetails ? { payment_method_data: { billing_details: billingDetails } } : {}),
        },
        redirect: "if_required",
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "Unable to confirm Stripe payment.",
        );
      }
    },
    [elements, stripe],
  );

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
        onControllerReady?.({ tokenize, confirm });
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
      ),
    [mergedAppearance, stripeConfig?.paymentElementOptions, stripeLocale],
  );

  if (!stripePromise || !publishableKey || !stripeConfig || !elementsOptions) {
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
