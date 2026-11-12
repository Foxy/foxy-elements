import { format, messages } from "./messages";
import { isHttps } from "./markdown";
import {
  formatPrice,
  priceRange,
  productPrice,
} from "./price";
import type { CatalogProduct, ProductImage } from "./types";

const STYLE_ID = "foxy-product-styles";

// Each value reads the element's own variable first (set by an attribute or
// the page's CSS), then the store's saved look, then the Foxy 2.0 cart's
// look.
const font = `var(--foxy-product-font, var(--foxy-store-font, "Helvetica Neue", Helvetica, Arial, sans-serif))`;
const nameColor = "var(--foxy-product-text-color, var(--foxy-store-text-color, #333333))";
const priceColor = "var(--foxy-product-text-color, var(--foxy-store-text-color, #1A1A1A))";
const button = "var(--foxy-product-button-color, var(--foxy-store-button-color, #3F8A2E))";
const onButton = "var(--foxy-product-button-text-color, var(--foxy-store-button-text-color, #FFFFFF))";
const buttonRadius = "var(--foxy-product-button-radius, var(--foxy-store-button-radius, 0px))";
const radius = "var(--foxy-product-radius, 0px)";
const accent = "var(--foxy-product-accent-color, #666666)";
const body = "var(--foxy-product-body-color, #1A1A1A)";
const muted = "var(--foxy-product-muted-color, #666666)";
const prose = "var(--foxy-product-description-color, #4D4D4D)";
const border = "var(--foxy-product-border-color, #D5D5D5)";
const fieldBorder = "var(--foxy-product-field-border-color, #CCCCCC)";
const divider = "var(--foxy-product-divider-color, #E4E4E4)";
const surface = "var(--foxy-product-surface-color, #FFFFFF)";
const panel = "var(--foxy-product-panel-color, #F5F5F5)";
const header = "var(--foxy-product-header-color, #F9F9F9)";
const disabled = "var(--foxy-product-disabled-color, #E4E4E4)";
const onDisabled = "var(--foxy-product-disabled-text-color, #555555)";
const notice = "var(--foxy-product-notice-color, #C4283A)";
const success = "var(--foxy-product-success-color, #2F6B22)";

const ELEMENTS =
  "foxy-product-link, foxy-product-form, foxy-product-tile, foxy-product-collection, foxy-product-page";

