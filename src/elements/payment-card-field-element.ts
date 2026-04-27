import type { CardEmbedTokenizeErrorCode, CardValidationField } from "@foxy.io/sdk/checkout";
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

type PaymentCardFieldMode = "full" | "csc-only";

export type PaymentCardFieldOption = {
  secureOrigin?: string;
  mode: PaymentCardFieldMode;
  translationCardNumberLabel?: string;
  translationCardNumberPlaceholder?: string;
  translationCardExpirationLabel?: string;
  translationCardExpirationPlaceholder?: string;
  translationCardCscLabel?: string;
  translationCardCscPlaceholder?: string;
};

type TokenizeDeferred = {
  resolve: (value: { token: string; requestId?: string }) => void;
  reject: (error: Error) => void;
  timeoutId: number;
};

type TokenizationSuccessEventDetail = {
  token: string;
  requestId?: string;
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
  "--background",
  "--input-placeholder-color",
  "--input-height",
  "--input-padding",
  "--input-padding-x",
  "--input-padding-y",
  "--font-sans",
  "--input-text-color",
  "--input-error-text-color",
  "--input-font-size",
] as const;

type ThemeCssVar = (typeof THEME_CSS_VARS)[number];
type ThemeAttributeName = `theme-${string}`;

const THEME_ATTR_TO_CSS_VAR: Record<ThemeAttributeName, ThemeCssVar> =
  THEME_CSS_VARS.reduce(
    (result, cssVar) => {
      const attrName = `theme-${cssVar.slice(2)}` as ThemeAttributeName;
      result[attrName] = cssVar;
      return result;
    },
    {} as Record<ThemeAttributeName, ThemeCssVar>,
  );

const THEME_ATTRIBUTE_NAMES = Object.keys(THEME_ATTR_TO_CSS_VAR) as ThemeAttributeName[];

const MODE_ATTRIBUTE = "mode";
const SECURE_ORIGIN_ATTRIBUTE = "secure-origin";
const LANG_ATTRIBUTE = "lang";
const TRANSLATION_CARD_NUMBER_LABEL_ATTRIBUTE = "translation-card-number-label";
const TRANSLATION_CARD_NUMBER_PLACEHOLDER_ATTRIBUTE =
  "translation-card-number-placeholder";
const TRANSLATION_CARD_EXPIRATION_LABEL_ATTRIBUTE = "translation-card-expiration-label";
const TRANSLATION_CARD_EXPIRATION_PLACEHOLDER_ATTRIBUTE =
  "translation-card-expiration-placeholder";
const TRANSLATION_CARD_CSC_LABEL_ATTRIBUTE = "translation-card-csc-label";
const TRANSLATION_CARD_CSC_PLACEHOLDER_ATTRIBUTE = "translation-card-csc-placeholder";

const TRANSLATION_ATTRIBUTE_TO_KEY = {
  [TRANSLATION_CARD_NUMBER_LABEL_ATTRIBUTE]: "card.number.label",
  [TRANSLATION_CARD_NUMBER_PLACEHOLDER_ATTRIBUTE]: "card.number.placeholder",
  [TRANSLATION_CARD_EXPIRATION_LABEL_ATTRIBUTE]: "card.expiration.label",
  [TRANSLATION_CARD_EXPIRATION_PLACEHOLDER_ATTRIBUTE]: "card.expiration.placeholder",
  [TRANSLATION_CARD_CSC_LABEL_ATTRIBUTE]: "card.csc.label",
  [TRANSLATION_CARD_CSC_PLACEHOLDER_ATTRIBUTE]: "card.csc.placeholder",
} as const;

type TranslationAttributeName = keyof typeof TRANSLATION_ATTRIBUTE_TO_KEY;
const TRANSLATION_ATTRIBUTE_NAMES = Object.keys(
  TRANSLATION_ATTRIBUTE_TO_KEY,
) as TranslationAttributeName[];

function normalizeUrl(secureOrigin: string): URL | null {
  try {
    const origin = secureOrigin.replace(/\/$/, "");
    return new URL(`${origin}${DEFAULT_EMBED_PATH}`);
  } catch {
    return null;
  }
}

