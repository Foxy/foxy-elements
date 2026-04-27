import { beforeEach, describe, expect, it } from "vitest";

import { PaymentMethodSelectorElement } from "./payment-method-selector-element";

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
});
