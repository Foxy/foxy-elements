import type {
  AchHostedFieldsPublicState,
  AchHostedFieldsTokenizeErrorCode,
} from "@foxy.io/sdk/checkout";
import { getRequiredEnvVar } from "@/lib/required-env";

export const ACH_FIELD_ELEMENT_TAG = "foxy-ach-field";
const DEFAULT_ACH_SECURE_ORIGIN = getRequiredEnvVar("VITE_EMBED_ORIGIN");
const ACH_SECURE_ORIGIN = DEFAULT_ACH_SECURE_ORIGIN;

const DEFAULT_LABELS = {
  routing_number: "Routing number",
  account_number: "Account number",
  account_type: "Account type",
  account_holder_name: "Name on account",
};

const STYLE_ATTRIBUTE_NAMES = [
  "ach-input-height",
  "ach-input-padding",
  "ach-input-padding-x",
  "ach-input-padding-y",
  "ach-input-placeholder-color",
  "ach-input-font",
  "ach-input-text-color",
  "ach-input-text-color-error",
  "ach-input-text-size",
] as const;

type AchAccountTypeValue = "checking" | "savings";

type AchHostedFieldName =
  | "routing_number"
  | "account_number"
  | "account_type"
  | "account_holder_name";

type AchStyleAttributeName = (typeof STYLE_ATTRIBUTE_NAMES)[number];

type AchStyleAttributeMap = Partial<Record<AchStyleAttributeName, string>>;

const DEFAULT_FIELD_HEIGHT = 52;

type TokenizeDeferred = {
  owner: AchFieldElement;
  resolve: (value: {
    token: string;
    last4: string;
    bankName?: string;
    requestId?: string;
  }) => void;
  reject: (error: Error) => void;
  timeoutId: number;
};

type ControllerRegistryEntry = {
  instances: Set<AchFieldElement>;
  host: AchFieldElement | null;
  controllerIframe: HTMLIFrameElement | null;
  pendingTokenizes: Map<string, TokenizeDeferred>;
};

const controllerRegistry = new Map<string, ControllerRegistryEntry>();

export type AchFieldElementConfig = {
  secureOrigin: string;
  embedPath: string;
  field: AchHostedFieldName;
  merchantOrigin?: string;
  sessionId?: string;
  label?: string;
  placeholder?: string;
  /** Account type options to render in the accountType select. Omit for checking + savings. */
  accountTypeValues?: AchAccountTypeValue[];
};

export type AchReadyEventDetail = {
  sessionId: string;
  registeredFields: AchHostedFieldName[];
};

export type AchChangeEventDetail = {
  sessionId: string;
  fields: Partial<
    Record<
      AchHostedFieldName,
      {
        empty: boolean;
        complete: boolean;
        errorCode: string | null;
        focused?: boolean;
        touched?: boolean;
      }
    >
  >;
};

export type AchFocusEventDetail = {
  sessionId: string;
  field: AchHostedFieldName;
};

export type AchBlurEventDetail = {
  sessionId: string;
  field: AchHostedFieldName;
};

export type AchTokenizeSuccessEventDetail = {
  sessionId: string;
  token: string;
  last4: string;
  bankName?: string;
  requestId?: string;
};

export type AchTokenizeErrorEventDetail = {
  sessionId: string;
  code: AchHostedFieldsTokenizeErrorCode;
  requestId?: string;
};

export const achFieldEvents = {
  ready: "ach-ready",
  change: "ach-change",
  focus: "ach-focus",
  blur: "ach-blur",
  tokenizeSuccess: "ach-tokenize-success",
  tokenizeError: "ach-tokenize-error",
} as const;

export interface AchFieldElementContract extends HTMLElement {
  config: AchFieldElementConfig;
  disabled: boolean;
  clear(): void;
  setDisabled(disabled: boolean): void;
  tokenize(requestId?: string): Promise<{
    token: string;
    last4: string;
    bankName?: string;
    requestId?: string;
  }>;
}

