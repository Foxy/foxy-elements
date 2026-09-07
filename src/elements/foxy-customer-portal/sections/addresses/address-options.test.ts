import { describe, expect, it } from "vitest";
import { toCountryOptions } from "@foxy.io/sdk/checkout";
import { addressTypeFor, codesFrom, withSavedCode } from "./address-options";

describe("addressTypeFor", () => {
  it("asks for the billing list only for a default billing address", () => {
    expect(addressTypeFor({ is_default_billing: true })).toBe("billing");
    expect(addressTypeFor({ is_default_shipping: true })).toBe("shipping");
  });

  it("treats an unflagged address as shipping", () => {
    // Foxy infers "shipping" when neither flag is set. Treating it as
    // unconstrained would offer countries the store cannot ship to.
    expect(addressTypeFor({})).toBe("shipping");
    expect(
      addressTypeFor({ is_default_billing: false, is_default_shipping: false }),
    ).toBe("shipping");
  });
});

describe("codesFrom", () => {
  it("reads the codes out of a values map", () => {
    expect(codesFrom({ US: {}, CA: {} })).toEqual(["US", "CA"]);
  });

  it("answers with nothing for a payload it cannot read", () => {
    expect(codesFrom(undefined)).toEqual([]);
    expect(codesFrom({})).toEqual([]);
  });

  it("is what stops the values map reaching the SDK helpers", () => {
    // The trap this function exists for: `toCountryOptions` takes an ARRAY
    // and returns [] for anything else -- no throw, no warning. Passing the
    // response map straight in empties the dropdown silently, which is
    // indistinguishable from a store that sells nowhere.
    const values = { US: {}, CA: {} };

    expect(toCountryOptions(values as never, "en-US")).toEqual([]);
    expect(toCountryOptions(codesFrom(values), "en-US")).toHaveLength(2);
  });
});

describe("withSavedCode", () => {
  it("leaves a list that already offers the saved value alone", () => {
    expect(withSavedCode(["US", "CA"], "US")).toEqual(["US", "CA"]);
  });

  it("keeps a saved value the store no longer offers", () => {
    // A store can narrow its countries after an address was saved. Dropping
    // the value would mean editing an unrelated field silently rewrote the
    // customer's country.
    expect(withSavedCode(["US", "CA"], "JP")).toEqual(["US", "CA", "JP"]);
  });

  it("stays empty when there is no list at all", () => {
    // An empty result is the caller's signal to fall back to free text.
    // Returning just the saved value would render a one-option Select the
    // customer cannot change.
    expect(withSavedCode([], "JP")).toEqual([]);
  });

  it("ignores a blank saved value", () => {
    expect(withSavedCode(["US"], "")).toEqual(["US"]);
    expect(withSavedCode(["US"], "   ")).toEqual(["US"]);
    expect(withSavedCode(["US"], null)).toEqual(["US"]);
  });
});
