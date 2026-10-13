// src/elements/foxy-side-cart-trigger/element.ts
import { IntlMessageFormat } from "intl-messageformat";
import { sideCart } from "@foxy.io/sdk/checkout/side-cart";
import enUsMessages from "@/locales/en-US.json";
import { messages } from "./messages";

const LANG_ATTRIBUTE = "lang";
const LAYOUT_ATTRIBUTE = "layout";
const DEFAULT_LOCALE = "en-US";

const MESSAGES_BY_LOCALE: Record<string, Record<string, string>> = {
  "en-US": enUsMessages as Record<string, string>,
  en: enUsMessages as Record<string, string>,
};

export type SideCartTriggerLayout = "default" | "icon" | "text";

// Lucide's `shopping-cart` (ISC; the CDN build's LICENSE.md already carries
// Lucide's notice for `lucide-react`).
const ICON_SVG = `<svg part="icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;

// Lucide's `circle-alert`, same license note as the cart icon.
const ERROR_SVG = `<svg part="error" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;

// Defaults only -- every visible node carries a `part`, and an outside
// `::part()` rule wins over these. `Canvas` /
// `CanvasText` are system colors, so the badge follows the page's
// `color-scheme` and forced-colors mode without a design-system dependency.
//
// The live region, and the label in the `icon` layout, have no `part` on
// purpose: an outside `::part()` rule would beat `.visually-hidden` and could
// un-hide them. `display: none`,
// `visibility: hidden` and `hidden` would hide it from screen readers too,
// so it is clipped to nothing instead.
const STYLES = `
  :host { display: inline-block; }
  [part="button"] {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.5em 0.75em;
    border: 1px solid currentColor;
    border-radius: 0.375em;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  :host([layout="icon"]) [part="button"] { padding: 0.5em; }
  [part="button"]:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
  /* At least one line tall, so the icon layout matches the others' height. */
  [part="icon"] { width: 1.25em; height: max(1.25em, 1lh); flex: none; }
  [part="badge"] {
    min-width: 1.5em;
    padding: 0 0.375em;
    border-radius: 999px;
    background: CanvasText;
    color: Canvas;
    font-size: 0.875em;
    line-height: 1.5;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
  /* The margin makes it as tall as the badge (0.875em * 1.5), so the button
     does not change height when the count arrives. */
  [part="spinner"] {
    width: 1em;
    height: 1em;
    margin-block: 0.15625em;
    flex: none;
    box-sizing: border-box;
    border: 0.125em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    [part="spinner"] { animation-duration: 2.4s; }
  }
  @keyframes spin { to { transform: rotate(1turn); } }
  /* As tall as the badge, like the spinner. */
  [part="error"] { width: 1.3125em; height: 1.3125em; flex: none; }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

/**
 * `@foxy.io/sdk/checkout/side-cart` does not export a type for this, so it is
 * declared here from the shape documented on `sideCart`'s `itemcountchange`
 * event: `true` only for the first report after a connect (a
 * cache-to-authoritative correction the shopper did not cause), `false` for
 * every other source of a change.
 */
type SideCartItemCountChangeDetail = { corrected: boolean };

export class SideCartTriggerElement extends HTMLElement {
  #shadowRoot = this.attachShadow({ mode: "open" });
  #button = document.createElement("button");
  #icon: Element;
  #error: Element;
  #label = document.createElement("span");
  #badge = document.createElement("span");
  #spinner = document.createElement("span");
  #liveRegion = document.createElement("span");
  #lastCount: number | null = null;
  #announcedCount: number | null = null;

  static get observedAttributes(): string[] {
    return [LANG_ATTRIBUTE, LAYOUT_ATTRIBUTE];
  }

  /** `icon`, `text`, or `default` (icon and text) for any other value. */
  get layout(): SideCartTriggerLayout {
    const value = this.getAttribute(LAYOUT_ATTRIBUTE);
    return value === "icon" || value === "text" ? value : "default";
  }

  set layout(value: SideCartTriggerLayout) {
    this.setAttribute(LAYOUT_ATTRIBUTE, value);
  }

  constructor() {
    super();

    const style = document.createElement("style");
    style.textContent = STYLES;

    this.#button.type = "button";
    this.#button.setAttribute("part", "button");
    this.#button.addEventListener("click", () => sideCart.show());
    this.#badge.setAttribute("part", "badge");
    this.#spinner.setAttribute("part", "spinner");
    this.#spinner.setAttribute("aria-hidden", "true");

    const icon = document.createElement("template");
    icon.innerHTML = ICON_SVG;
    this.#icon = icon.content.firstElementChild as Element;
    icon.innerHTML = ERROR_SVG;
    this.#error = icon.content.firstElementChild as Element;

    // `aria-live="polite"` alone; `role="status"` would imply the same thing.
    this.#liveRegion.setAttribute("aria-live", "polite");
    this.#liveRegion.className = "visually-hidden";

    this.#shadowRoot.append(style, this.#button, this.#liveRegion);
  }

  #onCountChange = (event: Event): void => {
    // The SDK dispatches this on every genuine count change now, including
    // the first, corrective report after a connect -- it is the element's
    // only signal that the count changed at all, so re-rendering must not
    // depend on whether the change gets announced.
    const { corrected } = (event as CustomEvent<SideCartItemCountChangeDetail>)
      .detail;
    const next = sideCart.itemCount;
    // Silent for the first count to ever arrive (the shopper did not cause a
    // first count appearing) and silent for a correction the SDK flags as
    // such (a cache-to-authoritative catch-up, not a shopper action).
    // Announcing either is worse than announcing nothing.
    this.#announcedCount =
      this.#lastCount === null || next === null || corrected ? null : next;
    this.#lastCount = next;
    this.#render();
  };

  connectedCallback(): void {
    this.#lastCount = sideCart.itemCount;
    sideCart.addEventListener("itemcountchange", this.#onCountChange);
    this.#render();
  }

  disconnectedCallback(): void {
    sideCart.removeEventListener("itemcountchange", this.#onCountChange);

    // A stale announcement must not survive a disconnect: otherwise a
    // framework that re-parents this element (moves it in the DOM by
    // removing and re-appending it) resurrects whatever was last announced,
    // which can now contradict the badge a fresh render computes from the
    // live count.
    this.#announcedCount = null;
  }

  attributeChangedCallback(): void {
    this.#render();
  }

  #resolveLocale(): string {
    const fromAttribute = this.getAttribute(LANG_ATTRIBUTE);
    if (fromAttribute?.trim()) return fromAttribute.trim();
    if (document.documentElement.lang?.trim()) {
      return document.documentElement.lang.trim();
    }
    return DEFAULT_LOCALE;
  }

  #resolveMessages(locale: string): Record<string, string> {
    if (MESSAGES_BY_LOCALE[locale]) return MESSAGES_BY_LOCALE[locale];

    const baseLocale = locale.split("-")[0];
    if (baseLocale && MESSAGES_BY_LOCALE[baseLocale]) {
      return MESSAGES_BY_LOCALE[baseLocale];
    }

    return MESSAGES_BY_LOCALE[DEFAULT_LOCALE] ?? {};
  }

  #format(
    descriptor: { id: string; defaultMessage: string },
    values?: Record<string, number>,
  ): string {
    const locale = this.#resolveLocale().replace(/_/g, "-");
    const message =
      this.#resolveMessages(locale)[descriptor.id] ?? descriptor.defaultMessage;

    try {
      return String(new IntlMessageFormat(message, locale).format(values));
    } catch {
      // An invalid `lang` tag makes `Intl` throw; fall back rather than
      // render nothing.
      return String(
        new IntlMessageFormat(descriptor.defaultMessage, DEFAULT_LOCALE).format(
          values,
        ),
      );
    }
  }

  #render(): void {
    const itemCount = sideCart.itemCount;
    // One-shot: this render is the one that delivers the announcement, so it
    // is cleared here rather than left for something to time out later. No
    // timer needed -- whatever calls #render() next (the next count change,
    // an attribute change, anything) naturally renders with nothing to
    // announce, so a stale message never sits in the live region forever.
    const announcedCount = this.#announcedCount;
    this.#announcedCount = null;

    const layout = this.layout;
    this.#label.textContent = this.#format(messages.triggerLabel);
    this.#label.classList.toggle("visually-hidden", layout === "icon");
    if (layout === "icon") {
      this.#label.removeAttribute("part");
    } else {
      this.#label.setAttribute("part", "label");
    }
    const unavailable = sideCart.itemCountUnavailable;
    this.#button.setAttribute(
      "aria-label",
      unavailable
        ? this.#format(messages.triggerLabelUnavailable)
        : itemCount === null
          ? this.#format(messages.triggerLabel)
          : this.#format(messages.triggerLabelWithCount, { count: itemCount }),
    );

    // An error icon when the count can't load, a spinner while it is unknown
    // (`null`), nothing for an empty cart, a badge otherwise. Nodes are left
    // out, not hidden: an outside `::part() { display: ... }` rule would
    // override a `hidden` attribute.
    this.#badge.textContent = String(itemCount);
    this.#button.replaceChildren(
      ...(layout === "text" ? [] : [this.#icon]),
      this.#label,
      ...(unavailable
        ? [this.#error]
        : itemCount === null
          ? [this.#spinner]
          : itemCount
            ? [this.#badge]
            : []),
    );

    this.#liveRegion.textContent =
      announcedCount === null
        ? ""
        : this.#format(messages.triggerLabelWithCount, {
            count: announcedCount,
          });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "foxy-side-cart-trigger": SideCartTriggerElement;
  }
}

if (!customElements.get("foxy-side-cart-trigger")) {
  customElements.define("foxy-side-cart-trigger", SideCartTriggerElement);
}
