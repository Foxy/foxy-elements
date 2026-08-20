import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CUSTOMER_PORTAL_ELEMENT_TAG, CustomerPortalElement } from "./element";

// React only allows `act` outside a test renderer when this is set, and warns
// on every update otherwise. Mounting the element renders React.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let fetchMock: ReturnType<typeof vi.fn>;

// Mounting the element renders `Portal`, which reads
// `<base>customer_portal_settings`. The `unit` project runs in real Chromium
// with no network interception, so without this the suite makes a genuine
// request to demo.foxycart.com — silently, because `useResource` swallows the
// rejection. Same rule as `hcaptcha.test.ts`: no test reaches an external URL.
beforeEach(() => {
  fetchMock = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({}),
  }));

  vi.stubGlobal("fetch", fetchMock);
});

/** Lets pending promises settle and React apply what they changed. */
const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

async function mount(attributes: Record<string, string> = {}) {
  const element = document.createElement(
    CUSTOMER_PORTAL_ELEMENT_TAG,
  ) as CustomerPortalElement;

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }

  // `connectedCallback` renders React synchronously, and that render starts the
  // portal-settings request. Both the render and the state update its response
  // causes have to happen inside `act`, or React warns about an un-acted update
  // once the promise settles — after the test body has already finished.
  await act(async () => {
    document.body.append(element);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  return element;
}

afterEach(async () => {
  act(() => {
    document.body
      .querySelectorAll(CUSTOMER_PORTAL_ELEMENT_TAG)
      .forEach((n) => n.remove());
  });

  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("foxy-customer-portal", () => {
  it("registers itself", async () => {
    expect(customElements.get(CUSTOMER_PORTAL_ELEMENT_TAG)).toBe(
      CustomerPortalElement,
    );
  });

  it("attaches an open shadow root", async () => {
    const element = await mount({ "store-domain": "demo" });
    expect(element.shadowRoot).not.toBeNull();
  });

  it("reflects store-domain between attribute and property", async () => {
    const element = await mount({ "store-domain": "demo" });
    expect(element.storeDomain).toBe("demo");

    act(() => {
      element.storeDomain = "other";
    });
    // A new store means a new API and a fresh settings request; let it settle
    // inside `act` rather than after the test.
    await flush();

    expect(element.getAttribute("store-domain")).toBe("other");
  });

  it("reflects skip-password-reset as a boolean", async () => {
    const element = await mount({
      "store-domain": "demo",
      "skip-password-reset": "",
    });
    expect(element.skipPasswordReset).toBe(true);

    act(() => {
      element.skipPasswordReset = false;
    });
    expect(element.hasAttribute("skip-password-reset")).toBe(false);
  });

  it("defaults fullNameTemplate", async () => {
    const element = await mount({ "store-domain": "demo" });
    expect(element.fullNameTemplate).toBe("{first_name} {last_name}");
  });

  it("renders an alert instead of throwing when store-domain is missing", async () => {
    const element = await mount();
    expect(element.shadowRoot?.textContent).toMatch(/store-domain/i);
  });

  it("only ever asks for portal settings inside the store base path", async () => {
    await mount({ "store-domain": "demo" });

    for (const [input] of fetchMock.mock.calls as [unknown][]) {
      expect(String(input)).toBe(
        "https://demo.foxycart.com/s/customer/customer_portal_settings",
      );
    }
  });

  it("renders without a session rather than requesting the customer", async () => {
    const element = await mount({ "store-domain": "demo" });

    expect(element.shadowRoot?.textContent).toMatch(/sign in/i);
  });

  it("unmounts cleanly on disconnect", async () => {
    const element = await mount({ "store-domain": "demo" });
    expect(element.shadowRoot?.textContent).not.toBe("");

    act(() => {
      element.remove();
    });
    expect(element.shadowRoot?.textContent).toBe("");
  });
});
