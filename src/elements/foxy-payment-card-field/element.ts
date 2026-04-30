import type { CardEmbedTokenizeErrorCode } from "@foxy.io/sdk/checkout";
import { getRequiredEnvVar } from "@/lib/required-env";

export const PAYMENT_CARD_FIELD_ELEMENT_TAG = "foxy-payment-card-field";

export const paymentCardFieldEvents = {
  load: "load",
  resize: "resize",
  tokenizationSuccess: "tokenizationsuccess",
  tokenizationError: "tokenizationerror",
} as const;

const DEFAULT_CARD_SECURE_ORIGIN = getRequiredEnvVar("VITE_EMBED_ORIGIN");
const DEFAULT_EMBED_PATH = "/v2.html";

type PaymentCardFieldMode = "card" | "card_csc";
type EmbedValidationField = "cc_number" | "cc_exp" | "cc_csc" | "form";
type EmbedValidationCode =
  | "value_missing"
  | "pattern_mismatch"
  | "range_underflow"
  | "card_brand_unsupported"
  | "invalid_state";

export type PaymentCardFieldOption = {
  mode: PaymentCardFieldMode;
  translationCardNumberLabel?: string;
  translationCardNumberPlaceholder?: string;
  translationCardExpirationLabel?: string;
  translationCardExpirationPlaceholder?: string;
  translationCardCscLabel?: string;
  translationCardCscPlaceholder?: string;
};

type TokenizeDeferred = {
  resolve: (value: TokenizationSuccessEventDetail) => void;
  reject: (error: Error) => void;
  timeoutId: number;
};

type TokenizationSuccessEventDetail = {
  token: string;
  requestId?: string;
  cardBrand?: string;
  last4?: string;
  expirationMonth?: number;
  expirationYear?: number;
};

type TokenizationErrorEventDetail = {
  code: CardEmbedTokenizeErrorCode;
  message?: string;
  requestId?: string;
};

type ResizeEventDetail = {
  height: string;
};

type PaymentCardFieldEventMap = HTMLElementEventMap & {
  load: Event;
  resize: CustomEvent<ResizeEventDetail>;
  tokenizationsuccess: CustomEvent<TokenizationSuccessEventDetail>;
  tokenizationerror: CustomEvent<TokenizationErrorEventDetail>;
};

const THEME_CSS_VARS = [
  "theme-background",
  "theme-input-placeholder-color",
  "theme-input-height",
  "theme-input-padding",
  "theme-input-padding-x",
  "theme-input-padding-y",
  "theme-font-sans",
  "theme-input-text-color",
  "theme-input-error-text-color",
  "theme-input-font-size",
] as const;

type ThemeAttributeName = (typeof THEME_CSS_VARS)[number];

const THEME_ATTR_TO_QUERY_KEY: Record<ThemeAttributeName, string> = {
  "theme-background": "theme_background",
  "theme-input-placeholder-color": "theme_input_placeholder_color",
  "theme-input-height": "theme_input_height",
  "theme-input-padding": "theme_input_padding",
  "theme-input-padding-x": "theme_input_padding_x",
  "theme-input-padding-y": "theme_input_padding_y",
  "theme-font-sans": "theme_font_sans",
  "theme-input-text-color": "theme_input_text_color",
  "theme-input-error-text-color": "theme_input_error_text_color",
  "theme-input-font-size": "theme_input_font_size",
};

const THEME_ATTRIBUTE_NAMES = [...THEME_CSS_VARS];

const THEME_PROPERTY_TO_ATTRIBUTE = {
  themeBackground: "theme-background",
  themeInputPlaceholderColor: "theme-input-placeholder-color",
  themeInputHeight: "theme-input-height",
  themeInputPadding: "theme-input-padding",
  themeInputPaddingX: "theme-input-padding-x",
  themeInputPaddingY: "theme-input-padding-y",
  themeFontSans: "theme-font-sans",
  themeInputTextColor: "theme-input-text-color",
  themeInputErrorTextColor: "theme-input-error-text-color",
  themeInputFontSize: "theme-input-font-size",
} as const;

type ThemePropertyName = keyof typeof THEME_PROPERTY_TO_ATTRIBUTE;

const MODE_ATTRIBUTE = "mode";
const DISABLED_ATTRIBUTE = "disabled";
const LANG_ATTRIBUTE = "lang";
const TRANSLATION_CARD_NUMBER_LABEL_ATTRIBUTE = "translation-card-number-label";
const TRANSLATION_CARD_NUMBER_PLACEHOLDER_ATTRIBUTE =
  "translation-card-number-placeholder";
