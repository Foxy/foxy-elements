import { defaultTheme as t } from "@foxy.io/design-system/theme";
import { format, messages } from "./messages";
import {
  formatPrice,
  priceRange,
  productPrice,
} from "./price";
import type { CatalogProduct } from "./types";

const STYLE_ID = "foxy-product-styles";

// The link, tile and collection render into light DOM, so that 2.0's
// `foxycart.js` sees their links and search engines their text. Their
// defaults are design-system tokens behind the same CSS variables the
// `theme-*` attributes of the other elements set. `:is()` lifts each rule
// above a theme's bare `a` or `.content a`, so a button stays a button.
const STYLES = `
:is(foxy-product-link, foxy-product-tile, foxy-product-collection) { font: var(--font-body, ${t.font.body}); color: var(--color-body, ${t.color.body}); }
foxy-product-link { display: inline-block; }
:is(foxy-product-link, foxy-product-tile) a.foxy-product-button {
  display: inline-flex; align-items: center; justify-content: center; gap: ${t.space.sm};
  box-sizing: border-box; min-height: var(--size-control, ${t.size.control});
  padding: 0 ${t.space.lg}; border: 1px solid var(--background-button-primary, ${t.background.buttonPrimary});
  border-radius: var(--border-radius-sm, ${t.borderRadius.sm});
  background: var(--background-button-primary, ${t.background.buttonPrimary});
  color: ${t.color.onButtonPrimary}; font: ${t.font.buttonMd}; text-decoration: none; cursor: pointer;
}
:is(foxy-product-link, foxy-product-tile) a.foxy-product-button[href]:hover { filter: brightness(1.15); }
:is(foxy-product-link, foxy-product-tile) a.foxy-product-button:focus-visible { outline: var(--outline-primary, ${t.outline.primary}); outline-offset: 2px; }
:is(foxy-product-link, foxy-product-tile) a.foxy-product-button[aria-disabled="true"] {
  border: ${t.border.buttonDisabled}; background: var(--background-disabled-field, ${t.background.disabledField});
  color: var(--color-faint, ${t.color.faint}); cursor: not-allowed;
}
.foxy-product-price s { color: var(--color-secondary, ${t.color.secondary}); margin-inline-start: ${t.space.xs}; }
foxy-product-tile { display: block; }
foxy-product-tile .foxy-product-tile {
  display: grid; gap: ${t.space.sm}; align-content: start; height: 100%; box-sizing: border-box;
  padding: ${t.space.md}; border: var(--border-default, ${t.border.default});
  border-radius: var(--border-radius-md, ${t.borderRadius.md}); background: var(--background-surface, ${t.background.surface});
}
foxy-product-tile .foxy-product-tile-media { position: relative; display: block; aspect-ratio: 1; overflow: hidden; border-radius: var(--border-radius-sm, ${t.borderRadius.sm}); background: var(--background-page, ${t.background.page}); }
foxy-product-tile .foxy-product-tile-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
foxy-product-tile .foxy-product-tile-name { margin: 0; font: ${t.font.bodyEmphasis}; }
foxy-product-tile .foxy-product-tile-name a { color: inherit; text-decoration: none; }
foxy-product-tile .foxy-product-tile-name a:hover { text-decoration: underline; }
foxy-product-tile .foxy-product-badge {
  position: absolute; inset-block-start: ${t.space.sm}; inset-inline-start: ${t.space.sm};
  padding: ${t.space["2xs"]} ${t.space.sm}; border-radius: var(--border-radius-pill, ${t.borderRadius.pill});
  background: var(--background-surface, ${t.background.surface}); color: var(--color-body, ${t.color.body}); font: ${t.font.caption};
}
foxy-product-collection { display: block; }
foxy-product-collection .foxy-product-grid {
  display: grid; gap: var(--space-md, ${t.space.lg}); margin: 0; padding: 0; list-style: none;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--foxy-product-tile-width, 14rem)), 1fr));
}
foxy-product-collection .foxy-product-more { display: flex; justify-content: center; margin-block-start: ${t.space.lg}; }
foxy-product-collection .foxy-product-more button {
  min-height: var(--size-control, ${t.size.control}); padding: 0 ${t.space.lg};
  border: ${t.border.field}; border-radius: var(--border-radius-sm, ${t.borderRadius.sm});
  background: ${t.background.buttonSecondary}; color: var(--color-body, ${t.color.body}); font: ${t.font.buttonMd}; cursor: pointer;
}
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
  target.append(style);
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
  const amount = product.product_type === "parent" ? range?.min ?? price : price;
  if (amount === null) return span;
  span.append(formatPrice(amount, currency, locale));
  if (listPrice !== null && product.product_type !== "parent") {
    const was = document.createElement("s");
    was.textContent = formatPrice(listPrice, currency, locale);
    was.setAttribute("aria-label", format(locale, messages.priceWas, {
      price: formatPrice(listPrice, currency, locale),
    }));
    span.append(" ", was);
  }
  return span;
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
