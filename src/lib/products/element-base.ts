import { track, type AnalyticsDetail, type AnalyticsEvent } from "./analytics";
import { fetchProduct, resolveStoreDomain, withCurrency } from "./catalog";
import { ensureStyles, themes, watchFoxy2Session, whenParsed } from "./light-dom";
import {
  applyLook,
  DEFAULT_LOOK,
  fetchLook,
  LOOK_ATTRIBUTES,
  syncLookAttributes,
  watchLook,
  type StoreLook,
} from "./look";
import { resolveCurrency, resolveLocale } from "./price";
import type { CatalogProduct } from "./types";

/** Attributes every product element takes. */
export const SHARED_ATTRIBUTES = ["sku", "store", "currency", "lang", ...Object.keys(LOOK_ATTRIBUTES)];

/**
 * Keeps the store's look on the element: fetched once per store per page,
 * and again whenever the page replaces it. Calls `onLook` after each.
 * Returns a function that stops it.
 */
export function followLook(element: HTMLElement, store: string, onLook: (look: StoreLook) => void): () => void {
  const show = (look: StoreLook): void => {
    applyLook(element, store, look);
    onLook(look);
  };
  const request = fetchLook(store);
  void request.then((look) => {
    // Settings the page gave in the meantime are newer than the request's.
    if (element.isConnected && fetchLook(store) === request) show(look);
  });
  return watchLook((changed, look) => {
    if (changed === store && element.isConnected) show(look);
  });
}

/**
 * What the elements for one product share: the `sku` and `store`
 * attributes, the merchant's fallback content, one catalog request per SKU,
 * the store's look, and re-rendering when the shopper's currency changes.
 * They render into light DOM.
 */
export abstract class ProductElement extends HTMLElement {
  /** The CSS variables each theme sets: `customElements.get("foxy-product-link").themes`. */
  static readonly themes = themes;

  #product: CatalogProduct | null | undefined;
  #look: StoreLook = DEFAULT_LOOK;
  #lookStore = "";
  #unfollowLook: (() => void) | null = null;
  #loadedKey = "";
  #fallback: Node[] | null = null;
  #started = false;
  #unwatch: (() => void) | null = null;
  #requestedCurrency: string | null = null;
  #pendingAdd: { count: number; detail: AnalyticsDetail } | null = null;
  #warned = new Set<string>();

  get sku(): string {
    return this.getAttribute("sku") ?? "";
  }

  set sku(value: string) {
    this.setAttribute("sku", value);
  }

  get store(): string {
    return this.getAttribute("store") ?? "";
  }

  set store(value: string) {
    this.setAttribute("store", value);
  }

  get currency(): string {
    return this.getAttribute("currency") ?? "";
  }

  set currency(value: string) {
    this.setAttribute("currency", value);
  }

  /** The catalog's product, once loaded; `null` when the store has no such SKU. */
  get product(): CatalogProduct | null | undefined {
    return this.#product;
  }

  protected get look(): StoreLook {
    return this.#look;
  }

  protected get started(): boolean {
    return this.#started;
  }

  protected get storeDomain(): string | null {
    return resolveStoreDomain(this);
  }

  protected get locale(): string {
    return resolveLocale(this);
  }

  /**
   * The currency the page wants, remembered so a session change re-renders
   * only for a new one. Each price is shown in the currency the catalog
   * says it is in.
   */
  protected get requestedCurrency(): string | null {
    return (this.#requestedCurrency = resolveCurrency(this));
  }

  /** The SKU to load. */
  protected get wantedSku(): string {
    return this.sku.trim();
  }

  protected abstract render(): void;

  /** Called when the store's look changes what the element says. */
  protected refresh(): void {
    this.render();
  }

  /** Called for a change to any attribute but `sku`, `store` and the look's. */
  protected attributeChanged(_name: string): void {
    this.render();
  }

  connectedCallback(): void {
    ensureStyles(this);
    syncLookAttributes(this);
    whenParsed(() => {
      if (!this.isConnected || this.#started) return;
      // Whatever the merchant wrote inside the tag shows until the element
      // renders, and comes back if it can't.
      this.#fallback ??= [...this.childNodes];
      this.#started = true;
      // Re-rendering replaces a link, and with it the shopper's focus, so
      // only a change of currency does.
      this.#unwatch = watchFoxy2Session((event) => {
        const pending = this.#pendingAdd;
        if (event === "cart-submit" && pending) {
          this.#pendingAdd = null;
          // The cart holds more than before only when it took the add.
          if ((window.FC?.json?.item_count ?? 0) > pending.count) this.track("add_to_cart", pending.detail);
        }
        const requested = this.#requestedCurrency;
        // The session may also be the first to say which store this is.
        this.load();
        if (resolveCurrency(this) !== requested) this.render();
      });
      this.load();
    });
  }

