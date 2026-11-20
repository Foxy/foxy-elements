import { amountIn, productPrice } from "./price";
import {
  hasOptionControls,
  productModifiers,
  productOptions,
  variantFor,
} from "./options";
import type { CatalogProduct, ProductModifier } from "./types";

export interface PurchaseState {
  /** Option name to chosen value, for a parent with option controls. */
  choices: Record<string, string>;
  /** The chosen variant's SKU, for a parent listed by variant name. */
  variantSku: string | null;
  /** Modifier name to value; empty or missing means not chosen. */
  modifiers: Record<string, string>;
  quantity: number;
}

/**
 * The product the shopper's choices add: the variant for a parent, once
 * every option is chosen.
 */
export function chosenProduct(
  product: CatalogProduct,
  state: PurchaseState,
): CatalogProduct | undefined {
  if (product.product_type !== "parent" || !product._embedded?.variants?.length) {
    return product;
  }
  if (hasOptionControls(product)) return variantFor(product, state.choices);
  return product._embedded.variants.find((v) => v.sku === state.variantSku);
}

/**
 * The modifiers to offer: the chosen variant's, because the cart checks an
 * add against the variant's own list, which can add to or remove from its
 * parent's. Until a variant is chosen, what the parent declares.
 */
export function offeredModifiers(
  product: CatalogProduct,
  state: PurchaseState,
): ProductModifier[] {
  return productModifiers(chosenProduct(product, state) ?? product);
}

/**
 * Modifier values for a new list of modifiers: what the shopper already
 * entered for those still offered, and the first declared value for an
 * optional choice that has none.
 */
export function modifierValues(
  modifiers: ProductModifier[],
  previous: Record<string, string> = {},
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const modifier of modifiers) {
    const kept = previous[modifier.name];
    if (kept !== undefined) values[modifier.name] = kept;
    else if (modifier.type === "select" && !modifier.required && modifier.values?.length) {
      values[modifier.name] = modifier.values[0].value;
    }
  }
  return values;
}

/**
 * What the cart is sent, in order. The cart accepts only `sku`, `quantity`,
 * a parent's option names and the chosen product's declared modifiers for a
 * catalog product, and refuses anything else; empty modifiers are left out.
 */
export function cartFields(
  product: CatalogProduct,
  state: PurchaseState,
): Array<[string, string]> {
  const fields: Array<[string, string]> = [];

  if (hasOptionControls(product)) {
    fields.push(["sku", product.sku]);
    for (const { name } of productOptions(product)) {
      const value = state.choices[name];
      if (value !== undefined) fields.push([name, value]);
    }
  } else {
    fields.push(["sku", chosenProduct(product, state)?.sku ?? product.sku]);
  }

  for (const { name } of offeredModifiers(product, state)) {
    const value = state.modifiers[name]?.trim();
    if (value) fields.push([name, value]);
  }

  if (state.quantity > 1) fields.push(["quantity", String(state.quantity)]);
  return fields;
}

export function modifierAmount(
  modifier: ProductModifier,
  value: string | undefined,
  currency: string | null,
): number {
  if (!value?.trim()) return 0;
  const source =
    modifier.type === "select"
      ? modifier.values?.find((v) => v.value.toLowerCase() === value.trim().toLowerCase())
      : modifier;
  return source ? amountIn(source.price_mod, source.price_mods, currency) ?? 0 : 0;
}

/**
 * One unit's price with the chosen modifiers, as the cart will compute it,
 * the list price beside it when it's higher, and the currency they are in.
 * `null` while no variant is chosen.
 */
export function livePrice(
  product: CatalogProduct,
  state: PurchaseState,
  requested: string | null,
): { price: number; listPrice: number | null; currency: string | null } | null {
  const chosen = chosenProduct(product, state);
  if (!chosen) return null;
  const { price, listPrice, currency } = productPrice(chosen, requested);
  if (price === null) return null;
  const extra = productModifiers(chosen).reduce(
    (sum, modifier) => sum + modifierAmount(modifier, state.modifiers[modifier.name], currency),
    0,
  );
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    price: round(price + extra),
    listPrice: listPrice === null ? null : round(listPrice + extra),
    currency,
  };
}

/**
 * The values in `preset` the cart would take for this product's own
 * modifiers: a select's declared value (matched without case, sent as
 * declared), or text within its length. Anything else is left out.
 */
export function presetModifiers(
  product: CatalogProduct,
  preset: Record<string, string>,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const modifier of productModifiers(product)) {
    const value = preset[modifier.name]?.trim();
    if (!value) continue;
    if (modifier.type === "select") {
      const declared = modifier.values?.find((v) => v.value.toLowerCase() === value.toLowerCase());
      if (declared) values[modifier.name] = declared.value;
    } else if (value.length <= (modifier.max_length ?? 255)) {
      values[modifier.name] = value;
    }
  }
  return values;
}

/** The offered modifiers whose value the cart would refuse, with why. */
export function invalidModifiers(
  product: CatalogProduct,
  state: PurchaseState,
): Map<string, "required" | "too-long"> {
  const invalid = new Map<string, "required" | "too-long">();
  for (const modifier of offeredModifiers(product, state)) {
    const value = state.modifiers[modifier.name]?.trim() ?? "";
    if (modifier.required && !value) invalid.set(modifier.name, "required");
    else if (modifier.type === "text" && value.length > (modifier.max_length ?? 255)) {
      invalid.set(modifier.name, "too-long");
    }
  }
  return invalid;
}

/**
 * The fewest and most units one add may ask for: the product's own limits,
 * and no more than it has in stock.
 */
export function quantityBounds(product: CatalogProduct): { min: number; max: number } {
  const { quantity_min, quantity_max } = product.definition;
  const min = quantity_min && quantity_min > 0 ? Math.floor(quantity_min) : 1;
  const limits = [quantity_max, product.stock_level].filter(
    (limit): limit is number => typeof limit === "number" && limit > 0,
  );
  return { min, max: Math.max(min, Math.min(...limits, Infinity)) };
}
