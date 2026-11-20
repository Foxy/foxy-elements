import { analyticsDetail, analyticsItem } from "./analytics";
import { ProductElement, SHARED_ATTRIBUTES } from "./element-base";
import { priceNodes, renderPrice, stockNote } from "./light-dom";
import { format, messages } from "./messages";
import { parseChoices } from "./options";
import { productName } from "./price";
import { Purchase, type PurchaseSettings } from "./purchase";
import type { CatalogProduct } from "./types";

export const PURCHASE_ATTRIBUTES = [...SHARED_ATTRIBUTES, "value", "label", "heading-level", "option-style"];

/**
 * What the elements a shopper chooses and adds from share: the product's
 * brand, name, live price and stock, and the `Purchase` that holds the
 * choices. The merchant's own content shows until the product has loaded.
 */
export abstract class PurchaseElement extends ProductElement {
  #purchase: Purchase | null = null;
  #restart = false;
  #viewed = "";
  #price: HTMLElement | null = null;
  #note: HTMLElement | null = null;

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

  /**
   * How a parent's options are offered: `buttons` (the default; swatches
   * for values with a colour or photo), `rows` (a list, each value with its
   * price) or `select` (drop-downs).
   */
  get optionStyle(): PurchaseSettings["optionStyle"] {
    const style = this.getAttribute("option-style");
    return style === "rows" || style === "select" ? style : "buttons";
  }

  set optionStyle(value: PurchaseSettings["optionStyle"]) {
    this.setAttribute("option-style", value);
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
    if (name === "value") this.#restart = true;
    if (name === "label" || name === "option-style" || name === "show-quantity") this.refresh();
    else this.render();
  }

  /** Updates the controls, price and stock where they stand, when there is something rendered to update. */
  protected refresh(): void {
    const settings = this.#settings();
    if (!settings || !this.#purchase || this.#purchase.product !== this.product || !this.#price?.isConnected) {
      this.render();
      return;
    }
    this.#purchase.configure(settings);
  }

  #settings(): PurchaseSettings | null {
    const store = this.storeDomain;
    return store
      ? {
          store,
          locale: this.locale,
          currency: this.requestedCurrency,
          label: this.label || this.look.buttonText || "",
          optionStyle: this.optionStyle,
          quantityStyle: this.quantityStyle,
        }
      : null;
  }

  protected render(): void {
    const product = this.product;
    const settings = this.#settings();
    if (!settings && this.started) {
      this.warn(`[Foxy] ${this.localName} needs a store attribute or a 2.0 loader.js on the page.`);
    }
    if (!product || !settings) {
      if (this.#purchase) {
        this.#purchase = null;
        this.showFallback();
      }
      return;
    }

    const root = this.getRootNode() as Document | ShadowRoot;
    const focused = this.contains(root.activeElement) ? root.activeElement?.id : "";

    let purchase = this.#purchase;
    if (!purchase || purchase.product !== product || this.#restart) {
      this.#restart = false;
      this.#price = null;
      const created = (purchase = new Purchase(product, settings, parseChoices(this.value), () => this.#changed()));
      created.cartForm.addEventListener("submit", () => this.#addStarted(created));
      this.#purchase = created;
    } else {
      purchase.configure(settings);
    }

    // The merchant's fallback goes; the hidden cart form stays in light DOM,
    // where 2.0 sees its submit.
    this.replaceChildren(...this.layout(product, purchase), purchase.cartForm);
    this.#changed();
    if (focused) this.querySelector<HTMLElement>(`#${CSS.escape(focused)}`)?.focus();

    const viewed = `${settings.store}\n${product.sku}`;
    if (viewed !== this.#viewed) {
      this.#viewed = viewed;
      const { item, currency } = analyticsItem(product, settings.locale, settings.currency);
      this.track("view_item", analyticsDetail([item], currency));
    }
  }

  #addStarted(purchase: Purchase): void {
    const { chosen, price } = purchase;
    if (!chosen || !price) return;
    const { item } = analyticsItem(purchase.product, this.locale, this.requestedCurrency, {
      chosen,
      price: price.price,
      quantity: purchase.state.quantity,
    });
    this.addStarted(analyticsDetail([item], price.currency));
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

    const live = purchase.price;
    this.#price.replaceChildren(
      ...(live
        ? priceNodes(live.price, live.listPrice, live.currency, locale)
        : renderPrice(product, this.requestedCurrency, locale).childNodes),
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
