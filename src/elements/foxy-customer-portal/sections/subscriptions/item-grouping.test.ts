import { describe, expect, it } from "vitest";
import { groupSubscriptionItems } from "./item-grouping";

describe("groupSubscriptionItems", () => {
  it("treats every item as a parent when none carry code/parent_code", () => {
    const { parents, children } = groupSubscriptionItems([
      { name: "Widget", quantity: 1 },
      { name: "Grinder", quantity: 1 },
    ]);

    expect(parents).toHaveLength(2);
    expect(children).toHaveLength(0);
  });

  it("groups a child under its parent by code/parent_code", () => {
    const { parents, children } = groupSubscriptionItems([
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
    const { parents, children } = groupSubscriptionItems([
      { name: "Orphan", quantity: 1, parent_code: "NOBODY" },
    ]);

    expect(parents).toHaveLength(1);
    expect(children).toHaveLength(0);
  });

  it("treats multiple root items with no relationship as multiple parents", () => {
    const { parents, children } = groupSubscriptionItems([
      { name: "A", quantity: 1, code: "A" },
      { name: "B", quantity: 1, code: "B" },
    ]);

    expect(parents).toHaveLength(2);
    expect(children).toHaveLength(0);
  });
});
