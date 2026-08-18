import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ALWAYS_VALID } from "@/lib/validity";
import {
  THEME_ATTRIBUTE_NAMES,
  THEME_PROPERTY_TO_ATTRIBUTE,
} from "@/lib/theme-mixin";

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
  validationMessage: string;
  validity: ValidityState;
  willValidate: boolean;
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
        validationMessage: "",
        validity: { ...ALWAYS_VALID },
        willValidate: true,
      };

      // Record what `setValidity` was given, so the element's `validity` and
      // `validationMessage` getters have real internals state to forward.
      internals.setValidity.mockImplementation(
        (flags?: ValidityStateFlags, message?: string) => {
          const valid = !flags || Object.keys(flags).length === 0;
          internals.validity = { ...ALWAYS_VALID, ...flags, valid };
          internals.validationMessage = valid ? "" : (message ?? "");
        },
      );
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

const THEME_PROPERTY_MAPPINGS = (
  Object.entries(THEME_PROPERTY_TO_ATTRIBUTE) as [string, string][]
).map(([propertyName, attributeName]) => {
  return [propertyName, attributeName, `${attributeName}-value`] as const;
});

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
  ...THEME_PROPERTY_MAPPINGS,
];

describe("PaymentCardFieldElement", () => {
  beforeEach(() => {
    installFakeInternals();
    document.body.innerHTML = "";
    document.documentElement.style.removeProperty("--font-sans");
    document.documentElement.style.removeProperty("--input-height");
  });

  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.style.removeProperty("--font-sans");
    document.documentElement.style.removeProperty("--input-height");
    vi.restoreAllMocks();
  });

  it.each(STRING_PROPERTY_MAPPINGS as Array<[string, string, string]>)(
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

  it("observes explicit translation and template-set-id attributes and omits demo attributes", () => {
    expect(PaymentCardFieldElement.observedAttributes).toContain(
      "translation-card-number-label",
    );
    expect(PaymentCardFieldElement.observedAttributes).toContain(
      "translation-card-csc-placeholder",
    );
    expect(PaymentCardFieldElement.observedAttributes).toContain("disabled");
    // INTERIM: template-set-id is now a real observed attribute. Removed when
    // card token vaulting lands.
    expect(PaymentCardFieldElement.observedAttributes).toContain(
      "template-set-id",
    );
    expect(PaymentCardFieldElement.observedAttributes).not.toContain(
      "demo-mode",
    );
    expect(PaymentCardFieldElement.observedAttributes).toContain("lang");

    for (const attributeName of THEME_ATTRIBUTE_NAMES) {
      expect(PaymentCardFieldElement.observedAttributes).toContain(
        attributeName,
      );
    }
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

  it("uses CSS custom properties as default theme values", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    element.style.setProperty("--font-body", "400 1rem/1.25 Figtree, sans-serif");
    element.style.setProperty("--size-control", "4rem");
    document.body.append(element);

    expect(element.themeFontBody).toBe("400 1rem/1.25 Figtree, sans-serif");
    expect(element.themeSizeControl).toBe("4rem");

    // 4rem = 64px at the default 16px root font size; border width falls
    // back to the design system's default (0.125rem = 2px each side).
    const expectedHeightPx = 64 - 2 * 2;

    const iframe = element.shadowRoot?.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe?.style.height).toBe(`${expectedHeightPx}px`);

    const url = new URL(
      iframe?.getAttribute("src") ?? "",
      window.location.origin,
    );
    expect(url.searchParams.get("theme_font_sans")).toBe("Figtree, sans-serif");
    expect(url.searchParams.get("theme_input_height")).toBe(`${expectedHeightPx}px`);
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

  it("exposes validity and validationMessage to consumers", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    document.body.append(element);

    const privateElement = element as unknown as {
      _handlePortMessage: (event: MessageEvent<string>) => void;
    };

    expect(element.validity.valid).toBe(true);
    expect(element.validationMessage).toBe("");

    privateElement._handlePortMessage({
      data: JSON.stringify({
        type: "validation",
        field: "form",
        valid: false,
        code: "value_missing",
      }),
    } as MessageEvent<string>);

    expect(element.validity.valid).toBe(false);
    expect(element.validationMessage).toBe("Card details are invalid.");

    // The embed's code decides the constraint, so a consumer can tell this
    // apart from a malformed value and word the two differently.
    expect(element.validity.valueMissing).toBe(true);
    expect(element.validity.customError).toBe(false);

    privateElement._handlePortMessage({
      data: JSON.stringify({
        type: "validation",
        field: "form",
        valid: true,
        code: null,
      }),
    } as MessageEvent<string>);

    expect(element.validity.valid).toBe(true);
    expect(element.validationMessage).toBe("");
  });

  // `card_brand_unsupported` and `invalid_state` are business rules with no
  // native constraint to match, so they stay on customError by design.
  it.each([
    ["value_missing", "valueMissing"],
    ["pattern_mismatch", "patternMismatch"],
    ["range_underflow", "rangeUnderflow"],
    ["card_brand_unsupported", "customError"],
    ["invalid_state", "customError"],
  ] as const)("maps the %s embed code onto %s", (code, flag) => {
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
        field: "form",
        valid: false,
        code,
      }),
    } as MessageEvent<string>);

    expect(internals.setValidity).toHaveBeenLastCalledWith(
      { [flag]: true },
      "Card details are invalid.",
    );
    expect(element.validity[flag]).toBe(true);
    expect(element.validity.valid).toBe(false);
  });

  it("falls back to customError when an invalid field sends no code", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    document.body.append(element);

    const internals = getInternals(element);
    const privateElement = element as unknown as {
      _handlePortMessage: (event: MessageEvent<string>) => void;
    };

    privateElement._handlePortMessage({
      data: JSON.stringify({ type: "validation", field: "form", valid: false }),
    } as MessageEvent<string>);

    expect(internals.setValidity).toHaveBeenLastCalledWith(
      { customError: true },
      "Card details are invalid.",
    );
    expect(element.validity.customError).toBe(true);
  });

  it("reports valid when element internals are unavailable", () => {
    const element = document.createElement(
      PAYMENT_CARD_FIELD_ELEMENT_TAG,
    ) as PaymentCardFieldElement;
    document.body.append(element);

    // Mirrors `checkValidity()`, which already answers true without internals.
    Reflect.set(element, "_internals", null);

    expect(element.validity).toEqual(ALWAYS_VALID);
    expect(element.validationMessage).toBe("");
    expect(element.willValidate).toBe(false);
    expect(element.checkValidity()).toBe(true);
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
      { patternMismatch: true },
      "Please enter a valid card number.",
    );

    element.disabled = true;
    expect(internals.setValidity).toHaveBeenLastCalledWith({});

    element.disabled = false;
    expect(internals.setValidity).toHaveBeenLastCalledWith(
      { patternMismatch: true },
      "Please enter a valid card number.",
    );
  });
});
