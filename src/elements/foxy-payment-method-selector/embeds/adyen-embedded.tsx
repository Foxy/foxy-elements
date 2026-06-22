import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import type { PaymentController, PaymentMethodSelectorOption } from "../types";

import { useEffect, useRef, useState } from "react";

const ADYEN_WEB_VERSION = "6.36.0";
const ADYEN_EMBEDDED_STYLES = `
.foxy-adyen-embedded {
  --foxy-adyen-input-height: var(--input-height, calc((var(--spacing, 0.25rem) * 8) - 2px));
  --foxy-adyen-input-padding-x: var(--input-padding-x, 0.625rem);
  --foxy-adyen-input-padding-y: var(--input-padding-y, 0.25rem);
  --foxy-adyen-label-input-gap: calc(var(--foxy-adyen-spacing) * 2);
  --foxy-adyen-input-text-size: var(--input-font-size, var(--text-sm, 0.875rem));
  --foxy-adyen-spacing: var(--spacing, 0.25rem);
  --foxy-adyen-radius: var(--radius, 0.625rem);
  --foxy-adyen-button-background: var(--primary, #00112c);
  --foxy-adyen-button-background-hover: color-mix(in srgb, var(--foxy-adyen-button-background) 90%, transparent);
  --foxy-adyen-button-foreground: var(--primary-foreground, #ffffff);
  --adyen-sdk-color-label-primary: var(--input-text-color, var(--foreground, #00112c));
  --adyen-sdk-color-label-secondary: var(--muted-foreground, #5c687c);
  --adyen-sdk-color-label-tertiary: var(--muted-foreground, #8d95a3);
  --adyen-sdk-color-label-disabled: var(--muted-foreground, #8d95a3);
  --adyen-sdk-color-label-critical: var(--input-error-text-color, var(--destructive, #e22d2d));
  --adyen-sdk-color-label-highlight: var(--primary, #0070f5);
  --adyen-sdk-color-label-on-color: var(--foxy-adyen-button-foreground);
  --adyen-sdk-color-background-primary: var(--card, var(--background, #ffffff));
  --adyen-sdk-color-background-primary-hover: var(--muted, #f7f7f8);
  --adyen-sdk-color-background-secondary: var(--muted, #f7f7f8);
  --adyen-sdk-color-background-secondary-hover: var(--muted, #eeeff1);
  --adyen-sdk-color-background-secondary-active: var(--muted, #e3e5e9);
  --adyen-sdk-color-background-tertiary: var(--muted, #eeeff1);
  --adyen-sdk-color-background-disabled: var(--muted, #eeeff1);
  --adyen-sdk-color-background-critical-strong: var(--input-error-text-color, var(--destructive, #e22d2d));
  --adyen-sdk-color-background-inverse-primary: var(--foreground, #00112c);
  --adyen-sdk-color-background-inverse-primary-hover: var(--muted-foreground, #5c687c);
  --adyen-sdk-color-background-always-dark: var(--foxy-adyen-button-background);
  --adyen-sdk-color-background-always-dark-active: var(--foxy-adyen-button-background);
  --adyen-sdk-color-outline-primary: var(--input, var(--border, #dbdee2));
  --adyen-sdk-color-outline-primary-hover: var(--border, #c9cdd3);
  --adyen-sdk-color-outline-primary-active: var(--ring, var(--primary, #00112c));
  --adyen-sdk-color-outline-secondary: var(--border, #c9cdd3);
  --adyen-sdk-color-outline-tertiary: var(--muted-foreground, #8d95a3);
  --adyen-sdk-color-outline-disabled: var(--border, #dbdee2);
  --adyen-sdk-color-outline-critical: var(--input-error-text-color, var(--destructive, #e22d2d));
  --adyen-sdk-color-separator-primary: var(--border, #dbdee2);
  --adyen-sdk-text-caption-font-size: 0.75rem;
  --adyen-sdk-text-caption-line-height: 1.125rem;
  --adyen-sdk-text-body-font-size: var(--foxy-adyen-input-text-size);
  --adyen-sdk-text-body-line-height: 1.25rem;
  --adyen-sdk-text-body-font-weight: 400;
  --adyen-sdk-text-body-stronger-font-weight: 500;
  --adyen-sdk-text-subtitle-font-size: var(--foxy-adyen-input-text-size);
  --adyen-sdk-text-subtitle-font-weight: 500;
  --adyen-sdk-text-subtitle-stronger-font-weight: 600;
  --adyen-sdk-text-subtitle-line-height: 1.25rem;
  --adyen-sdk-text-title-font-size: var(--foxy-adyen-input-text-size);
  --adyen-sdk-text-title-font-weight: 600;
  --adyen-sdk-text-title-line-height: 1.25rem;
  --adyen-sdk-spacer-000: 0px;
  --adyen-sdk-spacer-010: calc(var(--foxy-adyen-spacing) * 0.5);
  --adyen-sdk-spacer-020: var(--foxy-adyen-label-input-gap);
  --adyen-sdk-spacer-030: calc(var(--foxy-adyen-spacing) * 1.5);
  --adyen-sdk-spacer-040: calc(var(--foxy-adyen-spacing) * 2);
  --adyen-sdk-spacer-050: calc(var(--foxy-adyen-spacing) * 2.5);
  --adyen-sdk-spacer-060: var(--foxy-adyen-input-padding-x);
  --adyen-sdk-spacer-070: calc(var(--foxy-adyen-spacing) * 4);
  --adyen-sdk-spacer-080: calc(var(--foxy-adyen-spacing) * 5);
  --adyen-sdk-spacer-090: calc(var(--foxy-adyen-spacing) * 6);
  --adyen-sdk-spacer-100: calc(var(--foxy-adyen-spacing) * 8);
  --adyen-sdk-spacer-110: var(--foxy-adyen-input-height);
  --adyen-sdk-spacer-120: calc(var(--foxy-adyen-spacing) * 12);
  --adyen-sdk-spacer-130: calc(var(--foxy-adyen-spacing) * 14);
  --adyen-sdk-spacer-140: calc(var(--foxy-adyen-spacing) * 16);
  --adyen-sdk-border-radius-xs: calc(var(--foxy-adyen-radius) * 0.25);
  --adyen-sdk-border-radius-s: calc(var(--foxy-adyen-radius) * 0.5);
  --adyen-sdk-border-radius-m: calc(var(--foxy-adyen-radius) * 1);
  --adyen-sdk-border-radius-l: calc(var(--foxy-adyen-radius) * 1.5);
  --adyen-sdk-border-radius-xl: calc(var(--foxy-adyen-radius) * 1.75);
  --adyen-sdk-border-width-s: 1px;
  --adyen-sdk-border-width-m: 2px;
  --adyen-sdk-border-width-l: 3px;
  --adyen-sdk-shadow-low: none;
  --adyen-sdk-focus-ring-color: var(--ring, rgba(0, 112, 245, 0.8));
  color: var(--foreground, #020817);
  display: grid;
  font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
  gap: calc(var(--spacing, 0.25rem) * 2);
}

.foxy-adyen-embedded__probe {
  opacity: 0;
  pointer-events: none;
  position: absolute;
}

.foxy-adyen-embedded__message {
  color: var(--muted-foreground, #64748b);
  font-size: 0.875rem;
  margin: 0;
}

.foxy-adyen-embedded__message--error {
  color: var(--destructive, #b91c1c);
}

.foxy-adyen-embedded .adyen-checkout-form-instruction {
  display: none;
}

.foxy-adyen-embedded .adyen-checkout__button--pay {
  background: var(--foxy-adyen-button-background);
  border-color: var(--foxy-adyen-button-background);
  border-radius: var(--foxy-adyen-radius);
  color: var(--foxy-adyen-button-foreground);
}

.foxy-adyen-embedded .adyen-checkout__button--pay:not(:disabled):hover,
.foxy-adyen-embedded .adyen-checkout__button--pay:not(:disabled):focus-visible {
  background: var(--foxy-adyen-button-background-hover);
  border-color: var(--foxy-adyen-button-background-hover);
  color: var(--foxy-adyen-button-foreground);
}

.foxy-adyen-embedded .adyen-checkout__button--pay:not(:disabled):active {
  background: var(--foxy-adyen-button-background);
  border-color: var(--foxy-adyen-button-background);
}

.foxy-adyen-embedded .adyen-checkout__dropdown__list {
  padding: calc(var(--foxy-adyen-spacing) * 1);
}

.foxy-adyen-embedded .adyen-checkout__dropdown__element {
  border: none;
  border-radius: var(--adyen-sdk-border-radius-s);
  padding: calc(var(--foxy-adyen-spacing) * 1.5) calc(var(--foxy-adyen-spacing) * 2);
}

.foxy-adyen-embedded .adyen-checkout__dropdown__element:hover {
  background: var(--adyen-sdk-color-background-secondary);
  border-radius: var(--adyen-sdk-border-radius-s);
}

.foxy-adyen-embedded .adyen-checkout__dropdown__element.adyen-checkout__dropdown__element--active {
  box-shadow: none;
  border-radius: var(--adyen-sdk-border-radius-s);
}
`;

