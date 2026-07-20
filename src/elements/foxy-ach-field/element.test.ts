import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_PROPERTY_TO_ATTRIBUTE } from "@/lib/theme-mixin";
import { deriveInputMetrics } from "@/lib/theme-attribute-sync";
import { defaultTheme } from "@foxy.io/design-system/theme";

import {
  ACH_FIELD_ELEMENT_TAG,
  AchFieldElement,
  achFieldEvents,
} from "./element";

type FakeInternals = {
  checkValidity: ReturnType<typeof vi.fn>;
  labels: HTMLLabelElement[];
  reportValidity: ReturnType<typeof vi.fn>;
  setValidity: ReturnType<typeof vi.fn>;
  states: Set<string>;
};

type HostedFieldState = {
  complete: boolean;
  empty: boolean;
  errorCode: string | null;
  focused?: boolean;
  touched?: boolean;
};

const internalsByElement = new WeakMap<HTMLElement, FakeInternals>();

function installFakeInternals(): void {
  Object.defineProperty(HTMLElement.prototype, "attachInternals", {
    configurable: true,
    value: function attachInternals(this: HTMLElement): FakeInternals {
      const internals: FakeInternals = {
        checkValidity: vi.fn(() => true),
        labels: [],
        reportValidity: vi.fn(() => true),
        setValidity: vi.fn(),
        states: new Set<string>(),
      };
      internalsByElement.set(this, internals);
      return internals;
    },
  });
}

function getInternals(element: HTMLElement): FakeInternals {
  const internals = internalsByElement.get(element);
  if (!internals) {
    throw new Error("Missing fake ElementInternals for ACH field test.");
  }

  return internals;
}

function createField(
  type: AchFieldElement["type"],
  group = "ach-unit-group",
): AchFieldElement {
  const element = document.createElement(
    ACH_FIELD_ELEMENT_TAG,
  ) as AchFieldElement;
  element.type = type;
  element.group = group;
  document.body.append(element);
  return element;
}

function attachFakeControllerSource(host: AchFieldElement): {
  postMessage: ReturnType<typeof vi.fn>;
} {
  const entry = (
    host as unknown as {
      _registryEntry?: { controllerIframe?: HTMLIFrameElement | null };
    }
  )._registryEntry;
  if (!entry) {
    throw new Error("Missing registry entry for ACH field test.");
  }

  const source = {
    postMessage: vi.fn(),
  };

  entry.controllerIframe = {
    contentWindow: source,
  } as unknown as HTMLIFrameElement;

  return source;
}

function getExpectedOrigin(host: AchFieldElement): string {
  const secureOrigin = (host as unknown as { _secureOrigin: string })
    ._secureOrigin;
  return new URL(secureOrigin, window.location.origin).origin;
}

function dispatchHostedChange(
  host: AchFieldElement,
  fields: Partial<Record<AchFieldElement["type"], HostedFieldState>>,
  options?: {
    changedFields?: AchFieldElement["type"][];
  },
): void {
  const source = attachFakeControllerSource(host);
  const onWindowMessage = (
    host as unknown as { _onWindowMessage: (event: MessageEvent) => void }
  )._onWindowMessage;

  const changedFields = options?.changedFields?.map((fieldName) =>
    fieldName.replace(/-/g, "_"),
  );

  onWindowMessage({
    data: {
      type: "change",
      fields: Object.entries(fields).reduce(
        (result, [fieldName, state]) => {
          if (!state) return result;

          result[fieldName.replace(/-/g, "_")] = state;
          return result;
        },
        {} as Record<string, HostedFieldState>,
      ),
      changedFields: changedFields ?? [],
    },
    origin: getExpectedOrigin(host),
    source,
  } as unknown as MessageEvent);
}

function dispatchTokenizationError(
  host: AchFieldElement,
  code: "invalid_state" | "validation_failed",
  requestId?: string,
): void {
  const source = attachFakeControllerSource(host);

  const onWindowMessage = (
    host as unknown as { _onWindowMessage: (event: MessageEvent) => void }
  )._onWindowMessage;

  onWindowMessage({
    data: { type: "tokenization_response", id: requestId, token: null, code },
    origin: getExpectedOrigin(host),
    source,
  } as unknown as MessageEvent);
}

const THEME_PROPERTY_MAPPINGS = Object.entries(THEME_PROPERTY_TO_ATTRIBUTE) as [
  string,
  string,
][];

