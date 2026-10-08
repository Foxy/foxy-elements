import { describe, expect, it, vi } from "vitest";

import {
  completeBillingDetails,
  matchElementsToIntent,
  parseElementsOptions,
} from "./payment-option";

describe("completeBillingDetails", () => {
  // The Payment Element is created with every billing field set to "never", so
  // confirmPayment has to name all of them. Leaving out an optional field the
  // shopper left empty made Stripe refuse the confirmation outright.
  it("sends every billing field, with empty optional ones as empty strings", () => {
    expect(
      completeBillingDetails({
        name: "Test Shopper",
        email: "shopper@example.com",
        address: {
          country: "US",
          line1: "100 Test St",
          city: "Birmingham",
          state: "AL",
          postal_code: "35203",
        },
      }),
    ).toEqual({
      name: "Test Shopper",
      email: "shopper@example.com",
      phone: "",
      address: {
        country: "US",
        line1: "100 Test St",
        line2: "",
        city: "Birmingham",
        state: "AL",
        postal_code: "35203",
      },
    });
  });
});

describe("parseElementsOptions", () => {
  // react-stripe-js only passes keys that are present on to elements.update(),
  // so leaving the key out would never clear a setupFutureUsage set earlier —
  // a shopper who switches to guest would still be asked to save the card.
  it("unsets card saving explicitly rather than leaving the key out", () => {
    const { elementsOptions } = parseElementsOptions("en", undefined, {
      mode: "payment",
      amount: 1000,
      currency: "usd",
    });

    expect(elementsOptions).toHaveProperty("setupFutureUsage", null);
  });

  it("keeps card saving when the intent will save the card", () => {
    const { elementsOptions } = parseElementsOptions("en", undefined, {
      mode: "payment",
      amount: 1000,
      currency: "usd",
      setupFutureUsage: "off_session",
    });

    expect(elementsOptions).toHaveProperty("setupFutureUsage", "off_session");
  });
});

describe("matchElementsToIntent", () => {
  function fakes(intent: Record<string, unknown> | undefined) {
    const calls: string[] = [];
    const stripe = {
      retrievePaymentIntent: vi.fn(async () => {
        calls.push("retrieve");
        return { paymentIntent: intent };
      }),
    };
    const elements = {
      update: vi.fn(() => calls.push("update")),
      submit: vi.fn(async () => {
        calls.push("submit");
        return {};
      }),
    };
    return { calls, stripe, elements };
  }

  // The backend decides at submit whether the intent saves the card, and
  // Stripe refuses to confirm when the Payment Element disagrees. Whatever the
  // element guessed, the intent it is about to confirm is the one to match.
  it("takes card saving and capture from the intent, then re-validates", async () => {
    const { calls, stripe, elements } = fakes({
      setup_future_usage: "off_session",
      capture_method: "manual",
    });

    await matchElementsToIntent(
      stripe as never,
      elements as never,
      "pi_1_secret_2",
    );

    expect(stripe.retrievePaymentIntent).toHaveBeenCalledWith("pi_1_secret_2");
    expect(elements.update).toHaveBeenCalledWith({
      setupFutureUsage: "off_session",
      captureMethod: "manual",
    });
    expect(calls).toEqual(["retrieve", "update", "submit"]);
  });

  it("unsets card saving when the intent does not save the card", async () => {
    const { stripe, elements } = fakes({
      setup_future_usage: null,
      capture_method: "automatic",
    });

    await matchElementsToIntent(
      stripe as never,
      elements as never,
      "pi_1_secret_2",
    );

    expect(elements.update).toHaveBeenCalledWith({
      setupFutureUsage: null,
      captureMethod: "automatic",
    });
  });

  it("leaves Elements alone when the intent cannot be read", async () => {
    const { stripe, elements } = fakes(undefined);

    await matchElementsToIntent(
      stripe as never,
      elements as never,
      "pi_1_secret_2",
    );

    expect(elements.update).not.toHaveBeenCalled();
    expect(elements.submit).not.toHaveBeenCalled();
  });
});