type AdyenStatus = "loading" | "ready" | "unavailable" | "error";

type AdyenComponent = {
  mount?: (element: HTMLElement) => unknown;
  unmount?: () => unknown;
  isAvailable?: () => Promise<unknown>;
  submit?: () => unknown;
};

type AdyenCheckoutLike = {
  [key: string]: unknown;
};

type AdyenComponentConstructor = new (
  checkout: AdyenCheckoutLike,
  props?: Record<string, unknown>,
) => AdyenComponent;

type CheckoutClientLike = {
  adyenEmbedded?: AdyenCheckoutLike | null;
};

type TokenizationRequest = {
  resolve: (value: { result: Record<string, unknown> }) => void;
  reject: (reason: Error) => void;
};

type AdyenEmbeddedOptionProps = {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  onControllerReady?: (controller: PaymentController | null) => void;
  loadingMessage?: string;
  unavailableMessage?: string;
  loadErrorMessage?: string;
  submitErrorMessage?: string;
};

type AdyenWindow = Window & {
  AdyenWeb?: Record<string, unknown>;
};

function getAdyenAssetBaseUrl(environment: string): string {
  return `https://checkoutshopper-${environment}.cdn.adyen.com/checkoutshopper/sdk/${ADYEN_WEB_VERSION}`;
}

