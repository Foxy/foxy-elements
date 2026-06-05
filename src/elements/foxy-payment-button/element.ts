import { buttonVariants } from "@foxy.io/design-system/ui/button";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import type { SezzleSdkInstance } from "@foxy.io/sdk/checkout";
import { CARD_TYPES } from "../foxy-payment-method-selector/constants";
import type { PaymentMethodSelectorOption } from "../foxy-payment-method-selector/types";
import {
  ThemeMixin,
  type ThemeAttributeName,
  type ThemeMixinMethods,
  type ThemePropertyValues,
} from "@/lib/theme-mixin";
import defaultShadowStyles from "@/index.css?inline";

type CheckoutApiLike = EventTarget & {
  state?: unknown;
  json?: unknown;
  sezzle?: SezzleSdkInstance | null;
};

// init() must only be called once per SDK instance — calling it again on the shared singleton
// overwrites handlers registered by the first call and breaks previously rendered buttons.
const sezzleInitialized = new WeakSet<SezzleSdkInstance>();

type SelectorWithSelectedOption = Element & {
  selectedOption?: PaymentMethodSelectorOption;
};

const LANG_ATTRIBUTE = "lang";
const MAX_RETRY_FRAMES = 60;

const ThemeableHTMLElement = ThemeMixin(HTMLElement);

export class PaymentButtonElement extends ThemeableHTMLElement {
  static get observedAttributes(): string[] {
    return ["id", LANG_ATTRIBUTE, ...ThemeableHTMLElement.themeAttributeNames];
  }

