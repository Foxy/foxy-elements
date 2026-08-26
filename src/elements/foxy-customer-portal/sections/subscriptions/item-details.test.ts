import { describe, expect, it } from "vitest";
import { visibleItemDetails } from "./item-details";

const item = {
  code: "WIDGET-1",
  weight: 2.4,
  _embedded: {
    "fx:item_options": [
      { name: "Engraving", value: "A. Marsh" },
      { name: "Gift note", value: "Happy birthday" },
    ],
  },
};

describe("visibleItemDetails", () => {
  it("shows options, weight and code when nothing is configured", () => {
    // Every flag defaults to true, matching how the sub flags already behave:
    // an older template config never loses fields it never opted out of.
    expect(visibleItemDetails(item, null)).toEqual([
      { kind: "option", name: "Engraving", value: "A. Marsh" },
      { kind: "option", name: "Gift note", value: "Happy birthday" },
      { kind: "weight", value: "2.4" },
      { kind: "code", value: "WIDGET-1" },
    ]);
  });

  it("drops every option when show_product_options is off", () => {
    const rows = visibleItemDetails(item, { show_product_options: false });
    expect(rows.some((row) => row.kind === "option")).toBe(false);
    // The other two are governed by their own flags, not this one.
    expect(rows.map((row) => row.kind)).toEqual(["weight", "code"]);
  });

  it("drops only the options named in hidden_product_options", () => {
    const rows = visibleItemDetails(item, {
      hidden_product_options: ["Gift note"],
    });
    expect(rows.filter((row) => row.kind === "option")).toEqual([
      { kind: "option", name: "Engraving", value: "A. Marsh" },
    ]);
  });

  it("matches hidden option names without regard to case or padding", () => {
    const rows = visibleItemDetails(item, {
      hidden_product_options: ["  gift NOTE "],
    });
    expect(rows.filter((row) => row.kind === "option")).toHaveLength(1);
  });

  it("drops weight and code on their own flags", () => {
    expect(
      visibleItemDetails(item, { show_product_weight: false }).some(
        (row) => row.kind === "weight",
      ),
    ).toBe(false);
    expect(
      visibleItemDetails(item, { show_product_code: false }).some(
        (row) => row.kind === "code",
      ),
    ).toBe(false);
  });

  it("omits rows the item has no value for", () => {
    expect(visibleItemDetails({}, null)).toEqual([]);
    expect(visibleItemDetails({ weight: 0, code: "" }, null)).toEqual([]);
  });

  it("survives an item whose options were never embedded", () => {
    // Three-level zoom is assumed to work, but an item that arrives without
    // the embed must render as an item with no options, not throw.
    expect(visibleItemDetails({ code: "X" }, null)).toEqual([
      { kind: "code", value: "X" },
    ]);
  });
});