// Everything renders into light DOM, so that 2.0's `foxycart.js` sees the
// links and forms and search engines the text. That leaves it open to the
// page's CSS, so each rule starts with the element's name inside `:is()`:
// that outweighs a theme's `button`, `label` or `.content a`, and ties are
// won by this stylesheet being added to the page last.
const STYLES = `
:is(${ELEMENTS}) { font-family: ${font}; color: ${body}; line-height: 1.4; }
:is(${ELEMENTS}) :where(h1, h2, h3, h4, h5, h6, p, dl, dd, fieldset, legend) { margin: 0; padding: 0; }
:is(${ELEMENTS}) :where(button, input, select) { font-family: inherit; }
:is(${ELEMENTS}) [hidden] { display: none !important; }
:is(foxy-product-link) { display: inline-block; }
:is(foxy-product-form, foxy-product-tile, foxy-product-collection, foxy-product-page) { display: block; }

:is(${ELEMENTS}) :is(a, button).foxy-product-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.35em; box-sizing: border-box;
  min-height: 48px; padding: 0 24px; border: 0; border-radius: ${buttonRadius};
  background: ${button}; color: ${onButton}; font-size: 15px; font-weight: 400; line-height: 1.2;
  text-align: center; text-decoration: none; cursor: pointer;
}
:is(${ELEMENTS}) :is(a, button).foxy-product-button:is([href], :enabled):hover { filter: brightness(1.1); }
:is(${ELEMENTS}) :is(a, button).foxy-product-button:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
:is(${ELEMENTS}) :is(a, button).foxy-product-button.foxy-product-button-secondary {
  border: 1px solid ${border}; background: ${surface}; color: ${nameColor};
}
:is(${ELEMENTS}) :is(a, button).foxy-product-button:is([aria-disabled="true"], :disabled) {
  border: 0; background: ${disabled}; color: ${onDisabled}; cursor: not-allowed; filter: none;
}
:is(foxy-product-link) a.foxy-product-text-link { color: ${accent}; font-size: 15px; text-decoration: underline; }
:is(foxy-product-link) a.foxy-product-text-link[aria-disabled="true"] { text-decoration: none; cursor: not-allowed; }
:is(${ELEMENTS}) .foxy-product-button s { color: inherit; opacity: 0.75; }

:is(${ELEMENTS}) .foxy-product-price { color: ${priceColor}; }
:is(${ELEMENTS}) .foxy-product-price s { margin-inline-start: 8px; color: ${muted}; font-size: 0.82em; }
:is(${ELEMENTS}) :is(.foxy-product-button, .foxy-product-text-link) .foxy-product-price { color: inherit; }
:is(${ELEMENTS}) .foxy-product-brand { color: ${muted}; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; }
:is(${ELEMENTS}) .foxy-product-name { color: ${nameColor}; font-weight: 500; }
:is(${ELEMENTS}) .foxy-product-note { color: ${success}; font-size: 13px; }
:is(${ELEMENTS}) .foxy-product-note[data-tone="notice"] { color: ${notice}; }

:is(foxy-product-tile) { height: 100%; }
:is(foxy-product-tile) .foxy-product-tile { display: flex; flex-direction: column; height: 100%; background: ${surface}; }
:is(foxy-product-tile) .foxy-product-tile-media {
  display: block; aspect-ratio: var(--foxy-product-tile-aspect, 4 / 5); overflow: hidden;
  border-radius: ${radius} ${radius} 0 0; background: ${panel};
}
:is(foxy-product-tile) .foxy-product-tile-media img { display: block; width: 100%; height: 100%; object-fit: cover; }
:is(foxy-product-tile) .foxy-product-tile-body { display: flex; flex-direction: column; flex-grow: 1; gap: 6px; padding: 16px; }
:is(foxy-product-tile) .foxy-product-brand { font-size: 11px; }
:is(foxy-product-tile) .foxy-product-name { font-size: 16px; line-height: 1.35; }
:is(foxy-product-tile) .foxy-product-name a { color: inherit; text-decoration: none; }
:is(foxy-product-tile) .foxy-product-name a:hover { text-decoration: underline; }
:is(foxy-product-tile) .foxy-product-tile-price { font-size: 16px; }
:is(foxy-product-tile) .foxy-product-note { font-size: 12px; }
:is(foxy-product-tile) .foxy-product-tile-action { display: flex; margin-top: auto; padding-top: 10px; }
:is(foxy-product-tile) .foxy-product-tile-action a.foxy-product-button { flex: 1; min-height: 44px; padding: 0 12px; font-size: 14px; }

:is(foxy-product-collection) { --foxy-product-tile-aspect: 1 / 1; }
:is(foxy-product-collection) .foxy-product-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
:is(foxy-product-collection) .foxy-product-toolbar:empty { display: none; }
:is(foxy-product-collection) .foxy-product-count { color: ${muted}; font-size: 14px; }
:is(foxy-product-collection) .foxy-product-sort { display: flex; align-items: center; gap: 10px; margin-inline-start: auto; color: ${prose}; font-size: 14px; }
:is(foxy-product-collection) .foxy-product-grid {
  display: grid; gap: 24px; margin: 0; padding: 0; list-style: none;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--foxy-product-tile-width, 220px)), 1fr));
}
:is(foxy-product-collection) .foxy-product-status:empty { display: none; }
:is(foxy-product-collection) .foxy-product-status { color: ${prose}; font-size: 14px; }
:is(foxy-product-collection) .foxy-product-more { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 24px; }
:is(foxy-product-collection) .foxy-product-more:empty { display: none; }
:is(foxy-product-collection) .foxy-product-more button.foxy-product-button { min-height: 44px; padding: 0 28px; font-size: 14px; }
:is(foxy-product-collection) .foxy-product-showing { color: ${muted}; font-size: 12px; }

:is(foxy-product-form) .foxy-product-form { display: flex; flex-direction: column; gap: 18px; box-sizing: border-box; padding: 28px; background: ${surface}; }
:is(${ELEMENTS}) .foxy-product-summary { display: flex; flex-direction: column; gap: 4px; }
:is(foxy-product-form) .foxy-product-name { font-size: 22px; line-height: 1.25; }
:is(foxy-product-form) .foxy-product-summary .foxy-product-price { font-size: 20px; }

:is(${ELEMENTS}) .foxy-product-controls { display: flex; flex-direction: column; gap: 18px; margin: 0; }
:is(${ELEMENTS}) .foxy-product-field { display: flex; flex-direction: column; gap: 6px; }
:is(${ELEMENTS}) .foxy-product-field-label { font-size: 14px; font-weight: 600; }
:is(${ELEMENTS}) .foxy-product-hint { color: ${muted}; font-weight: 400; }
:is(${ELEMENTS}) .foxy-product-hint[data-tone="notice"] { color: ${notice}; }
:is(${ELEMENTS}) .foxy-product-input {
  box-sizing: border-box; height: 44px; padding: 0 12px; border: 1px solid ${fieldBorder}; border-radius: 0;
  background: ${surface}; color: ${body}; font-size: 15px;
}
:is(${ELEMENTS}) .foxy-product-input[aria-invalid="true"] { border-color: ${notice}; }
:is(${ELEMENTS}) .foxy-product-input:focus-visible { outline: 2px solid ${accent}; outline-offset: 1px; }
:is(${ELEMENTS}) input.foxy-product-quantity { width: 96px; }
:is(${ELEMENTS}) .foxy-product-counter { color: ${muted}; font-size: 12px; text-align: right; }
:is(${ELEMENTS}) .foxy-product-error { color: ${notice}; font-size: 13px; }
:is(${ELEMENTS}) .foxy-product-option { display: flex; flex-direction: column; min-width: 0; border: 0; }
:is(${ELEMENTS}) .foxy-product-option legend { margin-bottom: 10px; font-size: 14px; font-weight: 600; }
:is(${ELEMENTS}) .foxy-product-values { display: flex; flex-wrap: wrap; gap: 8px; }
:is(${ELEMENTS}) .foxy-product-values[data-swatches] { gap: 12px; }
:is(${ELEMENTS}) .foxy-product-radio { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); opacity: 0; }
:is(${ELEMENTS}) .foxy-product-pill {
  display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
  min-width: 52px; height: 44px; padding: 0 14px; border: 1px solid ${border}; border-radius: ${buttonRadius};
  background: ${surface}; color: ${nameColor}; font-size: 15px; cursor: pointer;
}
:is(${ELEMENTS}) .foxy-product-radio:checked + .foxy-product-pill { border-color: ${accent}; background: ${accent}; color: #FFFFFF; }
:is(${ELEMENTS}) .foxy-product-radio:disabled + .foxy-product-pill { border-style: dashed; border-color: ${fieldBorder}; background: ${header}; color: ${muted}; cursor: not-allowed; }
:is(${ELEMENTS}) .foxy-product-radio:focus-visible + :is(.foxy-product-pill, .foxy-product-swatch) { outline: 2px solid ${accent}; outline-offset: 2px; }
:is(${ELEMENTS}) .foxy-product-swatch { display: flex; flex-direction: column; align-items: center; gap: 6px; color: ${prose}; font-size: 12px; cursor: pointer; }
:is(${ELEMENTS}) .foxy-product-swatch-ring { display: block; box-sizing: border-box; width: 48px; height: 48px; padding: 4px; border: 2px solid ${border}; border-radius: 50%; background: ${surface}; }
:is(${ELEMENTS}) .foxy-product-swatch-dot { display: block; width: 100%; height: 100%; overflow: hidden; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15); }
:is(${ELEMENTS}) .foxy-product-swatch-dot img { display: block; width: 100%; height: 100%; object-fit: cover; }
:is(${ELEMENTS}) .foxy-product-radio:checked + .foxy-product-swatch .foxy-product-swatch-ring { border-color: ${accent}; }
:is(${ELEMENTS}) .foxy-product-radio:disabled + .foxy-product-swatch { cursor: not-allowed; }
:is(${ELEMENTS}) .foxy-product-radio:disabled + .foxy-product-swatch .foxy-product-swatch-ring { opacity: 0.4; }
:is(${ELEMENTS}) .foxy-product-stepper { display: flex; align-items: stretch; align-self: flex-start; border: 1px solid ${border}; }
:is(${ELEMENTS}) .foxy-product-stepper button { width: 44px; height: 44px; padding: 0; border: 0; border-radius: 0; background: ${panel}; color: ${onDisabled}; font-size: 18px; cursor: pointer; }
:is(${ELEMENTS}) .foxy-product-stepper button:disabled { opacity: 0.45; cursor: not-allowed; }
:is(${ELEMENTS}) .foxy-product-stepper input { box-sizing: border-box; width: 52px; padding: 0; border: 0; border-radius: 0; background: ${surface}; color: ${body}; font-size: 15px; text-align: center; }

:is(foxy-product-page) .foxy-product-page { display: flex; flex-direction: column; gap: 24px; }
:is(foxy-product-page) .foxy-product-main { display: flex; flex-wrap: wrap; gap: 40px; box-sizing: border-box; padding: 32px; background: ${surface}; }
:is(foxy-product-page) .foxy-product-gallery { display: flex; flex: 1 1 460px; flex-direction: column; gap: 12px; min-width: 0; }
:is(foxy-product-page) .foxy-product-hero { aspect-ratio: 1 / 1; overflow: hidden; border-radius: ${radius}; background: ${panel}; }
:is(foxy-product-page) .foxy-product-hero img { display: block; width: 100%; height: 100%; object-fit: cover; }
:is(foxy-product-page) .foxy-product-thumbs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
:is(foxy-product-page) .foxy-product-thumbs button { height: 96px; padding: 0; overflow: hidden; border: 2px solid ${divider}; border-radius: ${radius}; background: ${panel}; cursor: pointer; }
:is(foxy-product-page) .foxy-product-thumbs button[aria-current="true"] { border-color: ${accent}; }
:is(foxy-product-page) .foxy-product-thumbs button:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
:is(foxy-product-page) .foxy-product-thumbs img { display: block; width: 100%; height: 100%; object-fit: cover; }
:is(foxy-product-page) .foxy-product-info { display: flex; flex: 1 1 380px; flex-direction: column; gap: 20px; min-width: 0; }
:is(foxy-product-page) .foxy-product-summary { gap: 6px; }
:is(foxy-product-page) .foxy-product-brand { font-size: 13px; }
:is(foxy-product-page) .foxy-product-name { font-size: 32px; line-height: 1.2; }
:is(foxy-product-page) .foxy-product-price-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12px; }
:is(foxy-product-page) .foxy-product-summary .foxy-product-price { font-size: 26px; }
:is(foxy-product-page) .foxy-product-note { font-size: 14px; }
:is(foxy-product-page) .foxy-product-controls { gap: 20px; }
:is(foxy-product-page) button.foxy-product-button { min-height: 52px; font-size: 16px; letter-spacing: 0.02em; }
:is(foxy-product-page) .foxy-product-below { display: flex; flex-wrap: wrap; gap: 24px; }
:is(foxy-product-page) .foxy-product-description {
  display: flex; flex: 2 1 520px; flex-direction: column; gap: 14px; box-sizing: border-box; min-width: 0; padding: 32px;
  background: ${surface}; color: ${prose}; font-size: 15px; line-height: 1.6; overflow-x: auto;
}
:is(foxy-product-page) .foxy-product-description :where(h2, h3, h4, h5, h6) { color: ${nameColor}; font-size: 22px; font-weight: 500; line-height: 1.25; }
:is(foxy-product-page) .foxy-product-description :where(ul, ol) { margin: 0; padding-left: 20px; }
:is(foxy-product-page) .foxy-product-description table { border-collapse: collapse; font-size: 14px; }
:is(foxy-product-page) .foxy-product-description :where(th, td) { padding: 8px 16px; text-align: left; }
:is(foxy-product-page) .foxy-product-description thead tr { background: ${header}; }
:is(foxy-product-page) .foxy-product-description tbody tr { border-top: 1px solid ${divider}; }
:is(foxy-product-page) .foxy-product-description a { color: inherit; }
:is(foxy-product-page) .foxy-product-details { display: flex; flex: 1 1 300px; flex-direction: column; gap: 14px; box-sizing: border-box; min-width: 0; padding: 32px; background: ${surface}; }
:is(foxy-product-page) .foxy-product-details h2 { color: ${nameColor}; font-size: 22px; font-weight: 500; }
:is(foxy-product-page) .foxy-product-details dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px; font-size: 14px; }
:is(foxy-product-page) .foxy-product-details dt { color: ${muted}; }
:is(foxy-product-page) .foxy-product-details dd { overflow-wrap: anywhere; }
`;