const TRANSLATION_CARD_EXPIRATION_LABEL_ATTRIBUTE =
  "translation-card-expiration-label";
const TRANSLATION_CARD_EXPIRATION_PLACEHOLDER_ATTRIBUTE =
  "translation-card-expiration-placeholder";
const TRANSLATION_CARD_CSC_LABEL_ATTRIBUTE = "translation-card-csc-label";
const TRANSLATION_CARD_CSC_PLACEHOLDER_ATTRIBUTE =
  "translation-card-csc-placeholder";

const TRANSLATION_ATTRIBUTE_TO_KEY = {
  [TRANSLATION_CARD_NUMBER_LABEL_ATTRIBUTE]: "cc_number_label",
  [TRANSLATION_CARD_NUMBER_PLACEHOLDER_ATTRIBUTE]: "cc_number_placeholder",
  [TRANSLATION_CARD_EXPIRATION_LABEL_ATTRIBUTE]: "cc_exp_label",
  [TRANSLATION_CARD_EXPIRATION_PLACEHOLDER_ATTRIBUTE]: "cc_exp_placeholder",
  [TRANSLATION_CARD_CSC_LABEL_ATTRIBUTE]: "cc_csc_label",
  [TRANSLATION_CARD_CSC_PLACEHOLDER_ATTRIBUTE]: "cc_csc_placeholder",
} as const;

type TranslationAttributeName = keyof typeof TRANSLATION_ATTRIBUTE_TO_KEY;
const TRANSLATION_ATTRIBUTE_NAMES = Object.keys(
  TRANSLATION_ATTRIBUTE_TO_KEY,
) as TranslationAttributeName[];

const TRANSLATION_PROPERTY_TO_ATTRIBUTE = {
  translationCardNumberLabel: TRANSLATION_CARD_NUMBER_LABEL_ATTRIBUTE,
  translationCardNumberPlaceholder:
    TRANSLATION_CARD_NUMBER_PLACEHOLDER_ATTRIBUTE,
  translationCardExpirationLabel: TRANSLATION_CARD_EXPIRATION_LABEL_ATTRIBUTE,
  translationCardExpirationPlaceholder:
    TRANSLATION_CARD_EXPIRATION_PLACEHOLDER_ATTRIBUTE,
  translationCardCscLabel: TRANSLATION_CARD_CSC_LABEL_ATTRIBUTE,
  translationCardCscPlaceholder: TRANSLATION_CARD_CSC_PLACEHOLDER_ATTRIBUTE,
} as const;

type TranslationPropertyName = keyof typeof TRANSLATION_PROPERTY_TO_ATTRIBUTE;

function normalizeStringAttribute(
  value: string | null | undefined,
): string | undefined {
  return value?.trim() || undefined;
}

