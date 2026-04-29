import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
): void {
  const source = attachFakeControllerSource(host);
  const onWindowMessage = (
    host as unknown as { _onWindowMessage: (event: MessageEvent) => void }
  )._onWindowMessage;

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

describe("AchFieldElement events", () => {
  beforeEach(() => {
    installFakeInternals();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("dispatches change only on each field instance without public detail", () => {
    const routing = createField("routing-number");
    const account = createField("account-number");

    const routingChange = vi.fn();
    const accountChange = vi.fn();
    routing.addEventListener(achFieldEvents.change, routingChange);
    account.addEventListener(achFieldEvents.change, accountChange);

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

    expect(routingChange).toHaveBeenCalledTimes(1);
    expect(accountChange).toHaveBeenCalledTimes(1);

    const routingEvent = routingChange.mock.calls[0]?.[0];
    const accountEvent = accountChange.mock.calls[0]?.[0];
    expect(routingEvent).toBeInstanceOf(Event);
    expect(accountEvent).toBeInstanceOf(Event);
    expect("detail" in routingEvent).toBe(false);
    expect("detail" in accountEvent).toBe(false);
  });

  it("emits native-like focus and blur transitions per field", () => {
    const routing = createField("routing-number");

    const onFocus = vi.fn();
    const onBlur = vi.fn();
    routing.addEventListener(achFieldEvents.focus, onFocus);
    routing.addEventListener(achFieldEvents.blur, onBlur);

    dispatchHostedChange(routing, {
      "routing-number": {
        complete: false,
        empty: true,
        errorCode: null,
        focused: true,
      },
    });
    dispatchHostedChange(routing, {
      "routing-number": {
        complete: false,
        empty: true,
        errorCode: null,
        focused: true,
      },
    });
    dispatchHostedChange(routing, {
      "routing-number": {
        complete: false,
        empty: true,
        errorCode: null,
        focused: false,
      },
    });

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);

    const focusEvent = onFocus.mock.calls[0]?.[0] as FocusEvent;
    const blurEvent = onBlur.mock.calls[0]?.[0] as FocusEvent;
    expect(focusEvent.bubbles).toBe(false);
    expect(blurEvent.bubbles).toBe(false);
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
});
