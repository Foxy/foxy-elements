import { act } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { CUSTOMER_PORTAL_ELEMENT_TAG, CustomerPortalElement } from "./element";

// React only allows `act` outside a test renderer when this is set, and warns
// on every update otherwise. Mounting the element renders React.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function mount(attributes: Record<string, string> = {}) {
  const element = document.createElement(
    CUSTOMER_PORTAL_ELEMENT_TAG,
  ) as CustomerPortalElement;

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }

  // `connectedCallback` renders React synchronously; wrapping in `act` flushes
  // that render and keeps React from warning about an un-acted update.
  act(() => {
    document.body.append(element);
  });

  return element;
}

afterEach(() => {
  act(() => {
    document.body
      .querySelectorAll(CUSTOMER_PORTAL_ELEMENT_TAG)
      .forEach((n) => n.remove());
  });
});

describe("foxy-customer-portal", () => {
  it("registers itself", () => {
    expect(customElements.get(CUSTOMER_PORTAL_ELEMENT_TAG)).toBe(
      CustomerPortalElement,
    );
  });

  it("attaches an open shadow root", () => {
    expect(mount({ "store-domain": "demo" }).shadowRoot).not.toBeNull();
  });

  it("reflects store-domain between attribute and property", () => {
    const element = mount({ "store-domain": "demo" });
    expect(element.storeDomain).toBe("demo");

    act(() => {
      element.storeDomain = "other";
    });
    expect(element.getAttribute("store-domain")).toBe("other");
  });

  it("reflects skip-password-reset as a boolean", () => {
    const element = mount({
      "store-domain": "demo",
      "skip-password-reset": "",
    });
    expect(element.skipPasswordReset).toBe(true);

    act(() => {
      element.skipPasswordReset = false;
    });
    expect(element.hasAttribute("skip-password-reset")).toBe(false);
  });

  it("defaults fullNameTemplate", () => {
    expect(mount({ "store-domain": "demo" }).fullNameTemplate).toBe(
      "{first_name} {last_name}",
    );
  });

  it("renders an alert instead of throwing when store-domain is missing", () => {
    const element = mount();
    expect(element.shadowRoot?.textContent).toMatch(/store-domain/i);
  });

  it("unmounts cleanly on disconnect", () => {
    const element = mount({ "store-domain": "demo" });
    expect(element.shadowRoot?.textContent).not.toBe("");

    act(() => {
      element.remove();
    });
    expect(element.shadowRoot?.textContent).toBe("");
  });
});
