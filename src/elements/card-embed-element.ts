import type {
  CardEmbedTokenizeErrorCode,
  CardValidationField,
} from "@foxy.io/sdk/checkout";
import { getRequiredEnvVar } from "@/lib/required-env";

export const CARD_EMBED_ELEMENT_TAG = "foxy-payment-card-field";

const CARD_STYLE_ATTRIBUTE_NAMES = [
  "card-input-background",
  "card-input-placeholder-color",
  "card-input-height",
  "card-input-padding",
  "card-input-padding-x",
  "card-input-padding-y",
  "card-input-font",
  "card-input-text-color",
  "card-input-text-color-error",
  "card-input-font-size",
] as const;

type CardStyleAttributeName = (typeof CARD_STYLE_ATTRIBUTE_NAMES)[number];

const STYLE_ATTR_TO_CSS_VAR: Record<CardStyleAttributeName, string> = {
  "card-input-background": "--background",
  "card-input-placeholder-color": "--input-placeholder-color",
  "card-input-height": "--input-height",
  "card-input-padding": "--input-padding",
  "card-input-padding-x": "--input-padding-x",
  "card-input-padding-y": "--input-padding-y",
  "card-input-font": "--font-sans",
  "card-input-text-color": "--input-text-color",
  "card-input-text-color-error": "--input-error-text-color",
  "card-input-font-size": "--input-font-size",
};

const DEFAULT_CARD_SECURE_ORIGIN = getRequiredEnvVar("VITE_CARD_SECURE_ORIGIN");

type TokenizeDeferred = {
  resolve: (value: { token: string; requestId?: string }) => void;
  reject: (error: Error) => void;
  timeoutId: number;
};

export type CardEmbedElementConfig = {
  secureOrigin: string;
  embedPath: string;
  merchantOrigin?: string;
  templateSetId?: number;
  mode: "full" | "csc-only";
  paymentToken?: string;
  demoMode?: "full" | "csc-only";
  style?: Record<string, string>;
  translations?: Record<string, string>;
};

export type CardEmbedReadyEventDetail = {
  mode: "full" | "csc-only";
};

export type CardEmbedValidationEventDetail = {
  field: CardValidationField;
  valid: boolean;
  message: string | null;
};

export type CardEmbedResizeEventDetail = {
  height: string;
};

export type CardEmbedTokenizeSuccessEventDetail = {
  token: string;
  requestId?: string;
};

export type CardEmbedTokenizeErrorEventDetail = {
  code: CardEmbedTokenizeErrorCode;
  message?: string;
  requestId?: string;
};

export const cardEmbedEvents = {
  ready: "foxy-ready",
  validation: "foxy-validation",
  resize: "foxy-resize",
  tokenizeSuccess: "foxy-tokenize-success",
  tokenizeError: "foxy-tokenize-error",
} as const;

export interface CardEmbedElementContract extends HTMLElement {
  config: CardEmbedElementConfig;
  disabled: boolean;
  readonly: boolean;
  clear(): void;
  setDisabled(disabled: boolean): void;
  setReadonly(readonly: boolean): void;
  tokenize(requestId?: string): Promise<{ token: string; requestId?: string }>;
}

function normalizeUrl(secureOrigin: string, embedPath: string): URL | null {
  try {
    const origin = secureOrigin.replace(/\/$/, "");
    const path = embedPath.startsWith("/") ? embedPath : `/${embedPath}`;
    return new URL(`${origin}${path}`);
  } catch {
    return null;
  }
}

function areStringMapsEqual(
  left?: Record<string, string>,
  right?: Record<string, string>,
): boolean {
  const leftKeys = Object.keys(left ?? {}).sort();
  const rightKeys = Object.keys(right ?? {}).sort();

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every(
    (key, index) => key === rightKeys[index] && left?.[key] === right?.[key],
  );
}

