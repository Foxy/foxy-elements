import type {
  PaymentMethodSelectorBillingError,
  PaymentController,
  PaymentMethodSelectorBillingAddress,
  PaymentMethodSelectorBillingField,
  PaymentMethodSelectorKlarnaCategory,
  PaymentMethodSelectorOption,
  PaymentMethodSelectorPayPalMessage,
  PaymentMethodSelectorPayPalPlatformConfig,
  PaymentMethodSelectorTokenizePayload,
} from "./types";
import "../foxy-ach-field/element";
import "../foxy-payment-card-field/element";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import { Alert, AlertDescription } from "@foxy.io/design-system/ui/alert";

import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { IntlProvider } from "react-intl";
import defaultShadowStyles from "@/index.css?inline";
import enUsMessages from "@/locales/en-US.json";
import {
  type PaymentMethodSelectorBillingAddressErrorEventDetail,
  paymentMethodSelectorEvents,
  type PaymentMethodSelectorChangeEventDetail,
  type PaymentMethodSelectorTokenizationErrorEventDetail,
  type PaymentMethodSelectorTokenizationStartEventDetail,
  type PaymentMethodSelectorTokenizationSuccessEventDetail,
} from "./events";
import { messages } from "./messages";
import { Payment } from "./view";
import { StripeCardElementOption } from "./stripe/card-option";
import { StripePaymentElementOption } from "./stripe/payment-option";
import {
  ThemeMixin,
  type ThemeAttributeName,
  type ThemeMixinMethods,
  type ThemePropertyValues,
} from "@/lib/theme-mixin";

export { paymentMethodSelectorEvents } from "./events";

type CheckoutApiLike = EventTarget & {
  state?: unknown;
  json?: unknown;
  paypal?: unknown;
  klarna?: unknown;
  sezzle?: unknown;
  adyenEmbedded?: unknown;
  updateBillingAddress?: (
    changes: Record<string, unknown>,
  ) => Promise<unknown> | void;
};

const PAYPAL_UNDOCUMENTED_APMS = [
  {
    eligibilityKey: "bancontact",
    type: "bancontact",
    sessionCreator: "createBancontactOneTimePaymentSession",
  },
  {
    eligibilityKey: "sepa",
    type: "sepa",
    sessionCreator: "createSepaOneTimePaymentSession",
  },
  {
    eligibilityKey: "ideal",
    type: "ideal",
    sessionCreator: "createIdealOneTimePaymentSession",
  },
  {
    eligibilityKey: "eps",
    type: "eps",
    sessionCreator: "createEpsOneTimePaymentSession",
  },
  {
    eligibilityKey: "blik",
    type: "blik",
    sessionCreator: "createBlikOneTimePaymentSession",
  },
  {
    eligibilityKey: "p24",
    type: "przelewy24",
    sessionCreator: "createP24OneTimePaymentSession",
  },
] as const;

const LANG_ATTRIBUTE = "lang";
const OPTION_INDEX_ATTRIBUTE = "option-index";
const DEFAULT_LOCALE = "en-US";
const UNINITIALIZED_ALERT_GRACE_MS = 750;

const MESSAGES_BY_LOCALE: Record<string, Record<string, string>> = {
  "en-US": enUsMessages as Record<string, string>,
  en: enUsMessages as Record<string, string>,
};

const ThemeableHTMLElement = ThemeMixin(HTMLElement);

export class PaymentMethodSelectorElement extends ThemeableHTMLElement {
  #optionIndex: number | undefined;
  #loading = false;
  #canRenderUninitializedAlert = false;
  #uninitializedAlertTimer: ReturnType<typeof setTimeout> | undefined;
  #shadowRootRef: ShadowRoot;
  #root: Root | null = null;
  #container: HTMLDivElement;
  #controllers = new Map<string, PaymentController>();
  #billingErrorsByOption = new Map<string, PaymentMethodSelectorBillingError>();
  #billingRequestVersionByOption = new Map<string, number>();
  #lightDomStripeHosts = new Map<string, HTMLDivElement>();
  #lightDomStripeRoots = new Map<string, Root>();
  #stripeSyncVersion = 0;
  #checkoutClient = checkoutClient as CheckoutApiLike;
  #options: PaymentMethodSelectorOption[] = [];
  #optionsLoading = false;
  #optionsPromise: Promise<PaymentMethodSelectorOption[]> | null = null;
  #optionsRequestVersion = 0;

  static get observedAttributes(): string[] {
    return [
      LANG_ATTRIBUTE,
      OPTION_INDEX_ATTRIBUTE,
      ...ThemeableHTMLElement.themeAttributeNames,
    ];
  }

