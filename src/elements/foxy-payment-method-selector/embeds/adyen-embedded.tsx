import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import type { PaymentController, PaymentMethodSelectorOption } from "../types";
import { defaultTheme, type DesignSystemTheme } from "@foxy.io/design-system/theme";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import { deriveInputMetrics, parseFontShorthand } from "@/lib/theme-attribute-sync";
import { extractColorFromShorthand, sanitizeCssValueOrDefault } from "../stripe/style-hooks";

// Theme tokens are customer-controllable (public `theme-*` HTML attributes,
// see `theme-mixin.ts`) and get interpolated directly into this file's CSS
// *source text*, not into a CSS custom property reference — so every token
// value must be sanitized before interpolation. A value that fails
// sanitization (e.g. contains `;`, `}`, `url(`, or `@import`) falls back to
// the corresponding default-theme value rather than breaking the stylesheet.
const DEFAULT_FONT_FAMILY = parseFontShorthand(defaultTheme.font.body).fontFamily;

const ADYEN_WEB_VERSION = "6.36.0";

export function buildAdyenEmbeddedStyles(theme: DesignSystemTheme): string {
  const metrics = deriveInputMetrics({
    controlSize: theme.size.control,
    borderWidth: theme.size.borderWidth,
    fontBody: theme.font.body,
  });
  const { fontFamily: rawFontFamily } = parseFontShorthand(theme.font.body);
  const fontFamily = sanitizeCssValueOrDefault(rawFontFamily, DEFAULT_FONT_FAMILY);

  const rawInputColor = extractColorFromShorthand(theme.border.field) ?? theme.color.secondary;
  const rawRingColor = extractColorFromShorthand(theme.outline.primary) ?? theme.color.primary;
  const inputColor = sanitizeCssValueOrDefault(rawInputColor, defaultTheme.color.secondary);
  const ringColor = sanitizeCssValueOrDefault(rawRingColor, defaultTheme.color.primary);

  const spacing = sanitizeCssValueOrDefault(theme.space.md, defaultTheme.space.md);
  const radius = sanitizeCssValueOrDefault(theme.borderRadius.sm, defaultTheme.borderRadius.sm);
  const buttonBackground = sanitizeCssValueOrDefault(
    theme.background.buttonPrimary,
    defaultTheme.background.buttonPrimary,
  );
  const buttonForeground = sanitizeCssValueOrDefault(
    theme.color.onPrimary,
    defaultTheme.color.onPrimary,
  );
  const colorBody = sanitizeCssValueOrDefault(theme.color.body, defaultTheme.color.body);
  const colorSecondary = sanitizeCssValueOrDefault(
    theme.color.secondary,
    defaultTheme.color.secondary,
  );
  const colorError = sanitizeCssValueOrDefault(theme.color.error, defaultTheme.color.error);
  const colorPrimary = sanitizeCssValueOrDefault(theme.color.primary, defaultTheme.color.primary);
  const backgroundSurface = sanitizeCssValueOrDefault(
    theme.background.surface,
    defaultTheme.background.surface,
  );
  const backgroundDisabledField = sanitizeCssValueOrDefault(
    theme.background.disabledField,
    defaultTheme.background.disabledField,
  );

  return `
.foxy-adyen-embedded {
  --foxy-adyen-input-height: ${metrics.heightPx}px;
  --foxy-adyen-input-padding-x: ${metrics.paddingX};
  --foxy-adyen-input-padding-y: ${metrics.paddingY};
  --foxy-adyen-label-input-gap: calc(var(--foxy-adyen-spacing) * 2);
  --foxy-adyen-input-text-size: ${metrics.fontSize};
  --foxy-adyen-spacing: ${spacing};
  --foxy-adyen-radius: ${radius};
  --foxy-adyen-button-background: ${buttonBackground};
  --foxy-adyen-button-background-hover: color-mix(in srgb, var(--foxy-adyen-button-background) 90%, transparent);
  --foxy-adyen-button-foreground: ${buttonForeground};
  --adyen-sdk-color-label-primary: ${colorBody};
  --adyen-sdk-color-label-secondary: ${colorSecondary};
  --adyen-sdk-color-label-tertiary: ${colorSecondary};
  --adyen-sdk-color-label-disabled: ${colorSecondary};
  --adyen-sdk-color-label-critical: ${colorError};
  --adyen-sdk-color-label-highlight: ${colorPrimary};
  --adyen-sdk-color-label-on-color: var(--foxy-adyen-button-foreground);
  --adyen-sdk-color-background-primary: ${backgroundSurface};
  --adyen-sdk-color-background-primary-hover: ${backgroundDisabledField};
  --adyen-sdk-color-background-secondary: ${backgroundDisabledField};
  --adyen-sdk-color-background-secondary-hover: ${backgroundDisabledField};
  --adyen-sdk-color-background-secondary-active: ${backgroundDisabledField};
  --adyen-sdk-color-background-tertiary: ${backgroundDisabledField};
  --adyen-sdk-color-background-disabled: ${backgroundDisabledField};
  --adyen-sdk-color-background-critical-strong: ${colorError};
  --adyen-sdk-color-background-inverse-primary: ${colorBody};
  --adyen-sdk-color-background-inverse-primary-hover: ${colorSecondary};
  --adyen-sdk-color-background-always-dark: var(--foxy-adyen-button-background);
  --adyen-sdk-color-background-always-dark-active: var(--foxy-adyen-button-background);
  --adyen-sdk-color-outline-primary: ${inputColor};
  --adyen-sdk-color-outline-primary-hover: ${inputColor};
  --adyen-sdk-color-outline-primary-active: ${ringColor};
  --adyen-sdk-color-outline-secondary: ${inputColor};
  --adyen-sdk-color-outline-tertiary: ${colorSecondary};
  --adyen-sdk-color-outline-disabled: ${inputColor};
  --adyen-sdk-color-outline-critical: ${colorError};
  --adyen-sdk-color-separator-primary: ${inputColor};
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
  --adyen-sdk-focus-ring-color: ${ringColor};
  color: ${colorBody};
  display: grid;
  font-family: ${fontFamily};
  gap: calc(var(--foxy-adyen-spacing) * 2);
}

.foxy-adyen-embedded__message {
  color: ${colorSecondary};
  font-size: 0.875rem;
  margin: 0;
}

.foxy-adyen-embedded__message--error {
  color: ${colorError};
}

.foxy-adyen-embedded .adyen-checkout-brand-wrapper {
  order: 2;
}

.foxy-adyen-embedded .adyen-checkout__payment-methods-list {
  gap: calc(var(--foxy-adyen-spacing) * 2);
}

.foxy-adyen-embedded .adyen-checkout__payment-method__header {
  padding: 9px calc(var(--foxy-adyen-spacing) * 3);
}

.foxy-adyen-embedded .adyen-checkout__payment-method__header__details {
  font-family: ${fontFamily};
}

.foxy-adyen-embedded .adyen-checkout__payment-method__radio {
  background: transparent !important;
  border: 1px solid ${inputColor} !important;
  border-radius: 50% !important;
  inset: auto !important;
  position: relative;
}

.foxy-adyen-embedded .adyen-checkout__payment-method__radio::after {
  content: none;
}

.foxy-adyen-embedded .adyen-checkout__payment-method__radio--selected {
  background: transparent !important;
  border: 1px solid ${inputColor} !important;
}

.foxy-adyen-embedded .adyen-checkout__payment-method__radio--selected::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 50%;
  border-radius: 50%;
  background: ${colorPrimary};
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
}

type AdyenStatus = "loading" | "ready" | "unavailable" | "error";

type AdyenComponent = {
  mount?: (element: HTMLElement) => unknown;
  unmount?: () => unknown;
  isAvailable?: () => Promise<unknown>;
  submit?: () => unknown;
  closeActivePaymentMethod?: () => void;
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
  submitAdyenEmbeddedPayment?: (
    data: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;
  submitAdyenEmbeddedPaymentDetails?: (
    data: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;
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
  onSelect?: () => void;
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

function ensureAdyenEmbeddedStyles(theme: DesignSystemTheme): void {
  if (typeof document === "undefined") return;

  const css = buildAdyenEmbeddedStyles(theme);
  let style = document.head.querySelector(
    'style[data-foxy-adyen-embedded-styles="true"]',
  ) as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement("style");
    style.dataset.foxyAdyenEmbeddedStyles = "true";
    document.head.append(style);
  }

  if (style.textContent !== css) {
    style.textContent = css;
  }
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
  onSelect,
}: AdyenEmbeddedOptionProps) {
  const { tokens } = useTheme() as { tokens: DesignSystemTheme };
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

  // Kept as its own effect (not folded into the mount/unmount effect below):
  // `tokens` is a fresh object identity on every parent re-render (see
  // element.tsx's #buildThemeTokens()), so if this effect's dependency array
  // included `tokens`, the Drop-in mount effect would tear down and recreate
  // the Adyen SDK component on every theme-unrelated re-render too. This
  // effect only re-injects CSS text (idempotent, guarded by ensureAdyenEmbeddedStyles's
  // own textContent comparison) and never touches the mounted component.
  useEffect(() => {
    ensureAdyenEmbeddedStyles(tokens);
  }, [tokens]);

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
    ensureAdyenEmbeddedStyles(tokens);
    // Note: CSS re-injection on theme changes alone is handled by the
    // dedicated effect above; this call only guarantees the styles exist
    // before this effect proceeds to mount the Drop-in.

    let cancelled = false;
    let localComponent: AdyenComponent | null = null;

    if (cancelled) return;

    const component = new Component(checkout, {
      showRadioButton: true,
      showPayButton: false,
      paymentMethodsConfiguration: new Proxy({} as Record<string, unknown>, {
        get: () => ({ showPayButton: false }),
      }),
      disableFinalAnimation: true,
      readOnly: Boolean(disabled),
      onSelect: () => {
        onSelect?.();
      },
      onSubmit: async (state: unknown, _component: unknown, actions: unknown) => {
        const actionsRecord = asRecord(actions);
        try {
          const data =
            (asRecord(state)?.data as Record<string, unknown>) ?? {};
          const client = checkoutClient as CheckoutClientLike;
          const response =
            (await client.submitAdyenEmbeddedPayment?.(data)) ?? {};
          (actionsRecord?.resolve as (r: unknown) => void)?.(response);
        } catch (error) {
          (actionsRecord?.reject as () => void)?.();
          const request = tokenizationRequestRef.current;
          tokenizationRequestRef.current = null;
          settleRequest(request, toError(error, submitErrorMessage));
        }
      },
      onAdditionalDetails: async (
        state: unknown,
        _component: unknown,
        actions: unknown,
      ) => {
        const actionsRecord = asRecord(actions);
        try {
          const data =
            (asRecord(state)?.data as Record<string, unknown>) ?? {};
          const client = checkoutClient as CheckoutClientLike;
          const response =
            (await client.submitAdyenEmbeddedPaymentDetails?.(data)) ?? {};
          (actionsRecord?.resolve as (r: unknown) => void)?.(response);
        } catch (error) {
          (actionsRecord?.reject as () => void)?.();
          const request = tokenizationRequestRef.current;
          tokenizationRequestRef.current = null;
          settleRequest(request, toError(error, submitErrorMessage));
        }
      },
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

    localComponent = component;
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
      deselect: () => {
        try {
          componentRef.current?.closeActivePaymentMethod?.();
        } catch {
          // Ignore — the Drop-in may not be mounted yet or may already be
          // in a clean state.
        }
      },
    };

    onControllerReady?.(controller);

    try {
      component.mount?.(container);
    } catch (error) {
      localComponent = null;
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
      cleanupAdyenComponent(localComponent, container);
      onControllerReady?.(null);

      if (componentRef.current === localComponent) {
        componentRef.current = null;
      }
    };
  }, [
    disabled,
    loadErrorMessage,
    onControllerReady,
    onSelect,
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
