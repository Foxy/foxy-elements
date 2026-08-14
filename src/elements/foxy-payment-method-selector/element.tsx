import type {
  PaymentController,
  PaymentMethodSelectorAdyenEmbeddedConfig,
  PaymentMethodSelectorSquareUpConfig,
  PaymentMethodSelectorKlarnaCategory,
  PaymentMethodSelectorOption,
  PaymentMethodSelectorPayPalPlatformConfig,
  PaymentMethodSelectorTokenizePayload,
} from "./types";
import "../foxy-ach-field/element";
import "../foxy-payment-card-field/element";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import { Alert } from "@foxy.io/design-system/alert";
import { defaultTheme } from "@foxy.io/design-system/theme";
import { StyleSheetManager, ThemeProvider } from "styled-components";

import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { IntlProvider } from "react-intl";
import enUsMessages from "@/locales/en-US.json";
import {
  paymentMethodSelectorEvents,
  type PaymentMethodSelectorChangeEventDetail,
  type PaymentMethodSelectorTokenizationErrorEventDetail,
  type PaymentMethodSelectorTokenizationStartEventDetail,
  type PaymentMethodSelectorTokenizationSuccessEventDetail,
} from "./events";
import {
  ACH_GATEWAY_TYPES,
  SQUARE_UP_DEFAULT_METHODS,
  SQUARE_UP_METHODS_BY_COUNTRY,
} from "./constants";
import { messages } from "./messages";
import { Payment } from "./view";
import { StripeCardElementOption } from "./stripe/card-option";
import { StripePaymentElementOption } from "./stripe/payment-option";
import { getCurrencyMinorUnitExponent } from "./stripe/shared";
import AdyenEmbeddedOption from "./embeds/adyen-embedded";
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
  adyenEmbedded?: unknown;
  square?: unknown;
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

