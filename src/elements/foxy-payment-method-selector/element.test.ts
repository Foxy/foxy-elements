import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import { defaultTheme } from "@foxy.io/design-system/theme";
import {
  THEME_ATTRIBUTE_NAMES,
  THEME_PROPERTY_TO_ATTRIBUTE,
} from "@/lib/theme-mixin";
import { PaymentMethodSelectorElement, toBcp47Locale } from "./element";

type PayPalPlatformTestOptionType =
  | "paypal"
  | "new-card"
  | "apple-pay"
  | "google-pay"
  | "paypal-pay-later"
  | "paypal-credit"
  | "venmo"
  | "sepa"
  | "bancontact"
  | "eps"
  | "blik"
  | "ideal"
  | "przelewy24";

const PAYPAL_PLATFORM_ELIGIBILITY_KEY_BY_OPTION_TYPE: Partial<
  Record<PayPalPlatformTestOptionType, string>
> = {
  "new-card": "advanced_cards",
  "apple-pay": "applepay",
  "google-pay": "googlepay",
  "paypal-pay-later": "paylater",
  "paypal-credit": "credit",
  venmo: "venmo",
  sepa: "sepa",
  bancontact: "bancontact",
  eps: "eps",
  blik: "blik",
  ideal: "ideal",
  przelewy24: "p24",
};

const PAYPAL_PLATFORM_SESSION_CREATOR_BY_OPTION_TYPE: Partial<
  Record<PayPalPlatformTestOptionType, string>
> = {
  paypal: "createPayPalOneTimePaymentSession",
  "new-card": "createCardFieldsOneTimePaymentSession",
  "apple-pay": "createApplePayOneTimePaymentSession",
  "google-pay": "createGooglePayOneTimePaymentSession",
  "paypal-pay-later": "createPayLaterOneTimePaymentSession",
  "paypal-credit": "createPayPalCreditOneTimePaymentSession",
  venmo: "createVenmoOneTimePaymentSession",
  sepa: "createSepaOneTimePaymentSession",
  bancontact: "createBancontactOneTimePaymentSession",
  eps: "createEpsOneTimePaymentSession",
  blik: "createBlikOneTimePaymentSession",
  ideal: "createIdealOneTimePaymentSession",
  przelewy24: "createP24OneTimePaymentSession",
};

function overrideCheckoutClient(properties: Record<string, unknown>) {
  const descriptors = new Map<string, PropertyDescriptor | undefined>();

  for (const [key, value] of Object.entries(properties)) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(checkoutClient, key));
    Object.defineProperty(checkoutClient, key, {
      configurable: true,
      value,
    });
  }

  return () => {
    for (const [key, descriptor] of descriptors.entries()) {
      if (descriptor) {
        Object.defineProperty(checkoutClient, key, descriptor);
      } else {
        delete (checkoutClient as unknown as Record<string, unknown>)[key];
      }
    }
  };
}

function overrideClientState(
  state: unknown,
  json: unknown = undefined,
  extraProperties: Record<string, unknown> = {},
) {
  return overrideCheckoutClient({
    state,
    json,
    ...extraProperties,
  });
}

async function waitForRender(): Promise<void> {
  await Promise.resolve();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await Promise.resolve();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForText(
  getText: () => string | null | undefined,
  expected: string,
  maxAttempts = 10,
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (getText()?.includes(expected)) {
      return;
    }

    await waitForRender();
  }

  throw new Error(`Timed out waiting for text: ${expected}`);
}

async function waitForTruthy<T>(
  getValue: () => T | null | undefined,
  label: string,
): Promise<NonNullable<T>> {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const value = getValue();
    if (value) {
      return value as NonNullable<T>;
    }

    await waitForRender();
  }

  throw new Error(`Timed out waiting for value: ${label}`);
}

async function waitForTime(ms: number): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function setTextInputValue(
  input: HTMLInputElement,
  value: string,
): Promise<void> {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;

  valueSetter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  await waitForRender();
}

function createPayPalPlatformMock(
  optionTypes: PayPalPlatformTestOptionType[],
  overrides: Record<string, unknown> = {},
) {
  const eligibleFundingSources = new Set(
    optionTypes.flatMap((type) => {
      const eligibilityKey =
        PAYPAL_PLATFORM_ELIGIBILITY_KEY_BY_OPTION_TYPE[type];

      return eligibilityKey ? [eligibilityKey] : [];
    }),
  );

  const paypal: Record<string, unknown> = {
    findEligibleMethods: vi.fn(async () => ({
      isEligible: (fundingSource: string) =>
        eligibleFundingSources.has(fundingSource),
      getDetails: (fundingSource: string) => {
        if (fundingSource !== "googlepay") {
          return null;
        }

        return {
          config: {
            merchantInfo: {
              merchantId: "google-merchant-id",
            },
            allowedPaymentMethods: [
              {
                tokenizationSpecification: {
                  parameters: {
                    gateway: "paypal",
                    gatewayMerchantId: "google-merchant-id",
                  },
                },
              },
            ],
          },
        };
      },
    })),
  };

  for (const type of optionTypes) {
    const sessionCreator = PAYPAL_PLATFORM_SESSION_CREATOR_BY_OPTION_TYPE[type];

    if (!sessionCreator) {
      continue;
    }

    if (type === "new-card" || type === "apple-pay" || type === "google-pay") {
      // Production code only ever checks these three creators for existence
      // (see #hasPayPalSessionCreator in element.tsx) and never invokes them
      // directly, so a plain mock function is enough.
      paypal[sessionCreator] = vi.fn();
      continue;
    }

    // Every other type (paypal, paypal-pay-later, venmo, sepa, etc.) goes
    // through the "buttons" flow: #tokenizePayPalPlatformButtons in
    // element.tsx calls this creator directly and awaits the returned
    // session's start() call, which is expected to invoke the caller's
    // onApprove callback to resolve tokenization.
    paypal[sessionCreator] = vi.fn(
      (options: { onApprove: (data: { orderId?: string }) => unknown }) => ({
        start: async () => {
          await options.onApprove({ orderId: undefined });
        },
      }),
    );
  }

  return {
    ...paypal,
    ...overrides,
  };
}

function createAchApiState() {
  return {
    payment_gateways: [
      {
        type: "authorize_ach",
        fields: [
          "routing-number",
          "account-number",
          "account-type",
          "account-holder-name",
        ],
        account_types: ["checking", "savings"],
      },
    ],
  };
}

function createPurchaseOrderApiState() {
  return {
    payment_gateways: [
      {
        type: "purchase_order",
      },
    ],
  };
}

function createPayPalPlatformApiState() {
  return {
    use_separate_billing_address: false,
    billing_address: {
      first_name: "Taylor",
      last_name: "Morgan",
      company: "",
      address1: "123 Main Street",
      address2: "",
      city: "Minneapolis",
      region: "MN",
      postal_code: "55401",
      country: "US",
      phone: "6125550100",
    },
    totals: [{ total_order: 22.04 }],
    format: {
      currency_code: "USD",
      maximum_fraction_digits: 2,
      locale_code: "en-US",
    },
    payment_gateways: [
      {
        type: "paypal_platform",
        client_id: "paypal-client-id",
      },
    ],
  };
}

function createSvgLogoDataUri(text: string, fill: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="24" viewBox="0 0 80 24" fill="none"><rect width="80" height="24" rx="12" fill="${fill}"/><text x="40" y="15" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#111">${text}</text></svg>`)}`;
}

const KLARNA_PAY_IN_FOUR_LOGO = createSvgLogoDataUri("Pay in 4", "#ffb3c7");
const KLARNA_PAY_IN_30_DAYS_LOGO = createSvgLogoDataUri("30 days", "#ffd8e4");

function createKlarnaApiState() {
  return {
    customer: {
      email: "taylor@example.com",
    },
    use_separate_billing_address: true,
    billing_address: {
      first_name: "Taylor",
      last_name: "Morgan",
      company: "",
      address1: "123 Main Street",
      address2: "Suite 5",
      city: "Minneapolis",
      region: "MN",
      postal_code: "55401",
      country: "US",
      phone: "6125550100",
    },
    shipments: [
      {
        first_name: "Jordan",
        last_name: "Lee",
        company: "",
        address1: "987 Market Street",
        address2: "Apt 12",
        city: "Saint Paul",
        region: "MN",
        postal_code: "55102",
        country: "US",
        phone: "6515550100",
        country_options: ["US", "CA"],
        region_options: ["MN", "WI"],
      },
    ],
    payment_gateways: [
      {
        type: "klarna",
        session_id: "klarna-session-id",
        client_token: "klarna-client-token",
        payment_method_categories: [
          {
            identifier: "pay_in_4",
            name: "Pay in 4",
            asset_urls: {
              descriptive: KLARNA_PAY_IN_FOUR_LOGO,
              standard: KLARNA_PAY_IN_FOUR_LOGO,
            },
          },
          {
            identifier: "pay_in_30_days",
            name: "Pay in 30 Days",
            asset_urls: {
              descriptive: KLARNA_PAY_IN_30_DAYS_LOGO,
              standard: KLARNA_PAY_IN_30_DAYS_LOGO,
            },
          },
        ],
      },
    ],
  };
}

