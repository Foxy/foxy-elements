import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import {
  THEME_ATTRIBUTE_NAMES,
  THEME_PROPERTY_TO_ATTRIBUTE,
} from "@/lib/theme-mixin";

import { PaymentMethodSelectorElement } from "./element";

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
        delete (checkoutClient as Record<string, unknown>)[key];
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
): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
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
  for (let attempt = 0; attempt < 10; attempt += 1) {
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

    if (sessionCreator) {
      paypal[sessionCreator] = vi.fn();
    }
  }

  return {
    ...paypal,
    ...overrides,
  };
}

function createBillingApiState() {
  return {
    billing_address: {
      use_customer_shipping_address: true,
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
        country_options: ["US", "CA"],
        region_options: ["MN", "WI"],
      },
    ],
    payment_gateways: [{ type: "authorize" }],
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
    billing_address: {
      use_customer_shipping_address: true,
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
    billing_address: {
      use_customer_shipping_address: false,
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
        public_key: "sezzle-public-key",
      },
    ],
  };
}

function createAdyenEmbeddedApiState() {
  return {
    billing_address: {
      use_customer_shipping_address: true,
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
        session_data: "adyen-session-data",
        environment: "test",
        client_key: "adyen-client-key",
      },
    ],
  };
}

type AdyenComponentProps = Record<string, unknown> & {
  type?: string;
  onPaymentCompleted?: (result: unknown) => void;
  onPaymentFailed?: (result: unknown) => void;
};

type AdyenComponentInstance = {
  props: AdyenComponentProps;
  mount: ReturnType<typeof vi.fn>;
  unmount: ReturnType<typeof vi.fn>;
  isAvailable: ReturnType<typeof vi.fn>;
  submit: ReturnType<typeof vi.fn>;
};

