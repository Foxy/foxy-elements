import type {
  PaymentMethodSelectorBillingAddress,
  PaymentMethodSelectorBillingField,
} from "../components/payment/billing-address-types";
import type { PaymentMethodSelectorOption } from "../components/payment/option-types";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";

import "./ach-field-element";
import "./payment-card-field-element";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { IntlProvider } from "react-intl";
import defaultShadowStyles from "@/index.css?inline";
import enUsMessages from "@/locales/en-US.json";
import { Payment } from "../components/payment";
import { StripeCardElementOption } from "../components/payment/stripe-card-element";
import { StripePaymentElementOption } from "../components/payment/stripe-payment-element";

export const paymentMethodSelectorEvents = {
  tokenizationStart: "tokenizationstart",
  tokenizationSuccess: "tokenizationsuccess",
  tokenizationError: "tokenizationerror",
  optionIndexChange: "optionindexchange",
} as const;

type CheckoutApiLike = EventTarget & {
  state?: unknown;
  json?: unknown;
  updateBillingAddress?: (
    changes: Record<string, unknown>,
  ) => Promise<unknown> | void;
};

type PaymentMethodSelectorTokenizeEventDetail = {
  payload: PaymentMethodSelectorTokenizePayload;
};

type PaymentMethodSelectorTokenizationSuccessEventDetail =
  PaymentMethodSelectorTokenizeEventDetail;

type PaymentMethodSelectorChangeEventDetail = {
  optionIndex: number;
};

type PaymentMethodSelectorTokenizationStartEventDetail = {
  optionIndex: number;
};

type PaymentMethodSelectorTokenizationErrorEventDetail = {
  error: unknown;
};

export type PaymentMethodSelectorTokenizeOptionType =
  | "saved-card"
  | "new-card"
  | "ach"
  | "stripe-card-element"
  | "stripe-payment-element"
  | "apple-pay"
  | "google-pay"
  | "generic";

export type PaymentMethodSelectorBillingPayload = {
  useShippingAddress: boolean;
  values: Record<string, string>;
};

export type PaymentMethodSelectorTokenizePayload = {
  optionIndex: number;
  optionType: PaymentMethodSelectorTokenizeOptionType;
  billingAddress?: PaymentMethodSelectorBillingPayload;
  token?: string;
  requestId?: string;
  paymentMethodId?: string;
  paymentMethodType?: string;
  cardBrand?: string;
  last4?: string;
  expirationMonth?: number;
  expirationYear?: number;
};

const LANG_ATTRIBUTE = "lang";
const OPTION_INDEX_ATTRIBUTE = "option-index";
const DEFAULT_LOCALE = "en-US";

const MESSAGES_BY_LOCALE: Record<string, Record<string, string>> = {
  "en-US": enUsMessages as Record<string, string>,
  en: enUsMessages as Record<string, string>,
};

const THEME_CSS_VARS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--primary",
  "--primary-foreground",
  "--muted-foreground",
  "--destructive",
  "--border",
  "--input",
  "--ring",
  "--font-sans",
  "--radius",
  "--spacing",
  "--input-height",
  "--input-padding",
  "--input-padding-x",
  "--input-padding-y",
] as const;

type ThemeCssVar = (typeof THEME_CSS_VARS)[number];
type ThemeAttributeName = `theme-${string}`;

const THEME_ATTR_TO_CSS_VAR = THEME_CSS_VARS.reduce(
  (result, cssVar) => {
    const attrName = `theme-${cssVar.slice(2)}` as ThemeAttributeName;
    result[attrName] = cssVar;
    return result;
  },
  {} as Record<ThemeAttributeName, ThemeCssVar>,
);

const THEME_ATTRIBUTE_NAMES = Object.keys(
  THEME_ATTR_TO_CSS_VAR,
) as ThemeAttributeName[];

export class PaymentMethodSelectorElement extends HTMLElement {
  #optionIndex: number | undefined;
  #loading = false;
  #shadowRootRef: ShadowRoot;
  #root: Root | null = null;
  #container: HTMLDivElement;
  #controllers = new Map<
    string,
    { tokenize: (requestId?: string) => Promise<Record<string, unknown>> }
  >();
  #billingStateByOption = new Map<
    string,
    { useShippingAddress: boolean; values: Record<string, string> }
  >();
  #lightDomStripeHosts = new Map<string, HTMLDivElement>();
  #lightDomStripeRoots = new Map<string, Root>();
  #checkoutClient = checkoutClient as CheckoutApiLike;

