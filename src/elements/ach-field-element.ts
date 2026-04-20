import type {
  AchHostedFieldsTokenizeErrorCode,
  AchHostedFieldsPublicState,
} from "@foxy.io/sdk/checkout";
import { getRequiredEnvVar } from "@/lib/required-env";

export const ACH_FIELD_ELEMENT_TAG = "foxy-ach-field";

const DEFAULT_ACH_SECURE_ORIGIN = getRequiredEnvVar("VITE_EMBED_ORIGIN");
const DEFAULT_EMBED_PATH = "/v2.html";
const DEFAULT_FIELD_HEIGHT = "52px";

const DEFAULT_LABELS = {
  routing_number: "Routing number",
  account_number: "Account number",
  account_type: "Account type",
  account_holder_name: "Name on account",
} as const;

export type AchAccountTypeValue = "checking" | "savings";

export type AchHostedFieldName =
  | "routing_number"
  | "account_number"
  | "account_type"
  | "account_holder_name";

type AchFieldState = {
  empty: boolean;
  complete: boolean;
  errorCode: string | null;
  focused?: boolean;
  touched?: boolean;
};

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
  registeredFields: Set<AchHostedFieldName>;
  fieldStates: Partial<Record<AchHostedFieldName, AchFieldState>>;
};

const controllerRegistry = new Map<string, ControllerRegistryEntry>();

const FIELD_ATTRIBUTE = "field";
const SECURE_ORIGIN_ATTRIBUTE = "secure-origin";
const SESSION_ID_ATTRIBUTE = "session-id";
const LABEL_ATTRIBUTE = "label";
const PLACEHOLDER_ATTRIBUTE = "placeholder";
const ACCOUNT_TYPE_VALUES_ATTRIBUTE = "account-type-values";
const DISABLED_ATTRIBUTE = "disabled";

