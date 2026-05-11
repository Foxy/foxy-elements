import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import {
  THEME_ATTRIBUTE_NAMES,
  THEME_PROPERTY_TO_ATTRIBUTE,
} from "@/lib/theme-mixin";

import { PaymentMethodSelectorElement } from "./element";

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
  return overrideCheckoutClient({ state, json, ...extraProperties });
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
    payment_options: [{ type: "new-card", gateway: "authorize" }],
  };
}

function createAchApiState() {
  return {
    payment_options: [
      {
        type: "ach",
        gateway: "authorize",
        hosted_fields: {
          labels: {
            routing_number: "Routing number",
            account_number: "Account number",
            account_type: "Account type",
            account_holder_name: "Name on account",
          },
        },
      },
    ],
  };
}

function createPurchaseOrderApiState() {
  return {
    payment_options: [
      {
        type: "purchase_order",
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

  it("omits savedPaymentMethodId from saved-card tokenization payload", async () => {
    const restoreClient = overrideClientState({
      payment_options: [
        {
          type: "saved-card",
          gateway: "stripe_v2",
          payment_method: {
            brand: "Visa",
            last_4: "4242",
            expiry_month: "12",
            expiry_year: "2030",
            payment_method_id: "pm_saved_4242",
          },
        },
      ],
    });

    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
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
      restoreClient();
    }
  });

  it("skips disabled payment options when picking the default tokenization target", async () => {
    const restoreClient = overrideClientState({
      payment_options: [
        {
          type: "google-pay",
          gateway: "stripe_v2",
          disabled: true,
        },
        {
          type: "apple-pay",
          gateway: "stripe_v2",
        },
      ],
    });

    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;
    const onTokenizationStart = vi.fn();

    try {
      element.addEventListener("tokenizationstart", onTokenizationStart);
      const payload = await element.tokenize();

      expect(payload).toEqual({});
      expect(onTokenizationStart).toHaveBeenCalledTimes(1);
      expect(onTokenizationStart.mock.calls[0]?.[0]?.detail).toEqual({
        optionIndex: 1,
      });
    } finally {
      restoreClient();
    }
  });

  it("renders an unavailable state and rejects tokenization when no payment methods are available", async () => {
    const restoreClient = overrideClientState({ payment_options: [] });
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
      payment_options: [
        {
          type: "stripe-card-element",
          gateway: "stripe_connect",
          publishable_key: "",
        },
        {
          type: "apple-pay",
          gateway: "stripe_v2",
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
      Promise.resolve({ token: "ach_token_123", requestId: "ach-req-1" }),
    );
    const achFieldPrototype = customElements.get("foxy-ach-field")?.prototype;
    const tokenizeDescriptor = achFieldPrototype
      ? Object.getOwnPropertyDescriptor(achFieldPrototype, "tokenize")
      : undefined;

    if (!achFieldPrototype || !tokenizeDescriptor?.value) {
      restoreClient();
      throw new Error("Missing foxy-ach-field tokenize prototype for test.");
    }

    const tokenizeSpy = vi
      .spyOn(achFieldPrototype, "tokenize")
      .mockImplementation(tokenize);

    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      document.body.append(element);
      await waitForRender();

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
      });
    } finally {
      tokenizeSpy.mockRestore();
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
});
