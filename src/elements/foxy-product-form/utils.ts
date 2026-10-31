import { amountIn, productPrice } from "@/lib/products/price";
import {
  hasOptionControls,
  productModifiers,
  productOptions,
  variantFor,
} from "@/lib/products/options";
import type { CatalogProduct, ProductModifier } from "@/lib/products/types";

export interface FormState {
  /** Option name to chosen value, for a parent with option controls. */
  choices: Record<string, string>;
  /** The chosen variant's SKU, for a parent listed by variant name. */
  variantSku: string | null;
  /** Modifier name to value; empty or missing means not chosen. */
  modifiers: Record<string, string>;
  quantity: number;
}

/** The product the shopper's choices add: the variant for a parent. */
export function chosenProduct(
  product: CatalogProduct,
  state: FormState,
): CatalogProduct | undefined {
  if (product.product_type !== "parent" || !product._embedded?.variants?.length) {
    return product;
  }
  if (hasOptionControls(product)) return variantFor(product, state.choices);
  return product._embedded.variants.find((v) => v.sku === state.variantSku);
}

/**
 * What the cart is sent, in order. The cart accepts only `sku`, `quantity`,
 * a parent's option names and the product's declared modifiers for a
 * catalog product, and refuses anything else; empty modifiers are left out.
 */
export function cartFields(
  product: CatalogProduct,
  state: FormState,
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

  for (const { name } of productModifiers(product)) {
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
 * and the list price beside it when it's higher. `null` while no variant is
 * chosen.
 */
export function livePrice(
  product: CatalogProduct,
  state: FormState,
  currency: string | null,
): { price: number; listPrice: number | null } | null {
  const chosen = chosenProduct(product, state);
  if (!chosen) return null;
  const { price, listPrice } = productPrice(chosen, currency);
  if (price === null) return null;
  const extra = productModifiers(product).reduce(
    (sum, modifier) => sum + modifierAmount(modifier, state.modifiers[modifier.name], currency),
    0,
  );
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    price: round(price + extra),
    listPrice: listPrice === null ? null : round(listPrice + extra),
  };
}

/** The modifiers whose value the cart would refuse, with why. */
export function invalidModifiers(
  product: CatalogProduct,
  state: FormState,
): Map<string, "required" | "too-long"> {
  const invalid = new Map<string, "required" | "too-long">();
  for (const modifier of productModifiers(product)) {
    const value = state.modifiers[modifier.name]?.trim() ?? "";
    if (modifier.required && !value) invalid.set(modifier.name, "required");
    else if (modifier.type === "text" && value.length > (modifier.max_length ?? 255)) {
      invalid.set(modifier.name, "too-long");
    }
  }
  return invalid;
}
