import { createRoot, type Root } from "react-dom/client";
import { IntlProvider } from "react-intl";
import { StyleSheetManager, ThemeProvider } from "styled-components";
import { defaultTheme } from "@foxy.io/design-system/theme";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { API } from "@foxy.io/sdk/customer";

import {
  RequestCache,
  createScopedStorage,
  resolveBaseUrl,
} from "@/lib/customer-api";
import { ThemeMixin } from "@/lib/theme-mixin";

import { PortalContainerContext } from "./portal-container";
import {
  DEFAULT_LOCALE,
  resolveLanguageStrings,
  type ResolvedLanguageStrings,
} from "./language-strings";
import type { PortalVariant } from "./types";
import { MissingStoreDomain, Portal } from "./view";

export const CUSTOMER_PORTAL_ELEMENT_TAG = "foxy-customer-portal";

const STORE_DOMAIN_ATTRIBUTE = "store-domain";
const TEMPLATE_SET_ID_ATTRIBUTE = "template-set-id";
const SKIP_PASSWORD_RESET_ATTRIBUTE = "skip-password-reset";
const URL_SYNC_ATTRIBUTE = "url-sync";
const VARIANT_ATTRIBUTE = "variant";

/**
 * The layout every existing embed already has. An unset attribute -- and an
 * unrecognised one, which is a typo in a host page's markup -- resolves here
 * rather than blanking out a section.
 */
const DEFAULT_VARIANT: PortalVariant = "subscriptions";

/**
 * Consola numbering: errors and warnings only.
 *
 * The SDK's default is Info, at which `_resolve()` writes every resolved hAPI
 * URL to the console. Some of those URLs carry credentials — `fx:sub_token_url`
 * embeds a cart-access token — and a customer portal runs on a page the store's
 * customers can open a console on.
 */
const LOG_LEVEL = 1;

const ThemeableHTMLElement = ThemeMixin(HTMLElement);

export class CustomerPortalElement extends ThemeableHTMLElement {
  #shadowRootRef: ShadowRoot;
  #container: HTMLDivElement;
  #root: Root | null = null;
  #api: API | null = null;
  #apiBase: string | null = null;
  #cache = new RequestCache();
  #renderScheduled = false;
  #languageStrings: ResolvedLanguageStrings | null = null;
  #languageStringsKey: string | null = null;

  static get observedAttributes(): string[] {
    return [
      STORE_DOMAIN_ATTRIBUTE,
      TEMPLATE_SET_ID_ATTRIBUTE,
      SKIP_PASSWORD_RESET_ATTRIBUTE,
      URL_SYNC_ATTRIBUTE,
      VARIANT_ATTRIBUTE,
      ...ThemeableHTMLElement.themeAttributeNames,
    ];
  }

  constructor() {
    super();
    this.#shadowRootRef = this.attachShadow({ mode: "open" });
    this.#container = document.createElement("div");
    this.#shadowRootRef.append(this.#container);
  }

  get storeDomain(): string | null {
    return this.getAttribute(STORE_DOMAIN_ATTRIBUTE);
  }

  set storeDomain(value: string | null) {
    if (value === null) this.removeAttribute(STORE_DOMAIN_ATTRIBUTE);
    else this.setAttribute(STORE_DOMAIN_ATTRIBUTE, value);
  }

  get templateSetId(): string | null {
    return this.getAttribute(TEMPLATE_SET_ID_ATTRIBUTE);
  }

  set templateSetId(value: string | null) {
    if (value === null) this.removeAttribute(TEMPLATE_SET_ID_ATTRIBUTE);
    else this.setAttribute(TEMPLATE_SET_ID_ATTRIBUTE, value);
  }

  get skipPasswordReset(): boolean {
    return this.hasAttribute(SKIP_PASSWORD_RESET_ATTRIBUTE);
  }

  set skipPasswordReset(value: boolean) {
    if (value) this.setAttribute(SKIP_PASSWORD_RESET_ATTRIBUTE, "");
    else this.removeAttribute(SKIP_PASSWORD_RESET_ATTRIBUTE);
  }

  get urlSync(): boolean {
    return this.hasAttribute(URL_SYNC_ATTRIBUTE);
  }

