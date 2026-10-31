import { fetchProduct, resolveStoreDomain } from "@/lib/products/catalog";
import {
  addToCartHref,
  ensureStyles,
  renderPrice,
  watchFoxy2Session,
  whenParsed,
} from "@/lib/products/light-dom";
import { format, messages } from "@/lib/products/messages";
import { isOneClick } from "@/lib/products/options";
import { productName, resolveCurrency, resolveLocale } from "@/lib/products/price";
import type { CatalogProduct } from "@/lib/products/types";
import { productJsonLd } from "./structured-data";

const OBSERVED = ["sku", "store", "href", "quick-add", "heading-level", "currency", "lang"];

/**
 * One product in a grid: image, name, price, and either a one-click add or a
 * link to the merchant's own product page. Everything renders in light DOM,
 * so 2.0 sees the add link and search engines see the text, along with
 * schema.org `Product` data.
 */
export class ProductTileElement extends HTMLElement {
  #product: CatalogProduct | null | undefined;
  #loadedKey = "";
  #fallback: Node[] | null = null;
  #started = false;
  #unwatch: (() => void) | null = null;

  static get observedAttributes(): string[] {
    return OBSERVED;
  }

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

  /** The merchant's page for this product; `{sku}` is replaced with its SKU. */
  get href(): string {
    return this.getAttribute("href") ?? "";
  }

  set href(value: string) {
    this.setAttribute("href", value);
  }

  /** `never` always links to `href`; anything else adds in one click when it can. */
  get quickAdd(): "auto" | "never" {
    return this.getAttribute("quick-add") === "never" ? "never" : "auto";
  }

  set quickAdd(value: "auto" | "never") {
    this.setAttribute("quick-add", value);
  }

  /** The name's heading level, 1–6. Default 3. */
  get headingLevel(): number {
    const level = Number(this.getAttribute("heading-level"));
    return Number.isInteger(level) && level >= 1 && level <= 6 ? level : 3;
  }

  set headingLevel(value: number) {
    this.setAttribute("heading-level", String(value));
  }

  /**
   * The catalog's product. `foxy-product-collection` sets it from its list,
   * so a grid needs no request per tile; setting it also sets `sku`.
   */
  get product(): CatalogProduct | null | undefined {
    return this.#product;
  }

  set product(value: CatalogProduct | null | undefined) {
    this.#product = value;
    if (value) {
      this.#loadedKey = `${resolveStoreDomain(this)}\n${value.sku}`;
      if (this.getAttribute("sku") !== value.sku) this.setAttribute("sku", value.sku);
      this.#loadVariants(value);
    }
    this.#render();
  }

  connectedCallback(): void {
    ensureStyles(this);
    whenParsed(() => {
      if (!this.isConnected || this.#started) return;
      this.#fallback ??= [...this.childNodes];
      this.#started = true;
      this.#unwatch = watchFoxy2Session(() => this.#render());
      this.#load();
    });
  }

  disconnectedCallback(): void {
    this.#started = false;
    this.#unwatch?.();
    this.#unwatch = null;
  }

  attributeChangedCallback(name: string): void {
    if (!this.#started) return;
    if (name === "sku" || name === "store") this.#load();
    else this.#render();
  }

  #load(): void {
    const store = resolveStoreDomain(this);
    const sku = this.sku.trim();
    const key = `${store}\n${sku}`;
    if (key === this.#loadedKey) {
      this.#render();
      return;
    }
    this.#loadedKey = key;
    this.#product = undefined;
    this.#render();
    if (!store || !sku) return;

    fetchProduct(store, sku).then(
      (product) => {
        if (key !== this.#loadedKey) return;
        if (!product) console.warn(`[Foxy] No product with SKU "${sku}" in ${store}.`);
        this.#product = product;
        this.#render();
      },
      (error: unknown) => console.warn(error),
    );
  }

  /**
   * A listed parent comes without its variants, and its price range needs
   * them, so it's fetched once more by SKU.
   */
  #loadVariants(product: CatalogProduct): void {
    const store = resolveStoreDomain(this);
    if (product.product_type !== "parent" || product._embedded?.variants || !store) return;
    fetchProduct(store, product.sku).then(
      (full) => {
        if (full && this.#product === product) {
          this.#product = full;
          this.#render();
        }
      },
      () => {},
    );
  }

  #pageHref(product: CatalogProduct): string | null {
    const pattern = this.href.trim();
    return pattern ? pattern.replaceAll("{sku}", encodeURIComponent(product.sku)) : null;
  }

