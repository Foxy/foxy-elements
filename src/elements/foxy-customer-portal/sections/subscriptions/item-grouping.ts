export type SubscriptionTemplateItem = {
  name: string;
  quantity: number;
  image?: string;
  code?: string;
  parent_code?: string;
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
