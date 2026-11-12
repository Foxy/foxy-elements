import { ProductElement, SHARED_ATTRIBUTES } from "./element-base";
import { priceNodes, renderPrice, stockNote } from "./light-dom";
import { format, messages } from "./messages";
import { parseChoices } from "./options";
import { productName } from "./price";
import { Purchase, type PurchaseSettings } from "./purchase";
import type { CatalogProduct } from "./types";

export const PURCHASE_ATTRIBUTES = [...SHARED_ATTRIBUTES, "value", "label", "heading-level"];

/**
 * What the elements a shopper chooses and adds from share: the product's
 * brand, name, live price and stock, and the `Purchase` that holds the
 * choices. The merchant's own content shows until the product has loaded.
 */
export abstract class PurchaseElement extends ProductElement {
  #purchase: Purchase | null = null;
  #purchaseKey = "";
  #price: HTMLElement | null = null;
  #note: HTMLElement | null = null;

  protected abstract readonly optionStyle: PurchaseSettings["optionStyle"];
  protected abstract readonly quantityStyle: PurchaseSettings["quantityStyle"];
  protected abstract readonly defaultHeadingLevel: number;
  /** Whether "In stock" is said, or only what's notable. */
  protected abstract readonly saysInStock: boolean;

  /** Preselected options, as a query string: `color=Black&size=M`. */
  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(value: string) {
    this.setAttribute("value", value);
  }

  get label(): string {
    return this.getAttribute("label") ?? "";
  }

  set label(value: string) {
    this.setAttribute("label", value);
  }

  /** The name's heading level, 1–6. */
  get headingLevel(): number {
    const level = Number(this.getAttribute("heading-level"));
    return Number.isInteger(level) && level >= 1 && level <= 6 ? level : this.defaultHeadingLevel;
  }

  set headingLevel(value: number) {
    this.setAttribute("heading-level", String(value));
  }

  /** Everything but the cart form, built around `purchase.controls`. */
  protected abstract layout(product: CatalogProduct, purchase: Purchase): Node[];

  /** Called after each choice, for what else follows the chosen variant. */
  protected chosenChanged(_product: CatalogProduct, _chosen: CatalogProduct | undefined): void {}

  protected attributeChanged(name: string): void {
    // A new `value` starts the shopper's choices over.
    if (name === "value") this.#purchaseKey = "";
    this.render();
  }

  protected render(): void {
    const product = this.product;
    const store = this.storeDomain;
    if (!store && this.started) {
      this.warn(`[Foxy] ${this.localName} needs a store attribute or a 2.0 loader.js on the page.`);
    }
    if (!product || !store) {
      if (this.#purchase) {
        this.#purchase = null;
        this.#purchaseKey = "";
        this.showFallback();
      }
      return;
    }

    const settings: PurchaseSettings = {
      store,
      locale: this.locale,
      currency: this.shownCurrency,
      label: this.label || this.look.buttonText || "",
      optionStyle: this.optionStyle,
      quantityStyle: this.quantityStyle,
    };

    const root = this.getRootNode() as Document | ShadowRoot;
    const focused = this.contains(root.activeElement) ? root.activeElement?.id : "";

    const key = `${store}\n${product.sku}`;
    if (!this.#purchase || key !== this.#purchaseKey) {
      this.#purchaseKey = key;
      this.#price = null;
      this.#purchase = new Purchase(product, settings, parseChoices(this.value), () => this.#changed());
    } else {
      this.#purchase.configure(settings);
    }

    // The merchant's fallback goes; the hidden cart form stays in light DOM,
    // where 2.0 sees its submit.
    this.replaceChildren(...this.layout(product, this.#purchase), this.#purchase.cartForm);
    this.#changed();
    if (focused) this.querySelector<HTMLElement>(`#${CSS.escape(focused)}`)?.focus();
  }

  /** Brand, name, and the price and stock that follow the shopper's choices. */
  protected summary(product: CatalogProduct): { brand: HTMLElement | null; name: HTMLElement; price: HTMLElement; note: HTMLElement } {
    let brand: HTMLElement | null = null;
    if (product.definition.brand) {
      brand = document.createElement("p");
      brand.className = "foxy-product-brand";
      brand.textContent = product.definition.brand;
    }
    const name = document.createElement(`h${this.headingLevel}`);
    name.className = "foxy-product-name";
    name.textContent = productName(product, this.locale);

    this.#price = document.createElement("p");
    this.#price.className = "foxy-product-price";
    this.#price.setAttribute("aria-live", "polite");
    this.#note = document.createElement("p");
    this.#note.className = "foxy-product-note";
    return { brand, name, price: this.#price, note: this.#note };
  }

  #changed(): void {
    const purchase = this.#purchase;
    const product = this.product;
    if (!purchase || !product || !this.#price || !this.#note) return;
    const locale = this.locale;
    const currency = this.shownCurrency;

    const live = purchase.price;
    this.#price.replaceChildren(
      ...(live
        ? priceNodes(live.price, live.listPrice, currency, locale)
        : renderPrice(product, currency, locale).childNodes),
    );

    const chosen = purchase.chosen;
    const stock = stockNote(chosen ?? product, this.look.lowStockThreshold, locale);
    // Before a variant is chosen, only "sold out" is known of the product.
    const note =
      chosen || stock?.tone === "notice"
        ? stock ?? (this.saysInStock ? { text: format(locale, messages.inStock), tone: "success" } : null)
        : null;
    this.#note.textContent = note?.text ?? "";
    this.#note.hidden = !note;
    if (note) this.#note.dataset.tone = note.tone;

    this.chosenChanged(product, chosen);
  }
}
