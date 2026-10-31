import type { CatalogPage, CatalogProduct } from "./types";

/** What a Foxy 2.0 page's `loader.js` leaves on `window`, as far as these elements read it. */
export interface Foxy2Global {
  settings?: { storedomain?: string };
  json?: {
    template_set?: string;
    locale_info?: { int_curr_symbol?: string };
  };
  client?: { on?: (event: string, handler: () => void) => unknown };
}

declare global {
  interface Window {
    FC?: Foxy2Global;
  }
}

const LOADER_SRC = /^https:\/\/cdn\.foxycart\.com\/([^/]+)\/loader\.js/;
const DEV_LOADER_SRC = /^https:\/\/([^/]+)\/cdn\/get\.php\?.*file=loader\.js/;

/**
 * The store's domain, such as `example.foxycart.com`: the `store` attribute,
 * else the one 2.0's `foxycart.js` was loaded for, else the one in the page's
 * `loader.js` URL (which is known before `foxycart.js` has loaded).
 *
 * Cart links must contain exactly this domain: 2.0 intercepts only links and
 * forms whose URL contains `FC.settings.storedomain + "/cart"`.
 */
export function resolveStoreDomain(element: Element): string | null {
  const fromAttribute = element.getAttribute("store")?.trim();
  if (fromAttribute) return stripScheme(fromAttribute);

  const fromSettings = window.FC?.settings?.storedomain;
  if (fromSettings) return fromSettings;

  for (const script of document.querySelectorAll<HTMLScriptElement>(
    "script[src*='loader.js']",
  )) {
    const match = LOADER_SRC.exec(script.src) ?? DEV_LOADER_SRC.exec(script.src);
    if (match) return match[1];
  }

  return null;
}

function stripScheme(value: string): string {
  return value.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export function cartUrl(store: string): string {
  return `https://${store}/cart`;
}

export class CatalogError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const productCache = new Map<string, Promise<CatalogProduct | null>>();

/**
 * One product by SKU, or `null` when the store has no such product. Hidden
 * products load here too. Every element on the page shares one request per
 * SKU; a failed request is forgotten so the next element retries.
 */
export function fetchProduct(
  store: string,
  sku: string,
): Promise<CatalogProduct | null> {
  const key = `${store}\n${sku}`;
  let request = productCache.get(key);

  if (!request) {
    request = getJson<CatalogProduct>(
      `https://${store}/s/products/${encodeURIComponent(sku)}`,
    ).then(
      (product) => product,
      (error: unknown) => {
        productCache.delete(key);
        if (error instanceof CatalogError && error.status === 404) return null;
        throw error;
      },
    );
    productCache.set(key, request);
  }

  return request;
}

export interface CatalogQuery {
  collection?: string;
  tag?: string;
  inStock?: boolean;
  sort?: string;
  limit?: number;
}

/**
 * A page of listed products (standalone and parent; hidden ones are left out
 * by the catalog). Pass `next` from a previous page to continue it.
 */
export async function fetchProducts(
  store: string,
  query: CatalogQuery,
  next?: string | null,
): Promise<CatalogPage> {
  let url: string;

  if (next) {
    url = new URL(next, `https://${store}`).href;
  } else {
    const params = new URLSearchParams();
    if (query.collection) params.set("collection", query.collection);
    if (query.tag) params.set("tag", query.tag);
    if (query.inStock !== undefined) params.set("in_stock", String(query.inStock));
    if (query.sort) params.set("sort", query.sort);
    if (query.limit) params.set("limit", String(query.limit));
    const search = params.toString();
    url = `https://${store}/s/products${search ? `?${search}` : ""}`;
  }

  const body = await getJson<{
    total_items?: number;
    _links?: { next?: { href: string } };
    _embedded?: { "fx:products"?: CatalogProduct[] };
  }>(url);

  const products = body._embedded?.["fx:products"] ?? [];
  for (const product of products) {
    // A listed parent carries no variants, so it isn't cached as if it did.
    if (product.product_type !== "parent") {
      productCache.set(`${store}\n${product.sku}`, Promise.resolve(product));
    }
  }

  return {
    products,
    total: body.total_items ?? products.length,
    next: body._links?.next?.href ?? null,
  };
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "omit",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new CatalogError(
      response.status,
      `[Foxy] ${url} answered ${response.status}.`,
    );
  }
  return (await response.json()) as T;
}

/** Forgets every cached product. For tests and stories. */
export function clearCatalogCache(): void {
  productCache.clear();
}
