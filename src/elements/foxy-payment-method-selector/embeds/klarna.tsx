import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import type { KlarnaSdkInstance } from "@foxy.io/sdk/checkout";
import type { PaymentController, PaymentMethodSelectorOption } from "../types";

import { useEffect, useRef, useState } from "react";

type KlarnaOptionEmbedProps = {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  onControllerReady?: (controller: PaymentController | null) => void;
  loadingMessage: string;
  unavailableMessage: string;
  loadErrorMessage: string;
  authorizeErrorMessage: string;
  finalizeErrorMessage: string;
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

type KlarnaPaymentsAuthorizationResult = {
  approved: boolean;
  show_form: boolean;
  authorization_token?: string;
  finalize_required?: boolean;
  error?: KlarnaPaymentsError;
};

type CheckoutClientLike = {
  klarna?: KlarnaSdkInstance | null;
  state?: unknown;
  json?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toOptionalText(value: unknown): string | undefined {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized || undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function resolveApiState(
  client: CheckoutClientLike,
): Record<string, unknown> | null {
  const state = asRecord(client.state);
  if (state) return state;

  return asRecord(client.json);
}

function createKlarnaAddress(
  source: Record<string, unknown> | null,
  email?: string,
): Record<string, string> | undefined {
  if (!source) return undefined;

  const address: Record<string, string> = {};
  const givenName = toOptionalText(source.first_name);
  const familyName = toOptionalText(source.last_name);
  const phone = toOptionalText(source.phone);
  const streetAddress = toOptionalText(source.address1);
  const streetAddress2 = toOptionalText(source.address2);
  const postalCode = toOptionalText(source.postal_code);
  const city = toOptionalText(source.city);
  const region = toOptionalText(source.region);
  const country = toOptionalText(source.country);

  if (givenName) address.given_name = givenName;
  if (familyName) address.family_name = familyName;
  if (email) address.email = email;
  if (phone) address.phone = phone;
  if (streetAddress) address.street_address = streetAddress;
  if (streetAddress2) address.street_address2 = streetAddress2;
  if (postalCode) address.postal_code = postalCode;
  if (city) address.city = city;
  if (region) address.region = region;
  if (country) address.country = country;

  return Object.keys(address).length ? address : undefined;
}

function createAuthorizationData(
  apiState: Record<string, unknown> | null,
): Record<string, unknown> {
  if (!apiState) {
    return {};
  }

  const customer = asRecord(apiState.customer);
  const billingAddress = asRecord(apiState.billing_address);
  const shipments = Array.isArray(apiState.shipments) ? apiState.shipments : [];
  const shippingAddress = asRecord(shipments[0]);
  const email = toOptionalText(customer?.email);

  const payload: Record<string, unknown> = {};
  const klarnaBillingAddress = createKlarnaAddress(billingAddress, email);
  const klarnaShippingAddress = createKlarnaAddress(shippingAddress);

  if (klarnaBillingAddress) {
    payload.billing_address = klarnaBillingAddress;
  }

  if (klarnaShippingAddress) {
    payload.shipping_address = klarnaShippingAddress;
  }

  return payload;
}

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

function authorizeKlarnaWidget(
  klarna: KlarnaSdkInstance,
  paymentMethodCategory: string,
  authorizationData: Record<string, unknown>,
): Promise<KlarnaPaymentsAuthorizationResult> {
  return new Promise((resolve) => {
    klarna.Payments.authorize(
      {
        payment_method_category: paymentMethodCategory,
      },
      authorizationData,
      resolve,
    );
  });
}

function finalizeKlarnaWidget(
  klarna: KlarnaSdkInstance,
  paymentMethodCategory: string,
  authorizationData: Record<string, unknown>,
): Promise<KlarnaPaymentsAuthorizationResult> {
  return new Promise((resolve) => {
    klarna.Payments.finalize(
      {
        payment_method_category: paymentMethodCategory,
      },
      authorizationData,
      resolve,
    );
  });
}

export default function KlarnaOptionEmbed({
  option,
  disabled,
  onControllerReady,
  loadingMessage,
  unavailableMessage,
  loadErrorMessage,
  authorizeErrorMessage,
  finalizeErrorMessage,
}: KlarnaOptionEmbedProps) {
  const [status, setStatus] = useState<KlarnaStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadPromiseRef = useRef<Promise<void> | null>(null);
  const statusRef = useRef<KlarnaStatus>("loading");
  const errorRef = useRef<string | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  useEffect(() => {
    const klarnaOption = option.klarna;
    const container = containerRef.current;

    if (!klarnaOption || !container) {
      return;
    }

    const klarna = (checkoutClient as CheckoutClientLike).klarna;

    container.innerHTML = "";
    setStatus("loading");
    setError(null);

    if (!klarna?.Payments) {
      setStatus("error");
      setError(loadErrorMessage);
      return;
    }

    let cancelled = false;
    const loadPromise = loadKlarnaWidget(
      klarna,
      container,
      klarnaOption.category.identifier,
    )
      .then((result) => {
        if (cancelled) {
          return;
        }

        if (result.show_form) {
          setStatus("ready");
          setError(null);
          return;
        }

        setStatus("unavailable");
        setError(unavailableMessage);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setStatus("error");
        setError(loadErrorMessage);
      })
      .finally(() => {
        if (loadPromiseRef.current === loadPromise) {
          loadPromiseRef.current = null;
        }
      });

    loadPromiseRef.current = loadPromise;

    return () => {
      cancelled = true;
      loadPromiseRef.current = null;
      container.innerHTML = "";
    };
  }, [
    loadErrorMessage,
    option.id,
    option.klarna?.category.identifier,
    unavailableMessage,
  ]);

  useEffect(() => {
    const klarnaOption = option.klarna;
    if (!klarnaOption) {
      return;
    }

    const controller: PaymentController = {
      tokenize: async () => {
        const klarna = (checkoutClient as CheckoutClientLike).klarna;

        if (!klarna?.Payments) {
          setStatus("error");
          setError(loadErrorMessage);
          throw new Error(loadErrorMessage);
        }

        if (statusRef.current === "loading" && loadPromiseRef.current) {
          await loadPromiseRef.current;
        }

        if (statusRef.current === "unavailable") {
          throw new Error(unavailableMessage);
        }

        if (statusRef.current === "error") {
          throw new Error(errorRef.current ?? loadErrorMessage);
        }

        const authorizationData = createAuthorizationData(
          resolveApiState(checkoutClient as CheckoutClientLike),
        );

        const authorization = await authorizeKlarnaWidget(
          klarna,
          klarnaOption.category.identifier,
          authorizationData,
        );

        if (!authorization.approved) {
          if (!authorization.show_form) {
            setStatus("unavailable");
            setError(unavailableMessage);
            throw new Error(unavailableMessage);
          }

          setError(authorizeErrorMessage);
          throw new Error(authorizeErrorMessage);
        }

        let authorizationToken = authorization.authorization_token;

        if (authorization.finalize_required) {
          const finalized = await finalizeKlarnaWidget(
            klarna,
            klarnaOption.category.identifier,
            authorizationData,
          );

          if (!finalized.approved) {
            if (!finalized.show_form) {
              setStatus("unavailable");
              setError(unavailableMessage);
              throw new Error(unavailableMessage);
            }

            setError(finalizeErrorMessage);
            throw new Error(finalizeErrorMessage);
          }

          authorizationToken =
            finalized.authorization_token ?? authorizationToken;
        }

        if (!authorizationToken) {
          setError(authorizeErrorMessage);
          throw new Error(
            "Klarna authorization response is missing an authorization token.",
          );
        }

        setStatus("ready");
        setError(null);

        return {
          authorizationToken,
          sessionId: klarnaOption.sessionId,
          paymentMethodCategory: klarnaOption.category.identifier,
        };
      },
    };

    onControllerReady?.(controller);

    return () => {
      onControllerReady?.(null);
    };
  }, [
    authorizeErrorMessage,
    finalizeErrorMessage,
    loadErrorMessage,
    loadingMessage,
    onControllerReady,
    option.id,
    option.klarna?.category.identifier,
    option.klarna?.sessionId,
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