  #render(): void {
    if (!this.#started && !this.#product) return;
    const product = this.#product;
    const store = resolveStoreDomain(this);
    if (!product || !store) {
      this.replaceChildren(...(this.#fallback ?? []));
      return;
    }

    const locale = resolveLocale(this);
    const currency = resolveCurrency(this);
    const name = productName(product, locale);
    const pageHref = this.#pageHref(product);
    const pageUrl = pageHref ? new URL(pageHref, document.baseURI).href : null;

    const tile = document.createElement("article");
    tile.className = "foxy-product-tile";

    const image = product.definition.images?.[0];
    const media = document.createElement(pageHref ? "a" : "div");
    media.className = "foxy-product-tile-media";
    if (pageHref) {
      (media as HTMLAnchorElement).href = pageHref;
      // The name link below says the same; one tab stop is enough.
      media.tabIndex = -1;
      media.setAttribute("aria-hidden", "true");
    }
    if (image) {
      const img = document.createElement("img");
      img.src = image.src;
      img.alt = image.alt ?? "";
      img.loading = "lazy";
      if (image.width) img.width = image.width;
      if (image.height) img.height = image.height;
      media.append(img);
    }
    if (!product.is_in_stock) {
      const badge = document.createElement("span");
      badge.className = "foxy-product-badge";
      badge.textContent = format(locale, messages.soldOut);
      media.append(badge);
    }

    const heading = document.createElement(`h${this.headingLevel}`);
    heading.className = "foxy-product-tile-name";
    if (pageHref) {
      const link = document.createElement("a");
      link.href = pageHref;
      link.textContent = name;
      heading.append(link);
    } else {
      heading.textContent = name;
    }

    tile.append(media, heading, renderPrice(product, currency, locale));

    const action = this.#action(product, store, pageHref, locale);
    if (action) tile.append(action);

    const script = document.createElement("script");
    script.type = "application/ld+json";
    // `<` escaped, so a name can't close the script element.
    script.textContent = JSON.stringify(productJsonLd(product, name, currency, pageUrl)).replace(
      /</g,
      "\\u003c",
    );
    tile.append(script);

    this.replaceChildren(tile);
  }

  #action(
    product: CatalogProduct,
    store: string,
    pageHref: string | null,
    locale: string,
  ): HTMLAnchorElement | null {
    const button = document.createElement("a");
    button.className = "foxy-product-button";

    if (this.quickAdd === "auto" && isOneClick(product) && product.is_in_stock) {
      button.href = addToCartHref(store, product.sku);
      button.rel = "nofollow";
      button.textContent = format(locale, messages.addToCart);
      return button;
    }

    if (pageHref) {
      button.href = pageHref;
      button.textContent = format(
        locale,
        product.is_in_stock && !isOneClick(product) ? messages.chooseOptions : messages.viewProduct,
      );
      return button;
    }

    if (!product.is_in_stock) {
      button.setAttribute("role", "link");
      button.setAttribute("aria-disabled", "true");
      button.textContent = format(locale, messages.soldOut);
      return button;
    }

    console.warn(`[Foxy] ${product.sku} needs choices; give foxy-product-tile an href to its page.`);
    return null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "foxy-product-tile": ProductTileElement;
  }
}

if (!customElements.get("foxy-product-tile")) {
  customElements.define("foxy-product-tile", ProductTileElement);
}
