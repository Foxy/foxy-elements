import type { ItemOptionResource } from "./item-details";

export type SubscriptionTemplateItem = {
  name: string;
  quantity: number;
  image?: string;
  code?: string;
  parent_code?: string;
  price?: number;
  weight?: number;
  _embedded?: { "fx:item_options"?: ItemOptionResource[] };
};

export type GroupedSubscriptionItems = {
  parents: SubscriptionTemplateItem[];
  children: SubscriptionTemplateItem[];
};

/**
 * An item is a child of another when its `parent_code` matches that other
 * item's `code`, both real fields on `fx:item` (see the design spec, §2).
 * Everything else -- including an item whose `parent_code` points at a code
 * absent from this same list -- is treated as its own parent, so a single
 * malformed/partial template degrades to today's flat display instead of
 * silently dropping an item.
 */
export function groupSubscriptionItems(
  items: SubscriptionTemplateItem[],
): GroupedSubscriptionItems {
  const byCode = new Map(
    items.filter((item) => item.code).map((item) => [item.code, item]),
  );
  const children = items.filter(
    (item) => item.parent_code && byCode.has(item.parent_code),
  );
  const parents = items.filter((item) => !children.includes(item));

  return { parents, children };
}

/** One item as it appears in a title: its name, with `×{quantity}` above 1. */
export function itemLabel(item: SubscriptionTemplateItem): string {
  return item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name;
}

/**
 * The heading a subscription is shown under: the parent's name alone when the
 * items form a bundle (one parent with children), otherwise every item's
 * label joined.
 *
 * Shared by the home page's `SubscriptionCard` and the detail page's `<h1>`
 * so the two cannot disagree. They did: the page joined raw `item.name`s, so
 * a card headed "Coffee Subscription -- Dark Roast" opened a page headed
 * "Coffee Subscription -- Dark Roast, Extra Filters, Coffee Mugs".
 *
 * Returns "" for an empty item list. Callers decide what to show then -- the
 * detail page falls back to its id alone.
 */
export function subscriptionTitle(items: SubscriptionTemplateItem[]): string {
  const { parents, children } = groupSubscriptionItems(items);
  const isBundle = parents.length === 1 && children.length > 0;

  return isBundle ? parents[0].name : items.map(itemLabel).join(", ");
}
