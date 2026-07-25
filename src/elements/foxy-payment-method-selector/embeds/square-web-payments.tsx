import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import type { PaymentController, PaymentMethodSelectorOption } from "../types";

type SquareInstance = NonNullable<typeof checkoutClient.square>;

type SquarePaymentComponent = {
  attach(selector: string | HTMLElement): Promise<void>;
  destroy(): Promise<void>;
  tokenize(options?: Record<string, unknown>): Promise<{
    token?: string;
    status: string;
    errors?: { field?: string; message: string; type: string }[];
  }>;
};

// Square's wallet SDK methods are not fully reflected in the foxy-sdk types.
type SquareWalletMethods = {
  paymentRequest(opts: {
    countryCode: string;
    currencyCode: string;
    total: { amount: string; label: string };
  }): unknown;
  applePay(req: unknown): Promise<SquarePaymentComponent>;
  googlePay(req: unknown): Promise<SquarePaymentComponent>;
  cashApp(req: unknown): Promise<SquarePaymentComponent>;
  afterpayClearpay(req: unknown): Promise<SquarePaymentComponent>;
};

import { useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import { defaultTheme, type DesignSystemTheme } from "@foxy.io/design-system/theme";
import {
  useResolvedHostedFieldStyleAttributes,
  resolveDesignTokens,
  sanitizeCssValueOrDefault,
} from "../stripe/style-hooks";
import { remToPx } from "@/lib/theme-attribute-sync";

// Square enforces a 16px maximum on fontSize.
function clampFontSizeForSquare(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const px = parseFloat(value);
  return Number.isFinite(px) ? `${Math.min(px, 16)}px` : undefined;
}

// Square's style validator rejects any length it doesn't recognise and throws
// out the *whole* style object when it does, replacing the card form with an
// error message ("Invalid style value '0.5rem' for property 'borderRadius'").
// `rem` is one of the units it rejects, and every DS length token is in rem, so
// theme-derived lengths have to be resolved against the root font size first.
export function normalizeLengthForSquare(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const px = parseFloat(remToPx(value.trim()));
  return Number.isFinite(px) ? `${px}px` : undefined;
}


// Built from the current theme tokens and re-injected on every mount effect run
// (this stylesheet targets a light-DOM node in document.body, so it can't read
// theme values via styled-components/useTheme() at the point Square renders them).
//
// Theme tokens are customer-controllable (public `theme-*` HTML attributes,
// see `theme-mixin.ts`) and get interpolated directly into this file's CSS
// *source text*, not into a CSS custom property reference — so every token
// value must be sanitized before interpolation. `color.secondary`/`color.error`
// reuse `resolveDesignTokens`'s already-sanitized `mutedForeground`/`destructive`
// fields (computed elsewhere from the same theme tokens for Square's own style
// config) instead of re-reading the raw fields a second time unsanitized.
export function buildSquareWebPaymentsStyles(themeTokens: DesignSystemTheme): string {
  const tokens = resolveDesignTokens(themeTokens);
  const font = sanitizeCssValueOrDefault(themeTokens.font.body, defaultTheme.font.body);
  const spaceMd = sanitizeCssValueOrDefault(themeTokens.space.md, defaultTheme.space.md);
  const colorSecondary = tokens.mutedForeground ?? defaultTheme.color.secondary;
  const colorError = tokens.destructive ?? defaultTheme.color.error;

  return `
.foxy-square-web-payments {
  display: grid;
  font: ${font};
  gap: calc(${spaceMd} * 2);
}

.foxy-square-web-payments__placeholder {
  min-height: 0;
}

.foxy-square-web-payments__message {
  color: ${colorSecondary};
  font-size: 0.875rem;
  margin: 0;
}

.foxy-square-web-payments__message--error {
  color: ${colorError};
}

.sq-card-message:not(.sq-visible) {
  display: none;
}
`;
}

type SquareStatus = "loading" | "ready" | "error";

type TokenizationRequest = {
  resolve: (value: { token: string; status: string }) => void;
  reject: (reason: Error) => void;
};

type SquareWebPaymentsOptionProps = {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  onControllerReady?: (controller: PaymentController | null) => void;
  loadingMessage?: string;
  loadErrorMessage?: string;
  submitErrorMessage?: string;
};

function ensureSquareWebPaymentsStyles(themeTokens: DesignSystemTheme): void {
  if (typeof document === "undefined") return;
  let style = document.head.querySelector<HTMLStyleElement>(
    'style[data-foxy-square-web-payments-styles="true"]',
  );
  if (!style) {
    style = document.createElement("style");
    style.dataset.foxySquareWebPaymentsStyles = "true";
    document.head.append(style);
  }
  style.textContent = buildSquareWebPaymentsStyles(themeTokens);
}

function toError(value: unknown, fallback: string): Error {
  if (value instanceof Error) return value;
  if (typeof value === "string" && value.trim()) return new Error(value);
  return new Error(fallback);
}

// Square's attach() validates the container with document.contains(), which returns
// false for shadow DOM elements. We mount Square into a light DOM div in document.body,
// positioned fixed over the shadow DOM placeholder using getBoundingClientRect().
function createSquareMountDiv(): HTMLDivElement {
  const div = document.createElement("div");
  div.dataset.foxySquareMountPoint = "true";
  div.style.cssText = "position:fixed;z-index:0;overflow:hidden;pointer-events:auto;";
  document.body.appendChild(div);
  return div;
}

function syncMountPosition(
  placeholder: HTMLElement,
  mountDiv: HTMLElement,
): void {
  const rect = placeholder.getBoundingClientRect();
  mountDiv.style.top = rect.top + "px";
  mountDiv.style.left = rect.left + "px";
  mountDiv.style.width = rect.width + "px";
}

export default function SquareWebPaymentsOption({
  option,
  disabled,
  onControllerReady,
  loadingMessage = "Loading payment details...",
  loadErrorMessage = "Unable to load this payment method. Choose a different payment method or try again.",
  submitErrorMessage = "Unable to submit this payment method. Try again.",
}: SquareWebPaymentsOptionProps) {
  const [status, setStatus] = useState<SquareStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [squareInstance, setSquareInstance] = useState<SquareInstance | null>(
    () => checkoutClient.square,
  );
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const componentRef = useRef<SquarePaymentComponent | null>(null);
  const statusRef = useRef<SquareStatus>("loading");
  const errorRef = useRef<string | null>(null);
  const tokenizationRequestRef = useRef<TokenizationRequest | null>(null);
  const attachedRef = useRef<Promise<void> | null>(null);
  const onControllerReadyRef = useRef(onControllerReady);
  onControllerReadyRef.current = onControllerReady;
  const { styleAttributes } = useResolvedHostedFieldStyleAttributes();
  const { tokens: themeTokens } = useTheme() as { tokens: DesignSystemTheme };

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  // Wait for client.square to become available (it loads asynchronously).
  useEffect(() => {
    if (checkoutClient.square) {
      setSquareInstance(checkoutClient.square);
      return;
    }

    const handleStateChange = () => {
      if (checkoutClient.square) {
        setSquareInstance(checkoutClient.square);
      }
    };

    checkoutClient.addEventListener("afterStateChange", handleStateChange);
    checkoutClient.addEventListener("update", handleStateChange);

    return () => {
      checkoutClient.removeEventListener("afterStateChange", handleStateChange);
      checkoutClient.removeEventListener("update", handleStateChange);
    };
  }, []);

  useEffect(() => {
    const squareUpOption = option.squareUp;
    const placeholder = placeholderRef.current;

    onControllerReadyRef.current?.(null);
    tokenizationRequestRef.current = null;

    const prevComponent = componentRef.current;
    componentRef.current = null;
    attachedRef.current = null;

    setStatus("loading");
    setError(null);

    if (!squareUpOption || !placeholder) return;

    if (!squareInstance) {
      // Wait for afterStateChange to set squareInstance.
      return;
    }

    ensureSquareWebPaymentsStyles(themeTokens);

    // Square's attach() requires document.contains(element) === true, which is always
    // false for shadow DOM nodes. We create the real mount target in document.body.
    const mountDiv = createSquareMountDiv();
    syncMountPosition(placeholder, mountDiv);

    const syncPosition = () => syncMountPosition(placeholder, mountDiv);
    window.addEventListener("scroll", syncPosition, { capture: true, passive: true });
    window.addEventListener("resize", syncPosition, { passive: true });

    // Hide the fixed overlay when the option body is hidden (option not selected),
    // show and re-sync position when it becomes visible again.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          syncMountPosition(placeholder, mountDiv);
          mountDiv.style.display = "";
        } else {
          mountDiv.style.display = "none";
        }
      },
      { threshold: 0 },
    );
    io.observe(placeholder);

    // Keep placeholder height in sync with the Square iframe height.
    const ro = new ResizeObserver(() => {
      const h = mountDiv.scrollHeight;
      if (h > 0) placeholder.style.minHeight = h + "px";
      syncPosition();
    });
    ro.observe(mountDiv);

    let cancelled = false;

    // Resolve design tokens from the current theme (values are already literal —
    // no DOM measurement or oklch → rgb conversion needed).
    const tokens = resolveDesignTokens(themeTokens);

    const squareStyle: Record<string, Record<string, string>> = {};

    // .input-container — border color and radius only (backgroundColor is not a valid property here)
    const containerStyle: Record<string, string> = {};
    if (tokens.border) containerStyle.borderColor = tokens.border;
    const containerRadius = normalizeLengthForSquare(tokens.radius);
    if (containerRadius) containerStyle.borderRadius = containerRadius;
    if (Object.keys(containerStyle).length) squareStyle[".input-container"] = containerStyle;

    // .input-container.is-focus — highlight border on focus
    if (tokens.primary) {
      squareStyle[".input-container.is-focus"] = { borderColor: tokens.primary };
    }

    // .input-container.is-error — error border
    if (tokens.destructive) {
      squareStyle[".input-container.is-error"] = { borderColor: tokens.destructive };
    }

    // input — text color, font size, background (fontFamily always uses Square's default)
    const inputStyle: Record<string, string> = {};
    if (styleAttributes.inputTextColor) inputStyle.color = styleAttributes.inputTextColor;
    const clampedFontSize = clampFontSizeForSquare(styleAttributes.inputTextSize);
    if (clampedFontSize) inputStyle.fontSize = clampedFontSize;
    if (tokens.background) inputStyle.backgroundColor = tokens.background;
    if (Object.keys(inputStyle).length) squareStyle["input"] = inputStyle;

    // input::placeholder
    if (styleAttributes.inputPlaceholderColor) {
      squareStyle["input::placeholder"] = { color: styleAttributes.inputPlaceholderColor };
    }

    // input.is-error — error text color
    const errorTextColor = styleAttributes.inputTextColorError ?? tokens.destructive;
    if (errorTextColor) squareStyle["input.is-error"] = { color: errorTextColor };

    // .message-text / .message-icon — informational messages use muted foreground
    const messageColor = styleAttributes.inputPlaceholderColor;
    if (messageColor) {
      squareStyle[".message-text"] = { color: messageColor };
      squareStyle[".message-icon"] = { color: messageColor };
    }

    // .message-text.is-error / .message-icon.is-error
    if (tokens.destructive) {
      squareStyle[".message-text.is-error"] = { color: tokens.destructive };
      squareStyle[".message-icon.is-error"] = { color: tokens.destructive };
    }

    // Resolve the effective billing postal code. Square's card form requires a postal
    // code and will reject tokenization if the field is empty. Passing postalCode to
    // card() pre-populates Square's internal field so tokenize() works without SCA args.
    const apiJson = checkoutClient.json;
    const billingAddress = apiJson?.billing_address;
    const shipment = apiJson?.shipments?.[0];
    const useSeparateBilling = (
      billingAddress as { use_separate_billing_address?: boolean } | undefined
    )?.use_separate_billing_address;
    const resolvedPostalCode = (useSeparateBilling
      ? billingAddress?.postal_code
      : shipment?.postal_code) ?? "";

    const cardOptions: Record<string, unknown> = {};
    if (Object.keys(squareStyle).length > 0) {
      cardOptions.style = squareStyle;
    }
    if (resolvedPostalCode) {
      cardOptions.postalCode = resolvedPostalCode;
    }

    const factoryMethod =
      option.type === "ach"
        ? () => squareInstance.ach()
        : () => squareInstance.card(cardOptions);

    const attachPromise = factoryMethod()
      .then((component: SquarePaymentComponent) => {
        if (cancelled) {
          component.destroy().catch(() => {});
          return;
        }

        componentRef.current = component;
        prevComponent?.destroy().catch(() => {});

        const isAch = option.type === "ach";

        const controller: PaymentController = {
          tokenize: async () => {
            if (attachedRef.current) await attachedRef.current;

            if (statusRef.current === "error") {
              throw new Error(errorRef.current ?? loadErrorMessage);
            }

            const mountedComponent = componentRef.current;
            if (!mountedComponent) throw new Error(loadErrorMessage);

            // ACH tokenize opens the Plaid Link flow and requires the account holder name.
            // Card tokenize uses no options — postal code is pre-set at card() construction.
            const tokenizeOptions: Record<string, unknown> = {};
            if (isAch) {
              const apiJson = checkoutClient.json;
              const billing = apiJson?.billing_address;
              const shipment = apiJson?.shipments?.[0];
              const useSeparateBilling = (
                billing as { use_separate_billing_address?: boolean } | undefined
              )?.use_separate_billing_address;
              const addr = useSeparateBilling ? billing : shipment;
              const firstName = addr?.first_name ?? "";
              const lastName = addr?.last_name ?? "";
              const accountHolderName = `${firstName} ${lastName}`.trim();
              if (accountHolderName) tokenizeOptions.accountHolderName = accountHolderName;
            }

            return await new Promise((resolve, reject) => {
              tokenizationRequestRef.current = { resolve, reject };

              mountedComponent
                .tokenize(Object.keys(tokenizeOptions).length ? tokenizeOptions : undefined)
                .then((result) => {
                  const request = tokenizationRequestRef.current;
                  tokenizationRequestRef.current = null;

                  if (result.status !== "OK" || !result.token) {
                    const message = result.errors?.[0]?.message ?? submitErrorMessage;
                    if (request) request.reject(new Error(message));
                    setError(message);
                    return;
                  }

                  if (request) {
                    request.resolve({ token: result.token, status: result.status });
                  }
                })
                .catch((err: unknown) => {
                  const request = tokenizationRequestRef.current;
                  tokenizationRequestRef.current = null;
                  const normalizedError = toError(err, submitErrorMessage);
                  setError(normalizedError.message);
                  if (request) request.reject(normalizedError);
                });
            });
          },
        };

        if (isAch) {
          onControllerReadyRef.current?.(controller);
          if (!cancelled) {
            setStatus("ready");
            setError(null);
          }
          return;
        }

        onControllerReadyRef.current?.(controller);

        const attached = component.attach(mountDiv).then(() => {
          if (cancelled) return;
          setStatus("ready");
          setError(null);
        });

        attachedRef.current = attached;
        return attached;
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const normalizedError = toError(err, loadErrorMessage);
        setStatus("error");
        setError(normalizedError.message);
        onControllerReadyRef.current?.(null);
      });

    void attachPromise;

    return () => {
      cancelled = true;
      attachedRef.current = null;

      window.removeEventListener("scroll", syncPosition, { capture: true });
      window.removeEventListener("resize", syncPosition);
      io.disconnect();
      ro.disconnect();

      document.body.removeChild(mountDiv);

      const request = tokenizationRequestRef.current;
      tokenizationRequestRef.current = null;
      if (request) request.reject(new Error(submitErrorMessage));

      const component = componentRef.current;
      componentRef.current = null;
      if (component) component.destroy().catch(() => {});

      onControllerReadyRef.current?.(null);
    };
  }, [
    loadErrorMessage,
    option.squareUp?.applicationId,
    option.squareUp?.locationId,
    option.squareUp?.environment,
    option.type,
    option.id,
    squareInstance,
    styleAttributes.inputPlaceholderColor,
    styleAttributes.inputTextColor,
    styleAttributes.inputTextColorError,
    styleAttributes.inputTextSize,
    themeTokens.background.field,
    themeTokens.border.field,
    themeTokens.borderRadius.sm,
    themeTokens.color.error,
    themeTokens.color.primary,
    themeTokens.color.secondary,
    themeTokens.font.body,
    themeTokens.space.md,
    submitErrorMessage,
  ]);

  if (!option.squareUp) {
    return null;
  }

  return (
    <div className="foxy-square-web-payments">
      {/* Placeholder occupies layout space; the actual Square form mounts in document.body. */}
      <div
        ref={placeholderRef}
        className="foxy-square-web-payments__placeholder"
        data-square-web-payments-status={status}
        aria-disabled={disabled ? "true" : undefined}
      />
      {status === "loading" ? (
        <p className="foxy-square-web-payments__message">{loadingMessage}</p>
      ) : null}
      {error ? (
        <p className="foxy-square-web-payments__message foxy-square-web-payments__message--error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type SquareAchAvailabilityProbeProps = {
  option: PaymentMethodSelectorOption;
  onResolved: () => void;
  onUnavailable: () => void;
};

export function SquareAchAvailabilityProbe({
  option,
  onResolved,
  onUnavailable,
}: SquareAchAvailabilityProbeProps) {
  const [squareInstance, setSquareInstance] = useState<SquareInstance | null>(
    () => checkoutClient.square,
  );
  const onResolvedRef = useRef(onResolved);
  onResolvedRef.current = onResolved;
  const onUnavailableRef = useRef(onUnavailable);
  onUnavailableRef.current = onUnavailable;

  useEffect(() => {
    if (checkoutClient.square) {
      setSquareInstance(checkoutClient.square);
      return;
    }
    const handle = () => {
      if (checkoutClient.square) setSquareInstance(checkoutClient.square);
    };
    checkoutClient.addEventListener("afterStateChange", handle);
    checkoutClient.addEventListener("update", handle);
    return () => {
      checkoutClient.removeEventListener("afterStateChange", handle);
      checkoutClient.removeEventListener("update", handle);
    };
  }, []);

  useEffect(() => {
    if (!squareInstance || !option.squareUp) return;
    let cancelled = false;
    let probeComponent: SquarePaymentComponent | null = null;

    squareInstance
      .ach()
      .then((component: SquarePaymentComponent) => {
        probeComponent = component;
        if (cancelled) {
          component.destroy().catch(() => {});
          probeComponent = null;
          return;
        }
        return component.tokenize({}).then(
          () => {
            // tokenize({}) resolved — ACH is enabled (would only happen if accountHolderName
            // became optional in future SDK versions; treat as available).
            component.destroy().catch(() => {});
            probeComponent = null;
            if (!cancelled) onResolvedRef.current();
          },
          (err: unknown) => {
            component.destroy().catch(() => {});
            probeComponent = null;
            if (cancelled) return;
            if (String(err).includes("Invalid parameter format for ACH tokenize")) {
              // SDK checks can_use_ach_auth flag before validating options. This error
              // means the flag is not SUPPORTED — ACH is disabled for this merchant.
              onUnavailableRef.current();
            } else {
              // Different validation error means the flag check passed — ACH is enabled.
              // tokenize({}) just rejected because accountHolderName is required.
              onResolvedRef.current();
            }
          },
        );
      })
      .catch((err: unknown) => {
        probeComponent = null;
        if (cancelled) return;
        if (String(err).includes("Wallet is not available")) {
          // ACH is not supported in this merchant's country.
          onUnavailableRef.current();
        } else {
          // Unexpected init error — fail open so SquareWebPaymentsOption can surface it.
          onResolvedRef.current();
        }
      });

    return () => {
      cancelled = true;
      if (probeComponent) {
        probeComponent.destroy().catch(() => {});
        probeComponent = null;
      }
    };
  }, [
    squareInstance,
    option.squareUp?.applicationId,
    option.squareUp?.locationId,
    option.squareUp?.environment,
    option.id,
  ]);

  return null;
}

type SquareWalletAvailabilityProbeProps = {
  option: PaymentMethodSelectorOption;
  onResolved: () => void;
  onUnavailable: () => void;
};

export function SquareWalletAvailabilityProbe({
  option,
  onResolved,
  onUnavailable,
}: SquareWalletAvailabilityProbeProps) {
  const [squareInstance, setSquareInstance] = useState<SquareInstance | null>(
    () => checkoutClient.square,
  );
  const onResolvedRef = useRef(onResolved);
  onResolvedRef.current = onResolved;
  const onUnavailableRef = useRef(onUnavailable);
  onUnavailableRef.current = onUnavailable;

  useEffect(() => {
    if (checkoutClient.square) {
      setSquareInstance(checkoutClient.square);
      return;
    }
    const handle = () => {
      if (checkoutClient.square) setSquareInstance(checkoutClient.square);
    };
    checkoutClient.addEventListener("afterStateChange", handle);
    checkoutClient.addEventListener("update", handle);
    return () => {
      checkoutClient.removeEventListener("afterStateChange", handle);
      checkoutClient.removeEventListener("update", handle);
    };
  }, []);

  useEffect(() => {
    if (!squareInstance || !option.squareUp) return;

    const apiJson = checkoutClient.json as Record<string, unknown> | null | undefined;
    const format = (apiJson?.format ?? {}) as Record<string, unknown>;
    const billing = (apiJson?.billing_address ?? {}) as Record<string, unknown>;
    const totals = Array.isArray(apiJson?.totals)
      ? (apiJson.totals as Record<string, unknown>[])
      : [];
    const totalOrder = totals[0]?.total_order;
    const maximumFractionDigits =
      typeof format.maximum_fraction_digits === "number"
        ? format.maximum_fraction_digits
        : 2;

    if (typeof totalOrder !== "number" || !Number.isFinite(totalOrder)) {
      onResolvedRef.current();
      return;
    }

    const sq = squareInstance as SquareInstance & SquareWalletMethods;
    let paymentRequest: unknown;
    try {
      paymentRequest = sq.paymentRequest({
        countryCode: (billing.country as string) || "US",
        currencyCode: (format.currency_code as string) || "USD",
        total: { amount: totalOrder.toFixed(maximumFractionDigits), label: "Total" },
      });
    } catch {
      onResolvedRef.current();
      return;
    }

    let walletFactory: Promise<SquarePaymentComponent>;
    try {
      switch (option.type) {
        case "apple-pay":
          walletFactory = sq.applePay(paymentRequest);
          break;
        case "google-pay":
          walletFactory = sq.googlePay(paymentRequest);
          break;
        case "cash-app":
          walletFactory = sq.cashApp(paymentRequest);
          break;
        case "afterpay":
          walletFactory = sq.afterpayClearpay(paymentRequest);
          break;
        default:
          onResolvedRef.current();
          return;
      }
    } catch {
      // Method undefined on this SDK version — treat as unavailable.
      onUnavailableRef.current();
      return;
    }

    let cancelled = false;
    let probeComponent: SquarePaymentComponent | null = null;

    walletFactory
      .then((component) => {
        probeComponent = component;
        component.destroy().catch(() => {});
        probeComponent = null;
        if (!cancelled) onResolvedRef.current();
      })
      .catch((err: unknown) => {
        probeComponent = null;
        if (cancelled) return;
        const msg = String(err);
        if (
          msg.includes("Wallet is not available") ||
          msg.includes("Method unsupported") ||
          msg.includes("not registered") ||
          msg.includes("PaymentMethodUnsupportedError")
        ) {
          onUnavailableRef.current();
        } else {
          onResolvedRef.current();
        }
      });

    return () => {
      cancelled = true;
      if (probeComponent) {
        probeComponent.destroy().catch(() => {});
        probeComponent = null;
      }
    };
  }, [
    squareInstance,
    option.squareUp?.applicationId,
    option.squareUp?.locationId,
    option.squareUp?.environment,
    option.type,
    option.id,
  ]);

  return null;
}

type SquareWalletControllerProps = {
  option: PaymentMethodSelectorOption;
  onControllerReady?: (controller: PaymentController | null) => void;
  submitErrorMessage?: string;
};

// Afterpay and Cash App render as a button and must be attached to a DOM element
// before tokenize() can be called. Apple Pay and Google Pay open native sheets
// and do not need attachment.
const SQUARE_WALLET_ATTACH_TYPES = new Set(["afterpay", "cash-app"]);

export function SquareWalletController({
  option,
  onControllerReady,
  submitErrorMessage = "Unable to submit this payment method. Try again.",
}: SquareWalletControllerProps) {
  const [squareInstance, setSquareInstance] = useState<SquareInstance | null>(
    () => checkoutClient.square,
  );
  const onControllerReadyRef = useRef(onControllerReady);
  onControllerReadyRef.current = onControllerReady;

  useEffect(() => {
    if (checkoutClient.square) { setSquareInstance(checkoutClient.square); return; }
    const handle = () => { if (checkoutClient.square) setSquareInstance(checkoutClient.square); };
    checkoutClient.addEventListener("afterStateChange", handle);
    checkoutClient.addEventListener("update", handle);
    return () => {
      checkoutClient.removeEventListener("afterStateChange", handle);
      checkoutClient.removeEventListener("update", handle);
    };
  }, []);

  useEffect(() => {
    if (!squareInstance || !option.squareUp) {
      onControllerReadyRef.current?.(null);
      return;
    }

    const apiJson = checkoutClient.json as Record<string, unknown> | null | undefined;
    const format = (apiJson?.format ?? {}) as Record<string, unknown>;
    const billing = (apiJson?.billing_address ?? {}) as Record<string, unknown>;
    const totals = Array.isArray(apiJson?.totals) ? (apiJson.totals as Record<string, unknown>[]) : [];
    const totalOrder = totals[0]?.total_order;
    const maximumFractionDigits = typeof format.maximum_fraction_digits === "number" ? format.maximum_fraction_digits : 2;

    if (typeof totalOrder !== "number" || !Number.isFinite(totalOrder)) {
      onControllerReadyRef.current?.(null);
      return;
    }

    const sq = squareInstance as SquareInstance & SquareWalletMethods;
    let paymentRequest: unknown;
    try {
      paymentRequest = sq.paymentRequest({
        countryCode: (billing.country as string) || "US",
        currencyCode: (format.currency_code as string) || "USD",
        total: { amount: totalOrder.toFixed(maximumFractionDigits), label: "Total" },
      });
    } catch {
      onControllerReadyRef.current?.(null);
      return;
    }

    let walletFactory: Promise<SquarePaymentComponent>;
    try {
      switch (option.type) {
        case "apple-pay": walletFactory = sq.applePay(paymentRequest); break;
        case "google-pay": walletFactory = sq.googlePay(paymentRequest); break;
        case "cash-app": walletFactory = sq.cashApp(paymentRequest); break;
        case "afterpay": walletFactory = sq.afterpayClearpay(paymentRequest); break;
        default: onControllerReadyRef.current?.(null); return;
      }
    } catch {
      onControllerReadyRef.current?.(null);
      return;
    }

    // Square requires the attachment container to be in document.body — it uses
    // document.body.contains() to validate the element. Components inside shadow
    // DOM fail that check, so we create the mount node at the body level.
    let mountDiv: HTMLDivElement | null = null;
    if (SQUARE_WALLET_ATTACH_TYPES.has(option.type ?? "")) {
      mountDiv = document.createElement("div");
      mountDiv.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
      document.body.appendChild(mountDiv);
    }

    let cancelled = false;
    let walletComponent: SquarePaymentComponent | null = null;

    walletFactory
      .then(async (component) => {
        walletComponent = component;
        if (cancelled) { component.destroy().catch(() => {}); walletComponent = null; return; }

        if (mountDiv) {
          await component.attach(mountDiv);
          if (cancelled) { component.destroy().catch(() => {}); walletComponent = null; return; }
        }

        const controller: PaymentController = {
          tokenize: async () => {
            const result = await component.tokenize();
            if (result.status !== "OK" || !result.token) {
              throw new Error(result.errors?.[0]?.message ?? submitErrorMessage);
            }
            return { token: result.token };
          },
        };
        onControllerReadyRef.current?.(controller);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = (err instanceof Error ? err.message : String(err)) || submitErrorMessage;
        onControllerReadyRef.current?.({ tokenize: async () => { throw new Error(message); } });
      });

    return () => {
      cancelled = true;
      const c = walletComponent;
      walletComponent = null;
      onControllerReadyRef.current?.(null);
      if (c) c.destroy().catch(() => {});
      if (mountDiv) { mountDiv.remove(); mountDiv = null; }
    };
  }, [
    squareInstance,
    option.squareUp?.applicationId,
    option.squareUp?.locationId,
    option.squareUp?.environment,
    option.type,
    option.id,
    submitErrorMessage,
  ]);

  return null;
}
