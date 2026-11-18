import { ProductElement, SHARED_ATTRIBUTES } from "@/lib/products/element-base";
import {
  addToCartHref,
  jsonLdScript,
  productImage,
  renderPrice,
  stockNote,
} from "@/lib/products/light-dom";
import { chooseMessage, format, messages } from "@/lib/products/messages";
import { isOneClick, productOptions } from "@/lib/products/options";
import { productName } from "@/lib/products/price";
import { productJsonLd } from "@/lib/products/structured-data";
import type { CatalogProduct } from "@/lib/products/types";

/**
 * One product in a grid: image, brand, name, price, and either a one-click
 * add or a link to the merchant's own product page. A product with options
 * or a required modifier always links to its page, where they can be
 * chosen. Everything renders in light DOM, so 2.0 sees the add link and
 * search engines see the text, along with schema.org `Product` data.
 */
export class ProductTileElement extends ProductElement {
  static get observedAttributes(): string[] {
    return [...SHARED_ATTRIBUTES, "href", "quick-add", "heading-level"];
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
   * so a grid needs no request per tile; setting it also sets `sku`. A
   * parent given without its variants shows its own price, not a range.
   */
  get product(): CatalogProduct | null | undefined {
    return super.product;
  }

  set product(value: CatalogProduct | null | undefined) {
    this.setProduct(value);
    if (value && this.getAttribute("sku") !== value.sku) this.setAttribute("sku", value.sku);
    this.render();
  }

  #pageHref(product: CatalogProduct): string | null {
    const pattern = this.href.trim();
    return pattern ? pattern.replaceAll("{sku}", encodeURIComponent(product.sku)) : null;
  }

  protected render(): void {
    const product = this.product;
    if (!this.started && !product) return;
    const store = this.storeDomain;
    if (!product || !store) {
      this.showFallback();
      return;
    }

    const locale = this.locale;
    const currency = this.shownCurrency;
    const name = productName(product, locale);
    const pageHref = this.#pageHref(product);
    const pageUrl = pageHref ? new URL(pageHref, document.baseURI).href : null;

    const tile = document.createElement("article");
    tile.className = "foxy-product-tile";

    const media = document.createElement(pageHref ? "a" : "div");
    media.className = "foxy-product-tile-media";
    if (pageHref) {
      (media as HTMLAnchorElement).href = pageHref;
      // The name link below says the same; one tab stop is enough.
      media.tabIndex = -1;
      media.setAttribute("aria-hidden", "true");
    }
    const image = productImage(product.definition.images?.[0], true);
    if (image) media.append(image);

    const body = document.createElement("div");
    body.className = "foxy-product-tile-body";

    if (product.definition.brand) {
      const brand = document.createElement("p");
      brand.className = "foxy-product-brand";
      brand.textContent = product.definition.brand;
      body.append(brand);
    }

    const heading = document.createElement(`h${this.headingLevel}`);
    heading.className = "foxy-product-name";
    if (pageHref) {
      const link = document.createElement("a");
      link.href = pageHref;
      link.textContent = name;
      heading.append(link);
    } else {
      heading.textContent = name;
    }

    const price = document.createElement("p");
    price.className = "foxy-product-tile-price";
    price.append(renderPrice(product, currency, locale));
    body.append(heading, price);

    const stock = stockNote(product, this.look.lowStockThreshold, locale);
    if (stock) {
      const note = document.createElement("p");
      note.className = "foxy-product-note";
      note.dataset.tone = stock.tone;
      note.textContent = stock.text;
      body.append(note);
    }

    const action = this.#action(product, store, pageHref, locale);
    if (action) {
      const holder = document.createElement("div");
      holder.className = "foxy-product-tile-action";
      holder.append(action);
      body.append(holder);
    }

    tile.append(media, body, jsonLdScript(productJsonLd(product, name, currency, pageUrl)));
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

    if (!product.is_in_stock) {
      // No href, so nothing can add it; the name still links to its page.
      button.setAttribute("role", "link");
      button.setAttribute("aria-disabled", "true");
      button.textContent = format(locale, messages.soldOut);
      return button;
    }

    const oneClick = isOneClick(product);
    if (oneClick && this.quickAdd === "auto") {
      button.href = addToCartHref(store, product.sku);
      button.rel = "nofollow";
      button.textContent = this.look.buttonText || format(locale, messages.addToCart);
      return button;
    }

    if (!pageHref) {
      if (!oneClick) {
        this.warn(`[Foxy] ${product.sku} needs choices; give foxy-product-tile an href to its page.`);
      }
      return null;
    }

    button.classList.add("foxy-product-button-secondary");
    button.href = pageHref;
    button.textContent = oneClick ? format(locale, messages.viewProduct) : this.#chooseLabel(product, locale);
    return button;
  }

  /** "Choose size and colour" for one or two options; "Choose options" otherwise. */
  #chooseLabel(product: CatalogProduct, locale: string): string {
    const [first, second, ...more] = productOptions(product).map(({ label }) => label.toLowerCase());
    if (first && second && !more.length) return format(locale, messages.chooseTwo, { first, second });
    if (first && !second) {
      return format(locale, chooseMessage(first), { option: first });
    }
    return format(locale, messages.chooseOptions);
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
