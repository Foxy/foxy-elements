import { describe, expect, it } from "vitest";
import {
  groupItemsByShipment,
  groupLineItems,
  lineItemsTitle,
} from "./line-items";

describe("groupLineItems", () => {
  it("treats every item as a parent when none carry code/parent_code", () => {
    const { parents, children } = groupLineItems([
      { name: "Widget", quantity: 1 },
      { name: "Grinder", quantity: 1 },
    ]);

    expect(parents).toHaveLength(2);
    expect(children).toHaveLength(0);
  });

  it("groups a child under its parent by code/parent_code", () => {
    const { parents, children } = groupLineItems([
      { name: "Coffee Subscription", quantity: 1, code: "COFFEE" },
      { name: "Extra Filters", quantity: 2, parent_code: "COFFEE" },
      { name: "Coffee Mugs", quantity: 1, parent_code: "COFFEE" },
    ]);

    expect(parents).toHaveLength(1);
    expect(parents[0].name).toBe("Coffee Subscription");
    expect(children.map((c) => c.name)).toEqual([
      "Extra Filters",
      "Coffee Mugs",
    ]);
  });

  it("leaves an item with an unmatched parent_code as its own parent", () => {
    const { parents, children } = groupLineItems([
      { name: "Orphan", quantity: 1, parent_code: "NOBODY" },
    ]);

    expect(parents).toHaveLength(1);
    expect(children).toHaveLength(0);
  });

  it("treats multiple root items with no relationship as multiple parents", () => {
    const { parents, children } = groupLineItems([
      { name: "A", quantity: 1, code: "A" },
      { name: "B", quantity: 1, code: "B" },
    ]);

    expect(parents).toHaveLength(2);
    expect(children).toHaveLength(0);
  });
});

describe("lineItemsTitle", () => {
  it("joins every item's label when nothing is bundled", () => {
    expect(
      lineItemsTitle([
        { name: "Coffee", quantity: 2 },
        { name: "Grinder", quantity: 1 },
      ]),
    ).toBe("Coffee ×2, Grinder");
  });

  it("uses the parent's name alone for a single bundle", () => {
    expect(
      lineItemsTitle([
        { name: "Pour-Over Kit", quantity: 1, code: "KIT" },
        { name: "Paper Filters", quantity: 2, parent_code: "KIT" },
      ]),
    ).toBe("Pour-Over Kit");
  });

  // One cart can hold several bundles -- far more likely for an order than
  // for a subscription template, which is why this only surfaced once
  // `OrderCard` started using this helper. Naming the children here would
  // list every part of every bundle in the heading.
  it("names only the parents when a cart holds more than one bundle", () => {
    expect(
      lineItemsTitle([
        { name: "Pour-Over Kit", quantity: 1, code: "KIT" },
        { name: "Paper Filters", quantity: 2, parent_code: "KIT" },
        { name: "Grinder", quantity: 1, code: "GRINDER" },
        { name: "Burr Set", quantity: 1, parent_code: "GRINDER" },
      ]),
    ).toBe("Pour-Over Kit, Grinder");
  });

  it("returns an empty string for no items, leaving the fallback to the caller", () => {
    expect(lineItemsTitle([])).toBe("");
  });
});

describe("groupItemsByShipment", () => {
  // Not multiship: one destination, so headings would add a label to every
  // item and tell the customer nothing they cannot already see.
  it("returns null when every item ships to the same place", () => {
    expect(
      groupItemsByShipment([
        { name: "A", quantity: 1, shipto: "Home" },
        { name: "B", quantity: 1, shipto: "Home" },
      ]),
    ).toBeNull();
  });

  it("returns null when no item carries a shipto", () => {
    expect(
      groupItemsByShipment([
        { name: "A", quantity: 1 },
        { name: "B", quantity: 1 },
      ]),
    ).toBeNull();
  });

  it("returns null for a single item", () => {
    expect(
      groupItemsByShipment([{ name: "A", quantity: 1, shipto: "Home" }]),
    ).toBeNull();
  });

  it("groups by shipto once there are two destinations", () => {
    const groups = groupItemsByShipment([
      { name: "Coffee", quantity: 1, shipto: "Home" },
      { name: "Blend", quantity: 1, shipto: "Office" },
      { name: "Mug", quantity: 1, shipto: "Home" },
    ]);

    expect(groups).toEqual([
      {
        shipto: "Home",
        items: [
          { name: "Coffee", quantity: 1, shipto: "Home" },
          { name: "Mug", quantity: 1, shipto: "Home" },
        ],
      },
      { shipto: "Office", items: [{ name: "Blend", quantity: 1, shipto: "Office" }] },
    ]);
  });

  // The panel below lists shipments in the API's order, which need not match
  // the items'. Ordering groups by where each destination first appears in
  // the item list keeps this independent of that separate request.
  it("orders groups by where each destination first appears", () => {
    const groups = groupItemsByShipment([
      { name: "A", quantity: 1, shipto: "Office" },
      { name: "B", quantity: 1, shipto: "Home" },
    ]);

    expect(groups?.map((group) => group.shipto)).toEqual(["Office", "Home"]);
  });

  // A shipped order can carry an unshipped line -- a digital download, or a
  // discount line. It belongs to no destination, so it goes in a group with
  // no name, last, which the caller renders without a heading.
  it("puts items with no shipto in an unnamed group at the end", () => {
    const groups = groupItemsByShipment([
      { name: "Download", quantity: 1 },
      { name: "Coffee", quantity: 1, shipto: "Home" },
      { name: "Blend", quantity: 1, shipto: "Office" },
    ]);

    expect(groups?.map((group) => group.shipto)).toEqual(["Home", "Office", ""]);
    expect(groups?.at(-1)?.items.map((item) => item.name)).toEqual([
      "Download",
    ]);
  });

  // One real destination plus unshipped lines is still not multiship: there is
  // only one place anything is going.
  it("returns null when only one destination exists beside unshipped lines", () => {
    expect(
      groupItemsByShipment([
        { name: "Download", quantity: 1 },
        { name: "Coffee", quantity: 1, shipto: "Home" },
      ]),
    ).toBeNull();
  });

  it("treats a whitespace-only shipto as no destination", () => {
    expect(
      groupItemsByShipment([
        { name: "A", quantity: 1, shipto: "  " },
        { name: "B", quantity: 1, shipto: "Home" },
      ]),
    ).toBeNull();
  });
});