const THEME_CSS_VARS = [
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

const THEME_ATTRIBUTE_NAMES = Object.keys(
  THEME_ATTR_TO_CSS_VAR,
) as ThemeAttributeName[];

export type AchLoadEventDetail = {
  sessionId: string;
  registeredFields: AchHostedFieldName[];
};

export type AchChangeEventDetail = {
  sessionId: string;
  fields: Partial<Record<AchHostedFieldName, AchFieldState>>;
};

export type AchTokenizationSuccessEventDetail = {
  sessionId: string;
  token: string;
  last4: string;
  bankName?: string;
  requestId?: string;
};

export type AchTokenizationErrorEventDetail = {
  sessionId: string;
  code: AchHostedFieldsTokenizeErrorCode;
  requestId?: string;
};

type AchFieldElementEventMap = HTMLElementEventMap & {
  load: CustomEvent<AchLoadEventDetail>;
  change: CustomEvent<AchChangeEventDetail>;
  tokenizationsuccess: CustomEvent<AchTokenizationSuccessEventDetail>;
  tokenizationerror: CustomEvent<AchTokenizationErrorEventDetail>;
};

export const achFieldEvents = {
  load: "load",
  change: "change",
  tokenizationSuccess: "tokenizationsuccess",
  tokenizationError: "tokenizationerror",
} as const;

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

function normalizeUrl(secureOrigin: string): URL | null {
  try {
    const origin = secureOrigin.replace(/\/$/, "");
    return new URL(`${origin}${DEFAULT_EMBED_PATH}`);
  } catch {
    return null;
  }
}

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function parseAccountTypeValues(raw: string | null): AchAccountTypeValue[] | undefined {
  if (!raw) return undefined;

  const values = raw
    .split(",")
    .map((value) => value.trim())
    .filter((value): value is AchAccountTypeValue => value === "checking" || value === "savings");

  return values.length > 0 ? values : undefined;
}

function stringifyAccountTypeValues(values: AchAccountTypeValue[] | undefined): string | null {
  if (!values?.length) return null;
  const uniqueValues = Array.from(new Set(values));
  return uniqueValues.join(",");
}

export class AchFieldElement extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes(): string[] {
    return [
      FIELD_ATTRIBUTE,
      SECURE_ORIGIN_ATTRIBUTE,
      SESSION_ID_ATTRIBUTE,
      LABEL_ATTRIBUTE,
      PLACEHOLDER_ATTRIBUTE,
      ACCOUNT_TYPE_VALUES_ATTRIBUTE,
      DISABLED_ATTRIBUTE,
      ...THEME_ATTRIBUTE_NAMES,
    ];
  }

  private _disabled = false;
  private _secureOrigin = DEFAULT_ACH_SECURE_ORIGIN;
  private _field: AchHostedFieldName = "routing_number";
  private _sessionId = "";
  private _label: string | undefined;
  private _placeholder: string | undefined;
  private _accountTypeValues: AchAccountTypeValue[] | undefined;

  private _fieldPublicState: Partial<AchHostedFieldsPublicState> = {};
  private _fallbackRequestCounter = 0;
  private _listening = false;
  private _isRegistered = false;
  private _internals: ElementInternals | null;

  private readonly _onWindowMessage = (event: MessageEvent) => {
    const entry = this._registryEntry;
    if (!entry || entry.host !== this) return;

    const url = normalizeUrl(this._secureOrigin);
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

      entry.registeredFields = new Set(registeredFields);

      this._broadcast(achFieldEvents.load, {
        sessionId: this._sessionId,
        registeredFields,
      });

      this._syncSessionValidity(entry);
      return;
    }

    if (kind === "ach:change") {
      const fields = payload["fields"];
      if (!fields || typeof fields !== "object") return;

      const normalizedFields: AchChangeEventDetail["fields"] = {};
      for (const fieldName of Object.keys(DEFAULT_LABELS) as AchHostedFieldName[]) {
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
          const normalized: AchFieldState = {
            empty,
            complete,
            errorCode,
            focused,
            touched,
          };

          normalizedFields[fieldName] = normalized;
          entry.fieldStates[fieldName] = normalized;
        }
      }

      for (const instance of entry.instances) {
        const ownField = instance._field;
        const ownState = normalizedFields[ownField];
        if (!ownState) continue;
        instance._applyFieldPublicState(ownState);
      }

      this._broadcast(achFieldEvents.change, {
        sessionId: this._sessionId,
        fields: normalizedFields,
      });

      this._syncSessionValidity(entry);
      return;
    }

    if (kind === "ach:tokenize:success") {
      const token = payload["token"];
      const last4 = payload["last4"];
      const bankName = payload["bankName"];
      const requestId = payload["requestId"];

      if (typeof token !== "string" || typeof last4 !== "string") return;

      this._broadcast(achFieldEvents.tokenizationSuccess, {
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

      this._broadcast(achFieldEvents.tokenizationError, {
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
    this._internals = typeof this.attachInternals === "function" ? this.attachInternals() : null;

    const secureOrigin = this.getAttribute(SECURE_ORIGIN_ATTRIBUTE)?.trim();
    if (secureOrigin) this._secureOrigin = secureOrigin;

    const field = this.getAttribute(FIELD_ATTRIBUTE);
    if (isAchFieldName(field)) this._field = field;

    this._sessionId = this.getAttribute(SESSION_ID_ATTRIBUTE)?.trim() || generateSessionId();
    this._label = this.getAttribute(LABEL_ATTRIBUTE)?.trim() || undefined;
    this._placeholder = this.getAttribute(PLACEHOLDER_ATTRIBUTE)?.trim() || undefined;
    this._accountTypeValues = parseAccountTypeValues(
      this.getAttribute(ACCOUNT_TYPE_VALUES_ATTRIBUTE),
    );
    this._disabled = this.hasAttribute(DISABLED_ATTRIBUTE);
  }

  addEventListener<K extends keyof AchFieldElementEventMap>(
    type: K,
    listener: (this: AchFieldElement, event: AchFieldElementEventMap[K]) => void,
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

  removeEventListener<K extends keyof AchFieldElementEventMap>(
    type: K,
    listener: (this: AchFieldElement, event: AchFieldElementEventMap[K]) => void,
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

  connectedCallback(): void {
    if (!this.hasAttribute(SESSION_ID_ATTRIBUTE)) {
      this.setAttribute(SESSION_ID_ATTRIBUTE, this._sessionId);
    }

    this._isRegistered = true;
    this._registerInstance();
    this._render();
    this._syncDisabledState();
    this._syncPublicStateDataAttributes();

    const entry = this._registryEntry;
    if (entry) this._syncFormValidity(entry);
  }

  disconnectedCallback(): void {
    this._isRegistered = false;
    this._unregisterInstance();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (oldValue === newValue) return;

    if (name === SECURE_ORIGIN_ATTRIBUTE) {
      this._secureOrigin = newValue?.trim() || DEFAULT_ACH_SECURE_ORIGIN;
      this._rekeyIfNeeded();
      return;
    }

    if (name === FIELD_ATTRIBUTE) {
      if (isAchFieldName(newValue)) this._field = newValue;
      this._render();
      this._syncSessionValidity(this._registryEntry);
      return;
    }

    if (name === SESSION_ID_ATTRIBUTE) {
      this._sessionId = newValue?.trim() || generateSessionId();
      this._rekeyIfNeeded();
      return;
    }

    if (name === LABEL_ATTRIBUTE) {
      this._label = newValue?.trim() || undefined;
      this._render();
      return;
    }

    if (name === PLACEHOLDER_ATTRIBUTE) {
      this._placeholder = newValue?.trim() || undefined;
      this._render();
      return;
    }

    if (name === ACCOUNT_TYPE_VALUES_ATTRIBUTE) {
      this._accountTypeValues = parseAccountTypeValues(newValue);
      this._render();
      return;
    }

    if (name === DISABLED_ATTRIBUTE) {
      this._disabled = newValue !== null;
      this._syncDisabledState();
      return;
    }

    if (!THEME_ATTRIBUTE_NAMES.includes(name as ThemeAttributeName)) return;
    if (!this._isRegistered) return;

    this._render();
    this._syncDisabledState();
  }

  get secureOrigin(): string {
    return this._secureOrigin;
  }

  set secureOrigin(value: string) {
    const normalized = value.trim();
    if (!normalized || normalized === this._secureOrigin) return;

    this._secureOrigin = normalized;
    if (this.getAttribute(SECURE_ORIGIN_ATTRIBUTE) !== normalized) {
      this.setAttribute(SECURE_ORIGIN_ATTRIBUTE, normalized);
    }
  }

  get field(): AchHostedFieldName {
    return this._field;
  }

  set field(value: AchHostedFieldName) {
    const normalized = isAchFieldName(value) ? value : "routing_number";
    if (normalized === this._field) return;

    this._field = normalized;
    if (this.getAttribute(FIELD_ATTRIBUTE) !== normalized) {
      this.setAttribute(FIELD_ATTRIBUTE, normalized);
    }
  }

  get sessionId(): string {
    return this._sessionId;
  }

  set sessionId(value: string) {
    const normalized = value.trim() || generateSessionId();
    if (normalized === this._sessionId) return;

    this._sessionId = normalized;
    if (this.getAttribute(SESSION_ID_ATTRIBUTE) !== normalized) {
      this.setAttribute(SESSION_ID_ATTRIBUTE, normalized);
    }
  }

  get label(): string | undefined {
    return this._label;
  }

  set label(value: string | undefined) {
    const normalized = value?.trim() || undefined;
    if (normalized === this._label) return;

    this._label = normalized;
    if (normalized === undefined) {
      this.removeAttribute(LABEL_ATTRIBUTE);
    } else if (this.getAttribute(LABEL_ATTRIBUTE) !== normalized) {
      this.setAttribute(LABEL_ATTRIBUTE, normalized);
    }
  }

  get placeholder(): string | undefined {
    return this._placeholder;
  }

  set placeholder(value: string | undefined) {
    const normalized = value?.trim() || undefined;
    if (normalized === this._placeholder) return;

    this._placeholder = normalized;
    if (normalized === undefined) {
      this.removeAttribute(PLACEHOLDER_ATTRIBUTE);
    } else if (this.getAttribute(PLACEHOLDER_ATTRIBUTE) !== normalized) {
      this.setAttribute(PLACEHOLDER_ATTRIBUTE, normalized);
    }
  }

  get accountTypeValues(): AchAccountTypeValue[] | undefined {
    return this._accountTypeValues ? [...this._accountTypeValues] : undefined;
  }

  set accountTypeValues(values: AchAccountTypeValue[] | undefined) {
    const normalized = values?.length ? [...new Set(values)] : undefined;
    const left = stringifyAccountTypeValues(this._accountTypeValues);
    const right = stringifyAccountTypeValues(normalized);
    if (left === right) return;

    this._accountTypeValues = normalized;
    if (right === null) {
      this.removeAttribute(ACCOUNT_TYPE_VALUES_ATTRIBUTE);
    } else if (this.getAttribute(ACCOUNT_TYPE_VALUES_ATTRIBUTE) !== right) {
      this.setAttribute(ACCOUNT_TYPE_VALUES_ATTRIBUTE, right);
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    const normalized = Boolean(value);
    if (this._disabled === normalized) return;

    this._disabled = normalized;
    if (normalized) {
      this.setAttribute(DISABLED_ATTRIBUTE, "");
    } else {
      this.removeAttribute(DISABLED_ATTRIBUTE);
    }
  }

  clear(): void {
    this._postMessage({ kind: "merchant:clear" });
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
      requestId ?? `ach-tokenize-${++this._fallbackRequestCounter}-${Date.now()}`;

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

  checkValidity(): boolean {
    return this._internals?.checkValidity() ?? true;
  }

  reportValidity(): boolean {
    if (!this._internals) return true;
    return this._internals.reportValidity();
  }

  private get _registryKey(): string {
    return [this._secureOrigin, this._merchantOrigin, this._sessionId].join("|");
  }

  private get _registryEntry(): ControllerRegistryEntry | undefined {
    return controllerRegistry.get(this._registryKey);
  }

  private get _merchantOrigin(): string {
    return normalizeOrigin(window.location.origin) ?? window.location.origin;
  }

  private _rekeyIfNeeded(): void {
    if (!this._isRegistered) return;
    const previousKeys = Array.from(controllerRegistry.keys());
    const previousKey = previousKeys.find((key) => {
      const entry = controllerRegistry.get(key);
      return Boolean(entry?.instances.has(this));
    });

    this._unregisterInstance(previousKey);
    this._registerInstance();
    this._render();
    this._syncDisabledState();
  }

  private _registerInstance(): void {
    const key = this._registryKey;
    const entry = controllerRegistry.get(key) ?? {
      instances: new Set<AchFieldElement>(),
      host: null,
      controllerIframe: null,
      pendingTokenizes: new Map<string, TokenizeDeferred>(),
      registeredFields: new Set<AchHostedFieldName>(),
      fieldStates: {},
    };

    entry.instances.add(this);
    controllerRegistry.set(key, entry);

    if (!entry.host) {
      this._claimHost(entry);
    } else {
      this._stopListening();
    }

    this._syncFormValidity(entry);
  }

  private _unregisterInstance(explicitKey?: string): void {
    const key = explicitKey ?? this._registryKey;
    const entry = controllerRegistry.get(key);
    if (!entry) return;

    entry.instances.delete(this);

    for (const [requestId, deferred] of entry.pendingTokenizes) {
      if (deferred.owner !== this) continue;
      window.clearTimeout(deferred.timeoutId);
      deferred.reject(new Error("ACH field element was disconnected."));
      entry.pendingTokenizes.delete(requestId);
    }

    if (entry.host === this) {
      this._stopListening();
      entry.controllerIframe = null;

      const nextHost = Array.from(entry.instances)[0] ?? null;
      entry.host = nextHost;
      if (nextHost) nextHost._claimHost(entry);
    }

    if (entry.instances.size === 0) {
      const targetOrigin = normalizeUrl(this._secureOrigin)?.origin;
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
      return;
    }

    this._syncSessionValidity(entry);
  }

  private _claimHost(entry: ControllerRegistryEntry): void {
    entry.host = this;
    this._startListening();
    this._render();
    entry.controllerIframe =
      this.shadowRoot?.querySelector("iframe[data-role='controller']") ?? null;
    this._syncDisabledState();
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
      instance.dispatchEvent(
        new CustomEvent(eventName, {
          detail,
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private _applyFieldPublicState(nextState: AchFieldState): void {
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
    this._toggleDataAttribute("disabled", this._disabled);
  }

  private _syncDisabledState(): void {
    this._toggleDataAttribute("disabled", this._disabled);
    this._postMessage({ kind: "merchant:setDisabled", disabled: this._disabled });

    if (!this._disabled) {
      const entry = this._registryEntry;
      if (entry) this._syncFormValidity(entry);
      return;
    }

    this._internals?.setValidity({});
  }

  private _syncSessionValidity(entry: ControllerRegistryEntry | undefined): void {
    if (!entry) return;
    for (const instance of entry.instances) {
      instance._syncFormValidity(entry);
    }
  }

  private _syncFormValidity(entry: ControllerRegistryEntry): void {
    if (!this._internals) return;

    if (this._disabled) {
      this._internals.setValidity({});
      return;
    }

    const fields = new Set<AchHostedFieldName>();
    for (const instance of entry.instances) {
      fields.add(instance._field);
    }
    for (const field of entry.registeredFields) {
      fields.add(field);
    }

    for (const field of fields) {
      const state = entry.fieldStates[field];
      const label = DEFAULT_LABELS[field].toLowerCase();

      if (!state || !state.complete) {
        this._internals.setValidity(
          { customError: true },
          `Please complete ${label}.`,
        );
        return;
      }

      if (state.errorCode) {
        this._internals.setValidity(
          { customError: true },
          `Please check ${label}.`,
        );
        return;
      }
    }

    this._internals.setValidity({});
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
    const url = normalizeUrl(this._secureOrigin);
    if (!url) return "about:blank";

    url.searchParams.set("mode", mode);
    url.searchParams.set("sessionId", this._sessionId);
    url.searchParams.set("merchantOrigin", this._merchantOrigin);

    if (mode === "field") {
      const field = this._field;
      const fallbackLabel = DEFAULT_LABELS[field];
      const configuredLabel = this._label?.trim();
      const theme = this._getThemeAttributes();

      url.searchParams.set("field", field);
      url.searchParams.set(
        "label",
        configuredLabel?.length ? configuredLabel : fallbackLabel,
      );

      if (this._placeholder) {
        url.searchParams.set("placeholder", this._placeholder);
      }

      if (field === "account_type" && this._accountTypeValues?.length) {
        url.searchParams.set("accountTypeValues", this._accountTypeValues.join(","));
      }

      if (Object.keys(theme).length > 0) {
        url.searchParams.set("style", JSON.stringify(theme));
      }

      // Keep existing embed query keys in sync while using theme-prefixed public attributes.
      if (theme["--input-height"]) {
        url.searchParams.set("inputHeight", theme["--input-height"]);
      }
      if (theme["--input-padding"]) {
        url.searchParams.set("inputPadding", theme["--input-padding"]);
      }
      if (theme["--input-padding-x"]) {
        url.searchParams.set("inputPaddingX", theme["--input-padding-x"]);
      }
      if (theme["--input-padding-y"]) {
        url.searchParams.set("inputPaddingY", theme["--input-padding-y"]);
      }
      if (theme["--input-placeholder-color"]) {
        url.searchParams.set("inputPlaceholderColor", theme["--input-placeholder-color"]);
      }
      if (theme["--font-sans"]) {
        url.searchParams.set("inputFont", theme["--font-sans"]);
      }
      if (theme["--input-text-color"]) {
        url.searchParams.set("inputTextColor", theme["--input-text-color"]);
      }
      if (theme["--input-error-text-color"]) {
        url.searchParams.set("inputTextColorError", theme["--input-error-text-color"]);
      }
      if (theme["--input-font-size"]) {
        url.searchParams.set("inputTextSize", theme["--input-font-size"]);
      }
    }

    return url.toString();
  }

  private _postMessage(message: unknown): void {
    const entry = this._registryEntry;
    const targetOrigin = normalizeUrl(this._secureOrigin)?.origin;

    if (!entry?.controllerIframe?.contentWindow || !targetOrigin) return;

    try {
      entry.controllerIframe.contentWindow.postMessage(message, targetOrigin);
    } catch {
      // Ignore transient startup races while the controller iframe is still navigating.
    }
  }

  private _getThemeAttributes(): Record<ThemeCssVar, string> {
    const style = {} as Record<ThemeCssVar, string>;

    for (const attrName of THEME_ATTRIBUTE_NAMES) {
      const value = this.getAttribute(attrName)?.trim();
      if (!value) continue;
      style[THEME_ATTR_TO_CSS_VAR[attrName]] = value;
    }

    return style;
  }

  private _resolveInitialIframeHeight(): string {
    const configuredHeight = this.getAttribute("theme-input-height")?.trim();
    return configuredHeight || DEFAULT_FIELD_HEIGHT;
  }

  private _render(): void {
    if (!this.shadowRoot) return;

    const isHost = this._registryEntry?.host === this;
    const initialIframeHeight = this._resolveInitialIframeHeight();

    this.shadowRoot.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; background: transparent; }
      .controller { display: none; }
      iframe { width: 100%; height: var(--ach-field-height, ${initialIframeHeight}); min-height: var(--ach-field-height, ${initialIframeHeight}); border: 0; display: block; background: transparent; }
    `;

    this.shadowRoot.appendChild(style);

    if (isHost) {
      const controller = document.createElement("iframe");
      controller.className = "controller";
      controller.dataset.role = "controller";
      controller.title = "ACH controller";
      controller.src = this._buildIframeUrl("controller");
      controller.setAttribute("sandbox", "allow-forms allow-same-origin allow-scripts");
      this.shadowRoot.appendChild(controller);
    }

    const fieldIframe = document.createElement("iframe");
    fieldIframe.title = `ACH ${this._field}`;
    fieldIframe.src = this._buildIframeUrl("field");
    fieldIframe.style.visibility = "hidden";
    fieldIframe.style.opacity = "0";
    fieldIframe.style.transition = "opacity 120ms ease";
    fieldIframe.addEventListener("load", () => {
      fieldIframe.style.visibility = "visible";
      fieldIframe.style.opacity = "1";
    });
    fieldIframe.setAttribute("sandbox", "allow-forms allow-same-origin allow-scripts");
    this.shadowRoot.appendChild(fieldIframe);

    if (isHost) {
      const entry = this._registryEntry;
      if (entry) {
        entry.controllerIframe =
          this.shadowRoot.querySelector("iframe[data-role='controller']") ?? null;
      }
    }
  }
}

if (typeof window !== "undefined" && !customElements.get(ACH_FIELD_ELEMENT_TAG)) {
  customElements.define(ACH_FIELD_ELEMENT_TAG, AchFieldElement);
}

declare global {
  interface HTMLElementTagNameMap {
    [ACH_FIELD_ELEMENT_TAG]: AchFieldElement;
  }
}
