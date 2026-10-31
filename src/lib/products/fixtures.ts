import { clearCatalogCache } from "./catalog";
import type { CatalogProduct } from "./types";

/** The store domain every fixture is served from. */
export const FIXTURE_STORE = "demo-goods.foxycart.com";

const IMAGE = "https://images.example.com";

const teeDefinition = {
  name: "Organic Cotton Tee",
  brand: "Foxy Goods",
  gtin: "00850006493014",
  price: "24.95",
  prices: { EUR: "22.95" },
  images: [{ src: `${IMAGE}/tee-black.jpg`, alt: "Black organic cotton tee", width: 1200, height: 1200 }],
  description: "Heavyweight 6.1 oz organic cotton, garment dyed.",
  translations: { fr_FR: { name: "T-shirt en coton bio" } },
  options: [
    {
      name: "color",
      label: "Colour",
      values: [
        { value: "Black", sku_code: "BLK", color: "#1d1d1f" },
        { value: "Natural", label: "Natural (undyed)", sku_code: "NAT", color: "#e8dcc4" },
        { value: "Moss", sku_code: "MOS", color: "#5b6b3a" },
      ],
    },
    {
      name: "size",
      label: "Size",
      values: [
        { value: "S" },
        { value: "M" },
        { value: "L" },
        { value: "2XL", price_mod: "2.00", price_mods: { EUR: "1.85" } },
      ],
    },
  ],
  modifiers: [
    { name: "gift_wrap", label: "Gift wrap", type: "select" as const, values: [
      { value: "No", label: "No thanks" },
      { value: "Yes", label: "Wrap it", price_mod: "4.50", price_mods: { EUR: "4.20" } },
    ] },
  ],
};

function teeVariant(
  sku: string,
  color: string,
  size: string,
  inStock: boolean,
  price = "24.95",
  eur = "22.95",
): CatalogProduct {
  return {
    sku,
    product_type: "variant",
    display_name: `Organic Cotton Tee - ${size} / ${color}`,
    is_in_stock: inStock,
    option_values: { color, size },
    definition: {
      ...teeDefinition,
      name: `Organic Cotton Tee - ${size} / ${color}`,
      price,
      prices: { EUR: eur },
    },
    _links: { add_to_cart: { href: `https://${FIXTURE_STORE}/cart?sku=${sku}` } },
  };
}

/**
 * A parent with two options. Black comes in S, M and 2XL (M sold out);
 * Natural only in M and L; Moss in S only, sold out. So for Natural, S and
 * 2XL are missing; for Moss, everything is sold out or missing.
 */
export const teeParent: CatalogProduct = {
  sku: "TEE-ORG",
  product_type: "parent",
  display_name: "Organic Cotton Tee",
  display_price: 24.95,
  is_in_stock: true,
  variant_count: 6,
  definition: teeDefinition,
  _links: { self: { href: "/s/products/TEE-ORG" } },
  _embedded: {
    variants: [
      teeVariant("TEE-ORG-BLK-S", "Black", "S", true),
      teeVariant("TEE-ORG-BLK-M", "Black", "M", false),
      teeVariant("TEE-ORG-BLK-2XL", "Black", "2XL", true, "26.95", "24.80"),
      teeVariant("TEE-ORG-NAT-M", "Natural", "M", true),
      teeVariant("TEE-ORG-NAT-L", "Natural", "L", true),
      teeVariant("TEE-ORG-MOS-S", "Moss", "S", false),
    ],
  },
};

/** A standalone product with a required text modifier and an optional select. */
export const engravedMug: CatalogProduct = {
  sku: "MUG-ENM-ENGRAVE",
  product_type: "standalone",
  display_name: "Engraved Enamel Mug",
  display_price: 21.5,
  is_in_stock: true,
  definition: {
    name: "Engraved Enamel Mug",
    brand: "Foxy Goods",
    price: "21.50",
    list_price: "24.00",
    images: [{ src: `${IMAGE}/mug-engraved.jpg`, alt: "Enamel mug with an engraved name", width: 1000, height: 1000 }],
    modifiers: [
      { name: "engraving", label: "Engraving", type: "text", required: true, max_length: 20, price_mod: "6.00" },
      { name: "gift_wrap", label: "Gift wrap", type: "select", values: [
        { value: "No", label: "No thanks" },
        { value: "Yes", label: "Wrap it", price_mod: "4.50" },
      ] },
    ],
  },
  _links: { add_to_cart: { href: `https://${FIXTURE_STORE}/cart?sku=MUG-ENM-ENGRAVE` } },
};

