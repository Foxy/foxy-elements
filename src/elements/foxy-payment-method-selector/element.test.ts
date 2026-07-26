import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import { defaultTheme } from "@foxy.io/design-system/theme";
import {
  THEME_ATTRIBUTE_NAMES,
  THEME_PROPERTY_TO_ATTRIBUTE,
} from "@/lib/theme-mixin";

import {
  PaymentMethodSelectorElement,
  toBcp47Locale,
  getCachedCountryOptions,
} from "./element";

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

async function waitForBillingAddressReport(): Promise<void> {
  // Billing-address edits are debounced (BILLING_ADDRESS_REPORT_DEBOUNCE_MS
  // in billing.tsx) before they're reported upstream, so tests asserting on
  // updateBillingAddress must wait past that window rather than a single
  // render tick.
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
  await waitForRender();
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

// The leading-icon layout is the only place in this component where a grid's
// column-gap and row-gap are set to different values (see OptionFieldContent
// in view.tsx): every other gap usage in the file is a single uniform value,
// so columnGap !== rowGap uniquely identifies rows using that layout. This
// works on real Chromium's serialized "gap" shorthand, unlike matching the
// literal "column-gap" substring in the raw style attribute (Chromium
// collapses column-gap/row-gap into the shorthand, which never contains that
// substring).
function findLeadingLayoutRows(
  root: ShadowRoot | null | undefined,
): HTMLElement[] {
  return Array.from(root?.querySelectorAll<HTMLElement>("*") ?? []).filter(
    (node) => {
      const style = getComputedStyle(node);
      return style.columnGap !== style.rowGap;
    },
  );
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

function createBillingApiState() {
  return {
    billing_address: {
      use_separate_billing_address: false,
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
      use_separate_billing_address: false,
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
      use_separate_billing_address: true,
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
    billing_address: {
      use_separate_billing_address: false,
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
    const restoreClient = overrideClientState(createBillingApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      element.setAttribute(
        "theme-font-body",
        "400 1rem/1.25 Figtree, sans-serif",
      );
      document.body.append(element);
      await waitForText(() => element.shadowRoot?.textContent, "New Card");

      // The billing address fields render through the design system's
      // Field.Control, which is styled from `theme.tokens.font.body` (see
      // #buildThemeTokens() in element.tsx). If the theme-font-body attribute
      // is actually threaded through StyleSheetManager/ThemeProvider into the
      // rendered shadow DOM, this input's computed font picks up "Figtree"
      // instead of the design system's default ("Albert Sans").
      const input = element.shadowRoot?.querySelector(
        "#billing-first-name",
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
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Click Continue with Mollie under the order summary to pay.",
      );

      await waitForTruthy(
        () =>
          element.shadowRoot?.querySelector(
            '[data-payment-option-brand="mollie"]',
          ),
        "Mollie brand icon",
      );
      expect(findLeadingLayoutRows(element.shadowRoot)).toHaveLength(1);
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

      const status = element.shadowRoot?.querySelector('[role="alert"]');
      await waitForText(
        () => status?.textContent,
        "Loading payment options...",
      );

      await waitForTime(800);
      await waitForRender();

      const alert = element.shadowRoot?.querySelector('[role="alert"]');
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

  it("renders the billing address for purchase order when the checkout provides one", async () => {
    const restoreClient = overrideClientState({
      ...createPurchaseOrderApiState(),
      billing_address: {
        use_separate_billing_address: true,
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
    });
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      // The purchase-order body still renders its own field...
      await waitForText(
        () => element.shadowRoot?.textContent,
        "Purchase order number",
      );

      // ...and, because the checkout provides a billing address, the billing
      // form renders alongside it (previously omitted for purchase-order).
      const billingInput = element.shadowRoot?.querySelector(
        "#billing-first-name",
      ) as HTMLElement | null;
      expect(billingInput).not.toBeNull();
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

      const firstNameInput = element.shadowRoot?.querySelector(
        "#billing-first-name",
      ) as HTMLInputElement | null;
      expect(firstNameInput).toBeTruthy();

      await setTextInputValue(firstNameInput!, "Jordan");
      await waitForBillingAddressReport();

      // Only the field that actually changed is sent — the other address
      // fields are untouched, so they must not be resent as if the
      // shopper had just cleared them.
      expect(updateBillingAddress).toHaveBeenCalledWith({
        first_name: "Jordan",
      });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("only sends the billing-address field the shopper actually edited", async () => {
    const updateBillingAddress = vi.fn(() => Promise.resolve());
    const restoreClient = overrideClientState(
      {
        billing_address: {
          use_separate_billing_address: true,
          first_name: "",
          last_name: "",
          company: "",
          address1: "",
          address2: "",
          city: "",
          region: "",
          postal_code: "",
          country: "",
          phone: "",
        },
        shipments: [
          {
            country_options: ["US", "CA"],
            region_options: ["MN", "WI"],
          },
        ],
        payment_gateways: [{ type: "authorize" }],
      },
      undefined,
      { updateBillingAddress },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const firstNameInput = element.shadowRoot?.querySelector(
        "#billing-first-name",
      ) as HTMLInputElement | null;
      expect(firstNameInput).toBeTruthy();

      await setTextInputValue(firstNameInput!, "J");
      await waitForBillingAddressReport();

      expect(updateBillingAddress).toHaveBeenCalledWith({
        first_name: "J",
      });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("coalesces rapid keystrokes into a single debounced update", async () => {
    const updateBillingAddress = vi.fn(() => Promise.resolve());
    const restoreClient = overrideClientState(
      {
        billing_address: {
          use_separate_billing_address: true,
          first_name: "",
          last_name: "",
          company: "",
          address1: "",
          address2: "",
          city: "",
          region: "",
          postal_code: "",
          country: "",
          phone: "",
        },
        shipments: [
          {
            country_options: ["US", "CA"],
            region_options: ["MN", "WI"],
          },
        ],
        payment_gateways: [{ type: "authorize" }],
      },
      undefined,
      { updateBillingAddress },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const firstNameInput = element.shadowRoot?.querySelector(
        "#billing-first-name",
      ) as HTMLInputElement | null;
      expect(firstNameInput).toBeTruthy();

      await setTextInputValue(firstNameInput!, "J");
      await setTextInputValue(firstNameInput!, "Jo");
      await setTextInputValue(firstNameInput!, "Joh");
      await setTextInputValue(firstNameInput!, "John");

      // Immediately after typing, still inside the debounce window: no
      // network call yet.
      expect(updateBillingAddress).not.toHaveBeenCalled();

      await waitForBillingAddressReport();

      // Only one call fires, carrying the final value.
      expect(updateBillingAddress).toHaveBeenCalledTimes(1);
      expect(updateBillingAddress).toHaveBeenCalledWith({
        first_name: "John",
      });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("flushes a pending billing-address edit on blur instead of waiting out the debounce", async () => {
    const updateBillingAddress = vi.fn(() => Promise.resolve());
    const restoreClient = overrideClientState(
      {
        billing_address: {
          use_separate_billing_address: true,
          first_name: "",
          last_name: "",
          company: "",
          address1: "",
          address2: "",
          city: "",
          region: "",
          postal_code: "",
          country: "",
          phone: "",
        },
        shipments: [
          {
            country_options: ["US", "CA"],
            region_options: ["MN", "WI"],
          },
        ],
        payment_gateways: [{ type: "authorize" }],
      },
      undefined,
      { updateBillingAddress },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const firstNameInput = element.shadowRoot?.querySelector(
        "#billing-first-name",
      ) as HTMLInputElement | null;
      expect(firstNameInput).toBeTruthy();

      await setTextInputValue(firstNameInput!, "J");
      expect(updateBillingAddress).not.toHaveBeenCalled();

      firstNameInput!.dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, composed: true }),
      );
      await waitForRender();

      expect(updateBillingAddress).toHaveBeenCalledWith({
        first_name: "J",
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

      const firstNameInput = element.shadowRoot?.querySelector(
        "#billing-first-name",
      ) as HTMLInputElement | null;
      expect(firstNameInput).toBeTruthy();

      await setTextInputValue(firstNameInput!, "Jordan");
      await waitForBillingAddressReport();

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

      const firstNameInput = element.shadowRoot?.querySelector(
        "#billing-first-name",
      ) as HTMLInputElement | null;
      expect(firstNameInput).toBeTruthy();

      await setTextInputValue(firstNameInput!, "Jordan");
      await waitForBillingAddressReport();

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
        () => findLeadingLayoutRows(element.shadowRoot)[0],
        "leading icon layout row",
      );

      const leadingLayoutRows = findLeadingLayoutRows(element.shadowRoot);

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

      const leadingLayoutRows = findLeadingLayoutRows(element.shadowRoot);

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
    // prototype method directly (see "does not include billing address in
    // the tokenization payload" above); the paypalPlatform metadata this
    // test checks never reads from the card field's resolved value anyway
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
      await waitForTruthy(
        () => element.querySelector("[data-foxy-adyen-host]"),
        "Adyen light DOM host",
      );

      expect(
        element.shadowRoot?.querySelector(
          '[data-payment-option-click-hint="true"]',
        ),
      ).toBeNull();
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

  it("shows the separate-billing toggle and reveals fields when checked", async () => {
    const restoreClient = overrideClientState({
      ...createBillingApiState(),
      billing_address: {
        ...createBillingApiState().billing_address,
        use_separate_billing_address: false,
      },
      // a shippable shipment so there's a shipping address to differ from
      shipments: [{ has_shippable_items: true, country_options: ["US"], region_options: ["MN"] }],
    });
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForText(() => element.shadowRoot?.textContent, "Use separate billing address");

      const checkbox = element.shadowRoot?.querySelector(
        '[id^="use-separate-billing-address-"]',
      ) as HTMLElement | null;
      expect(checkbox).not.toBeNull();

      // unchecked (use shipping) → billing fields hidden
      expect(element.shadowRoot?.querySelector("#billing-first-name")).toBeNull();

      checkbox!.click();
      await waitForRender();
      // checked (separate) → billing fields shown
      expect(element.shadowRoot?.querySelector("#billing-first-name")).not.toBeNull();
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("sends use_separate_billing_address: true when the separate-billing toggle is checked", async () => {
    const updateBillingAddress = vi.fn(() => Promise.resolve());
    const restoreClient = overrideClientState(
      {
        ...createBillingApiState(),
        billing_address: {
          ...createBillingApiState().billing_address,
          use_separate_billing_address: false,
        },
        // a shippable shipment so there's a shipping address to differ from
        shipments: [{ has_shippable_items: true, country_options: ["US"], region_options: ["MN"] }],
      },
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
      await waitForText(() => element.shadowRoot?.textContent, "Use separate billing address");

      const checkbox = element.shadowRoot?.querySelector(
        '[id^="use-separate-billing-address-"]',
      ) as HTMLElement | null;
      expect(checkbox).not.toBeNull();

      checkbox!.click();
      await waitForBillingAddressReport();

      expect(updateBillingAddress).toHaveBeenCalledWith(
        expect.objectContaining({ use_separate_billing_address: true }),
      );
    } finally {
      element.remove();
      restoreClient();
    }
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

describe("billing country options", () => {
  // Billing allows GB/FR; shipping allows US/CA. The two lists are disjoint,
  // so any cross-read shows up immediately.
  function createBillingCountryApiState(includeBillingOptions = true) {
    return {
      billing_address: {
        use_separate_billing_address: true,
        first_name: "",
        last_name: "",
        company: "",
        address1: "",
        address2: "",
        city: "",
        region: "",
        postal_code: "",
        country: "GB",
        phone: "",
        ...(includeBillingOptions ? { country_options: ["GB", "FR"] } : {}),
      },
      shipments: [
        {
          has_shippable_items: true,
          country_options: ["US", "CA"],
          region_options: ["MN", "WI"],
        },
      ],
      payment_gateways: [{ type: "authorize" }],
    };
  }

  it("labels the billing country with a localized name from its own options", async () => {
    const restoreClient = overrideClientState(createBillingCountryApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const trigger = element.shadowRoot?.querySelector("#billing-country");

      expect(trigger?.tagName).toBe("BUTTON");
      // "United Kingdom", not "GB" — and GB is absent from the shipment's
      // list, so this also proves the shipment's options are not being read.
      expect(trigger?.textContent).toContain("United Kingdom");
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("offers only the billing countries, sorted by localized name", async () => {
    const restoreClient = overrideClientState(createBillingCountryApiState());
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const trigger = element.shadowRoot?.querySelector(
        "#billing-country",
      ) as HTMLButtonElement | null;
      trigger?.click();
      await waitForRender();

      // The popup is portaled into the element's own shadow root, never into
      // document.body — escaping the shadow root would lose all theme context.
      const popup = element.shadowRoot?.querySelector('[role="listbox"]');
      expect(popup?.getRootNode()).toBe(element.shadowRoot);
      expect(document.body.querySelector('[role="listbox"]')).toBeNull();

      const options = Array.from(
        element.shadowRoot?.querySelectorAll("[role='option']") ?? [],
      ).map((option) => option.textContent);

      expect(options).toEqual(["France", "United Kingdom"]);
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("shows the localized name for a lowercase saved country against lowercase options", async () => {
    const restoreClient = overrideClientState({
      billing_address: {
        use_separate_billing_address: true,
        first_name: "",
        last_name: "",
        company: "",
        address1: "",
        address2: "",
        city: "",
        region: "",
        postal_code: "",
        country: "gb",
        phone: "",
        country_options: ["gb", "fr"],
      },
      shipments: [
        {
          has_shippable_items: true,
          country_options: ["us", "ca"],
          region_options: ["MN", "WI"],
        },
      ],
      payment_gateways: [{ type: "authorize" }],
    });
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const trigger = element.shadowRoot?.querySelector("#billing-country");

      // `toCountryOptions` uppercases every option value; a saved lowercase
      // `country` must still resolve against those uppercase values instead
      // of falling through to the untranslated placeholder.
      expect(trigger?.textContent).toContain("United Kingdom");
      expect(trigger?.textContent?.trim()).not.toBe("Select");
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("does not send a spurious billing-address update when the saved country is already lowercase", async () => {
    const updateBillingAddress = vi.fn(() => Promise.resolve());
    const restoreClient = overrideClientState(
      {
        billing_address: {
          use_separate_billing_address: true,
          first_name: "",
          last_name: "",
          company: "",
          address1: "",
          address2: "",
          city: "",
          region: "",
          postal_code: "",
          country: "gb",
          phone: "",
          country_options: ["gb", "fr"],
        },
        shipments: [
          {
            has_shippable_items: true,
            country_options: ["us", "ca"],
            region_options: ["MN", "WI"],
          },
        ],
        payment_gateways: [{ type: "authorize" }],
      },
      undefined,
      { updateBillingAddress },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();
      await waitForBillingAddressReport();

      // Normalizing the displayed value to uppercase must not make it look
      // like the shopper edited the field the moment it's rendered — the
      // field is only seeded from, never diffed against, its normalized
      // display form.
      expect(updateBillingAddress).not.toHaveBeenCalled();
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("still reports a real country edit against a lowercase saved country", async () => {
    const updateBillingAddress = vi.fn(() => Promise.resolve());
    const restoreClient = overrideClientState(
      {
        billing_address: {
          use_separate_billing_address: true,
          first_name: "",
          last_name: "",
          company: "",
          address1: "",
          address2: "",
          city: "",
          region: "",
          postal_code: "",
          country: "gb",
          phone: "",
          country_options: ["gb", "fr"],
        },
        shipments: [
          {
            has_shippable_items: true,
            country_options: ["us", "ca"],
            region_options: ["MN", "WI"],
          },
        ],
        payment_gateways: [{ type: "authorize" }],
      },
      undefined,
      { updateBillingAddress },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const trigger = element.shadowRoot?.querySelector(
        "#billing-country",
      ) as HTMLButtonElement | null;
      trigger?.click();
      await waitForRender();

      const options = Array.from(
        element.shadowRoot?.querySelectorAll("[role='option']") ?? [],
      );
      const franceOption = options.find((option) =>
        option.textContent?.includes("France"),
      ) as HTMLElement | undefined;
      expect(franceOption).toBeTruthy();
      franceOption!.click();
      await waitForRender();
      await waitForBillingAddressReport();

      // The case-insensitive comparison added for the no-op case above must
      // not swallow a genuine edit: picking a different country still has
      // to reach the backend, with the normalized (uppercase) value.
      expect(updateBillingAddress).toHaveBeenCalledWith({ country: "FR" });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("reports a case-only edit to a non-country billing field", async () => {
    const updateBillingAddress = vi.fn(() => Promise.resolve());
    const restoreClient = overrideClientState(
      {
        billing_address: {
          use_separate_billing_address: true,
          first_name: "john",
          last_name: "",
          company: "",
          address1: "",
          address2: "",
          city: "",
          region: "",
          postal_code: "",
          country: "",
          phone: "",
        },
        shipments: [
          {
            country_options: ["US", "CA"],
            region_options: ["MN", "WI"],
          },
        ],
        payment_gateways: [{ type: "authorize" }],
      },
      undefined,
      { updateBillingAddress },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const firstNameInput = element.shadowRoot?.querySelector(
        "#billing-first-name",
      ) as HTMLInputElement | null;
      expect(firstNameInput).toBeTruthy();

      // The case-insensitive comparison in #diffBillingAddressPatch is
      // scoped to the "country" key only (see the comment there) — every
      // other billing field must still compare case-sensitively. A shopper
      // correcting "john" to "John" is a real edit and has to reach the
      // backend, not get silently dropped as a no-op the way an unscoped
      // case-insensitive comparison would drop it.
      await setTextInputValue(firstNameInput!, "John");
      await waitForBillingAddressReport();

      expect(updateBillingAddress).toHaveBeenCalledWith({
        first_name: "John",
      });
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("renders a placeholder with no spurious update when billing country is absent but options are present", async () => {
    const updateBillingAddress = vi.fn(() => Promise.resolve());
    const restoreClient = overrideClientState(
      {
        billing_address: {
          use_separate_billing_address: true,
          first_name: "",
          last_name: "",
          company: "",
          address1: "",
          address2: "",
          city: "",
          region: "",
          postal_code: "",
          phone: "",
          country_options: ["US", "CA"],
          // `country` is intentionally omitted — the API can return options
          // without a saved value (e.g. a brand-new billing address).
        },
        shipments: [
          {
            has_shippable_items: true,
            country_options: ["GB", "FR"],
            region_options: ["MN", "WI"],
          },
        ],
        payment_gateways: [{ type: "authorize" }],
      },
      undefined,
      { updateBillingAddress },
    );
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const trigger = element.shadowRoot?.querySelector("#billing-country");
      expect(trigger?.tagName).toBe("BUTTON");
      expect(trigger?.textContent?.trim()).toBe("Select");

      await waitForBillingAddressReport();
      expect(updateBillingAddress).not.toHaveBeenCalled();
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("falls back to a text input when billing country_options is absent", async () => {
    const restoreClient = overrideClientState(createBillingCountryApiState(false));
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      expect(element.shadowRoot?.querySelector("#billing-country")?.tagName).toBe(
        "INPUT",
      );
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("localizes the option label using the element's own locale, not a hardcoded default", async () => {
    const restoreClient = overrideClientState({
      billing_address: {
        use_separate_billing_address: true,
        first_name: "",
        last_name: "",
        company: "",
        address1: "",
        address2: "",
        city: "",
        region: "",
        postal_code: "",
        country: "GB",
        phone: "",
        country_options: ["GB", "FR"],
      },
      shipments: [
        {
          has_shippable_items: true,
          country_options: ["US", "CA"],
          region_options: ["MN", "WI"],
        },
      ],
      payment_gateways: [{ type: "authorize" }],
    });
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      // Set before append: `#resolveLocale` reads the attribute/property
      // first, so this is deterministic regardless of connection timing.
      element.lang = "fr-FR";
      document.body.append(element);
      await waitForRender();

      const trigger = element.shadowRoot?.querySelector("#billing-country");

      // French for "United Kingdom" — only resolves if the element's own
      // locale (not a hardcoded "en-US") reaches `toCountryOptions`.
      expect(trigger?.textContent).toContain("Royaume-Uni");
    } finally {
      element.remove();
      restoreClient();
    }
  });

  it("sorts billing countries by localized name, not by code", async () => {
    const restoreClient = overrideClientState({
      billing_address: {
        use_separate_billing_address: true,
        first_name: "",
        last_name: "",
        company: "",
        address1: "",
        address2: "",
        city: "",
        region: "",
        postal_code: "",
        country: "CH",
        phone: "",
        // By code, "CH" < "DE" sorts Switzerland before Germany. By
        // localized English name, "Germany" < "Switzerland" sorts the other
        // way — the two orderings disagree, so this fixture actually pins
        // the sort key.
        country_options: ["CH", "DE"],
      },
      shipments: [
        {
          has_shippable_items: true,
          country_options: ["US", "CA"],
          region_options: ["MN", "WI"],
        },
      ],
      payment_gateways: [{ type: "authorize" }],
    });
    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

      const trigger = element.shadowRoot?.querySelector(
        "#billing-country",
      ) as HTMLButtonElement | null;
      trigger?.click();
      await waitForRender();

      const options = Array.from(
        element.shadowRoot?.querySelectorAll("[role='option']") ?? [],
      ).map((option) => option.textContent);

      expect(options).toEqual(["Germany", "Switzerland"]);
    } finally {
      element.remove();
      restoreClient();
    }
  });
});

describe("getCachedCountryOptions", () => {
  // `#resolveBillingAddress` rebuilds this list on every render, and
  // `SearchableSelect`'s `items` contract asks for a referentially stable
  // array, so the memo below has to actually return the same reference for
  // unchanged input — not just equal content.
  //
  // Every fixture below uses real ISO 3166-1 alpha-2 codes on lists of a few
  // countries each (never the single-letter-pair placeholders like
  // "gc-stability-us" this block used to use) — `toCountryOptions` drops
  // anything that doesn't match `/^[A-Za-z]{2}$/`-shaped *and* resolve to a
  // usable code, and a placeholder like that silently maps to `[]`, which
  // would make every "same reference" assertion below compare `[]` to `[]`
  // regardless of whether the cache does anything at all.

  it("returns the same array reference for unchanged codes and locale", () => {
    const a = getCachedCountryOptions(["NO", "SE", "FI", "IS", "DK"], "en-US");
    const b = getCachedCountryOptions(["NO", "SE", "FI", "IS", "DK"], "en-US");

    expect(a).toBe(b);
    // Guards against the reference check passing only because both calls
    // happen to return the same empty array.
    expect(a.length).toBe(5);
  });

  it("returns a different array reference when the codes change, without losing the prior entry", () => {
    const codesA = ["AR", "BR", "CL", "CO", "PE"];
    const codesB = ["MX", "GT", "HN", "PA", "CR"];
    const a1 = getCachedCountryOptions(codesA, "en-US");
    const b1 = getCachedCountryOptions(codesB, "en-US");
    // Re-reading `codesA` only reddens if the cache is actually keeping the
    // first entry alive — with no cache, distinct inputs always produce
    // distinct arrays, so `b1` differing from `a1` proves nothing on its
    // own; this second read of `codesA` is what a cache-deletion mutation
    // breaks.
    const a2 = getCachedCountryOptions(codesA, "en-US");

    expect(b1).not.toBe(a1);
    expect(b1.map((option) => option.value)).not.toEqual(
      a1.map((option) => option.value),
    );
    expect(a2).toBe(a1);
  });

  it("returns a different array reference when the locale changes, without losing the prior entry", () => {
    const codes = ["JP", "KR", "CN", "TW", "HK"];
    const a1 = getCachedCountryOptions(codes, "en-US");
    const b1 = getCachedCountryOptions(codes, "fr-FR");
    // Same shape as the codes-change test above: re-reading the original
    // locale is what actually exercises the cache.
    const a2 = getCachedCountryOptions(codes, "en-US");

    expect(b1).not.toBe(a1);
    expect(b1.map((option) => option.label)).not.toEqual(
      a1.map((option) => option.label),
    );
    expect(a2).toBe(a1);
  });

  it("does not collide a comma-containing single code with a two-code list", () => {
    // ["GB,FR"] and ["GB", "FR"] must not share a cache key: `codes.join(",")`
    // would encode both as the string "GB,FR". This is a key-*encoding*
    // guard, not a cache-presence one — it reddens under a key-format
    // mutation (e.g. building the key from `codes.join(",")`), not under
    // cache deletion: the two calls are distinct inputs either way, so
    // `single` and `pair` would differ by reference with no cache at all.
    // Content still discriminates: "GB,FR" fails the alpha-2 shape check
    // (5 characters) and maps to no options, while ["GB", "FR"] maps to two
    // real countries, sorted by localized name ("France" before "United
    // Kingdom").
    const single = getCachedCountryOptions(["GB,FR"], "en-US");
    const pair = getCachedCountryOptions(["GB", "FR"], "en-US");

    expect(single).not.toBe(pair);
    expect(single).toEqual([]);
    expect(pair.map((option) => option.value)).toEqual(["FR", "GB"]);
  });

  it("keeps the entry currently on screen alive across eviction (LRU, not FIFO)", () => {
    const locale = "en-US";
    // 20 distinct single-country lists — the cache holds 20 entries total.
    const codeLists = [
      ["GB"], ["FR"], ["DE"], ["IT"], ["ES"],
      ["PT"], ["NL"], ["BE"], ["SE"], ["NO"],
      ["DK"], ["FI"], ["PL"], ["AT"], ["CH"],
      ["IE"], ["GR"], ["CZ"], ["HU"], ["RO"],
    ];
    const firstKeyCodes = codeLists[0];
    const first = getCachedCountryOptions(firstKeyCodes, locale);

    // Fill the cache with 19 more distinct entries, so the first entry is
    // now the oldest by insertion order.
    for (let i = 1; i < codeLists.length; i += 1) {
      getCachedCountryOptions(codeLists[i], locale);
    }

    // Re-read the first entry — under plain FIFO-by-insertion this wouldn't
    // matter (the read doesn't reorder anything), but it must not have been
    // evicted yet, and re-reading it should bump its recency.
    expect(getCachedCountryOptions(firstKeyCodes, locale)).toBe(first);

    // One more distinct entry pushes the cache over its bound. Under FIFO
    // eviction, the first entry (oldest insertion) would be dropped even
    // though it was just read. Under LRU (delete-then-reinsert on hit), the
    // entry inserted-but-never-re-read right after it (codeLists[1], "FR")
    // is the oldest now, so that one gets evicted instead.
    getCachedCountryOptions(["BG"], locale);

    expect(getCachedCountryOptions(firstKeyCodes, locale)).toBe(first);
  });
});
