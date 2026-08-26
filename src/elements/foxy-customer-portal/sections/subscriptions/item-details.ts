import type { CartDisplayConfig } from "./cart-display-config";

export type ItemOptionResource = { name: string; value: string };

export type ItemWithDetails = {
  code?: string;
  weight?: number;
  _embedded?: { "fx:item_options"?: ItemOptionResource[] };
};

/**
 * One line under an item's name. `option` carries its own name from the API;
 * the other two are labelled by the UI, which is why the kind is preserved
 * rather than every row arriving as a ready-made label/value pair.
 */
export type ItemDetailRow =
  | { kind: "option"; name: string; value: string }
  | { kind: "weight"; value: string }
  | { kind: "code"; value: string };

/**
 * The rows an item is allowed to show, in the design's order: its options,
 * then weight, then code.
 *
 * Every flag defaults to `true` when absent, matching how the `show_sub_*`
 * flags already behave -- a store on an older template config, or a settings
 * response still in flight, never loses fields it never opted out of.
 *
 * A row whose value is empty is dropped regardless of its flag: a flag says
 * the store is willing to show something, not that there is something to
 * show.
 */
export function visibleItemDetails(
  item: ItemWithDetails,
  config: CartDisplayConfig | null | undefined,
): ItemDetailRow[] {
  const rows: ItemDetailRow[] = [];

  if (config?.show_product_options ?? true) {
    // Names come from the store's own option list and from a merchant-typed
    // config field, so they are compared loosely rather than exactly.
    const hidden = new Set(
      (config?.hidden_product_options ?? []).map((name) =>
        name.trim().toLowerCase(),
      ),
    );

    for (const option of item._embedded?.["fx:item_options"] ?? []) {
      if (hidden.has(option.name.trim().toLowerCase())) continue;
      if (!option.value) continue;
      rows.push({ kind: "option", name: option.name, value: option.value });
    }
  }

  if ((config?.show_product_weight ?? true) && item.weight) {
    rows.push({ kind: "weight", value: String(item.weight) });
  }

  if ((config?.show_product_code ?? true) && item.code) {
    rows.push({ kind: "code", value: item.code });
  }

  return rows;
}