/** A standalone product with nothing to choose. */
export const plainMug: CatalogProduct = {
  sku: "MUG-ENM-WHT",
  product_type: "standalone",
  display_name: "Enamel Camp Mug, White",
  display_price: 16.4,
  is_in_stock: true,
  definition: {
    name: "Enamel Camp Mug, White",
    brand: "Foxy Goods",
    price: 16.4,
    list_price: "18.90",
    prices: { EUR: "15.20" },
    images: [{ src: `${IMAGE}/mug-white.jpg`, alt: "White enamel camp mug", width: 1000, height: 1000 }],
  },
  _links: { add_to_cart: { href: `https://${FIXTURE_STORE}/cart?sku=MUG-ENM-WHT` } },
};

export const soldOutBeans: CatalogProduct = {
  sku: "COF-HUILA-340",
  product_type: "standalone",
  display_name: "Huila Single Origin, 340 g",
  display_price: 17.25,
  is_in_stock: false,
  definition: {
    name: "Huila Single Origin, 340 g",
    price: "17.25",
    images: [{ src: `${IMAGE}/coffee-huila.jpg`, alt: "Bag of Huila coffee beans" }],
  },
  _links: { add_to_cart: { href: `https://${FIXTURE_STORE}/cart?sku=COF-HUILA-340` } },
};

/**
 * A parent whose variants predate options: no `options`, no
 * `option_values`, so the form lists the variants by name.
 */
export const legacyParent: CatalogProduct = {
  sku: "SOCK-WOOL",
  product_type: "parent",
  display_name: "Merino Hiking Socks",
  is_in_stock: true,
  variant_count: 3,
  definition: { name: "Merino Hiking Socks", price: "18.00" },
  _embedded: {
    variants: [
      { sku: "SOCK-WOOL-S", product_type: "variant", is_in_stock: true, display_name: "Merino Hiking Socks - Small", definition: { name: "Merino Hiking Socks - Small", price: "18.00" } },
      { sku: "SOCK-WOOL-M", product_type: "variant", is_in_stock: false, display_name: "Merino Hiking Socks - Medium", definition: { name: "Merino Hiking Socks - Medium", price: "18.00" } },
      { sku: "SOCK-WOOL-L", product_type: "variant", is_in_stock: true, display_name: "Merino Hiking Socks - Large", definition: { name: "Merino Hiking Socks - Large", price: "19.50" } },
    ],
  },
};

export const fixtureProducts = [teeParent, engravedMug, plainMug, soldOutBeans, legacyParent];

/** A listed parent, as `/s/products` returns it: without its variants. */
export function listed(product: CatalogProduct): CatalogProduct {
  const { _embedded: _variants, ...rest } = product;
  return rest;
}

export interface CatalogStub {
  requests: string[];
  restore(): void;
}

/**
 * Answers the catalog's URLs for `FIXTURE_STORE` from fixtures:
 * `/s/products/<sku>` and `/s/products` (two products a page). Anything else
 * goes to the real `fetch`.
 */
export function stubCatalog(products: CatalogProduct[] = fixtureProducts): CatalogStub {
  clearCatalogCache();
  const realFetch = window.fetch;
  const requests: string[] = [];
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  window.fetch = async (input, init) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    if (url.host !== FIXTURE_STORE) return realFetch(input, init);
    requests.push(url.pathname + url.search);

    const single = /^\/s\/products\/(.+)$/.exec(url.pathname);
    if (single) {
      const product = products.find((p) => p.sku === decodeURIComponent(single[1]));
      return product ? json(product) : json({ message: "Product not found." }, 404);
    }

    if (url.pathname === "/s/products") {
      const listedProducts = products.filter((p) => p.product_type !== "variant");
      const start = Number(url.searchParams.get("cursor") ?? 0);
      const page = listedProducts.slice(start, start + 2).map(listed);
      const next = start + 2 < listedProducts.length ? `/s/products?cursor=${start + 2}` : null;
      return json({
        total_items: listedProducts.length,
        _links: { self: { href: url.pathname }, ...(next ? { next: { href: next } } : {}) },
        _embedded: { "fx:products": page },
      });
    }

    return json({ message: "Not found." }, 404);
  };

  return {
    requests,
    restore() {
      window.fetch = realFetch;
      clearCatalogCache();
    },
  };
}
