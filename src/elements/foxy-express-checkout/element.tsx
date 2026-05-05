import type {
  Stripe,
  StripeElementsOptions,
  StripeExpressCheckoutElementOptions,
  StripeExpressCheckoutElementReadyEvent,
} from "@stripe/stripe-js";
import type { Root } from "react-dom/client";

import { Alert, AlertDescription } from "@foxy.io/design-system/ui/alert";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import defaultShadowStyles from "@/index.css?inline";
import enUsMessages from "@/locales/en-US.json";
import {
  Elements,
  ExpressCheckoutElement as StripeExpressCheckoutElement,
} from "@stripe/react-stripe-js";
import { createRoot } from "react-dom/client";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { IntlProvider, useIntl } from "react-intl";

export const EXPRESS_CHECKOUT_ELEMENT_TAG = "foxy-express-checkout";

const DEFAULT_LOCALE = "en-US";
const LANG_ATTRIBUTE = "lang";
const MESSAGES_BY_LOCALE: Record<string, Record<string, string>> = {
  "en-US": enUsMessages as Record<string, string>,
  en: enUsMessages as Record<string, string>,
};

type StripeExpressCheckoutErrorCode = "missing_config" | "init_failed";

type CheckoutApiLike = EventTarget & {
  state?: unknown;
  json?: unknown;
};

type ExpressCheckoutConfig = {
  expressCheckoutOptions?: StripeExpressCheckoutElementOptions;
  publishableKey: string;
  stripeElementsOptions: StripeElementsOptions;
};

type ExpressCheckoutViewProps = {
  expressCheckoutOptions?: StripeExpressCheckoutElementOptions;
  publishableKey: string;
  stripeElementsOptions: StripeElementsOptions;
};