  disconnectedCallback(): void {
    this.#started = false;
    this.#unwatch?.();
    this.#unwatch = null;
    this.#unfollowLook?.();
    this.#unfollowLook = null;
    this.#lookStore = "";
  }

  attributeChangedCallback(name: string): void {
    if (name in LOOK_ATTRIBUTES) {
      syncLookAttributes(this);
      return;
    }
    // Upgrades call this before connectedCallback, while the fallback is
    // still unsaved.
    if (!this.#started) return;
    if (name === "sku" || name === "store") this.load();
    else this.attributeChanged(name);
  }

  /** Sets the product without a request, for an element handed one. */
  protected setProduct(product: CatalogProduct | null | undefined): void {
    this.#product = product && withCurrency(product, null);
    if (product) this.#loadedKey = `${this.storeDomain}\n${product.sku}`;
    this.#followLook();
  }

  protected load(): void {
    const store = this.storeDomain;
    const sku = this.wantedSku;
    const key = `${store}\n${sku}`;
    this.#followLook();
    // Also when it is connected again: 2.0 moves the page's content into a
    // wrapper the first time its sidecart opens, and what is rendered, with
    // the shopper's choices, is still right.
    if (key === this.#loadedKey) return;
    this.#loadedKey = key;
    this.#product = undefined;
    this.render();
    if (!store || !sku) return;

    fetchProduct(store, sku).then(
      (product) => {
        if (key !== this.#loadedKey) return;
        if (!product) this.warn(`[Foxy] No product with SKU "${sku}" in ${store}.`);
        this.#product = product;
        this.render();
      },
      // The cart is the authority, so a catalog outage changes nothing shown.
      (error: unknown) => console.warn(error),
    );
  }

  #followLook(): void {
    const store = this.storeDomain;
    if (!store || store === this.#lookStore) return;
    this.#lookStore = store;
    this.#unfollowLook?.();
    this.#unfollowLook = followLook(this, store, (look) => {
      const before = this.#look;
      this.#look = look;
      const changesContent =
        look.buttonText !== before.buttonText ||
        look.lowStockThreshold !== before.lowStockThreshold ||
        look.productUrl !== before.productUrl;
      if (changesContent && this.#started) this.refresh();
    });
  }

  /** Reports `event` for this element: see `track`. */
  protected track(event: AnalyticsEvent, detail: AnalyticsDetail): void {
    void track(this, this.storeDomain, event, detail);
  }

  /**
   * Remembers what the shopper just asked the cart to add. It is reported
   * as `add_to_cart` once 2.0's `foxycart.js` says the cart took it; a page
   * that leaves for the cart can't know, and reports nothing.
   */
  protected addStarted(detail: AnalyticsDetail): void {
    this.#pendingAdd = { count: window.FC?.json?.item_count ?? 0, detail };
  }

  /** Whether the merchant wrote anything inside the tag. */
  protected get hasFallback(): boolean {
    return (this.#fallback ?? []).some((node) => node instanceof Element || Boolean(node.textContent?.trim()));
  }

  protected showFallback(): void {
    this.replaceChildren(...(this.#fallback ?? []));
  }

  /** Warns the merchant in the console, once per message. */
  protected warn(message: string): void {
    if (this.#warned.has(message)) return;
    this.#warned.add(message);
    console.warn(message);
  }
}
