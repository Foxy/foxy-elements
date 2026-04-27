import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  PAYMENT_CARD_FIELD_ELEMENT_TAG,
  PaymentCardFieldElement,
} from "./payment-card-field-element";

type FakeInternals = {
  checkValidity: ReturnType<typeof vi.fn>;
  labels: HTMLLabelElement[];
  reportValidity: ReturnType<typeof vi.fn>;
  setValidity: ReturnType<typeof vi.fn>;
  states: Set<string>;
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
    throw new Error("Missing fake ElementInternals for card field test.");
  }

  return internals;
}

describe("PaymentCardFieldElement", () => {
  beforeEach(() => {
    installFakeInternals();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("observes explicit translation attributes and omits demo/template attributes", () => {
    expect(PaymentCardFieldElement.observedAttributes).toContain(
      "translation-card-number-label",
    );
    expect(PaymentCardFieldElement.observedAttributes).toContain(
      "translation-card-csc-placeholder",
    );
    expect(PaymentCardFieldElement.observedAttributes).not.toContain("template-set-id");
    expect(PaymentCardFieldElement.observedAttributes).not.toContain("demo-mode");
    expect(PaymentCardFieldElement.observedAttributes).toContain("lang");
  });

  it("applies disabled state through formDisabledCallback", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    document.body.append(element);

    const internals = getInternals(element);
    element.formDisabledCallback(true);

    expect(element.disabled).toBe(true);
    expect(internals.states.has("disabled")).toBe(true);
  });

  it("tracks focused and user validity using ElementInternals states", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    document.body.append(element);

    const internals = getInternals(element);
    const privateElement = element as unknown as {
      _focused: boolean;
      _touched: boolean;
      _invalid: boolean;
      _syncPublicStates: () => void;
    };

    privateElement._focused = true;
    privateElement._touched = true;
    privateElement._invalid = false;
    privateElement._syncPublicStates();

    expect(internals.states.has("focused")).toBe(true);
    expect(internals.states.has("user-valid")).toBe(true);
    expect(internals.states.has("user-invalid")).toBe(false);

    privateElement._invalid = true;
    privateElement._syncPublicStates();

    expect(internals.states.has("user-valid")).toBe(false);
    expect(internals.states.has("user-invalid")).toBe(true);
    expect(element.hasAttribute("data-focused")).toBe(false);
    expect(element.hasAttribute("data-user-invalid")).toBe(false);
  });

  it("serializes translation attributes into config payload without readonly", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    document.body.append(element);

    element.setAttribute("translation-card-number-label", "Card number");
    element.setAttribute("translation-card-csc-label", "Security code");

    const postMessage = vi.fn();
    const privateElement = element as unknown as {
      _port: { postMessage: (message: string) => void };
      _sendConfig: () => void;
    };
    privateElement._port = { postMessage };

    privateElement._sendConfig();

    const payloadRaw = postMessage.mock.calls[0]?.[0] as string;
    const payload = JSON.parse(payloadRaw) as {
      translations?: Record<string, string>;
      readonly?: unknown;
    };

    expect(payload.translations).toEqual({
      "card.number.label": "Card number",
      "card.csc.label": "Security code",
    });
    expect("readonly" in payload).toBe(false);
  });

  it("includes lang in config payload", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    document.body.append(element);
    element.lang = "es-MX";

    const postMessage = vi.fn();
    const privateElement = element as unknown as {
      _port: { postMessage: (message: string) => void };
      _sendConfig: () => void;
    };
    privateElement._port = { postMessage };

    privateElement._sendConfig();

    const payloadRaw = postMessage.mock.calls[0]?.[0] as string;
    const payload = JSON.parse(payloadRaw) as {
      lang?: string;
    };

    expect(payload.lang).toBe("es-MX");
  });

  it("rejects tokenize with invalid_state when iframe is not ready", async () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    document.body.append(element);

    await expect(element.tokenize()).rejects.toThrow("Secure card fields are not ready yet.");
  });
});
