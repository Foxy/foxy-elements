import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  PAYMENT_CARD_FIELD_ELEMENT_TAG,
  PaymentCardFieldElement,
} from "./element";

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

const STRING_PROPERTY_MAPPINGS = [
  [
    "translationCardNumberLabel",
    "translation-card-number-label",
    "Card number",
  ],
  [
    "translationCardExpirationPlaceholder",
    "translation-card-expiration-placeholder",
    "MM / YY",
  ],
  ["translationCardCscPlaceholder", "translation-card-csc-placeholder", "CVV"],
  ["themeBackground", "theme-background", "#ffffff"],
  ["themeInputHeight", "theme-input-height", "56px"],
  ["themeInputPaddingX", "theme-input-padding-x", "14px"],
  ["themeFontSans", "theme-font-sans", "Figtree"],
] as const;

describe("PaymentCardFieldElement", () => {
  beforeEach(() => {
    installFakeInternals();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it.each(STRING_PROPERTY_MAPPINGS)(
    "reflects %s through %s",
    (propertyName, attributeName, value) => {
      const element = document.createElement(
        PAYMENT_CARD_FIELD_ELEMENT_TAG,
      ) as PaymentCardFieldElement;

      (element as unknown as Record<string, string | undefined>)[propertyName] =
        value;

      expect(element.getAttribute(attributeName)).toBe(value);
      expect(
        (element as unknown as Record<string, string | undefined>)[
          propertyName
        ],
      ).toBe(value);

      (element as unknown as Record<string, string | undefined>)[propertyName] =
        undefined;

      expect(element.hasAttribute(attributeName)).toBe(false);
    },
  );

  it("observes explicit translation attributes and omits demo/template attributes", () => {
    expect(PaymentCardFieldElement.observedAttributes).toContain(
      "translation-card-number-label",
    );
    expect(PaymentCardFieldElement.observedAttributes).toContain(
      "translation-card-csc-placeholder",
    );
    expect(PaymentCardFieldElement.observedAttributes).toContain("disabled");
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

  it("supports declarative disabled attribute reflection", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    element.setAttribute("disabled", "");
    document.body.append(element);

    const internals = getInternals(element);
    expect(element.disabled).toBe(true);
    expect(internals.states.has("disabled")).toBe(true);

    element.removeAttribute("disabled");

    expect(element.disabled).toBe(false);
    expect(internals.states.has("disabled")).toBe(false);
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
    element.lang = "es-MX";
    element.mode = "card_csc";
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

  it("falls back to card mode for unsupported mode values", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    element.setAttribute("mode", "unsupported-mode");
    document.body.append(element);

    expect(element.mode).toBe("card");
    expect(element.getAttribute("mode")).toBe("card");
  });

  it("uses VITE_EMBED_ORIGIN to build the iframe URL", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    document.body.append(element);

    const iframe = element.shadowRoot?.querySelector("iframe");
    expect(iframe).toBeTruthy();

    const url = new URL(
      iframe?.getAttribute("src") ?? "",
      window.location.origin,
    );
    const expectedOrigin = new URL(
      import.meta.env.VITE_EMBED_ORIGIN,
      window.location.origin,
    ).origin;
    expect(url.origin).toBe(expectedOrigin);
    expect(url.pathname).toBe("/v2.html");
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
      _port: {
        close: () => void;
        onmessage: ((event: MessageEvent<string>) => void) | null;
        postMessage: (message: string) => void;
      };
      _ready: boolean;
      _handlePortMessage: (event: MessageEvent<string>) => void;
    };

    privateElement._port = { close: vi.fn(), onmessage: null, postMessage };
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

  it("rejects duplicate tokenize request IDs while the original request is pending", async () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    document.body.append(element);

    const postMessage = vi.fn();
    const privateElement = element as unknown as {
      _port: {
        close: () => void;
        onmessage: ((event: MessageEvent<string>) => void) | null;
        postMessage: (message: string) => void;
      };
      _ready: boolean;
      _handlePortMessage: (event: MessageEvent<string>) => void;
    };

    privateElement._port = { close: vi.fn(), onmessage: null, postMessage };
    privateElement._ready = true;

    const firstRequest = element.tokenize("card-request-duplicate");

    await expect(element.tokenize("card-request-duplicate")).rejects.toThrow(
      'Tokenization request "card-request-duplicate" is already pending.',
    );

    expect(postMessage).toHaveBeenCalledTimes(1);

    privateElement._handlePortMessage({
      data: JSON.stringify({
        type: "tokenization_response",
        id: "card-request-duplicate",
        token: "tok_test_card",
      }),
    } as MessageEvent<string>);

    await expect(firstRequest).resolves.toEqual({
      token: "tok_test_card",
      requestId: "card-request-duplicate",
    });
  });

  it("restores previously known invalid state when re-enabled", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    document.body.append(element);

    const internals = getInternals(element);
    const privateElement = element as unknown as {
      _handlePortMessage: (event: MessageEvent<string>) => void;
    };

    privateElement._handlePortMessage({
      data: JSON.stringify({
        type: "validation",
        field: "cc_number",
        valid: false,
        code: "pattern_mismatch",
      }),
    } as MessageEvent<string>);

    expect(internals.setValidity).toHaveBeenLastCalledWith(
      { customError: true },
      "Please enter a valid card number.",
    );

    element.disabled = true;
    expect(internals.setValidity).toHaveBeenLastCalledWith({});

    element.disabled = false;
    expect(internals.setValidity).toHaveBeenLastCalledWith(
      { customError: true },
      "Please enter a valid card number.",
    );
  });
});