  #checkoutClient = checkoutClient as CheckoutApiLike;
  #selector: SelectorWithSelectedOption | null = null;
  #sezzleContainer: HTMLDivElement | null = null;
  #klarnaButton: HTMLButtonElement | null = null;
  #klarnaLink: HTMLLinkElement | null = null;
  #connected = false;
  #retryCount = 0;
  #retryRafId: number | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.#connected = true;
    this.syncThemeCssVarsToStyle();
    this.#connectToSelector();
    // One-shot fallback for when selector is defined after this element in HTML
    queueMicrotask(() => {
      if (!this.#connected || this.#selector) return;
      this.#connectToSelector();
      this.#render();
    });
    this.#checkoutClient.addEventListener(
      "afterStateChange",
      this.#handleApiChange,
    );
    this.#checkoutClient.addEventListener("update", this.#handleApiChange);
    this.#render();
  }

  disconnectedCallback(): void {
    this.#connected = false;
    this.#cancelRetry();
    this.#selector?.removeEventListener(
      "optionindexchange",
      this.#handleOptionIndexChange,
    );
    this.#checkoutClient.removeEventListener(
      "afterStateChange",
      this.#handleApiChange,
    );
    this.#checkoutClient.removeEventListener("update", this.#handleApiChange);
    this.#selector = null;
    this.#sezzleContainer?.remove();
    this.#sezzleContainer = null;
  }

  attributeChangedCallback(
    name: string,
    _old: string | null,
    _new: string | null,
  ): void {
    if (name === "id") {
      this.#connectToSelector();
    } else if (
      ThemeableHTMLElement.themeAttributeNames.includes(
        name as ThemeAttributeName,
      )
    ) {
      this.syncThemeCssVarsToStyle();
    }
    this.#render();
  }

  #connectToSelector(): void {
    if (this.#selector) {
      this.#selector.removeEventListener(
        "optionindexchange",
        this.#handleOptionIndexChange,
      );
      this.#selector = null;
    }

    const selector = this.#findSelector();
    if (selector) {
      this.#selector = selector;
      selector.addEventListener(
        "optionindexchange",
        this.#handleOptionIndexChange,
      );
    }
  }

  #findSelector(): SelectorWithSelectedOption | null {
    const id = this.id;
    if (!id) return null;
    return document.querySelector(
      `foxy-payment-method-selector[button="${CSS.escape(id)}"]`,
    ) as SelectorWithSelectedOption | null;
  }

  #handleOptionIndexChange = (): void => {
    this.#cancelRetry();
    this.#render();
  };

  #handleApiChange = (): void => {
    if (!this.#selector) {
      this.#connectToSelector();
    }
    this.#retryCount = 0;
    this.#scheduleRetry();
  };

  #scheduleRetry(): void {
    this.#cancelRetry();
    this.#retryOnce();
  }

  #retryOnce(): void {
    if (!this.#connected) return;

    const selectedOption = this.#selector?.selectedOption;
    // If the selector exists but options haven't loaded yet, retry next frame.
    // The selector's #generateOptions() is genuinely async (awaits Promise.all).
    if (
      this.#selector &&
      selectedOption === undefined &&
      this.#retryCount < MAX_RETRY_FRAMES
    ) {
      this.#retryCount++;
      this.#retryRafId = requestAnimationFrame(() => this.#retryOnce());
      return;
    }

    this.#retryCount = 0;
    this.#retryRafId = null;
    this.#render();
  }

  #cancelRetry(): void {
    if (this.#retryRafId !== null) {
      cancelAnimationFrame(this.#retryRafId);
      this.#retryRafId = null;
    }
    this.#retryCount = 0;
  }

  #resolveApiState(): Record<string, unknown> | null {
    const toRecord = (v: unknown): Record<string, unknown> | null =>
      v && typeof v === "object" && !Array.isArray(v)
        ? (v as Record<string, unknown>)
        : null;

    return (
      toRecord(this.#checkoutClient.state) ??
      toRecord(this.#checkoutClient.json)
    );
  }

  #resolveTotal(): string | undefined {
    const apiState = this.#resolveApiState();
    if (!apiState) return undefined;

    const totals = Array.isArray(apiState.totals) ? apiState.totals : [];
    const totalRecord = totals[0];
    if (!totalRecord || typeof totalRecord !== "object") return undefined;

    const total = totalRecord as Record<string, unknown>;
    const rawTotal = total.total_order;
    const totalOrder =
      typeof rawTotal === "number"
        ? rawTotal
        : typeof rawTotal === "string"
          ? Number(rawTotal)
          : NaN;
    if (!Number.isFinite(totalOrder)) return undefined;

    const format =
      apiState.format && typeof apiState.format === "object"
        ? (apiState.format as Record<string, unknown>)
        : null;
    const currencyCode =
      typeof format?.currency_code === "string"
        ? format.currency_code.trim()
        : "";
    if (!currencyCode) return undefined;

    const fractionDigits =
      typeof format?.maximum_fraction_digits === "number"
        ? format.maximum_fraction_digits
        : 2;

    const locale =
      this.getAttribute(LANG_ATTRIBUTE)?.trim() ||
      this.lang?.trim() ||
      document.documentElement.lang?.trim() ||
      "en-US";

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(totalOrder);
    } catch {
      return `${currencyCode} ${totalOrder.toFixed(fractionDigits)}`;
    }
  }

  #resolveKlarnaTheme(): "theme-dark" | "theme-light" {
    const bg = getComputedStyle(this).getPropertyValue("--background").trim();
    if (!bg) return "theme-dark";

    // oklch(L% C H ...) — L=100% is white, L=0% is black
    const oklchMatch = bg.match(/^oklch\s*\(\s*([0-9.]+)(%?)/i);
    if (oklchMatch) {
      const L = parseFloat(oklchMatch[1]);
      const isPercent = oklchMatch[2] === "%";
      return (isPercent ? L : L * 100) < 50 ? "theme-light" : "theme-dark";
    }

    // #rrggbb or #rgb hex
    const hexMatch = bg.match(/^#([0-9a-f]{3,6})$/i);
    if (hexMatch) {
      const h = hexMatch[1];
      const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0").slice(0, 6);
      const r = parseInt(full.slice(0, 2), 16);
      const g = parseInt(full.slice(2, 4), 16);
      const b = parseInt(full.slice(4, 6), 16);
      const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
      const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      return lum < 0.179 ? "theme-light" : "theme-dark";
    }

    // hsl(H S% L%) — L<50% is dark
    const hslMatch = bg.match(/^hsla?\s*\(\s*[\d.]+[^,]*[,\s]\s*[\d.]+%?\s*[,\s]\s*([\d.]+)%/i);
    if (hslMatch) {
      return parseFloat(hslMatch[1]) < 50 ? "theme-light" : "theme-dark";
    }

    return "theme-dark";
  }

  #renderSezzleButton(containerId: string): void {
    const sdk = this.#checkoutClient.sezzle;
    if (!sdk || !this.#sezzleContainer) return;
    if (!sezzleInitialized.has(sdk)) {
      sdk.init({});
      sezzleInitialized.add(sdk);
    }
    sdk.renderSezzleButton(containerId);
    // Sezzle sets width:auto and border-radius:300px on the rendered button.
    // Override both to match foxy-payment-button's full-width rounded-lg appearance.
    const sezzleBtn = this.#sezzleContainer.querySelector<HTMLElement>(
      "#sezzle-smart-button",
    );
    if (sezzleBtn) {
      sezzleBtn.style.width = "100%";
      sezzleBtn.style.borderRadius = "var(--radius, 0.625rem)";
      sezzleBtn.style.border = "none";
      sezzleBtn.style.margin = "0";
    }
  }

  #render(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    const selectedOption = this.#selector?.selectedOption;
    const type = selectedOption?.type;
    const isSezzle = type === "sezzle";
    const isKlarna = !!selectedOption?.klarna;
    const isPurchaseOrder = type === "purchase-order";
    const isMollie = type === "mollie";
    const isCard =
      type !== undefined &&
      (CARD_TYPES.has(type) ||
        type === "stripe-card-element" ||
        type === "ach");
    const total = isCard ? this.#resolveTotal() : undefined;
    const enabled =
      isPurchaseOrder || isMollie || (isCard && total !== undefined);
    const label = isPurchaseOrder
      ? "Place Order"
      : isMollie
        ? "Continue to Mollie"
        : enabled
          ? `Pay ${total}`
          : "Pay";

    let style = shadow.querySelector(
      "style[data-foxy-payment-button]",
    ) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.setAttribute("data-foxy-payment-button", "");
      style.textContent =
        `:host { display: block; } :host([hidden]) { display: none; }` +
        ` :host([data-sezzle]) button[part='button'], :host([data-klarna]) button[part='button'] { display: none; }` +
        ` button[part='button'] { height: 2.75rem; padding-inline: 1rem; gap: 0.5rem; font-size: 1rem; line-height: 1.5rem; }` +
        ` .klarna-sdk-button, .klarna-sdk-button__inner-container { border-radius: var(--radius, 0.625rem) !important; }` +
        `\n${defaultShadowStyles}`;
      shadow.insertBefore(style, shadow.firstChild);
    }

    if (!shadow.querySelector("slot[name='sezzle']")) {
      const slot = document.createElement("slot");
      slot.name = "sezzle";
      style.after(slot);
    }

    if (isSezzle) {
      this.setAttribute("data-sezzle", "");

      if (!this.#sezzleContainer && this.#checkoutClient.sezzle) {
        // Sezzle's injected CSS scopes all rules under #sezzle-smart-button-container,
        // so this id must be exactly that string for styles to apply.
        const containerId = "sezzle-smart-button-container";
        this.#sezzleContainer = document.createElement("div");
        this.#sezzleContainer.id = containerId;
        this.#sezzleContainer.slot = "sezzle";
        this.appendChild(this.#sezzleContainer);
        this.#renderSezzleButton(containerId);
      }
    } else {
      this.removeAttribute("data-sezzle");
      if (this.#sezzleContainer) {
        this.#sezzleContainer.remove();
        this.#sezzleContainer = null;
      }
    }

    if (isKlarna) {
      this.setAttribute("data-klarna", "");

      if (!this.#klarnaLink) {
        this.#klarnaLink = document.createElement("link");
        this.#klarnaLink.rel = "stylesheet";
        this.#klarnaLink.href =
          "https://js.klarna.com/web-sdk/buttons/payment-button.css";
        shadow.appendChild(this.#klarnaLink);
      }

      if (!this.#klarnaButton) {
        const btn = document.createElement("button");
        btn.style.cssText = "width: 100%; height: 48px;";
        btn.setAttribute("aria-label", "Continue with Klarna");

        const outline = document.createElement("div");
        outline.className = "klarna-sdk-button__outline";
        outline.setAttribute("aria-hidden", "true");

        const inner = document.createElement("div");
        inner.className = "klarna-sdk-button__inner-container";

        const text = document.createElement("div");
        text.className = "klarna-sdk-button__text";

        const copy = document.createElement("span");
        copy.className = "klarna-sdk-button-copy";
        copy.textContent = "Continue with";

        const badge = document.createElement("span");
        badge.className = "klarna-sdk-button-badge";

        text.appendChild(copy);
        text.appendChild(badge);
        inner.appendChild(text);
        btn.appendChild(outline);
        btn.appendChild(inner);

        this.#klarnaButton = btn;
        shadow.appendChild(btn);
      }

      this.#klarnaButton.className = `klarna-sdk-button ${this.#resolveKlarnaTheme()} shape-rect`;
    } else {
      this.removeAttribute("data-klarna");
      if (this.#klarnaButton) {
        this.#klarnaButton.remove();
        this.#klarnaButton = null;
      }
      if (this.#klarnaLink) {
        this.#klarnaLink.remove();
        this.#klarnaLink = null;
      }
    }

    if (!isSezzle && !isKlarna) {
      let button = shadow.querySelector(
        "button[part='button']",
      ) as HTMLButtonElement | null;
      if (!button) {
        button = document.createElement("button");
        button.setAttribute("part", "button");
        button.type = "button";
        button.className = `${buttonVariants()} w-full`;
        shadow.appendChild(button);
      }

      button.disabled = !enabled;
      button.textContent = label;
    }
  }
}

export interface PaymentButtonElement
  extends ThemePropertyValues, ThemeMixinMethods {}

if (!customElements.get("foxy-payment-button")) {
  customElements.define("foxy-payment-button", PaymentButtonElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "foxy-payment-button": PaymentButtonElement;
  }
}
