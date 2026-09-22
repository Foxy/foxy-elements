// src/elements/foxy-side-cart-trigger/element.tsx
import type { Root } from "react-dom/client";

import { createRoot } from "react-dom/client";
import { defaultTheme } from "@foxy.io/design-system/theme";
import { sideCart } from "@foxy.io/sdk/checkout/side-cart";
import { SideCartTriggerView } from "./view";
import { StyleSheetManager, ThemeProvider } from "styled-components";
import { IntlProvider } from "react-intl";
import enUsMessages from "@/locales/en-US.json";
import {
  ThemeMixin,
  type ThemeAttributeName,
} from "@/lib/theme-mixin";

const LANG_ATTRIBUTE = "lang";
const DEFAULT_LOCALE = "en-US";

const MESSAGES_BY_LOCALE: Record<string, Record<string, string>> = {
  "en-US": enUsMessages as Record<string, string>,
  en: enUsMessages as Record<string, string>,
};

const ThemeableHTMLElement = ThemeMixin(HTMLElement);

/**
 * `@foxy.io/sdk/checkout/side-cart` does not export a type for this, so it is
 * declared here from the shape documented on `sideCart`'s `itemcountchange`
 * event: `true` only for the first report after a connect (a
 * cache-to-authoritative correction the shopper did not cause), `false` for
 * every other source of a change.
 */
type SideCartItemCountChangeDetail = { corrected: boolean };

export class SideCartTriggerElement extends ThemeableHTMLElement {
  #shadowRoot = this.attachShadow({ mode: "open" });
  #root: Root | null = null;
  #container = document.createElement("div");
  #lastCount: number | null = null;
  #announcedCount: number | null = null;

  static get observedAttributes(): string[] {
    return [LANG_ATTRIBUTE, ...ThemeableHTMLElement.themeAttributeNames];
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
    if (!this.#root) {
      this.#shadowRoot.appendChild(this.#container);
      this.#root = createRoot(this.#container);
    }

    this.syncThemeCssVarsToStyle();
    this.#lastCount = sideCart.itemCount;
    sideCart.addEventListener("itemcountchange", this.#onCountChange);
    this.#render();
  }

  disconnectedCallback(): void {
    sideCart.removeEventListener("itemcountchange", this.#onCountChange);
    this.#root?.unmount();
    this.#root = null;

    // A stale announcement must not survive a disconnect: otherwise a
    // framework that re-parents this element (moves it in the DOM by
    // removing and re-appending it) resurrects whatever was last announced,
    // which can now contradict the badge a fresh render computes from the
    // live count.
    this.#announcedCount = null;

    // `root.unmount()` only tears down the React tree; the `<style>` tag
    // `StyleSheetManager` inserted directly into `#shadowRoot` (as `target`,
    // not through the React-managed `#container`) is not React's to clean
    // up, and a fresh `StyleSheetManager` on the next connect inserts
    // another one. Left alone this leaks one `<style>` per connect/disconnect
    // cycle for as long as the element lives on the page.
    this.#shadowRoot
      .querySelectorAll("style[data-styled]")
      .forEach((style) => style.remove());
  }

  attributeChangedCallback(name: string): void {
    if (
      ThemeableHTMLElement.themeAttributeNames.includes(
        name as ThemeAttributeName,
      )
    ) {
      this.syncThemeCssVarsToStyle();
    }

    this.#render();
  }

  #resolveLocale(): string {
    const fromAttribute = this.getAttribute(LANG_ATTRIBUTE);
    if (fromAttribute?.trim()) return fromAttribute.trim();
    if (this.lang?.trim()) return this.lang.trim();
    if (document.documentElement.lang?.trim()) {
      return document.documentElement.lang.trim();
    }
    return DEFAULT_LOCALE;
  }

  #resolveMessages(locale: string): Record<string, string> {
    const normalized = locale.trim().replace(/_/g, "-");
    if (MESSAGES_BY_LOCALE[normalized]) return MESSAGES_BY_LOCALE[normalized];

    const baseLocale = normalized.split("-")[0];
    if (baseLocale && MESSAGES_BY_LOCALE[baseLocale]) {
      return MESSAGES_BY_LOCALE[baseLocale];
    }

    return MESSAGES_BY_LOCALE[DEFAULT_LOCALE] ?? {};
  }

