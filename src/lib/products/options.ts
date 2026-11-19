import type {
  CatalogProduct,
  OptionValue,
  ProductModifier,
  ProductOptionDefinition,
} from "./types";

export interface ProductOption {
  name: string;
  label: string;
  values: Array<OptionValue & { label: string }>;
}

/** A parent's declared options, with every label filled in. */
export function productOptions(product: CatalogProduct): ProductOption[] {
  return (product.definition.options ?? []).map(
    (option: ProductOptionDefinition) => ({
      name: option.name,
      label: option.label || option.name,
      values: option.values.map((value) =>
        typeof value === "string"
          ? { value, label: value }
          : { ...value, label: value.label || value.value },
      ),
    }),
  );
}

/**
 * A key for a set of option values, to compare a shopper's choices with a
 * variant's: names and values lowercased and trimmed, sorted by name,
 * URI-encoded and joined with `&`.
 */
export function optionKey(values: Record<string, string>): string {
  return Object.entries(values)
    .map(([name, value]) => [name.trim().toLowerCase(), value.trim().toLowerCase()])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join("&");
}

function same(a: string | undefined, b: string): boolean {
  return a !== undefined && a.trim().toLowerCase() === b.trim().toLowerCase();
}

function matches(
  variant: CatalogProduct,
  choices: Record<string, string>,
): boolean {
  const values = variant.option_values ?? {};
  return Object.entries(choices).every(([name, value]) => same(values[name], value));
}

/**
 * Whether a parent can offer option controls: it declares options and its
 * variants say which values they have. Otherwise the form falls back to a
 * list of the variants by name.
 */
export function hasOptionControls(product: CatalogProduct): boolean {
  const variants = product._embedded?.variants ?? [];
  return (
    productOptions(product).length > 0 &&
    variants.length > 0 &&
    variants.every((variant) => variant.option_values)
  );
}

/**
 * - `available`: some variant with this value, and the earlier choices, is in
 *   stock;
 * - `sold-out`: such variants exist, but none is in stock;
 * - `missing`: no variant has this value with the earlier choices (or it is
 *   hidden, which the catalog leaves out). Missing values aren't offered.
 */
export type ValueState = "available" | "sold-out" | "missing";

/**
 * The state of each value of the option at `index`, given the choices made
 * for the options before it. Only earlier options count, so choosing a later
 * value never takes an earlier one away.
 */
export function valueStates(
  product: CatalogProduct,
  index: number,
  choices: Record<string, string>,
): Map<string, ValueState> {
  const options = productOptions(product);
  const option = options[index];
  const earlier: Record<string, string> = {};
  for (const previous of options.slice(0, index)) {
    if (choices[previous.name] !== undefined) {
      earlier[previous.name] = choices[previous.name];
    }
  }

  const variants = product._embedded?.variants ?? [];
  const states = new Map<string, ValueState>();
  for (const { value } of option?.values ?? []) {
    const candidates = variants.filter((variant) =>
      matches(variant, { ...earlier, [option.name]: value }),
    );
    states.set(
      value,
      !candidates.length
        ? "missing"
        : candidates.some((variant) => variant.is_in_stock)
          ? "available"
          : "sold-out",
    );
  }
  return states;
}

/**
 * The choices a shopper can still have, in the options' order: each one
 * whose value, with the choices kept before it, has a variant in stock.
 * The rest are dropped, so the shopper chooses again; nothing is chosen for
 * them.
 */
export function keepOffered(
  product: CatalogProduct,
  choices: Record<string, string>,
): Record<string, string> {
  const kept: Record<string, string> = {};
  productOptions(product).forEach((option, index) => {
    const states = valueStates(product, index, kept);
    const chosen = option.values.find(
      ({ value }) =>
        same(choices[option.name], value) && states.get(value) === "available",
    );
    if (chosen) kept[option.name] = chosen.value;
  });
  return kept;
}

/** The variant that has exactly these values, if there is one. */
export function variantFor(
  product: CatalogProduct,
  choices: Record<string, string>,
): CatalogProduct | undefined {
  const names = productOptions(product).map(({ name }) => name);
  if (!names.every((name) => choices[name] !== undefined)) return undefined;
  const key = optionKey(Object.fromEntries(names.map((name) => [name, choices[name]])));
  return product._embedded?.variants?.find(
    (variant) => variant.option_values && optionKey(variant.option_values) === key,
  );
}

/** Parses `color=Black&size=M` (an element's `value`) into choices. */
export function parseChoices(value: string | null): Record<string, string> {
  const choices: Record<string, string> = {};
  if (!value) return choices;
  for (const [name, choice] of new URLSearchParams(value)) choices[name] = choice;
  return choices;
}

export function productModifiers(product: CatalogProduct): ProductModifier[] {
  return product.definition.modifiers ?? [];
}

/**
 * Whether one click is enough to buy it: anything but a parent with
 * variants (the cart refuses those), with no required modifier left
 * without a value in `modifiers` (optional ones are simply left off).
 */
export function isOneClick(product: CatalogProduct, modifiers: Record<string, string> = {}): boolean {
  const hasVariants =
    product.product_type === "parent" &&
    ((product.variant_count ?? 0) > 0 ||
      (product._embedded?.variants?.length ?? 0) > 0);
  return (
    !hasVariants &&
    !productModifiers(product).some((modifier) => modifier.required && !modifiers[modifier.name])
  );
}