export function toBcp47Locale(value: string): string {
  return value.replace(/_/g, "-");
}

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
  #klarnaAvailabilityByCategory = new Map<string, boolean>();
  #lightDomStripeHosts = new Map<string, HTMLDivElement>();
  #lightDomStripeRoots = new Map<string, Root>();
  #stripeSyncVersion = 0;
  #lightDomAdyenHosts = new Map<string, HTMLDivElement>();
  #lightDomAdyenRoots = new Map<string, Root>();
  #lightDomAdyenCallbacks = new Map<
    string,
    {
      onSelect: () => void;
      onControllerReady: (c: PaymentController | null) => void;
    }
  >();
  #adyenSyncVersion = 0;
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

  setPaymentController(
    optionId: string,
    controller: PaymentController | null | undefined,
  ): void {
    if (controller) {
      this.#controllers.set(optionId, controller);
      return;
    }

    this.#controllers.delete(optionId);
  }

  get selectedOption(): PaymentMethodSelectorOption | undefined {
    return this.#resolveSelectedOption();
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

      if (selectedOption.paypalPlatform?.flow === "buttons") {
        this.#setLoading(true);
        const tokenized =
          await this.#tokenizePayPalPlatformButtons(selectedOption);
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
      }

      if (selectedOption.klarna) {
        this.#setLoading(true);
        const tokenized = await this.#tokenizeKlarna(selectedOption);
        const payload = this.#createTokenizePayload(selectedOption, tokenized);

        this.dispatchEvent(
          new CustomEvent<PaymentMethodSelectorTokenizationSuccessEventDetail>(
            paymentMethodSelectorEvents.tokenizationSuccess,
            {
              bubbles: true,
              composed: true,
              detail: { payload },
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

  /**
   * Completes a client-side step the checkout API asked for on a submit
   * response (`next_action`), using the selected payment method's own SDK
   * instance — the shopper's details never leave it, so nothing else can
   * confirm on its behalf.
   *
   * Resolving means the gateway has the details, not that the payment
   * succeeded: the caller must resume with `POST /checkout?action=continue`,
   * which is where the outcome is established server-to-server.
   */
  async handleNextAction(nextAction: {
    type: string;
    gateway?: string;
    params?: Record<string, unknown>;
  }): Promise<void> {
    if (!this.#resolveApiState()) {
      throw new Error("Checkout client is not initialized.");
    }

    if (nextAction.type !== "confirm_intent") {
      throw new Error(
        `Unsupported checkout next action: ${nextAction.type || "(none)"}.`,
      );
    }

    const clientSecret = this.#toOptionalText(nextAction.params?.client_secret);
    if (!clientSecret) {
      throw new Error("Checkout next action is missing a client secret.");
    }

    const options = await this.#waitForOptions();
    const optionIndex = this.#resolveSelectedOptionIndex(options);
    const selectedOption =
      optionIndex === undefined ? undefined : options[optionIndex];

    if (!selectedOption) {
      throw new Error("No payment method is selected.");
    }

    if (
      nextAction.gateway &&
      selectedOption.gateway &&
      nextAction.gateway !== selectedOption.gateway
    ) {
      throw new Error(
        `Checkout next action is for ${nextAction.gateway}, but ${selectedOption.gateway} is selected.`,
      );
    }

    this.#setLoading(true);

    try {
      const controller = await this.#awaitController(selectedOption.id);

      if (!controller?.confirm) {
        throw new Error(
          "The selected payment method cannot complete this confirmation step.",
        );
      }

      await controller.confirm({ clientSecret });
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

  #setKlarnaAvailability = (category: string, available: boolean): void => {
    this.#klarnaAvailabilityByCategory.set(category, available);
  };

  async #tokenizeKlarna(option: PaymentMethodSelectorOption): Promise<{
    authorizationToken: string;
    sessionId: string;
    paymentMethodCategory: string;
  }> {
    const klarnaOption = option.klarna!;

    type KlarnaPaymentsApi = {
      authorize: (
        opts: { payment_method_category: string },
        data: Record<string, unknown>,
        callback: (result: {
          approved: boolean;
          show_form: boolean;
          authorization_token?: string;
          finalize_required?: boolean;
        }) => void,
      ) => void;
      finalize: (
        opts: { payment_method_category: string },
        data: Record<string, unknown>,
        callback: (result: {
          approved: boolean;
          show_form: boolean;
          authorization_token?: string;
        }) => void,
      ) => void;
    };

    const klarnaRaw = this.#checkoutClient.klarna as unknown as
      { Payments?: KlarnaPaymentsApi } | null | undefined;

    if (!klarnaRaw?.Payments) {
      throw new Error(
        "Unable to load Klarna. Choose a different payment method or try again.",
      );
    }

    const klarna = klarnaRaw.Payments;
    const apiState = this.#resolveApiState();
    const authorizationData = this.#createKlarnaAuthorizationData(apiState);
    const category = klarnaOption.category.identifier;

    if (this.#klarnaAvailabilityByCategory.get(category) === false) {
      throw new Error("This Klarna option is currently unavailable.");
    }

    const authorization = await new Promise<{
      approved: boolean;
      show_form: boolean;
      authorization_token?: string;
      finalize_required?: boolean;
    }>((resolve) =>
      klarna.authorize(
        { payment_method_category: category },
        authorizationData,
        resolve,
      ),
    );

    if (!authorization.approved) {
      if (!authorization.show_form) {
        throw new Error("This Klarna option is currently unavailable.");
      }
      throw new Error(
        "Klarna couldn't authorize this payment. Review your details and try again.",
      );
    }

    let authorizationToken = authorization.authorization_token;

    if (authorization.finalize_required) {
      const finalized = await new Promise<{
        approved: boolean;
        show_form: boolean;
        authorization_token?: string;
      }>((resolve) =>
        klarna.finalize(
          { payment_method_category: category },
          authorizationData,
          resolve,
        ),
      );

      if (!finalized.approved) {
        if (!finalized.show_form) {
          throw new Error("This Klarna option is currently unavailable.");
        }
        throw new Error("Klarna couldn't finalize this payment. Try again.");
      }

      authorizationToken = finalized.authorization_token ?? authorizationToken;
    }

    if (!authorizationToken) {
      throw new Error(
        "Klarna authorization response is missing an authorization token.",
      );
    }

    return {
      authorizationToken,
      sessionId: klarnaOption.sessionId,
      paymentMethodCategory: category,
    };
  }

  #getPayPalButtonsSessionCreatorName(
    type: string | undefined,
  ): string | undefined {
    switch (type) {
      case "paypal":
        return "createPayPalOneTimePaymentSession";
      case "paypal-pay-later":
        return "createPayLaterOneTimePaymentSession";
      case "paypal-credit":
        return "createPayPalCreditOneTimePaymentSession";
      case "venmo":
        return "createVenmoOneTimePaymentSession";
      case "sepa":
        return "createSepaOneTimePaymentSession";
      case "bancontact":
        return "createBancontactOneTimePaymentSession";
      case "ideal":
        return "createIdealOneTimePaymentSession";
      case "eps":
        return "createEpsOneTimePaymentSession";
      case "blik":
        return "createBlikOneTimePaymentSession";
      case "przelewy24":
        return "createP24OneTimePaymentSession";
      default:
        return undefined;
    }
  }

  async #tokenizePayPalPlatformButtons(
    option: PaymentMethodSelectorOption,
  ): Promise<{ orderId: string }> {
    type PayPalSdkLike = Record<string, unknown>;
    type PayPalLikeSession = {
      start: (opts: { presentationMode: string }) => Promise<unknown>;
    };
    type PayPalLikeSessionOptions = {
      orderId?: string;
      onApprove: (data: { orderId: string }) => Promise<void>;
      onCancel?: () => void;
      onError?: (data: { message?: string }) => void;
    };

    const paypal = this.#checkoutClient.paypal as
      PayPalSdkLike | null | undefined;

    if (!paypal) {
      throw new Error(
        "Unable to load PayPal. Choose a different payment method or try again.",
      );
    }

    const creatorName = this.#getPayPalButtonsSessionCreatorName(option.type);
    const sessionCreator = creatorName ? paypal[creatorName] : undefined;

    if (typeof sessionCreator !== "function") {
      throw new Error(
        "This PayPal payment method is not available. Choose a different payment method or try again.",
      );
    }

    const genericError =
      "PayPal checkout failed. Review your details and try again.";

    return new Promise<{ orderId: string }>((resolve, reject) => {
      const sessionOptions: PayPalLikeSessionOptions = {
        onApprove: async (data) => {
          resolve({ orderId: data.orderId });
        },
        onCancel: () => {
          reject(new Error("PayPal checkout was cancelled."));
        },
        onError: (data) => {
          reject(new Error(data?.message?.trim() || genericError));
        },
      };

      const paypalOrderId = option.paypalPlatform?.orderId;
      if (paypalOrderId) {
        sessionOptions.orderId = paypalOrderId;
      }

      const session = (
        sessionCreator as (opts: PayPalLikeSessionOptions) => PayPalLikeSession
      )(sessionOptions);

      session.start({ presentationMode: "popup" }).catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message.trim() : String(err).trim();
        reject(new Error(message || genericError));
      });
    });
  }

  #createKlarnaAuthorizationData(
    apiState: Record<string, unknown> | null,
  ): Record<string, unknown> {
    if (!apiState) return {};

    const customer = this.#asRecord(apiState.customer);
    const billingAddress = this.#asRecord(apiState.billing_address);
    const shipments = Array.isArray(apiState.shipments)
      ? apiState.shipments
      : [];
    const shippingAddress = this.#asRecord(shipments[0] ?? null);
    const email = this.#toOptionalText(customer?.email);

    const payload: Record<string, unknown> = {};

    const billing = this.#buildKlarnaAddress(billingAddress, email);
    if (billing) payload.billing_address = billing;

    const shipping = this.#buildKlarnaAddress(shippingAddress);
    if (shipping) payload.shipping_address = shipping;

    return payload;
  }

  #buildKlarnaAddress(
    source: Record<string, unknown> | null,
    email?: string,
  ): Record<string, string> | undefined {
    if (!source) return undefined;

    const address: Record<string, string> = {};
    const pairs: [string, unknown][] = [
      ["given_name", source.first_name],
      ["family_name", source.last_name],
      ["email", email ?? source.email],
      ["phone", source.phone],
      ["street_address", source.address1],
      ["street_address2", source.address2],
      ["postal_code", source.postal_code],
      ["city", source.city],
      ["region", source.region],
      ["country", source.country],
    ];

    for (const [key, value] of pairs) {
      const text = this.#toOptionalText(value);
      if (text) address[key] = text;
    }

    return Object.keys(address).length ? address : undefined;
  }

  #optionRequiresController(option: PaymentMethodSelectorOption): boolean {
    return Boolean(
      option.hostedCard ||
      option.hostedFields ||
      option.stripeCardElement ||
      option.stripePaymentElement ||
      option.adyenEmbedded ||
      option.squareUp ||
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
    this.#stripeSyncVersion += 1;
    this.#adyenSyncVersion += 1;
    this.#optionsRequestVersion += 1;
    this.#optionsLoading = false;
    this.#optionsPromise = null;
    this.#options = [];
    this.#cleanupAllStripeHosts();
    this.#cleanupAllAdyenHosts();
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
      this.#scheduleAdyenLightDomSync(undefined);
      return;
    }

    this.#clearUninitializedAlertTimer();
    this.#canRenderUninitializedAlert = true;

    const options = this.#resolveOptions();

    if (this.#optionsLoading && options.length === 0) {
      this.#renderLoadingState();
      this.#scheduleStripeLightDomSync(undefined);
      this.#scheduleAdyenLightDomSync(undefined);
      return;
    }

    const selectedOptionId = this.#resolveSelectedOptionId(options);
    const locale = this.#resolveLocale();
    const messages = this.#resolveMessages(locale);

    this.#root.render(
      <StyleSheetManager target={this.#shadowRootRef}>
        <ThemeProvider theme={{ tokens: this.#buildThemeTokens() }}>
          <IntlProvider
            locale={locale}
            defaultLocale={DEFAULT_LOCALE}
            // `messages` is `MESSAGES_BY_LOCALE[locale]` — a stable
            // module-level reference. react-intl's `createIntl` compares
            // `messages` by reference and skips recreating the intl object
            // when it hasn't changed, so this must stay the same object
            // across renders for an unchanged locale.
            messages={messages}
          >
            <Payment
              options={options}
              selectedOptionId={selectedOptionId}
              lang={locale}
              disabled={this.#loading}
              loading={this.#optionsLoading}
              onSelectionChange={(optionId) => {
                const previousSelectedOption = this.#resolveSelectedOption();
                if (previousSelectedOption?.id === optionId) {
                  return;
                }

                // When switching away from an Adyen option to a native option,
                // deselect any internally-selected Adyen Drop-in payment method so
                // the Drop-in doesn't appear to remain selected/open.
                const nextOption = options.find((o) => o.id === optionId);
                if (
                  previousSelectedOption &&
                  this.#isAdyenOption(previousSelectedOption) &&
                  nextOption &&
                  !this.#isAdyenOption(nextOption)
                ) {
                  const controller = this.#controllers.get(
                    previousSelectedOption.id,
                  );
                  controller?.deselect?.();
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
              onControllerReady={(optionId, controller) => {
                if (controller) {
                  this.#controllers.set(optionId, controller);
                  return;
                }

                this.#controllers.delete(optionId);
              }}
              onKlarnaAvailabilityChange={this.#setKlarnaAvailability}
              renderStripeContent={({ option }) => {
                const slotName = this.#getStripeSlotName(option.id);
                return <slot name={slotName} />;
              }}
              renderAdyenContent={({ option }) => {
                const slotName = this.#getAdyenSlotName(option.id);
                return <slot name={slotName} />;
              }}
            />
          </IntlProvider>
        </ThemeProvider>
      </StyleSheetManager>,
    );

    this.#scheduleStripeLightDomSync(selectedOptionId);
    this.#scheduleAdyenLightDomSync(selectedOptionId);
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
      <StyleSheetManager target={this.#shadowRootRef}>
        <ThemeProvider theme={{ tokens: this.#buildThemeTokens() }}>
          <Alert.Root aria-live="polite">
            <Alert.Description>{loadingText}</Alert.Description>
          </Alert.Root>
        </ThemeProvider>
      </StyleSheetManager>,
    );
  }

  #renderUninitializedState() {
    if (!this.#root) return;

    this.#root.render(
      <StyleSheetManager target={this.#shadowRootRef}>
        <ThemeProvider theme={{ tokens: this.#buildThemeTokens() }}>
          <Alert.Root $variant="destructive" aria-live="polite">
            <Alert.Description>
              Error: Checkout API client is not initialized. Include the
              Checkout API loader script or configure the client before
              rendering payment options.
            </Alert.Description>
          </Alert.Root>
        </ThemeProvider>
      </StyleSheetManager>,
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

  #buildThemeTokens() {
    return {
      letterSpacing: defaultTheme.letterSpacing,
      textTransform: defaultTheme.textTransform,
      font: {
        ...defaultTheme.font,
        body: this.getThemeProperty("themeFontBody") ?? defaultTheme.font.body,
      },
      color: {
        ...defaultTheme.color,
        body:
          this.getThemeProperty("themeColorBody") ?? defaultTheme.color.body,
        error:
          this.getThemeProperty("themeColorError") ?? defaultTheme.color.error,
        primary:
          this.getThemeProperty("themeColorPrimary") ??
          defaultTheme.color.primary,
        secondary:
          this.getThemeProperty("themeColorSecondary") ??
          defaultTheme.color.secondary,
        onPrimary:
          this.getThemeProperty("themeColorOnPrimary") ??
          defaultTheme.color.onPrimary,
      },
      outline: {
        ...defaultTheme.outline,
        primary:
          this.getThemeProperty("themeOutlinePrimary") ??
          defaultTheme.outline.primary,
      },
      background: {
        ...defaultTheme.background,
        surface:
          this.getThemeProperty("themeBackgroundSurface") ??
          defaultTheme.background.surface,
        field:
          this.getThemeProperty("themeBackgroundField") ??
          defaultTheme.background.field,
        disabledField:
          this.getThemeProperty("themeBackgroundDisabledField") ??
          defaultTheme.background.disabledField,
        buttonPrimary:
          this.getThemeProperty("themeBackgroundButtonPrimary") ??
          defaultTheme.background.buttonPrimary,
        error:
          this.getThemeProperty("themeBackgroundError") ??
          defaultTheme.background.error,
      },
      border: {
        ...defaultTheme.border,
        field:
          this.getThemeProperty("themeBorderField") ??
          defaultTheme.border.field,
      },
      borderRadius: {
        ...defaultTheme.borderRadius,
        sm:
          this.getThemeProperty("themeBorderRadiusSm") ??
          defaultTheme.borderRadius.sm,
      },
      space: {
        ...defaultTheme.space,
        md: this.getThemeProperty("themeSpaceMd") ?? defaultTheme.space.md,
      },
      size: {
        ...defaultTheme.size,
        control:
          this.getThemeProperty("themeSizeControl") ??
          defaultTheme.size.control,
        borderWidth:
          this.getThemeProperty("themeSizeBorderWidth") ??
          defaultTheme.size.borderWidth,
      },
      easing: defaultTheme.easing,
      duration: defaultTheme.duration,
      zIndex: defaultTheme.zIndex,
    };
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
    const normalized = toBcp47Locale(locale.trim());
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
      const orderId = this.#readPayloadString(payload, "orderId");
      return {
        paypalPlatform: {
          ...selectedOption.paypalPlatform,
          fundingSources: selectedOption.paypalPlatform.fundingSources
            ? [...selectedOption.paypalPlatform.fundingSources]
            : undefined,
          ...(orderId ? { orderId } : {}),
        },
      };
    }

    if (selectedOption.adyenEmbedded) {
      const result = this.#asRecord(payload.result);
      if (!result) {
        throw new Error(
          "Adyen Embedded tokenization response is missing a result.",
        );
      }

      return {
        adyenEmbedded: {
          result,
        },
      };
    }

    if (selectedOption.squareUp) {
      const nonce = this.#requirePayloadString(
        payload,
        "token",
        "Square tokenization response is missing a nonce.",
      );
      return {
        squareUp: {
          nonce,
          methodType: selectedOption.type ?? "",
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
      const token = this.#requirePayloadString(
        payload,
        "token",
        "Card tokenization response is missing a token.",
      );

      const isStandardCard =
        !!selectedOption.gateway &&
        !selectedOption.paypalPlatform &&
        !selectedOption.stripeCardElement &&
        !selectedOption.stripePaymentElement &&
        !selectedOption.adyenEmbedded &&
        !selectedOption.squareUp;

      return {
        token,
        requestId: this.#requirePayloadString(
          payload,
          "requestId",
          "Card tokenization response is missing a request id.",
        ),
        cardBrand: this.#readPayloadString(payload, "cardBrand"),
        last4: this.#readPayloadString(payload, "last4"),
        expirationMonth: this.#readPayloadNumber(payload, "expirationMonth"),
        expirationYear: this.#readPayloadNumber(payload, "expirationYear"),
        ...(isStandardCard && {
          gateway: selectedOption.gateway,
        }),
      };
    }

    if (selectedOption.type === "ach") {
      const accountType = this.#readPayloadString(payload, "accountType");
      if (accountType !== "checking" && accountType !== "savings") {
        throw new Error(
          "ACH tokenization response has an invalid account type.",
        );
      }
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
        last4: this.#requirePayloadString(
          payload,
          "last4",
          "ACH tokenization response is missing last 4 digits.",
        ),
        routingNumber: this.#requirePayloadString(
          payload,
          "routingNumber",
          "ACH tokenization response is missing routing number.",
        ),
        accountType,
      };
    }

    if (selectedOption.type === "stripe-card-element") {
      return {
        requestId: crypto.randomUUID(),
        card_token_id: this.#requirePayloadString(
          payload,
          "paymentMethodId",
          "Stripe Card Element tokenization response is missing a payment method id.",
        ),
      };
    }

    // No token: the checkout submission names the gateway and nothing else.
    // The only thing to check is that the Payment Element really validated the
    // shopper's details — submitting without it creates a PaymentIntent that
    // nothing on the page can confirm.
    if (selectedOption.type === "stripe-payment-element") {
      if (payload.ready !== true) {
        throw new Error("Stripe Payment Element is not ready yet.");
      }

      return { requestId: crypto.randomUUID() };
    }

    if (selectedOption.type === "purchase-order") {
      return {
        requestId: this.#requirePayloadString(
          payload,
          "requestId",
          "Purchase order tokenization response is missing a request id.",
        ),
        purchaseOrderNumber: this.#requirePayloadString(
          payload,
          "purchaseOrderNumber",
          "Purchase order tokenization response is missing a purchase order number.",
        ),
      };
    }

    if (
      selectedOption.type === "mollie" ||
      selectedOption.type === "sezzle" ||
      selectedOption.type === "generic"
    ) {
      return { requestId: crypto.randomUUID() };
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
    if (normalized === "adyen-embedded") return "adyen_embedded";
    return normalized;
  }

  #createAdyenEmbeddedGatewayEntries(
    config: Record<string, unknown>,
  ): Record<string, unknown>[] {
    const paymentMethodsResponse = config.payment_methods_response;
    const environment = this.#toOptionalText(config.environment);
    const clientKey = this.#toOptionalText(config.client_key);

    if (
      !paymentMethodsResponse ||
      typeof paymentMethodsResponse !== "object" ||
      !environment ||
      !clientKey
    ) {
      return [];
    }

    return [
      {
        type: "adyen-embedded",
        gateway: "adyen_embedded",
        payment_methods_response: paymentMethodsResponse,
        environment,
        client_key: clientKey,
      },
    ];
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
        type: "klarna" as const,
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

  // INTERIM: the card embed needs its store's gateway_id, which it fetches using
  // template_set_id. Removed when card token vaulting lands.
  #resolveTemplateSetId(
    apiState: Record<string, unknown> | null,
  ): number | undefined {
    return this.#toNumber(this.#asRecord(apiState?.template_set)?.id);
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

    const orderId = this.#toOptionalText(config.order_id);

    const entries: Record<string, unknown>[] = [
      {
        type: "paypal",
        gateway: "paypal_platform",
        client_id: clientId,
        order_id: orderId,
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
        order_id: orderId,
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
        order_id: orderId,
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
        order_id: orderId,
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
        order_id: orderId,
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
        order_id: orderId,
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
        order_id: orderId,
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
          order_id: orderId,
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
      return [{ type: "sezzle", gateway }];
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
          auth_only: config.auth_only === true,
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

    if (
      ACH_GATEWAY_TYPES.has(gateway) ||
      (Array.isArray(config.fields) && Array.isArray(config.account_types))
    ) {
      return [
        {
          type: "ach",
          gateway,
          fields: Array.isArray(config.fields) ? config.fields : undefined,
          account_types: Array.isArray(config.account_types)
            ? config.account_types
            : undefined,
        },
      ];
    }

    if (gateway === "adyen_embedded") {
      return this.#createAdyenEmbeddedGatewayEntries(config);
    }

    if (gateway === "square_up") {
      return this.#createSquareUpGatewayEntries(config, apiState);
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



  /**
   * The order total in the currency's smallest unit, which has to come out as
   * the same integer the backend puts on the PaymentIntent — Stripe compares
   * the two when confirming, and `total_order` is the same
   * `getTotalAmountToCharge()` the intent is built from.
   */
  #getStripePaymentElementAmount(
    apiState: Record<string, unknown>,
  ): number | undefined {
    const totals = Array.isArray(apiState.totals) ? apiState.totals : [];
    const total = this.#asRecord(totals[0]);
    const totalOrder = total?.total_order;
    if (typeof totalOrder !== "number" || !Number.isFinite(totalOrder)) {
      return undefined;
    }

    const currency = this.#getStripePaymentElementCurrency(apiState);
    if (!currency) return undefined;

    const exponent = getCurrencyMinorUnitExponent(currency);
    if (exponent === undefined) return undefined;

    const amount = Math.round(totalOrder * 10 ** exponent);

    return Number.isSafeInteger(amount) && amount >= 0 ? amount : undefined;
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
    const orderId = this.#toOptionalText(option.order_id);

    return {
      clientId,
      flow: "buttons",
      fundingSources: fundingSource ? [fundingSource] : undefined,
      ...(orderId ? { orderId } : {}),
    };
  }

  #createStripePaymentElementOptions(
    apiState: Record<string, unknown>,
    authOnly: boolean,
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

    // Both must match the PaymentIntent the backend creates on submit, or
    // Stripe refuses to confirm it. An auth-only gateway makes the intent
    // manual-capture, and the backend attaches a Stripe customer with
    // `setup_future_usage: off_session` for everyone who is not checking out as
    // a guest — so the card stays reusable.
    if (authOnly) {
      options.captureMethod = "manual";
    }

    if (this.#stripeIntentSavesPaymentMethod(apiState)) {
      options.setupFutureUsage = "off_session";
    }

    const defaultValues = this.#getStripePaymentElementDefaultValues(apiState);
    if (defaultValues) {
      options.defaultValues = defaultValues;
    }

    return options;
  }

  /**
   * Whether the backend will ask Stripe to keep the payment method on file.
   * Mirrors its own condition, which is the customer's guest-vs-account
   * preference — not whether they already have an account, since a first-time
   * buyer creating one still has no customer id at submit time.
   */
  #stripeIntentSavesPaymentMethod(apiState: Record<string, unknown>): boolean {
    const customer = this.#asRecord(apiState.customer);

    return this.#toOptionalText(customer?.type) !== "guest";
  }

  /**
   * Where Stripe sends a shopper who was taken offsite to authenticate (3DS, or
   * a redirect-based payment method).
   *
   * Their own checkout page, rather than the gateway config's `return_url`:
   * that one is only rewritten to the v3 `?action=return` landing for
   * full-page-redirect gateways, so on this path it still points at the legacy
   * endpoint. Coming back to the checkout keeps the shopper somewhere that can
   * resolve the attempt.
   */
  #getStripeReturnUrl(apiState: Record<string, unknown>): string | undefined {
    const store = this.#asRecord(apiState.store);
    const checkoutUrl = this.#toOptionalText(store?.checkout_url);
    if (!checkoutUrl) return undefined;

    const session = this.#asRecord(apiState.session);
    const sessionId = this.#toOptionalText(session?.id);

    try {
      const url = new URL(checkoutUrl);
      if (sessionId) url.searchParams.set("session_id", sessionId);
      return url.toString();
    } catch {
      return undefined;
    }
  }

  #getStripePaymentElementDefaultValues(
    apiState: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    const customer = this.#asRecord(apiState.customer);
    const billingAddress = this.#asRecord(apiState.billing_address);

    const firstName = this.#toOptionalText(billingAddress?.first_name);
    const lastName = this.#toOptionalText(billingAddress?.last_name);
    const name = [firstName, lastName].filter(Boolean).join(" ") || undefined;
    const email = this.#toOptionalText(customer?.email);
    const phone = this.#toOptionalText(billingAddress?.phone);
    const line1 = this.#toOptionalText(billingAddress?.address1);
    const line2 = this.#toOptionalText(billingAddress?.address2);
    const city = this.#toOptionalText(billingAddress?.city);
    const state = this.#toOptionalText(billingAddress?.region);
    const postalCode = this.#toOptionalText(billingAddress?.postal_code);
    const country = this.#toOptionalText(billingAddress?.country);

    const address: Record<string, string> = {};
    if (line1) address.line1 = line1;
    if (line2) address.line2 = line2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postal_code = postalCode;
    if (country) address.country = country;

    const billingDetails: Record<string, unknown> = {};
    if (name) billingDetails.name = name;
    if (email) billingDetails.email = email;
    if (phone) billingDetails.phone = phone;
    if (Object.keys(address).length) billingDetails.address = address;

    return Object.keys(billingDetails).length ? { billingDetails } : undefined;
  }

  #createAdyenEmbeddedConfig(
    option: Record<string, unknown>,
  ): PaymentMethodSelectorAdyenEmbeddedConfig | undefined {
    if (this.#toText(option.gateway) !== "adyen_embedded") {
      return undefined;
    }

    const paymentMethodsResponse = option.payment_methods_response;
    const environment = this.#toOptionalText(option.environment);
    const clientKey = this.#toOptionalText(option.client_key);

    if (
      !paymentMethodsResponse ||
      typeof paymentMethodsResponse !== "object" ||
      !environment ||
      !clientKey
    ) {
      return undefined;
    }

    return {
      paymentMethodsResponse: paymentMethodsResponse as Record<string, unknown>,
      environment,
      clientKey,
    };
  }

  #createSquareUpGatewayEntries(
    config: Record<string, unknown>,
    apiState: Record<string, unknown>,
  ): Record<string, unknown>[] {
    const applicationId = this.#toOptionalText(config.application_id);
    const locationId = this.#toOptionalText(config.location_id);
    const environment = this.#toOptionalText(config.environment);

    if (!applicationId || !locationId || !environment) {
      return [];
    }

    const format = this.#asRecord(apiState.format);
    const rawLocaleCode = this.#toOptionalText(format?.locale_code);
    const localeCode = rawLocaleCode ? toBcp47Locale(rawLocaleCode) : undefined;
    const country = localeCode?.includes("-")
      ? localeCode.split("-").pop()?.toUpperCase()
      : undefined;
    const methods =
      (!!country ? SQUARE_UP_METHODS_BY_COUNTRY[country] : null) ??
      SQUARE_UP_DEFAULT_METHODS;

    return methods.map((type) => ({
      type,
      gateway: "square_up",
      application_id: applicationId,
      location_id: locationId,
      environment,
    }));
  }

  #createSquareUpConfig(
    option: Record<string, unknown>,
  ): PaymentMethodSelectorSquareUpConfig | undefined {
    if (this.#toText(option.gateway) !== "square_up") {
      return undefined;
    }

    const applicationId = this.#toOptionalText(option.application_id);
    const locationId = this.#toOptionalText(option.location_id);
    const rawEnvironment = this.#toOptionalText(option.environment);

    if (!applicationId || !locationId || !rawEnvironment) {
      return undefined;
    }

    if (rawEnvironment !== "sandbox" && rawEnvironment !== "production") {
      return undefined;
    }

    return { applicationId, locationId, environment: rawEnvironment };
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

    if (gateway === "adyen_embedded") {
      const adyenEmbedded = this.#createAdyenEmbeddedConfig(option);
      if (!adyenEmbedded) {
        return [];
      }

      return [
        {
          id: optionId,
          type,
          label: "Adyen",
          gateway,
          disabled,
          adyenEmbedded,
        },
      ];
    }

    if (gateway === "square_up") {
      const squareUp = this.#createSquareUpConfig(option);
      if (!squareUp) {
        return [];
      }

      return [
        {
          id: optionId,
          type,
          label: "",
          gateway,
          disabled,
          squareUp,
        },
      ];
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
                  // INTERIM: removed when card token vaulting lands.
                  templateSetId: this.#resolveTemplateSetId(apiState),
                }
              : undefined,
          paypalPlatform,
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
            // INTERIM: removed when card token vaulting lands.
            templateSetId: this.#resolveTemplateSetId(apiState),
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
      const returnUrl = this.#getStripeReturnUrl(apiState);
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
            paymentElementOptions: this.#createStripePaymentElementOptions(
              apiState,
              option.auth_only === true,
            ),
            ...(returnUrl ? { returnUrl } : {}),
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
      return [
        {
          id: optionId,
          type: "sezzle",
          label: "",
          gateway: gateway || undefined,
          disabled,
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

  #isStripeOption(option: PaymentMethodSelectorOption | undefined): boolean {
    if (!option) return false;
    return (
      (option.type === "stripe-card-element" &&
        Boolean(option.stripeCardElement)) ||
      (option.type === "stripe-payment-element" &&
        Boolean(option.stripePaymentElement))
    );
  }

  #isAdyenOption(option: PaymentMethodSelectorOption | undefined): boolean {
    return Boolean(option?.adyenEmbedded);
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
        <ThemeProvider theme={{ tokens: this.#buildThemeTokens() }}>
          <StripeCardElementOption
            option={option}
            onControllerReady={(controller) => {
              if (controller) {
                this.#controllers.set(option.id, controller);
                return;
              }

              this.#controllers.delete(option.id);
            }}
          />
        </ThemeProvider>,
      );
      return;
    }

    if (
      option.type === "stripe-payment-element" &&
      option.stripePaymentElement
    ) {
      root.render(
        <ThemeProvider theme={{ tokens: this.#buildThemeTokens() }}>
          <StripePaymentElementOption
            option={option}
            onControllerReady={(controller) => {
              if (controller) {
                this.#controllers.set(option.id, controller);
                return;
              }

              this.#controllers.delete(option.id);
            }}
            onPaymentMethodTypeChange={(type) => {
              this.dispatchEvent(
                new CustomEvent("stripepaymentmethodtypechange", {
                  bubbles: true,
                  composed: true,
                  detail: { type },
                }),
              );
            }}
          />
        </ThemeProvider>,
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

  #getAdyenSlotName(optionId: string): string {
    const normalized = optionId.replace(/[^a-zA-Z0-9_-]/g, "-");
    return `foxy-adyen-slot-${normalized}`;
  }

  #ensureAdyenHost(optionId: string): HTMLDivElement {
    const existing = this.#lightDomAdyenHosts.get(optionId);
    if (existing) return existing;

    const host = document.createElement("div");
    host.setAttribute("slot", this.#getAdyenSlotName(optionId));
    host.dataset.foxyAdyenHost = optionId;
    this.append(host);
    this.#lightDomAdyenHosts.set(optionId, host);

    return host;
  }

  #renderAdyenOption(option: PaymentMethodSelectorOption) {
    const host = this.#ensureAdyenHost(option.id);

    let root = this.#lightDomAdyenRoots.get(option.id);
    if (!root) {
      root = createRoot(host);
      this.#lightDomAdyenRoots.set(option.id, root);
    }

    // Stable callback references: create once per option, reuse on re-renders.
    // Inline arrow functions would change identity on every render and cause the
    // useEffect inside AdyenEmbeddedOption to re-run, tearing down and re-creating
    // the Adyen Drop-in component unnecessarily.
    let callbacks = this.#lightDomAdyenCallbacks.get(option.id);
    if (!callbacks) {
      callbacks = {
        onSelect: () => {
          const options = this.#resolveOptions();
          const nextOptionIndex = options.findIndex((o) => o.id === option.id);
          if (nextOptionIndex >= 0) {
            this.optionIndex = nextOptionIndex;
          }
        },
        onControllerReady: (controller: PaymentController | null) => {
          if (controller) {
            this.#controllers.set(option.id, controller);
            return;
          }

          this.#controllers.delete(option.id);
        },
      };
      this.#lightDomAdyenCallbacks.set(option.id, callbacks);
    }

    root.render(
      <ThemeProvider theme={{ tokens: this.#buildThemeTokens() }}>
        <AdyenEmbeddedOption
          option={option}
          onSelect={callbacks.onSelect}
          onControllerReady={callbacks.onControllerReady}
        />
      </ThemeProvider>,
    );
  }

  #cleanupAdyenHost(optionId: string) {
    this.#controllers.delete(optionId);

    const root = this.#lightDomAdyenRoots.get(optionId);
    if (root) {
      root.unmount();
      this.#lightDomAdyenRoots.delete(optionId);
    }

    const host = this.#lightDomAdyenHosts.get(optionId);
    if (host) {
      host.remove();
      this.#lightDomAdyenHosts.delete(optionId);
    }

    this.#lightDomAdyenCallbacks.delete(optionId);
  }

  #cleanupAllAdyenHosts() {
    for (const optionId of this.#lightDomAdyenHosts.keys()) {
      this.#cleanupAdyenHost(optionId);
    }
  }

  #scheduleAdyenLightDomSync(selectedOptionId: string | undefined) {
    const syncVersion = ++this.#adyenSyncVersion;

    queueMicrotask(() => {
      if (syncVersion !== this.#adyenSyncVersion) return;
      this.#syncAdyenLightDomMount(selectedOptionId);
    });
  }

  #syncAdyenLightDomMount(selectedOptionId: string | undefined) {
    const options = this.#resolveOptions();
    const adyenOptions = options.filter((opt) => this.#isAdyenOption(opt));

    if (!adyenOptions.length) {
      this.#cleanupAllAdyenHosts();
      return;
    }

    const nativeOptions = options.filter((opt) => !this.#isAdyenOption(opt));
    const hasNativeOptions = nativeOptions.length > 0;

    if (hasNativeOptions) {
      // Adyen is always visible below the RadioGroup — keep all adyen hosts mounted
      // regardless of which native option is currently selected.
      for (const option of adyenOptions) {
        this.#renderAdyenOption(option as PaymentMethodSelectorOption);
      }
    } else {
      // Pure-adyen configuration: only mount the selected adyen option so that
      // switching between multiple adyen methods unmounts the previous one.
      if (!selectedOptionId) {
        this.#cleanupAllAdyenHosts();
        return;
      }

      const selectedOption = adyenOptions.find(
        (opt) => opt.id === selectedOptionId,
      );
      if (!selectedOption) {
        this.#cleanupAllAdyenHosts();
        return;
      }

      this.#renderAdyenOption(selectedOption as PaymentMethodSelectorOption);
    }

    const mountedIds = new Set(
      hasNativeOptions
        ? adyenOptions.map((o) => o.id)
        : selectedOptionId
          ? [selectedOptionId]
          : [],
    );

    for (const optionId of [...this.#lightDomAdyenHosts.keys()]) {
      if (!mountedIds.has(optionId)) {
        this.#cleanupAdyenHost(optionId);
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