  #buildThemeTokens() {
    return {
      letterSpacing: defaultTheme.letterSpacing,
      textTransform: defaultTheme.textTransform,
      font: {
        ...defaultTheme.font,
        body: this.getThemeProperty("themeFontBody") ?? defaultTheme.font.body,
      },
      color: {
        ...defaultTheme.color,
        body:
          this.getThemeProperty("themeColorBody") ?? defaultTheme.color.body,
        error:
          this.getThemeProperty("themeColorError") ?? defaultTheme.color.error,
        primary:
          this.getThemeProperty("themeColorPrimary") ??
          defaultTheme.color.primary,
        secondary:
          this.getThemeProperty("themeColorSecondary") ??
          defaultTheme.color.secondary,
        onPrimary:
          this.getThemeProperty("themeColorOnPrimary") ??
          defaultTheme.color.onPrimary,
      },
      outline: {
        ...defaultTheme.outline,
        primary:
          this.getThemeProperty("themeOutlinePrimary") ??
          defaultTheme.outline.primary,
      },
      background: {
        ...defaultTheme.background,
        surface:
          this.getThemeProperty("themeBackgroundSurface") ??
          defaultTheme.background.surface,
        field:
          this.getThemeProperty("themeBackgroundField") ??
          defaultTheme.background.field,
        disabledField:
          this.getThemeProperty("themeBackgroundDisabledField") ??
          defaultTheme.background.disabledField,
        buttonPrimary:
          this.getThemeProperty("themeBackgroundButtonPrimary") ??
          defaultTheme.background.buttonPrimary,
        error:
          this.getThemeProperty("themeBackgroundError") ??
          defaultTheme.background.error,
        popup:
          this.getThemeProperty("themeBackgroundPopup") ??
          defaultTheme.background.popup,
      },
      border: {
        ...defaultTheme.border,
        field:
          this.getThemeProperty("themeBorderField") ??
          defaultTheme.border.field,
      },
      borderRadius: {
        ...defaultTheme.borderRadius,
        xs:
          this.getThemeProperty("themeBorderRadiusXs") ??
          defaultTheme.borderRadius.xs,
        sm:
          this.getThemeProperty("themeBorderRadiusSm") ??
          defaultTheme.borderRadius.sm,
        md:
          this.getThemeProperty("themeBorderRadiusMd") ??
          defaultTheme.borderRadius.md,
        pill:
          this.getThemeProperty("themeBorderRadiusPill") ??
          defaultTheme.borderRadius.pill,
      },
      space: {
        ...defaultTheme.space,
        md: this.getThemeProperty("themeSpaceMd") ?? defaultTheme.space.md,
      },
      size: {
        ...defaultTheme.size,
        control:
          this.getThemeProperty("themeSizeControl") ??
          defaultTheme.size.control,
        borderWidth:
          this.getThemeProperty("themeSizeBorderWidth") ??
          defaultTheme.size.borderWidth,
      },
      easing: defaultTheme.easing,
      duration: defaultTheme.duration,
      zIndex: defaultTheme.zIndex,
    };
  }

  #render(): void {
    const locale = this.#resolveLocale();

    this.#root?.render(
      <StyleSheetManager target={this.#shadowRoot}>
        <ThemeProvider theme={{ tokens: this.#buildThemeTokens() }}>
          <IntlProvider
            locale={locale}
            defaultLocale={DEFAULT_LOCALE}
            messages={this.#resolveMessages(locale)}
          >
            <SideCartTriggerView
              itemCount={sideCart.itemCount}
              announcedCount={this.#announcedCount}
              onClick={() => sideCart.show()}
            />
          </IntlProvider>
        </ThemeProvider>
      </StyleSheetManager>,
    );
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
