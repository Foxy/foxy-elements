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
    expect(PaymentCardFieldElement.observedAttributes).not.toContain(
      "template-set-id",
    );
    expect(PaymentCardFieldElement.observedAttributes).not.toContain(
      "demo-mode",
    );
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

  it("encodes translation attributes into iframe URL params", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    element.secureOrigin = "https://embed.example";

    element.setAttribute("translation-card-number-label", "Card number");
    element.setAttribute("translation-card-csc-label", "Security code");
    document.body.append(element);

    const iframe = element.shadowRoot?.querySelector("iframe");
    expect(iframe).toBeTruthy();

    const url = new URL(
      iframe?.getAttribute("src") ?? "",
      window.location.origin,
    );
    expect(url.searchParams.get("translations_cc_number_label")).toBe(
      "Card number",
    );
    expect(url.searchParams.get("translations_cc_csc_label")).toBe(
      "Security code",
    );
  });

  it("includes lang and embed mode in iframe URL params", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    element.secureOrigin = "https://embed.example";
    element.lang = "es-MX";
    element.mode = "csc-only";
    document.body.append(element);

    const iframe = element.shadowRoot?.querySelector("iframe");
    expect(iframe).toBeTruthy();

    const url = new URL(
      iframe?.getAttribute("src") ?? "",
      window.location.origin,
    );
    expect(url.searchParams.get("lang")).toBe("es-MX");
    expect(url.searchParams.get("mode")).toBe("card_csc");
  });

  it("rejects tokenize with invalid_state when iframe is not ready", async () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    document.body.append(element);

    await expect(element.tokenize()).rejects.toThrow(
      "Secure card fields are not ready yet.",
    );
  });

  it("resolves tokenize with metadata from tokenization_response payload", async () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    document.body.append(element);

    const postMessage = vi.fn();
    const privateElement = element as unknown as {
      _port: { postMessage: (message: string) => void };
      _ready: boolean;
      _handlePortMessage: (event: MessageEvent<string>) => void;
    };

    privateElement._port = { postMessage };
    privateElement._ready = true;

    let eventDetail:
      | {
          token: string;
          requestId?: string;
          cardBrand?: string;
          last4?: string;
          expirationMonth?: number;
          expirationYear?: number;
        }
      | undefined;

    element.addEventListener(
      "tokenizationsuccess",
      (event) => {
        eventDetail = (
          event as CustomEvent<{
            token: string;
            requestId?: string;
            cardBrand?: string;
            last4?: string;
            expirationMonth?: number;
            expirationYear?: number;
          }>
        ).detail;
      },
      { once: true },
    );

    const resultPromise = element.tokenize("card-request-1");

    privateElement._handlePortMessage({
      data: JSON.stringify({
        type: "tokenization_response",
        id: "card-request-1",
        token: "tok_test_card",
        brand: "visa",
        last4Digits: "1111",
        expirationMonth: 12,
        expirationYear: 2030,
      }),
    } as MessageEvent<string>);

    await expect(resultPromise).resolves.toEqual({
      token: "tok_test_card",
      requestId: "card-request-1",
      cardBrand: "visa",
      last4: "1111",
      expirationMonth: 12,
      expirationYear: 2030,
    });

    expect(eventDetail).toEqual({
      token: "tok_test_card",
      requestId: "card-request-1",
      cardBrand: "visa",
      last4: "1111",
      expirationMonth: 12,
      expirationYear: 2030,
    });
    expect(postMessage).toHaveBeenCalledWith(
      JSON.stringify({ type: "tokenization_request", id: "card-request-1" }),
    );
  });
});