function getAdyenCssUrl(environment: string): string {
  const scripts = Array.from(document.scripts);
  const adyenScript = scripts.find((script) =>
    script.src.includes("/checkoutshopper/sdk/"),
  );

  if (adyenScript?.src) {
    return adyenScript.src.replace(/\/adyen\.js(?:\?.*)?$/, "/adyen.css");
  }

  return `${getAdyenAssetBaseUrl(environment)}/adyen.css`;
}

function ensureAdyenCss(environment: string): void {
  if (typeof document === "undefined") return;

  const href = getAdyenCssUrl(environment);
  const existing = document.head.querySelector(
    `link[data-foxy-adyen-css="true"][href="${href}"]`,
  );
  if (existing) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.foxyAdyenCss = "true";
  document.head.append(link);
}

function ensureAdyenEmbeddedStyles(): void {
  if (typeof document === "undefined") return;

  const existing = document.head.querySelector(
    'style[data-foxy-adyen-embedded-styles="true"]',
  );
  if (existing) return;

  const style = document.createElement("style");
  style.dataset.foxyAdyenEmbeddedStyles = "true";
  style.textContent = ADYEN_EMBEDDED_STYLES;
  document.head.append(style);
}

function getAdyenWindow(): AdyenWindow | undefined {
  if (typeof window === "undefined") return undefined;
  return window as AdyenWindow;
}

