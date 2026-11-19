import { analyticsDetail, analyticsItem } from "@/lib/products/analytics";
import { ProductElement, SHARED_ATTRIBUTES } from "@/lib/products/element-base";
import { addToCartHref, chooseLabel, renderPrice } from "@/lib/products/light-dom";
import { productPageHref } from "@/lib/products/look";
import { format, messages } from "@/lib/products/messages";
import { isOneClick } from "@/lib/products/options";

/**
 * A link that adds one product to the cart:
 * `<a href="https://<store>/cart?sku=…">`, in light DOM, so 2.0's
 * `foxycart.js` opens its sidecart for it and it works without JavaScript.
 * For a product without choices or one variant; a parent's SKU can't be
 * added, because the 2.0 cart has nowhere to choose its options, so its
 * link goes to the product's page instead.
 */
export class ProductLinkElement extends ProductElement {
  static get observedAttributes(): string[] {
    return [...SHARED_ATTRIBUTES, "quantity", "label", "checkout", "show-price", "appearance"];
  }

  /** Units to add; 1 when unset. */
  get quantity(): number {
    const value = Number(this.getAttribute("quantity"));
    return Number.isInteger(value) && value > 0 ? value : 1;
  }

  set quantity(value: number) {
    this.setAttribute("quantity", String(value));
  }

  get label(): string {
    return this.getAttribute("label") ?? "";
  }

  set label(value: string) {
    this.setAttribute("label", value);
  }

  /** Goes straight to checkout (`cart=checkout`) instead of the cart. */
  get checkout(): boolean {
    return this.hasAttribute("checkout");
  }

  set checkout(value: boolean) {
    this.toggleAttribute("checkout", value);
  }

  /**
   * Whether the price follows the text. Unset, it does unless the merchant
   * wrote their own `label`; `show-price="false"` turns it off.
   */
  get showPrice(): boolean {
    const value = this.getAttribute("show-price");
    return value === null ? !this.label : value !== "false";
  }

  set showPrice(value: boolean) {
    this.setAttribute("show-price", value ? "" : "false");
  }

  /** `text` is a plain text link; anything else a button. */
  get appearance(): "button" | "text" {
    return this.getAttribute("appearance") === "text" ? "text" : "button";
  }

  set appearance(value: "button" | "text") {
    this.setAttribute("appearance", value);
  }

  protected render(): void {
    const store = this.storeDomain;
    const sku = this.wantedSku;
    const product = this.product;

    if (!store || !sku) {
      if (!store) this.warn("[Foxy] foxy-product-link needs a store attribute or a 2.0 loader.js on the page.");
      this.showFallback();
      return;
    }

    const locale = this.locale;
    const link = document.createElement("a");
    link.className = this.appearance === "text" ? "foxy-product-text-link" : "foxy-product-button";
    const label = document.createElement("span");
    label.className = "foxy-product-label";
    link.append(label);

    if (product && !isOneClick(product)) {
      const variant = product._embedded?.variants?.[0]?.sku;
      this.warn(
        product.product_type === "parent"
          ? `[Foxy] foxy-product-link can't add ${sku}: it comes in variants, and the cart can't ask which. Point the link at one variant's SKU${variant ? ` (such as ${variant})` : ""}, or use foxy-product-form.`
          : `[Foxy] foxy-product-link can't add ${sku}: it has a required choice. Use foxy-product-form.`,
      );
      if (this.hasFallback) {
        this.showFallback();
        return;
      }
      // With nothing of the merchant's to show, it says what is needed and
      // goes to where that can be chosen, when the store says where that is.
      label.textContent = chooseLabel(product, locale);
      const page = productPageHref(this.look.productUrl ?? "", product);
      if (page) link.href = page;
      else {
        link.setAttribute("aria-disabled", "true");
        link.setAttribute("role", "link");
      }
      this.replaceChildren(link);
      return;
    }

    const requested = this.requestedCurrency;
    link.rel = "nofollow";
    label.textContent = this.label || this.look.buttonText || format(locale, messages.addToCart);

    if (product && !product.is_in_stock) {
      // No href: it isn't a link any more, so neither 2.0 nor a click adds it.
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("role", "link");
      label.textContent = format(locale, messages.soldOut);
    } else {
      link.href = addToCartHref(store, sku, {
        quantity: this.quantity > 1 ? String(this.quantity) : undefined,
        cart: this.checkout ? "checkout" : undefined,
      });
      if (this.showPrice && product) link.append(" · ", renderPrice(product, requested, locale));
      if (product) {
        link.addEventListener("click", () => {
          const { item, currency } = analyticsItem(product, locale, requested, {
            chosen: product,
            quantity: this.quantity,
          });
          this.addStarted(analyticsDetail([item], currency));
        });
      }
    }

    this.replaceChildren(link);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "foxy-product-link": ProductLinkElement;
  }
}

if (!customElements.get("foxy-product-link")) {
  customElements.define("foxy-product-link", ProductLinkElement);
}
