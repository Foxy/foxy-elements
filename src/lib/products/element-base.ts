import { fetchProduct, resolveStoreDomain } from "./catalog";
import { ensureStyles, watchFoxy2Session, whenParsed } from "./light-dom";
import {
  applyLook,
  DEFAULT_LOOK,
  fetchLook,
  LOOK_ATTRIBUTES,
  syncLookAttributes,
  type StoreLook,
} from "./look";
import { resolveCurrency, resolveLocale } from "./price";
import type { CatalogProduct } from "./types";

/** Attributes every product element takes. */
export const SHARED_ATTRIBUTES = ["sku", "store", "currency", "lang", ...Object.keys(LOOK_ATTRIBUTES)];

/**
 * Fetches the store's look once for an element and puts it on it. Returns
 * the look for `onLook` when it brings something a re-render would show.
 */
export function loadLook(element: HTMLElement, store: string, onLook: (look: StoreLook) => void): void {
  void fetchLook(store).then((look) => {
    if (!element.isConnected) return;
    applyLook(element, store, look);
    onLook(look);
  });
}

/**
 * What the elements for one product share: the `sku` and `store`
 * attributes, the merchant's fallback content, one catalog request per SKU,
 * the store's look, and re-rendering when the shopper's currency changes.
 * They render into light DOM.
 */
export abstract class ProductElement extends HTMLElement {
  #product: CatalogProduct | null | undefined;
  #look: StoreLook = DEFAULT_LOOK;
  #lookStore = "";
  #loadedKey = "";
  #fallback: Node[] | null = null;
  #started = false;
  #unwatch: (() => void) | null = null;
  #renderedCurrency: string | null = null;
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

  /** The shopper's currency, remembered so a session change re-renders only for a new one. */
  protected get shownCurrency(): string | null {
    return (this.#renderedCurrency = resolveCurrency(this));
  }

  /** The SKU to load. */
  protected get wantedSku(): string {
    return this.sku.trim();
  }

  protected abstract render(): void;

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
      this.#unwatch = watchFoxy2Session(() => {
        if (resolveCurrency(this) !== this.#renderedCurrency) this.render();
      });
      this.load();
    });
  }

  disconnectedCallback(): void {
    this.#started = false;
    this.#unwatch?.();
    this.#unwatch = null;
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
    this.#product = product;
    if (product) this.#loadedKey = `${this.storeDomain}\n${product.sku}`;
    this.#loadLook();
  }

  protected load(): void {
    const store = this.storeDomain;
    const sku = this.wantedSku;
    const key = `${store}\n${sku}`;
    this.#loadLook();
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

  #loadLook(): void {
    const store = this.storeDomain;
    if (!store || store === this.#lookStore) return;
    this.#lookStore = store;
    loadLook(this, store, (look) => {
      const changesText =
        look.buttonText !== this.#look.buttonText ||
        look.lowStockThreshold !== this.#look.lowStockThreshold;
      this.#look = look;
      if (changesText && this.#started) this.render();
    });
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
