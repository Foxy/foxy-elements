/** Amounts arrive as numbers or decimal strings, depending on how they were saved. */
export type Amount = number | string;

export type PriceMap = Record<string, Amount>;

export type ProductType = "standalone" | "parent" | "variant";

export interface ProductImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface OptionValue {
  value: string;
  label?: string;
  sku_code?: string;
  color?: string;
  image?: { src: string; alt?: string };
  price_mod?: Amount;
  price_mods?: PriceMap;
}

export interface ProductOptionDefinition {
  name: string;
  label?: string;
  /** Plain strings are an older shape some stores still return. */
  values: Array<OptionValue | string>;
}

export interface ModifierValue {
  value: string;
  label?: string;
  price_mod?: Amount;
  price_mods?: PriceMap;
}

export interface ProductModifier {
  name: string;
  label?: string;
  type: "select" | "text";
  required?: boolean;
  max_length?: number;
  price_mod?: Amount;
  price_mods?: PriceMap;
  values?: ModifierValue[];
}

export interface ProductTranslation {
  name?: string;
  description?: string;
}

export interface ProductDefinition {
  name?: string;
  description?: string;
  price?: Amount;
  list_price?: Amount;
  prices?: PriceMap;
  list_prices?: PriceMap;
  images?: ProductImage[];
  brand?: string;
  gtin?: string;
  mpn?: string;
  /** Facts shown to shoppers, never sent to the cart. */
  properties?: Record<string, string | string[]>;
  options?: ProductOptionDefinition[];
  modifiers?: ProductModifier[];
  quantity_min?: number;
  quantity_max?: number;
  translations?: Record<string, ProductTranslation>;
}

/** One product from the public catalog (`/s/products`). */
export interface CatalogProduct {
  sku: string;
  product_type: ProductType;
  definition: ProductDefinition;
  display_name?: string | null;
  display_price?: number | null;
  is_in_stock: boolean;
  /** Units left; `null` when the product doesn't track stock. */
  stock_level?: number | null;
  hidden?: boolean;
  option_values?: Record<string, string> | null;
  variant_count?: number;
  _links?: Record<string, { href: string } | undefined>;
  _embedded?: { variants?: CatalogProduct[] };
}

export interface CatalogPage {
  products: CatalogProduct[];
  total: number;
  /** The path of the next page, as the catalog gave it. */
  next: string | null;
}
