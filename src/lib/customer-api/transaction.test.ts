import { describe, expect, it } from "vitest";
import { TRANSACTION_TYPES } from "./transaction";

describe("TRANSACTION_TYPES", () => {
  it("includes the plain-order type the API actually returns", () => {
    expect(TRANSACTION_TYPES).toContain("transaction");
  });

  it("does not include the empty string the SDK wrongly declares", () => {
    expect(TRANSACTION_TYPES).not.toContain("");
  });

  it("lists the subscription-related types", () => {
    expect(TRANSACTION_TYPES).toEqual(
      expect.arrayContaining([
        "subscription_renewal",
        "subscription_modification",
        "subscription_cancellation",
        "updateinfo",
      ]),
    );
  });

  it("has no duplicates", () => {
    expect(new Set(TRANSACTION_TYPES).size).toBe(TRANSACTION_TYPES.length);
  });
});
