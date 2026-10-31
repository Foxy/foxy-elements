import "../foxy-product-tile/element";
import { fetchProducts, resolveStoreDomain, type CatalogQuery } from "@/lib/products/catalog";
import { ensureStyles, whenParsed } from "@/lib/products/light-dom";
import { format, messages } from "@/lib/products/messages";
import { resolveLocale } from "@/lib/products/price";
import type { CatalogProduct } from "@/lib/products/types";

const QUERY_ATTRIBUTES = ["store", "collection", "tag", "in-stock", "sort", "limit"];
const TILE_ATTRIBUTES = ["product-href", "quick-add", "heading-level", "lang"];

/**
 * A grid of `foxy-product-tile`s from the public catalog's list: by
 * collection or tag, sorted, with "Load more" for the next page. Hidden
 * products aren't listed by the catalog. Renders in light DOM, like the
 * tiles.
 */
export class ProductCollectionElement extends HTMLElement {
  #products: CatalogProduct[] = [];
  #next: string | null = null;
  #loading = false;
  #failed = false;
  #request = 0;
  #started = false;
  #fallback: Node[] | null = null;
  #list = document.createElement("ul");
  #more = document.createElement("div");
  #status = document.createElement("p");

  static get observedAttributes(): string[] {
    return [...QUERY_ATTRIBUTES, ...TILE_ATTRIBUTES];
  }

  constructor() {
    super();
    this.#list.className = "foxy-product-grid";
    this.#more.className = "foxy-product-more";
    this.#status.className = "foxy-product-status";
    this.#status.setAttribute("role", "status");
  }

  /** A product collection's id, as the catalog's `collection` filter takes it. */
  get collection(): string {
    return this.getAttribute("collection") ?? "";
  }

  set collection(value: string) {
    this.setAttribute("collection", value);
  }

  get tag(): string {
    return this.getAttribute("tag") ?? "";
  }

  set tag(value: string) {
    this.setAttribute("tag", value);
  }

  /** `price`, `name` or `date_created`, `-` first for descending. */
  get sort(): string {
    return this.getAttribute("sort") ?? "";
  }

  set sort(value: string) {
    this.setAttribute("sort", value);
  }

  /** Products a page, at most 100. */
  get limit(): number | null {
    const value = Number(this.getAttribute("limit"));
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  set limit(value: number | null) {
    if (value === null) this.removeAttribute("limit");
    else this.setAttribute("limit", String(value));
  }

  /** The merchant's product page for each tile, such as `/shop/{sku}`. */
  get productHref(): string {
    return this.getAttribute("product-href") ?? "";
  }

  set productHref(value: string) {
    this.setAttribute("product-href", value);
  }

  get products(): CatalogProduct[] {
    return [...this.#products];
  }

  connectedCallback(): void {
    ensureStyles(this);
    whenParsed(() => {
      if (!this.isConnected || this.#started) return;
      this.#fallback ??= [...this.childNodes];
      this.#started = true;
      this.#reload();
    });
  }

  disconnectedCallback(): void {
    this.#started = false;
  }

  attributeChangedCallback(name: string): void {
    if (!this.#started) return;
    if (QUERY_ATTRIBUTES.includes(name)) this.#reload();
    else this.#renderTiles();
  }

  #query(): CatalogQuery {
    const inStock = this.getAttribute("in-stock");
    return {
      collection: this.collection || undefined,
      tag: this.tag || undefined,
      inStock: inStock === null ? undefined : inStock !== "false",
      sort: this.sort || undefined,
      limit: this.limit ?? undefined,
    };
  }

  #reload(): void {
    this.#products = [];
    this.#next = null;
    this.#list.replaceChildren();
    void this.#loadPage(null);
  }

  async #loadPage(next: string | null): Promise<void> {
    const store = resolveStoreDomain(this);
    if (!store) {
      console.warn("[Foxy] foxy-product-collection needs a store attribute or a 2.0 loader.js on the page.");
      return;
    }
    const request = ++this.#request;
    this.#loading = true;
    this.#failed = false;
    this.#render();

    try {
      const page = await fetchProducts(store, this.#query(), next);
      if (request !== this.#request) return;
      this.#products.push(...page.products);
      this.#next = page.next;
      const first = this.#list.children.length;
      this.#appendTiles(page.products);
      if (next) {
        // "Load more" goes away while loading, so focus moves to what it loaded.
        queueMicrotask(() =>
          this.#list.children[first]?.querySelector<HTMLElement>(".foxy-product-tile-name a, a.foxy-product-button[href]")?.focus(),
        );
      }
    } catch (error) {
      if (request !== this.#request) return;
      console.warn(error);
      this.#failed = true;
    } finally {
      if (request === this.#request) {
        this.#loading = false;
        this.#render();
      }
    }
  }

  #tile(product: CatalogProduct): HTMLLIElement {
    const item = document.createElement("li");
    const tile = document.createElement("foxy-product-tile");
    const store = resolveStoreDomain(this);
    if (store) tile.setAttribute("store", store);
    this.#applyTileAttributes(tile);
    item.append(tile);
    // Appended to the list before `product` is set, so the tile is connected
    // and styled when it first renders.
    queueMicrotask(() => (tile.product = product));
    return item;
  }

  #applyTileAttributes(tile: Element): void {
    for (const [from, to] of [
      ["product-href", "href"],
      ["quick-add", "quick-add"],
      ["heading-level", "heading-level"],
    ]) {
      const value = this.getAttribute(from);
      if (value === null) tile.removeAttribute(to);
      else tile.setAttribute(to, value);
    }
  }

  #appendTiles(products: CatalogProduct[]): void {
    this.#list.append(...products.map((product) => this.#tile(product)));
  }

  #renderTiles(): void {
    this.#list.querySelectorAll("foxy-product-tile").forEach((tile) => this.#applyTileAttributes(tile));
    this.#render();
  }

  #render(): void {
    const locale = resolveLocale(this);
    this.setAttribute("aria-busy", String(this.#loading));

    this.#status.textContent = this.#failed
      ? format(locale, messages.loadFailed)
      : !this.#loading && !this.#products.length
        ? format(locale, messages.empty)
        : "";

    this.#more.replaceChildren();
    if (this.#next && !this.#loading) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = format(locale, messages.loadMore);
      const next = this.#next;
      button.addEventListener("click", () => void this.#loadPage(next));
      this.#more.append(button);
    }

    const showFallback = Boolean(this.#loading && !this.#products.length && this.#fallback?.length);
    if (showFallback) {
      this.replaceChildren(...(this.#fallback ?? []), this.#status, this.#more);
    } else if (this.#list.parentNode !== this) {
      this.replaceChildren(this.#list, this.#status, this.#more);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "foxy-product-collection": ProductCollectionElement;
  }
}

if (!customElements.get("foxy-product-collection")) {
  customElements.define("foxy-product-collection", ProductCollectionElement);
}