function createAdyenComponentMock(params?: {
  available?: boolean;
  mountText?: string;
  result?: Record<string, unknown>;
  unmountError?: Error;
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
    this.submit = vi.fn(() => {
      componentProps.onPaymentCompleted?.(
        params?.result ?? {
          resultCode: "Authorised",
          sessionData: "next-session-data",
        },
      );
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

    element.setAttribute("theme-background", "#fafafa");
    element.setAttribute("theme-radius", "0.75rem");

    expect(element.style.getPropertyValue("--background")).toBe("#fafafa");
    expect(element.style.getPropertyValue("--radius")).toBe("0.75rem");
  });

  it("removes host CSS variables when theme attributes are removed", () => {
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    element.setAttribute("theme-input-padding", "8px 12px");
    expect(element.style.getPropertyValue("--input-padding")).toBe("8px 12px");

    element.removeAttribute("theme-input-padding");
    expect(element.style.getPropertyValue("--input-padding")).toBe("");
  });

  it("ignores unknown theme-like attributes", () => {
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    element.setAttribute("theme-background", "#fff");
    expect(element.style.getPropertyValue("--background")).toBe("#fff");

    element.setAttribute("theme-unknown-token", "123");
    expect(element.style.getPropertyValue("--unknown-token")).toBe("");
    expect(element.style.getPropertyValue("--background")).toBe("#fff");
  });

  it("uses CSS custom properties as default theme values", () => {
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;
    element.style.setProperty("--font-sans", "Figtree");
    document.body.append(element);

    expect(element.themeFontSans).toBe("Figtree");
    expect(element.style.getPropertyValue("--font-sans")).toBe("Figtree");
  });

  it("binds internal content and probes to --font-sans", async () => {
    const restoreClient = overrideClientState(createBillingApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      element.setAttribute("theme-font-sans", "Figtree");
      document.body.append(element);
      await waitForText(() => element.shadowRoot?.textContent, "New Card");

      const shadowContainer = element.shadowRoot
        ?.children[1] as HTMLDivElement | null;
      const probe = element.shadowRoot?.querySelector(
        '[data-foxy-field-style-probe="true"]',
      ) as HTMLInputElement | null;

      expect(element.style.getPropertyValue("--font-sans")).toBe("Figtree");
      expect(shadowContainer?.style.fontFamily).toBe("var(--font-sans)");
      expect(probe?.style.fontFamily).toBe("var(--font-sans)");
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
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Click the Sezzle button under the order summary to submit your order.",
      );

      await waitForTruthy(
        () =>
          element.shadowRoot?.querySelector(
            '[data-payment-option-brand="sezzle"]',
          ),
        "Sezzle brand icon",
      );
      expect(
        element.shadowRoot?.querySelector(
          '[data-payment-option-click-hint="true"]',
        ),
      ).toBeTruthy();

      await expect(element.tokenize()).resolves.toEqual({
        sezzle: {
          publicKey: "sezzle-public-key",
        },
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
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Click the Submit button under the order summary to submit your order",
      );

      await waitForTruthy(
        () =>
          element.shadowRoot?.querySelector(
            '[data-payment-option-brand="mollie"]',
          ),
        "Mollie brand icon",
      );
      expect(
        element.shadowRoot?.querySelector('[style*="column-gap"]'),
      ).toBeTruthy();
      expect(
        element.shadowRoot?.querySelector(
          '[data-payment-option-click-hint="true"]',
        ),
      ).toBeTruthy();

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

      const status = element.shadowRoot?.querySelector('[data-slot="alert"]');
      await waitForText(
        () => status?.textContent,
        "Loading payment options...",
      );

      await waitForTime(800);
      await waitForRender();

      const alert = element.shadowRoot?.querySelector('[data-slot="alert"]');
      await waitForText(
        () => alert?.textContent,
        "Checkout client is not initialized.",
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

      expect(
        element.querySelector('[data-foxy-stripe-host="stripe-card-element"]'),
      ).toBeTruthy();

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

  it("syncs billing-address changes through the checkout client", async () => {
    const updateBillingAddress = vi.fn(() => Promise.resolve());
    const restoreClient = overrideClientState(
      createBillingApiState(),
      undefined,
      {
        updateBillingAddress,
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const checkbox = element.shadowRoot?.querySelector(
        '[data-slot="checkbox"]',
      ) as HTMLElement | null;
      expect(checkbox).toBeTruthy();

      checkbox?.click();
      await waitForRender();

      expect(updateBillingAddress).toHaveBeenCalledWith({
        use_customer_shipping_address: false,
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
      });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("does not include billing address in the tokenization payload", async () => {
    const updateBillingAddress = vi.fn(() => Promise.resolve());
    const restoreClient = overrideClientState(
      createBillingApiState(),
      undefined,
      {
        updateBillingAddress,
      },
    );
    const tokenize = vi.fn(() =>
      Promise.resolve({
        token: "card_token_123",
        requestId: "card-req-1",
        cardBrand: "visa",
        last4: "4242",
        expirationMonth: 12,
        expirationYear: 2030,
      }),
    );
    const cardFieldPrototype = customElements.get(
      "foxy-payment-card-field",
    )?.prototype;
    const tokenizeDescriptor = cardFieldPrototype
      ? Object.getOwnPropertyDescriptor(cardFieldPrototype, "tokenize")
      : undefined;

    if (!cardFieldPrototype || !tokenizeDescriptor?.value) {
      restoreClient();
      throw new Error(
        "Missing foxy-payment-card-field tokenize prototype for test.",
      );
    }

    const tokenizeSpy = vi
      .spyOn(cardFieldPrototype, "tokenize")
      .mockImplementation(tokenize);

    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const checkbox = element.shadowRoot?.querySelector(
        '[data-slot="checkbox"]',
      ) as HTMLElement | null;
      expect(checkbox).toBeTruthy();

      checkbox?.click();
      await waitForRender();

      const payload = await element.tokenize();

      expect(updateBillingAddress).toHaveBeenCalled();
      expect(payload).toEqual({
        token: "card_token_123",
        requestId: "card-req-1",
        cardBrand: "visa",
        last4: "4242",
        expirationMonth: 12,
        expirationYear: 2030,
        gateway: "authorize",
        cardToken: "card_token_123",
      });
      expect(payload).not.toHaveProperty("billingAddress");
    } finally {
      tokenizeSpy.mockRestore();
      element.remove();
      restoreClient();
    }
  });

  it("dispatches billingaddresserror and renders an error message when billing sync fails", async () => {
    const failure = new Error("Billing sync failed.");
    const updateBillingAddress = vi.fn(() => Promise.reject(failure));
    const restoreClient = overrideClientState(
      createBillingApiState(),
      undefined,
      {
        updateBillingAddress,
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;
    const onBillingAddressError = vi.fn();

    try {
      element.addEventListener("billingaddresserror", onBillingAddressError);
      document.body.append(element);
      await waitForRender();

      const checkbox = element.shadowRoot?.querySelector(
        '[data-slot="checkbox"]',
      ) as HTMLElement | null;
      expect(checkbox).toBeTruthy();

      checkbox?.click();
      await Promise.resolve();
      await waitForRender();

      expect(onBillingAddressError).toHaveBeenCalledTimes(1);

      const event = onBillingAddressError.mock.calls[0]?.[0] as CustomEvent<{
        error: unknown;
        optionId: string;
      }>;
      expect(event.detail.error).toBe(failure);
      expect(event.detail.optionId).toBe("new-card");
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Billing sync failed.",
      );
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

  it("renders and hydrates the paypal-message fallback for PayPal Pay Later", async () => {
    const render = vi.fn(() => Promise.resolve());
    const createPayPalMessages = vi.fn(() => ({ render }));
    const restoreClient = overrideClientState(
      createPayPalPlatformApiState(),
      undefined,
      {
        paypal: createPayPalPlatformMock(["paypal-pay-later"], {
          createPayPalMessages,
        }),
      },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForText(
        () => element.shadowRoot?.textContent,
        "PayPal Pay Later",
      );
      element.optionIndex = 1;
      await waitForRender();

      const payLaterMessage = await waitForTruthy(
        () =>
          element.shadowRoot?.querySelector(
            '[data-paypal-paylater-label="true"]',
          ) as HTMLElement | null,
        "PayPal Pay Later fallback message",
      );

      expect(payLaterMessage).toBeTruthy();
      await waitForText(
        () => payLaterMessage?.textContent,
        "Click the PayPal Pay Later button under the order summary to submit your order.",
      );
      expect(createPayPalMessages).toHaveBeenCalledTimes(1);
      expect(render).toHaveBeenCalledWith(payLaterMessage);
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("shows the click-hint icon in expanded content for button-driven payment options", async () => {
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
        paypal: createPayPalPlatformMock(optionTypes, {
          createPayPalMessages: vi.fn(() => ({ render: vi.fn() })),
        }),
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

      for (const [index] of renderedOptions.entries()) {
        element.optionIndex = index;
        await waitForRender();

        const clickHintIcon = element.shadowRoot?.querySelector(
          '[data-payment-option-click-hint="true"]',
        );

        expect(clickHintIcon).toBeTruthy();
      }
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("uses the leading-icon layout for a single button-driven payment option", async () => {
    const restoreClient = overrideClientState(createSezzleApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForTruthy(
        () => element.shadowRoot?.querySelector('[style*="column-gap"]'),
        "leading icon layout row",
      );

      const leadingLayoutRows = element.shadowRoot?.querySelectorAll(
        '[style*="column-gap"]',
      );

      expect(leadingLayoutRows).toHaveLength(1);
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("does not use the leading-icon layout when multiple payment options are present", async () => {
    const restoreClient = overrideClientState({
      payment_gateways: [
        {
          type: "sezzle",
          public_key: "sezzle-public-key",
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
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Buy Now, Pay Later with Sezzle",
      );

      const leadingLayoutRows = element.shadowRoot?.querySelectorAll(
        '[style*="column-gap"]',
      );

      expect(leadingLayoutRows).toHaveLength(0);
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
      await waitForText(() => element.shadowRoot?.textContent, "Adyen");

      const content = element.shadowRoot?.textContent ?? "";
      expect(content).toContain("Adyen");
      expect(content).not.toContain("New Card");
      expect(content).not.toContain("iDEAL");
      await waitForTruthy(() => Dropin.mock.calls.length === 1, "Adyen Drop-in");
      expect(Dropin).toHaveBeenCalledTimes(1);
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
            session_data: "adyen-session-data-1",
            environment: "test",
            client_key: "adyen-client-key-1",
          },
          {
            type: "adyen_embedded",
            session_data: "adyen-session-data-2",
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

  it("returns a wrapped Adyen Embedded session result from tokenize()", async () => {
    const adyenResult = {
      resultCode: "Authorised",
      sessionData: "next-session-data",
    };
    const { Component: Dropin } = createAdyenComponentMock({ result: adyenResult });
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

      await expect(element.tokenize()).resolves.toEqual({
        adyenEmbedded: {
          result: adyenResult,
        },
      });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("does not render button click hints for the Adyen Drop-in entry", async () => {
    const { Component: Dropin } = createAdyenComponentMock();
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
      await waitForText(() => element.shadowRoot?.textContent, "Adyen");

      expect(
        element.shadowRoot?.querySelector(
          '[data-payment-option-click-hint="true"]',
        ),
      ).toBeNull();
      expect(element.shadowRoot?.textContent).toContain(
        "Enter your payment details below and click the Submit button below the order summary to submit your order.",
      );
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
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Klarna widget pay_in_4",
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
      await waitForRender();

      element.optionIndex = 1;
      await waitForRender();

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
});
