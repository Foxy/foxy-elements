// src/elements/foxy-side-cart-trigger/element.ts
import { IntlMessageFormat } from "intl-messageformat";
import { sideCart } from "@foxy.io/sdk/checkout/side-cart";
import enUsMessages from "@/locales/en-US.json";
import { messages } from "./messages";

const LANG_ATTRIBUTE = "lang";
const DEFAULT_LOCALE = "en-US";

const MESSAGES_BY_LOCALE: Record<string, Record<string, string>> = {
  "en-US": enUsMessages as Record<string, string>,
  en: enUsMessages as Record<string, string>,
};

// Defaults only -- every rendered node except the live region carries a
// `part`, and an outside `::part()` rule wins over these. `Canvas` /
// `CanvasText` are system colors, so the badge follows the page's
// `color-scheme` and forced-colors mode without a design-system dependency.
//
// The live region has no `part` on purpose: an outside `::part()` rule would
// beat `.visually-hidden` and could un-hide it. `display: none`,
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
  [part="button"]:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
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
  #label = document.createElement("span");
  #badge = document.createElement("span");
  #liveRegion = document.createElement("span");
  #lastCount: number | null = null;
  #announcedCount: number | null = null;

  static get observedAttributes(): string[] {
    return [LANG_ATTRIBUTE];
  }

  constructor() {
    super();

    const style = document.createElement("style");
    style.textContent = STYLES;

    this.#button.type = "button";
    this.#button.setAttribute("part", "button");
    this.#button.addEventListener("click", () => sideCart.show());
    this.#label.setAttribute("part", "label");
    this.#badge.setAttribute("part", "badge");
    this.#button.append(this.#label);

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

    this.#label.textContent = this.#format(messages.triggerLabel);
    this.#button.setAttribute(
      "aria-label",
      itemCount === null
        ? this.#format(messages.triggerLabel)
        : this.#format(messages.triggerLabelWithCount, { count: itemCount }),
    );

    // `null` means the count is not known yet -- render no badge. The node is
    // removed, not hidden: an outside `::part(badge) { display: ... }` rule
    // would override a `hidden` attribute.
    if (itemCount === null) {
      this.#badge.remove();
    } else {
      this.#badge.textContent = String(itemCount);
      this.#button.append(this.#badge);
    }

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
