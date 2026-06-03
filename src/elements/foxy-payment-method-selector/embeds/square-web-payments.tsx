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

import { useEffect, useRef, useState } from "react";
import {
  useResolvedHostedFieldStyleAttributes,
  resolveDesignTokens,
} from "../stripe/style-hooks";

// Square enforces a 16px maximum on fontSize.
function clampFontSizeForSquare(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const px = parseFloat(value);
  return Number.isFinite(px) ? `${Math.min(px, 16)}px` : undefined;
}

function isTransparentColor(color: string): boolean {
  const c = color.replace(/\s/g, "");
  return c === "transparent" || c === "rgba(0,0,0,0)";
}

const SQUARE_WEB_PAYMENTS_STYLES = `
.foxy-square-web-payments {
  display: grid;
  font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
  gap: calc(var(--spacing, 0.25rem) * 2);
}

.foxy-square-web-payments__probe {
  opacity: 0;
  pointer-events: none;
  position: absolute;
}

.foxy-square-web-payments__placeholder {
  min-height: 0;
}

.foxy-square-web-payments__message {
  color: var(--muted-foreground, #64748b);
  font-size: 0.875rem;
  margin: 0;
}

.foxy-square-web-payments__message--error {
  color: var(--destructive, #b91c1c);
}

.sq-card-message:not(.sq-visible) {
  display: none;
}
`;

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