function createSezzleApiState() {
  return {
    payment_gateways: [
      {
        type: "sezzle",
      },
    ],
  };
}

function createAdyenEmbeddedApiState() {
  return {
    use_separate_billing_address: false,
    billing_address: {
      first_name: "Taylor",
      last_name: "Morgan",
      company: "",
      address1: "123 Main Street",
      address2: "",
      city: "Minneapolis",
      region: "MN",
      postal_code: "55401",
      country: "US",
      phone: "6125550100",
    },
    shipments: [
      {
        country_options: ["US", "NL", "BE", "PL"],
        region_options: ["MN", "WI"],
      },
    ],
    payment_gateways: [
      {
        type: "adyen_embedded",
        payment_methods_response: {
          paymentMethods: [{ type: "scheme", name: "Cards" }],
        },
        environment: "test",
        client_key: "adyen-client-key",
      },
    ],
  };
}

type AdyenComponentProps = Record<string, unknown> & {
  type?: string;
  onSubmit?: (state: unknown, component: unknown, actions: unknown) => void;
  onAdditionalDetails?: (state: unknown, component: unknown, actions: unknown) => void;
  onPaymentCompleted?: (result: unknown) => void;
  onPaymentFailed?: (result: unknown) => void;
  onError?: (error: unknown) => void;
  onSelect?: () => void;
};

type AdyenComponentInstance = {
  props: AdyenComponentProps;
  mount: ReturnType<typeof vi.fn>;
  unmount: ReturnType<typeof vi.fn>;
  isAvailable: ReturnType<typeof vi.fn>;
  submit: ReturnType<typeof vi.fn>;
  submitDetails: ReturnType<typeof vi.fn>;
};

function createAdyenComponentMock(params?: {
  available?: boolean;
  mountText?: string;
  result?: Record<string, unknown>;
  unmountError?: Error;
  submitData?: Record<string, unknown>;
}) {
  const instances: AdyenComponentInstance[] = [];
  const Component = vi.fn(function AdyenComponent(
    this: AdyenComponentInstance,
    _checkout: unknown,
    props?: AdyenComponentProps,
  ) {
    const componentProps = props ?? {};
    this.props = componentProps;
    this.mount = vi.fn((container: HTMLElement) => {
      container.textContent =
        params?.mountText ?? `Adyen ${componentProps.type}`;
    });
    this.unmount = vi.fn(() => {
      if (params?.unmountError) {
        throw params.unmountError;
      }
    });
    this.isAvailable = vi.fn(() =>
      params?.available === false ? Promise.reject() : Promise.resolve(),
    );
    const makeActions = (completionCallback: (response: unknown) => void) => ({
      resolve: (response: unknown) => {
        const resolved = response ?? params?.result ?? { resultCode: "Authorised" };
        // Only fire onPaymentCompleted when there is no pending action (e.g. 3DS).
        // When an action is present the Drop-in parks and waits for onAdditionalDetails.
        const hasAction =
          resolved !== null &&
          typeof resolved === "object" &&
          "action" in (resolved as Record<string, unknown>);
        if (!hasAction) {
          completionCallback(resolved);
        }
      },
      reject: () => {
        componentProps.onPaymentFailed?.({ resultCode: "Refused" });
      },
    });

    this.submit = vi.fn(() => {
      const state = { data: params?.submitData ?? { paymentMethod: { type: "scheme" } } };
      const actions = makeActions((response) => componentProps.onPaymentCompleted?.(response));
      componentProps.onSubmit?.(state, this, actions);
    });
    this.submitDetails = vi.fn(() => {
      const state = { data: {} };
      const actions = makeActions((response) => componentProps.onPaymentCompleted?.(response));
      componentProps.onAdditionalDetails?.(state, this, actions);
    });
    instances.push(this);
  });

  return { Component, instances };
}

function createMollieApiState() {
  return {
    payment_gateways: [
      {
        type: "mollie_omnipay",
      },
    ],
  };
}

const STRING_PROPERTY_MAPPINGS = (
  Object.entries(THEME_PROPERTY_TO_ATTRIBUTE) as [string, string][]
).map(([propertyName, attributeName]) => {
  return [propertyName, attributeName, `${attributeName}-value`] as const;
});

