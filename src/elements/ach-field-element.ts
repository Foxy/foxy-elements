import type {
  AchHostedFieldsTokenizeErrorCode,
  AchHostedFieldsPublicState,
} from "@foxy.io/sdk/checkout";

export const ACH_FIELD_ELEMENT_TAG = "foxy-ach-field";

const DEFAULT_ACH_SECURE_ORIGIN =
  import.meta.env.VITE_EMBED_ORIGIN?.trim() || "https://embed.foxy.io";
const DEFAULT_EMBED_PATH = "/v2.html";
const DEFAULT_FIELD_HEIGHT = "52px";

const DEFAULT_LABELS = {
  "routing-number": "Routing number",
  "account-number": "Account number",
  "account-type": "Account type",
  "account-holder-name": "Name on account",
} as const;

export type AchAccountTypeValue = "checking" | "savings";

export type AchHostedFieldName =
  | "routing-number"
  | "account-number"
  | "account-type"
  | "account-holder-name";

type AchFieldState = {
  empty: boolean;
  complete: boolean;
  errorCode: string | null;
  focused?: boolean;
  touched?: boolean;
};

type TokenizeDeferred = {
  owner: AchFieldElement;
  resolve: (value: { token: string; requestId?: string }) => void;
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

const TYPE_ATTRIBUTE = "type";
const GROUP_ATTRIBUTE = "group";
const PLACEHOLDER_ATTRIBUTE = "placeholder";
const ACCOUNT_TYPE_VALUES_ATTRIBUTE = "account-type-values";
const DISABLED_ATTRIBUTE = "disabled";
const LANG_ATTRIBUTE = "lang";

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

export type AchLoadEventDetail = Record<string, never>;

export type AchTokenizationSuccessEventDetail = {
  token: string;
  requestId?: string;
};

export type AchTokenizationErrorEventDetail = {
  code: AchHostedFieldsTokenizeErrorCode;
  requestId?: string;
};

type AchFieldElementEventMap = HTMLElementEventMap & {
  load: CustomEvent<AchLoadEventDetail>;
  change: Event;
  focus: FocusEvent;
  blur: FocusEvent;
  tokenizationsuccess: CustomEvent<AchTokenizationSuccessEventDetail>;
  tokenizationerror: CustomEvent<AchTokenizationErrorEventDetail>;
};

export const achFieldEvents = {
  load: "load",
  change: "change",
  focus: "focus",
  blur: "blur",
  tokenizationSuccess: "tokenizationsuccess",
  tokenizationError: "tokenizationerror",
} as const;

/** Maps public kebab-case field names to the snake_case names expected by the embed iframe protocol. */
const EMBED_FIELD_NAME: Record<AchHostedFieldName, string> = {
  "routing-number": "routing_number",
  "account-number": "account_number",
  "account-type": "account_type",
  "account-holder-name": "account_holder_name",
};

/** Maps snake_case embed field names back to public kebab-case names. */
const EMBED_TO_PUBLIC: Record<string, AchHostedFieldName> = {
  routing_number: "routing-number",
  account_number: "account-number",
  account_type: "account-type",
  account_holder_name: "account-holder-name",
};

function isAchFieldName(value: unknown): value is AchHostedFieldName {
  return (
    value === "routing-number" ||
    value === "account-number" ||
    value === "account-type" ||
    value === "account-holder-name"
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

function createNativeLikeFocusEvent(type: "focus" | "blur"): FocusEvent {
  return new FocusEvent(type, {
    bubbles: false,
    composed: false,
  });
}

export class AchFieldElement extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes(): string[] {
    return [
      TYPE_ATTRIBUTE,
      GROUP_ATTRIBUTE,
      PLACEHOLDER_ATTRIBUTE,
      ACCOUNT_TYPE_VALUES_ATTRIBUTE,
      DISABLED_ATTRIBUTE,
      LANG_ATTRIBUTE,
      ...THEME_ATTRIBUTE_NAMES,
    ];
  }

  private _disabled = false;
  private _secureOrigin = DEFAULT_ACH_SECURE_ORIGIN;
  private _type: AchHostedFieldName = "routing-number";
  private _group = "";
  private _placeholder: string | undefined;
  private _lang: string | undefined;
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
    if (typeof sessionId === "string" && sessionId !== this._group) return;

    if (kind === "ach:ready") {
      const incomingFields = payload["registeredFields"];
      const registeredFields = Array.isArray(incomingFields)
        ? incomingFields
            .map((f) => (typeof f === "string" ? EMBED_TO_PUBLIC[f] : undefined))
            .filter((f): f is AchHostedFieldName => f !== undefined)
        : [];

      entry.registeredFields = new Set(registeredFields);

      this._broadcast(achFieldEvents.load, {});

      this._syncSessionValidity(entry);
      return;
    }

    if (kind === "ach:change") {
      const fields = payload["fields"];
      if (!fields || typeof fields !== "object") return;

      for (const fieldName of Object.keys(DEFAULT_LABELS) as AchHostedFieldName[]) {
        const embedKey = EMBED_FIELD_NAME[fieldName];
        const entryStateRaw = (fields as Record<string, unknown>)[embedKey];
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

          entry.fieldStates[fieldName] = normalized;
        }
      }

      for (const instance of entry.instances) {
        const ownField = instance._type;
        const ownState = entry.fieldStates[ownField];
        if (!ownState) continue;

        const wasFocused = Boolean(instance._fieldPublicState.focused);
        const isFocused = Boolean(ownState.focused);
        instance._applyFieldPublicState(ownState);

        if (wasFocused !== isFocused) {
          instance.dispatchEvent(
            createNativeLikeFocusEvent(
              isFocused ? achFieldEvents.focus : achFieldEvents.blur,
            ),
          );
        }

        instance.dispatchEvent(new Event(achFieldEvents.change));
      }

      this._syncSessionValidity(entry);
      return;
    }

    if (kind === "ach:tokenize:success") {
      const token = payload["token"];
      const last4 = payload["last4"];
      const requestId = payload["requestId"];

      if (typeof token !== "string" || typeof last4 !== "string") return;

      this._broadcast(achFieldEvents.tokenizationSuccess, {
        token,
        requestId: typeof requestId === "string" ? requestId : undefined,
      });

      if (typeof requestId === "string") {
        const pending = entry.pendingTokenizes.get(requestId);
        if (!pending) return;

        entry.pendingTokenizes.delete(requestId);
        window.clearTimeout(pending.timeoutId);
        pending.resolve({ token, requestId });
      }

      return;
    }

    if (kind === "ach:tokenize:error") {
      const code = payload["code"];
      const requestId = payload["requestId"];
      if (!isTokenizeErrorCode(code)) return;

      this._broadcast(achFieldEvents.tokenizationError, {
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

    const type = this.getAttribute(TYPE_ATTRIBUTE);
    if (isAchFieldName(type)) this._type = type;

    this._group = this.getAttribute(GROUP_ATTRIBUTE)?.trim() || generateSessionId();
    this._placeholder = this.getAttribute(PLACEHOLDER_ATTRIBUTE)?.trim() || undefined;
    this._lang = this.getAttribute(LANG_ATTRIBUTE)?.trim() || undefined;
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
    if (!this.hasAttribute(GROUP_ATTRIBUTE)) {
      this.setAttribute(GROUP_ATTRIBUTE, this._group);
    }

    this._isRegistered = true;
    this._registerInstance();
    this._render();
    this._syncDisabledState();
    this._syncPublicStates();

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

    if (name === TYPE_ATTRIBUTE) {
      if (isAchFieldName(newValue)) this._type = newValue;
      this._render();
      this._syncSessionValidity(this._registryEntry);
      return;
    }

    if (name === GROUP_ATTRIBUTE) {
      this._group = newValue?.trim() || generateSessionId();
      this._rekeyIfNeeded();
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

    if (name === LANG_ATTRIBUTE) {
      this._lang = newValue?.trim() || undefined;
      this._render();
      return;
    }

    if (!THEME_ATTRIBUTE_NAMES.includes(name as ThemeAttributeName)) return;
    if (!this._isRegistered) return;

    this._render();
    this._syncDisabledState();
  }

  get type(): AchHostedFieldName {
    return this._type;
  }

  set type(value: AchHostedFieldName) {
    const normalized = isAchFieldName(value) ? value : "routing-number";
    if (normalized === this._type) return;

    this._type = normalized;
    if (this.getAttribute(TYPE_ATTRIBUTE) !== normalized) {
      this.setAttribute(TYPE_ATTRIBUTE, normalized);
    }
  }

  get group(): string {
    return this._group;
  }

  set group(value: string) {
    const normalized = value.trim() || generateSessionId();
    if (normalized === this._group) return;

    this._group = normalized;
    if (this.getAttribute(GROUP_ATTRIBUTE) !== normalized) {
      this.setAttribute(GROUP_ATTRIBUTE, normalized);
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

  tokenize(requestId?: string): Promise<{ token: string; requestId?: string }> {
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
    return [this._secureOrigin, this._merchantOrigin, this._group].join("|");
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
    this._syncPublicStates();
  }

  private _syncPublicStates(): void {
    const isFocused = Boolean(this._fieldPublicState.focused);
    const isUserInvalid = Boolean(
      this._fieldPublicState.touched && this._fieldPublicState.errorCode,
    );
    const isUserValid = Boolean(
      this._fieldPublicState.touched && !this._fieldPublicState.errorCode,
    );

    this._toggleState("focused", isFocused);
    this._toggleState("user-invalid", isUserInvalid);
    this._toggleState("user-valid", isUserValid);
    this._toggleState("disabled", this._disabled);
  }

  private _syncDisabledState(): void {
    this._toggleState("disabled", this._disabled);
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

    const field = this._type;
    const state = entry.fieldStates[field];
    const label = DEFAULT_LABELS[field].toLowerCase();

    if (!state || !state.complete) {
      this._internals.setValidity(
        { valueMissing: true },
        `Please complete ${label}.`,
      );
      return;
    }

    if (state.errorCode) {
      this._internals.setValidity(
        { badInput: true },
        `Please check ${label}.`,
      );
      return;
    }

    this._internals.setValidity({});
  }

  private _toggleState(name: string, enabled: boolean): void {
    if (enabled) {
      this._internals?.states?.add(name);
    } else {
      this._internals?.states?.delete(name);
    }
  }

  private _getAssociatedLabelText(): string {
    const labels = this._internals?.labels;
    if (!labels?.length) return "";
    const clone = labels[0].cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[aria-hidden="true"]').forEach((el) => el.remove());
    return clone.textContent?.trim() ?? "";
  }

  private _buildIframeUrl(mode: "controller" | "field"): string {
    const url = normalizeUrl(this._secureOrigin);
    if (!url) return "about:blank";

    url.searchParams.set("mode", mode);
    url.searchParams.set("sessionId", this._group);
    url.searchParams.set("merchantOrigin", this._merchantOrigin);
    if (this._lang) {
      url.searchParams.set("lang", this._lang);
    }

    if (mode === "field") {
      const field = this._type;
      const theme = this._getThemeAttributes();

      url.searchParams.set("field", EMBED_FIELD_NAME[field]);
      url.searchParams.set("label", this._getAssociatedLabelText() || DEFAULT_LABELS[field]);

      if (this._placeholder) {
        url.searchParams.set("placeholder", this._placeholder);
      }

      if (field === "account-type" && this._accountTypeValues?.length) {
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
      iframe { width: 100%; height: ${initialIframeHeight}; min-height: ${initialIframeHeight}; border: 0; display: block; background: transparent; }
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
    fieldIframe.title = `ACH ${this._type}`;
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