function ensureSquareWebPaymentsStyles(): void {
  if (typeof document === "undefined") return;
  const existing = document.head.querySelector(
    'style[data-foxy-square-web-payments-styles="true"]',
  );
  if (existing) return;
  const style = document.createElement("style");
  style.dataset.foxySquareWebPaymentsStyles = "true";
  style.textContent = SQUARE_WEB_PAYMENTS_STYLES;
  document.head.append(style);
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
  const {
    probeRef,
    ready: stylesReady,
    styleAttributes,
  } = useResolvedHostedFieldStyleAttributes({
    inputTextColorFallbackVariable: "--foreground",
    inputTextSizeFallbackVariable: "--text-sm",
  });

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

    onControllerReady?.(null);
    tokenizationRequestRef.current = null;

    const prevComponent = componentRef.current;
    componentRef.current = null;
    attachedRef.current = null;

    setStatus("loading");
    setError(null);

    if (!squareUpOption || !placeholder || !stylesReady) return;

    if (!squareInstance) {
      // Wait for afterStateChange to set squareInstance.
      return;
    }

    ensureSquareWebPaymentsStyles();

    // Square's attach() requires document.contains(element) === true, which is always
    // false for shadow DOM nodes. We create the real mount target in document.body.
    const mountDiv = createSquareMountDiv();
    syncMountPosition(placeholder, mountDiv);

    const syncPosition = () => syncMountPosition(placeholder, mountDiv);
    window.addEventListener("scroll", syncPosition, { capture: true, passive: true });
    window.addEventListener("resize", syncPosition, { passive: true });

    // Keep placeholder height in sync with the Square iframe height.
    const ro = new ResizeObserver(() => {
      const h = mountDiv.scrollHeight;
      if (h > 0) placeholder.style.minHeight = h + "px";
      syncPosition();
    });
    ro.observe(mountDiv);

    let cancelled = false;

    // Resolve design tokens from the probe element (converts oklch → rgb for compatibility).
    const probe = probeRef.current;
    const tokens = probe ? resolveDesignTokens(probe) : {};

    const squareStyle: Record<string, Record<string, string>> = {};

    // .input-container — border color and radius only (backgroundColor is not a valid property here)
    const containerStyle: Record<string, string> = {};
    if (tokens.borderColor) containerStyle.borderColor = tokens.borderColor;
    if (tokens.borderRadius) containerStyle.borderRadius = tokens.borderRadius;
    if (Object.keys(containerStyle).length) squareStyle[".input-container"] = containerStyle;

    // .input-container.is-focus — highlight border on focus
    if (tokens.focusRingColor) {
      squareStyle[".input-container.is-focus"] = { borderColor: tokens.focusRingColor };
    }

    // .input-container.is-error — error border
    if (tokens.destructiveColor) {
      squareStyle[".input-container.is-error"] = { borderColor: tokens.destructiveColor };
    }

    // input — text color, font size, background (fontFamily always uses Square's default)
    const inputStyle: Record<string, string> = {};
    if (styleAttributes.inputTextColor) inputStyle.color = styleAttributes.inputTextColor;
    const clampedFontSize = clampFontSizeForSquare(styleAttributes.inputTextSize);
    if (clampedFontSize) inputStyle.fontSize = clampedFontSize;
    if (tokens.inputBackgroundColor) inputStyle.backgroundColor = tokens.inputBackgroundColor;
    if (Object.keys(inputStyle).length) squareStyle["input"] = inputStyle;

    // input::placeholder
    if (styleAttributes.inputPlaceholderColor) {
      squareStyle["input::placeholder"] = { color: styleAttributes.inputPlaceholderColor };
    }

    // input.is-error — error text color
    const errorTextColor = styleAttributes.inputTextColorError ?? tokens.destructiveColor;
    if (errorTextColor) squareStyle["input.is-error"] = { color: errorTextColor };

    // .message-text / .message-icon — informational messages use muted foreground
    const messageColor = styleAttributes.inputPlaceholderColor;
    if (messageColor) {
      squareStyle[".message-text"] = { color: messageColor };
      squareStyle[".message-icon"] = { color: messageColor };
    }

    // .message-text.is-error / .message-icon.is-error
    if (tokens.destructiveColor) {
      squareStyle[".message-text.is-error"] = { color: tokens.destructiveColor };
      squareStyle[".message-icon.is-error"] = { color: tokens.destructiveColor };
    }

    const cardOptions: Record<string, unknown> = {};
    if (Object.keys(squareStyle).length > 0) {
      cardOptions.style = squareStyle;
    }

    const factoryMethod =
      option.type === "ach"
        ? () => squareInstance.ach()
        : () => squareInstance.card(cardOptions);

    const attachPromise = factoryMethod()
      .then((component) => {
        if (cancelled) {
          component.destroy().catch(() => {});
          return;
        }

        componentRef.current = component;
        prevComponent?.destroy().catch(() => {});

        const controller: PaymentController = {
          tokenize: async () => {
            if (attachedRef.current) await attachedRef.current;

            if (statusRef.current === "error") {
              throw new Error(errorRef.current ?? loadErrorMessage);
            }

            const mountedComponent = componentRef.current;
            if (!mountedComponent) throw new Error(loadErrorMessage);

            return await new Promise((resolve, reject) => {
              tokenizationRequestRef.current = { resolve, reject };

              mountedComponent
                .tokenize()
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

        onControllerReady?.(controller);

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
        onControllerReady?.(null);
      });

    void attachPromise;

    return () => {
      cancelled = true;
      attachedRef.current = null;

      window.removeEventListener("scroll", syncPosition, { capture: true });
      window.removeEventListener("resize", syncPosition);
      ro.disconnect();

      document.body.removeChild(mountDiv);

      const request = tokenizationRequestRef.current;
      tokenizationRequestRef.current = null;
      if (request) request.reject(new Error(submitErrorMessage));

      const component = componentRef.current;
      componentRef.current = null;
      if (component) component.destroy().catch(() => {});

      onControllerReady?.(null);
    };
  }, [
    disabled,
    loadErrorMessage,
    onControllerReady,
    option.squareUp,
    option.type,
    option.id,
    squareInstance,
    styleAttributes.inputPlaceholderColor,
    styleAttributes.inputTextColor,
    styleAttributes.inputTextColorError,
    styleAttributes.inputTextSize,
    stylesReady,
    submitErrorMessage,
  ]);

  if (!option.squareUp) {
    return null;
  }

  return (
    <div className="foxy-square-web-payments">
      <div
        ref={probeRef}
        className="foxy-square-web-payments__probe"
        aria-hidden="true"
      />
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