function getAdyenComponentConstructor(
  checkout: AdyenCheckoutLike,
  componentName: string,
): AdyenComponentConstructor | undefined {
  const fromCheckout = checkout[componentName];
  if (typeof fromCheckout === "function") {
    return fromCheckout as AdyenComponentConstructor;
  }

  const fromNamespace = getAdyenWindow()?.AdyenWeb?.[componentName];
  if (typeof fromNamespace === "function") {
    return fromNamespace as AdyenComponentConstructor;
  }

  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toError(value: unknown, fallback: string): Error {
  if (value instanceof Error) return value;
  if (typeof value === "string" && value.trim()) return new Error(value);

  const record = asRecord(value);
  const message =
    typeof record?.message === "string" && record.message.trim()
      ? record.message
      : fallback;

  return new Error(message);
}

function settleRequest(
  request: TokenizationRequest | null,
  result: Record<string, unknown> | Error,
): void {
  if (!request) return;

  if (result instanceof Error) {
    request.reject(result);
    return;
  }

  request.resolve({ result });
}

function cleanupAdyenComponent(
  component: AdyenComponent | null,
  container: HTMLElement | null | undefined,
): void {
  try {
    component?.unmount?.();
  } catch {
    container?.replaceChildren();
    return;
  }

  container?.replaceChildren();
}

export default function AdyenEmbeddedOption({
  option,
  disabled,
  onControllerReady,
  loadingMessage = "Loading payment details...",
  unavailableMessage = "This payment method is currently unavailable.",
  loadErrorMessage = "Unable to load this payment method. Choose a different payment method or try again.",
  submitErrorMessage = "Unable to submit this payment method. Try again.",
}: AdyenEmbeddedOptionProps) {
  const [status, setStatus] = useState<AdyenStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const componentRef = useRef<AdyenComponent | null>(null);
  const readyPromiseRef = useRef<Promise<void> | null>(null);
  const statusRef = useRef<AdyenStatus>("loading");
  const errorRef = useRef<string | null>(null);
  const tokenizationRequestRef = useRef<TokenizationRequest | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  useEffect(() => {
    const adyenOption = option.adyenEmbedded;
    const container = containerRef.current;

    onControllerReady?.(null);
    tokenizationRequestRef.current = null;
    cleanupAdyenComponent(componentRef.current, container);
    componentRef.current = null;
    setStatus("loading");
    setError(null);

    if (!adyenOption || !container) return;

    const checkout = (checkoutClient as CheckoutClientLike).adyenEmbedded;
    const Component = checkout
      ? getAdyenComponentConstructor(checkout, "Dropin")
      : undefined;

    if (!checkout || !Component) {
      setStatus("error");
      setError(loadErrorMessage);
      return;
    }

    ensureAdyenCss(adyenOption.environment);
    ensureAdyenEmbeddedStyles();

    let cancelled = false;
    const component = new Component(checkout, {
      showPayButton: false,
      readOnly: Boolean(disabled),
      onPaymentCompleted: (result: unknown) => {
        const request = tokenizationRequestRef.current;
        tokenizationRequestRef.current = null;
        const resultRecord = asRecord(result) ?? { value: result };
        settleRequest(request, resultRecord);
      },
      onPaymentFailed: (result: unknown) => {
        const request = tokenizationRequestRef.current;
        tokenizationRequestRef.current = null;
        const normalizedError = toError(result, submitErrorMessage);
        setError(normalizedError.message);
        settleRequest(request, normalizedError);
      },
      onError: (error: unknown) => {
        const request = tokenizationRequestRef.current;
        tokenizationRequestRef.current = null;
        const normalizedError = toError(error, submitErrorMessage);
        setStatus("error");
        setError(normalizedError.message);
        settleRequest(request, normalizedError);
      },
    });

    componentRef.current = component;

    const controller: PaymentController = {
      tokenize: async () => {
        if (statusRef.current === "loading" && readyPromiseRef.current) {
          await readyPromiseRef.current;
        }

        if (statusRef.current === "unavailable") {
          throw new Error(unavailableMessage);
        }

        if (statusRef.current === "error") {
          throw new Error(errorRef.current ?? loadErrorMessage);
        }

        const mountedComponent = componentRef.current;
        if (!mountedComponent?.submit) {
          throw new Error(loadErrorMessage);
        }

        return await new Promise((resolve, reject) => {
          tokenizationRequestRef.current = {
            resolve,
            reject,
          };

          try {
            mountedComponent.submit?.();
          } catch (error) {
            tokenizationRequestRef.current = null;
            reject(toError(error, submitErrorMessage));
          }
        });
      },
    };

    onControllerReady?.(controller);

    try {
      component.mount?.(container);
    } catch (error) {
      componentRef.current = null;
      cleanupAdyenComponent(component, container);
      onControllerReady?.(null);
      setStatus("error");
      setError(toError(error, loadErrorMessage).message);
      return;
    }

    const readyPromise = Promise.resolve(component.isAvailable?.())
      .then(() => {
        if (cancelled) return;
        setStatus("ready");
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("unavailable");
        setError(unavailableMessage);
      })
      .finally(() => {
        if (readyPromiseRef.current === readyPromise) {
          readyPromiseRef.current = null;
        }
      });

    readyPromiseRef.current = readyPromise;

    return () => {
      cancelled = true;
      readyPromiseRef.current = null;
      const request = tokenizationRequestRef.current;
      tokenizationRequestRef.current = null;
      settleRequest(request, new Error(submitErrorMessage));
      cleanupAdyenComponent(component, container);
      onControllerReady?.(null);

      if (componentRef.current === component) {
        componentRef.current = null;
      }
    };
  }, [
    disabled,
    loadErrorMessage,
    onControllerReady,
    option.adyenEmbedded,
    option.id,
    submitErrorMessage,
    unavailableMessage,
  ]);

  if (!option.adyenEmbedded) {
    return null;
  }

  return (
    <div className="foxy-adyen-embedded">
      <div
        ref={containerRef}
        data-adyen-embedded-component="true"
        data-adyen-embedded-status={status}
        aria-disabled={disabled ? "true" : undefined}
      />
      {status === "loading" ? (
        <p className="foxy-adyen-embedded__message">{loadingMessage}</p>
      ) : null}
      {error ? (
        <p className="foxy-adyen-embedded__message foxy-adyen-embedded__message--error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