  static get observedAttributes(): string[] {
    return [LANG_ATTRIBUTE, OPTION_INDEX_ATTRIBUTE, ...THEME_ATTRIBUTE_NAMES];
  }

  constructor() {
    super();
    this.#shadowRootRef = this.attachShadow({ mode: "open" });
    this.#container = document.createElement("div");
    this.#shadowRootRef.append(this.#container);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  get optionIndex(): number | undefined {
    return this.#optionIndex;
  }

  set optionIndex(value: number | undefined) {
    const normalized = this.#normalizeOptionIndex(value);

    if (this.#optionIndex === normalized) return;

    this.#optionIndex = normalized;

    if (normalized !== undefined) {
      const normalizedAttribute = String(normalized);
      if (this.getAttribute(OPTION_INDEX_ATTRIBUTE) !== normalizedAttribute) {
        this.setAttribute(OPTION_INDEX_ATTRIBUTE, normalizedAttribute);
      }
    } else if (this.hasAttribute(OPTION_INDEX_ATTRIBUTE)) {
      this.removeAttribute(OPTION_INDEX_ATTRIBUTE);
    }

    this.#render();
  }

  async tokenize(): Promise<PaymentMethodSelectorTokenizePayload> {
    if (!this.#resolveApiState()) {
      throw new Error("Checkout client is not initialized.");
    }

    this.#setLoading(true);
    try {
      const options = this.#resolveOptions();
      const optionIndex = this.#resolveSelectedOptionIndex(options);
      const selectedOption =
        optionIndex === undefined ? undefined : options[optionIndex];

      if (!selectedOption || optionIndex === undefined) {
        throw new Error("No payment method is selected.");
      }

      const startEvent =
        new CustomEvent<PaymentMethodSelectorTokenizationStartEventDetail>(
          paymentMethodSelectorEvents.tokenizationStart,
          {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: { optionIndex },
          },
        );

      if (!this.dispatchEvent(startEvent)) {
        throw new Error("Tokenization start was canceled.");
      }

      const controller = this.#controllers.get(selectedOption.id);
      const tokenized = controller ? await controller.tokenize() : {};

      const payload: PaymentMethodSelectorTokenizePayload = {
        optionIndex,
        optionType:
          selectedOption.type as PaymentMethodSelectorTokenizeOptionType,
        billingAddress: this.#billingStateByOption.get(selectedOption.id),
        ...tokenized,
      };

      this.dispatchEvent(
        new CustomEvent<PaymentMethodSelectorTokenizationSuccessEventDetail>(
          paymentMethodSelectorEvents.tokenizationSuccess,
          {
            bubbles: true,
            composed: true,
            detail: {
              payload,
            },
          },
        ),
      );

      return payload;
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent<PaymentMethodSelectorTokenizationErrorEventDetail>(
          paymentMethodSelectorEvents.tokenizationError,
          {
            bubbles: true,
            composed: true,
            detail: {
              error,
            },
          },
        ),
      );

      throw error;
    } finally {
      this.#setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  connectedCallback() {
    if (!this.#root) {
      this.#root = createRoot(this.#container);
    }
    this.#syncThemeAttributesToHostStyles();
    this.#addApiSubscriptions();
    this.#render();
  }

  disconnectedCallback() {
    this.#removeApiSubscriptions();
    this.#root?.unmount();
    this.#root = null;
    this.#controllers.clear();
    this.#billingStateByOption.clear();
    this.#cleanupAllStripeHosts();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ) {
    if (name === LANG_ATTRIBUTE) {
      this.#render();
      return;
    }

    if (name === OPTION_INDEX_ATTRIBUTE) {
      this.#optionIndex = this.#parseOptionIndexAttribute(newValue);
      this.#render();
      return;
    }

    if (THEME_ATTRIBUTE_NAMES.includes(name as ThemeAttributeName)) {
      this.#syncThemeAttributesToHostStyles();
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

  #render() {
    if (!this.#root) return;

    const apiState = this.#resolveApiState();
    if (!apiState) {
      this.#renderUninitializedState();
      this.#syncStripeLightDomMount(undefined);
      this.#applyStylesheet();
      return;
    }

    const options = this.#resolveOptions();
    const selectedOptionId = this.#resolveSelectedOptionId(options);
    const billingAddress = this.#resolveBillingAddress();
    const locale = this.#resolveLocale();
    const messages = this.#resolveMessages(locale);

    this.#root.render(
      <IntlProvider
        locale={locale}
        defaultLocale={DEFAULT_LOCALE}
        messages={messages}
      >
        <Payment
          options={options}
          selectedOptionId={selectedOptionId}
          lang={locale}
          disabled={false}
          loading={this.#loading}
          billingAddress={billingAddress}
          onSelectionChange={(optionId) => {
            const previousSelectedOption = this.#resolveSelectedOption();
            if (previousSelectedOption?.id === optionId) {
              return;
            }

            const nextOptionIndex = options.findIndex(
              (option) => option.id === optionId,
            );
            const optionIndex =
              nextOptionIndex >= 0 ? nextOptionIndex : undefined;

            this.optionIndex = optionIndex;

            if (optionIndex === undefined) {
              return;
            }

            this.dispatchEvent(
              new CustomEvent<PaymentMethodSelectorChangeEventDetail>(
                paymentMethodSelectorEvents.optionIndexChange,
                {
                  bubbles: true,
                  composed: true,
                  detail: {
                    optionIndex,
                  },
                },
              ),
            );
          }}
          onBillingAddressChange={({
            optionId,
            useShippingAddress,
            values,
          }) => {
            this.#billingStateByOption.set(optionId, {
              useShippingAddress,
              values,
            });

            const patch = this.#toBillingAddressPatch({
              useShippingAddress,
              values,
            });

            if (!this.#hasBillingAddressChanges(patch)) {
              return;
            }

            const result = this.#checkoutClient.updateBillingAddress?.(patch);
            if (
              result &&
              typeof (result as Promise<unknown>).catch === "function"
            ) {
              void (result as Promise<unknown>).catch(() => undefined);
            }
          }}
          onControllerReady={(optionId, controller) => {
            if (controller) {
              this.#controllers.set(optionId, controller);
              return;
            }

            this.#controllers.delete(optionId);
          }}
          renderStripeContent={({ option }) => {
            const slotName = this.#getStripeSlotName(option.id);
            return <slot name={slotName} />;
          }}
        />
      </IntlProvider>,
    );