/**
 * Adds the shared stylesheet once to the document, or to the shadow root the
 * element sits in when a merchant's own component holds it.
 */
export function ensureStyles(element: Element): void {
  const root = element.getRootNode();
  const target = root instanceof ShadowRoot ? root : document.head;
  if (target.querySelector(`style#${STYLE_ID}`)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLES;
  // Before the store's own CSS, which has to win over these defaults.
  target.insertBefore(style, target.querySelector("style[data-foxy-store-css]"));
}

/** `$24.95`, with a struck-through list price beside it when there is one. */
export function priceNodes(
  price: number,
  listPrice: number | null,
  currency: string | null,
  locale: string,
): Array<Node | string> {
  const nodes: Array<Node | string> = [formatPrice(price, currency, locale)];
  if (listPrice !== null && listPrice > price) {
    const was = document.createElement("s");
    was.textContent = formatPrice(listPrice, currency, locale);
    was.setAttribute("aria-label", format(locale, messages.priceWas, {
      price: formatPrice(listPrice, currency, locale),
    }));
    nodes.push(" ", was);
  }
  return nodes;
}

/**
 * The price as text nodes: `$24.95`, a struck-through list price beside it,
 * or `$22.00 – $26.00` for a parent whose variants differ.
 */
export function renderPrice(
  product: CatalogProduct,
  currency: string | null,
  locale: string,
): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "foxy-product-price";

  const range = priceRange(product, currency);
  if (product.product_type === "parent" && range && range.min !== range.max) {
    span.textContent = format(locale, messages.priceRange, {
      min: formatPrice(range.min, currency, locale),
      max: formatPrice(range.max, currency, locale),
    });
    return span;
  }

  const { price, listPrice } = productPrice(product, currency);
  const isParent = product.product_type === "parent";
  const amount = isParent ? range?.min ?? price : price;
  if (amount !== null) span.append(...priceNodes(amount, isParent ? null : listPrice, currency, locale));
  return span;
}