  constructor() {
    super();
    this.#shadowRootRef = this.attachShadow({ mode: "open" });
    this.#container = document.createElement("div");
    this.#container.style.fontFamily = "var(--font-sans)";
    this.#container.style.color = "var(--foreground)";
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

    try {
      const options = await this.#waitForOptions();
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

      if (selectedOption.paypalPlatform) {
        this.#setLoading(true);
        const payload = this.#createTokenizePayload(selectedOption, {});

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
      }

      const controller = this.#optionRequiresController(selectedOption)
        ? await this.#awaitController(selectedOption.id)
        : this.#controllers.get(selectedOption.id);

      this.#setLoading(true);
      const tokenized = controller ? await controller.tokenize() : {};
      const payload = this.#createTokenizePayload(selectedOption, tokenized);

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

  async #waitForOptions(): Promise<PaymentMethodSelectorOption[]> {
    if (this.#optionsPromise) {
      try {
        await this.#optionsPromise;
      } catch {
        // Fall back to the most recent cached options on generation errors.
      }
    }

    return this.#resolveOptions();
  }

  async #awaitController(
    optionId: string,
  ): Promise<PaymentController | undefined> {
    const existing = this.#controllers.get(optionId);
    if (existing) return existing;

    for (let attempt = 0; attempt < 60; attempt += 1) {
      await Promise.resolve();
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );

      const controller = this.#controllers.get(optionId);
      if (controller) {
        return controller;
      }
    }