function areConfigsEqual(
  left: CardEmbedElementConfig,
  right: CardEmbedElementConfig,
): boolean {
  return (
    left.secureOrigin === right.secureOrigin &&
    left.embedPath === right.embedPath &&
    (left.merchantOrigin ?? "") === (right.merchantOrigin ?? "") &&
    left.templateSetId === right.templateSetId &&
    left.mode === right.mode &&
    (left.paymentToken ?? "") === (right.paymentToken ?? "") &&
    (left.demoMode ?? "") === (right.demoMode ?? "") &&
    areStringMapsEqual(left.style, right.style) &&
    areStringMapsEqual(left.translations, right.translations)
  );
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

export class CardEmbedElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return [...CARD_STYLE_ATTRIBUTE_NAMES];
  }

  private _config: CardEmbedElementConfig = {
    secureOrigin: DEFAULT_CARD_SECURE_ORIGIN,
    embedPath: "/v2.html",
    mode: "full",
  };

  private _disabled = false;
  private _readonly = false;
  private _iframe: HTMLIFrameElement | null = null;
  private _port: MessagePort | null = null;
  private _fallbackRequestCounter = 0;
  private _pendingTokenizes = new Map<string, TokenizeDeferred>();
  private _ready = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  get config(): CardEmbedElementConfig {
    return this._config;
  }

  set config(value: CardEmbedElementConfig) {
    if (areConfigsEqual(this._config, value)) return;

    const nextUrl = this._buildIframeUrl(value);
    const previousUrl = this._buildIframeUrl(this._config);
    const shouldRemount = nextUrl !== previousUrl;

    this._config = { ...value };

    if (!this.isConnected) return;

    if (shouldRemount) {
      this._mountIframe();
    } else {
      this._sendConfig();
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    if (this._disabled === value) return;
    this._disabled = value;
    this._sendConfig();
  }

  get readonly(): boolean {
    return this._readonly;
  }

  set readonly(value: boolean) {
    if (this._readonly === value) return;
    this._readonly = value;
    this._sendConfig();
  }

  connectedCallback(): void {
    this._mountIframe();
  }

  disconnectedCallback(): void {
    this.destroy();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (!CARD_STYLE_ATTRIBUTE_NAMES.includes(name as CardStyleAttributeName))
      return;
    if (oldValue === newValue) return;
    if (!this.isConnected) return;

    if (name === "card-input-height" && this._iframe) {
      const nextHeight = this._resolveInitialIframeHeight();
      this._iframe.style.minHeight = nextHeight;
      this._applyIframeHeight(nextHeight);
    }

    this._sendConfig();
  }

  clear(): void {
    this._postPort({ type: "clear" });
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }

  setReadonly(readonly: boolean): void {
    this.readonly = readonly;
  }

  tokenize(requestId?: string): Promise<{ token: string; requestId?: string }> {
    const invalidConfigCode = this._getInvalidConfigCode();
    if (invalidConfigCode) {
      const error = this._emitTokenizeError(invalidConfigCode, requestId);
      return Promise.reject(error);
    }

    if (!this._port || !this._ready) {
      const error = this._emitTokenizeError("invalid_state", requestId);
      return Promise.reject(error);
    }

    const normalizedRequestId =
      requestId ??
      `card-tokenize-${++this._fallbackRequestCounter}-${Date.now()}`;

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

  destroy(): void {
    this._ready = false;

    if (this._port) {
      this._port.onmessage = null;
      this._port.close();
      this._port = null;
    }

    for (const [requestId, deferred] of this._pendingTokenizes) {
      window.clearTimeout(deferred.timeoutId);
      deferred.reject(
        new Error(`Card tokenization aborted for request ${requestId}.`),
      );
      this._pendingTokenizes.delete(requestId);
    }

    this._iframe?.remove();
    this._iframe = null;
  }

  private _mountIframe(): void {
    const shadowRoot = this.shadowRoot;
    if (!shadowRoot) return;

    this._ready = false;

    if (this._port) {
      this._port.onmessage = null;
      this._port.close();
      this._port = null;
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("part", "iframe");
    iframe.setAttribute("scrolling", "no");
    iframe.title =
      this._config.mode === "csc-only"
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

    const iframeUrl = this._buildIframeUrl(this._config);
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
    const styleHeight = this.getAttribute("card-input-height")?.trim();
    return styleHeight || "52px";
  }

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

  private _buildIframeUrl(config: CardEmbedElementConfig): string | null {
    const url = normalizeUrl(config.secureOrigin, config.embedPath);
    if (!url) return null;

    if (config.demoMode) {
      url.searchParams.set("demo", config.demoMode);
    } else if (
      typeof config.templateSetId === "number" &&
      config.templateSetId > 0
    ) {
      url.searchParams.set("template_set_id", String(config.templateSetId));
    }

    return url.toString();
  }

  private _connectPort(iframe: HTMLIFrameElement): void {
    const contentWindow = iframe.contentWindow;
    const url = normalizeUrl(this._config.secureOrigin, this._config.embedPath);

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
      this._dispatch("card-ready", { mode: this._config.mode });
      return;
    }

    if (type === "resize") {
      const height = payload["height"];
      if (typeof height !== "string") return;

      this._applyIframeHeight(height);

      this._dispatch("card-resize", { height });
      return;
    }

    if (type === "validation") {
      const field = payload["field"];
      const valid = payload["valid"];
      const message = payload["message"];

      if (!isValidationField(field) || typeof valid !== "boolean") return;
      if (!(typeof message === "string" || message === null)) return;

      this._dispatch("card-validation", { field, valid, message });
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
        this._dispatch("card-tokenize-success", { token, requestId });
        pending.resolve({ token, requestId });
      } else {
        const error = this._emitTokenizeError("tokenization_failed", requestId);
        pending.reject(error);
      }
    }
  }

  private _getInvalidConfigCode(): CardEmbedTokenizeErrorCode | null {
    const hasDemoMode = Boolean(this._config.demoMode);
    const hasTemplateSetId =
      typeof this._config.templateSetId === "number" &&
      this._config.templateSetId > 0;

    if (!hasDemoMode && !hasTemplateSetId) {
      return "invalid_config";
    }

    if (
      this._config.mode === "csc-only" &&
      !hasDemoMode &&
      !this._config.paymentToken
    ) {
      return "invalid_config";
    }

    return null;
  }

  private _sendConfig(): void {
    const mergedStyle = {
      ...(this._config.style ?? {}),
      ...this._getStyleAttributes(),
    };
    this._postPort({
      type: "config",
      disabled: this._disabled,
      readonly: this._readonly,
      mode: this._config.mode,
      token: this._config.paymentToken,
      style: Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined,
      translations: this._config.translations,
    });
  }

  private _getStyleAttributes(): Record<string, string> {
    const style: Record<string, string> = {};
    for (const attrName of CARD_STYLE_ATTRIBUTE_NAMES) {
      const value = this.getAttribute(attrName)?.trim();
      if (value) style[STYLE_ATTR_TO_CSS_VAR[attrName]] = value;
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
    this._dispatch("card-tokenize-error", { code, message, requestId });
    return new Error(message);
  }

  private _dispatch<T>(type: string, detail: T): void {
    this.dispatchEvent(
      new CustomEvent<T>(type, { detail, bubbles: true, composed: true }),
    );
  }
}

export function defineCardEmbedElement(): void {
  if (typeof window === "undefined") return;
  if (customElements.get(CARD_EMBED_ELEMENT_TAG)) return;
  customElements.define(CARD_EMBED_ELEMENT_TAG, CardEmbedElement);
}

declare global {
  interface HTMLElementTagNameMap {
    [CARD_EMBED_ELEMENT_TAG]: CardEmbedElement;
  }
}
