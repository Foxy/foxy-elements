import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";

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

const STRING_PROPERTY_MAPPINGS = [
  ["themeBackground", "theme-background", "#fafafa"],
  ["themePrimary", "theme-primary", "#111111"],
  ["themeInputPaddingX", "theme-input-padding-x", "18px"],
  ["themeFontSans", "theme-font-sans", "Figtree"],
] as const;

describe("PaymentMethodSelectorElement", () => {
  beforeEach(() => {
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
    expect(observed).toContain("theme-background");
    expect(observed).toContain("theme-primary");
    expect(observed).toContain("theme-input-height");
    expect(observed).toContain("theme-input-padding-x");
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

      expect(payload.optionType).toBe("saved-card");
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

    try {
      const payload = await element.tokenize();

      expect(payload.optionIndex).toBe(1);
      expect(payload.optionType).toBe("apple-pay");
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
