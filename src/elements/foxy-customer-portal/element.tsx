import { createRoot, type Root } from "react-dom/client";
import { IntlProvider } from "react-intl";
import { StyleSheetManager, ThemeProvider } from "styled-components";
import { defaultTheme } from "@foxy.io/design-system/theme";
import { API } from "@foxy.io/sdk/customer";

import enUsMessages from "@/locales/en-US.json";
import {
  RequestCache,
  createScopedStorage,
  resolveBaseUrl,
} from "@/lib/customer-api";
import { ThemeMixin } from "@/lib/theme-mixin";

import { PortalContainerContext } from "./portal-container";
import { MissingStoreDomain, Portal } from "./view";

export const CUSTOMER_PORTAL_ELEMENT_TAG = "foxy-customer-portal";

const STORE_DOMAIN_ATTRIBUTE = "store-domain";
const TEMPLATE_SET_ID_ATTRIBUTE = "template-set-id";
const FULL_NAME_TEMPLATE_ATTRIBUTE = "full-name-template";
const SKIP_PASSWORD_RESET_ATTRIBUTE = "skip-password-reset";
const LANG_ATTRIBUTE = "lang";

const DEFAULT_FULL_NAME_TEMPLATE = "{first_name} {last_name}";
const DEFAULT_LOCALE = "en-US";

/**
 * Consola numbering: errors and warnings only.
 *
 * The SDK's default is Info, at which `_resolve()` writes every resolved hAPI
 * URL to the console. Some of those URLs carry credentials — `fx:sub_token_url`
 * embeds a cart-access token — and a customer portal runs on a page the store's
 * customers can open a console on.
 */
const LOG_LEVEL = 1;

const MESSAGES_BY_LOCALE: Record<string, Record<string, string>> = {
  "en-US": enUsMessages as Record<string, string>,
  en: enUsMessages as Record<string, string>,
};

export function toBcp47Locale(value: string): string {
  return value.replace(/_/g, "-");
}

const ThemeableHTMLElement = ThemeMixin(HTMLElement);

export class CustomerPortalElement extends ThemeableHTMLElement {
  #shadowRootRef: ShadowRoot;
  #container: HTMLDivElement;
  #root: Root | null = null;
  #api: API | null = null;
  #apiBase: string | null = null;
  #cache = new RequestCache();

  static get observedAttributes(): string[] {
    return [
      STORE_DOMAIN_ATTRIBUTE,
      TEMPLATE_SET_ID_ATTRIBUTE,
      FULL_NAME_TEMPLATE_ATTRIBUTE,
      SKIP_PASSWORD_RESET_ATTRIBUTE,
      LANG_ATTRIBUTE,
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

  get fullNameTemplate(): string {
    return (
      this.getAttribute(FULL_NAME_TEMPLATE_ATTRIBUTE) ??
      DEFAULT_FULL_NAME_TEMPLATE
    );
  }

  set fullNameTemplate(value: string) {
    this.setAttribute(FULL_NAME_TEMPLATE_ATTRIBUTE, value);
  }

  get skipPasswordReset(): boolean {
    return this.hasAttribute(SKIP_PASSWORD_RESET_ATTRIBUTE);
  }

  set skipPasswordReset(value: boolean) {
    if (value) this.setAttribute(SKIP_PASSWORD_RESET_ATTRIBUTE, "");
    else this.removeAttribute(SKIP_PASSWORD_RESET_ATTRIBUTE);
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
  }

  attributeChangedCallback(name: string) {
    // A new store means a new API instance, a new session scope and a stale cache.
    if (name === STORE_DOMAIN_ATTRIBUTE) {
      this.#api = null;
      this.#apiBase = null;
      this.#cache.clear();
    }

    this.#render();
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

  #render() {
    if (!this.#root) return;

    const locale = toBcp47Locale(this.lang || DEFAULT_LOCALE);
    const messages =
      MESSAGES_BY_LOCALE[locale] ?? MESSAGES_BY_LOCALE[DEFAULT_LOCALE];
    const api = this.#resolveApi();

    this.#root.render(
      <StyleSheetManager target={this.#shadowRootRef}>
        <ThemeProvider theme={{ tokens: defaultTheme }}>
          {/* Dialogs portal into this container, not <body>, so they stay
              inside the shadow root where our styles live. */}
          <PortalContainerContext value={this.#container}>
            <IntlProvider
              locale={locale}
              defaultLocale={DEFAULT_LOCALE}
              messages={messages}
            >
              {api ? (
                <Portal
                  api={api}
                  cache={this.#cache}
                  fullNameTemplate={this.fullNameTemplate}
                  skipPasswordReset={this.skipPasswordReset}
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
