import { buttonVariants } from "@foxy.io/design-system/ui/button";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import type { SezzleSdkInstance } from "@foxy.io/sdk/checkout";
import { CARD_TYPES } from "../foxy-payment-method-selector/constants";
import type {
  PaymentController,
  PaymentMethodSelectorOption,
} from "../foxy-payment-method-selector/types";
import {
  buildApplePayButton,
  cleanupStripeBrandedButton,
  isKnownStripeBrandType,
  renderStripeBrandedButton,
  resolveRadiusPx,
  type StripeBrandedButtonOptions,
} from "./branded-buttons";
import {
  ThemeMixin,
  type ThemeAttributeName,
  type ThemeMixinMethods,
  type ThemePropertyValues,
} from "@/lib/theme-mixin";
import defaultShadowStyles from "@/index.css?inline";

type CheckoutApiLike = EventTarget & {
  state?: unknown;
  json?: unknown;
  sezzle?: SezzleSdkInstance | null;
  square?: unknown;
  paypal?: unknown;
  adyenEmbedded?: unknown;
};

type SquareGooglePayButtonOptions = {
  buttonColor?: "black" | "white" | "default";
  buttonSizeMode?: "fill" | "static";
  buttonBorderType?: "no_border" | "border";
  buttonRadius?: number;
};

type SquareGooglePayInstance = {
  attach(
    container: HTMLElement,
    options?: SquareGooglePayButtonOptions,
  ): Promise<void>;
  destroy(): Promise<void>;
  tokenize(): Promise<{
    token?: string;
    status: string;
    errors?: { message: string }[];
  }>;
};

type SquareAfterpayClearpayInstance = {
  attach(container: HTMLElement): Promise<void>;
  destroy(): Promise<void>;
  tokenize(): Promise<{
    token?: string;
    status: string;
    errors?: { message: string }[];
  }>;
};

type SquarePaymentsLike = {
  paymentRequest(opts: {
    countryCode: string;
    currencyCode: string;
    total: { amount: string; label: string };
  }): unknown;
  googlePay(paymentRequest: unknown): Promise<SquareGooglePayInstance>;
  afterpayClearpay(
    paymentRequest: unknown,
  ): Promise<SquareAfterpayClearpayInstance>;
};

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

type TokenizationRequest = {
  resolve: (value: { result: Record<string, unknown> }) => void;
  reject: (reason: Error) => void;
};

// init() must only be called once per SDK instance — calling it again on the shared singleton
// overwrites handlers registered by the first call and breaks previously rendered buttons.
const sezzleInitialized = new WeakSet<SezzleSdkInstance>();

const TYPE_TO_PAYPAL_SESSION_FACTORY: Record<string, string> = {
  paypal: "createPayPalOneTimePaymentSession",
  "paypal-pay-later": "createPayLaterOneTimePaymentSession",
  "paypal-credit": "createPayPalCreditOneTimePaymentSession",
  venmo: "createVenmoOneTimePaymentSession",
  bancontact: "createBancontactOneTimePaymentSession",
  sepa: "createSepaOneTimePaymentSession",
  ideal: "createIdealOneTimePaymentSession",
  eps: "createEpsOneTimePaymentSession",
  blik: "createBlikOneTimePaymentSession",
  przelewy24: "createP24OneTimePaymentSession",
};

type SelectorWithSelectedOption = Element & {
  selectedOption?: PaymentMethodSelectorOption;
  setPaymentController?(
    optionId: string,
    controller: PaymentController | null | undefined,
  ): void;
  tokenize?(): Promise<unknown>;
};

const LANG_ATTRIBUTE = "lang";
const MAX_RETRY_FRAMES = 60;
const ADYEN_WEB_VERSION = "6.36.0";
const ADYEN_BUTTON_OPTION_TYPES = new Set([
  "apple-pay",
  "google-pay",
  "alipay",
  "paysafecard",
  "cash-app",
  "zip",
  "we-chat",
  "we-chat-qr",
  "we-chat-web",
  "we-chat-mini-program",
  "zip-pos",
  "twint",
  "bancontact",
  "bank-transfer",
  "bizum",
  "eps",
  "ideal",
  "przelewy24",
  "vipps",
  "swish",
]);
const ADYEN_ONLINE_BANKING_OPTION_TYPES = new Set([
  "dragonpay",
  "online-banking-pl",
  "online-banking-cz",
  "online-banking-sk",
  "online-banking-in",
  "online-banking-fi",
]);
const ADYEN_REDIRECT_LABELS: Record<string, string> = {
  blik: "Continue with BLIK",
};
const ADYEN_BUTTON_STYLES = `
[data-foxy-adyen-button] {
  --foxy-adyen-button-background: var(--primary, #00112c);
  --foxy-adyen-button-background-hover: color-mix(in srgb, var(--foxy-adyen-button-background) 90%, transparent);
  --foxy-adyen-button-foreground: var(--primary-foreground, #ffffff);
  --adyen-sdk-color-background-always-dark: var(--foxy-adyen-button-background);
  --adyen-sdk-color-background-always-dark-active: var(--foxy-adyen-button-background);
  --adyen-sdk-color-label-on-color: var(--foxy-adyen-button-foreground);
  --apple-pay-button-width: 100%;
  --apple-pay-button-height: 2.75rem;
  --apple-pay-button-border-radius: var(--radius, 0.625rem);
  --apple-pay-button-padding: 0px;
  --apple-pay-button-box-sizing: border-box;
  display: block;
  height: 2.75rem;
  min-height: 2.75rem;
  width: 100%;
}

[data-foxy-adyen-button] apple-pay-button,
[data-foxy-adyen-button] google-pay-button,
[data-foxy-adyen-button] button,
[data-foxy-adyen-button] [role="button"],
[data-foxy-adyen-button] [class*="applepay"],
[data-foxy-adyen-button] [class*="ApplePay"],
[data-foxy-adyen-button] [class*="googlepay"],
[data-foxy-adyen-button] [class*="GooglePay"],
[data-foxy-adyen-button] [class*="gpay"] {
  border-radius: var(--radius, 0.625rem) !important;
  box-sizing: border-box !important;
  display: block;
  height: 2.75rem !important;
  max-height: 2.75rem !important;
  min-height: 2.75rem !important;
  overflow: hidden;
  width: 100% !important;
}

[data-foxy-adyen-button] google-pay-button,
[data-foxy-adyen-button] [class*="googlepay"],
[data-foxy-adyen-button] [class*="GooglePay"],
[data-foxy-adyen-button] [class*="gpay"] {
  border: none !important;
  box-shadow: none !important;
}

[data-foxy-adyen-button] .adyen-checkout__button--pay {
  background: var(--foxy-adyen-button-background) !important;
  border-color: var(--foxy-adyen-button-background) !important;
  color: var(--foxy-adyen-button-foreground) !important;
}

[data-foxy-adyen-button] .adyen-checkout__button--pay:not(:disabled):hover,
[data-foxy-adyen-button] .adyen-checkout__button--pay:not(:disabled):focus-visible {
  background: var(--foxy-adyen-button-background-hover) !important;
  border-color: var(--foxy-adyen-button-background-hover) !important;
  color: var(--foxy-adyen-button-foreground) !important;
}

[data-foxy-adyen-button] .adyen-checkout__button--pay:not(:disabled):active {
  background: var(--foxy-adyen-button-background) !important;
  border-color: var(--foxy-adyen-button-background) !important;
}
`;