  set urlSync(value: boolean) {
    if (value) this.setAttribute(URL_SYNC_ATTRIBUTE, "");
    else this.removeAttribute(URL_SYNC_ATTRIBUTE);
  }

  /**
   * Which selling shape the portal is laid out for -- see `PortalVariant`.
   * Reads back as the resolved value, so a host that never set the attribute
   * (or set one the element does not know) is told what it actually got.
   */
  get variant(): PortalVariant {
    return this.getAttribute(VARIANT_ATTRIBUTE) === "orders"
      ? "orders"
      : DEFAULT_VARIANT;
  }

  set variant(value: PortalVariant | null) {
    if (value === null) this.removeAttribute(VARIANT_ATTRIBUTE);
    else this.setAttribute(VARIANT_ATTRIBUTE, value);
  }

  connectedCallback() {
    if (!this.#root) this.#root = createRoot(this.#container);
    this.#render();
  }

  disconnectedCallback() {
    this.#root?.unmount();
    this.#root = null;
    this.#api = null;
    this.#apiBase = null;
    this.#cache.clear();
    this.#languageStrings = null;
    this.#languageStringsKey = null;
  }

  attributeChangedCallback(name: string) {
    // A new store means a new API instance, a new session scope and a stale cache.
    if (name === STORE_DOMAIN_ATTRIBUTE) {
      this.#api = null;
      this.#apiBase = null;
      this.#cache.clear();
    }

    this.#scheduleRender();
  }

  /**
   * A caller that sets several `theme-*` attributes in a row -- exactly
   * what applying a whole theme preset means, one attribute per token --
   * fires `attributeChangedCallback` once per attribute, synchronously, in
   * a tight loop. Calling `this.#root.render(...)` that many times in one
   * synchronous burst is calling a React 18 concurrent root far more often
   * than it's meant to be: root.render() is a top-level "reconcile this
   * tree" call, not a batched state update, and this many of them back to
   * back left the DS component tree rendered from an intermediate, no
   * longer current set of tokens -- reproduced concretely by clearing every
   * `theme-*` attribute at once (the Storybook demo's "Default" theme):
   * every attribute read back as unset immediately afterward, but the
   * previously-themed colors stayed on screen until something wholly
   * unrelated (e.g. a `lang` change) triggered one more render. Scheduling
   * through a microtask coalesces every attribute change from the same
   * synchronous burst into the single `#render()` call that runs after it,
   * by which point every attribute in the burst has already been applied --
   * so that one render reads the fully-settled final state, the same way a
   * `root.render()` called once per meaningful update always should.
   */
  #scheduleRender() {
    if (this.#renderScheduled) return;
    this.#renderScheduled = true;

    queueMicrotask(() => {
      this.#renderScheduled = false;
      this.#render();
    });
  }

  /**
   * Builds the API lazily and reuses it while `store-domain` is unchanged.
   * Session storage is scoped by base URL — never raw `localStorage`, or two
   * stores on one origin share a session slot — and `createScopedStorage`
   * keeps a browser that blocks storage from throwing out of `#render`.
   */
  #resolveApi(): API | null {
    const storeDomain = this.storeDomain;
    if (!storeDomain?.trim()) return null;

    let base: URL;
    try {
      base = resolveBaseUrl(storeDomain);
    } catch {
      return null;
    }

    if (this.#api && this.#apiBase === base.toString()) return this.#api;

    this.#apiBase = base.toString();
    this.#api = new API({
      base,
      level: LOG_LEVEL,
      storage: createScopedStorage(base.toString()),
    });

