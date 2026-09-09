/** One `fx:item_option` as the customer API embeds it under an item. */
export type ItemOptionResource = { name: string; value: string };

/**
 * One `fx:item` as the customer API embeds it, narrowed to the fields the
 * portal renders. `fx:item` is a single resource type shared by a
 * transaction's items and a subscription's transaction-template items (see
 * the SDK's `customer/Graph/item.d.ts`), so both feed the helpers below.
 */
export type LineItem = {
  name: string;
  quantity: number;
  image?: string;
  code?: string;
  parent_code?: string;
  price?: number;
  weight?: number;
  /**
   * Which shipment this line belongs to, on a multiship order: the customer's
   * own name for a destination, matching that shipment's `address_name`.
   * Empty on an ordinary single-destination order, and on a line that ships
   * nowhere (a digital download).
   */
  shipto?: string;
  /**
   * Non-empty when this line started or renewed a subscription -- a
   * `frequency` string like `"1m"`.
   *
   * The item also carries an `fx:subscription` rel whenever it belongs to
   * one: the hAPI emits it (`Item::addHyperMedia`) and the Customer API
   * allow-lists it. The SDK's customer item type does not declare that rel
   * yet, which is the only reason callers mark such a line rather than
   * linking it.
   */
  subscription_frequency?: string;
  _embedded?: { "fx:item_options"?: ItemOptionResource[] };
};

export type GroupedLineItems = {
  parents: LineItem[];
  children: LineItem[];
};

/**
 * An item is a child of another when its `parent_code` matches that other
 * item's `code`, both real fields on `fx:item` (see the design spec, §2).
 * Everything else -- including an item whose `parent_code` points at a code
 * absent from this same list -- is treated as its own parent, so a single
 * malformed/partial template degrades to today's flat display instead of
 * silently dropping an item.
 */
export function groupLineItems(
  items: LineItem[],
): GroupedLineItems {
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
export function itemLabel(item: LineItem): string {
  return item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name;
}

/**
 * The heading a cart's items are shown under: the parent's name alone when the
 * items form a single bundle, the parents' labels when there are several
 * bundles, and every item's label when nothing is bundled at all.
 *
 * Shared by the subscription card, the subscription detail page and the
 * payment card, so none of them can disagree. The first two did: the page
 * joined raw `item.name`s, so a card headed "Coffee Subscription -- Dark
 * Roast" opened a page headed "Coffee Subscription -- Dark Roast, Extra
 * Filters, Coffee Mugs".
 *
 * The several-bundles branch exists for orders. A subscription template is
 * usually one bundle, but one order can hold many, and joining every item
 * then named each bundle's parts in the heading alongside their parents --
 * "Pour-Over Kit, Paper Filters x2, Grinder, Burr Set" for two bundles.
 * Children are already listed under the title by both cards, so the heading
 * names parents only whenever anything is bundled.
 *
 * Returns "" for an empty item list. Callers decide what to show then -- the
 * subscription page falls back to its id alone, the payment card to its
 * order number.
 */
export function lineItemsTitle(items: LineItem[]): string {
  const { parents, children } = groupLineItems(items);

  // Nothing bundled: `parents` is every item, but going through `items` keeps
  // the original order rather than `groupLineItems`' partition order.
  if (children.length === 0) return items.map(itemLabel).join(", ");

  return parents.length === 1
    ? parents[0].name
    : parents.map(itemLabel).join(", ");
}

/** One destination's lines. `shipto` is `""` for lines that ship nowhere. */
export type ShipmentGroup = { shipto: string; items: LineItem[] };

/**
 * An order's lines split by destination, or `null` when the order ships to one
 * place -- which is almost all of them.
 *
 * `null` is the signal to render the flat list: on a single-destination order
 * a heading above every item repeats one fact the customer can already read
 * off the shipping panel, so the grouping earns its space only once there are
 * two destinations to tell apart.
 *
 * Groups come back in the order each destination first appears among the
 * items. Deliberately not the order the shipments arrive in: those come from
 * a separate request (`fx:shipments`), so keying off them would make the item
 * list wait on a fetch it otherwise does not need, and reorder itself when
 * that fetch lands.
 *
 * Lines with no destination -- a digital download, say -- collect in a final
 * group whose `shipto` is `""`. They ship nowhere, so naming them would
 * invent a destination; the caller renders that group without a heading. Such
 * lines never make an order multiship on their own: one real destination plus
 * a download is still one destination.
 */
export function groupItemsByShipment(items: LineItem[]): ShipmentGroup[] | null {
  const destinationOf = (item: LineItem) => item.shipto?.trim() ?? "";

  const destinations: string[] = [];
  for (const item of items) {
    const destination = destinationOf(item);
    if (destination && !destinations.includes(destination)) {
      destinations.push(destination);
    }
  }

  if (destinations.length < 2) return null;

  const groups = destinations.map((shipto) => ({
    shipto,
    items: items.filter((item) => destinationOf(item) === shipto),
  }));

  const unshipped = items.filter((item) => !destinationOf(item));
  if (unshipped.length > 0) groups.push({ shipto: "", items: unshipped });

  return groups;
}
