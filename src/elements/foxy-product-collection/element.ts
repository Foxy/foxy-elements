import "../foxy-product-tile/element";
import { analyticsDetail, analyticsItem, tileLists, track } from "@/lib/products/analytics";
import { fetchProducts, resolveStoreDomain, type CatalogQuery } from "@/lib/products/catalog";
import { followLook } from "@/lib/products/element-base";
import { ensureStyles, themes, whenParsed } from "@/lib/products/light-dom";
import { LOOK_ATTRIBUTES, syncLookAttributes } from "@/lib/products/look";
import { format, messages } from "@/lib/products/messages";
import { resolveCurrency, resolveLocale } from "@/lib/products/price";
import type { CatalogProduct } from "@/lib/products/types";

const QUERY_ATTRIBUTES = ["store", "collection", "tag", "in-stock", "sort", "limit", "variant-prices"];
const TILE_ATTRIBUTES = ["product-href", "quick-add", "heading-level", "theme", "analytics", "lang", "show-count", "show-sort"];

const SORTS = [
  ["name", messages.sortName],
  ["price", messages.sortPriceAscending],
  ["-price", messages.sortPriceDescending],
  ["-date_created", messages.sortNewest],
] as const;

/**
 * A grid of `foxy-product-tile`s from the public catalog's list: by
 * collection or tag, sorted, with "Load more" for the next page. It lists
 * products and the parents of variants; hidden products aren't listed by
 * the catalog. Renders in light DOM, like the tiles.
 */
export class ProductCollectionElement extends HTMLElement {
  #products: CatalogProduct[] = [];
  #total = 0;
  #lookStore = "";
  #unfollowLook: (() => void) | null = null;
  #next: string | null = null;
  #loading = false;
  #failed = false;
  #request = 0;
  #started = false;
  #loadedQuery = "";
  #fallback: Node[] | null = null;
  #toolbar = document.createElement("div");
  #list = document.createElement("ul");
  #more = document.createElement("div");
  #status = document.createElement("p");

  /** The CSS variables each theme sets, as on the other product elements. */
  static readonly themes = themes;

  static get observedAttributes(): string[] {
    return [...QUERY_ATTRIBUTES, ...TILE_ATTRIBUTES, ...Object.keys(LOOK_ATTRIBUTES)];
  }