/**
 * What to say about stock: sold out, or how few are left once that is at or
 * below the low-stock threshold: the product's own when it sets one (a
 * variant's compiled definition carries its parent's), else the store's.
 * `null` when there's nothing to say.
 */
export function stockNote(
  product: CatalogProduct,
  storeLowStock: number,
  locale: string,
): { text: string; tone: "notice" | "success" } | null {
  if (!product.is_in_stock) return { text: format(locale, messages.soldOut), tone: "notice" };
  const left = product.stock_level;
  const own = product.definition.low_stock_threshold;
  const lowStock = typeof own === "number" ? own : storeLowStock;
  if (typeof left === "number" && left > 0 && left <= lowStock) {
    return { text: format(locale, messages.onlyLeft, { count: left }), tone: "success" };
  }
  return null;
}

/** An `<img>` for a catalog image; `null` unless its address is `https`. */
export function productImage(image: ProductImage | undefined, lazy: boolean): HTMLImageElement | null {
  if (!image || !isHttps(image.src)) return null;
  const img = document.createElement("img");
  img.src = image.src;
  img.alt = image.alt ?? "";
  if (lazy) img.loading = "lazy";
  if (image.width) img.width = image.width;
  if (image.height) img.height = image.height;
  return img;
}

/** schema.org data as a script element, with `<` escaped so a name can't close it. */
export function jsonLdScript(data: Record<string, unknown>): HTMLScriptElement {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data).replace(/</g, "\\u003c");
  return script;
}

