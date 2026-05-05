import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  EXPRESS_CHECKOUT_ELEMENT_TAG,
  ExpressCheckoutElement,
} from "./element";

type CheckoutApiLike = EventTarget & {
  json?: unknown;
  state?: unknown;
};

function setCheckoutClientApiState(apiState: unknown) {
  Object.defineProperty(checkoutClient, "state", {
    configurable: true,
    value: undefined,
    writable: true,
  });
  Object.defineProperty(checkoutClient, "json", {
    configurable: true,
    value: apiState,
    writable: true,
  });
}

function clearCheckoutClientApiState() {
  delete (checkoutClient as CheckoutApiLike).state;
  delete (checkoutClient as CheckoutApiLike).json;
}

async function waitForRender(): Promise<void> {
  await Promise.resolve();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await Promise.resolve();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

describe("ExpressCheckoutElement", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    setCheckoutClientApiState(null);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    clearCheckoutClientApiState();
  });

  it("tracks only lang in observedAttributes", () => {
    expect(ExpressCheckoutElement.observedAttributes).toEqual(["lang"]);
  });

  it("renders the missing-config fallback when checkout client has no supported express checkout config", async () => {
    setCheckoutClientApiState({
      express_checkout_options: [{ type: "apple-pay" }],
    });

    const element = document.createElement(
      EXPRESS_CHECKOUT_ELEMENT_TAG,
    ) as ExpressCheckoutElement;

    document.body.append(element);
    await waitForRender();

    expect(element.shadowRoot?.textContent).toContain(
      "Express checkout is not configured yet.",
    );
  });

  it("renders the missing-config fallback when the express checkout config has no publishable key", async () => {
    setCheckoutClientApiState({
      express_checkout_options: [
        {
          type: "stripe-express-checkout-element",
          gateway: "stripe_v2",
          config: {},
        },
      ],
    });

    const element = document.createElement(
      EXPRESS_CHECKOUT_ELEMENT_TAG,
    ) as ExpressCheckoutElement;

    document.body.append(element);
    await waitForRender();

    expect(element.shadowRoot?.textContent).toContain(
      "Express checkout is not configured yet.",
    );
  });
});
