import { describe, expect, it } from "vitest";

import { completeBillingDetails } from "./payment-option";

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