describe("PaymentMethodSelectorElement", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.documentElement.style.removeProperty("--font-sans");
  });

  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.style.removeProperty("--font-sans");
    vi.restoreAllMocks();
  });

  it.each(STRING_PROPERTY_MAPPINGS)(
    "reflects %s through %s",
    (propertyName, attributeName, value) => {
      const element = document.createElement(
        "foxy-payment-method-selector",
      ) as PaymentMethodSelectorElement;

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

  it("includes theme-* attributes in observedAttributes", () => {
    const observed = PaymentMethodSelectorElement.observedAttributes;

    expect(observed).toContain("lang");
    expect(observed).toContain("option-index");

    for (const attributeName of THEME_ATTRIBUTE_NAMES) {
      expect(observed).toContain(attributeName);
    }
  });

  it("maps theme attributes to host CSS variables", () => {
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    element.setAttribute("theme-background-surface", "#fafafa");
    element.setAttribute("theme-border-radius-sm", "0.75rem");

    expect(element.style.getPropertyValue("--background-surface")).toBe(
      "#fafafa",
    );
    expect(element.style.getPropertyValue("--border-radius-sm")).toBe(
      "0.75rem",
    );
  });

  it("removes host CSS variables when theme attributes are removed", () => {
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    element.setAttribute("theme-color-error", "#b91c1c");
    expect(element.style.getPropertyValue("--color-error")).toBe("#b91c1c");

    element.removeAttribute("theme-color-error");
    expect(element.style.getPropertyValue("--color-error")).toBe("");
  });

  it("ignores unknown theme-like attributes", () => {
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    element.setAttribute("theme-background-surface", "#fff");
    expect(element.style.getPropertyValue("--background-surface")).toBe(
      "#fff",
    );

    element.setAttribute("theme-unknown-token", "123");
    expect(element.style.getPropertyValue("--unknown-token")).toBe("");
    expect(element.style.getPropertyValue("--background-surface")).toBe(
      "#fff",
    );
  });

  it("uses CSS custom properties as default theme values", () => {
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;
    element.style.setProperty(
      "--font-body",
      "400 1rem/1.25 Figtree, sans-serif",
    );
    document.body.append(element);

    expect(element.themeFontBody).toBe("400 1rem/1.25 Figtree, sans-serif");
    expect(element.style.getPropertyValue("--font-body")).toBe(
      "400 1rem/1.25 Figtree, sans-serif",
    );
  });

  it("renders shadow DOM content styled from the theme-font-body token", async () => {
    const restoreClient = overrideClientState(createPurchaseOrderApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      element.setAttribute(
        "theme-font-body",
        "400 1rem/1.25 Figtree, sans-serif",
      );
      document.body.append(element);
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Purchase order number",
      );

      // The purchase-order number field renders through the design system's
      // Field.Control (via its `Input`), which is styled from
      // `theme.tokens.font.body` (see #buildThemeTokens() in element.tsx). If
      // the theme-font-body attribute is actually threaded through
      // StyleSheetManager/ThemeProvider into the rendered shadow DOM, this
      // input's computed font picks up "Figtree" instead of the design
      // system's default ("Albert Sans").
      const input = element.shadowRoot?.querySelector(
        '[data-purchase-order-number="true"]',
      ) as HTMLElement | null;

      expect(input).not.toBeNull();

      const computed = getComputedStyle(input!);
      expect(computed.fontFamily).toBe("Figtree, sans-serif");
      expect(computed.fontWeight).toBe("400");
      expect(computed.fontSize).toBe("16px");
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("omits savedPaymentMethodId from saved-card tokenization payload", async () => {
    const restoreClient = overrideClientState({
      saved_payment_methods: [
        {
          gateway: "stripe_v2",
          brand: "Visa",
          last_4: "4242",
          expiry_month: "12",
          expiry_year: "2030",
          id: "pm_saved_4242",
        },
      ],
    });

    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForText(() => element.shadowRoot?.textContent, "4242");

      const payload = await element.tokenize();

      expect(payload).toEqual({
        token: undefined,
        requestId: undefined,
        cardBrand: "Visa",
        last4: "4242",
        expirationMonth: 12,
        expirationYear: 2030,
      });
      expect(payload).not.toHaveProperty("savedPaymentMethodId");
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("skips disabled payment options when picking the default tokenization target", async () => {
    const globalWithApplePay = globalThis as typeof globalThis & {
      ApplePaySession?: { canMakePayments?: () => boolean };
    };
    const previousApplePaySession = globalWithApplePay.ApplePaySession;
    globalWithApplePay.ApplePaySession = {
      canMakePayments: () => true,
    };

    const restoreClient = overrideClientState({
      payment_gateways: [
        {
          type: "authorize",
          apple_pay: {
            merchant_id: "apple-merchant-id",
            disabled: true,
          },
          google_pay: {
            merchant_id: "google-merchant-id",
          },
        },
      ],
    });

    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;
    const onTokenizationStart = vi.fn();

    try {
      document.body.append(element);
      await waitForText(() => element.shadowRoot?.textContent, "Google Pay");

      element.addEventListener("tokenizationstart", onTokenizationStart);
      const payload = await element.tokenize();

      expect(payload).toEqual({});
      expect(onTokenizationStart).toHaveBeenCalledTimes(1);
      expect(onTokenizationStart.mock.calls[0]?.[0]?.detail).toEqual({
        optionIndex: 1,
      });
    } finally {
      if (previousApplePaySession) {
        globalWithApplePay.ApplePaySession = previousApplePaySession;
      } else {
        delete globalWithApplePay.ApplePaySession;
      }

      element.remove();
      restoreClient();
    }
  });

  it("renders Sezzle as a first-class option and returns Sezzle metadata from tokenize()", async () => {
    const restoreClient = overrideClientState(createSezzleApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      await waitForText(
        () => element.shadowRoot?.textContent,
        "Buy Now, Pay Later with Sezzle",
      );
      await waitForTruthy(
        () =>
          element.shadowRoot?.querySelector(
            '[data-payment-option-brand="sezzle"]',
          ),
        "Sezzle brand icon",
      );

      await expect(element.tokenize()).resolves.toEqual({
        requestId: expect.any(String),
      });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("renders Mollie as a branded button-driven option", async () => {
    const restoreClient = overrideClientState(createMollieApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      await waitForText(
        () => element.shadowRoot?.textContent,
        "Pay via Mollie",
      );
      const brandIcon = await waitForTruthy(
        () =>
          element.shadowRoot?.querySelector(
            '[data-payment-option-brand="mollie"]',
          ),
        "Mollie brand icon",
      );

      // The label row is full-bleed: the brand mark sits as far from the card's
      // right edge as the radio does from its left. Padding meant for the body
      // below must not push the mark inwards.
      const radio = element.shadowRoot?.querySelector(
        '[role="radio"]',
      ) as HTMLElement;
      const card = Array.from(
        element.shadowRoot?.querySelectorAll<HTMLElement>("*") ?? [],
      ).find(
        (node) =>
          node !== radio &&
          node.contains(radio) &&
          getComputedStyle(node).borderTopWidth !== "0px",
      ) as HTMLElement;
      const cardBox = card.getBoundingClientRect();

      expect(
        Math.round(cardBox.right - brandIcon.getBoundingClientRect().right),
      ).toBe(Math.round(radio.getBoundingClientRect().left - cardBox.left));

      // ...and it is centred on the label's first line: the mark is shorter than
      // the line box, so as a bare flex child it rode up against the top of it.
      const labelText = brandIcon.closest("label")?.children[0] as HTMLElement;
      const lineHeight = parseFloat(getComputedStyle(labelText).lineHeight);
      const markBox = brandIcon.getBoundingClientRect();
      const textBox = labelText.getBoundingClientRect();

      expect(
        Math.round(
          markBox.top + markBox.height / 2 - (textBox.top + lineHeight / 2),
        ),
      ).toBe(0);

      // Still the *first* line once the label wraps, rather than drifting to the
      // middle of the wrapped block.
      element.style.display = "block";
      element.style.width = "200px";
      await waitForRender();

      const wrappedText = brandIcon.closest("label")
        ?.children[0] as HTMLElement;
      const wrappedTextBox = wrappedText.getBoundingClientRect();
      const wrappedMarkBox = brandIcon.getBoundingClientRect();

      expect(wrappedTextBox.height).toBeGreaterThan(lineHeight);
      expect(
        Math.round(
          wrappedMarkBox.top +
            wrappedMarkBox.height / 2 -
            (wrappedTextBox.top + lineHeight / 2),
        ),
      ).toBe(0);
      element.style.removeProperty("width");
      element.style.removeProperty("display");

      await expect(element.tokenize()).resolves.toEqual({
        requestId: expect.any(String),
      });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("renders an unavailable state and rejects tokenization when no payment methods are available", async () => {
    const restoreClient = overrideClientState({ payment_gateways: [] });
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const status = element.shadowRoot?.querySelector('[role="status"]');
      await waitForText(
        () => status?.textContent,
        "No payment methods are currently available.",
      );
      await expect(element.tokenize()).rejects.toThrow(
        "No payment method is selected.",
      );
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("renders the uninitialized alert and rejects tokenization when checkout client state is missing", async () => {
    const restoreClient = overrideClientState(undefined);
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const status = element.shadowRoot?.querySelector('[role="alert"]');
      await waitForText(
        () => status?.textContent,
        "Loading payment options...",
      );

      await waitForTime(800);
      await waitForRender();

      const alert = element.shadowRoot?.querySelector('[role="alert"]');
      // The rendered alert copy is deliberately more explicit than the thrown
      // error asserted below ("Checkout client is not initialized.").
      await waitForText(
        () => alert?.textContent,
        "Checkout API client is not initialized.",
      );
      expect(alert?.getAttribute("role")).toBe("alert");
      await expect(element.tokenize()).rejects.toThrow(
        "Checkout client is not initialized.",
      );
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("mounts and cleans up stripe light DOM hosts when the selected option changes", async () => {
    // Force the "configuration is missing" branch deterministically: a
    // developer's local .env.local may define VITE_STRIPE_DEMO_PUBLISHABLE_KEY
    // as a fallback publishable key, which would otherwise make this test's
    // outcome depend on the machine it runs on.
    vi.stubEnv("VITE_STRIPE_PUBLISHABLE_KEY", "");
    vi.stubEnv("VITE_STRIPE_DEMO_PUBLISHABLE_KEY", "");

    const restoreClient = overrideClientState({
      payment_gateways: [
        {
          type: "stripe_connect",
          publishable_key: "",
        },
        {
          type: "purchase_order",
        },
      ],
    });
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const host = element.querySelector(
        '[data-foxy-stripe-host="stripe-card-element"]',
      );
      expect(host).toBeTruthy();

      // Regression guard: StripeCardElementOption calls useTheme() from
      // styled-components (directly, and via useStripeTokenAppearance). That
      // hook throws "Accessing 'useTheme' hook outside of a '<ThemeProvider>'
      // element" when the light-DOM React root it's mounted into (a separate
      // root from the shadow-DOM tree that owns the <ThemeProvider>) isn't
      // itself wrapped in one. When it throws, React unmounts the failed
      // render and the host div is left empty, so merely asserting the host
      // div exists (as above) does NOT catch the crash — asserting on
      // content the component only produces after a successful render does.
      await waitForText(
        () => host?.textContent,
        "Stripe configuration is missing for this payment option.",
      );

      element.optionIndex = 1;
      await waitForRender();

      expect(element.querySelector("[data-foxy-stripe-host]")).toBeNull();

      element.optionIndex = 0;
      await waitForRender();

      expect(element.querySelectorAll("[data-foxy-stripe-host]").length).toBe(
        1,
      );
    } finally {
      element.remove();
      restoreClient();
      vi.unstubAllEnvs();
    }
  });

  it("renders stripe payment element content without throwing outside a ThemeProvider", async () => {
    // Companion regression guard for StripePaymentElementOption, the sibling
    // light-DOM component rendered for the "stripe_v2" gateway. It also
    // calls useTheme() directly (and via useStripeTokenAppearance), and its
    // styled(...) layout component reads props.theme.tokens from styled-
    // components' theme context, both of which throw/crash without a
    // ThemeProvider ancestor in the light-DOM React root.
    vi.stubEnv("VITE_STRIPE_PUBLISHABLE_KEY", "");
    vi.stubEnv("VITE_STRIPE_DEMO_PUBLISHABLE_KEY", "");

    const restoreClient = overrideClientState({
      payment_gateways: [
        {
          type: "stripe_v2",
          publishable_key: "",
        },
        {
          type: "purchase_order",
        },
      ],
    });
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const host = element.querySelector("[data-foxy-stripe-host]");
      expect(host).toBeTruthy();

      await waitForText(
        () => host?.textContent,
        "Stripe Payment Element configuration is missing for this payment option.",
      );
    } finally {
      element.remove();
      restoreClient();
      vi.unstubAllEnvs();
    }
  });

  it("syncs UI selection changes back to the element option index", async () => {
    const restoreClient = overrideClientState({
      payment_gateways: [
        {
          type: "stripe_connect",
          publishable_key: "",
        },
        {
          type: "purchase_order",
        },
      ],
    });
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      expect(element.optionIndex).toBeUndefined();
      expect(
        element.querySelector('[data-foxy-stripe-host="stripe-card-element"]'),
      ).toBeTruthy();

      const secondOption = element.shadowRoot?.querySelector(
        "#payment-option-purchase-order-2",
      ) as HTMLElement | null;

      secondOption?.click();
      await waitForRender();

      expect(element.optionIndex).toBe(1);
      expect(element.querySelector("[data-foxy-stripe-host]")).toBeNull();

      const firstOption = element.shadowRoot?.querySelector(
        "#payment-option-stripe-card-element",
      ) as HTMLElement | null;

      firstOption?.click();
      await waitForRender();

      expect(element.optionIndex).toBe(0);
      expect(
        element.querySelector('[data-foxy-stripe-host="stripe-card-element"]'),
      ).toBeTruthy();
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("renders the ACH owner confirmation checkbox", async () => {
    const restoreClient = overrideClientState(createAchApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const checkbox = element.shadowRoot?.querySelector(
        '[data-ach-owner-confirmation="true"]',
      ) as HTMLElement | null;

      expect(checkbox).toBeTruthy();
      await waitForText(
        () => element.shadowRoot?.textContent,
        "I'm the owner of this account",
      );
    } finally {
      element.remove();
      restoreClient();
    }
  });

  // The hosted iframe inside is 36px; with content-box sizing the 2px border
  // added on top of the 40px min-height, so the field stood 4px taller than a
  // design system control with 4px of dead space under the iframe.
  it("renders ACH fields at the standard control height", async () => {
    const restoreClient = overrideClientState(createAchApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      const field = await waitForTruthy(
        () =>
          element.shadowRoot?.querySelector(
            "foxy-ach-field",
          ) as HTMLElement | null,
        "ACH field",
      );

      expect(getComputedStyle(field).boxSizing).toBe("border-box");
      expect(field.getBoundingClientRect().height).toBe(40);
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("rejects ACH tokenization until owner confirmation is checked", async () => {
    const restoreClient = overrideClientState(createAchApiState());
    const tokenize = vi.fn(() =>
      Promise.resolve({
        token: "ach_token_123",
        requestId: "ach-req-1",
        last4: "6789",
        routingNumber: "021000021",
        accountType: "checking" as const,
      }),
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;
    let tokenizeSpy: ReturnType<typeof vi.spyOn> | undefined;

    try {
      document.body.append(element);
      await waitForRender();

      const achFieldPrototype = customElements.get("foxy-ach-field")?.prototype;
      const tokenizeDescriptor = achFieldPrototype
        ? Object.getOwnPropertyDescriptor(achFieldPrototype, "tokenize")
        : undefined;

      if (!achFieldPrototype || !tokenizeDescriptor?.value) {
        throw new Error("Missing foxy-ach-field tokenize prototype for test.");
      }

      tokenizeSpy = vi
        .spyOn(achFieldPrototype, "tokenize")
        .mockImplementation(tokenize);

      await expect(element.tokenize()).rejects.toThrow(
        "Please confirm that you own this account.",
      );
      expect(tokenize).not.toHaveBeenCalled();
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Please confirm that you own this account.",
      );

      const checkbox = element.shadowRoot?.querySelector(
        '[data-ach-owner-confirmation="true"]',
      ) as HTMLElement | null;
      expect(checkbox).toBeTruthy();

      checkbox?.click();
      await waitForRender();

      const payload = await element.tokenize();

      expect(tokenize).toHaveBeenCalledTimes(1);
      expect(payload).toEqual({
        token: "ach_token_123",
        requestId: "ach-req-1",
        last4: "6789",
        routingNumber: "021000021",
        accountType: "checking",
      });
    } finally {
      tokenizeSpy?.mockRestore();
      element.remove();
      restoreClient();
    }
  });

  it("renders the purchase order number field", async () => {
    const restoreClient = overrideClientState(createPurchaseOrderApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const input = element.shadowRoot?.querySelector(
        '[data-purchase-order-number="true"]',
      ) as HTMLInputElement | null;

      expect(input).toBeTruthy();
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Purchase order number",
      );
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("rejects purchase-order tokenization when the field is empty", async () => {
    const restoreClient = overrideClientState(createPurchaseOrderApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      await expect(element.tokenize()).rejects.toThrow(
        "Purchase order number is required.",
      );
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Purchase order number is required.",
      );
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("rejects purchase-order tokenization when the field exceeds 32 characters", async () => {
    const restoreClient = overrideClientState(createPurchaseOrderApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const input = element.shadowRoot?.querySelector(
        '[data-purchase-order-number="true"]',
      ) as HTMLInputElement | null;

      expect(input).toBeTruthy();
      await setTextInputValue(input!, "P".repeat(33));

      await expect(element.tokenize()).rejects.toThrow(
        "Purchase order number must be 32 characters or less.",
      );
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Purchase order number must be 32 characters or less.",
      );
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("includes the purchase order number in the tokenization payload", async () => {
    const restoreClient = overrideClientState(createPurchaseOrderApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const input = element.shadowRoot?.querySelector(
        '[data-purchase-order-number="true"]',
      ) as HTMLInputElement | null;

      expect(input).toBeTruthy();
      await setTextInputValue(input!, "PO-123456");

      const payload = await element.tokenize();

      expect(payload).toEqual({
        requestId: expect.any(String),
        purchaseOrderNumber: "PO-123456",
      });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("renders paypal-platform payment options as first-class selector entries", async () => {
    const optionTypes: PayPalPlatformTestOptionType[] = [
      "paypal",
      "paypal-credit",
      "venmo",
      "sepa",
      "bancontact",
      "eps",
      "blik",
      "ideal",
      "przelewy24",
    ];
    const restoreClient = overrideClientState(
      createPayPalPlatformApiState(),
      undefined,
      {
        paypal: createPayPalPlatformMock(optionTypes),
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForText(() => element.shadowRoot?.textContent, "PayPal");

      const content = element.shadowRoot?.textContent ?? "";

      expect(content).toContain("PayPal");
      expect(content).toContain("PayPal Credit");
      expect(content).toContain("Venmo");
      expect(content).toContain("SEPA");
      expect(content).toContain("Bancontact");
      expect(content).toContain("EPS");
      expect(content).toContain("BLIK");
      expect(content).toContain("iDEAL");
      expect(content).toContain("Przelewy24");
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("renders card fields for paypal-platform new-card options", async () => {
    const restoreClient = overrideClientState(
      createPayPalPlatformApiState(),
      undefined,
      {
        paypal: createPayPalPlatformMock(["new-card"]),
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForText(() => element.shadowRoot?.textContent, "PayPal");
      element.optionIndex = 1;
      await waitForRender();

      const cardField = await waitForTruthy(
        () =>
          element.shadowRoot?.querySelector(
            "foxy-payment-card-field",
          ) as HTMLElement | null,
        "PayPal card field",
      );

      expect(cardField).toBeTruthy();
      expect((cardField as { mode?: string } | null)?.mode).toBe("card");
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("caps the security-code field at 20rem and leaves the full card field unconstrained", async () => {
    const restoreClient = overrideClientState({
      payment_gateways: [{ type: "authorize" }],
      saved_payment_methods: [
        {
          gateway: "authorize",
          brand: "Visa",
          last_4: "4242",
          expiry_month: "12",
          expiry_year: "2030",
          id: "pm_saved_4242",
        },
      ],
    });
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      const cscField = await waitForTruthy(
        () =>
          element.shadowRoot?.querySelector(
            'foxy-payment-card-field[mode="card_csc"]',
          ) as HTMLElement | null,
        "security code field",
      );

      expect(getComputedStyle(cscField).maxWidth).toBe("320px");
      expect(cscField.getBoundingClientRect().width).toBeLessThanOrEqual(320);

      // The full card field (number + expiry + CSC in one row) still fills its
      // container.
      element.optionIndex = 1;
      const fullField = await waitForTruthy(
        () =>
          element.shadowRoot?.querySelector(
            'foxy-payment-card-field:not([mode="card_csc"])',
          ) as HTMLElement | null,
        "full card field",
      );

      expect(getComputedStyle(fullField).maxWidth).toBe("none");
    } finally {
      element.remove();
      restoreClient();
    }
  });

  // Button-driven options are submitted from the order summary's own button, but
  // the selector no longer says so: no click-instruction copy and no click-hint
  // glyph for any of them.
  it("renders no click-instruction copy or click-hint glyph for button-driven payment options", async () => {
    const optionTypes: PayPalPlatformTestOptionType[] = [
      "paypal",
      "paypal-pay-later",
      "paypal-credit",
      "venmo",
      "sepa",
      "bancontact",
      "eps",
      "blik",
      "ideal",
      "przelewy24",
    ];
    const restoreClient = overrideClientState(
      createPayPalPlatformApiState(),
      undefined,
      {
        paypal: createPayPalPlatformMock(optionTypes),
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForText(() => element.shadowRoot?.textContent, "Przelewy24");

      const renderedOptions = Array.from(
        element.shadowRoot?.querySelectorAll('[id^="payment-option-"]') ?? [],
      );

      expect(renderedOptions.length).toBeGreaterThan(0);

      for (const [index] of renderedOptions.entries()) {
        element.optionIndex = index;
        await waitForRender();

        expect(
          element.shadowRoot?.querySelector(
            '[data-payment-option-click-hint="true"]',
          ),
        ).toBeNull();
        expect(element.shadowRoot?.textContent).not.toContain("order summary");
      }
    } finally {
      element.remove();
      restoreClient();
    }
  });

  // Every option uses the same layout — radio indicator plus bordered card —
  // no matter how many options there are, so a single option is not special-cased.
  it("renders the radio and bordered card layout for a single payment option", async () => {
    const restoreClient = overrideClientState(createSezzleApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      const radio = await waitForTruthy(
        () =>
          element.shadowRoot?.querySelector<HTMLElement>(
            '[id^="payment-option-"]',
          ),
        "payment option radio",
      );

      expect(
        element.shadowRoot?.querySelectorAll('[role="radio"]'),
      ).toHaveLength(1);

      // The bordered card wraps both the radio and its label.
      const borderedWrapper = Array.from(
        element.shadowRoot?.querySelectorAll<HTMLElement>("*") ?? [],
      ).find(
        (node) =>
          node !== radio &&
          node.contains(radio) &&
          getComputedStyle(node).borderTopWidth !== "0px",
      );

      expect(borderedWrapper?.textContent).toContain(
        "Buy Now, Pay Later with Sezzle",
      );
      // The border comes from the option's own card, not the surrounding fieldset.
      expect(borderedWrapper).not.toBe(radio.closest("fieldset"));
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("returns paypal-platform metadata for selected PayPal option flows", async () => {
    const restoreClient = overrideClientState(
      createPayPalPlatformApiState(),
      undefined,
      {
        paypal: createPayPalPlatformMock([
          "paypal",
          "new-card",
          "apple-pay",
          "google-pay",
          "paypal-pay-later",
        ]),
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    // The "new-card" option mounts a real <foxy-payment-card-field>, whose
    // tokenize() rejects until its hosted-fields iframe reports readiness --
    // an async, network-backed handshake this test isn't set up to drive.
    // Every other test here that tokenizes through that element stubs its
    // prototype method directly; the paypalPlatform metadata this test
    // checks never reads from the card field's resolved value anyway
    // (#createTokenizePayload only reads `orderId`, which cards don't have).
    const cardFieldPrototype = customElements.get(
      "foxy-payment-card-field",
    )?.prototype as { tokenize?: () => Promise<unknown> } | undefined;
    const tokenizeSpy = cardFieldPrototype
      ? vi
          .spyOn(cardFieldPrototype, "tokenize")
          .mockImplementation(() => Promise.resolve({ requestId: "card-req-1" }))
      : undefined;

    try {
      document.body.append(element);
      await waitForText(
        () => element.shadowRoot?.textContent,
        "PayPal Pay Later",
      );

      element.optionIndex = 0;
      await waitForRender();
      await expect(element.tokenize()).resolves.toEqual({
        paypalPlatform: {
          clientId: "paypal-client-id",
          flow: "buttons",
          fundingSources: ["paypal"],
        },
      });

      element.optionIndex = 1;
      await waitForRender();
      await expect(element.tokenize()).resolves.toEqual({
        paypalPlatform: {
          clientId: "paypal-client-id",
          flow: "card-fields",
          fundingSources: undefined,
        },
      });

      element.optionIndex = 2;
      await waitForRender();
      await expect(element.tokenize()).resolves.toEqual({
        paypalPlatform: {
          clientId: "paypal-client-id",
          flow: "apple-pay",
          fundingSources: undefined,
        },
      });

      element.optionIndex = 3;
      await waitForRender();
      await expect(element.tokenize()).resolves.toEqual({
        paypalPlatform: {
          clientId: "paypal-client-id",
          flow: "google-pay",
          fundingSources: undefined,
        },
      });

      element.optionIndex = 4;
      await waitForRender();
      await expect(element.tokenize()).resolves.toEqual({
        paypalPlatform: {
          clientId: "paypal-client-id",
          flow: "buttons",
          fundingSources: ["paylater"],
        },
      });
    } finally {
      tokenizeSpy?.mockRestore();
      element.remove();
      restoreClient();
    }
  });

  it("renders a single Adyen Drop-in entry from the gateway config", async () => {
    const { Component: Dropin } = createAdyenComponentMock({
      mountText: "Adyen drop-in",
    });
    const restoreClient = overrideClientState(
      createAdyenEmbeddedApiState(),
      undefined,
      {
        adyenEmbedded: {
          Dropin,
        },
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForTruthy(
        () => element.querySelector("[data-foxy-adyen-host]"),
        "Adyen light DOM host",
      );

      const content = element.shadowRoot?.textContent ?? "";
      expect(content).not.toContain("New Card");
      expect(content).not.toContain("iDEAL");
      await waitForTruthy(() => Dropin.mock.calls.length === 1, "Adyen Drop-in");
      expect(Dropin).toHaveBeenCalledTimes(1);
    } finally {
      element.remove();
      restoreClient();
    }
  });

  // The gateway config arrives in the API JSON before the Adyen SDK instance
  // finishes resolving, so the first mount can land while
  // `checkoutClient.adyenEmbedded` is still null. Sampling it once and giving up
  // leaves the shopper looking at the load-error message for the rest of the
  // session; the Drop-in has to appear when the SDK does.
  it("mounts the Adyen Drop-in once the SDK instance becomes available", async () => {
    const { Component: Dropin } = createAdyenComponentMock({
      mountText: "Adyen drop-in",
    });
    const restoreClient = overrideClientState(
      createAdyenEmbeddedApiState(),
      undefined,
      {
        adyenEmbedded: null,
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForTruthy(
        () => element.querySelector('[data-adyen-embedded-status="error"]'),
        "Adyen load error before the SDK resolves",
      );
      expect(Dropin).toHaveBeenCalledTimes(0);

      Object.defineProperty(checkoutClient, "adyenEmbedded", {
        configurable: true,
        value: { Dropin },
      });
      checkoutClient.dispatchEvent(new Event("update"));

      await waitForTruthy(
        () => Dropin.mock.calls.length === 1,
        "Adyen Drop-in after the SDK resolves",
      );
      expect(Dropin).toHaveBeenCalledTimes(1);
    } finally {
      element.remove();
      restoreClient();
    }
  });

  // A checkout state change the Adyen config does not depend on — a billing
  // address edit — still rebuilds the option list, and with it a fresh
  // `adyenEmbedded` config object. If the Drop-in's mount effect keys on that
  // object's identity it tears down and remounts, throwing away whatever the
  // shopper has already typed into the card fields.
  it("does not remount the Adyen Drop-in when unrelated checkout state changes", async () => {
    const { Component: Dropin } = createAdyenComponentMock({
      mountText: "Adyen drop-in",
    });
    const restoreClient = overrideClientState(
      createAdyenEmbeddedApiState(),
      undefined,
      {
        adyenEmbedded: {
          Dropin,
        },
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForTruthy(
        () => element.querySelector("[data-foxy-adyen-host]"),
        "Adyen light DOM host",
      );
      await waitForTruthy(() => Dropin.mock.calls.length === 1, "Adyen Drop-in");

      const nextApiState = createAdyenEmbeddedApiState();
      nextApiState.billing_address.city = "Saint Paul";
      Object.defineProperty(checkoutClient, "state", {
        configurable: true,
        value: nextApiState,
      });
      checkoutClient.dispatchEvent(new Event("update"));

      for (let attempt = 0; attempt < 5; attempt += 1) {
        await waitForRender();
      }

      expect(Dropin).toHaveBeenCalledTimes(1);
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("sanitizes customer-controlled theme-* attributes before injecting Adyen CSS into document.head", async () => {
    // Regression test for a CSS-injection vulnerability: `buildAdyenEmbeddedStyles`
    // used to interpolate `theme-*` attribute values (public, customer-controllable)
    // directly into CSS *source text* written to a <style> tag in document.head —
    // global page scope, not this element's shadow DOM. A value containing `}`
    // closes the current declaration/rule early and lets an attacker open a new
    // top-level rule (no `;` required), e.g. targeting `body` or exfiltrating via
    // `url(...)`. This proves that vector is now blocked and degrades to the
    // design system's default color instead of leaking the payload verbatim.
    const maliciousPayload = "red} body{display:none} .x{color:red";
    const { Component: Dropin } = createAdyenComponentMock({
      mountText: "Adyen drop-in",
    });
    const restoreClient = overrideClientState(
      createAdyenEmbeddedApiState(),
      undefined,
      { adyenEmbedded: { Dropin } },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      element.setAttribute("theme-color-body", maliciousPayload);
      document.body.append(element);
      await waitForTruthy(
        () => element.querySelector("[data-foxy-adyen-host]"),
        "Adyen light DOM host",
      );
      await waitForTruthy(() => Dropin.mock.calls.length === 1, "Adyen Drop-in");

      const style = document.head.querySelector(
        'style[data-foxy-adyen-embedded-styles="true"]',
      );
      const css = style?.textContent ?? "";

      expect(css).not.toBe("");
      expect(css).not.toContain(maliciousPayload);
      expect(css).not.toContain("body{display:none}");
      // Sanitize-or-default: an unsafe override falls back to the design
      // system's default color rather than dropping the declaration.
      expect(css).toContain("#1C1A1D");
    } finally {
      element.remove();
      restoreClient();
      document.head
        .querySelector('style[data-foxy-adyen-embedded-styles="true"]')
        ?.remove();
    }
  });

  it("blocks an image-set() payload in a customer-controlled theme-* attribute before injecting Adyen CSS into document.head", async () => {
    // Regression test for the residual CSS-injection bypass found in the
    // adversarial re-review of the fix above: `image-set(...)` (and
    // `-webkit-image-set(...)`) is a CSS image-valued function that accepts a
    // bare, non-`url(...)`-wrapped string URL and is valid wherever
    // `url(...)` is valid — including `buildAdyenEmbeddedStyles`'s
    // `background: ${colorPrimary}` sink (see adyen-embedded.tsx). The prior
    // fix blocked `url(`/`@import`/`expression(`/`;`/`{`/`}` but not this
    // equivalent vector, so a `theme-color-primary` payload built from it
    // used to survive sanitization and reach document.head verbatim, causing
    // Chromium to fetch an attacker-controlled-origin resource on render.
    const maliciousPayload = 'image-set("https://evil.example/x" 1x)';
    const { Component: Dropin } = createAdyenComponentMock({
      mountText: "Adyen drop-in",
    });
    const restoreClient = overrideClientState(
      createAdyenEmbeddedApiState(),
      undefined,
      { adyenEmbedded: { Dropin } },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      element.setAttribute("theme-color-primary", maliciousPayload);
      document.body.append(element);
      await waitForTruthy(
        () => element.querySelector("[data-foxy-adyen-host]"),
        "Adyen light DOM host",
      );
      await waitForTruthy(() => Dropin.mock.calls.length === 1, "Adyen Drop-in");

      const style = document.head.querySelector(
        'style[data-foxy-adyen-embedded-styles="true"]',
      );
      const css = style?.textContent ?? "";

      expect(css).not.toBe("");
      expect(css).not.toContain(maliciousPayload);
      expect(css).not.toContain("image-set(");
      expect(css).not.toContain("evil.example");
      // Sanitize-or-default: an unsafe override falls back to the design
      // system's default color rather than dropping the declaration.
      expect(css).toContain(defaultTheme.color.primary);
    } finally {
      element.remove();
      restoreClient();
      document.head
        .querySelector('style[data-foxy-adyen-embedded-styles="true"]')
        ?.remove();
    }
  });

  it("renders Adyen Drop-in outside RadioGroup when it is the only option", async () => {
    const { Component: Dropin } = createAdyenComponentMock();
    const restoreClient = overrideClientState(
      createAdyenEmbeddedApiState(),
      undefined,
      { adyenEmbedded: { Dropin } },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForTruthy(
        () => element.querySelector("[data-foxy-adyen-host]"),
        "Adyen light DOM host",
      );

      // No native radio items — Adyen-only configuration renders no RadioGroup items
      expect(
        element.shadowRoot?.querySelectorAll('[role="radio"]').length,
      ).toBe(0);
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("keeps Adyen Drop-in mounted when a native option is selected", async () => {
    const { Component: Dropin, instances } = createAdyenComponentMock({
      mountText: "Adyen drop-in",
    });
    const restoreClient = overrideClientState(
      {
        ...createAdyenEmbeddedApiState(),
        payment_gateways: [
          { type: "authorize" },
          {
            type: "adyen_embedded",
            payment_methods_response: { paymentMethods: [{ type: "scheme", name: "Cards" }] },
            environment: "test",
            client_key: "adyen-client-key",
          },
        ],
      },
      undefined,
      { adyenEmbedded: { Dropin } },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      const host = await waitForTruthy(
        () => element.querySelector("[data-foxy-adyen-host]"),
        "Adyen light DOM host",
      );
      await waitForText(() => host.textContent, "Adyen drop-in");

      // Select native option by index (index 0 = authorize/new-card)
      element.optionIndex = 0;
      await waitForRender();

      // Drop-in stays mounted — unmount not called
      expect(instances[0]?.unmount).not.toHaveBeenCalled();
      expect(element.querySelector("[data-foxy-adyen-host]")).not.toBeNull();
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("clears native radio selection when Adyen Drop-in's onSelect fires", async () => {
    const { Component: Dropin, instances } = createAdyenComponentMock({
      mountText: "Adyen drop-in",
    });
    const restoreClient = overrideClientState(
      {
        ...createAdyenEmbeddedApiState(),
        payment_gateways: [
          { type: "authorize" },
          {
            type: "adyen_embedded",
            payment_methods_response: { paymentMethods: [{ type: "scheme", name: "Cards" }] },
            environment: "test",
            client_key: "adyen-client-key",
          },
        ],
      },
      undefined,
      { adyenEmbedded: { Dropin } },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      const host = await waitForTruthy(
        () => element.querySelector("[data-foxy-adyen-host]") as HTMLElement | null,
        "Adyen light DOM host",
      );
      await waitForText(() => host.textContent, "Adyen drop-in");
      await waitForTruthy(
        () => element.shadowRoot?.querySelector('[role="radio"][aria-checked="true"]'),
        "checked native radio",
      );

      // Initially the native radio is checked
      expect(
        element.shadowRoot?.querySelector('[role="radio"][aria-checked="true"]'),
      ).not.toBeNull();

      // Simulate user selecting a method inside the Drop-in
      instances[0]?.props.onSelect?.();
      await waitForRender();

      // No native radio should remain checked
      expect(
        element.shadowRoot?.querySelector('[role="radio"][aria-checked="true"]'),
      ).toBeNull();
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("mounts Adyen Drop-in in light DOM and cleans it up on removal", async () => {
    const { Component: Dropin, instances } = createAdyenComponentMock({
      mountText: "Adyen drop-in",
    });
    const restoreClient = overrideClientState(
      createAdyenEmbeddedApiState(),
      undefined,
      {
        adyenEmbedded: {
          Dropin,
        },
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      const host = await waitForTruthy(
        () => element.querySelector("[data-foxy-adyen-host]"),
        "Adyen light DOM host",
      );

      await waitForText(() => host.textContent, "Adyen drop-in");

      expect(host.textContent).toContain("Adyen drop-in");
      expect(instances[0]?.props).toMatchObject({
        showRadioButton: true,
        disableFinalAnimation: true,
        onSelect: expect.any(Function),
      });

      element.remove();
      await waitForRender();
      expect(element.querySelector("[data-foxy-adyen-host]")).toBeNull();
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("continues remounting Adyen Drop-in when provider unmount throws", async () => {
    const { Component: Dropin, instances } = createAdyenComponentMock({
      mountText: "Adyen drop-in",
      unmountError: new Error("Provider cleanup failed"),
    });
    const restoreClient = overrideClientState(
      {
        ...createAdyenEmbeddedApiState(),
        payment_gateways: [
          {
            type: "adyen_embedded",
            payment_methods_response: { paymentMethods: [{ type: "scheme", name: "Cards" }] },
            environment: "test",
            client_key: "adyen-client-key-1",
          },
          {
            type: "adyen_embedded",
            payment_methods_response: { paymentMethods: [{ type: "scheme", name: "Cards" }] },
            environment: "test",
            client_key: "adyen-client-key-2",
          },
        ],
      },
      undefined,
      {
        adyenEmbedded: {
          Dropin,
        },
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForText(() => element.textContent, "Adyen drop-in");

      element.optionIndex = 1;
      await waitForRender();

      expect(instances[0]?.unmount).toHaveBeenCalledTimes(1);
      expect(
        element.querySelector("[data-foxy-adyen-host]")?.textContent,
      ).toContain("Adyen drop-in");
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("returns the Adyen payment result from tokenize()", async () => {
    const adyenResult = { resultCode: "Authorised", pspReference: "PSP123" };
    const submitAdyenEmbeddedPayment = vi.fn().mockResolvedValue(adyenResult);
    const { Component: Dropin } = createAdyenComponentMock({ result: adyenResult });
    const restoreClient = overrideClientState(
      createAdyenEmbeddedApiState(),
      undefined,
      {
        adyenEmbedded: { Dropin },
        submitAdyenEmbeddedPayment,
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForTruthy(
        () => element.querySelector("[data-foxy-adyen-host]"),
        "Adyen light DOM host",
      );

      await expect(element.tokenize()).resolves.toEqual({
        adyenEmbedded: {
          result: adyenResult,
        },
      });
      expect(submitAdyenEmbeddedPayment).toHaveBeenCalledOnce();
      expect(submitAdyenEmbeddedPayment).toHaveBeenCalledWith({ paymentMethod: { type: "scheme" } });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("rejects tokenize() when submitAdyenEmbeddedPayment throws", async () => {
    const paymentError = new Error("Backend unavailable");
    const submitAdyenEmbeddedPayment = vi.fn().mockRejectedValue(paymentError);
    const { Component: Dropin } = createAdyenComponentMock();
    const restoreClient = overrideClientState(
      createAdyenEmbeddedApiState(),
      undefined,
      {
        adyenEmbedded: { Dropin },
        submitAdyenEmbeddedPayment,
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForTruthy(
        () => element.querySelector("[data-foxy-adyen-host]"),
        "Adyen light DOM host",
      );

      await expect(element.tokenize()).rejects.toThrow();
      expect(submitAdyenEmbeddedPayment).toHaveBeenCalledOnce();
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("calls submitAdyenEmbeddedPaymentDetails from onAdditionalDetails", async () => {
    const detailsResult = { resultCode: "Authorised", pspReference: "PSP-3DS" };
    const submitAdyenEmbeddedPaymentDetails = vi.fn().mockResolvedValue(detailsResult);
    // Return a response with an action to simulate a 3DS redirect; the mock
    // will not fire onPaymentCompleted for this response and will instead
    // wait for submitDetails() → onAdditionalDetails to complete the flow.
    const submitAdyenEmbeddedPayment = vi.fn().mockResolvedValue({
      resultCode: "Pending",
      action: { type: "threeDS2" },
    });
    const { Component: Dropin, instances } = createAdyenComponentMock();
    const restoreClient = overrideClientState(
      createAdyenEmbeddedApiState(),
      undefined,
      {
        adyenEmbedded: { Dropin },
        submitAdyenEmbeddedPayment,
        submitAdyenEmbeddedPaymentDetails,
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForTruthy(
        () => element.querySelector("[data-foxy-adyen-host]"),
        "Adyen light DOM host",
      );

      // Start tokenize — it won't resolve until onPaymentCompleted fires.
      // The initial submit returns a 3DS action so the Drop-in parks here.
      const tokenizePromise = element.tokenize();

      // Allow the initial submit to complete (submitAdyenEmbeddedPayment resolves).
      await waitForRender();

      // Simulate the 3DS additional-details step.
      await (instances[0]?.submitDetails as (() => unknown) | undefined)?.();

      // Verify submitAdyenEmbeddedPaymentDetails was called.
      expect(submitAdyenEmbeddedPaymentDetails).toHaveBeenCalledOnce();

      // tokenize() should now resolve with the details result.
      await expect(tokenizePromise).resolves.toEqual({
        adyenEmbedded: {
          result: detailsResult,
        },
      });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("flattens Klarna categories into separate selector entries with API logos", async () => {
    const load = vi.fn(
      (
        options: {
          container: HTMLElement | string;
          payment_method_category?: string;
        },
        _data: Record<string, unknown>,
        callback: (result: { show_form: boolean }) => void,
      ) => {
        if (options.container instanceof HTMLElement) {
          options.container.textContent = `Klarna widget ${options.payment_method_category ?? "unknown"}`;
        }

        callback({ show_form: true });
      },
    );
    const restoreClient = overrideClientState(
      createKlarnaApiState(),
      undefined,
      {
        klarna: {
          Payments: {
            load,
            authorize: vi.fn(),
            finalize: vi.fn(),
            on: vi.fn(),
            off: vi.fn(),
          },
        },
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      await waitForText(() => element.shadowRoot?.textContent, "Pay in 4");
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Pay in 30 Days",
      );
      // The Klarna widget is mounted via a lazy()/Suspense chunk; on this
      // machine the first-load commit lands around ~300ms (~10 render-tick
      // iterations), which is right at this helper's default budget. Widen
      // just this call so the test isn't racing chunk-load latency.
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Klarna widget pay_in_4",
        60,
      );

      const images = Array.from(
        element.shadowRoot?.querySelectorAll("img") ?? [],
      ).map((image) => image.getAttribute("src"));

      expect(images).toContain(KLARNA_PAY_IN_FOUR_LOGO);
      expect(images).toContain(KLARNA_PAY_IN_30_DAYS_LOGO);
      expect(load).toHaveBeenCalledTimes(1);
      expect(load.mock.calls[0]?.[0]).toMatchObject({
        payment_method_category: "pay_in_4",
      });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("authorizes the selected Klarna category during tokenization", async () => {
    const load = vi.fn(
      (
        options: {
          container: HTMLElement | string;
          payment_method_category?: string;
        },
        _data: Record<string, unknown>,
        callback: (result: { show_form: boolean }) => void,
      ) => {
        if (options.container instanceof HTMLElement) {
          options.container.textContent = `Klarna widget ${options.payment_method_category ?? "unknown"}`;
        }

        callback({ show_form: true });
      },
    );
    const authorize = vi.fn(
      (
        _options: { payment_method_category?: string },
        _data: Record<string, unknown>,
        callback: (result: {
          approved: boolean;
          show_form: boolean;
          finalize_required?: boolean;
        }) => void,
      ) => {
        callback({
          approved: true,
          show_form: true,
          finalize_required: true,
        });
      },
    );
    const finalize = vi.fn(
      (
        _options: { payment_method_category?: string },
        _data: Record<string, unknown>,
        callback: (result: {
          approved: boolean;
          show_form: boolean;
          authorization_token?: string;
        }) => void,
      ) => {
        callback({
          approved: true,
          show_form: true,
          authorization_token: "klarna-final-token",
        });
      },
    );
    const restoreClient = overrideClientState(
      createKlarnaApiState(),
      undefined,
      {
        klarna: {
          Payments: {
            load,
            authorize,
            finalize,
            on: vi.fn(),
            off: vi.fn(),
          },
        },
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      // The Klarna widget arrives through a lazy()/Suspense chunk, so each
      // load() lands a few hundred ms after the render that triggers it. Wait
      // for the call itself instead of a fixed number of render ticks —
      // otherwise this test only passes when a neighbouring test happens to
      // have warmed the chunk first (see the test above).
      await waitForTruthy(
        () => load.mock.calls.length >= 1 || null,
        "initial Klarna widget load",
      );

      element.optionIndex = 1;
      await waitForTruthy(
        () => load.mock.calls.length >= 2 || null,
        "Klarna widget load for the newly selected category",
      );

      const payload = await element.tokenize();
      const authorizeData = authorize.mock.calls[0]?.[1] as
        | Record<string, unknown>
        | undefined;

      expect(load).toHaveBeenCalledTimes(2);
      expect(load.mock.calls[1]?.[0]).toMatchObject({
        payment_method_category: "pay_in_30_days",
      });
      expect(authorize.mock.calls[0]?.[0]).toMatchObject({
        payment_method_category: "pay_in_30_days",
      });
      expect(authorizeData).toMatchObject({
        billing_address: expect.objectContaining({
          given_name: "Taylor",
          family_name: "Morgan",
          email: "taylor@example.com",
          street_address: "123 Main Street",
        }),
        shipping_address: expect.objectContaining({
          given_name: "Jordan",
          family_name: "Lee",
          street_address: "987 Market Street",
        }),
      });
      expect(finalize).toHaveBeenCalledTimes(1);
      expect(payload).toEqual({
        authorizationToken: "klarna-final-token",
        sessionId: "klarna-session-id",
        paymentMethodCategory: "pay_in_30_days",
      });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("shows an unavailable Klarna state when load pre-assessment fails", async () => {
    const load = vi.fn(
      (
        _options: {
          container: HTMLElement | string;
          payment_method_category?: string;
        },
        _data: Record<string, unknown>,
        callback: (result: { show_form: boolean }) => void,
      ) => {
        callback({ show_form: false });
      },
    );
    const restoreClient = overrideClientState(
      createKlarnaApiState(),
      undefined,
      {
        klarna: {
          Payments: {
            load,
            authorize: vi.fn(),
            finalize: vi.fn(),
            on: vi.fn(),
            off: vi.fn(),
          },
        },
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      await waitForText(
        () => element.shadowRoot?.textContent,
        "This Klarna option is currently unavailable.",
      );
      await expect(element.tokenize()).rejects.toThrow(
        "This Klarna option is currently unavailable.",
      );
    } finally {
      element.remove();
      restoreClient();
    }
  });

  describe("stripe_v2 confirm_intent flow", () => {
    // The Payment Element itself needs a real publishable key to mount, so
    // these drive the element through its controller seam instead: the same
    // one StripePaymentField registers on ready.
    async function mountStripeV2Selector(
      controller: Partial<{
        tokenize: () => Promise<Record<string, unknown>>;
        confirm: (params: { clientSecret: string }) => Promise<void>;
      }> | null,
      apiStateOverrides: Record<string, unknown> = {},
    ) {
      vi.stubEnv("VITE_STRIPE_PUBLISHABLE_KEY", "");
      vi.stubEnv("VITE_STRIPE_DEMO_PUBLISHABLE_KEY", "");

      const restoreClient = overrideClientState({
        customer: { email: "taylor@example.com", type: "guest" },
        totals: [{ total_order: 22.04 }],
        format: { currency_code: "USD", maximum_fraction_digits: 2 },
        payment_gateways: [{ type: "stripe_v2", publishable_key: "" }],
        ...apiStateOverrides,
      });

      const element = document.createElement(
        "foxy-payment-method-selector",
      ) as PaymentMethodSelectorElement;

      document.body.append(element);
      await waitForRender();

      element.optionIndex = 0;
      await waitForRender();

      if (controller) {
        element.setPaymentController("stripe-payment-element", {
          tokenize: controller.tokenize ?? (async () => ({ ready: true })),
          ...(controller.confirm ? { confirm: controller.confirm } : {}),
        });
      }

      return {
        element,
        cleanup: () => {
          element.remove();
          restoreClient();
          vi.unstubAllEnvs();
        },
      };
    }

    it("mounts deferred, with the intent's capture and card-saving settings mirrored", async () => {
      // Stripe compares these against the PaymentIntent it is asked to confirm:
      // an auth-only gateway creates a manual-capture intent, and the backend
      // attaches a Stripe customer for anyone not checking out as a guest.
      const { element, cleanup } = await mountStripeV2Selector(null, {
        customer: { email: "taylor@example.com", type: "registered" },
        payment_gateways: [
          { type: "stripe_v2", publishable_key: "", auth_only: true },
        ],
      });

      try {
        const options = element.selectedOption?.stripePaymentElement
          ?.paymentElementOptions as Record<string, unknown>;

        expect(options).toMatchObject({
          mode: "payment",
          amount: 2204,
          currency: "usd",
          captureMethod: "manual",
          setupFutureUsage: "off_session",
        });
        // No pre-created intent to mount against on this path.
        expect(options.clientSecret).toBeUndefined();
      } finally {
        cleanup();
      }
    });

    it("sizes the amount by the currency, not by how the store displays prices", async () => {
      // The backend converts with the locale's frac_digits, so a zero-decimal
      // currency has to come out as 2204 and not 220400 — an amount that
      // disagrees with the intent's cannot be confirmed.
      const { element, cleanup } = await mountStripeV2Selector(null, {
        totals: [{ total_order: 2204 }],
        format: { currency_code: "JPY", maximum_fraction_digits: 2 },
      });

      try {
        expect(
          element.selectedOption?.stripePaymentElement?.paymentElementOptions,
        ).toMatchObject({ amount: 2204, currency: "jpy" });
      } finally {
        cleanup();
      }
    });

    it("keeps the amount intact for a store that hides decimals", async () => {
      // `maximum_fraction_digits` drops to 0 for those stores, which would bill
      // $22.04 as 22 minor units.
      const { element, cleanup } = await mountStripeV2Selector(null, {
        format: { currency_code: "USD", maximum_fraction_digits: 0 },
      });

      try {
        expect(
          element.selectedOption?.stripePaymentElement?.paymentElementOptions,
        ).toMatchObject({ amount: 2204, currency: "usd" });
      } finally {
        cleanup();
      }
    });

    it("omits card saving for a guest, matching what the backend asks Stripe for", async () => {
      const { element, cleanup } = await mountStripeV2Selector(null);

      try {
        const options = element.selectedOption?.stripePaymentElement
          ?.paymentElementOptions as Record<string, unknown>;

        expect(options.setupFutureUsage).toBeUndefined();
        expect(options.captureMethod).toBeUndefined();
      } finally {
        cleanup();
      }
    });

    it("tokenizes to a request id only — the card is never turned into a token", async () => {
      const tokenize = vi.fn(async () => ({ ready: true }));
      const { element, cleanup } = await mountStripeV2Selector({ tokenize });

      try {
        const payload = await element.tokenize();

        expect(tokenize).toHaveBeenCalledTimes(1);
        expect(Object.keys(payload)).toEqual(["requestId"]);
      } finally {
        cleanup();
      }
    });

    it("refuses to submit when the Payment Element never validated the details", async () => {
      // Without this the submission would look like every other stripe_v2 one,
      // and the backend would create a PaymentIntent that nothing on the page
      // can confirm — leaving the transaction locked.
      const { element, cleanup } = await mountStripeV2Selector({
        tokenize: async () => ({}),
      });

      try {
        await expect(element.tokenize()).rejects.toThrow(
          "Stripe Payment Element is not ready yet.",
        );
      } finally {
        cleanup();
      }
    });

    it("confirms a confirm_intent next action with the mounted payment method", async () => {
      const confirm = vi.fn(async () => undefined);
      const { element, cleanup } = await mountStripeV2Selector({ confirm });

      try {
        await element.handleNextAction({
          type: "confirm_intent",
          gateway: "stripe_v2",
          params: { client_secret: "pi_123_secret_abc" },
        });

        expect(confirm).toHaveBeenCalledWith({
          clientSecret: "pi_123_secret_abc",
        });
      } finally {
        cleanup();
      }
    });

    it("rejects a next action of an unsupported type", async () => {
      const confirm = vi.fn(async () => undefined);
      const { element, cleanup } = await mountStripeV2Selector({ confirm });

      try {
        await expect(
          element.handleNextAction({
            type: "three_ds_challenge",
            gateway: "stripe_v2",
            params: { client_secret: "pi_123_secret_abc" },
          }),
        ).rejects.toThrow("Unsupported checkout next action");
        expect(confirm).not.toHaveBeenCalled();
      } finally {
        cleanup();
      }
    });

    it("rejects a confirm_intent next action with no client secret", async () => {
      const confirm = vi.fn(async () => undefined);
      const { element, cleanup } = await mountStripeV2Selector({ confirm });

      try {
        await expect(
          element.handleNextAction({
            type: "confirm_intent",
            gateway: "stripe_v2",
            params: {},
          }),
        ).rejects.toThrow("missing a client secret");
        expect(confirm).not.toHaveBeenCalled();
      } finally {
        cleanup();
      }
    });

    it("rejects when the selected payment method cannot confirm", async () => {
      const { element, cleanup } = await mountStripeV2Selector({});

      try {
        await expect(
          element.handleNextAction({
            type: "confirm_intent",
            gateway: "stripe_v2",
            params: { client_secret: "pi_123_secret_abc" },
          }),
        ).rejects.toThrow("cannot complete this confirmation step");
      } finally {
        cleanup();
      }
    });
  });
});

describe("toBcp47Locale", () => {
  it("converts a POSIX-form locale code to BCP 47 form", () => {
    expect(toBcp47Locale("en_US")).toBe("en-US");
  });

  it("leaves an already-BCP-47 locale code unchanged", () => {
    expect(toBcp47Locale("en-US")).toBe("en-US");
  });
});