    return this.#api;
  }

  /**
   * Starts one language-strings request per (base, template set) pair and
   * re-renders when it settles. `resolveLanguageStrings` never rejects, so
   * there is no failure branch here -- a dead endpoint resolves to English.
   *
   * The key guard does double duty: it stops `#render` re-fetching on every
   * pass, and it drops a response whose store or template set the host has
   * since changed away from.
   */
  #ensureLanguageStrings(base: URL): void {
    const key = `${base.toString()}|${this.templateSetId ?? ""}`;
    if (this.#languageStringsKey === key) return;

    this.#languageStringsKey = key;
    this.#languageStrings = null;

    void resolveLanguageStrings({
      base,
      templateSetId: this.templateSetId,
    }).then((resolved) => {
      if (this.#languageStringsKey !== key) return;
      this.#languageStrings = resolved;
      this.#scheduleRender();
    });
  }

  /**
   * Overrides `defaultTheme`'s leaves with whatever `theme-*` attribute or
   * `--`-prefixed CSS custom property the host page set (see
   * `ThemeMixin`/`getThemeProperty`), falling back to the default for
   * anything unset. Same shape as `foxy-payment-method-selector`'s
   * `#buildThemeTokens` — this element observes the same
   * `themeAttributeNames` in `observedAttributes` above, so it needs to
   * actually read them, not just re-render when they change.
   */
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
        faint:
          this.getThemeProperty("themeColorFaint") ?? defaultTheme.color.faint,
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
        page:
          this.getThemeProperty("themeBackgroundPage") ??
          defaultTheme.background.page,
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
        default:
          this.getThemeProperty("themeBorderDefault") ??
          defaultTheme.border.default,
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

  #render() {
    if (!this.#root) return;

    const api = this.#resolveApi();
    if (api) this.#ensureLanguageStrings(api.base);

    // Strings gate the first paint, so a store whose request is still in
    // flight renders a skeleton rather than English that would swap language
    // under the customer a moment later. `MissingStoreDomain` has no base to
    // fetch from and renders straight away on `defaultMessage` English.
    const strings = this.#languageStrings;
    const isAwaitingStrings = api !== null && strings === null;
    const locale = strings?.locale ?? DEFAULT_LOCALE;
    const messages = strings?.messages ?? {};
    const tokens = this.#buildThemeTokens();

    // The DS's own styled components (`Button`, `Item`, `Field`, ...) all
    // read color/font from `theme.tokens`, but the portal's screens use
    // plain semantic HTML for structure -- `<h1>`, `<h2>`, `<p>` in
    // `header.tsx`, `view.tsx`'s screens, etc. -- which the browser renders
    // in its default black with no color rule of its own. That was
    // indistinguishable from `defaultTheme.color.body` (`#1C1A1D`,
    // near-black) until a theme set `color.body` to something light: every
    // heading/paragraph stayed black, invisible against a dark
    // `background.surface`. `#container` -- not a React-rendered wrapper --
    // is the fix's anchor: `PortalContainerContext` below portals dialogs
    // into this same node (see its own comment), so it is the one real DOM
    // ancestor common to both the main tree and anything Base UI portals
    // into it; a React-rendered `<div>` inside `ThemeProvider` would sit as
    // a *sibling* of portaled dialog content, not an ancestor, and wouldn't
    // reach it.
    this.#container.style.color = tokens.color.body;
    this.#container.style.font = tokens.font.body;

    // The language of the text actually rendered, which the server chose via
    // the template set -- not the host's `lang`, which this element no longer
    // reads. Set on `#container` for the same reason the two lines above are:
    // it is the one real DOM ancestor shared by the main tree and anything
    // Base UI portals into it.
    this.#container.lang = locale;

    this.#root.render(
      <StyleSheetManager target={this.#shadowRootRef}>
        <ThemeProvider theme={{ tokens }}>
          {/* Dialogs portal into this container, not <body>, so they stay
              inside the shadow root where our styles live. */}
          <PortalContainerContext value={this.#container}>
            <IntlProvider
              locale={locale}
              defaultLocale={DEFAULT_LOCALE}
              messages={messages}
            >
              {isAwaitingStrings ? (
                <Skeleton style={{ height: "12rem", width: "100%" }} />
              ) : api ? (
                <Portal
                  api={api}
                  cache={this.#cache}
                  skipPasswordReset={this.skipPasswordReset}
                  urlSync={this.urlSync}
                  variant={this.variant}
                  onEvent={(type, detail) =>
                    this.dispatchEvent(
                      new CustomEvent(type, {
                        detail,
                        bubbles: true,
                        composed: true,
                      }),
                    )
                  }
                />
              ) : (
                <MissingStoreDomain />
              )}
            </IntlProvider>
          </PortalContainerContext>
        </ThemeProvider>
      </StyleSheetManager>,
    );
  }
}

if (!customElements.get(CUSTOMER_PORTAL_ELEMENT_TAG)) {
  customElements.define(CUSTOMER_PORTAL_ELEMENT_TAG, CustomerPortalElement);
}