    this.#syncStripeLightDomMount(selectedOptionId);

    this.#applyStylesheet();
  }

  #handleApiStateChange = () => {
    this.#render();
  };

  #renderUninitializedState() {
    if (!this.#root) return;

    this.#root.render(
      <div
        role="status"
        aria-live="polite"
        style={{
          border: "1px solid hsl(var(--border, 240 5.9% 90%))",
          borderRadius: "var(--radius, 0.5rem)",
          background: "hsl(var(--card, 0 0% 100%))",
          color: "hsl(var(--foreground, 240 10% 3.9%))",
          padding: "0.875rem",
          maxWidth: "34rem",
          fontFamily: "var(--font-sans, sans-serif)",
          fontSize: "0.95rem",
          lineHeight: "1.35rem",
        }}
      >
        Checkout client is not initialized. Load the checkout SDK loader or
        configure the client from @foxy.io/sdk/checkout/client before rendering
        this element.
      </div>,
    );
  }

  #setLoading(isLoading: boolean) {
    if (this.#loading === isLoading) return;
    this.#loading = isLoading;
    this.#render();
  }

  #getThemeAttributes(): Partial<Record<ThemeCssVar, string>> {
    const style: Partial<Record<ThemeCssVar, string>> = {};

    for (const attrName of THEME_ATTRIBUTE_NAMES) {
      const value = this.getAttribute(attrName)?.trim();
      if (!value) continue;
      style[THEME_ATTR_TO_CSS_VAR[attrName]] = value;
    }

    return style;
  }

  #syncThemeAttributesToHostStyles() {
    const themeAttributes = this.#getThemeAttributes();

    for (const tokenName of THEME_CSS_VARS) {
      const tokenValue = themeAttributes[tokenName]?.trim();

      if (tokenValue) {
        this.style.setProperty(tokenName, tokenValue);
      } else {
        this.style.removeProperty(tokenName);
      }
    }
  }

  #resolveLocale(): string {
    const fromAttribute = this.getAttribute(LANG_ATTRIBUTE);
    if (fromAttribute?.trim()) return fromAttribute.trim();
    if (this.lang?.trim()) return this.lang.trim();
    if (document.documentElement.lang?.trim()) {
      return document.documentElement.lang.trim();
    }
    return DEFAULT_LOCALE;
  }

  #resolveMessages(locale: string): Record<string, string> {
    const normalized = locale.trim();
    if (MESSAGES_BY_LOCALE[normalized]) return MESSAGES_BY_LOCALE[normalized];

    const baseLocale = normalized.split("-")[0];
    if (baseLocale && MESSAGES_BY_LOCALE[baseLocale]) {
      return MESSAGES_BY_LOCALE[baseLocale];
    }

    return MESSAGES_BY_LOCALE[DEFAULT_LOCALE] ?? {};
  }

  #toText(value: unknown): string {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    return "";
  }

  #toNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
  }

  #toPaymentOptionType(value: unknown): string {
    const raw = this.#toText(value).trim().toLowerCase();
    if (!raw) return "";

    const normalized = raw.replace(/_/g, "-");
    if (normalized === "new-card") return "new-card";
    if (normalized === "saved-card") return "saved-card";
    if (normalized === "stripe-card-element") return "stripe-card-element";
    if (normalized === "stripe-payment-element")
      return "stripe-payment-element";
    if (normalized === "apple-pay") return "apple-pay";
    if (normalized === "google-pay") return "google-pay";
    return normalized;
  }

  #resolveAchAccountTypeValues(
    option: Record<string, unknown>,
  ): Array<"checking" | "savings"> | undefined {
    const rawValues =
      option.account_types ??
      option.account_type_values ??
      option.accountTypeValues;
    if (!Array.isArray(rawValues)) return undefined;

    const values = rawValues.filter(
      (field): field is "checking" | "savings" =>
        field === "checking" || field === "savings",
    );

    return values.length ? values : undefined;
  }

  #asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  }

  #toSelectOptions(
    values: unknown,
  ): Array<{ label: string; value: string }> | undefined {
    if (!Array.isArray(values)) return undefined;

    const options = values
      .filter(
        (value): value is string => typeof value === "string" && Boolean(value),
      )
      .map((value) => ({ label: value, value }));

    return options.length ? options : undefined;
  }

  #resolveSupportedPaymentCards(
    apiState: Record<string, unknown>,
  ): string[] | undefined {
    const store = this.#asRecord(apiState.store);
    if (!Array.isArray(store?.supported_payment_cards)) return undefined;

    const cards = store.supported_payment_cards.filter(
      (card): card is string => typeof card === "string" && Boolean(card),
    );

    return cards.length ? cards : undefined;
  }

  #resolveApiState(): Record<string, unknown> | null {
    const state = this.#asRecord(this.#checkoutClient?.state);
    if (state) return state;

    return this.#asRecord(this.#checkoutClient?.json);
  }

  #getStripePaymentElementAmount(
    apiState: Record<string, unknown>,
  ): number | undefined {
    const totals = Array.isArray(apiState.totals) ? apiState.totals : [];
    const total = this.#asRecord(totals[0]);
    const totalOrder = total?.total_order;
    if (typeof totalOrder !== "number") return undefined;

    const format = this.#asRecord(apiState.format);
    const maximumFractionDigits =
      typeof format?.maximum_fraction_digits === "number"
        ? format.maximum_fraction_digits
        : 2;

    return Math.round(totalOrder * 10 ** maximumFractionDigits);
  }

  #getStripePaymentElementCurrency(
    apiState: Record<string, unknown>,
  ): string | undefined {
    const format = this.#asRecord(apiState.format);
    const currencyCode = format?.currency_code;
    if (typeof currencyCode !== "string") return undefined;

    const normalized = currencyCode.trim().toLowerCase();
    return normalized || undefined;
  }

  #createStripePaymentElementOptions(
    apiState: Record<string, unknown>,
  ): Record<string, unknown> {
    const options: Record<string, unknown> = { mode: "payment" };

    const amount = this.#getStripePaymentElementAmount(apiState);
    if (typeof amount === "number") {
      options.amount = amount;
    }

    const currency = this.#getStripePaymentElementCurrency(apiState);
    if (currency) {
      options.currency = currency;
    }

    return options;
  }

  #createSavedCardOptions(
    option: Record<string, unknown>,
    index: number,
    _apiState: Record<string, unknown>,
  ): PaymentMethodSelectorOption[] {
    const paymentMethod = this.#asRecord(option.payment_method);
    if (!paymentMethod) return [];

    const gateway = this.#toText(option.gateway);
    const savedPaymentMethodId =
      this.#toText(paymentMethod.payment_method_id) ||
      this.#toText(paymentMethod.payment_token) ||
      this.#toText(paymentMethod.id) ||
      undefined;
    const cardBrand = this.#toText(paymentMethod.brand);
    const last4 = this.#toText(paymentMethod.last_4);
    const expirationMonth = this.#toText(paymentMethod.expiry_month);
    const expirationYear = this.#toText(paymentMethod.expiry_year);
    const label =
      cardBrand && last4
        ? `${cardBrand.toUpperCase()} •••• ${last4}`
        : last4
          ? `•••• ${last4}`
          : "••••";

    return [
      {
        id: index === 0 ? "saved-card" : `saved-card-${index + 1}`,
        type: "saved-card",
        label,
        gateway: gateway || undefined,
        savedPaymentMethodId,
        description:
          expirationMonth && expirationYear
            ? `Expires ${expirationMonth}/${expirationYear}`
            : undefined,
        hostedCard:
          gateway === "stripe_v2" ||
          gateway === "stripe_connect" ||
          gateway === "stripe_connect_charge"
            ? undefined
            : {
                mode: "csc-only",
              },
      },
    ];
  }

  #createNormalizedOption(
    option: Record<string, unknown>,
    index: number,
    apiState: Record<string, unknown>,
  ): PaymentMethodSelectorOption[] {
    const type = this.#toPaymentOptionType(option.type);
    const optionId = index === 0 ? type : `${type}-${index + 1}`;
    const gateway = this.#toText(option.gateway);

    if (type === "saved-card") {
      return this.#createSavedCardOptions(option, index, apiState);
    }

    if (type === "new-card") {
      const acceptedBrands = this.#resolveSupportedPaymentCards(apiState);

      return [
        {
          id: optionId,
          type: "new-card",
          label: "New Card",
          gateway: gateway || undefined,
          description: "Enter your payment card details to complete checkout.",
          acceptedBrands: acceptedBrands?.length ? acceptedBrands : undefined,
          hostedCard: {
            mode: "full",
          },
        },
      ];
    }

    if (type === "ach") {
      const accountTypeValues = this.#resolveAchAccountTypeValues(option);

      return [
        {
          id: optionId,
          type: "ach",
          label: "Bank Account (ACH)",
          gateway: gateway || undefined,
          description:
            "Enter your bank account details in the secure fields below.",
          hostedFields: {
            placeholders: {
              "routing-number": "123456789",
            },
            accountTypeValues,
          },
        },
      ];
    }

    if (type === "stripe-card-element") {
      return [
        {
          id: optionId,
          type: "stripe-card-element",
          label: "Credit or Debit Card",
          gateway: gateway || undefined,
          description: "Enter your payment card details to complete checkout.",
          stripeCardElement: {
            publishableKey: this.#toText(option.publishable_key),
          },
        },
      ];
    }

    if (type === "stripe-payment-element") {
      return [
        {
          id: optionId,
          type: "stripe-payment-element",
          label: "New Payment Method",
          gateway: gateway || undefined,
          description:
            "Select a payment method and enter your details below to complete checkout.",
          stripePaymentElement: {
            publishableKey: this.#toText(option.publishable_key),
            locale: this.#toText(option.locale) || undefined,
            paymentElementOptions:
              this.#createStripePaymentElementOptions(apiState),
          },
        },
      ];
    }

    if (type === "apple-pay") {
      return [
        {
          id: optionId,
          type: "apple-pay",
          label: "Apple Pay",
          gateway: gateway || undefined,
          description: "Pay securely with Apple Pay.",
        },
      ];
    }

    if (type === "google-pay") {
      return [
        {
          id: optionId,
          type: "google-pay",
          label: "Google Pay",
          gateway: gateway || undefined,
          description: "Pay securely with Google Pay.",
        },
      ];
    }

    if (type === "redirect") {
      return [
        {
          id: optionId,
          type: "generic",
          gateway: gateway || undefined,
          label: "Continue to Payment Provider",
        },
      ];
    }

    return [];
  }

  #createLegacyOptions(
    option: Record<string, unknown>,
    index: number,
    apiState: Record<string, unknown>,
  ): PaymentMethodSelectorOption[] {
    const gateway = this.#toText(option.gateway);
    const savedPaymentMethods = Array.isArray(option.saved_payment_methods)
      ? option.saved_payment_methods
      : [];
    const normalizedSavedCards = savedPaymentMethods.flatMap(
      (paymentMethod, savedIndex) =>
        this.#createSavedCardOptions(
          { type: "saved-card", gateway, payment_method: paymentMethod },
          savedIndex,
          apiState,
        ),
    );

    if (gateway === "stripe_v2") {
      return [
        ...normalizedSavedCards,
        {
          id:
            index === 0
              ? "stripe-payment-element"
              : `stripe-payment-element-${index + 1}`,
          type: "stripe-payment-element",
          label: "New Payment Method",
          gateway: gateway || undefined,
          description:
            "Select a payment method and enter your details below to complete checkout.",
          stripePaymentElement: {
            publishableKey: this.#toText(option.publishable_key),
            locale: this.#toText(option.locale) || undefined,
            paymentElementOptions:
              this.#createStripePaymentElementOptions(apiState),
          },
        },
      ];
    }

    if (gateway === "stripe_connect" || gateway === "stripe_connect_charge") {
      return [
        ...normalizedSavedCards,
        {
          id:
            index === 0
              ? "stripe-card-element"
              : `stripe-card-element-${index + 1}`,
          type: "stripe-card-element",
          label: "Credit or Debit Card",
          gateway: gateway || undefined,
          description: "Enter your payment card details to complete checkout.",
          stripeCardElement: {
            publishableKey: this.#toText(option.publishable_key),
          },
        },
      ];
    }

    const accountTypeValues = this.#resolveAchAccountTypeValues(option);
    if (Array.isArray(option.fields) || accountTypeValues?.length) {

      return [
        {
          id: index === 0 ? "ach" : `ach-${index + 1}`,
          type: "ach",
          label: "Bank Account (ACH)",
          gateway: gateway || undefined,
          description:
            "Enter your bank account details in the secure fields below.",
          hostedFields: {
            placeholders: {
              "routing-number": "123456789",
            },
            accountTypeValues: accountTypeValues?.length
              ? accountTypeValues
              : undefined,
          },
        },
      ];
    }

    const applePay = this.#asRecord(option.apple_pay);
    const googlePay = this.#asRecord(option.google_pay);

    return [
      ...(applePay?.merchant_id || applePay?.merchant_identifier
        ? [
            {
              id: `apple-pay-${index + 1}`,
              type: "apple-pay",
              label: "Apple Pay",
              gateway: gateway || undefined,
              description: "Pay securely with Apple Pay.",
            } satisfies PaymentMethodSelectorOption,
          ]
        : []),
      ...(googlePay?.merchant_id
        ? [
            {
              id: `google-pay-${index + 1}`,
              type: "google-pay",
              label: "Google Pay",
              gateway: gateway || undefined,
              description: "Pay securely with Google Pay.",
            } satisfies PaymentMethodSelectorOption,
          ]
        : []),
      ...normalizedSavedCards,
      {
        id: index === 0 ? "new-card" : `new-card-${index + 1}`,
        type: "new-card",
        label: "New Card",
        gateway: gateway || undefined,
        description: "Enter your payment card details to complete checkout.",
        acceptedBrands: this.#resolveSupportedPaymentCards(apiState),
        hostedCard: {
          mode: "full",
        },
      },
    ];
  }

  #resolveOptions(): PaymentMethodSelectorOption[] {
    const apiState = this.#resolveApiState();
    if (!apiState) return [];

    const paymentOptions = Array.isArray(apiState.payment_options)
      ? apiState.payment_options
      : [];

    const inferred = paymentOptions.flatMap((entry, index) => {
      const option = this.#asRecord(entry);
      if (!option) return [];

      if (typeof option.type === "string") {
        return this.#createNormalizedOption(option, index, apiState);
      }

      return this.#createLegacyOptions(option, index, apiState);
    });

    if (inferred.length) {
      return inferred;
    }

    return [
      {
        id: "new-card",
        type: "new-card",
        label: "New Card",
        description: "Enter your payment card details to complete checkout.",
        acceptedBrands: this.#resolveSupportedPaymentCards(apiState),
        hostedCard: {
          mode: "full",
        },
      },
    ];
  }

  #resolveBillingAddress(): PaymentMethodSelectorBillingAddress | undefined {
    const apiJson = this.#resolveApiState();
    if (
      !apiJson?.billing_address ||
      typeof apiJson.billing_address !== "object"
    ) {
      return undefined;
    }

    const shipments = Array.isArray(apiJson.shipments) ? apiJson.shipments : [];
    const shipment = shipments[0];
    const countryOptions = this.#toSelectOptions(
      shipment && typeof shipment === "object"
        ? (shipment as Record<string, unknown>).country_options
        : undefined,
    );
    const regionOptions = this.#toSelectOptions(
      shipment && typeof shipment === "object"
        ? (shipment as Record<string, unknown>).region_options
        : undefined,
    );

    const billingAddress = apiJson.billing_address as Record<string, unknown>;
    const fields: PaymentMethodSelectorBillingField[] = [
      {
        id: "billing-first-name",
        label: "First name",
        type: "text",
        value: this.#toText(billingAddress.first_name),
      },
      {
        id: "billing-last-name",
        label: "Last name",
        type: "text",
        value: this.#toText(billingAddress.last_name),
      },
      {
        id: "billing-company",
        label: "Company",
        type: "text",
        value: this.#toText(billingAddress.company),
      },
      {
        id: "billing-address1",
        label: "Address",
        type: "text",
        value: this.#toText(billingAddress.address1),
      },
      {
        id: "billing-address2",
        label: "Address 2",
        type: "text",
        value: this.#toText(billingAddress.address2),
      },
      {
        id: "billing-city",
        label: "City",
        type: "text",
        value: this.#toText(billingAddress.city),
      },
      regionOptions
        ? {
            id: "billing-region",
            label: "Region",
            type: "select",
            value: this.#toText(billingAddress.region),
            options: regionOptions,
          }
        : {
            id: "billing-region",
            label: "Region",
            type: "text",
            value: this.#toText(billingAddress.region),
          },
      {
        id: "billing-postal-code",
        label: "Postal code",
        type: "text",
        value: this.#toText(billingAddress.postal_code),
      },
      countryOptions
        ? {
            id: "billing-country",
            label: "Country",
            type: "select",
            value: this.#toText(billingAddress.country),
            options: countryOptions,
          }
        : {
            id: "billing-country",
            label: "Country",
            type: "text",
            value: this.#toText(billingAddress.country),
          },
      {
        id: "billing-phone",
        label: "Phone",
        type: "tel",
        value: this.#toText(billingAddress.phone),
      },
    ];

    return {
      useDefaultShippingAddress:
        billingAddress.use_customer_shipping_address === true
          ? "yes-by-default"
          : "no-by-default",
      fields,
    };
  }

  #toBillingAddressPatch(params: {
    useShippingAddress: boolean;
    values: Record<string, string>;
  }): Record<string, unknown> {
    return {
      use_customer_shipping_address: params.useShippingAddress,
      first_name: params.values["billing-first-name"] ?? "",
      last_name: params.values["billing-last-name"] ?? "",
      company: params.values["billing-company"] ?? "",
      address1: params.values["billing-address1"] ?? "",
      address2: params.values["billing-address2"] ?? "",
      city: params.values["billing-city"] ?? "",
      region: params.values["billing-region"] ?? "",
      postal_code: params.values["billing-postal-code"] ?? "",
      country: params.values["billing-country"] ?? "",
      phone: params.values["billing-phone"] ?? "",
    };
  }

  #hasBillingAddressChanges(patch: Record<string, unknown>): boolean {
    const state = this.#resolveApiState();
    const current = this.#asRecord(state?.billing_address);
    if (!current) return true;

    return Object.entries(patch).some(([key, value]) => {
      const currentValue = current[key];

      if (typeof value === "boolean") {
        return Boolean(currentValue) !== value;
      }

      return this.#toText(currentValue) !== this.#toText(value);
    });
  }

  #isStripeOption(option: PaymentMethodSelectorOption | undefined): boolean {
    if (!option) return false;
    return (
      (option.type === "stripe-card-element" &&
        Boolean(option.stripeCardElement)) ||
      (option.type === "stripe-payment-element" &&
        Boolean(option.stripePaymentElement))
    );
  }

  #getStripeSlotName(optionId: string): string {
    const normalized = optionId.replace(/[^a-zA-Z0-9_-]/g, "-");
    return `foxy-stripe-slot-${normalized}`;
  }

  #ensureStripeHost(optionId: string): HTMLDivElement {
    const existing = this.#lightDomStripeHosts.get(optionId);
    if (existing) return existing;

    const host = document.createElement("div");
    host.setAttribute("slot", this.#getStripeSlotName(optionId));
    host.dataset.foxyStripeHost = optionId;
    this.append(host);
    this.#lightDomStripeHosts.set(optionId, host);

    return host;
  }

  #renderStripeOption(option: PaymentMethodSelectorOption) {
    const host = this.#ensureStripeHost(option.id);

    let root = this.#lightDomStripeRoots.get(option.id);
    if (!root) {
      root = createRoot(host);
      this.#lightDomStripeRoots.set(option.id, root);
    }

    if (option.type === "stripe-card-element" && option.stripeCardElement) {
      root.render(
        <StripeCardElementOption
          option={option}
          onControllerReady={(controller) => {
            if (controller) {
              this.#controllers.set(option.id, controller);
              return;
            }

            this.#controllers.delete(option.id);
          }}
        />,
      );
      return;
    }

    if (
      option.type === "stripe-payment-element" &&
      option.stripePaymentElement
    ) {
      root.render(
        <StripePaymentElementOption
          option={option}
          onControllerReady={(controller) => {
            if (controller) {
              this.#controllers.set(option.id, controller);
              return;
            }

            this.#controllers.delete(option.id);
          }}
        />,
      );
    }
  }

  #cleanupStripeHost(optionId: string) {
    this.#controllers.delete(optionId);

    const root = this.#lightDomStripeRoots.get(optionId);
    if (root) {
      root.unmount();
      this.#lightDomStripeRoots.delete(optionId);
    }

    const host = this.#lightDomStripeHosts.get(optionId);
    if (host) {
      host.remove();
      this.#lightDomStripeHosts.delete(optionId);
    }
  }

  #cleanupAllStripeHosts() {
    for (const optionId of this.#lightDomStripeHosts.keys()) {
      this.#cleanupStripeHost(optionId);
    }
  }

  #syncStripeLightDomMount(selectedOptionId: string | undefined) {
    const options = this.#resolveOptions();
    if (!selectedOptionId) {
      this.#cleanupAllStripeHosts();
      return;
    }

    const selectedOption = options.find((opt) => opt.id === selectedOptionId);
    if (!this.#isStripeOption(selectedOption)) {
      this.#cleanupAllStripeHosts();
      return;
    }

    this.#renderStripeOption(selectedOption as PaymentMethodSelectorOption);

    for (const optionId of [...this.#lightDomStripeHosts.keys()]) {
      if (optionId !== selectedOptionId) {
        this.#cleanupStripeHost(optionId);
      }
    }
  }

  #resolveSelectedOption(): PaymentMethodSelectorOption | undefined {
    const options = this.#resolveOptions();
    if (!options.length) return undefined;

    const selectedOptionId = this.#resolveSelectedOptionId(options);
    const explicit = options.find((option) => option.id === selectedOptionId);
    if (explicit) return explicit;

    return options.find((option) => !option.disabled);
  }

  #resolveSelectedOptionId(
    options: PaymentMethodSelectorOption[] = this.#resolveOptions(),
  ): string | undefined {
    const optionIndex = this.#resolveSelectedOptionIndex(options);
    return optionIndex === undefined ? undefined : options[optionIndex]?.id;
  }

  #resolveSelectedOptionIndex(
    options: PaymentMethodSelectorOption[] = this.#resolveOptions(),
  ): number | undefined {
    const explicitIndex = this.#optionIndex;
    if (
      explicitIndex !== undefined &&
      explicitIndex >= 0 &&
      explicitIndex < options.length
    ) {
      return explicitIndex;
    }

    const fallbackIndex = options.findIndex((option) => !option.disabled);
    return fallbackIndex >= 0 ? fallbackIndex : undefined;
  }

  #parseOptionIndexAttribute(value: string | null): number | undefined {
    if (value === null) return undefined;
    const parsed = this.#toNumber(value);
    return this.#normalizeOptionIndex(parsed);
  }

  #normalizeOptionIndex(value: unknown): number | undefined {
    if (typeof value !== "number") return undefined;
    if (!Number.isFinite(value)) return undefined;
    if (!Number.isInteger(value)) return undefined;
    if (value < 0) return undefined;
    return value;
  }

  #applyStylesheet() {
    const shadow = this.#shadowRootRef;
    const injectedStyle = shadow.querySelector(
      "style[data-foxy-payment-styles]",
    ) as HTMLStyleElement | null;

    let style = injectedStyle;
    if (!style) {
      style = document.createElement("style");
      style.setAttribute("data-foxy-payment-styles", "");
      shadow.insertBefore(style, shadow.firstChild);
    }

    style.textContent = defaultShadowStyles;
  }
}

if (!customElements.get("foxy-payment-method-selector")) {
  customElements.define(
    "foxy-payment-method-selector",
    PaymentMethodSelectorElement,
  );
}

declare global {
  interface HTMLElementTagNameMap {
    "foxy-payment-method-selector": PaymentMethodSelectorElement;
  }
}

export interface PaymentMethodSelectorElement {
  addEventListener(
    type: "optionindexchange",
    listener: (ev: CustomEvent<{ optionIndex: number }>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: "tokenizationstart",
    listener: (ev: CustomEvent<{ optionIndex: number }>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: "tokenizationsuccess",
    listener: (
      ev: CustomEvent<{ payload: PaymentMethodSelectorTokenizePayload }>,
    ) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: "tokenizationerror",
    listener: (ev: CustomEvent<{ error: unknown }>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: "optionindexchange",
    listener: (ev: CustomEvent<{ optionIndex: number }>) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: "tokenizationstart",
    listener: (ev: CustomEvent<{ optionIndex: number }>) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: "tokenizationsuccess",
    listener: (
      ev: CustomEvent<{ payload: PaymentMethodSelectorTokenizePayload }>,
    ) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: "tokenizationerror",
    listener: (ev: CustomEvent<{ error: unknown }>) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}
