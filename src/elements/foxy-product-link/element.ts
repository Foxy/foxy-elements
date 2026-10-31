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
import { resolveCurrency, resolveLocale } from "@/lib/products/price";
import type { CatalogProduct } from "@/lib/products/types";

const OBSERVED = [
  "sku",
  "store",
  "quantity",
  "label",
  "checkout",
  "show-price",
  "currency",
  "lang",
] as const;

/**
 * A link styled as a button that adds one product to the cart:
 * `<a href="https://<store>/cart?sku=…">`, in light DOM, so 2.0's
 * `foxycart.js` opens its sidecart for it and it works without JavaScript.
 * Meant for standalone products and variants; a parent needs
 * `foxy-product-form`.
 */
export class ProductLinkElement extends HTMLElement {
  #product: CatalogProduct | null | undefined;
  #loadedKey = "";
  #fallback: Node[] | null = null;
  #unwatch: (() => void) | null = null;
  #renderedCurrency: string | null = null;
  #started = false;

  static get observedAttributes(): string[] {
    return [...OBSERVED];
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

  get showPrice(): boolean {
    return this.hasAttribute("show-price");
  }

  set showPrice(value: boolean) {
    this.toggleAttribute("show-price", value);
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

  connectedCallback(): void {
    ensureStyles(this);
    whenParsed(() => {
      if (!this.isConnected || this.#started) return;
      // Whatever the merchant wrote inside the tag shows until the link
      // renders, and comes back if it can't.
      this.#fallback ??= [...this.childNodes];
      this.#started = true;
      // Re-rendering replaces the link, and with it the shopper's focus, so
      // only a change of currency does.
      this.#unwatch = watchFoxy2Session(() => {
        if (resolveCurrency(this) !== this.#renderedCurrency) this.#render();
      });
      this.#load();
    });
  }

  disconnectedCallback(): void {
    this.#started = false;
    this.#unwatch?.();
    this.#unwatch = null;
  }

  attributeChangedCallback(name: string): void {
    // Upgrades call this before connectedCallback, while the fallback is
    // still unsaved.
    if (!this.#started) return;
    if (name === "sku" || name === "store") this.#load();
    else this.#render();
  }

  #load(): void {
    const store = resolveStoreDomain(this);
    const sku = this.sku.trim();
    const key = `${store}\n${sku}`;
    if (key === this.#loadedKey) return;
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
      (error: unknown) => {
        // The cart is the authority, so a catalog outage keeps the plain link.
        console.warn(error);
      },
    );
  }

  #render(): void {
    const store = resolveStoreDomain(this);
    const sku = this.sku.trim();
    const product = this.#product;

    if (!store || !sku) {
      if (!store) console.warn("[Foxy] foxy-product-link needs a store attribute or a 2.0 loader.js on the page.");
      this.#showFallback();
      return;
    }

    if (product && !isOneClick(product)) {
      console.warn(
        `[Foxy] ${sku} needs choices before it can be added; use foxy-product-form.`,
      );
      this.#showFallback();
      return;
    }

    const locale = resolveLocale(this);
    const currency = resolveCurrency(this);
    this.#renderedCurrency = currency;
    const link = document.createElement("a");
    link.className = "foxy-product-button";
    link.rel = "nofollow";

    const label = document.createElement("span");
    label.className = "foxy-product-label";
    label.textContent = this.label || format(locale, messages.addToCart);
    link.append(label);

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
    }

    if (this.showPrice && product) link.append(renderPrice(product, currency, locale));

    this.replaceChildren(link);
  }

  #showFallback(): void {
    this.replaceChildren(...(this.#fallback ?? []));
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