function isAchFieldName(value: unknown): value is AchHostedFieldName {
  return (
    value === "routing_number" ||
    value === "account_number" ||
    value === "account_type" ||
    value === "account_holder_name"
  );
}

function isTokenizeErrorCode(
  value: unknown,
): value is AchHostedFieldsTokenizeErrorCode {
  return (
    value === "invalid_state" ||
    value === "validation_failed" ||
    value === "collect_timeout" ||
    value === "tokenization_network_error" ||
    value === "tokenization_failed" ||
    value === "unknown_error"
  );
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

function isLoopbackHostname(hostname: string): boolean {
  return (
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
  );
}

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function areConfigsEqual(
  left: AchFieldElementConfig,
  right: AchFieldElementConfig,
): boolean {
  const leftAccountTypeValues = [...(left.accountTypeValues ?? [])]
    .sort()
    .join(",");
  const rightAccountTypeValues = [...(right.accountTypeValues ?? [])]
    .sort()
    .join(",");
  return (
    left.secureOrigin === right.secureOrigin &&
    left.embedPath === right.embedPath &&
    left.field === right.field &&
    (left.merchantOrigin ?? "") === (right.merchantOrigin ?? "") &&
    (left.sessionId ?? "") === (right.sessionId ?? "") &&
    (left.label ?? "") === (right.label ?? "") &&
    (left.placeholder ?? "") === (right.placeholder ?? "") &&
    leftAccountTypeValues === rightAccountTypeValues
  );
}

export class AchFieldElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return [...STYLE_ATTRIBUTE_NAMES];
  }

  private _config: AchFieldElementConfig = {
    secureOrigin: ACH_SECURE_ORIGIN,
    embedPath: "/v2.html",
    field: "routing_number",
  };

  private _disabled = false;
  private _fieldPublicState: Partial<AchHostedFieldsPublicState> = {};
  private _fallbackRequestCounter = 0;
  private _listening = false;
  private _isRegistered = false;

  private readonly _onWindowMessage = (event: MessageEvent) => {
    const entry = this._registryEntry;
    if (!entry || entry.host !== this) return;

    const url = normalizeUrl(this._config.secureOrigin, this._config.embedPath);
    if (!url || event.origin !== url.origin) return;
    if (event.source !== entry.controllerIframe?.contentWindow) return;

    const data = event.data;
    if (!data || typeof data !== "object") return;

    const payload = data as Record<string, unknown>;
    const kind = payload["kind"];
    if (typeof kind !== "string") return;

    const sessionId = payload["sessionId"];
    if (typeof sessionId === "string" && sessionId !== this._sessionId) return;

    if (kind === "ach:ready") {
      const incomingFields = payload["registeredFields"];
      const registeredFields = Array.isArray(incomingFields)
        ? incomingFields.filter(isAchFieldName)
        : [];

      this._broadcast("ach-ready", {
        sessionId: this._sessionId,
        registeredFields,
      });
      return;
    }

    if (kind === "ach:change") {
      const fields = payload["fields"];
      if (!fields || typeof fields !== "object") return;

      const normalizedFields: AchChangeEventDetail["fields"] = {};
      for (const fieldName of Object.keys(
        DEFAULT_LABELS,
      ) as AchHostedFieldName[]) {
        const entryStateRaw = (fields as Record<string, unknown>)[fieldName];
        if (!entryStateRaw || typeof entryStateRaw !== "object") continue;
        const entryState = entryStateRaw as Record<string, unknown>;

        const empty = entryState["empty"];
        const complete = entryState["complete"];
        const errorCode = entryState["errorCode"];
        const focused = entryState["focused"];
        const touched = entryState["touched"];

        if (
          typeof empty === "boolean" &&
          typeof complete === "boolean" &&
          (typeof errorCode === "string" || errorCode === null) &&
          (typeof focused === "boolean" || focused === undefined) &&
          (typeof touched === "boolean" || touched === undefined)
        ) {
          normalizedFields[fieldName] = {
            empty,
            complete,
            errorCode,
            focused,
            touched,
          };
        }
      }

      for (const instance of entry.instances) {
        const ownField = instance._config.field;
        if (!(ownField in normalizedFields)) continue;
        instance._applyFieldPublicState(normalizedFields[ownField]);
      }

      this._broadcast("ach-change", {
        sessionId: this._sessionId,
        fields: normalizedFields,
      });
      return;
    }

    if (kind === "ach:focus") {
      const field = payload["field"];
      if (!isAchFieldName(field)) return;
      this._broadcast("ach-focus", { sessionId: this._sessionId, field });
      return;
    }

    if (kind === "ach:blur") {
      const field = payload["field"];
      if (!isAchFieldName(field)) return;
      this._broadcast("ach-blur", { sessionId: this._sessionId, field });
      return;
    }

    if (kind === "ach:tokenize:success") {
      const token = payload["token"];
      const last4 = payload["last4"];
      const bankName = payload["bankName"];
      const requestId = payload["requestId"];

      if (typeof token !== "string" || typeof last4 !== "string") return;

      this._broadcast("ach-tokenize-success", {
        sessionId: this._sessionId,
        token,
        last4,
        bankName: typeof bankName === "string" ? bankName : undefined,
        requestId: typeof requestId === "string" ? requestId : undefined,
      });

      if (typeof requestId === "string") {
        const pending = entry.pendingTokenizes.get(requestId);
        if (!pending) return;

        entry.pendingTokenizes.delete(requestId);
        window.clearTimeout(pending.timeoutId);
        pending.resolve({
          token,
          last4,
          bankName: typeof bankName === "string" ? bankName : undefined,
          requestId,
        });
      }

      return;
    }

    if (kind === "ach:tokenize:error") {
      const code = payload["code"];
      const requestId = payload["requestId"];
      if (!isTokenizeErrorCode(code)) return;

      this._broadcast("ach-tokenize-error", {
        sessionId: this._sessionId,
        code,
        requestId: typeof requestId === "string" ? requestId : undefined,
      });

      if (typeof requestId === "string") {
        const pending = entry.pendingTokenizes.get(requestId);
        if (!pending) return;

        entry.pendingTokenizes.delete(requestId);
        window.clearTimeout(pending.timeoutId);
        pending.reject(new Error(`ACH tokenization failed with code: ${code}`));
      }
    }
  };

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this._isRegistered = true;
    this._registerInstance();
    this._render();
    this.setDisabled(this._disabled);
    this._syncPublicStateDataAttributes();
  }

  disconnectedCallback(): void {
    this._isRegistered = false;
    this._unregisterInstance();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (!STYLE_ATTRIBUTE_NAMES.includes(name as AchStyleAttributeName)) return;
    if (oldValue === newValue) return;
    if (!this._isRegistered) return;

    this._render();
    this.setDisabled(this._disabled);
  }

  set config(value: AchFieldElementConfig) {
    const nextConfig = { ...value };
    if (areConfigsEqual(this._config, nextConfig)) return;

    const priorKey = this._registryKey;
    this._config = nextConfig;

    if (this._isRegistered && priorKey !== this._registryKey) {
      this._unregisterInstance(priorKey);
      this._registerInstance();
    }

    this._render();
    this.setDisabled(this._disabled);
  }

  get config(): AchFieldElementConfig {
    return { ...this._config };
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = Boolean(value);
    this.setDisabled(this._disabled);
  }

  get sessionId(): string {
    return this._sessionId;
  }

  focusField(field: AchHostedFieldName): void {
    this._postMessage({ kind: "merchant:focus", field });
  }

  clear(): void {
    this._postMessage({ kind: "merchant:clear" });
  }

  setDisabled(disabled: boolean, field?: AchHostedFieldName): void {
    const nextDisabled = Boolean(disabled);
    const isNoOpGlobalToggle =
      field === undefined && this._disabled === nextDisabled;

    this._disabled = nextDisabled;
    this._syncDisabledDataAttribute();
    if (isNoOpGlobalToggle) return;

    this._postMessage({
      kind: "merchant:setDisabled",
      disabled: this._disabled,
      field,
    });
  }

  tokenize(requestId?: string): Promise<{
    token: string;
    last4: string;
    bankName?: string;
    requestId?: string;
  }> {
    const entry = this._registryEntry;
    if (!entry?.controllerIframe?.contentWindow) {
      return Promise.reject(new Error("ACH controller iframe is not mounted."));
    }

    const normalizedRequestId =
      requestId ??
      `ach-tokenize-${++this._fallbackRequestCounter}-${Date.now()}`;

    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        entry.pendingTokenizes.delete(normalizedRequestId);
        reject(new Error("ACH tokenization timed out."));
      }, 30000);

      entry.pendingTokenizes.set(normalizedRequestId, {
        owner: this,
        resolve,
        reject,
        timeoutId,
      });

      this._postMessage({
        kind: "merchant:tokenize",
        requestId: normalizedRequestId,
      });
    });
  }

  destroy(): void {
    this.remove();
  }

  private get _sessionId(): string {
    if (this._config.sessionId) return this._config.sessionId;

    const generated = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      },
    );
    this._config = { ...this._config, sessionId: generated };
    return generated;
  }

  private get _registryKey(): string {
    const merchantOrigin = this._merchantOrigin;
    return [
      this._config.secureOrigin,
      this._config.embedPath,
      merchantOrigin,
      this._sessionId,
    ].join("|");
  }

  private get _registryEntry(): ControllerRegistryEntry | undefined {
    return controllerRegistry.get(this._registryKey);
  }

  private _registerInstance(): void {
    const key = this._registryKey;
    const entry = controllerRegistry.get(key) ?? {
      instances: new Set<AchFieldElement>(),
      host: null,
      controllerIframe: null,
      pendingTokenizes: new Map<string, TokenizeDeferred>(),
    };

    entry.instances.add(this);
    controllerRegistry.set(key, entry);

    if (!entry.host) {
      this._claimHost(entry);
    } else {
      this._stopListening();
    }
  }

  private _unregisterInstance(explicitKey?: string): void {
    const key = explicitKey ?? this._registryKey;
    const entry = controllerRegistry.get(key);
    if (!entry) return;

    entry.instances.delete(this);

    for (const [requestId, deferred] of entry.pendingTokenizes) {
      if (deferred.owner !== this) continue;
      window.clearTimeout(deferred.timeoutId);
      deferred.reject(new Error("ACH field element was destroyed."));
      entry.pendingTokenizes.delete(requestId);
    }

    if (entry.host === this) {
      this._stopListening();
      entry.controllerIframe = null;

      const nextHost = Array.from(entry.instances)[0] ?? null;
      entry.host = nextHost;
      if (nextHost) {
        nextHost._claimHost(entry);
      }
    }

    if (entry.instances.size === 0) {
      const targetOrigin = normalizeUrl(
        this._config.secureOrigin,
        this._config.embedPath,
      )?.origin;
      if (targetOrigin && entry.controllerIframe?.contentWindow) {
        entry.controllerIframe.contentWindow.postMessage(
          { kind: "merchant:destroy" },
          targetOrigin,
        );
      }

      entry.pendingTokenizes.forEach((deferred) => {
        window.clearTimeout(deferred.timeoutId);
        deferred.reject(new Error("ACH controller was destroyed."));
      });
      entry.pendingTokenizes.clear();

      controllerRegistry.delete(key);
    }
  }

  private _claimHost(entry: ControllerRegistryEntry): void {
    entry.host = this;
    this._startListening();
    this._render();
    entry.controllerIframe =
      this.shadowRoot?.querySelector("iframe[data-role='controller']") ?? null;
    this.setDisabled(this._disabled);
  }

  private _startListening(): void {
    if (this._listening) return;
    this._listening = true;
    window.addEventListener("message", this._onWindowMessage);
  }

  private _stopListening(): void {
    if (!this._listening) return;
    this._listening = false;
    window.removeEventListener("message", this._onWindowMessage);
  }

  private _broadcast<T>(eventName: string, detail: T): void {
    const entry = this._registryEntry;
    if (!entry) return;

    for (const instance of entry.instances) {
      instance.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
  }

  private _applyFieldPublicState(
    nextState: AchChangeEventDetail["fields"][AchHostedFieldName],
  ): void {
    if (!nextState) return;

    this._fieldPublicState = {
      ...this._fieldPublicState,
      ...nextState,
    };
    this._syncPublicStateDataAttributes();
  }

  private _syncPublicStateDataAttributes(): void {
    const isFocused = Boolean(this._fieldPublicState.focused);
    const isInvalid = Boolean(this._fieldPublicState.errorCode);
    const isUserInvalid = Boolean(
      this._fieldPublicState.touched && this._fieldPublicState.errorCode,
    );

    this._toggleDataAttribute("focused", isFocused);
    this._toggleDataAttribute("invalid", isInvalid);
    this._toggleDataAttribute("user-invalid", isUserInvalid);
  }

  private _syncDisabledDataAttribute(): void {
    this._toggleDataAttribute("disabled", this._disabled);
  }

  private _toggleDataAttribute(name: string, enabled: boolean): void {
    const attributeName = `data-${name}`;

    if (enabled) {
      this.setAttribute(attributeName, "");
      return;
    }

    this.removeAttribute(attributeName);
  }

  private _buildIframeUrl(mode: "controller" | "field"): string {
    const url = normalizeUrl(this._config.secureOrigin, this._config.embedPath);
    if (!url) return "about:blank";

    const merchantOrigin = this._merchantOrigin;
    url.searchParams.set("mode", mode);
    url.searchParams.set("sessionId", this._sessionId);
    url.searchParams.set("merchantOrigin", merchantOrigin);

    if (mode === "field") {
      const field = this._config.field;
      const fallbackLabel = DEFAULT_LABELS[field];
      const configuredLabel = this._config.label?.trim();
      const styleAttributes = this._getStyleAttributes();
      url.searchParams.set("field", field);
      url.searchParams.set(
        "label",
        configuredLabel?.length ? configuredLabel : fallbackLabel,
      );
      if (this._config.placeholder) {
        url.searchParams.set("placeholder", this._config.placeholder);
      }
      if (field === "account_type" && this._config.accountTypeValues?.length) {
        url.searchParams.set(
          "accountTypeValues",
          this._config.accountTypeValues.join(","),
        );
      }
      if (styleAttributes["ach-input-height"]) {
        url.searchParams.set(
          "inputHeight",
          styleAttributes["ach-input-height"],
        );
      }
      if (styleAttributes["ach-input-padding"]) {
        url.searchParams.set(
          "inputPadding",
          styleAttributes["ach-input-padding"],
        );
      }
      if (styleAttributes["ach-input-padding-x"]) {
        url.searchParams.set(
          "inputPaddingX",
          styleAttributes["ach-input-padding-x"],
        );
      }
      if (styleAttributes["ach-input-padding-y"]) {
        url.searchParams.set(
          "inputPaddingY",
          styleAttributes["ach-input-padding-y"],
        );
      }
      if (styleAttributes["ach-input-placeholder-color"]) {
        url.searchParams.set(
          "inputPlaceholderColor",
          styleAttributes["ach-input-placeholder-color"],
        );
      }
      if (styleAttributes["ach-input-font"]) {
        url.searchParams.set("inputFont", styleAttributes["ach-input-font"]);
      }
      if (styleAttributes["ach-input-text-color"]) {
        url.searchParams.set(
          "inputTextColor",
          styleAttributes["ach-input-text-color"],
        );
      }
      if (styleAttributes["ach-input-text-color-error"]) {
        url.searchParams.set(
          "inputTextColorError",
          styleAttributes["ach-input-text-color-error"],
        );
      }
      if (styleAttributes["ach-input-text-size"]) {
        url.searchParams.set(
          "inputTextSize",
          styleAttributes["ach-input-text-size"],
        );
      }
    }

    return url.toString();
  }

  private get _merchantOrigin(): string {
    const currentOrigin = window.location.origin;
    const configuredOrigin = this._config.merchantOrigin
      ? normalizeOrigin(this._config.merchantOrigin)
      : null;

    if (!configuredOrigin) return currentOrigin;
    if (configuredOrigin === currentOrigin) return configuredOrigin;

    const currentUrl = new URL(currentOrigin);
    const configuredUrl = new URL(configuredOrigin);

    // During local development, prefer the live page origin over stale localhost ports.
    if (
      isLoopbackHostname(currentUrl.hostname) &&
      isLoopbackHostname(configuredUrl.hostname)
    ) {
      return currentOrigin;
    }

    return configuredOrigin;
  }

  private _postMessage(message: unknown): void {
    const entry = this._registryEntry;
    const targetOrigin = normalizeUrl(
      this._config.secureOrigin,
      this._config.embedPath,
    )?.origin;

    if (!entry?.controllerIframe?.contentWindow || !targetOrigin) return;

    try {
      entry.controllerIframe.contentWindow.postMessage(message, targetOrigin);
    } catch {
      // Ignore transient startup races while the controller iframe is still navigating.
    }
  }

  private _getStyleAttributes(): AchStyleAttributeMap {
    const attributes: AchStyleAttributeMap = {};

    for (const attributeName of STYLE_ATTRIBUTE_NAMES) {
      const rawValue = this.getAttribute(attributeName)?.trim();
      if (rawValue) {
        attributes[attributeName] = rawValue;
      }
    }

    return attributes;
  }

  private _render(): void {
    if (!this.shadowRoot) return;

    const isHost = this._registryEntry?.host === this;

    this.shadowRoot.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; background: transparent; }
      .controller { display: none; }
      iframe { width: 100%; height: var(--ach-field-height, ${DEFAULT_FIELD_HEIGHT}px); border: 0; display: block; background: transparent; }
    `;

    this.shadowRoot.appendChild(style);

    if (isHost) {
      const controller = document.createElement("iframe");
      controller.className = "controller";
      controller.dataset.role = "controller";
      controller.title = "ACH controller";
      controller.src = this._buildIframeUrl("controller");
      controller.setAttribute(
        "sandbox",
        "allow-forms allow-same-origin allow-scripts",
      );
      this.shadowRoot.appendChild(controller);
    }

    const fieldIframe = document.createElement("iframe");
    fieldIframe.title = `ACH ${this._config.field}`;
    fieldIframe.src = this._buildIframeUrl("field");
    fieldIframe.style.visibility = "hidden";
    fieldIframe.style.opacity = "0";
    fieldIframe.style.transition = "opacity 120ms ease";
    fieldIframe.addEventListener("load", () => {
      fieldIframe.style.visibility = "visible";
      fieldIframe.style.opacity = "1";
    });
    fieldIframe.setAttribute(
      "sandbox",
      "allow-forms allow-same-origin allow-scripts",
    );
    this.shadowRoot.appendChild(fieldIframe);

    if (isHost) {
      const entry = this._registryEntry;
      if (entry) {
        entry.controllerIframe =
          (this.shadowRoot.querySelector(
            "iframe[data-role='controller']",
          ) as HTMLIFrameElement | null) ?? null;
      }
    }
  }
}

export function defineAchFieldElement(): void {
  if (!customElements.get(ACH_FIELD_ELEMENT_TAG)) {
    customElements.define(ACH_FIELD_ELEMENT_TAG, AchFieldElement);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ACH_FIELD_ELEMENT_TAG]: AchFieldElement;
  }
}