  constructor() {
    super();
    this.#toolbar.className = "foxy-product-toolbar";
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

  /**
   * The merchant's product page for each tile, such as `/shop/{sku}`.
   * Unset, the store's own setting is used.
   */
  get productHref(): string {
    return this.getAttribute("product-href") ?? "";
  }

  set productHref(value: string) {
    this.setAttribute("product-href", value);
  }

  /**
   * Asks the catalog for each parent's variants with the list, so a tile
   * shows the range of their prices. Without it a parent's tile shows the
   * parent's own price.
   */
  get variantPrices(): boolean {
    return this.hasAttribute("variant-prices");
  }

  set variantPrices(value: boolean) {
    this.toggleAttribute("variant-prices", value);
  }

  /** Shows how many products the list has, above it. */
  get showCount(): boolean {
    return this.hasAttribute("show-count");
  }

  set showCount(value: boolean) {
    this.toggleAttribute("show-count", value);
  }

  /** Shows a "Sort by" control, which sets `sort`. */
  get showSort(): boolean {
    return this.hasAttribute("show-sort");
  }

  set showSort(value: boolean) {
    this.toggleAttribute("show-sort", value);
  }

  /** What Google Analytics calls this list in its reports. */
  get listName(): string {
    return this.getAttribute("list-name") ?? "";
  }

  set listName(value: string) {
    this.setAttribute("list-name", value);
  }

  get products(): CatalogProduct[] {
    return [...this.#products];
  }

  connectedCallback(): void {
    ensureStyles(this);
    syncLookAttributes(this);
    whenParsed(() => {
      if (!this.isConnected || this.#started) return;
      this.#fallback ??= [...this.childNodes];
      this.#started = true;
      // 2.0 moves the page's content the first time its sidecart opens;
      // what is loaded, and how far the shopper has paged, is still right.
      if (this.#loadedQuery !== this.#queryKey()) this.#reload();
    });
  }

  disconnectedCallback(): void {
    this.#started = false;
    this.#unfollowLook?.();
    this.#unfollowLook = null;
    this.#lookStore = "";
  }

  attributeChangedCallback(name: string): void {
    if (name in LOOK_ATTRIBUTES) {
      syncLookAttributes(this);
      return;
    }
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
      variants: this.variantPrices,
    };
  }

  #queryKey(): string {
    return JSON.stringify([resolveStoreDomain(this), this.#query()]);
  }

  #reload(): void {
    this.#loadedQuery = this.#queryKey();
    this.#products = [];
    this.#total = 0;
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
    if (store !== this.#lookStore) {
      this.#lookStore = store;
      this.#unfollowLook?.();
      // The tiles inherit the variables; the look's text is theirs to read.
      this.#unfollowLook = followLook(this, store, () => {});
    }
    const request = ++this.#request;
    this.#loading = true;
    this.#failed = false;
    this.#render();

    try {
      const page = await fetchProducts(store, this.#query(), next);
      if (request !== this.#request) return;
      const first = this.#list.children.length;
      this.#products.push(...page.products);
      this.#total = page.total;
      this.#next = page.next;
      this.#appendTiles(page.products, first);
      this.#trackList(store, page.products, first);
      if (next) {
        // "Load more" goes away while loading, so focus moves to what it loaded.
        queueMicrotask(() =>
          this.#list.children[first]?.querySelector<HTMLElement>(".foxy-product-name a, a.foxy-product-button[href]")?.focus(),
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

  /** What analytics is told of this list: the collection's id, else the tag. */
  #listIdentity(): { id?: string; name?: string } {
    return { id: this.collection || this.tag || undefined, name: this.listName || undefined };
  }

  /** Reports the products one page of results added, once. */
  #trackList(store: string, products: CatalogProduct[], first: number): void {
    if (!products.length) return;
    const list = this.#listIdentity();
    const requested = resolveCurrency(this);
    const items = products.map((product, index) =>
      analyticsItem(product, resolveLocale(this), requested, { list: { ...list, index: first + index } }),
    );
    void track(this, store, "view_item_list", analyticsDetail(items.map(({ item }) => item), items[0].currency, list));
  }

  #tile(product: CatalogProduct, index: number): HTMLLIElement {
    const item = document.createElement("li");
    const tile = document.createElement("foxy-product-tile");
    tileLists.set(tile, { ...this.#listIdentity(), index });
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
      // A tile reads the store's theme itself, so the collection's own has to be on it to win.
      ["theme", "theme"],
      ["analytics", "analytics"],
    ]) {
      const value = this.getAttribute(from);
      if (value === null) tile.removeAttribute(to);
      else tile.setAttribute(to, value);
    }
  }

  #appendTiles(products: CatalogProduct[], first: number): void {
    this.#list.append(...products.map((product, index) => this.#tile(product, first + index)));
  }

  #renderTiles(): void {
    this.#list.querySelectorAll("foxy-product-tile").forEach((tile) => this.#applyTileAttributes(tile));
    this.#render();
  }

  #renderToolbar(locale: string): void {
    const loaded = !this.#failed && this.#products.length > 0;
    let count = this.#toolbar.querySelector<HTMLElement>(".foxy-product-count");
    if (this.showCount && loaded) {
      if (!count) {
        count = document.createElement("p");
        count.className = "foxy-product-count";
        this.#toolbar.prepend(count);
      }
      count.textContent = format(locale, messages.count, { count: this.#total });
    } else count?.remove();

    // Kept across renders, so choosing a sort doesn't take the focus away.
    let sort = this.#toolbar.querySelector<HTMLElement>(".foxy-product-sort");
    if (!this.showSort) sort?.remove();
    else if (!sort) {
      sort = document.createElement("label");
      sort.className = "foxy-product-sort";
      const select = document.createElement("select");
      select.className = "foxy-product-input";
      for (const [value, message] of SORTS) select.append(new Option(format(locale, message), value));
      select.addEventListener("change", () => (this.sort = select.value));
      sort.append(format(locale, messages.sortBy), select);
      this.#toolbar.append(sort);
    }
    const select = sort?.querySelector("select");
    if (select) select.value = this.sort || "-date_created";
  }

  #render(): void {
    const locale = resolveLocale(this);
    this.setAttribute("aria-busy", String(this.#loading));
    this.#renderToolbar(locale);

    this.#status.textContent = this.#failed
      ? format(locale, messages.loadFailed)
      : !this.#loading && !this.#products.length
        ? format(locale, messages.empty)
        : "";

    this.#more.replaceChildren();
    if (this.#next && !this.#loading) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "foxy-product-button foxy-product-button-secondary";
      button.textContent = format(locale, messages.loadMore);
      const next = this.#next;
      button.addEventListener("click", () => void this.#loadPage(next));
      const showing = document.createElement("p");
      showing.className = "foxy-product-showing";
      showing.textContent = format(locale, messages.showing, {
        shown: this.#products.length,
        total: this.#total,
      });
      this.#more.append(button, showing);
    }

    const showFallback = Boolean(this.#loading && !this.#products.length && this.#fallback?.length);
    if (showFallback) {
      this.replaceChildren(...(this.#fallback ?? []), this.#status, this.#more);
    } else if (this.#list.parentNode !== this) {
      this.replaceChildren(this.#toolbar, this.#list, this.#status, this.#more);
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