function normalizeUrl(secureOrigin: string): URL | null {
  try {
    const url = new URL(secureOrigin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return new URL(DEFAULT_EMBED_PATH, `${url.origin}/`);
  } catch {
    return null;
  }
}

function normalizeValidationField(value: unknown): EmbedValidationField | null {
  switch (value) {
    case "cc-number":
    case "cc_number":
      return "cc_number";
    case "cc-exp":
    case "cc_exp":
      return "cc_exp";
    case "cc-csc":
    case "cc_csc":
      return "cc_csc";
    case "form":
      return "form";
    default:
      return null;
  }
}

function toValidationMessage(
  field: EmbedValidationField,
  code: EmbedValidationCode | null,
): string | null {
  if (!code) return null;

  if (field === "cc_number") {
    return code === "card_brand_unsupported"
      ? "This card brand is not accepted."
      : "Please enter a valid card number.";
  }

  if (field === "cc_exp") {
    return "Please enter a valid expiration date.";
  }

  if (field === "cc_csc") {
    return "Please enter a valid security code.";
  }

  return "Card details are invalid.";
}

function toErrorMessage(code: CardEmbedTokenizeErrorCode): string {
  switch (code) {
    case "invalid_state":
      return "Secure card fields are not ready yet.";
    case "invalid_config":
      return "Secure card embed configuration is incomplete.";
    case "tokenization_failed":
      return "Unable to tokenize card details.";
  }
}

function normalizeMode(value: string | null | undefined): PaymentCardFieldMode {
  return value === "card_csc" ? "card_csc" : "card";
}

export class PaymentCardFieldElement extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes(): string[] {
    return [
      MODE_ATTRIBUTE,
      DISABLED_ATTRIBUTE,
      LANG_ATTRIBUTE,
      ...TRANSLATION_ATTRIBUTE_NAMES,
      ...THEME_ATTRIBUTE_NAMES,
    ];
  }

  private _disabled = false;
  private _mode: PaymentCardFieldMode = "card";
  private _lang: string | undefined;
  private _iframe: HTMLIFrameElement | null = null;
  private _port: MessagePort | null = null;
  private _fallbackRequestCounter = 0;
  private _pendingTokenizes = new Map<string, TokenizeDeferred>();
  private _ready = false;
  private _fieldValidation = new Map<
    EmbedValidationField,
    { valid: boolean; message: string | null }
  >();
  private _focused = false;
  private _touched = false;
  private _invalid = false;
  private _internals: ElementInternals | null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._internals =
      typeof this.attachInternals === "function"
        ? this.attachInternals()
        : null;

    this._disabled = this.hasAttribute(DISABLED_ATTRIBUTE);
    this._mode = normalizeMode(this.getAttribute(MODE_ATTRIBUTE));
    this._lang = this.getAttribute(LANG_ATTRIBUTE)?.trim() || undefined;
    this._syncPublicStates();
  }

  addEventListener<K extends keyof PaymentCardFieldEventMap>(
    type: K,
    listener: (
      this: PaymentCardFieldElement,
      event: PaymentCardFieldEventMap[K],
    ) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    super.addEventListener(type, listener, options);
  }

  removeEventListener<K extends keyof PaymentCardFieldEventMap>(
    type: K,
    listener: (
      this: PaymentCardFieldElement,
      event: PaymentCardFieldEventMap[K],
    ) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void {
    super.removeEventListener(type, listener, options);
  }

  get mode(): PaymentCardFieldMode {
    return this._mode;
  }

  set mode(value: PaymentCardFieldMode) {
    const normalized = normalizeMode(value);
    if (this._mode === normalized) return;

    this._mode = normalized;
    if (this.getAttribute(MODE_ATTRIBUTE) !== normalized) {
      this.setAttribute(MODE_ATTRIBUTE, normalized);
    }

    this._syncAggregateValidity();
    if (this.isConnected) this._mountIframe();
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    const normalized = Boolean(value);
    if (this._disabled === normalized) return;

    this._applyDisabledState(normalized);
    if (normalized) {
      this.setAttribute(DISABLED_ATTRIBUTE, "");
    } else {
      this.removeAttribute(DISABLED_ATTRIBUTE);
    }
  }

  get translationCardNumberLabel(): string | undefined {
    return this._getTranslationProperty("translationCardNumberLabel");
  }

  set translationCardNumberLabel(value: string | undefined) {
    this._setTranslationProperty("translationCardNumberLabel", value);
  }

  get translationCardNumberPlaceholder(): string | undefined {
    return this._getTranslationProperty("translationCardNumberPlaceholder");
  }

  set translationCardNumberPlaceholder(value: string | undefined) {
    this._setTranslationProperty("translationCardNumberPlaceholder", value);
  }

  get translationCardExpirationLabel(): string | undefined {
    return this._getTranslationProperty("translationCardExpirationLabel");
  }

  set translationCardExpirationLabel(value: string | undefined) {
    this._setTranslationProperty("translationCardExpirationLabel", value);
  }

  get translationCardExpirationPlaceholder(): string | undefined {
    return this._getTranslationProperty("translationCardExpirationPlaceholder");
  }

  set translationCardExpirationPlaceholder(value: string | undefined) {
    this._setTranslationProperty("translationCardExpirationPlaceholder", value);
  }

  get translationCardCscLabel(): string | undefined {
    return this._getTranslationProperty("translationCardCscLabel");
  }

  set translationCardCscLabel(value: string | undefined) {
    this._setTranslationProperty("translationCardCscLabel", value);
  }

  get translationCardCscPlaceholder(): string | undefined {
    return this._getTranslationProperty("translationCardCscPlaceholder");
  }

  set translationCardCscPlaceholder(value: string | undefined) {
    this._setTranslationProperty("translationCardCscPlaceholder", value);
  }

  get themeBackground(): string | undefined {
    return this._getThemeProperty("themeBackground");
  }

  set themeBackground(value: string | undefined) {
    this._setThemeProperty("themeBackground", value);
  }

  get themeInputPlaceholderColor(): string | undefined {
    return this._getThemeProperty("themeInputPlaceholderColor");
  }

  set themeInputPlaceholderColor(value: string | undefined) {
    this._setThemeProperty("themeInputPlaceholderColor", value);
  }

  get themeInputHeight(): string | undefined {
    return this._getThemeProperty("themeInputHeight");
  }

  set themeInputHeight(value: string | undefined) {
    this._setThemeProperty("themeInputHeight", value);
  }

  get themeInputPadding(): string | undefined {
    return this._getThemeProperty("themeInputPadding");
  }

  set themeInputPadding(value: string | undefined) {
    this._setThemeProperty("themeInputPadding", value);
  }

  get themeInputPaddingX(): string | undefined {
    return this._getThemeProperty("themeInputPaddingX");
  }

  set themeInputPaddingX(value: string | undefined) {
    this._setThemeProperty("themeInputPaddingX", value);
  }

  get themeInputPaddingY(): string | undefined {
    return this._getThemeProperty("themeInputPaddingY");
  }

  set themeInputPaddingY(value: string | undefined) {
    this._setThemeProperty("themeInputPaddingY", value);
  }

  get themeFontSans(): string | undefined {
    return this._getThemeProperty("themeFontSans");
  }

  set themeFontSans(value: string | undefined) {
    this._setThemeProperty("themeFontSans", value);
  }

  get themeInputTextColor(): string | undefined {
    return this._getThemeProperty("themeInputTextColor");
  }

  set themeInputTextColor(value: string | undefined) {
    this._setThemeProperty("themeInputTextColor", value);
  }

  get themeInputErrorTextColor(): string | undefined {
    return this._getThemeProperty("themeInputErrorTextColor");
  }

  set themeInputErrorTextColor(value: string | undefined) {
    this._setThemeProperty("themeInputErrorTextColor", value);
  }

  get themeInputFontSize(): string | undefined {
    return this._getThemeProperty("themeInputFontSize");
  }

  set themeInputFontSize(value: string | undefined) {
    this._setThemeProperty("themeInputFontSize", value);
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  checkValidity(): boolean {
    return this._internals?.checkValidity() ?? true;
  }

  reportValidity(): boolean {
    return this._internals?.reportValidity() ?? true;
  }

  connectedCallback(): void {
    this._mountIframe();
  }

  disconnectedCallback(): void {
    this._teardown();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (oldValue === newValue) return;

    if (name === MODE_ATTRIBUTE) {
      const normalized = normalizeMode(newValue);
      if (newValue !== null && newValue !== normalized) {
        this.setAttribute(MODE_ATTRIBUTE, normalized);
        return;
      }

      if (this._mode === normalized) return;
      this._mode = normalized;
      if (this.isConnected) this._mountIframe();
      return;
    }

    if (name === DISABLED_ATTRIBUTE) {
      this._applyDisabledState(newValue !== null);
      return;
    }

    if (name === LANG_ATTRIBUTE) {
      this._lang = newValue?.trim() || undefined;
      if (this.isConnected) this._mountIframe();
      return;
    }

    if (
      TRANSLATION_ATTRIBUTE_NAMES.includes(name as TranslationAttributeName)
    ) {
      if (this.isConnected) this._mountIframe();
      return;
    }

    if (!THEME_ATTRIBUTE_NAMES.includes(name as ThemeAttributeName)) return;
    if (!this.isConnected) return;

    this._mountIframe();
  }

  clear(): void {
    this._postPort({ type: "clear" });
  }

  tokenize(requestId?: string): Promise<TokenizationSuccessEventDetail> {
    if (!this._port || !this._ready) {
      const error = this._emitTokenizeError("invalid_state", requestId);
      return Promise.reject(error);
    }

    const normalizedRequestId =
      requestId ??
      `card-tokenize-${++this._fallbackRequestCounter}-${Date.now()}`;

    if (this._pendingTokenizes.has(normalizedRequestId)) {
      const error = this._emitTokenizeError(
        "invalid_state",
        normalizedRequestId,
        `Tokenization request "${normalizedRequestId}" is already pending.`,
      );
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this._pendingTokenizes.delete(normalizedRequestId);
        reject(
          this._emitTokenizeError("tokenization_failed", normalizedRequestId),
        );
      }, 30000);

      this._pendingTokenizes.set(normalizedRequestId, {
        resolve,
        reject,
        timeoutId,
      });
      this._postPort({ type: "tokenization_request", id: normalizedRequestId });
    });
  }

  private _teardown(): void {
    this._ready = false;
    this._focused = false;
    this._touched = false;
    this._invalid = false;
    this._syncPublicStates();

    this._disconnectPort();
    this._rejectPendingTokenizes("Card tokenization aborted.");

    this._iframe?.remove();
    this._iframe = null;
  }

  private _mountIframe(): void {
    const shadowRoot = this.shadowRoot;
    if (!shadowRoot) return;

    this._ready = false;
    this._fieldValidation.clear();
    this._disconnectPort();
    this._rejectPendingTokenizes("Card tokenization aborted.");
    this._iframe?.remove();
    this._iframe = null;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("part", "iframe");
    iframe.setAttribute("scrolling", "no");
    iframe.title =
      this._mode === "card_csc"
        ? "Secure card security code"
        : "Secure card details";
    iframe.style.display = "block";
    iframe.style.width = "100%";
    const initialHeight = this._resolveInitialIframeHeight();
    iframe.style.height = initialHeight;
    iframe.style.minHeight = initialHeight;
    iframe.style.border = "0";
    iframe.style.background = "transparent";
    iframe.style.overflow = "hidden";
    iframe.style.visibility = "hidden";
    iframe.style.opacity = "0";
    iframe.style.transition = "opacity 120ms ease";
    iframe.addEventListener("focus", this._onIframeFocus);
    iframe.addEventListener("blur", this._onIframeBlur);
    iframe.addEventListener("pointerdown", this._onIframePointerDown);

    const iframeUrl = this._buildIframeUrl();
    if (iframeUrl) {
      iframe.src = iframeUrl;
    } else {
      iframe.setAttribute(
        "srcdoc",
        "<!doctype html><html><body></body></html>",
      );
    }

    iframe.addEventListener("load", () => this._connectPort(iframe));

    const hostStyle = document.createElement("style");
    hostStyle.textContent = ":host { display: block; }";
    while (shadowRoot.firstChild) shadowRoot.removeChild(shadowRoot.firstChild);
    shadowRoot.appendChild(hostStyle);
    shadowRoot.appendChild(iframe);
    this._iframe = iframe;
  }

  private _resolveInitialIframeHeight(): string {
    const styleHeight = this.getAttribute("theme-input-height")?.trim();
    return styleHeight || "52px";
  }

  private _onIframeFocus = (): void => {
    if (this._disabled) return;
    this._focused = true;
    this._touched = true;
    this._syncPublicStates();
  };

  private _onIframePointerDown = (): void => {
    if (this._disabled) return;
    // Chrome does not fire the focus event on cross-origin iframe elements
    // when the user clicks inside them. pointerdown fires reliably before
    // the click is processed inside the iframe, so we use it as a proxy
    // to set the focused state on click.
    this._focused = true;
    this._touched = true;
    this._syncPublicStates();
  };

  private _onIframeBlur = (): void => {
    this._focused = false;
    this._syncPublicStates();
  };

  private _applyIframeHeight(nextHeight: string): void {
    if (!this._iframe) return;

    const normalizedHeight = nextHeight.trim();
    if (!normalizedHeight) return;

    const numericHeight = Number.parseFloat(normalizedHeight);
    if (Number.isFinite(numericHeight) && numericHeight <= 0) {
      this._iframe.style.height = this._resolveInitialIframeHeight();
      return;
    }

    this._iframe.style.height = normalizedHeight;
  }

  private _buildIframeUrl(): string | null {
    const url = normalizeUrl(DEFAULT_CARD_SECURE_ORIGIN);
    if (!url) return null;

    url.searchParams.set("mode", this._mode);

    if (this._lang) {
      url.searchParams.set("lang", this._lang);
    }

    for (const attrName of THEME_ATTRIBUTE_NAMES) {
      const value = this.getAttribute(attrName)?.trim();
      if (!value) continue;
      url.searchParams.set(THEME_ATTR_TO_QUERY_KEY[attrName], value);
    }

    for (const attrName of TRANSLATION_ATTRIBUTE_NAMES) {
      const value = this.getAttribute(attrName)?.trim();
      if (!value) continue;
      url.searchParams.set(
        `translations_${TRANSLATION_ATTRIBUTE_TO_KEY[attrName]}`,
        value,
      );
    }

    return url.toString();
  }

  private _getThemeProperty(name: ThemePropertyName): string | undefined {
    return normalizeStringAttribute(
      this.getAttribute(THEME_PROPERTY_TO_ATTRIBUTE[name]),
    );
  }

  private _setThemeProperty(
    name: ThemePropertyName,
    value: string | undefined,
  ): void {
    this._setStringAttribute(THEME_PROPERTY_TO_ATTRIBUTE[name], value);
  }

  private _getTranslationProperty(
    name: TranslationPropertyName,
  ): string | undefined {
    return normalizeStringAttribute(
      this.getAttribute(TRANSLATION_PROPERTY_TO_ATTRIBUTE[name]),
    );
  }

  private _setTranslationProperty(
    name: TranslationPropertyName,
    value: string | undefined,
  ): void {
    this._setStringAttribute(TRANSLATION_PROPERTY_TO_ATTRIBUTE[name], value);
  }

  private _setStringAttribute(name: string, value: string | undefined): void {
    const normalized = normalizeStringAttribute(value);

    if (normalized === undefined) {
      this.removeAttribute(name);
      return;
    }

    if (this.getAttribute(name) !== normalized) {
      this.setAttribute(name, normalized);
    }
  }

  private _connectPort(iframe: HTMLIFrameElement): void {
    const contentWindow = iframe.contentWindow;
    const url = normalizeUrl(DEFAULT_CARD_SECURE_ORIGIN);

    if (!contentWindow || !url) return;

    if (this._port) {
      this._port.onmessage = null;
      this._port.close();
    }

    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => this._handlePortMessage(event);
    channel.port1.start();

    contentWindow.postMessage("connect", url.origin, [channel.port2]);
    this._port = channel.port1;
    this._syncDisabledState();
  }

  private _handlePortMessage(event: MessageEvent<string>): void {
    if (typeof event.data !== "string") return;

    let data: unknown;

    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    if (!data || typeof data !== "object") return;

    const payload = data as Record<string, unknown>;
    const type = payload["type"];
    if (type === "ready") {
      this._ready = true;
      if (this._iframe) {
        this._iframe.style.visibility = "visible";
        this._iframe.style.opacity = "1";
      }
      this.dispatchEvent(
        new Event(paymentCardFieldEvents.load, {
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }

    if (type === "resize") {
      const height = payload["height"];
      if (typeof height !== "string") return;

      this._applyIframeHeight(height);
      this.dispatchEvent(
        new CustomEvent<ResizeEventDetail>(paymentCardFieldEvents.resize, {
          detail: { height },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }

    if (type === "validation") {
      this._handleValidationPayload(payload);
      return;
    }

    if (type === "focus") {
      if (this._disabled) return;
      this._focused = true;
      this._touched = true;
      this._syncPublicStates();
      return;
    }

    if (type === "blur") {
      this._focused = false;
      this._syncPublicStates();
      return;
    }

    if (type === "tokenization_response") {
      const requestId = payload["id"];
      const token = payload["token"];
      const brand = payload["brand"];
      const last4Digits = payload["last4Digits"];
      const expirationMonth = payload["expirationMonth"];
      const expirationYear = payload["expirationYear"];

      if (typeof requestId !== "string") return;

      const pending = this._pendingTokenizes.get(requestId);
      if (!pending) return;

      this._pendingTokenizes.delete(requestId);
      window.clearTimeout(pending.timeoutId);

      if (typeof token === "string" && token) {
        const detail: TokenizationSuccessEventDetail = { token, requestId };

        if (typeof brand === "string" && brand) {
          detail.cardBrand = brand;
        }

        if (typeof last4Digits === "string" && last4Digits) {
          detail.last4 = last4Digits;
        }

        if (typeof expirationMonth === "number") {
          detail.expirationMonth = expirationMonth;
        }

        if (typeof expirationYear === "number") {
          detail.expirationYear = expirationYear;
        }

        this.dispatchEvent(
          new CustomEvent<TokenizationSuccessEventDetail>(
            paymentCardFieldEvents.tokenizationSuccess,
            {
              detail,
              bubbles: true,
              composed: true,
            },
          ),
        );
        pending.resolve(detail);
      } else {
        const error = this._emitTokenizeError("tokenization_failed", requestId);
        pending.reject(error);
      }
    }
  }

  private _handleValidationPayload(payload: Record<string, unknown>): void {
    const field = normalizeValidationField(payload["field"]);
    const valid = payload["valid"];
    const code = payload["code"];

    if (!field || typeof valid !== "boolean") return;
    if (
      !(
        typeof code === "string" ||
        code === null ||
        typeof code === "undefined"
      )
    )
      return;

    const message =
      valid || typeof code !== "string"
        ? null
        : toValidationMessage(field, code as EmbedValidationCode);
    this._fieldValidation.set(field, { valid, message });

    if (field === "form") {
      this._updateFormValidity(valid, message);
      return;
    }

    this._syncAggregateValidity();
  }

  private _updateFormValidity(valid: boolean, message: string | null): void {
    this._invalid = !valid;
    this._syncPublicStates();

    if (!this._internals) return;

    if (valid) {
      this._internals.setValidity({});
      return;
    }

    this._internals.setValidity(
      { customError: true },
      message?.trim() || "Card details are invalid.",
    );
  }

  private _applyDisabledState(disabled: boolean): void {
    if (this._disabled === disabled) return;

    this._disabled = disabled;
    if (disabled) this._focused = false;
    this._syncPublicStates();
    this._syncDisabledState();

    if (disabled) {
      this._internals?.setValidity({});
      return;
    }

    this._syncAggregateValidity();
  }

  private _syncAggregateValidity(): void {
    const activeFields: EmbedValidationField[] =
      this._mode === "card_csc"
        ? ["cc_csc"]
        : ["cc_number", "cc_exp", "cc_csc"];
    const activeStates = activeFields
      .map((name) => this._fieldValidation.get(name))
      .filter(
        (
          state,
        ): state is {
          valid: boolean;
          message: string | null;
        } => state !== undefined,
      );
    const invalid = activeStates.find((state) => !state.valid);

    if (invalid) {
      this._updateFormValidity(false, invalid.message ?? null);
      return;
    }

    if (activeStates.length > 0) {
      this._updateFormValidity(true, null);
      return;
    }

    const formState = this._fieldValidation.get("form");
    this._updateFormValidity(
      formState?.valid ?? true,
      formState?.message ?? null,
    );
  }

  private _syncPublicStates(): void {
    const isDisabled = this._disabled;
    const isFocused = this._focused && !isDisabled;
    const isUserInvalid = this._touched && this._invalid;
    const isUserValid = this._touched && !this._invalid;

    this._toggleState("disabled", isDisabled);
    this._toggleState("focused", isFocused);
    this._toggleState("user-invalid", isUserInvalid);
    this._toggleState("user-valid", isUserValid);
  }

  private _toggleState(name: string, enabled: boolean): void {
    if (enabled) {
      this._internals?.states?.add(name);
      return;
    }

    this._internals?.states?.delete(name);
  }

  private _syncDisabledState(): void {
    this._postPort({ type: this._disabled ? "disable" : "enable" });
  }

  private _disconnectPort(): void {
    if (!this._port) return;

    this._port.onmessage = null;
    this._port.close();
    this._port = null;
  }

  private _rejectPendingTokenizes(message: string): void {
    for (const [requestId, deferred] of this._pendingTokenizes) {
      window.clearTimeout(deferred.timeoutId);
      deferred.reject(new Error(`${message} Request: ${requestId}.`));
      this._pendingTokenizes.delete(requestId);
    }
  }

  private _postPort(message: Record<string, unknown>): void {
    if (!this._port) return;
    this._port.postMessage(JSON.stringify(message));
  }

  private _emitTokenizeError(
    code: CardEmbedTokenizeErrorCode,
    requestId?: string,
    message = toErrorMessage(code),
  ): Error {
    this.dispatchEvent(
      new CustomEvent<TokenizationErrorEventDetail>(
        paymentCardFieldEvents.tokenizationError,
        {
          detail: { code, message, requestId },
          bubbles: true,
          composed: true,
        },
      ),
    );

    return new Error(message);
  }
}

if (
  typeof window !== "undefined" &&
  !customElements.get(PAYMENT_CARD_FIELD_ELEMENT_TAG)
) {
  customElements.define(
    PAYMENT_CARD_FIELD_ELEMENT_TAG,
    PaymentCardFieldElement,
  );
}

declare global {
  interface HTMLElementTagNameMap {
    [PAYMENT_CARD_FIELD_ELEMENT_TAG]: PaymentCardFieldElement;
  }
}