/**
 * A cart URL for one click: `https://<store>/cart?sku=…`, never `name` or
 * `price`, which the cart takes from the catalog.
 */
export function addToCartHref(
  store: string,
  sku: string,
  extra: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams({ sku });
  for (const [name, value] of Object.entries(extra)) {
    if (value) params.set(name, value);
  }
  return `https://${store}/cart?${params}`;
}

const watchers = new Set<() => void>();
let watching = false;

/**
 * Calls `callback` whenever the 2.0 cart session may have changed what the
 * element shows (its currency comes from the session's template set). 2.0
 * fills `FC.json` after `foxycart.js` loads, which may be after the element,
 * so this waits for `FC.client` for up to 15 seconds. Returns an unsubscribe.
 */
export function watchFoxy2Session(callback: () => void): () => void {
  watchers.add(callback);
  if (!watching) {
    watching = true;
    let tries = 0;
    const attach = (): void => {
      const on = window.FC?.client?.on;
      if (typeof on === "function") {
        const notify = (): void => watchers.forEach((watcher) => watcher());
        on.call(window.FC!.client, "ready.done", notify);
        on.call(window.FC!.client, "cart-submit.done", notify);
        if (window.FC?.json?.locale_info) notify();
      } else if (++tries < 60) {
        setTimeout(attach, 250);
      }
    };
    attach();
  }
  return () => watchers.delete(callback);
}

/**
 * Runs `callback` once the element's children have been parsed. A script
 * that runs while the page is still parsing (not a module, not deferred)
 * connects the element before its children exist, and those children are
 * the merchant's fallback.
 */
export function whenParsed(callback: () => void): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  } else {
    callback();
  }
}