function isValidationField(value: unknown): value is CardValidationField {
  return (
    value === "cc-number" ||
    value === "cc-exp" ||
    value === "cc-csc" ||
    value === "form"
  );
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

function toMode(value: string | null): PaymentCardFieldMode {
  return value === "csc-only" ? "csc-only" : "full";
}

export class PaymentCardFieldElement extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes(): string[] {
    return [
      MODE_ATTRIBUTE,
      SECURE_ORIGIN_ATTRIBUTE,
      LANG_ATTRIBUTE,
      ...TRANSLATION_ATTRIBUTE_NAMES,
      ...THEME_ATTRIBUTE_NAMES,
    ];
  }

  private _disabled = false;
  private _secureOrigin = DEFAULT_CARD_SECURE_ORIGIN;
  private _mode: PaymentCardFieldMode = "full";
  private _lang: string | undefined;
  private _iframe: HTMLIFrameElement | null = null;
  private _port: MessagePort | null = null;
  private _fallbackRequestCounter = 0;
  private _pendingTokenizes = new Map<string, TokenizeDeferred>();
  private _ready = false;
  private _fieldValidation = new Map<CardValidationField, { valid: boolean; message: string | null }>();
  private _focused = false;
  private _touched = false;
  private _invalid = false;
  private _internals: ElementInternals | null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._internals = typeof this.attachInternals === "function" ? this.attachInternals() : null;

    const secureOrigin = this.getAttribute(SECURE_ORIGIN_ATTRIBUTE)?.trim();
    if (secureOrigin) this._secureOrigin = secureOrigin;
    this._mode = toMode(this.getAttribute(MODE_ATTRIBUTE));
    this._lang = this.getAttribute(LANG_ATTRIBUTE)?.trim() || undefined;
  }

  addEventListener<K extends keyof PaymentCardFieldEventMap>(
    type: K,
    listener: (this: PaymentCardFieldElement, event: PaymentCardFieldEventMap[K]) => void,
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
    listener: (this: PaymentCardFieldElement, event: PaymentCardFieldEventMap[K]) => void,
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

  get secureOrigin(): string {
    return this._secureOrigin;
  }

  set secureOrigin(value: string) {
    const normalized = value.trim();
    if (!normalized || this._secureOrigin === normalized) return;

    this._secureOrigin = normalized;
    if (this.getAttribute(SECURE_ORIGIN_ATTRIBUTE) !== normalized) {
      this.setAttribute(SECURE_ORIGIN_ATTRIBUTE, normalized);
    }

    if (!this.isConnected) return;
    this._mountIframe();
  }

  get mode(): PaymentCardFieldMode {
    return this._mode;
  }

  set mode(value: PaymentCardFieldMode) {
    const normalized = value === "csc-only" ? "csc-only" : "full";
    if (this._mode === normalized) return;

    this._mode = normalized;
    if (this.getAttribute(MODE_ATTRIBUTE) !== normalized) {
      this.setAttribute(MODE_ATTRIBUTE, normalized);
    }

    this._updateFormValidity(true, null);
    this._sendConfig();
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    if (this._disabled === value) return;
    this._disabled = value;
    if (this._disabled) this._focused = false;
    this._syncPublicStates();
    this._sendConfig();

    if (this._disabled) {
      this._internals?.setValidity({});
    }
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

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    if (name === MODE_ATTRIBUTE) {
      this._mode = toMode(newValue);
      this._sendConfig();
      return;
    }

    if (name === SECURE_ORIGIN_ATTRIBUTE) {
      this._secureOrigin = newValue?.trim() || DEFAULT_CARD_SECURE_ORIGIN;
      if (this.isConnected) this._mountIframe();
      return;
    }

    if (name === LANG_ATTRIBUTE) {
      this._lang = newValue?.trim() || undefined;
      if (this.isConnected) this._sendConfig();
      return;
    }

    if (TRANSLATION_ATTRIBUTE_NAMES.includes(name as TranslationAttributeName)) {
      if (this.isConnected) this._sendConfig();
      return;
    }

    if (!THEME_ATTRIBUTE_NAMES.includes(name as ThemeAttributeName)) return;
    if (!this.isConnected) return;

    if (name === "theme-input-height" && this._iframe) {
      const nextHeight = this._resolveInitialIframeHeight();
      this._iframe.style.minHeight = nextHeight;
      this._applyIframeHeight(nextHeight);
    }

    this._sendConfig();
  }

  clear(): void {
    this._postPort({ type: "clear" });
  }

  tokenize(requestId?: string): Promise<{ token: string; requestId?: string }> {
    if (!this._port || !this._ready) {
      const error = this._emitTokenizeError("invalid_state", requestId);
      return Promise.reject(error);
    }

    const normalizedRequestId =
      requestId ?? `card-tokenize-${++this._fallbackRequestCounter}-${Date.now()}`;

    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this._pendingTokenizes.delete(normalizedRequestId);
        reject(this._emitTokenizeError("tokenization_failed", normalizedRequestId));
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

    if (this._port) {
      this._port.onmessage = null;
      this._port.close();
      this._port = null;
    }

    for (const [requestId, deferred] of this._pendingTokenizes) {
      window.clearTimeout(deferred.timeoutId);
      deferred.reject(new Error(`Card tokenization aborted for request ${requestId}.`));
      this._pendingTokenizes.delete(requestId);
    }

    this._iframe?.remove();
    this._iframe = null;
  }

  private _mountIframe(): void {
    const shadowRoot = this.shadowRoot;
    if (!shadowRoot) return;

    this._ready = false;
    this._fieldValidation.clear();

    if (this._port) {
      this._port.onmessage = null;
      this._port.close();
      this._port = null;
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("part", "iframe");
    iframe.setAttribute("scrolling", "no");
    iframe.title =
      this._mode === "csc-only"
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
      iframe.setAttribute("srcdoc", "<!doctype html><html><body></body></html>");
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
    const url = normalizeUrl(this._secureOrigin);
    if (!url) return null;
    return url.toString();
  }

  private _connectPort(iframe: HTMLIFrameElement): void {
    const contentWindow = iframe.contentWindow;
    const url = normalizeUrl(this._secureOrigin);

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
    this._sendConfig();
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
      this.dispatchEvent(new Event(paymentCardFieldEvents.load, { bubbles: true, composed: true }));
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

      if (typeof requestId !== "string") return;

      const pending = this._pendingTokenizes.get(requestId);
      if (!pending) return;

      this._pendingTokenizes.delete(requestId);
      window.clearTimeout(pending.timeoutId);

      if (typeof token === "string" && token) {
        this.dispatchEvent(
          new CustomEvent<TokenizationSuccessEventDetail>(
            paymentCardFieldEvents.tokenizationSuccess,
            {
              detail: { token, requestId },
              bubbles: true,
              composed: true,
            },
          ),
        );
        pending.resolve({ token, requestId });
      } else {
        const error = this._emitTokenizeError("tokenization_failed", requestId);
        pending.reject(error);
      }
    }
  }

  private _handleValidationPayload(payload: Record<string, unknown>): void {
    const field = payload["field"];
    const valid = payload["valid"];
    const message = payload["message"];

    if (!isValidationField(field) || typeof valid !== "boolean") return;
    if (!(typeof message === "string" || message === null)) return;

    this._fieldValidation.set(field, { valid, message });

    if (field === "form") {
      this._updateFormValidity(valid, message);
      return;
    }

    const activeFields: CardValidationField[] =
      this._mode === "csc-only" ? ["cc-csc"] : ["cc-number", "cc-exp", "cc-csc"];

    const invalid = activeFields
      .map((name) => this._fieldValidation.get(name))
      .find((state) => state && !state.valid);

    this._updateFormValidity(!invalid, invalid?.message ?? null);
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

  private _sendConfig(): void {
    const style = this._getThemeAttributes();
    this._postPort({
      type: "config",
      disabled: this._disabled,
      mode: this._mode,
      lang: this._lang,
      style: Object.keys(style).length > 0 ? style : undefined,
      translations: this._getTranslationsFromAttributes(),
    });
  }

  private _getTranslationsFromAttributes(): Record<string, string> | undefined {
    const translations: Record<string, string> = {};

    for (const attrName of TRANSLATION_ATTRIBUTE_NAMES) {
      const value = this.getAttribute(attrName)?.trim();
      if (!value) continue;
      translations[TRANSLATION_ATTRIBUTE_TO_KEY[attrName]] = value;
    }

    return Object.keys(translations).length > 0 ? translations : undefined;
  }

  private _getThemeAttributes(): Record<string, string> {
    const style: Record<string, string> = {};

    for (const attrName of THEME_ATTRIBUTE_NAMES) {
      const value = this.getAttribute(attrName)?.trim();
      if (!value) continue;
      style[THEME_ATTR_TO_CSS_VAR[attrName]] = value;
    }

    return style;
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

if (typeof window !== "undefined" && !customElements.get(PAYMENT_CARD_FIELD_ELEMENT_TAG)) {
  customElements.define(PAYMENT_CARD_FIELD_ELEMENT_TAG, PaymentCardFieldElement);
}

declare global {
  interface HTMLElementTagNameMap {
    [PAYMENT_CARD_FIELD_ELEMENT_TAG]: PaymentCardFieldElement;
  }
}
