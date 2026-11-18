import { jsonLdScript, productImage } from "@/lib/products/light-dom";
import { renderMarkdown } from "@/lib/products/markdown";
import { format, messages } from "@/lib/products/messages";
import { productDescription, productName } from "@/lib/products/price";
import { PURCHASE_ATTRIBUTES, PurchaseElement } from "@/lib/products/purchase-element";
import type { Purchase } from "@/lib/products/purchase";
import { productJsonLd } from "@/lib/products/structured-data";
import type { CatalogProduct, ProductImage } from "@/lib/products/types";

/**
 * A whole product page: photos, brand, name, live price and stock, option
 * pickers, the chosen variant's modifiers, quantity, the add button, the
 * description and a list of details, with schema.org `Product` data. It
 * renders in light DOM, so search engines read its text, and adds through
 * a hidden `<form action="https://<store>/cart">` that 2.0's `foxycart.js`
 * takes over.
 */
export class ProductPageElement extends PurchaseElement {
  protected readonly quantityStyle = "stepper";
  protected readonly defaultHeadingLevel = 1;
  protected readonly saysInStock = true;

  #gallery: HTMLElement | null = null;
  #images: ProductImage[] = [];
  #photo = 0;
  #skuValue: HTMLElement | null = null;

  static get observedAttributes(): string[] {
    return [...PURCHASE_ATTRIBUTES, "sku-param"];
  }

  /**
   * The name of a query parameter of the page's address that holds the SKU,
   * so one page serves every product: `sku-param="sku"` reads `?sku=…`.
   * A `sku` attribute wins over it.
   */
  get skuParam(): string {
    return this.getAttribute("sku-param") ?? "";
  }

  set skuParam(value: string) {
    this.setAttribute("sku-param", value);
  }

  protected get wantedSku(): string {
    const fromPage = this.skuParam && new URLSearchParams(location.search).get(this.skuParam);
    return this.sku.trim() || fromPage?.trim() || "";
  }

  protected layout(product: CatalogProduct, purchase: Purchase): Node[] {
    const locale = this.locale;
    const t = (message: Parameters<typeof format>[1]) => format(locale, message);
    const el = (tag: string, className: string, text?: string) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    };

    const page = el("div", "foxy-product-page");
    const main = el("article", "foxy-product-main");
    this.#gallery = el("div", "foxy-product-gallery");
    this.#images = [];

    const info = el("div", "foxy-product-info");
    const summary = el("div", "foxy-product-summary");
    const { brand, name, price, note } = this.summary(product);
    const priceRow = el("div", "foxy-product-price-row");
    priceRow.append(price, note);
    summary.append(...(brand ? [brand] : []), name, priceRow);
    info.append(summary, purchase.controls);
    main.append(this.#gallery, info);
    page.append(main);

    const below = el("div", "foxy-product-below");
    const description = productDescription(product, locale);
    if (description.trim()) {
      const section = el("section", "foxy-product-description");
      section.append(renderMarkdown(description));
      below.append(section);
    }

    const details = el("section", "foxy-product-details");
    const list = document.createElement("dl");
    const row = (term: string, value: string) => {
      const dd = document.createElement("dd");
      dd.textContent = value;
      list.append(Object.assign(document.createElement("dt"), { textContent: term }), dd);
      return dd;
    };
    const { definition } = product;
    if (definition.brand) row(t(messages.brand), definition.brand);
    this.#skuValue = row(t(messages.sku), product.sku);
    if (definition.gtin) row(t(messages.gtin), definition.gtin);
    if (definition.mpn) row(t(messages.mpn), definition.mpn);
    for (const [property, value] of Object.entries(definition.properties ?? {})) {
      row(property, Array.isArray(value) ? value.join(", ") : String(value));
    }
    details.append(el("h2", "", t(messages.details)), list);
    below.append(details);
    page.append(below);

    const url = location.href.split("#")[0];
    return [page, jsonLdScript(productJsonLd(product, productName(product, locale), this.shownCurrency, url))];
  }

  protected chosenChanged(product: CatalogProduct, chosen: CatalogProduct | undefined): void {
    if (this.#skuValue) this.#skuValue.textContent = (chosen ?? product).sku;

    // A variant with photos of its own shows them once it's chosen.
    const images = (chosen?.definition.images?.length ? chosen : product).definition.images ?? [];
    const changed =
      images.length !== this.#images.length ||
      images.some((image, index) => image.src !== this.#images[index]?.src);
    if (changed || !this.#gallery?.hasChildNodes()) {
      this.#images = images;
      this.#photo = 0;
      this.#renderGallery();
    }
  }

  #renderGallery(): void {
    const gallery = this.#gallery;
    if (!gallery) return;
    const images = this.#images;
    gallery.hidden = !images.length;

    const hero = document.createElement("div");
    hero.className = "foxy-product-hero";
    const children: HTMLElement[] = [hero];
    const buttons: HTMLButtonElement[] = [];
    // Shows a photo without rebuilding the thumbnails, which would end the
    // hover or take the focus that chose it.
    const show = (index: number): void => {
      this.#photo = index;
      const shown = productImage(images[index], false);
      hero.replaceChildren(...(shown ? [shown] : []));
      buttons.forEach((button, at) => button.setAttribute("aria-current", String(at === index)));
    };

    if (images.length > 1) {
      const thumbs = document.createElement("div");
      thumbs.className = "foxy-product-thumbs";
      images.forEach((image, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", format(this.locale, messages.showPhoto, { number: index + 1 }));
        const thumb = productImage(image, true);
        if (thumb) {
          // The button's label says which photo; the photo's own text would repeat the hero's.
          thumb.alt = "";
          button.append(thumb);
        }
        for (const type of ["click", "focus", "pointerenter"]) button.addEventListener(type, () => show(index));
        buttons.push(button);
        thumbs.append(button);
      });
      children.push(thumbs);
    }
    show(this.#photo);
    gallery.replaceChildren(...children);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "foxy-product-page": ProductPageElement;
  }
}

if (!customElements.get("foxy-product-page")) {
  customElements.define("foxy-product-page", ProductPageElement);
}
