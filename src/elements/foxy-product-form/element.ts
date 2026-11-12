import { PURCHASE_ATTRIBUTES, PurchaseElement } from "@/lib/products/purchase-element";
import type { Purchase } from "@/lib/products/purchase";
import type { CatalogProduct } from "@/lib/products/types";

/**
 * Everything a shopper chooses for one product, in a card: its name, price
 * and stock; a parent's options, with values that don't exist left out and
 * sold-out ones shown but not choosable; the chosen variant's modifiers;
 * and quantity. What the cart is sent is a hidden
 * `<form action="https://<store>/cart">` in light DOM, so 2.0's
 * `foxycart.js` takes it over as it would any add-to-cart form.
 */
export class ProductFormElement extends PurchaseElement {
  protected readonly optionStyle = "select";
  protected readonly defaultHeadingLevel = 2;
  protected readonly saysInStock = false;

  static get observedAttributes(): string[] {
    return [...PURCHASE_ATTRIBUTES, "show-quantity"];
  }

  get showQuantity(): boolean {
    return this.hasAttribute("show-quantity");
  }

  set showQuantity(value: boolean) {
    this.toggleAttribute("show-quantity", value);
  }

  protected get quantityStyle(): "input" | "none" {
    return this.showQuantity ? "input" : "none";
  }

  protected layout(product: CatalogProduct, purchase: Purchase): Node[] {
    const card = document.createElement("div");
    card.className = "foxy-product-form";
    const summary = document.createElement("div");
    summary.className = "foxy-product-summary";
    const { brand, name, price, note } = this.summary(product);
    summary.append(...(brand ? [brand] : []), name, price, note);
    card.append(summary, purchase.controls);
    return [card];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "foxy-product-form": ProductFormElement;
  }
}

if (!customElements.get("foxy-product-form")) {
  customElements.define("foxy-product-form", ProductFormElement);
}