function normalizeStringAttribute(
  value: string | null | undefined,
): string | undefined {
  return value?.trim() || undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getStripeExpressCheckoutErrorMessage(
  code: StripeExpressCheckoutErrorCode,
): { id: string; defaultMessage: string } {
  if (code === "missing_config") {
    return {
      id: "foxy_express_checkout_missing_config",
      defaultMessage:
        "Express checkout is not configured yet. Please use another payment method.",
    };
  }

  return {
    id: "foxy_express_checkout_init_failed",
    defaultMessage:
      "Express checkout could not be initialized. Please use another payment method.",
  };
}

function getStripeExpressCheckoutUnavailableMessage(): {
  id: string;
  defaultMessage: string;
} {
  return {
    id: "foxy_express_checkout_not_available",
    defaultMessage:
      "Express checkout is not fully configured yet. Please use another payment method.",
  };
}

function resolveMessages(locale: string): Record<string, string> {
  return (
    MESSAGES_BY_LOCALE[locale] ??
    MESSAGES_BY_LOCALE[locale.split(/[-_]/)[0]] ??
    MESSAGES_BY_LOCALE[DEFAULT_LOCALE]
  );
}

function resolveRuntimeLocale(locale: string | undefined): string {
  return normalizeStringAttribute(locale) ?? DEFAULT_LOCALE;
}

function getStripePaymentElementAmount(
  apiState: Record<string, unknown>,
): number | undefined {
  const totals = Array.isArray(apiState.totals) ? apiState.totals : [];
  const total = asRecord(totals[0]);
  const totalOrder = toNumber(total?.total_order);
  if (typeof totalOrder !== "number") return undefined;

  const format = asRecord(apiState.format);
  const maximumFractionDigits =
    typeof format?.maximum_fraction_digits === "number"
      ? format.maximum_fraction_digits
      : 2;

  return Math.round(totalOrder * 10 ** maximumFractionDigits);
}

function getStripePaymentElementCurrency(
  apiState: Record<string, unknown>,
): string | undefined {
  const format = asRecord(apiState.format);
  const currencyCode = format?.currency_code;
  if (typeof currencyCode !== "string") return undefined;

  const normalizedCurrencyCode = currencyCode.trim().toLowerCase();
  return normalizedCurrencyCode || undefined;
}

function resolveStripeLocaleFromIntl(
  locale: string,
): StripeElementsOptions["locale"] {
  const normalizedLocale = locale.trim();
  if (!normalizedLocale) return "auto";

  const supportedLocales = new Set<string>([
    "auto",
    "ar",
    "bg",
    "cs",
    "da",
    "de",
    "el",
    "en",
    "en-AU",
    "en-CA",
    "en-GB",
    "en-IE",
    "en-IN",
    "en-NZ",
    "en-SG",
    "es",
    "es-419",
    "et",
    "fi",
    "fil",
    "fr",
    "fr-CA",
    "hr",
    "hu",
    "id",
    "it",
    "ja",
    "ko",
    "lt",
    "lv",
    "ms",
    "mt",
    "nb",
    "nl",
    "pl",
    "pt",
    "pt-BR",
    "ro",
    "ru",
    "sk",
    "sl",
    "sv",
    "th",
    "tr",
    "vi",
    "zh",
    "zh-HK",
    "zh-TW",
  ]);

  if (supportedLocales.has(normalizedLocale)) {
    return normalizedLocale as StripeElementsOptions["locale"];
  }

  const language = normalizedLocale.split(/[-_]/)[0];
  if (supportedLocales.has(language)) {
    return language as StripeElementsOptions["locale"];
  }

  return "auto";
}

function getDefaultStripeElementsOptions(
  locale: string,
): StripeElementsOptions {
  return {
    locale: resolveStripeLocaleFromIntl(locale),
  } as StripeElementsOptions;
}

function getStripeElementsOptions(
  apiState: Record<string, unknown>,
  locale: string,
): StripeElementsOptions {
  const amount = getStripePaymentElementAmount(apiState);
  const currency = getStripePaymentElementCurrency(apiState);

  if (typeof amount === "number" && currency) {
    return {
      amount,
      currency,
      locale: resolveStripeLocaleFromIntl(locale),
      mode: "payment",
    };
  }

  return getDefaultStripeElementsOptions(locale);
}

function getStripeExpressCheckoutOption(
  apiState: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const options = Array.isArray(apiState.express_checkout_options)
    ? apiState.express_checkout_options
    : [];

  for (const rawOption of options) {
    const option = asRecord(rawOption);
    if (!option) continue;

    if (
      option.type === "stripe-express-checkout-element" &&
      option.gateway === "stripe_v2"
    ) {
      return option;
    }
  }

  return undefined;
}

function getPublishableKey(option: Record<string, unknown>): string {
  const config = asRecord(option.config);
  const publishableKey =
    typeof config?.publishable_key === "string"
      ? config.publishable_key
      : typeof option.publishable_key === "string"
        ? option.publishable_key
        : "";

  return publishableKey.trim();
}

function getExpressCheckoutOptions(
  option: Record<string, unknown>,
): StripeExpressCheckoutElementOptions | undefined {
  const config = asRecord(option.config);
  const rawOptions =
    asRecord(config?.express_checkout_options) ??
    asRecord(option.express_checkout_options);

  return rawOptions as StripeExpressCheckoutElementOptions | undefined;
}

function resolveExpressCheckoutConfig(
  apiState: Record<string, unknown>,
  locale: string,
): ExpressCheckoutConfig | null {
  const option = getStripeExpressCheckoutOption(apiState);
  if (!option) return null;

  const publishableKey = getPublishableKey(option);
  if (!publishableKey) return null;

  return {
    publishableKey,
    expressCheckoutOptions: getExpressCheckoutOptions(option),
    stripeElementsOptions: getStripeElementsOptions(apiState, locale),
  };
}

function hasAvailableWallets(
  event: StripeExpressCheckoutElementReadyEvent,
): boolean {
  if (!event.availablePaymentMethods) return false;
  return Object.values(event.availablePaymentMethods).some(Boolean);
}

function ExpressCheckoutView({
  expressCheckoutOptions,
  publishableKey,
  stripeElementsOptions,
}: ExpressCheckoutViewProps) {
  const intl = useIntl();
  const [errorCode, setErrorCode] =
    useState<StripeExpressCheckoutErrorCode | null>(null);
  const [hasWallets, setHasWallets] = useState<boolean | null>(null);
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    setHasWallets(null);
  }, [expressCheckoutOptions, publishableKey, stripeElementsOptions]);

  useEffect(() => {
    let cancelled = false;

    setErrorCode(null);

    if (!publishableKey) {
      setStripePromise(null);
      return () => {
        cancelled = true;
      };
    }

    const nextStripePromise = loadStripe(publishableKey).catch(() => {
      if (!cancelled) {
        setErrorCode("init_failed");
      }

      return null;
    });

    setStripePromise(nextStripePromise);

    return () => {
      cancelled = true;
    };
  }, [publishableKey]);

  const effectiveErrorCode = !publishableKey ? "missing_config" : errorCode;

  return (
    <>
      <style>{`:host { display: block; } :host([hidden]) { display: none; } ${defaultShadowStyles}`}</style>

      {effectiveErrorCode || !stripePromise ? (
        <Alert variant="destructive">
          <AlertDescription>
            {intl.formatMessage(
              getStripeExpressCheckoutErrorMessage(
                effectiveErrorCode ?? "init_failed",
              ),
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <div className={hasWallets === false ? "hidden" : undefined}>
          <Elements stripe={stripePromise} options={stripeElementsOptions}>
            <StripeExpressCheckoutElement
              options={expressCheckoutOptions}
              onReady={(event) => {
                setHasWallets(hasAvailableWallets(event));
              }}
              onConfirm={(event) => {
                event.paymentFailed({
                  reason: "fail",
                  message: intl.formatMessage(
                    getStripeExpressCheckoutUnavailableMessage(),
                  ),
                });
              }}
            />
          </Elements>
        </div>
      )}
    </>
  );
}

export class ExpressCheckoutElement extends HTMLElement {
  #checkoutClient = checkoutClient as CheckoutApiLike;
  #container: HTMLDivElement;
  #root: Root | null = null;

  static get observedAttributes(): string[] {
    return [LANG_ATTRIBUTE];
  }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    this.#container = document.createElement("div");
    shadowRoot.append(this.#container);
  }

  connectedCallback() {
    if (!this.#root) {
      this.#root = createRoot(this.#container);
    }

    this.#addApiSubscriptions();
    this.#render();
  }

  disconnectedCallback() {
    this.#removeApiSubscriptions();
    this.#root?.unmount();
    this.#root = null;
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) return;

    if (name === LANG_ATTRIBUTE) {
      this.#render();
      return;
    }

    this.#render();
  }

  #addApiSubscriptions() {
    this.#checkoutClient.addEventListener(
      "afterStateChange",
      this.#handleApiStateChange,
    );
    this.#checkoutClient.addEventListener("update", this.#handleApiStateChange);
  }

  #removeApiSubscriptions() {
    this.#checkoutClient.removeEventListener(
      "afterStateChange",
      this.#handleApiStateChange,
    );
    this.#checkoutClient.removeEventListener(
      "update",
      this.#handleApiStateChange,
    );
  }

  #handleApiStateChange = () => {
    this.#render();
  };

  #render() {
    if (!this.#root) return;

    const locale = this.#resolveLocale();
    const apiState = this.#resolveApiState();
    const config = apiState
      ? resolveExpressCheckoutConfig(apiState, locale)
      : null;

    this.#root.render(
      <IntlProvider
        locale={locale}
        defaultLocale={DEFAULT_LOCALE}
        messages={resolveMessages(locale)}
      >
        <ExpressCheckoutView
          expressCheckoutOptions={config?.expressCheckoutOptions}
          publishableKey={config?.publishableKey ?? ""}
          stripeElementsOptions={
            config?.stripeElementsOptions ??
            getDefaultStripeElementsOptions(locale)
          }
        />
      </IntlProvider>,
    );
  }

  #resolveApiState(): Record<string, unknown> | null {
    const state = asRecord(this.#checkoutClient.state);
    if (state) return state;

    return asRecord(this.#checkoutClient.json) ?? null;
  }

  #resolveLocale(): string {
    const attributeLocale = normalizeStringAttribute(
      this.getAttribute(LANG_ATTRIBUTE),
    );
    if (attributeLocale) return resolveRuntimeLocale(attributeLocale);

    const elementLocale = normalizeStringAttribute(this.lang);
    if (elementLocale) return resolveRuntimeLocale(elementLocale);

    const documentLocale = normalizeStringAttribute(
      document.documentElement.lang,
    );
    if (documentLocale) return resolveRuntimeLocale(documentLocale);

    return DEFAULT_LOCALE;
  }
}

if (
  typeof window !== "undefined" &&
  !window.customElements.get(EXPRESS_CHECKOUT_ELEMENT_TAG)
) {
  window.customElements.define(
    EXPRESS_CHECKOUT_ELEMENT_TAG,
    ExpressCheckoutElement,
  );
}

declare global {
  interface HTMLElementTagNameMap {
    "foxy-express-checkout": ExpressCheckoutElement;
  }
}
