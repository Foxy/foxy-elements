import { createRoot, type Root } from "react-dom/client";
import { StyleSheetManager, ThemeProvider, type DefaultTheme } from "styled-components";
import { defaultTheme } from "@foxy.io/design-system/theme";
import { fetchProduct, resolveStoreDomain } from "@/lib/products/catalog";
import { watchFoxy2Session, whenParsed } from "@/lib/products/light-dom";
import { parseChoices } from "@/lib/products/options";
import { resolveCurrency, resolveLocale } from "@/lib/products/price";
import type { CatalogProduct } from "@/lib/products/types";
import {
  ThemeMixin,
  type ThemeMixinMethods,
  type ThemePropertyName,
  type ThemePropertyValues,
} from "@/lib/theme-mixin";
import { ProductFormView } from "./view";

const OBSERVED = ["sku", "store", "value", "show-quantity", "label", "currency", "lang"];

const ThemeableHTMLElement = ThemeMixin(HTMLElement);

/**
 * Everything a shopper chooses for one product: a parent's options, with
 * values that don't exist left out and sold-out ones shown disabled; the
 * product's modifiers; and quantity. The controls are design-system
 * components in shadow DOM. What the cart is sent is a hidden
 * `<form action="https://<store>/cart">` in light DOM, submitted with
 * `requestSubmit()`, so 2.0's `foxycart.js` takes it over as it would any
 * add-to-cart form, and the browser posts it when 2.0 isn't on the page.
 */
export class ProductFormElement extends ThemeableHTMLElement {
  #shadow = this.attachShadow({ mode: "open" });
  #container = document.createElement("div");
  #portal = document.createElement("div");
  #root: Root | null = null;
  #product: CatalogProduct | null | undefined;
  #loadedKey = "";
  #started = false;
  #unwatch: (() => void) | null = null;

  static get observedAttributes(): string[] {
    return [...OBSERVED, ...ThemeableHTMLElement.themeAttributeNames];
  }

  constructor() {
    super();
    // Shows the merchant's own content until the product has loaded.
    this.#container.append(document.createElement("slot"));
    this.#shadow.append(this.#container, this.#portal);
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

  /** Preselected options, as a query string: `color=Black&size=M`. */
  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(value: string) {
    this.setAttribute("value", value);
  }

  get showQuantity(): boolean {
    return this.hasAttribute("show-quantity");
  }

  set showQuantity(value: boolean) {
    this.toggleAttribute("show-quantity", value);
  }

  get label(): string {
    return this.getAttribute("label") ?? "";
  }

  set label(value: string) {
    this.setAttribute("label", value);
  }

  get currency(): string {
    return this.getAttribute("currency") ?? "";
  }

  set currency(value: string) {
    this.setAttribute("currency", value);
  }

  get product(): CatalogProduct | null | undefined {
    return this.#product;
  }

  connectedCallback(): void {
    whenParsed(() => {
      if (!this.isConnected || this.#started) return;
      this.#started = true;
      this.#unwatch = watchFoxy2Session(() => this.#render());
      this.#load();
    });
  }

  disconnectedCallback(): void {
    this.#started = false;
    this.#unwatch?.();
    this.#unwatch = null;
    // Unmounting synchronously during a React commit warns, so it waits.
    const root = this.#root;
    this.#root = null;
    this.#loadedKey = "";
    queueMicrotask(() => root?.unmount());
  }

  attributeChangedCallback(name: string): void {
    if (!this.#started) return;
    if (name === "sku" || name === "store") this.#load();
    else this.#render(name === "value");
  }

  #load(): void {
    const store = resolveStoreDomain(this);
    const sku = this.sku.trim();
    const key = `${store}\n${sku}`;
    if (key === this.#loadedKey) return;
    this.#loadedKey = key;
    this.#product = undefined;
    if (!store || !sku) {
      if (!store) console.warn("[Foxy] foxy-product-form needs a store attribute or a 2.0 loader.js on the page.");
      return;
    }

    fetchProduct(store, sku).then(
      (product) => {
        if (key !== this.#loadedKey) return;
        if (!product) console.warn(`[Foxy] No product with SKU "${sku}" in ${store}.`);
        this.#product = product;
        this.#render(true);
      },
      (error: unknown) => console.warn(error),
    );
  }

  /** `reset` starts the shopper's choices over, from `value`. */
  #render(reset = false): void {
    const product = this.#product;
    const store = resolveStoreDomain(this);
    if (!product || !store) return;

    this.syncThemeCssVarsToStyle();
    if (!this.#root) {
      // The merchant's fallback goes; the hidden cart form takes its place.
      this.replaceChildren();
      this.#container.replaceChildren();
      this.#root = createRoot(this.#container);
    }

    this.#root.render(
      <StyleSheetManager target={this.#shadow}>
        <ThemeProvider theme={{ tokens: this.#tokens() }}>
          <ProductFormView
            key={reset ? `${product.sku}:${this.value}:${Date.now()}` : product.sku}
            product={product}
            store={store}
            locale={resolveLocale(this)}
            currency={resolveCurrency(this)}
            initialChoices={parseChoices(this.value)}
            showQuantity={this.showQuantity}
            label={this.label}
            lightDom={this}
            portalContainer={this.#portal}
          />
        </ThemeProvider>
      </StyleSheetManager>,
    );
  }

  #tokens(): DefaultTheme["tokens"] {
    const get = (name: ThemePropertyName) => this.getThemeProperty(name);
    const t = defaultTheme;
    return {
      ...t,
      font: { ...t.font, body: get("themeFontBody") ?? t.font.body },
      color: {
        ...t.color,
        body: get("themeColorBody") ?? t.color.body,
        primary: get("themeColorPrimary") ?? t.color.primary,
        secondary: get("themeColorSecondary") ?? t.color.secondary,
        faint: get("themeColorFaint") ?? t.color.faint,
        error: get("themeColorError") ?? t.color.error,
        onPrimary: get("themeColorOnPrimary") ?? t.color.onPrimary,
      },
      background: {
        ...t.background,
        surface: get("themeBackgroundSurface") ?? t.background.surface,
        field: get("themeBackgroundField") ?? t.background.field,
        popup: get("themeBackgroundPopup") ?? t.background.popup,
        buttonPrimary: get("themeBackgroundButtonPrimary") ?? t.background.buttonPrimary,
        disabledField: get("themeBackgroundDisabledField") ?? t.background.disabledField,
      },
      border: {
        ...t.border,
        field: get("themeBorderField") ?? t.border.field,
        default: get("themeBorderDefault") ?? t.border.default,
      },
      borderRadius: {
        ...t.borderRadius,
        xs: get("themeBorderRadiusXs") ?? t.borderRadius.xs,
        sm: get("themeBorderRadiusSm") ?? t.borderRadius.sm,
        md: get("themeBorderRadiusMd") ?? t.borderRadius.md,
        pill: get("themeBorderRadiusPill") ?? t.borderRadius.pill,
      },
      outline: { ...t.outline, primary: get("themeOutlinePrimary") ?? t.outline.primary },
    };
  }
}

export interface ProductFormElement extends ThemeMixinMethods, ThemePropertyValues {}

declare global {
  interface HTMLElementTagNameMap {
    "foxy-product-form": ProductFormElement;
  }
}

if (!customElements.get("foxy-product-form")) {
  customElements.define("foxy-product-form", ProductFormElement);
}