describe("AchFieldElement events", () => {
  beforeEach(() => {
    installFakeInternals();
    document.body.innerHTML = "";
    document.documentElement.style.removeProperty("--font-body");
    document.documentElement.style.removeProperty("--size-control");
    document.documentElement.style.removeProperty("--size-border-width");
  });

  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.style.removeProperty("--font-body");
    document.documentElement.style.removeProperty("--size-control");
    document.documentElement.style.removeProperty("--size-border-width");
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("dispatches change only for field instances whose values changed", () => {
    const routing = createField("routing-number");
    const account = createField("account-number", routing.group);

    const routingChange = vi.fn();
    const accountChange = vi.fn();
    routing.addEventListener(achFieldEvents.change, routingChange);
    account.addEventListener(achFieldEvents.change, accountChange);

    dispatchHostedChange(
      routing,
      {
        "routing-number": {
          complete: true,
          empty: false,
          errorCode: null,
        },
        "account-number": {
          complete: false,
          empty: true,
          errorCode: null,
        },
      },
      { changedFields: ["routing-number"] },
    );

    expect(routingChange).toHaveBeenCalledTimes(1);
    expect(accountChange).not.toHaveBeenCalled();
  });

  it("emits native-like focus and blur transitions per field", () => {
    const routing = createField("routing-number");

    const onChange = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    routing.addEventListener(achFieldEvents.change, onChange);
    routing.addEventListener(achFieldEvents.focus, onFocus);
    routing.addEventListener(achFieldEvents.blur, onBlur);

    dispatchHostedChange(
      routing,
      {
        "routing-number": {
          complete: false,
          empty: true,
          errorCode: null,
          focused: true,
        },
      },
      { changedFields: [] },
    );
    dispatchHostedChange(
      routing,
      {
        "routing-number": {
          complete: false,
          empty: true,
          errorCode: null,
          focused: true,
        },
      },
      { changedFields: [] },
    );
    dispatchHostedChange(
      routing,
      {
        "routing-number": {
          complete: false,
          empty: true,
          errorCode: null,
          focused: false,
        },
      },
      { changedFields: [] },
    );

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();

    const focusEvent = onFocus.mock.calls[0]?.[0] as FocusEvent;
    const blurEvent = onBlur.mock.calls[0]?.[0] as FocusEvent;
    expect(focusEvent.bubbles).toBe(false);
    expect(blurEvent.bubbles).toBe(false);
  });

  it("dispatches change when the hosted value is cleared", () => {
    const routing = createField("routing-number");
    const onChange = vi.fn();

    routing.addEventListener(achFieldEvents.change, onChange);

    dispatchHostedChange(
      routing,
      {
        "routing-number": {
          complete: false,
          empty: true,
          errorCode: "required",
          focused: false,
          touched: false,
        },
      },
      { changedFields: ["routing-number"] },
    );

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("uses built-in validity flags for incomplete and invalid hosted state", () => {
    const routing = createField("routing-number");
    const internals = getInternals(routing);

    dispatchHostedChange(routing, {
      "routing-number": {
        complete: false,
        empty: true,
        errorCode: null,
      },
    });

    expect(internals.setValidity).toHaveBeenLastCalledWith(
      { valueMissing: true },
      "Please complete routing number.",
    );

    dispatchHostedChange(routing, {
      "routing-number": {
        complete: true,
        empty: false,
        errorCode: "invalid_routing_number",
      },
    });

    expect(internals.setValidity).toHaveBeenLastCalledWith(
      { badInput: true },
      "Please check routing number.",
    );

    dispatchHostedChange(routing, {
      "routing-number": {
        complete: true,
        empty: false,
        errorCode: null,
      },
    });

    expect(internals.setValidity).toHaveBeenLastCalledWith({});
  });

  it("computes validity per field instance, not entire session", () => {
    const routing = createField("routing-number");
    const account = createField("account-number", routing.group);
    const routingInternals = getInternals(routing);

    dispatchHostedChange(routing, {
      "routing-number": {
        complete: true,
        empty: false,
        errorCode: null,
      },
      "account-number": {
        complete: false,
        empty: true,
        errorCode: null,
      },
    });

    expect(routingInternals.setValidity).toHaveBeenLastCalledWith({});

    account.remove();
  });

  it("omits sessionId from tokenizationerror detail", () => {
    const routing = createField("routing-number");
    const onTokenizationError = vi.fn();
    routing.addEventListener(
      achFieldEvents.tokenizationError,
      onTokenizationError,
    );

    dispatchTokenizationError(routing, "validation_failed", "req-1");

    expect(onTokenizationError).toHaveBeenCalledTimes(1);
    const event = onTokenizationError.mock.calls[0]?.[0] as CustomEvent<{
      code: string;
      requestId?: string;
    }>;

    expect(event.detail).toEqual({
      code: "validation_failed",
      requestId: "req-1",
    });
    expect("sessionId" in event.detail).toBe(false);
  });

  it("emits tokenizationerror when tokenize times out", async () => {
    vi.useFakeTimers();

    const routing = createField("routing-number");
    attachFakeControllerSource(routing);

    const onTokenizationError = vi.fn();
    routing.addEventListener(
      achFieldEvents.tokenizationError,
      onTokenizationError,
    );

    const tokenizePromise = routing.tokenize("req-timeout");

    await vi.advanceTimersByTimeAsync(30000);

    await expect(tokenizePromise).rejects.toThrow(
      "ACH tokenization timed out.",
    );
    expect(onTokenizationError).toHaveBeenCalledTimes(1);
    expect(
      (
        onTokenizationError.mock.calls[0]?.[0] as CustomEvent<{
          code: string;
          requestId?: string;
        }>
      ).detail,
    ).toEqual({
      code: "tokenization_timeout",
      requestId: "req-timeout",
    });
  });

  it("clears hosted state when the form resets", () => {
    const routing = createField("routing-number");
    const internals = getInternals(routing);

    dispatchHostedChange(routing, {
      "routing-number": {
        complete: true,
        empty: false,
        errorCode: "invalid_routing_number",
        focused: true,
        touched: true,
      },
    });

    expect(internals.states.has("focused")).toBe(true);
    expect(internals.states.has("user-invalid")).toBe(true);

    const source = attachFakeControllerSource(routing);

    routing.formResetCallback();

    expect(source.postMessage).toHaveBeenCalledWith(
      { type: "clear" },
      getExpectedOrigin(routing),
    );
    expect(internals.states.has("focused")).toBe(false);
    expect(internals.states.has("user-invalid")).toBe(false);
    expect(internals.setValidity).toHaveBeenLastCalledWith(
      { valueMissing: true },
      "Please complete routing number.",
    );
  });

  it("passes lang through iframe URL params", () => {
    const field = createField("routing-number");
    field.lang = "fr-CA";

    const iframe = field.shadowRoot?.querySelector(
      "iframe:not([data-role='controller'])",
    ) as HTMLIFrameElement | null;
    expect(iframe).toBeTruthy();

    const src = iframe?.getAttribute("src") ?? "";
    const url = new URL(src, window.location.origin);
    expect(url.searchParams.get("lang")).toBe("fr-CA");
  });

  it("reflects theme attributes through camelCase properties", () => {
    const field = createField("routing-number");
    const fieldRecord = field as unknown as Record<string, string | undefined>;

    for (const [propertyName, attributeName] of THEME_PROPERTY_MAPPINGS) {
      const fromAttribute = `${attributeName}-value`;
      field.setAttribute(attributeName, fromAttribute);
      expect(fieldRecord[propertyName]).toBe(fromAttribute);

      const fromProperty = `${propertyName}-value`;
      fieldRecord[propertyName] = fromProperty;
      expect(field.getAttribute(attributeName)).toBe(fromProperty);

      fieldRecord[propertyName] = undefined;
      expect(field.hasAttribute(attributeName)).toBe(false);
    }

    field.themeSizeControl = " 3rem ";
    expect(field.getAttribute("theme-size-control")).toBe("3rem");
  });

  it("uses CSS custom properties as default theme values", () => {
    const field = document.createElement(
      ACH_FIELD_ELEMENT_TAG,
    ) as AchFieldElement;
    field.type = "routing-number";
    field.group = "ach-unit-group";
    field.style.setProperty("--font-body", "400 1rem/1.25 Figtree, sans-serif");
    field.style.setProperty("--size-control", "3rem");
    field.style.setProperty("--size-border-width", "0px");
    document.body.append(field);

    expect(field.themeFontBody).toBe("400 1rem/1.25 Figtree, sans-serif");
    expect(field.themeSizeControl).toBe("3rem");

    const iframe = field.shadowRoot?.querySelector(
      "iframe:not([data-role='controller'])",
    ) as HTMLIFrameElement | null;
    expect(iframe).toBeTruthy();

    const src = iframe?.getAttribute("src") ?? "";
    const url = new URL(src, window.location.origin);
    expect(url.searchParams.get("input_font")).toBe("Figtree, sans-serif");
    expect(url.searchParams.get("input_height")).toBe("48px");
  });

  it("derives the outer iframe's initial height from defaultTheme when no theme is configured at all", () => {
    const field = createField("routing-number");

    const iframe = field.shadowRoot?.querySelector(
      "iframe:not([data-role='controller'])",
    ) as HTMLIFrameElement | null;
    expect(iframe).toBeTruthy();

    const expectedMetrics = deriveInputMetrics({
      controlSize: defaultTheme.size.control,
      borderWidth: defaultTheme.size.borderWidth,
      fontBody: defaultTheme.font.body,
    });
    const expectedHeight = `${expectedMetrics.heightPx}px`;

    const computedStyle = getComputedStyle(iframe as HTMLIFrameElement);
    expect(computedStyle.height).toBe(expectedHeight);
    expect(computedStyle.minHeight).toBe(expectedHeight);
  });
});
