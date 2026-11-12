import type { Amount, CatalogProduct, PriceMap } from "./types";

const DEFAULT_LOCALE = "en-US";

/** The nearest `lang`, as a BCP 47 tag (`fr_FR` becomes `fr-FR`). */
export function resolveLocale(element: Element): string {
  const lang = element.closest("[lang]")?.getAttribute("lang")?.trim();
  return lang ? lang.replace(/_/g, "-") : DEFAULT_LOCALE;
}

/**
 * The currency to show prices in, from the first of:
 *
 * 1. a `currency` attribute on the element or an ancestor (the page decides);
 * 2. the cookie an ancestor's `currency-cookie` attribute names (a
 *    merchant's own currency switcher);
 * 3. the 2.0 cart session's currency, once `foxycart.js` has loaded the cart
 *    (it follows the session's template set).
 *
 * `null` means none of them is known; prices are then shown as plain
 * numbers in the store's currency.
 */
export function resolveCurrency(element: Element): string | null {
  const fromAttribute = element
    .closest("[currency]")
    ?.getAttribute("currency")
    ?.trim();
  if (fromAttribute) return fromAttribute.toUpperCase();

  const cookieName = element
    .closest("[currency-cookie]")
    ?.getAttribute("currency-cookie")
    ?.trim();
  if (cookieName) {
    const fromCookie = readCookie(cookieName);
    if (fromCookie && /^[A-Za-z]{3}$/.test(fromCookie)) {
      return fromCookie.toUpperCase();
    }
  }

  const fromSession = window.FC?.json?.locale_info?.int_curr_symbol?.trim();
  if (fromSession && /^[A-Z]{3}$/.test(fromSession)) return fromSession;

  return null;
}

function readCookie(name: string): string | null {
  for (const pair of document.cookie.split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    if (key === name) {
      try {
        return decodeURIComponent(rest.join("="));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function toNumber(value: Amount | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/**
 * `map[currency]` when the product sets an amount for that currency, else
 * the store-currency `amount`. A store that converts currencies converts
 * that amount in the cart; the catalog doesn't say whether it does, so the
 * unconverted amount is what's shown.
 */
export function amountIn(
  amount: Amount | undefined,
  map: PriceMap | undefined,
  currency: string | null,
): number | null {
  if (currency && map && map[currency] !== undefined) {
    return toNumber(map[currency]);
  }
  return toNumber(amount);
}

export interface ProductPrice {
  price: number | null;
  /** Only when it's higher than `price`, so it can be struck through. */
  listPrice: number | null;
}

export function productPrice(
  product: CatalogProduct,
  currency: string | null,
): ProductPrice {
  const { definition } = product;
  const price = amountIn(definition.price, definition.prices, currency);
  // A list price in another currency than the price would compare nonsense.
  const ownCurrency = currency && definition.prices?.[currency] !== undefined;
  const list = ownCurrency
    ? amountIn(definition.list_prices?.[currency], undefined, null)
    : toNumber(definition.list_price);
  return {
    price,
    listPrice: list !== null && price !== null && list > price ? list : null,
  };
}

export interface PriceRange {
  min: number;
  max: number;
}

/**
 * The lowest and highest price among a parent's embedded variants, or the
 * product's own price when it has none embedded (a listed parent, or a
 * standalone product).
 */
export function priceRange(
  product: CatalogProduct,
  currency: string | null,
): PriceRange | null {
  const variants = product._embedded?.variants ?? [];
  const prices = (variants.length ? variants : [product])
    .map((item) => productPrice(item, currency).price)
    .filter((price): price is number => price !== null);

  if (!prices.length) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function formatPrice(
  amount: number,
  currency: string | null,
  locale: string,
): string {
  const options: Intl.NumberFormatOptions = currency
    ? { style: "currency", currency }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };

  try {
    return new Intl.NumberFormat(locale, options).format(amount);
  } catch {
    // An invalid `lang` or currency code makes Intl throw.
    try {
      return new Intl.NumberFormat(DEFAULT_LOCALE, options).format(amount);
    } catch {
      return amount.toFixed(2);
    }
  }
}

function translation(
  product: CatalogProduct,
  locale: string,
  field: "name" | "description",
): string | undefined {
  const translations = product.definition.translations;
  if (!translations) return undefined;
  const wanted = locale.toLowerCase().replace(/_/g, "-");
  const base = wanted.split("-")[0];
  const keys = Object.keys(translations);
  const key =
    keys.find((k) => k.toLowerCase().replace(/_/g, "-") === wanted) ??
    keys.find((k) => k.toLowerCase().split(/[-_]/)[0] === base);
  return (key && translations[key]?.[field]) || undefined;
}

/** The product's name in the shopper's language, when the catalog has it. */
export function productName(product: CatalogProduct, locale: string): string {
  return (
    translation(product, locale, "name") ??
    product.definition.name ??
    product.display_name ??
    product.sku
  );
}

/** The product's description (Markdown), in the shopper's language when the catalog has it. */
export function productDescription(product: CatalogProduct, locale: string): string {
  return translation(product, locale, "description") ?? product.definition.description ?? "";
}
