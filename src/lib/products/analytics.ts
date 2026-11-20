import { DEFAULT_LOOK, fetchLook } from "./look";
import { productName, productPrice, priceRange } from "./price";
import type { CatalogProduct } from "./types";

/** One product in an event, in the shape Google Analytics 4 gives an item. */
export interface AnalyticsItem {
  /** The product's SKU; a parent's, whichever variant is chosen. */
  item_id: string;
  item_name: string;
  /** The chosen variant's SKU. */
  item_variant?: string;
  item_brand?: string;
  price?: number;
  quantity: number;
  /** Its place in the list, from 0. */
  index?: number;
  item_list_id?: string;
  item_list_name?: string;
}

/** An event's detail: Google Analytics 4's ecommerce parameters. */
export interface AnalyticsDetail {
  /** With `value`, only when the catalog says which currency the prices are in. */
  currency?: string;
  value?: number;
  item_list_id?: string;
  item_list_name?: string;
  items: AnalyticsItem[];
}

export type AnalyticsEvent = "view_item_list" | "select_item" | "view_item" | "add_to_cart";

/** The list a collection shows, and where in it a tile is. */
export interface AnalyticsList {
  id?: string;
  name?: string;
  index: number;
}

/** Set by a collection for each of its tiles. */
export const tileLists = new WeakMap<Element, AnalyticsList>();

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * An item for `product` as it is listed or first shown, or, with `chosen`,
 * as it is added: at the chosen product's `price` for one unit.
 */
export function analyticsItem(
  product: CatalogProduct,
  locale: string,
  requested: string | null,
  options: { chosen?: CatalogProduct; price?: number; quantity?: number; list?: AnalyticsList } = {},
): { item: AnalyticsItem; currency: string | null } {
  const { chosen, list } = options;
  // A parent that isn't chosen from yet is listed at its lowest price.
  const range = !chosen && product.product_type === "parent" ? priceRange(product, requested) : null;
  const priced = range ? { price: range.min, currency: range.currency } : productPrice(chosen ?? product, requested);
  const price = options.price ?? priced.price;
  const item: AnalyticsItem = {
    item_id: product.sku,
    item_name: productName(product, locale),
    quantity: options.quantity ?? 1,
  };
  if (chosen && chosen !== product) item.item_variant = chosen.sku;
  if (product.definition.brand) item.item_brand = product.definition.brand;
  if (price !== null) item.price = price;
  if (list) {
    item.index = list.index;
    if (list.id) item.item_list_id = list.id;
    if (list.name) item.item_list_name = list.name;
  }
  return { item, currency: priced.currency };
}

/** An event's detail for `items`, which are all in `currency`. */
export function analyticsDetail(
  items: AnalyticsItem[],
  currency: string | null,
  list?: { id?: string; name?: string },
): AnalyticsDetail {
  const detail: AnalyticsDetail = { items };
  if (currency) {
    detail.currency = currency;
    const value = items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
    detail.value = Math.round(value * 100) / 100;
  }
  if (list?.id) detail.item_list_id = list.id;
  if (list?.name) detail.item_list_name = list.name;
  return detail;
}

/**
 * Whether an element reports to Google Analytics: its `analytics` attribute
 * (`off` or `false` turns it off, anything else on), else the store's
 * setting.
 */
export function analyticsEnabled(element: Element, storeSetting: boolean): boolean {
  const own = element.getAttribute("analytics");
  return own === null ? storeSetting : own !== "off" && own !== "false";
}

/**
 * Tells the page about `event`: always as a DOM event from the element
 * (`foxy-product:add-to-cart`, bubbling and composed, the detail as above),
 * and to Google Analytics 4 when the element or its store's settings, once
 * they are known, say so.
 *
 * Google gets each event once, by one of two routes. A page with Google's
 * own tag has a `gtag` function, and that tag reads nothing else, so the
 * event goes through it. Any other page gets Tag Manager's form on
 * `dataLayer`, which Tag Manager reads whenever it loads; the array is made
 * if it isn't there yet, and `ecommerce` is cleared first so nothing of the
 * previous event is left in it.
 */
export async function track(
  element: Element,
  store: string | null,
  event: AnalyticsEvent,
  detail: AnalyticsDetail,
): Promise<void> {
  const look = store ? await fetchLook(store) : DEFAULT_LOOK;
  element.dispatchEvent(
    new CustomEvent(`foxy-product:${event.replaceAll("_", "-")}`, { bubbles: true, composed: true, detail }),
  );
  if (!analyticsEnabled(element, look.analytics)) return;
  if (typeof window.gtag === "function") {
    window.gtag("event", event, detail);
    return;
  }
  window.dataLayer ??= [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce: detail });
}