    return undefined;
  }

  #optionRequiresController(option: PaymentMethodSelectorOption): boolean {
    return Boolean(
      option.klarna ||
      option.hostedCard ||
      option.hostedFields ||
      option.stripeCardElement ||
      option.stripePaymentElement ||
      option.type === "purchase-order",
    );
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
    this.#startUninitializedAlertGracePeriod();
    void this.#refreshOptions();
    this.#render();
  }

  disconnectedCallback() {
    this.#clearUninitializedAlertTimer();
    this.#canRenderUninitializedAlert = false;
    this.#removeApiSubscriptions();
    this.#root?.unmount();
    this.#root = null;
    this.#controllers.clear();
    this.#billingErrorsByOption.clear();
    this.#billingRequestVersionByOption.clear();
    this.#stripeSyncVersion += 1;
    this.#optionsRequestVersion += 1;
    this.#optionsLoading = false;
    this.#optionsPromise = null;
    this.#options = [];
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

    if (
      ThemeableHTMLElement.themeAttributeNames.includes(
        name as ThemeAttributeName,
      )
    ) {
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
      if (this.#canRenderUninitializedAlert) {
        this.#renderUninitializedState();
      } else {
        this.#renderLoadingState();
      }
      this.#scheduleStripeLightDomSync(undefined);
      this.#applyStylesheet();
      return;
    }

    this.#clearUninitializedAlertTimer();
    this.#canRenderUninitializedAlert = true;

    const options = this.#resolveOptions();

    if (this.#optionsLoading && options.length === 0) {
      this.#renderLoadingState();
      this.#scheduleStripeLightDomSync(undefined);
      this.#applyStylesheet();
      return;
    }

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
          loading={this.#loading || this.#optionsLoading}
          billingAddress={billingAddress}
          billingError={
            selectedOptionId
              ? this.#billingErrorsByOption.get(selectedOptionId)
              : undefined
          }
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
            const patch = this.#toBillingAddressPatch({
              useShippingAddress,
              values,
            });

            const requestVersion = this.#nextBillingRequestVersion(optionId);
            this.#setBillingAddressError(optionId, undefined);

            if (!this.#hasBillingAddressChanges(patch)) {
              return;
            }

            const handleFailure = (error: unknown) => {
              if (
                this.#billingRequestVersionByOption.get(optionId) !==
                requestVersion
              ) {
                return;
              }

              this.#setBillingAddressError(optionId, {
                message: this.#getErrorMessage(error),
              });
              this.dispatchEvent(
                new CustomEvent<PaymentMethodSelectorBillingAddressErrorEventDetail>(
                  paymentMethodSelectorEvents.billingAddressError,
                  {
                    bubbles: true,
                    composed: true,
                    detail: {
                      error,
                      optionId,
                      useShippingAddress,
                      values,
                    },
                  },
                ),
              );
            };

            try {
              const result = this.#checkoutClient.updateBillingAddress?.(patch);
              if (
                result &&
                typeof (result as Promise<unknown>).catch === "function"
              ) {
                void (result as Promise<unknown>).catch(handleFailure);
              }
            } catch (error) {
              handleFailure(error);
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

    this.#scheduleStripeLightDomSync(selectedOptionId);

    this.#applyStylesheet();
  }

  #handleApiStateChange = () => {
    if (this.#resolveApiState()) {
      this.#clearUninitializedAlertTimer();
      this.#canRenderUninitializedAlert = true;
    }

    void this.#refreshOptions();
  };

  #startUninitializedAlertGracePeriod() {
    this.#clearUninitializedAlertTimer();
    this.#canRenderUninitializedAlert = false;

    this.#uninitializedAlertTimer = setTimeout(() => {
      this.#uninitializedAlertTimer = undefined;
      this.#canRenderUninitializedAlert = true;

      if (!this.#resolveApiState()) {
        this.#render();
      }
    }, UNINITIALIZED_ALERT_GRACE_MS);
  }

  #clearUninitializedAlertTimer() {
    if (this.#uninitializedAlertTimer === undefined) {
      return;
    }

    clearTimeout(this.#uninitializedAlertTimer);
    this.#uninitializedAlertTimer = undefined;
  }

  #renderLoadingState() {
    if (!this.#root) return;

    const locale = this.#resolveLocale();
    const localizedMessages = this.#resolveMessages(locale);
    const loadingText =
      localizedMessages[messages.loadingOptions.id] ??
      messages.loadingOptions.defaultMessage;

    this.#root.render(
      <Alert aria-live="polite">
        <AlertDescription>{loadingText}</AlertDescription>
      </Alert>,
    );
  }

  #renderUninitializedState() {
    if (!this.#root) return;

    this.#root.render(
      <Alert variant="destructive" aria-live="polite">
        <AlertDescription>
          Checkout client is not initialized. Load the checkout SDK loader or
          configure the client from @foxy.io/sdk/checkout/client before
          rendering this element.
        </AlertDescription>
      </Alert>,
    );
  }

  #setLoading(isLoading: boolean) {
    if (this.#loading === isLoading) return;
    this.#loading = isLoading;
    this.#render();
  }

  #syncThemeAttributesToHostStyles() {
    this.syncThemeCssVarsToStyle();
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

  #toOptionalText(value: unknown): string | undefined {
    const normalized = this.#toText(value).trim();
    return normalized || undefined;
  }

  #getErrorMessage(error: unknown): string | undefined {
    if (typeof error === "string") {
      return error.trim() || undefined;
    }

    if (error instanceof Error) {
      return error.message.trim() || undefined;
    }

    const errorRecord = this.#asRecord(error);
    if (typeof errorRecord?.message === "string") {
      return errorRecord.message.trim() || undefined;
    }

    return undefined;
  }

  #toNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
  }

  #readPayloadString(
    payload: Record<string, unknown>,
    key: string,
  ): string | undefined {
    return this.#toOptionalText(payload[key]);
  }

  #readPayloadNumber(
    payload: Record<string, unknown>,
    key: string,
  ): number | undefined {
    return this.#toNumber(payload[key]);
  }

  #requirePayloadString(
    payload: Record<string, unknown>,
    key: string,
    errorMessage: string,
  ): string {
    const value = this.#readPayloadString(payload, key);
    if (value) return value;
    throw new Error(errorMessage);
  }

  #createTokenizePayload(
    selectedOption: PaymentMethodSelectorOption,
    tokenized: PaymentMethodSelectorTokenizePayload | Record<string, unknown>,
  ): PaymentMethodSelectorTokenizePayload {
    const payload = this.#asRecord(tokenized) ?? {};

    if (selectedOption.klarna) {
      return {
        authorizationToken: this.#requirePayloadString(
          payload,
          "authorizationToken",
          "Klarna authorization response is missing an authorization token.",
        ),
        sessionId:
          this.#readPayloadString(payload, "sessionId") ??
          selectedOption.klarna.sessionId,
        paymentMethodCategory:
          this.#readPayloadString(payload, "paymentMethodCategory") ??
          selectedOption.klarna.category.identifier,
      };
    }

    if (selectedOption.paypalPlatform) {
      return {
        paypalPlatform: {
          ...selectedOption.paypalPlatform,
          fundingSources: selectedOption.paypalPlatform.fundingSources
            ? [...selectedOption.paypalPlatform.fundingSources]
            : undefined,
        },
      };
    }

    if (selectedOption.sezzle) {
      return {
        sezzle: {
          publicKey: selectedOption.sezzle.publicKey,
        },
      };
    }

    if (selectedOption.type === "saved-card") {
      return {
        token: this.#readPayloadString(payload, "token"),
        requestId: this.#readPayloadString(payload, "requestId"),
        cardBrand:
          this.#readPayloadString(payload, "cardBrand") ??
          selectedOption.cardBrand,
        last4:
          this.#readPayloadString(payload, "last4") ?? selectedOption.last4,
        expirationMonth:
          this.#readPayloadNumber(payload, "expirationMonth") ??
          selectedOption.expirationMonth,
        expirationYear:
          this.#readPayloadNumber(payload, "expirationYear") ??
          selectedOption.expirationYear,
      };
    }

    if (selectedOption.type === "new-card") {
      return {
        token: this.#requirePayloadString(
          payload,
          "token",
          "Card tokenization response is missing a token.",
        ),
        requestId: this.#requirePayloadString(
          payload,
          "requestId",
          "Card tokenization response is missing a request id.",
        ),
        cardBrand: this.#readPayloadString(payload, "cardBrand"),
        last4: this.#readPayloadString(payload, "last4"),
        expirationMonth: this.#readPayloadNumber(payload, "expirationMonth"),
        expirationYear: this.#readPayloadNumber(payload, "expirationYear"),
      };
    }

    if (selectedOption.type === "ach") {
      return {
        token: this.#requirePayloadString(
          payload,
          "token",
          "ACH tokenization response is missing a token.",
        ),
        requestId: this.#requirePayloadString(
          payload,
          "requestId",
          "ACH tokenization response is missing a request id.",
        ),
      };
    }

    if (selectedOption.type === "stripe-card-element") {
      return {
        paymentMethodId: this.#requirePayloadString(
          payload,
          "paymentMethodId",
          "Stripe Card Element tokenization response is missing a payment method id.",
        ),
        cardBrand: this.#readPayloadString(payload, "cardBrand"),
        last4: this.#readPayloadString(payload, "last4"),
        expirationMonth: this.#readPayloadNumber(payload, "expirationMonth"),
        expirationYear: this.#readPayloadNumber(payload, "expirationYear"),
      };
    }

    if (selectedOption.type === "stripe-payment-element") {
      return {
        paymentMethodId: this.#requirePayloadString(
          payload,
          "paymentMethodId",
          "Stripe Payment Element tokenization response is missing a payment method id.",
        ),
        paymentMethodType: this.#requirePayloadString(
          payload,
          "paymentMethodType",
          "Stripe Payment Element tokenization response is missing a payment method type.",
        ),
        cardBrand: this.#readPayloadString(payload, "cardBrand"),
        last4: this.#readPayloadString(payload, "last4"),
        expirationMonth: this.#readPayloadNumber(payload, "expirationMonth"),
        expirationYear: this.#readPayloadNumber(payload, "expirationYear"),
      };
    }

    if (selectedOption.type === "purchase-order") {
      return {
        purchaseOrderNumber: this.#requirePayloadString(
          payload,
          "purchaseOrderNumber",
          "Purchase order tokenization response is missing a purchase order number.",
        ),
      };
    }

    return {};
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
    if (normalized === "purchase-order") return "purchase-order";
    if (normalized === "apple-pay") return "apple-pay";
    if (normalized === "google-pay") return "google-pay";
    return normalized;
  }

  #toOptionKeySegment(value: unknown): string {
    const normalized = this.#toText(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return normalized || "option";
  }

  #resolveKlarnaCategories(
    option: Record<string, unknown>,
  ): PaymentMethodSelectorKlarnaCategory[] {
    const rawCategories = Array.isArray(option.payment_method_categories)
      ? option.payment_method_categories
      : [];

    return rawCategories.flatMap((entry) => {
      const category = this.#asRecord(entry);
      if (!category) return [];

      const assetUrls = this.#asRecord(category.asset_urls);
      const identifier = this.#toOptionalText(category.identifier);
      const name = this.#toOptionalText(category.name);
      const descriptive = this.#toText(assetUrls?.descriptive);
      const standard = this.#toText(assetUrls?.standard);

      if (!identifier || !name || (!descriptive && !standard)) {
        return [];
      }

      return [
        {
          identifier,
          name,
          asset_urls: {
            descriptive: descriptive || standard,
            standard: standard || descriptive,
          },
        },
      ];
    });
  }

  #createKlarnaOptions(
    option: Record<string, unknown>,
    index: number,
  ): PaymentMethodSelectorOption[] {
    const sessionId = this.#toOptionalText(option.session_id);
    if (!sessionId) return [];

    const categories = this.#resolveKlarnaCategories(option);
    if (!categories.length) return [];

    return categories.map((category, categoryIndex) => {
      const slug = this.#toOptionKeySegment(category.identifier);
      const suffix =
        categories.length === 1 && categoryIndex === 0
          ? ""
          : `-${index + 1}-${slug}`;

      return {
        id: `klarna${suffix}`,
        label: category.name,
        gateway: "klarna",
        disabled: option.disabled === true,
        klarna: {
          sessionId,
          category,
        },
      };
    });
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

  async #refreshOptions(): Promise<void> {
    const apiState = this.#resolveApiState();
    const requestVersion = this.#optionsRequestVersion + 1;
    this.#optionsRequestVersion = requestVersion;

    if (!apiState) {
      this.#optionsLoading = false;
      this.#optionsPromise = null;
      this.#options = [];
      this.#render();
      return;
    }

    this.#optionsLoading = true;

    const promise = this.#generateOptions(apiState)
      .then((options) => {
        if (requestVersion !== this.#optionsRequestVersion) {
          return this.#options;
        }

        this.#options = options;
        this.#optionsLoading = false;
        this.#optionsPromise = null;
        this.#render();
        return options;
      })
      .catch(() => {
        if (requestVersion !== this.#optionsRequestVersion) {
          return this.#options;
        }

        this.#options = [];
        this.#optionsLoading = false;
        this.#optionsPromise = null;
        this.#render();
        return [];
      });

    this.#optionsPromise = promise;
    this.#render();
    await promise;
  }

  #getArrayRecords(value: unknown): Record<string, unknown>[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.flatMap((entry) => {
      const record = this.#asRecord(entry);
      return record ? [record] : [];
    });
  }

  #createSavedPaymentMethodEntries(
    apiState: Record<string, unknown>,
  ): Record<string, unknown>[] {
    return this.#getArrayRecords(apiState.saved_payment_methods).map(
      (savedPaymentMethod) => ({
        type: "saved-card",
        gateway: this.#toOptionalText(savedPaymentMethod.gateway),
        payment_method: {
          brand: savedPaymentMethod.brand,
          last_4: savedPaymentMethod.last_4,
          expiry_month: savedPaymentMethod.expiry_month,
          expiry_year: savedPaymentMethod.expiry_year,
          payment_method_id:
            this.#toOptionalText(savedPaymentMethod.id) ??
            this.#toOptionalText(savedPaymentMethod.payment_method_id) ??
            this.#toOptionalText(savedPaymentMethod.payment_token),
        },
      }),
    );
  }

  #createStandardCardGatewayEntries(
    gateway: string,
    config: Record<string, unknown>,
  ): Record<string, unknown>[] {
    const entries: Record<string, unknown>[] = [];
    const applePay = this.#asRecord(config.apple_pay);
    const googlePay = this.#asRecord(config.google_pay);
    const gatewayDisabled = config.disabled === true;
    const applePaySession = (
      globalThis as typeof globalThis & {
        ApplePaySession?: { canMakePayments?: () => boolean };
      }
    ).ApplePaySession;
    const canMakeApplePayPayments =
      typeof applePaySession?.canMakePayments === "function"
        ? Boolean(applePaySession.canMakePayments())
        : false;

    if (applePay && canMakeApplePayPayments) {
      entries.push({
        type: "apple-pay",
        gateway,
        merchant_id: this.#toOptionalText(applePay.merchant_id),
        disabled: gatewayDisabled || applePay.disabled === true,
      });
    }

    if (googlePay) {
      const gatewayParameters = this.#asRecord(googlePay.gateway_parameters);
      const normalizedGatewayParameters = gatewayParameters
        ? Object.fromEntries(
            Object.entries(gatewayParameters).flatMap(([key, value]) =>
              typeof value === "string" ? [[key, value]] : [],
            ),
          )
        : undefined;

      entries.push({
        type: "google-pay",
        gateway,
        merchant_id: this.#toOptionalText(googlePay.merchant_id),
        disabled: gatewayDisabled || googlePay.disabled === true,
        gateway_parameters:
          normalizedGatewayParameters &&
          Object.keys(normalizedGatewayParameters).length > 0
            ? normalizedGatewayParameters
            : undefined,
      });
    }

    entries.push({ type: "new-card", gateway, disabled: gatewayDisabled });
    return entries;
  }

  #buildPayPalEligibilityOptions(
    apiState: Record<string, unknown>,
  ): Record<string, unknown> {
    const options: Record<string, unknown> = {
      paymentFlow: "ONE_TIME_PAYMENT",
    };
    const amount = this.#getPayPalMessageAmount(apiState);

    if (amount) {
      options.amount = amount;
    }

    const format = this.#asRecord(apiState.format);
    const currencyCode = this.#toOptionalText(format?.currency_code);

    if (currencyCode) {
      options.currencyCode = currencyCode;
    }

    return options;
  }

  #getPayPalDiscoveryRecord(): Record<string, unknown> | null {
    return this.#asRecord(this.#checkoutClient?.paypal);
  }

  #hasPayPalSessionCreator(
    paypal: Record<string, unknown>,
    methodName: string,
  ): boolean {
    return typeof paypal[methodName] === "function";
  }

  #isEligiblePayPalMethod(
    eligibility: Record<string, unknown> | null,
    fundingSource: string,
  ): boolean {
    if (!eligibility || typeof eligibility.isEligible !== "function") {
      return false;
    }

    try {
      return Boolean(
        (eligibility.isEligible as (fundingSource: string) => boolean)(
          fundingSource,
        ),
      );
    } catch {
      return false;
    }
  }

  #getPayPalEligibilityDetails(
    eligibility: Record<string, unknown> | null,
    fundingSource: string,
  ): Record<string, unknown> | null {
    if (!eligibility || typeof eligibility.getDetails !== "function") {
      return null;
    }

    try {
      return this.#asRecord(
        (eligibility.getDetails as (fundingSource: string) => unknown)(
          fundingSource,
        ),
      );
    } catch {
      return null;
    }
  }

  #getGooglePayGatewayParameters(
    details: Record<string, unknown> | null,
  ): Record<string, string> | undefined {
    const config = this.#asRecord(details?.config);
    const allowedPaymentMethods = Array.isArray(config?.allowedPaymentMethods)
      ? config.allowedPaymentMethods
      : [];
    const allowedPaymentMethod = this.#asRecord(allowedPaymentMethods[0]);
    const tokenizationSpecification = this.#asRecord(
      allowedPaymentMethod?.tokenizationSpecification,
    );
    const parameters = this.#asRecord(tokenizationSpecification?.parameters);

    if (!parameters) {
      return undefined;
    }

    const gatewayParameters = Object.fromEntries(
      Object.entries(parameters).flatMap(([key, value]) =>
        typeof value === "string" ? [[key, value]] : [],
      ),
    );

    return Object.keys(gatewayParameters).length
      ? gatewayParameters
      : undefined;
  }

  async #createPayPalGatewayEntries(
    config: Record<string, unknown>,
    apiState: Record<string, unknown>,
  ): Promise<Record<string, unknown>[]> {
    const clientId = this.#toOptionalText(config.client_id);

    if (!clientId) {
      return [];
    }

    const entries: Record<string, unknown>[] = [
      {
        type: "paypal",
        gateway: "paypal_platform",
        client_id: clientId,
      },
    ];
    const paypal = this.#getPayPalDiscoveryRecord();

    if (!paypal || typeof paypal.findEligibleMethods !== "function") {
      return entries;
    }

    let eligibility: Record<string, unknown> | null = null;

    try {
      eligibility = this.#asRecord(
        await (
          paypal.findEligibleMethods as (
            options: Record<string, unknown>,
          ) => Promise<unknown>
        )(this.#buildPayPalEligibilityOptions(apiState)),
      );
    } catch {
      return entries;
    }

    if (
      this.#isEligiblePayPalMethod(eligibility, "advanced_cards") &&
      this.#hasPayPalSessionCreator(
        paypal,
        "createCardFieldsOneTimePaymentSession",
      )
    ) {
      entries.push({
        type: "new-card",
        gateway: "paypal_platform",
        client_id: clientId,
      });
    }

    if (
      this.#isEligiblePayPalMethod(eligibility, "applepay") &&
      this.#hasPayPalSessionCreator(
        paypal,
        "createApplePayOneTimePaymentSession",
      )
    ) {
      entries.push({
        type: "apple-pay",
        gateway: "paypal_platform",
        client_id: clientId,
      });
    }

    if (
      this.#isEligiblePayPalMethod(eligibility, "googlepay") &&
      this.#hasPayPalSessionCreator(
        paypal,
        "createGooglePayOneTimePaymentSession",
      )
    ) {
      const details = this.#getPayPalEligibilityDetails(
        eligibility,
        "googlepay",
      );
      const configRecord = this.#asRecord(details?.config);
      const merchantInfo = this.#asRecord(configRecord?.merchantInfo);

      entries.push({
        type: "google-pay",
        gateway: "paypal_platform",
        client_id: clientId,
        merchant_id: this.#toOptionalText(merchantInfo?.merchantId),
        gateway_parameters: this.#getGooglePayGatewayParameters(details),
      });
    }

    if (
      this.#isEligiblePayPalMethod(eligibility, "paylater") &&
      this.#hasPayPalSessionCreator(
        paypal,
        "createPayLaterOneTimePaymentSession",
      )
    ) {
      entries.push({
        type: "paypal-pay-later",
        gateway: "paypal_platform",
        client_id: clientId,
      });
    }

    if (
      this.#isEligiblePayPalMethod(eligibility, "credit") &&
      this.#hasPayPalSessionCreator(
        paypal,
        "createPayPalCreditOneTimePaymentSession",
      )
    ) {
      entries.push({
        type: "paypal-credit",
        gateway: "paypal_platform",
        client_id: clientId,
      });
    }

    if (
      this.#isEligiblePayPalMethod(eligibility, "venmo") &&
      this.#hasPayPalSessionCreator(paypal, "createVenmoOneTimePaymentSession")
    ) {
      entries.push({
        type: "venmo",
        gateway: "paypal_platform",
        client_id: clientId,
      });
    }

    for (const apm of PAYPAL_UNDOCUMENTED_APMS) {
      if (
        this.#isEligiblePayPalMethod(eligibility, apm.eligibilityKey) &&
        this.#hasPayPalSessionCreator(paypal, apm.sessionCreator)
      ) {
        entries.push({
          type: apm.type,
          gateway: "paypal_platform",
          client_id: clientId,
        });
      }
    }

    return entries;
  }

  async #createPaymentGatewayEntries(
    config: Record<string, unknown>,
    apiState: Record<string, unknown>,
  ): Promise<Record<string, unknown>[]> {
    const gateway = this.#toOptionalText(config.type);

    if (!gateway) {
      return [];
    }

    if (gateway === "purchase_order" || gateway === "purchase-order") {
      return [{ type: "purchase-order" }];
    }

    if (gateway === "paypal_platform") {
      return await this.#createPayPalGatewayEntries(config, apiState);
    }

    if (gateway === "klarna") {
      return [
        {
          type: "klarna",
          gateway,
          session_id: this.#toOptionalText(config.session_id),
          client_token: this.#toOptionalText(config.client_token),
          payment_method_categories: Array.isArray(
            config.payment_method_categories,
          )
            ? config.payment_method_categories
            : [],
        },
      ];
    }

    if (gateway === "sezzle") {
      return [
        {
          type: "sezzle",
          public_key: this.#toOptionalText(config.public_key),
        },
      ];
    }

    if (gateway === "mollie_omnipay") {
      return [{ type: "mollie", gateway }];
    }

    if (gateway === "stripe_v2") {
      return [
        {
          type: "stripe-payment-element",
          gateway,
          publishable_key: this.#toOptionalText(config.publishable_key),
          locale: this.#toOptionalText(config.locale),
        },
      ];
    }

    if (gateway === "stripe_connect" || gateway === "stripe_connect_charge") {
      return [
        {
          type: "stripe-card-element",
          gateway,
          publishable_key: this.#toOptionalText(config.publishable_key),
        },
      ];
    }

    if (Array.isArray(config.fields) && Array.isArray(config.account_types)) {
      return [
        {
          type: "ach",
          gateway,
          fields: config.fields,
          account_types: config.account_types,
        },
      ];
    }

    if (gateway === "adyen_embedded") {
      return [];
    }

    return this.#createStandardCardGatewayEntries(gateway, config);
  }

  async #createSyntheticPaymentOptions(
    apiState: Record<string, unknown>,
  ): Promise<Record<string, unknown>[]> {
    const savedPaymentMethodEntries =
      this.#createSavedPaymentMethodEntries(apiState);
    const paymentGatewayConfigs = this.#getArrayRecords(
      apiState.payment_gateways,
    );
    const paymentGatewayEntries = await Promise.all(
      paymentGatewayConfigs.map((config) =>
        this.#createPaymentGatewayEntries(config, apiState),
      ),
    );

    return [...savedPaymentMethodEntries, ...paymentGatewayEntries.flat()];
  }

  async #generateOptions(
    apiState: Record<string, unknown>,
  ): Promise<PaymentMethodSelectorOption[]> {
    const paymentOptions = await this.#createSyntheticPaymentOptions(apiState);

    return paymentOptions.flatMap((entry, index) => {
      const option = this.#asRecord(entry);

      return option && typeof option.type === "string"
        ? this.#createNormalizedOption(option, index, apiState)
        : [];
    });
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

  #getPayPalMessageAmount(
    apiState: Record<string, unknown>,
  ): string | undefined {
    const totals = Array.isArray(apiState.totals) ? apiState.totals : [];
    const total = this.#asRecord(totals[0]);
    const totalOrder = total?.total_order;

    if (typeof totalOrder !== "number" || !Number.isFinite(totalOrder)) {
      return undefined;
    }

    const format = this.#asRecord(apiState.format);
    const maximumFractionDigits = Math.max(
      0,
      Math.min(
        20,
        typeof format?.maximum_fraction_digits === "number"
          ? format.maximum_fraction_digits
          : 2,
      ),
    );

    return totalOrder.toFixed(maximumFractionDigits);
  }

  #getPayPalMessageConfig(
    apiState: Record<string, unknown>,
  ): PaymentMethodSelectorPayPalMessage | undefined {
    const format = this.#asRecord(apiState.format);
    const billingAddress = this.#asRecord(apiState.billing_address);
    const amount = this.#getPayPalMessageAmount(apiState);
    const currencyCode = this.#toOptionalText(format?.currency_code);
    const locale = this.#toOptionalText(format?.locale_code);
    const buyerCountry = this.#toOptionalText(billingAddress?.country);

    if (!(amount || currencyCode || locale || buyerCountry)) {
      return undefined;
    }

    return {
      amount,
      currencyCode,
      locale,
      buyerCountry,
    };
  }

  #getPayPalFundingSource(
    type: string,
  ):
    | "paypal"
    | "paylater"
    | "credit"
    | "venmo"
    | "sepa"
    | "bancontact"
    | "eps"
    | "blik"
    | "ideal"
    | "p24"
    | undefined {
    switch (type) {
      case "paypal":
        return "paypal";
      case "paypal-pay-later":
        return "paylater";
      case "paypal-credit":
        return "credit";
      case "venmo":
        return "venmo";
      case "sepa":
        return "sepa";
      case "bancontact":
        return "bancontact";
      case "eps":
        return "eps";
      case "blik":
        return "blik";
      case "ideal":
        return "ideal";
      case "przelewy24":
        return "p24";
      default:
        return undefined;
    }
  }

  #createPayPalPlatformConfig(
    type: string,
    option: Record<string, unknown>,
  ): PaymentMethodSelectorPayPalPlatformConfig | undefined {
    if (this.#toText(option.gateway) !== "paypal_platform") {
      return undefined;
    }

    const clientId = this.#toOptionalText(option.client_id);
    if (!clientId) {
      return undefined;
    }

    if (type === "new-card") {
      return { clientId, flow: "card-fields" };
    }

    if (type === "apple-pay") {
      return { clientId, flow: "apple-pay" };
    }

    if (type === "google-pay") {
      return { clientId, flow: "google-pay" };
    }

    const fundingSource = this.#getPayPalFundingSource(type);

    return {
      clientId,
      flow: "buttons",
      fundingSources: fundingSource ? [fundingSource] : undefined,
    };
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
    const cardBrand = this.#toOptionalText(paymentMethod.brand);
    const last4 = this.#toOptionalText(paymentMethod.last_4);
    const expirationMonth = this.#toNumber(paymentMethod.expiry_month);
    const expirationYear = this.#toNumber(paymentMethod.expiry_year);
    const disabled = option.disabled === true;
    const label =
      cardBrand && last4
        ? `${cardBrand.toUpperCase()} •••• ${last4}`
        : last4
          ? `•••• ${last4}`
          : "••••";
    const expirationMonthLabel =
      typeof expirationMonth === "number"
        ? String(expirationMonth).padStart(2, "0")
        : undefined;
    const expirationYearLabel =
      typeof expirationYear === "number" ? String(expirationYear) : undefined;

    return [
      {
        id: index === 0 ? "saved-card" : `saved-card-${index + 1}`,
        type: "saved-card",
        label,
        gateway: gateway || undefined,
        disabled,
        savedPaymentMethodId,
        cardBrand,
        last4,
        expirationMonth,
        expirationYear,
        description:
          expirationMonthLabel && expirationYearLabel
            ? `Expires ${expirationMonthLabel}/${expirationYearLabel}`
            : undefined,
        hostedCard:
          gateway === "stripe_v2" ||
          gateway === "stripe_connect" ||
          gateway === "stripe_connect_charge"
            ? undefined
            : {
                mode: "card_csc",
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
    const disabled = option.disabled === true;

    if (type === "saved-card") {
      return this.#createSavedCardOptions(option, index, apiState);
    }

    if (type === "klarna" && gateway === "klarna") {
      return this.#createKlarnaOptions(option, index);
    }

    if (gateway === "paypal_platform") {
      const paypalPlatform = this.#createPayPalPlatformConfig(type, option);

      if (!paypalPlatform) {
        return [];
      }

      const acceptedBrands =
        type === "new-card"
          ? this.#resolveSupportedPaymentCards(apiState)
          : undefined;

      return [
        {
          id: optionId,
          type,
          label: "",
          gateway,
          disabled,
          acceptedBrands: acceptedBrands?.length ? acceptedBrands : undefined,
          hostedCard:
            type === "new-card"
              ? {
                  mode: "card",
                }
              : undefined,
          paypalPlatform,
          paypalMessage:
            type === "paypal-pay-later"
              ? this.#getPayPalMessageConfig(apiState)
              : undefined,
        },
      ];
    }

    if (type === "new-card") {
      const acceptedBrands = this.#resolveSupportedPaymentCards(apiState);

      return [
        {
          id: optionId,
          type: "new-card",
          label: "",
          gateway: gateway || undefined,
          disabled,
          acceptedBrands: acceptedBrands?.length ? acceptedBrands : undefined,
          hostedCard: {
            mode: "card",
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
          label: "",
          gateway: gateway || undefined,
          disabled,
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
          label: "",
          gateway: gateway || undefined,
          disabled,
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
          label: "",
          gateway: gateway || undefined,
          disabled,
          stripePaymentElement: {
            publishableKey: this.#toText(option.publishable_key),
            locale: this.#toText(option.locale) || undefined,
            paymentElementOptions:
              this.#createStripePaymentElementOptions(apiState),
          },
        },
      ];
    }

    if (type === "purchase-order") {
      return [
        {
          id: optionId,
          type: "purchase-order",
          label: "",
          gateway: gateway || undefined,
          disabled,
        },
      ];
    }

    if (type === "apple-pay") {
      return [
        {
          id: optionId,
          type: "apple-pay",
          label: "",
          gateway: gateway || undefined,
          disabled,
        },
      ];
    }

    if (type === "google-pay") {
      return [
        {
          id: optionId,
          type: "google-pay",
          label: "",
          gateway: gateway || undefined,
          disabled,
        },
      ];
    }

    if (type === "mollie") {
      return [
        {
          id: optionId,
          type: "mollie",
          label: "",
          gateway: gateway || undefined,
          disabled,
        },
      ];
    }

    if (type === "sezzle") {
      const publicKey = this.#toOptionalText(option.public_key);
      if (!publicKey) {
        return [];
      }

      return [
        {
          id: optionId,
          type: "sezzle",
          label: "",
          disabled,
          sezzle: {
            publicKey,
          },
        },
      ];
    }

    if (type === "redirect") {
      return [
        {
          id: optionId,
          type: "generic",
          gateway: gateway || undefined,
          disabled,
          label: "",
        },
      ];
    }

    return [];
  }

  #resolveOptions(): PaymentMethodSelectorOption[] {
    return this.#options;
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
        id: "billing-postal-code",
        label: "Postal code",
        type: "text",
        value: this.#toText(billingAddress.postal_code),
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
        id: "billing-city",
        label: "City",
        type: "text",
        value: this.#toText(billingAddress.city),
      },
      {
        id: "billing-phone",
        label: "Phone",
        type: "tel",
        value: this.#toText(billingAddress.phone),
      },
      {
        id: "billing-company",
        label: "Company",
        type: "text",
        value: this.#toText(billingAddress.company),
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

  #nextBillingRequestVersion(optionId: string): number {
    const nextVersion =
      (this.#billingRequestVersionByOption.get(optionId) ?? 0) + 1;
    this.#billingRequestVersionByOption.set(optionId, nextVersion);
    return nextVersion;
  }

  #setBillingAddressError(
    optionId: string,
    error: PaymentMethodSelectorBillingError | undefined,
  ) {
    const previous = this.#billingErrorsByOption.get(optionId);

    if (!error) {
      if (!this.#billingErrorsByOption.has(optionId)) return;
      this.#billingErrorsByOption.delete(optionId);
      this.#render();
      return;
    }

    if (previous?.message === error.message) {
      return;
    }

    this.#billingErrorsByOption.set(optionId, error);
    this.#render();
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

  #scheduleStripeLightDomSync(selectedOptionId: string | undefined) {
    const syncVersion = ++this.#stripeSyncVersion;

    queueMicrotask(() => {
      if (syncVersion !== this.#stripeSyncVersion) return;
      this.#syncStripeLightDomMount(selectedOptionId);
    });
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

export interface PaymentMethodSelectorElement
  extends ThemePropertyValues, ThemeMixinMethods {}

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
    type: "billingaddresserror",
    listener: (
      ev: CustomEvent<PaymentMethodSelectorBillingAddressErrorEventDetail>,
    ) => void,
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
    type: "billingaddresserror",
    listener: (
      ev: CustomEvent<PaymentMethodSelectorBillingAddressErrorEventDetail>,
    ) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}