const ThemeableHTMLElement = ThemeMixin(HTMLElement);

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

function ensureAdyenButtonStyles(): void {
  const existing = document.head.querySelector(
    'style[data-foxy-adyen-button-styles="true"]',
  );
  if (existing) return;

  const style = document.createElement("style");
  style.dataset.foxyAdyenButtonStyles = "true";
  style.textContent = ADYEN_BUTTON_STYLES;
  document.head.append(style);
}

function getAdyenComponentConstructor(
  checkout: AdyenCheckoutLike,
  componentName: string,
): AdyenComponentConstructor | undefined {
  const fromCheckout = checkout[componentName];
  if (typeof fromCheckout === "function") {
    return fromCheckout as AdyenComponentConstructor;
  }

  const adyenWindow = window as Window & {
    AdyenWeb?: Record<string, unknown>;
  };
  const fromNamespace = adyenWindow.AdyenWeb?.[componentName];
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

export class PaymentButtonElement extends ThemeableHTMLElement {
  static get observedAttributes(): string[] {
    return ["id", LANG_ATTRIBUTE, ...ThemeableHTMLElement.themeAttributeNames];
  }

  #checkoutClient = checkoutClient as CheckoutApiLike;
  #selector: SelectorWithSelectedOption | null = null;
  #sezzleContainer: HTMLDivElement | null = null;
  #klarnaButton: HTMLButtonElement | null = null;
  #klarnaLink: HTMLLinkElement | null = null;
  #stripePaymentMethodType: string | null = null;
  #squareGooglePay: SquareGooglePayInstance | null = null;
  #squareGooglePayContainer: HTMLDivElement | null = null;
  #squareAfterpay: SquareAfterpayClearpayInstance | null = null;
  #squareAfterpayContainer: HTMLDivElement | null = null;
  #squareAfterpayFailed = false;
  #connected = false;
  #retryCount = 0;
  #retryRafId: number | null = null;
  #paypalSession: { destroy(): void; cancel(): void } | null = null;
  #paypalButton: HTMLElement | null = null;
  #adyenButtonComponent: AdyenComponent | null = null;
  #adyenButtonContainer: HTMLDivElement | null = null;
  #adyenButtonOptionId: string | null = null;
  #adyenButtonSignature: string | null = null;
  #adyenButtonReadyPromise: Promise<void> | null = null;
  #adyenButtonStatus: "loading" | "ready" | "unavailable" | "error" = "loading";
  #adyenButtonError: string | null = null;
  #adyenButtonRequest: TokenizationRequest | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.#connected = true;
    this.syncThemeCssVarsToStyle();
    this.#connectToSelector();
    // One-shot fallback for when selector is defined after this element in HTML
    queueMicrotask(() => {
      if (!this.#connected || this.#selector) return;
      this.#connectToSelector();
      this.#scheduleRetry();
    });
    this.#checkoutClient.addEventListener(
      "afterStateChange",
      this.#handleApiChange,
    );
    this.#checkoutClient.addEventListener("update", this.#handleApiChange);
    this.#scheduleRetry();
  }

  disconnectedCallback(): void {
    this.#connected = false;
    this.#cancelRetry();
    this.#selector?.removeEventListener(
      "optionindexchange",
      this.#handleOptionIndexChange,
    );
    this.#selector?.removeEventListener(
      "stripepaymentmethodtypechange",
      this.#handleStripePaymentMethodTypeChange,
    );
    this.#checkoutClient.removeEventListener(
      "afterStateChange",
      this.#handleApiChange,
    );
    this.#checkoutClient.removeEventListener("update", this.#handleApiChange);
    this.#selector = null;
    this.#sezzleContainer?.remove();
    this.#sezzleContainer = null;
    this.#cleanupSquareBrandedButton();
    this.#cleanupPayPalButtonSession();
    this.#cleanupAdyenButton();
    const shadow = this.shadowRoot;
    if (shadow) cleanupStripeBrandedButton(shadow, this);
  }

  attributeChangedCallback(
    name: string,
    _old: string | null,
    _new: string | null,
  ): void {
    if (name === "id") {
      this.#connectToSelector();
    } else if (
      ThemeableHTMLElement.themeAttributeNames.includes(
        name as ThemeAttributeName,
      )
    ) {
      this.syncThemeCssVarsToStyle();
    }
    this.#render();
  }

  #connectToSelector(): void {
    if (this.#selector) {
      this.#cleanupAdyenButton();
      this.#selector.removeEventListener(
        "optionindexchange",
        this.#handleOptionIndexChange,
      );
      this.#selector.removeEventListener(
        "stripepaymentmethodtypechange",
        this.#handleStripePaymentMethodTypeChange,
      );
      this.#selector = null;
    }

    const selector = this.#findSelector();
    if (selector) {
      this.#selector = selector;
      selector.addEventListener(
        "optionindexchange",
        this.#handleOptionIndexChange,
      );
      selector.addEventListener(
        "stripepaymentmethodtypechange",
        this.#handleStripePaymentMethodTypeChange,
      );
    }
  }

  #findSelector(): SelectorWithSelectedOption | null {
    const id = this.id;
    if (!id) return null;
    return document.querySelector(
      `foxy-payment-method-selector[button="${CSS.escape(id)}"]`,
    ) as SelectorWithSelectedOption | null;
  }

  #handleOptionIndexChange = (): void => {
    this.#stripePaymentMethodType = null;
    this.#cancelRetry();
    this.#cleanupPayPalButtonSession();
    this.#render();
  };

  #handleStripePaymentMethodTypeChange = (event: Event): void => {
    const detail = (event as CustomEvent<{ type: string | null }>).detail;
    this.#stripePaymentMethodType = detail.type;
    this.#render();
  };

  #handleApiChange = (): void => {
    if (!this.#selector) {
      this.#connectToSelector();
    }
    this.#retryCount = 0;
    this.#scheduleRetry();
  };

  #scheduleRetry(): void {
    this.#cancelRetry();
    this.#retryOnce();
  }

  #retryOnce(): void {
    if (!this.#connected) return;

    const selectedOption = this.#selector?.selectedOption;
    // If the selector exists but options haven't loaded yet, retry next frame.
    // The selector's #generateOptions() is genuinely async (awaits Promise.all).
    if (
      this.#selector &&
      selectedOption === undefined &&
      this.#retryCount < MAX_RETRY_FRAMES
    ) {
      this.#retryCount++;
      this.#retryRafId = requestAnimationFrame(() => this.#retryOnce());
      return;
    }

    this.#retryCount = 0;
    this.#retryRafId = null;
    this.#render();
  }

  #cancelRetry(): void {
    if (this.#retryRafId !== null) {
      cancelAnimationFrame(this.#retryRafId);
      this.#retryRafId = null;
    }
    this.#retryCount = 0;
  }

  #resolveApiState(): Record<string, unknown> | null {
    const toRecord = (v: unknown): Record<string, unknown> | null =>
      v && typeof v === "object" && !Array.isArray(v)
        ? (v as Record<string, unknown>)
        : null;

    return (
      toRecord(this.#checkoutClient.state) ??
      toRecord(this.#checkoutClient.json)
    );
  }

  #resolveTotal(): string | undefined {
    const apiState = this.#resolveApiState();
    if (!apiState) return undefined;

    const totals = Array.isArray(apiState.totals) ? apiState.totals : [];
    const totalRecord = totals[0];
    if (!totalRecord || typeof totalRecord !== "object") return undefined;

    const total = totalRecord as Record<string, unknown>;
    const rawTotal = total.total_order;
    const totalOrder =
      typeof rawTotal === "number"
        ? rawTotal
        : typeof rawTotal === "string"
          ? Number(rawTotal)
          : NaN;
    if (!Number.isFinite(totalOrder)) return undefined;

    const format =
      apiState.format && typeof apiState.format === "object"
        ? (apiState.format as Record<string, unknown>)
        : null;
    const currencyCode =
      typeof format?.currency_code === "string"
        ? format.currency_code.trim()
        : "";
    if (!currencyCode) return undefined;

    const fractionDigits =
      typeof format?.maximum_fraction_digits === "number"
        ? format.maximum_fraction_digits
        : 2;

    const locale =
      this.getAttribute(LANG_ATTRIBUTE)?.trim() ||
      this.lang?.trim() ||
      document.documentElement.lang?.trim() ||
      "en-US";

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(totalOrder);
    } catch {
      return `${currencyCode} ${totalOrder.toFixed(fractionDigits)}`;
    }
  }

  #resolveLocale(): string {
    const apiState = this.#resolveApiState();
    if (apiState) {
      const format = apiState.format;
      if (format && typeof format === "object") {
        const localeCode = (format as Record<string, unknown>).locale_code;
        if (typeof localeCode === "string" && localeCode.trim()) {
          return localeCode.trim();
        }
      }
    }
    return (
      this.getAttribute(LANG_ATTRIBUTE)?.trim() ||
      this.lang?.trim() ||
      document.documentElement.lang?.trim() ||
      "en-US"
    );
  }

  #resolveSubscription(): string | undefined {
    const apiState = this.#resolveApiState();
    if (!apiState) return undefined;
    const raw = apiState.items;
    if (!Array.isArray(raw)) return undefined;
    const topLevel = raw.filter(
      (item): item is Record<string, unknown> =>
        !!item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        !(item as Record<string, unknown>).parent_code,
    );
    if (topLevel.length !== 1) return undefined;
    const freq = topLevel[0].subscription_frequency;
    if (!freq || typeof freq !== "string") return undefined;
    return this.#formatFrequency(freq);
  }

  #formatFrequency(freq: string): string {
    const m = freq.match(/^(\d*\.?\d+)([dwmy])$/i);
    if (!m) return freq;
    const n = parseFloat(m[1]);
    const suffixMap: Record<string, string> = {
      d: "day",
      w: "wk",
      m: "mo",
      y: "yr",
    };
    const suffix = suffixMap[m[2].toLowerCase()] ?? m[2];
    return n === 1 ? suffix : `${m[1]}${suffix}`;
  }

  #resolveKlarnaTheme(): "theme-dark" | "theme-light" {
    const bg = getComputedStyle(this).getPropertyValue("--background").trim();
    if (!bg) return "theme-dark";

    // oklch(L% C H ...) — L=100% is white, L=0% is black
    const oklchMatch = bg.match(/^oklch\s*\(\s*([0-9.]+)(%?)/i);
    if (oklchMatch) {
      const L = parseFloat(oklchMatch[1]);
      const isPercent = oklchMatch[2] === "%";
      return (isPercent ? L : L * 100) < 50 ? "theme-light" : "theme-dark";
    }

    // #rrggbb or #rgb hex
    const hexMatch = bg.match(/^#([0-9a-f]{3,6})$/i);
    if (hexMatch) {
      const h = hexMatch[1];
      const full =
        h.length === 3
          ? h
              .split("")
              .map((c) => c + c)
              .join("")
          : h.padEnd(6, "0").slice(0, 6);
      const r = parseInt(full.slice(0, 2), 16);
      const g = parseInt(full.slice(2, 4), 16);
      const b = parseInt(full.slice(4, 6), 16);
      const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      return lum < 0.179 ? "theme-light" : "theme-dark";
    }

    // hsl(H S% L%) — L<50% is dark
    const hslMatch = bg.match(
      /^hsla?\s*\(\s*[\d.]+[^,]*[,\s]\s*[\d.]+%?\s*[,\s]\s*([\d.]+)%/i,
    );
    if (hslMatch) {
      return parseFloat(hslMatch[1]) < 50 ? "theme-light" : "theme-dark";
    }

    return "theme-dark";
  }

  #renderSezzleButton(containerId: string): void {
    const sdk = this.#checkoutClient.sezzle;
    if (!sdk || !this.#sezzleContainer) return;
    if (!sezzleInitialized.has(sdk)) {
      sdk.init({});
      sezzleInitialized.add(sdk);
    }
    sdk.renderSezzleButton(containerId);
    // Sezzle sets width:auto and border-radius:300px on the rendered button.
    // Override both to match foxy-payment-button's full-width rounded-lg appearance.
    const sezzleBtn = this.#sezzleContainer.querySelector<HTMLElement>(
      "#sezzle-smart-button",
    );
    if (sezzleBtn) {
      sezzleBtn.style.width = "100%";
      sezzleBtn.style.borderRadius = "var(--radius, 0.625rem)";
      sezzleBtn.style.border = "none";
      sezzleBtn.style.margin = "0";
    }
  }

  async #initSquareGooglePay(): Promise<void> {
    const payments = this.#checkoutClient.square as
      | SquarePaymentsLike
      | undefined;
    if (!payments || !this.#squareGooglePayContainer || this.#squareGooglePay)
      return;

    const apiState = this.#resolveApiState();
    const format =
      apiState?.format && typeof apiState.format === "object"
        ? (apiState.format as Record<string, unknown>)
        : null;
    const localeCode =
      typeof format?.locale_code === "string" ? format.locale_code : "en-US";
    const countryCode = localeCode.split("-")[1] ?? "US";
    const currencyCode =
      typeof format?.currency_code === "string" ? format.currency_code : "USD";
    const totals = Array.isArray(apiState?.totals)
      ? (apiState!.totals as unknown[])
      : [];
    const totalRecord = totals[0] as Record<string, unknown> | undefined;
    const rawTotal = totalRecord?.total_order;
    const totalAmount =
      typeof rawTotal === "number"
        ? rawTotal.toFixed(2)
        : typeof rawTotal === "string"
          ? Number(rawTotal).toFixed(2)
          : "0.00";

    const paymentRequest = payments.paymentRequest({
      countryCode,
      currencyCode,
      total: { amount: totalAmount, label: "Total" },
    });
    const googlePay = await payments.googlePay(paymentRequest);
    await googlePay.attach(this.#squareGooglePayContainer, {
      buttonColor:
        this.#resolveKlarnaTheme() === "theme-light" ? "white" : "black",
      buttonSizeMode: "fill",
      buttonBorderType: "no_border",
      buttonRadius: resolveRadiusPx(this),
    });
    this.#squareGooglePay = googlePay;
  }

  async #initSquareAfterpay(): Promise<void> {
    const payments = this.#checkoutClient.square as
      | SquarePaymentsLike
      | undefined;
    if (
      !payments ||
      !this.#squareAfterpayContainer ||
      this.#squareAfterpay ||
      this.#squareAfterpayFailed
    )
      return;

    const apiState = this.#resolveApiState();
    const format =
      apiState?.format && typeof apiState.format === "object"
        ? (apiState.format as Record<string, unknown>)
        : null;
    const localeCode =
      typeof format?.locale_code === "string" ? format.locale_code : "en-US";
    const countryCode = localeCode.split("-")[1] ?? "US";
    const currencyCode =
      typeof format?.currency_code === "string" ? format.currency_code : "USD";
    const totals = Array.isArray(apiState?.totals)
      ? (apiState!.totals as unknown[])
      : [];
    const totalRecord = totals[0] as Record<string, unknown> | undefined;
    const rawTotal = totalRecord?.total_order;
    const totalAmount =
      typeof rawTotal === "number"
        ? rawTotal.toFixed(2)
        : typeof rawTotal === "string"
          ? Number(rawTotal).toFixed(2)
          : "0.00";

    try {
      const paymentRequest = payments.paymentRequest({
        countryCode,
        currencyCode,
        total: { amount: totalAmount, label: "Total" },
      });
      const afterpay = await payments.afterpayClearpay(paymentRequest);
      await afterpay.attach(this.#squareAfterpayContainer);
      this.#squareAfterpay = afterpay;
    } catch {
      this.#squareAfterpayFailed = true;
      this.#squareAfterpayContainer?.remove();
      this.#squareAfterpayContainer = null;
      this.#render();
    }
  }

  #cleanupSquareBrandsExcept(
    keep: "apple_pay" | "google_pay" | "afterpay" | null,
  ): void {
    if (keep !== "apple_pay") {
      this.shadowRoot
        ?.querySelector("[data-square-brand='apple_pay']")
        ?.remove();
    }
    if (keep !== "google_pay") {
      void this.#squareGooglePay?.destroy();
      this.#squareGooglePay = null;
      this.#squareGooglePayContainer?.remove();
      this.#squareGooglePayContainer = null;
    }
    if (keep !== "afterpay") {
      void this.#squareAfterpay?.destroy();
      this.#squareAfterpay = null;
      this.#squareAfterpayContainer?.remove();
      this.#squareAfterpayContainer = null;
      this.#squareAfterpayFailed = false;
    }
    if (!keep) this.removeAttribute("data-square-brand");
  }

  #cleanupSquareBrandedButton(): void {
    this.#cleanupSquareBrandsExcept(null);
  }

  #cleanupPayPalButtonSession(): void {
    this.#paypalSession?.destroy();
    this.#paypalSession = null;
    this.#paypalButton = null;
  }

  #handlePayPalButtonClick = (): void => {
    void (
      this.#paypalSession as {
        start(opts: { presentationMode: string }): Promise<unknown>;
      } | null
    )?.start({ presentationMode: "auto" });
  };

  async #initPayPalButtonSession(): Promise<void> {
    if (this.#paypalSession) return;
    const paypal = this.#checkoutClient.paypal as
      | Record<string, unknown>
      | null
      | undefined;
    if (!paypal) return;
    const type = this.#selector?.selectedOption?.type;
    const factoryName = TYPE_TO_PAYPAL_SESSION_FACTORY[type ?? ""];
    if (!factoryName || typeof paypal[factoryName] !== "function") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = (paypal[factoryName] as any)({
      onApprove: async () => {
        await this.#selector?.tokenize?.();
      },
      onCancel: () => {
        this.#paypalSession = null;
        this.#render();
      },
      onError: () => {
        this.#paypalSession = null;
        this.#render();
      },
    }) as {
      start(opts: { presentationMode: string }): Promise<unknown>;
      destroy(): void;
      cancel(): void;
    };

    this.#paypalSession = session;
    this.#paypalButton?.addEventListener(
      "click",
      this.#handlePayPalButtonClick,
      { once: true },
    );
  }

  #cleanupAdyenButton(): void {
    if (this.#adyenButtonOptionId) {
      this.#selector?.setPaymentController?.(this.#adyenButtonOptionId, null);
    }

    const request = this.#adyenButtonRequest;
    this.#adyenButtonRequest = null;
    settleRequest(request, new Error("Unable to submit this payment method."));

    try {
      this.#adyenButtonComponent?.unmount?.();
    } catch {
      this.#adyenButtonContainer?.replaceChildren();
    }

    this.#adyenButtonContainer?.remove();
    this.#adyenButtonComponent = null;
    this.#adyenButtonContainer = null;
    this.#adyenButtonOptionId = null;
    this.#adyenButtonSignature = null;
    this.#adyenButtonReadyPromise = null;
    this.#adyenButtonStatus = "loading";
    this.#adyenButtonError = null;
    this.removeAttribute("data-adyen-button");
  }

  #createAdyenButtonController(component: AdyenComponent): PaymentController {
    return {
      tokenize: async () => {
        if (
          this.#adyenButtonStatus === "loading" &&
          this.#adyenButtonReadyPromise
        ) {
          await this.#adyenButtonReadyPromise;
        }

        if (this.#adyenButtonStatus === "unavailable") {
          throw new Error("This payment method is currently unavailable.");
        }

        if (this.#adyenButtonStatus === "error") {
          throw new Error(
            this.#adyenButtonError ??
              "Unable to load this payment method. Choose a different payment method or try again.",
          );
        }

        if (!component.submit) {
          throw new Error(
            "Unable to load this payment method. Choose a different payment method or try again.",
          );
        }

        return await new Promise((resolve, reject) => {
          this.#adyenButtonRequest = { resolve, reject };

          try {
            component.submit?.();
          } catch (error) {
            this.#adyenButtonRequest = null;
            reject(toError(error, "Unable to submit this payment method."));
          }
        });
      },
    };
  }

  #initAdyenButton(selectedOption: PaymentMethodSelectorOption): void {
    const adyenOption = selectedOption.adyenEmbedded;
    if (!adyenOption) return;

    const signature = [
      selectedOption.id,
      adyenOption.componentName,
      adyenOption.paymentMethodType,
      adyenOption.sessionId,
    ].join(":");

    if (
      this.#adyenButtonComponent &&
      this.#adyenButtonSignature === signature
    ) {
      return;
    }

    this.#cleanupAdyenButton();

    const checkout = asRecord(this.#checkoutClient.adyenEmbedded);
    const Component = checkout
      ? getAdyenComponentConstructor(checkout, adyenOption.componentName)
      : undefined;

    if (!checkout || !Component) {
      this.#adyenButtonStatus = "error";
      this.#adyenButtonError =
        "Unable to load this payment method. Choose a different payment method or try again.";
      return;
    }

    ensureAdyenCss(adyenOption.environment);
    ensureAdyenButtonStyles();

    const container = document.createElement("div");
    container.slot = "adyen-button";
    container.style.cssText = [
      "width: 100%",
      "height: 2.75rem",
      "min-height: 2.75rem",
      "--apple-pay-button-width: 100%",
      "--apple-pay-button-height: 2.75rem",
      "--apple-pay-button-border-radius: var(--radius, 0.625rem)",
      "--apple-pay-button-padding: 0px",
      "--apple-pay-button-box-sizing: border-box",
    ].join("; ");
    container.setAttribute("data-foxy-adyen-button", "");
    container.setAttribute("data-adyen-embedded-status", "loading");
    this.appendChild(container);

    const buttonColor =
      this.#resolveKlarnaTheme() === "theme-light" ? "white" : "black";
    const component = new Component(checkout, {
      type: adyenOption.paymentMethodType,
      paymentMethodType: adyenOption.paymentMethodType,
      paymentMethod: adyenOption.paymentMethod,
      showPayButton: true,
      buttonType: selectedOption.type === "apple-pay" ? "plain" : "pay",
      buttonColor,
      onPaymentCompleted: (result: unknown) => {
        const request = this.#adyenButtonRequest;
        this.#adyenButtonRequest = null;
        const resultRecord = asRecord(result) ?? { value: result };
        settleRequest(request, resultRecord);
      },
      onPaymentFailed: (result: unknown) => {
        const request = this.#adyenButtonRequest;
        this.#adyenButtonRequest = null;
        const normalizedError = toError(
          result,
          "Unable to submit this payment method.",
        );
        this.#adyenButtonError = normalizedError.message;
        settleRequest(request, normalizedError);
      },
      onError: (error: unknown) => {
        const request = this.#adyenButtonRequest;
        this.#adyenButtonRequest = null;
        const normalizedError = toError(
          error,
          "Unable to submit this payment method.",
        );
        this.#adyenButtonStatus = "error";
        this.#adyenButtonError = normalizedError.message;
        container.setAttribute("data-adyen-embedded-status", "error");
        settleRequest(request, normalizedError);
      },
    });

    this.#adyenButtonComponent = component;
    this.#adyenButtonContainer = container;
    this.#adyenButtonOptionId = selectedOption.id;
    this.#adyenButtonSignature = signature;
    this.#adyenButtonStatus = "loading";
    this.#adyenButtonError = null;

    this.#selector?.setPaymentController?.(
      selectedOption.id,
      this.#createAdyenButtonController(component),
    );

    try {
      component.mount?.(container);
    } catch (error) {
      this.#adyenButtonStatus = "error";
      this.#adyenButtonError = toError(
        error,
        "Unable to load this payment method. Choose a different payment method or try again.",
      ).message;
      this.#cleanupAdyenButton();
      return;
    }

    const readyPromise = Promise.resolve(component.isAvailable?.())
      .then(() => {
        if (this.#adyenButtonComponent !== component) return;
        this.#adyenButtonStatus = "ready";
        this.#adyenButtonError = null;
        container.setAttribute("data-adyen-embedded-status", "ready");
      })
      .catch(() => {
        if (this.#adyenButtonComponent !== component) return;
        this.#adyenButtonStatus = "unavailable";
        this.#adyenButtonError =
          "This payment method is currently unavailable.";
        container.setAttribute("data-adyen-embedded-status", "unavailable");
      })
      .finally(() => {
        if (this.#adyenButtonReadyPromise === readyPromise) {
          this.#adyenButtonReadyPromise = null;
        }
      });

    this.#adyenButtonReadyPromise = readyPromise;
    this.setAttribute("data-adyen-button", "");
  }

  #render(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    const selectedOption = this.#selector?.selectedOption;
    const type = selectedOption?.type;
    const isSezzle = type === "sezzle";
    const isKlarna = !!selectedOption?.klarna;
    const isPurchaseOrder = type === "purchase-order";
    const isMollie = type === "mollie";
    const isStripePaymentElement = type === "stripe-payment-element";
    const isSquareApplePay = type === "apple-pay" && !!selectedOption?.squareUp;
    const isSquareGooglePay =
      type === "google-pay" && !!selectedOption?.squareUp;
    const isSquareAfterpay = type === "afterpay" && !!selectedOption?.squareUp;
    const isSquareAfterpayError =
      isSquareAfterpay && this.#squareAfterpayFailed;
    const isPayPalApplePay =
      type === "apple-pay" && !!selectedOption?.paypalPlatform;
    const isPayPalGooglePay =
      type === "google-pay" && !!selectedOption?.paypalPlatform;
    const isAdyenButton =
      !!type &&
      ADYEN_BUTTON_OPTION_TYPES.has(type) &&
      !!selectedOption?.adyenEmbedded;
    const isAdyenForm = !!selectedOption?.adyenEmbedded && !isAdyenButton;
    const isAdyenOnlineBanking =
      !!type && ADYEN_ONLINE_BANKING_OPTION_TYPES.has(type);
    const adyenRedirectLabel: string | undefined =
      !!selectedOption?.adyenEmbedded && type != null
        ? ADYEN_REDIRECT_LABELS[type]
        : undefined;
    const isPayPalButtonFlow =
      !!selectedOption?.paypalPlatform &&
      selectedOption.paypalPlatform.flow === "buttons" &&
      !isPayPalApplePay &&
      !isPayPalGooglePay;
    const isPayPalBranded =
      isPayPalApplePay || isPayPalGooglePay || isPayPalButtonFlow;
    const isCard =
      type !== undefined &&
      (CARD_TYPES.has(type) ||
        type === "stripe-card-element" ||
        type === "stripe-payment-element" ||
        type === "ach" ||
        (!!selectedOption?.adyenEmbedded &&
          (type === "sepa" ||
            type === "bacs-direct-debit" ||
            type === "eft")));
    const total = isCard ? this.#resolveTotal() : undefined;
    const subscription =
      isCard && total !== undefined ? this.#resolveSubscription() : undefined;
    const enabled =
      isPurchaseOrder ||
      isMollie ||
      isAdyenForm ||
      (isCard && total !== undefined);
    const STRIPE_SHOWS_AMOUNT = new Set([
      "card",
      "us_bank_account",
      "sepa_debit",
      "bacs_debit",
      "acss_debit",
      "au_becs_debit",
    ]);
    const isUnknownStripeBrand =
      isStripePaymentElement &&
      this.#stripePaymentMethodType !== null &&
      !isKnownStripeBrandType(this.#stripePaymentMethodType) &&
      !STRIPE_SHOWS_AMOUNT.has(this.#stripePaymentMethodType);
    const label = isSquareAfterpayError
      ? "Unavailable"
      : isPurchaseOrder
        ? "Place Order"
        : isMollie
          ? "Continue with Mollie"
          : isAdyenOnlineBanking
            ? "Continue to Online Banking"
            : adyenRedirectLabel !== undefined
              ? adyenRedirectLabel
              : isUnknownStripeBrand
                ? "Continue"
                : enabled && total !== undefined
                  ? subscription
                    ? `Subscribe for ${total}/${subscription}`
                    : `Pay ${total}`
                  : "Pay";

    let style = shadow.querySelector(
      "style[data-foxy-payment-button]",
    ) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.setAttribute("data-foxy-payment-button", "");
      style.textContent =
        `:host { display: block; } :host([hidden]) { display: none; }` +
        ` :host([data-sezzle]) button[part='button'], :host([data-klarna]) button[part='button'], :host([data-stripe-brand]) button[part='button'], :host([data-square-brand]) button[part='button'], :host([data-adyen-button]) button[part='button'] { display: none; }` +
        ` button[part='button'] { height: 2.75rem; padding-inline: 1rem; gap: 0.5rem; font-size: 1rem; line-height: 1.5rem; }` +
        ` ::slotted([slot='adyen-button']) { display: block; width: 100%; }` +
        ` .klarna-sdk-button, .klarna-sdk-button__inner-container { border-radius: var(--radius, 0.625rem) !important; }` +
        `\n${defaultShadowStyles}`;
      shadow.insertBefore(style, shadow.firstChild);
    }

    if (!shadow.querySelector("slot[name='sezzle']")) {
      const slot = document.createElement("slot");
      slot.name = "sezzle";
      style.after(slot);
    }

    if (!shadow.querySelector("slot[name='square-google-pay']")) {
      const slot = document.createElement("slot");
      slot.name = "square-google-pay";
      style.after(slot);
    }

    if (!shadow.querySelector("slot[name='square-afterpay']")) {
      const slot = document.createElement("slot");
      slot.name = "square-afterpay";
      style.after(slot);
    }

    if (!shadow.querySelector("slot[name='adyen-button']")) {
      const slot = document.createElement("slot");
      slot.name = "adyen-button";
      style.after(slot);
    }

    if (isSezzle) {
      this.setAttribute("data-sezzle", "");

      if (!this.#sezzleContainer && this.#checkoutClient.sezzle) {
        // Sezzle's injected CSS scopes all rules under #sezzle-smart-button-container,
        // so this id must be exactly that string for styles to apply.
        const containerId = "sezzle-smart-button-container";
        this.#sezzleContainer = document.createElement("div");
        this.#sezzleContainer.id = containerId;
        this.#sezzleContainer.slot = "sezzle";
        this.appendChild(this.#sezzleContainer);
        this.#renderSezzleButton(containerId);
      }
    } else {
      this.removeAttribute("data-sezzle");
      if (this.#sezzleContainer) {
        this.#sezzleContainer.remove();
        this.#sezzleContainer = null;
      }
    }

    if (isKlarna) {
      this.setAttribute("data-klarna", "");

      if (!this.#klarnaLink) {
        this.#klarnaLink = document.createElement("link");
        this.#klarnaLink.rel = "stylesheet";
        this.#klarnaLink.href =
          "https://js.klarna.com/web-sdk/buttons/payment-button.css";
        shadow.appendChild(this.#klarnaLink);
      }

      if (!this.#klarnaButton) {
        const btn = document.createElement("button");
        btn.style.cssText = "width: 100%; height: 48px;";
        btn.setAttribute("aria-label", "Continue with Klarna");

        const outline = document.createElement("div");
        outline.className = "klarna-sdk-button__outline";
        outline.setAttribute("aria-hidden", "true");

        const inner = document.createElement("div");
        inner.className = "klarna-sdk-button__inner-container";

        const text = document.createElement("div");
        text.className = "klarna-sdk-button__text";

        const copy = document.createElement("span");
        copy.className = "klarna-sdk-button-copy";
        copy.textContent = "Continue with";

        const badge = document.createElement("span");
        badge.className = "klarna-sdk-button-badge";

        text.appendChild(copy);
        text.appendChild(badge);
        inner.appendChild(text);
        btn.appendChild(outline);
        btn.appendChild(inner);

        this.#klarnaButton = btn;
        shadow.appendChild(btn);
      }

      this.#klarnaButton.className = `klarna-sdk-button ${this.#resolveKlarnaTheme()} shape-rect`;
    } else {
      this.removeAttribute("data-klarna");
      if (this.#klarnaButton) {
        this.#klarnaButton.remove();
        this.#klarnaButton = null;
      }
      if (this.#klarnaLink) {
        this.#klarnaLink.remove();
        this.#klarnaLink = null;
      }
    }

    const klarnaTheme = this.#resolveKlarnaTheme();
    const stripeBrandedOptions: StripeBrandedButtonOptions = {
      locale: this.#resolveLocale(),
      buttonStyle: klarnaTheme === "theme-light" ? "white" : "black",
    };

    if (isStripePaymentElement) {
      this.#cleanupPayPalButtonSession();
      renderStripeBrandedButton(
        this.#stripePaymentMethodType,
        shadow,
        this,
        stripeBrandedOptions,
      );
    } else if (isPayPalBranded) {
      const paypalBrandKey = isPayPalApplePay
        ? "apple_pay"
        : isPayPalGooglePay
          ? "google_pay"
          : (type ?? null);
      renderStripeBrandedButton(
        paypalBrandKey,
        shadow,
        this,
        stripeBrandedOptions,
      );
      if (isPayPalButtonFlow) {
        this.#paypalButton = shadow.querySelector(
          `[data-stripe-brand="${type}"]`,
        );
        void this.#initPayPalButtonSession();
      }
    } else {
      this.#cleanupPayPalButtonSession();
      cleanupStripeBrandedButton(shadow, this);
    }

    if (isAdyenButton && selectedOption) {
      this.#cleanupSquareBrandedButton();
      this.#cleanupPayPalButtonSession();
      cleanupStripeBrandedButton(shadow, this);
      this.#initAdyenButton(selectedOption);
    } else {
      this.#cleanupAdyenButton();
    }

    if (isSquareApplePay) {
      this.#cleanupSquareBrandsExcept("apple_pay");

      const existing = shadow.querySelector("[data-square-brand='apple_pay']");
      if (!existing) {
        const buttonStyle = klarnaTheme === "theme-light" ? "white" : "black";
        const btn = buildApplePayButton(
          buttonStyle,
          this.#resolveLocale(),
          this,
        );
        btn.removeAttribute("data-stripe-brand");
        btn.setAttribute("data-square-brand", "apple_pay");
        shadow.appendChild(btn);
      }
      this.setAttribute("data-square-brand", "apple_pay");
    } else if (isSquareGooglePay) {
      this.#cleanupSquareBrandsExcept("google_pay");

      if (!this.#squareGooglePayContainer) {
        this.#squareGooglePayContainer = document.createElement("div");
        this.#squareGooglePayContainer.style.cssText =
          "width: 100%; height: 2.75rem;";
        this.#squareGooglePayContainer.slot = "square-google-pay";
        this.appendChild(this.#squareGooglePayContainer);
      }
      this.setAttribute("data-square-brand", "google_pay");
      void this.#initSquareGooglePay();
    } else if (isSquareAfterpay) {
      this.#cleanupSquareBrandsExcept("afterpay");

      if (this.#squareAfterpayFailed) {
        this.removeAttribute("data-square-brand");
      } else {
        if (!this.#squareAfterpayContainer) {
          this.#squareAfterpayContainer = document.createElement("div");
          this.#squareAfterpayContainer.style.cssText =
            "width: 100%; height: 2.75rem;";
          this.#squareAfterpayContainer.slot = "square-afterpay";
          this.appendChild(this.#squareAfterpayContainer);
        }
        this.setAttribute("data-square-brand", "afterpay");
        void this.#initSquareAfterpay();
      }
    } else {
      this.#cleanupSquareBrandedButton();
    }

    if (!isSezzle && !isKlarna && !isAdyenButton) {
      let button = shadow.querySelector(
        "button[part='button']",
      ) as HTMLButtonElement | null;
      if (!button) {
        button = document.createElement("button");
        button.setAttribute("part", "button");
        button.type = "button";
        shadow.appendChild(button);
      }

      const variant = isSquareAfterpayError ? "destructive" : "default";
      button.className = `${buttonVariants({ variant })} w-full`;
      button.disabled = !isSquareAfterpayError && !enabled;
      if (isMollie) {
        button.setAttribute("aria-label", "Continue with Mollie");
        button.innerHTML = `<span style="white-space:nowrap">Continue with</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 677 200" style="height:0.9em;width:auto;transform:translateY(-0.08em)" fill="currentColor" aria-hidden="true"><g><path clip-rule="evenodd" d="m286.342 65.3132c-37.175 0-67.35 30.2415-67.35 67.3438 0 37.101 30.245 67.343 67.35 67.343 37.106 0 67.35-30.242 67.35-67.343 0-37.1023-30.174-67.3438-67.35-67.3438zm0 102.8348c-19.533 0-35.425-15.89-35.425-35.421s15.892-35.4222 35.425-35.4222 35.426 15.8912 35.426 35.4222-15.893 35.421-35.426 35.421z" fill-rule="evenodd"/><path d="m510.375 42.0021c11.6 0 21.003-9.4025 21.003-21.0011 0-11.59851-9.403-21.001-21.003-21.001-11.599 0-21.003 9.40249-21.003 21.001 0 11.5986 9.404 21.0011 21.003 21.0011z"/><path clip-rule="evenodd" d="m148.842 65.3833c-1.75-.14-3.431-.21-5.181-.21-16.242 0-31.644 6.6503-42.706 18.4109-11.0617-11.6906-26.394-18.4109-42.4964-18.4109-32.2047 0-58.4586 26.1813-58.4586 58.3827v73.714h31.5047v-72.804c0-13.37 10.9916-25.691 23.9435-27.0211.9101-.07 1.8203-.14 2.6604-.14 14.5621 0 26.4639 11.9001 26.5339 26.4611v73.504h32.2045v-72.944c0-13.3 10.922-25.621 23.944-26.9511.91-.07 1.82-.14 2.66-.14 14.562 0 26.534 11.8301 26.604 26.3211v73.714h32.205v-72.804c0-14.77-5.461-28.9812-15.332-39.9717-9.872-11.0606-23.384-17.8509-38.086-19.111z" fill-rule="evenodd"/><path d="m403.26 3.15015h-32.205v194.25985h32.205z"/><path d="m464.869 3.15015h-32.205v194.25985h32.205z"/><path d="m526.478 68.5334h-32.205v128.8066h32.205z"/><path clip-rule="evenodd" d="m677 129.646c0-17.08-6.651-33.1812-18.693-45.4318-12.112-12.2506-28.074-19.0409-45.086-19.0409-.28 0-.561 0-.841 0-17.642.21-34.305 7.2103-46.766 19.741-12.462 12.5306-19.463 29.1217-19.673 46.8327-.21 18.06 6.721 35.141 19.533 48.092 12.811 12.951 29.754 20.091 47.817 20.091h.07c23.663 0 45.856-12.671 57.968-33.042l1.54-2.59-26.604-13.09-1.33 2.17c-6.651 10.99-18.202 17.501-31.014 17.501-16.383 0-30.525-10.921-34.866-26.462h97.945zm-65.04-35.2113c14.703 0 27.864 9.6603 32.485 23.3813h-64.899c4.55-13.721 17.712-23.3813 32.414-23.3813z" fill-rule="evenodd"/></g></svg>`;
      } else {
        button.textContent = label;
      }
    }
  }
}

export interface PaymentButtonElement
  extends ThemePropertyValues, ThemeMixinMethods {}

if (!customElements.get("foxy-payment-button")) {
  customElements.define("foxy-payment-button", PaymentButtonElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "foxy-payment-button": PaymentButtonElement;
  }
}
