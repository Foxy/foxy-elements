import { beforeEach, describe, expect, it } from "vitest";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";

import { PaymentMethodSelectorElement } from "./element";

describe("PaymentMethodSelectorElement theme attributes", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

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
    const client = checkoutClient as {
      state?: unknown;
      json?: unknown;
    };

    const previousState = client.state;
    const previousJson = client.json;

    client.state = {
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
    };

    const element = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;

    try {
      const payload = await element.tokenize();

      expect(payload.optionType).toBe("saved-card");
      expect(payload).not.toHaveProperty("savedPaymentMethodId");
    } finally {
      client.state = previousState;
      client.json = previousJson;
    }
  });
});
