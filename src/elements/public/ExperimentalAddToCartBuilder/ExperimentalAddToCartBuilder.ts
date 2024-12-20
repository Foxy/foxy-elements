import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { InternalSummaryControl } from '../../internal/InternalSummaryControl/InternalSummaryControl';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { decode, encode } from 'html-entities';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { previewCSS } from './preview.css';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { html, svg } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';

import debounce from 'lodash-es/debounce';
import hljsxml from 'highlight.js/lib/languages/xml.js';
import hljs from 'highlight.js/lib/core.js';

const NS = 'experimental-add-to-cart-builder';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));
hljs.registerLanguage('xml', hljsxml);

/**
 * WARNING: this element is marked as experimental and is subject to change in future releases.
 * We will not be maintaining backwards compatibility for elements in the experimental namespace.
 * If you are using this element, please make sure to use a fixed version of the package in your `package.json`.
 *
 * This element allows you to create an add-to-cart form and link for your store.
 *
 * @element foxy-experimental-add-to-cart-builder
 */
export class ExperimentalAddToCartBuilder extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      defaultDomain: { attribute: 'default-domain' },
      encodeHelper: { attribute: 'encode-helper' },
      localeCodes: { attribute: 'locale-codes' },
      store: {},
      __previousUnsignedCode: { attribute: false },
      __previousSignedCode: { attribute: false },
      __signingState: { attribute: false },
      __openState: { attribute: false },
    };
  }

  /** Default host domain for stores that don't use a custom domain name, e.g. `foxycart.com`. */
  defaultDomain: string | null = null;

  /** URL of the HMAC encoder endpoint. */
  encodeHelper: string | null = null;

  /** URL of the `fx:locale_codes` property helper. This will be used to determine the currency code. */
  localeCodes: string | null = null;

  /** URL of the store this add-to-cart code is created for. */
  store: string | null = null;

  private readonly __signingSeparator = `--${Date.now()}${(Math.random() * 100000).toFixed(0)}--`;

  private readonly __emptyOptions = [
    { label: 'option_false', value: 'false' },
    { label: 'option_true', value: 'true' },
    { label: 'option_reset', value: 'reset' },
  ];

  private readonly __cartOptions = [
    { label: 'option_add', value: 'add' },
    { label: 'option_checkout', value: 'checkout' },
    { label: 'option_redirect', value: 'redirect' },
  ];

  private readonly __signAsync = debounce(async (html: string, encodeHelper: string) => {
    if (html === this.__previousUnsignedCode && this.__previousSignedCode) return;

    const isCancelled = () => html !== this.__previousUnsignedCode;
    this.__signingState = 'busy';

    try {
      const res = await new ExperimentalAddToCartBuilder.API(this).fetch(encodeHelper, {
        headers: { 'Content-Type': 'text/plain' },
        method: 'POST',
        body: html,
      });

      if (!isCancelled()) {
        if (res.ok) {
          const result = (await res.json()).result as string;
          if (!isCancelled()) {
            this.__signingState = 'idle';
            this.__previousSignedCode = result.replace(/value="--OPEN--" data-replace/gi, 'value');
          }
        } else {
          this.__signingState = 'fail';
        }
      }
    } catch {
      if (!isCancelled()) this.__signingState = 'fail';
    }
  }, 500);

  private __previousUnsignedCode = '';

  private __previousSignedCode = '';

  private __signingState: 'idle' | 'busy' | 'fail' = 'idle';

  private __openState: boolean[] = [];

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];
    alwaysMatch.unshift('header:copy-id', 'header:copy-json', 'undo');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    const addToCartCode = this.__getAddToCartCode();
    const storeUrl = this.data?._links['fx:store'].href ?? this.store ?? void 0;
    const store = this.__storeLoader?.data;

    return html`
      <div class="grid gap-m items-start sm-grid-cols-2 md-grid-cols-3 h-full overflow-auto">
        <foxy-internal-summary-control layout="section" class="space-y-s" infer="items">
          ${this.form.items?.map((product, index) => {
            return html`
              <foxy-internal-summary-control
                layout="details"
                label=${ifDefined(product.name.trim() || void 0)}
                infer="item-group"
                ?open=${ifDefined(this.__openState[index])}
                @toggle=${(evt: CustomEvent) => {
                  const details = evt.currentTarget as InternalSummaryControl;
                  this.__openState[index] = details.open;
                  this.__openState = [...this.__openState];
                }}
              >
                <foxy-internal-experimental-add-to-cart-builder-item-control
                  item-categories=${ifDefined(store?._links['fx:item_categories'].href)}
                  currency-code=${ifDefined(this.__resolvedCurrencyCode ?? void 0)}
                  store=${ifDefined(storeUrl)}
                  index=${index}
                  infer="item"
                  .defaultItemCategory=${this.__defaultItemCategory}
                  @remove=${() => {
                    const newProducts = this.form.items?.filter((_, i) => i !== index);
                    this.edit({ items: newProducts });
                    this.__openState = this.__openState.filter((_, i) => i !== index);
                  }}
                >
                </foxy-internal-experimental-add-to-cart-builder-item-control>
              </foxy-internal-summary-control>
            `;
          })}

          <vaadin-button
            class="w-full"
            theme="success"
            ?disabled=${this.disabled}
            @click=${() => {
              const newItem = { name: '', price: 0, custom_options: [], sub_frequency: '1m' };
              const existingItems = this.form.items ?? [];
              this.edit({ items: [...existingItems, newItem] });
              this.__openState = [...new Array(existingItems.length).fill(false), true];
            }}
          >
            <foxy-i18n infer="add-product" key="caption"></foxy-i18n>
          </vaadin-button>
        </foxy-internal-summary-control>

        <div class="space-y-m md-col-span-2 sticky top-0">
          ${addToCartCode
            ? html`
                <foxy-internal-summary-control infer="preview">
                  <div class="flex">
                    <iframe
                      srcdoc="${previewCSS}${addToCartCode.formHTML}"
                      style="margin: calc(-1 * (0.625em + (var(--lumo-border-radius) / 4) - 1px))"
                      class=${classMap({
                        'flex-1 transition-all filter': true,
                        'blur-sm': this.__signingState !== 'idle',
                      })}
                      @load=${(evt: Event) => {
                        const iframe = evt.currentTarget as HTMLIFrameElement;
                        const root = iframe.contentWindow?.document.documentElement;
                        if (root) iframe.style.height = root.scrollHeight + 'px';
                      }}
                    >
                    </iframe>
                  </div>

                  <div
                    class="flex leading-s text-s min-w-0 relative"
                    style="gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
                  >
                    <div
                      style="font-family: monospace; max-height: calc(8 * (1em * var(--lumo-line-height-s)))"
                      class=${classMap({
                        'break-all overflow-auto flex-1 min-w-0 transition-all filter': true,
                        'blur-sm': this.__signingState !== 'idle',
                      })}
                    >
                      <code class="whitespace-pre"
                        >${unsafeHTML(
                          hljs.highlight(addToCartCode.formHTML, { language: 'xml' }).value
                        )}</code
                      >
                    </div>

                    <div
                      style="top: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px); right: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
                      class=${classMap({
                        'absolute right-0 bg-base rounded-s transition-opacity': true,
                        'opacity-0 pointer-events-none': this.__signingState !== 'busy',
                      })}
                    >
                      <div class="bg-contrast-10 rounded-s">
                        <foxy-spinner infer="spinner" class="-mx-xs" style="transform: scale(0.8)">
                        </foxy-spinner>
                      </div>
                    </div>

                    <foxy-copy-to-clipboard
                      infer="copy-to-clipboard"
                      text=${addToCartCode.formHTML}
                      class=${classMap({
                        'flex-shrink-0 text-m transition-opacity': true,
                        'opacity-0 pointer-events-none': this.__signingState === 'busy',
                      })}
                    >
                    </foxy-copy-to-clipboard>
                  </div>

                  <div
                    class="flex items-start text-xs leading-xs text-secondary"
                    style="gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
                  >
                    ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="flex-shrink-0 text-contrast-70" style="width: 1.25em"><path fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clip-rule="evenodd" /></svg>`}
                    <p>
                      <foxy-i18n infer="" key="edits_tip"></foxy-i18n>
                      <a
                        target="_blank"
                        class="rounded font-medium underline transition-colors cursor-pointer hover-opacity-80 focus-outline-none focus-ring-2 focus-ring-primary-50"
                        href="https://wiki.foxycart.com/v/2.0/products"
                      >
                        <foxy-i18n infer="" key="edits_docs"></foxy-i18n>
                      </a>
                    </p>
                  </div>
                </foxy-internal-summary-control>

                <foxy-internal-summary-control infer="link">
                  ${addToCartCode.linkHref
                    ? html`
                        <div
                          class="flex items-center leading-s min-w-0 relative"
                          style="gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
                        >
                          <foxy-i18n infer="" key="direct_link"></foxy-i18n>
                          <a
                            target="_blank"
                            style="max-width: 30rem"
                            href=${addToCartCode.linkHref}
                            class=${classMap({
                              'font-medium truncate ml-auto min-w-0 rounded-s': true,
                              'transition-all filter': true,
                              'hover-underline': true,
                              'focus-outline-none focus-ring-2 focus-ring-primary-50': true,
                              'blur-sm': this.__signingState !== 'idle',
                            })}
                          >
                            ${addToCartCode.linkHref}
                          </a>
                          <div
                            style="top: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px); right: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
                            class=${classMap({
                              'absolute right-0 bg-base rounded-s transition-opacity': true,
                              'opacity-0 pointer-events-none': this.__signingState !== 'busy',
                            })}
                          >
                            <div class="bg-contrast-10 rounded-s">
                              <foxy-spinner
                                infer="spinner"
                                state=${this.__signingState === 'fail' ? 'error' : 'busy'}
                                class="-mx-xs"
                                style="transform: scale(0.8)"
                              >
                              </foxy-spinner>
                            </div>
                          </div>
                          <foxy-copy-to-clipboard
                            infer="copy-to-clipboard"
                            text=${addToCartCode.linkHref}
                            class=${classMap({
                              'flex-shrink-0 text-m transition-opacity': true,
                              'opacity-0 pointer-events-none': this.__signingState === 'busy',
                            })}
                          >
                          </foxy-copy-to-clipboard>
                        </div>
                      `
                    : html`
                        <p class="text-disabled">
                          <foxy-i18n infer="" key="unavailable"></foxy-i18n>
                        </p>
                      `}
                </foxy-internal-summary-control>
              `
            : html`
                <foxy-internal-summary-control infer="preview">
                  <div class="flex items-center justify-center p-xl">
                    <foxy-spinner infer="unavailable"></foxy-spinner>
                  </div>
                </foxy-internal-summary-control>
              `}

          <foxy-internal-summary-control infer="cart-settings">
            <foxy-internal-resource-picker-control
              layout="summary-item"
              first=${ifDefined(this.__storeLoader?.data?._links['fx:template_sets'].href)}
              infer="template-set-uri"
              item="foxy-template-set-card"
            >
            </foxy-internal-resource-picker-control>

            <foxy-internal-select-control
              layout="summary-item"
              infer="empty"
              .options=${this.__emptyOptions}
            >
            </foxy-internal-select-control>

            <foxy-internal-select-control
              layout="summary-item"
              infer="cart"
              .options=${this.__cartOptions}
            >
            </foxy-internal-select-control>

            ${this.form.cart === 'redirect'
              ? html`
                  <foxy-internal-text-control layout="summary-item" infer="redirect">
                  </foxy-internal-text-control>
                `
              : ''}

            <foxy-internal-text-control layout="summary-item" infer="coupon">
            </foxy-internal-text-control>
          </foxy-internal-summary-control>
        </div>
      </div>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__defaultTemplateSetHref)}
        id="defaultTemplateSetLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__defaultItemCategoryHref)}
        id="defaultItemCategoryLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.localeCodes ?? void 0)}
        id="localeCodesHelperLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.form.template_set_uri ?? void 0)}
        id="templateSetLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.data?._links['fx:store'].href ?? this.store ?? void 0)}
        id="storeLoaderId"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      ${this.form.items?.map((product, index) => {
        return html`
          <foxy-nucleon
            class="hidden"
            infer=""
            href=${ifDefined(product.item_category_uri ?? void 0)}
            id="itemCategoryLoaderProduct${index}"
            @update=${() => this.requestUpdate()}
          >
          </foxy-nucleon>

          ${product.custom_options.map((option, i) => {
            return html`
              <foxy-nucleon
                class="hidden"
                infer=""
                href=${ifDefined(option.item_category_uri ?? void 0)}
                id="itemCategoryLoaderProduct${index}Option${i}"
                @update=${() => this.requestUpdate()}
              >
              </foxy-nucleon>
            `;
          })}
        `;
      })}
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);

    if (this.in('idle') && !this.form.items?.length) {
      this.edit({ items: [{ name: '', price: 0, sub_frequency: '1m', custom_options: [] }] });
      this.__openState = [true];
    }

    if (this.form.items?.length && !this.__openState.length) {
      this.__openState = [true, ...new Array(this.form.items.length - 1).fill(false)];
    }
  }

  submit(): void {
    // Do nothing – this form is not meant to be submitted.
  }

  private get __defaultTemplateSetHref() {
    try {
      const url = new URL(this.__storeLoader?.data?._links['fx:template_sets'].href ?? '');
      url.searchParams.set('code', 'DEFAULT');
      return url.toString();
    } catch {
      return undefined;
    }
  }

  private get __defaultItemCategoryHref() {
    try {
      const url = new URL(this.__storeLoader?.data?._links['fx:item_categories'].href ?? '');
      url.searchParams.set('code', 'DEFAULT');
      return url.toString();
    } catch {
      return undefined;
    }
  }

  private get __resolvedCurrencyCode() {
    type Loader = NucleonElement<Resource<Rels.LocaleCodes>>;

    const localeCodesLoader = this.renderRoot.querySelector<Loader>('#localeCodesHelperLoader');
    const currentLocale = this.__resolvedTemplateSet?.locale_code;
    const allLocales = localeCodesLoader?.data?.values;
    const localeInfo = currentLocale ? allLocales?.[currentLocale] : void 0;

    return localeInfo ? /Currency: ([A-Z]{3})/g.exec(localeInfo)?.[1]?.toUpperCase() : void 0;
  }

  private get __resolvedTemplateSet() {
    type TemplateSetsLoader = NucleonElement<Resource<Rels.TemplateSets>>;
    type TemplateSetLoader = NucleonElement<Resource<Rels.TemplateSet>>;
    const $ = <T extends Element>(s: string) => this.renderRoot.querySelector<T>(s);

    return (
      $<TemplateSetLoader>('#templateSetLoader')?.data ??
      $<TemplateSetsLoader>('#defaultTemplateSetLoader')?.data?._embedded['fx:template_sets'][0]
    );
  }

  private get __defaultItemCategory() {
    type Loader = NucleonElement<Resource<Rels.ItemCategories>>;
    return this.renderRoot.querySelector<Loader>('#defaultItemCategoryLoader')?.data?._embedded[
      'fx:item_categories'
    ][0];
  }

  private get __resolvedCartUrl() {
    const store = this.__storeLoader?.data;

    if (store) {
      if (store.use_remote_domain) {
        return `https://${store.store_domain}/cart`;
      } else if (this.defaultDomain !== null) {
        return `https://${store.store_domain}.${this.defaultDomain}/cart`;
      }
    }

    return null;
  }

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>('#storeLoaderId');
  }

  private __getItemCategoryLoader(productIndex: number, optionIndex?: number) {
    type Loader = NucleonElement<Resource<Rels.ItemCategory>>;
    const prefix = `#itemCategoryLoaderProduct${productIndex}`;
    const selector = typeof optionIndex === 'number' ? `${prefix}Option${optionIndex}` : prefix;
    return this.renderRoot.querySelector<Loader>(selector);
  }

  private __getAddToCartFormHTML() {
    const currencyCode = this.__resolvedCurrencyCode;
    const templateSet = this.__resolvedTemplateSet;
    const cartUrl = this.__resolvedCartUrl;
    const store = this.__storeLoader?.data;

    if (!this.defaultDomain || !templateSet || !store || !currencyCode || !cartUrl) return '';

    let hasAtLeastOneFieldset = false;
    let output = `<form action="${encode(cartUrl)}" method="post" target="_blank">`;
    let level = 1;

    const newline = () => `\n${' '.repeat(level * 2)}`;
    const addHiddenInput = (name: string, value: string) => {
      const encodedValue = encode(value);
      const encodedName = encode(name);
      output += `${newline()}<input type="hidden" name="${encodedName}" value="${encodedValue}">`;
    };

    if (templateSet.code !== 'DEFAULT') addHiddenInput('template_set', templateSet.code);
    if (this.form.empty && this.form.empty !== 'false') addHiddenInput('empty', this.form.empty);
    if (this.form.cart === 'checkout') addHiddenInput('cart', 'checkout');
    if (this.form.redirect) addHiddenInput('redirect', this.form.redirect);
    if (this.form.coupon) addHiddenInput('coupon', this.form.coupon);

    const items = this.form.items ?? [];
    const hasMoreThanOneProduct = items.length > 1;

    for (let productIndex = 0; productIndex < items.length; ++productIndex) {
      const itemCategoryLoader = this.__getItemCategoryLoader(productIndex);
      const itemCategory = itemCategoryLoader?.data;
      const product = items[productIndex];

      if (product.item_category_uri && !itemCategory) return '';

      const resolvedMinQty = Math.max(1, product.quantity_min ?? 1);
      const resolvedMaxQty = Math.max(resolvedMinQty, product.quantity_max ?? Infinity);
      const varyQty =
        resolvedMinQty !== resolvedMaxQty &&
        product.expires_format !== 'minutes' &&
        !product.hide_quantity;

      const varyPrice = product.price_configurable;
      const varyptions = product.custom_options.some(
        (v, i, a) => v.value_configurable || a.findIndex(vv => vv.name === v.name) !== i
      );

      const resolvedName =
        product.name.trim() || this.t('items.item-group.item.basics-group.name.placeholder');

      const needsFieldset =
        hasAtLeastOneFieldset || (hasMoreThanOneProduct && (varyPrice || varyQty || varyptions));

      if (needsFieldset) {
        hasAtLeastOneFieldset = true;
        output += `${newline()}<fieldset>`;
        level++;
        output += `${newline()}<legend>${encode(resolvedName)}</legend>`;
      }

      const prefix = productIndex === 0 ? '' : `${productIndex + 1}:`;
      addHiddenInput(`${prefix}name`, resolvedName);
      const price = `${product.price}${currencyCode}`;

      if (product.price_configurable) {
        const encodedNoCurrencyPrice = encode(product.price.toFixed(2));
        output += `${newline()}<label>`;
        level++;
        output += `${newline()}<span>${encode(this.t('preview.price_label'))}</span>`;

        if (store.use_cart_validation) {
          output += `${newline()}<input required name="${prefix}price" value="--OPEN--" data-replace="${encodedNoCurrencyPrice}">`;
        } else {
          output += `${newline()}<input required name="${prefix}price" value="${encodedNoCurrencyPrice}">`;
        }

        level--;
        output += `${newline()}</label>`;
      } else {
        addHiddenInput(`${prefix}price`, price);
      }

      if (itemCategory && itemCategory.code !== 'DEFAULT') {
        addHiddenInput(`${prefix}category`, itemCategory.code);
      }

      if (product.code) addHiddenInput(`${prefix}code`, product.code);
      if (product.parent_code) addHiddenInput(`${prefix}parent_code`, product.parent_code);

      if (product.image) {
        addHiddenInput(`${prefix}image`, product.image);
        if (product.url) addHiddenInput(`${prefix}url`, product.url);
      }

      if (product.sub_enabled) {
        if (product.sub_frequency) {
          addHiddenInput(`${prefix}sub_frequency`, product.sub_frequency);

          if (product.sub_startdate) {
            if (product.sub_startdate_format === 'yyyymmdd') {
              const date = new Date(product.sub_startdate);
              const year = date.getFullYear();
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const day = date.getDate().toString().padStart(2, '0');
              addHiddenInput(`${prefix}sub_startdate`, `${year}${month}${day}`);
            } else {
              addHiddenInput(`${prefix}sub_startdate`, String(product.sub_startdate));
            }
          }

          if (product.sub_enddate) {
            if (product.sub_enddate_format === 'yyyymmdd') {
              const date = new Date(product.sub_enddate);
              const year = date.getFullYear();
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const day = date.getDate().toString().padStart(2, '0');
              addHiddenInput(`${prefix}sub_enddate`, `${year}${month}${day}`);
            } else {
              addHiddenInput(`${prefix}sub_enddate`, String(product.sub_enddate));
            }
          }
        }
      }

      if (product.discount_name && product.discount_type && product.discount_details) {
        addHiddenInput(
          `${prefix}discount_${product.discount_type}`,
          `${product.discount_name}{${product.discount_details}}`
        );
      }

      if (product.expires_value) {
        if (product.expires_format === 'timestamp') {
          addHiddenInput(`${prefix}expires`, product.expires_value.toFixed(0));
        } else {
          addHiddenInput(`${prefix}expires`, product.expires_value.toFixed(0));
        }
      }

      if (varyQty) {
        output += `${newline()}<label>`;
        level++;
        output += `${newline()}<span>${encode(this.t('preview.quantity_label'))}</span>`;
        output += `${newline()}<input type="number" name="${encode(`${prefix}quantity`)}"`;
        output += ` min="${encode(String(resolvedMinQty))}"`;

        if (resolvedMaxQty !== Infinity) output += ` max="${encode(String(resolvedMaxQty))}"`;
        if (store.use_cart_validation) {
          output += ` value="--OPEN--" data-replace="${encode(String(product.quantity ?? 1))}">`;
        } else {
          output += ` value="${encode(String(product.quantity ?? 1))}">`;
        }

        level--;
        output += `${newline()}</label>`;
      } else if ((product.quantity ?? 1) > 1) {
        addHiddenInput(`${prefix}quantity`, (product.quantity ?? 1).toString());
      }

      if (product.expires_format !== 'minutes') {
        if (resolvedMinQty !== 1) {
          addHiddenInput(`${prefix}quantity_min`, resolvedMinQty.toFixed(0));
        }
        if (resolvedMaxQty !== Infinity) {
          addHiddenInput(`${prefix}quantity_max`, resolvedMaxQty.toFixed(0));
        }
      }

      if (product.length) addHiddenInput(`${prefix}length`, product.length.toFixed(3));
      if (product.width) addHiddenInput(`${prefix}width`, product.width.toFixed(3));
      if (product.height) addHiddenInput(`${prefix}height`, product.height.toFixed(3));
      if (product.weight) addHiddenInput(`${prefix}weight`, product.weight.toFixed(3));

      if (store.features_multiship) {
        output += `${newline()}<label>`;
        level++;
        output += `${newline()}<span>${encode(this.t('preview.shipto_label'))}</span>`;

        if (store.use_cart_validation) {
          output += `${newline()}<input name="${prefix}shipto" value="--OPEN--" data-replace="">`;
        } else {
          output += `${newline()}<input name="${prefix}shipto" value="">`;
        }

        level--;
        output += `${newline()}</label>`;
      }

      const groupedCustomOptions = product.custom_options.reduce((acc, option) => {
        if (!acc[option.name]) acc[option.name] = [];
        acc[option.name].push(option);
        return acc;
      }, {} as Record<string, Required<Data>['items'][number]['custom_options']>);

      for (const optionName in groupedCustomOptions) {
        const group = groupedCustomOptions[optionName];

        if (group.length === 1) {
          const optionIndex = product.custom_options.indexOf(group[0]);
          const itemCategory = this.__getItemCategoryLoader(productIndex, optionIndex)?.data;
          const modifiers = this.__getOptionModifiers(group[0], itemCategory ?? null, currencyCode);
          const value = `${group[0].value}${modifiers}`;
          const name = `${prefix}${optionName}`;

          if (group[0].value_configurable) {
            output += `${newline()}<label>`;
            level++;
            output += `${newline()}<span>${encode(optionName)}:</span>`;
            output += `${newline()}<input name="${encode(name)}" `;

            if (store.use_cart_validation) {
              output += `value="--OPEN--" data-replace="${encode(value)}">`;
            } else {
              output += `value="${encode(value)}">`;
            }

            level--;
            output += `${newline()}</label>`;
          } else {
            addHiddenInput(name, value);
          }
        } else {
          output += `${newline()}<label>`;
          level++;
          output += `${newline()}<span>${encode(optionName)}:</span>`;
          output += `${newline()}<select name="${prefix}${optionName}">`;
          level++;

          group.forEach(option => {
            const optionIndex = product.custom_options.indexOf(option);
            const itemCategory = this.__getItemCategoryLoader(productIndex, optionIndex)?.data;
            const modifiers = this.__getOptionModifiers(option, itemCategory ?? null, currencyCode);
            const encodedValue = encode(`${option.value}${modifiers}`);
            const encodedCaption = encode(option.value);
            output += `${newline()}<option value="${encodedValue}">${encodedCaption}</option>`;
          });

          level--;
          output += `${newline()}</select>`;
          level--;
          output += `${newline()}</label>`;
        }
      }

      if (needsFieldset) {
        level--;
        output += `${newline()}</fieldset>`;
      }
    }

    const submitCaptionSuffix = this.form.cart === 'checkout' ? 'checkout' : 'cart';
    const encodedSubmitCaption = encode(this.t(`preview.submit_caption_${submitCaptionSuffix}`));
    output += `${newline()}<button type="submit">${encodedSubmitCaption}</button>`;
    level--;
    output += `${newline()}</form>`;

    return output;
  }

  private __getAddToCartLinkHref() {
    const currencyCode = this.__resolvedCurrencyCode;
    const templateSet = this.__resolvedTemplateSet;
    const cartUrl = this.__resolvedCartUrl;
    const store = this.__storeLoader?.data;

    if (!this.defaultDomain || !templateSet || !store || !currencyCode || !cartUrl) return '';

    const url = new URL(cartUrl);

    if (templateSet.code !== 'DEFAULT') url.searchParams.set('template_set', templateSet.code);
    if (this.form.cart === 'checkout') url.searchParams.set('cart', 'checkout');
    if (this.form.redirect) url.searchParams.set('redirect', this.form.redirect);
    if (this.form.coupon) url.searchParams.set('coupon', this.form.coupon);
    if (this.form.empty && this.form.empty !== 'false') {
      url.searchParams.set('empty', this.form.empty);
    }

    for (let index = 0; index < (this.form.items?.length ?? 0); ++index) {
      const product = this.form.items![index];
      const prefix = index === 0 ? '' : `${index + 1}:`;
      const itemCategory = this.__getItemCategoryLoader(index)?.data;

      if (product.item_category_uri && !itemCategory) return '';
      if (product.price_configurable) return '';
      if (new Set(product.custom_options.map(v => v.name)).size < product.custom_options.length) {
        return '';
      }

      if (itemCategory && itemCategory.code !== 'DEFAULT') {
        url.searchParams.set(`${prefix}category`, itemCategory.code);
      }

      url.searchParams.set(`${prefix}name`, product.name);
      url.searchParams.set(`${prefix}price`, `${product.price}${currencyCode}`);

      if (product.code) url.searchParams.set(`${prefix}code`, product.code);
      if (product.parent_code) url.searchParams.set(`${prefix}parent_code`, product.parent_code);

      if (product.image) {
        url.searchParams.set(`${prefix}image`, product.image);
        if (product.url) url.searchParams.set(`${prefix}url`, product.url);
      }

      if (product.sub_enabled) {
        if (product.sub_frequency) {
          url.searchParams.set(`${prefix}sub_frequency`, product.sub_frequency);

          if (product.sub_startdate) {
            if (product.sub_startdate_format === 'yyyymmdd') {
              const date = new Date(product.sub_startdate);
              const year = date.getFullYear();
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const day = date.getDate().toString().padStart(2, '0');
              url.searchParams.set(`${prefix}sub_startdate`, `${year}${month}${day}`);
            } else {
              url.searchParams.set(`${prefix}sub_startdate`, String(product.sub_startdate));
            }
          }

          if (product.sub_enddate) {
            if (product.sub_enddate_format === 'yyyymmdd') {
              const date = new Date(product.sub_enddate);
              const year = date.getFullYear();
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const day = date.getDate().toString().padStart(2, '0');
              url.searchParams.set(`${prefix}sub_enddate`, `${year}${month}${day}`);
            } else {
              url.searchParams.set(`${prefix}sub_enddate`, String(product.sub_enddate));
            }
          }
        }
      }

      if (product.discount_name && product.discount_type && product.discount_details) {
        url.searchParams.set(
          `${prefix}discount_${product.discount_type}`,
          `${product.discount_name}{${product.discount_details}}`
        );
      }

      if (product.expires_value) {
        if (product.expires_format === 'timestamp') {
          url.searchParams.set(`${prefix}expires`, product.expires_value.toFixed(0));
        } else {
          url.searchParams.set(`${prefix}expires`, product.expires_value.toFixed(0));
        }
      }

      if ((product.quantity ?? 1) > 1) {
        url.searchParams.set(`${prefix}quantity`, (product.quantity ?? 1).toFixed(0));
      }

      if (product.expires_format !== 'minutes') {
        if (product.quantity_min) {
          url.searchParams.set(`${prefix}quantity_min`, product.quantity_min.toString());
        }
        if (product.quantity_max) {
          url.searchParams.set(`${prefix}quantity_max`, product.quantity_max.toString());
        }
      }

      if (product.weight) url.searchParams.set(`${prefix}weight`, product.weight.toFixed(3));
      if (product.length) url.searchParams.set(`${prefix}length`, product.length.toFixed(3));
      if (product.width) url.searchParams.set(`${prefix}width`, product.width.toFixed(3));
      if (product.height) url.searchParams.set(`${prefix}height`, product.height.toFixed(3));

      for (let optionIndex = 0; optionIndex < product.custom_options.length; ++optionIndex) {
        const option = product.custom_options[optionIndex];
        if (option.value_configurable) return '';

        const itemCategory = this.__getItemCategoryLoader(index, optionIndex)?.data;
        const modifiers = this.__getOptionModifiers(option, itemCategory ?? null, currencyCode);
        url.searchParams.set(`${prefix}${option.name}`, `${option.value ?? ''}${modifiers}`);
      }
    }

    return url.toString();
  }

  private __getAddToCartCode() {
    const store = this.__storeLoader?.data;
    if (!this.encodeHelper || !store) return null;

    const formHTML = this.__getAddToCartFormHTML();
    const linkHref = this.__getAddToCartLinkHref();
    if (!formHTML && !linkHref) return null;

    let unsignedCode: string;

    if (linkHref) {
      const linkHTML = `<a href="${encode(linkHref)}">Add to cart</a>`;
      unsignedCode = `${formHTML}${this.__signingSeparator}${linkHTML}`;
    } else {
      unsignedCode = formHTML;
    }

    if (unsignedCode === this.__previousUnsignedCode && this.__previousSignedCode) {
      const [formHTML, linkHTML] = this.__previousSignedCode.split(this.__signingSeparator);
      return {
        linkHref: linkHTML ? decode(linkHTML.substring(9, linkHTML.length - 17)) : '',
        formHTML,
      };
    }

    this.__previousUnsignedCode = unsignedCode;
    this.__previousSignedCode = '';

    if (store.use_cart_validation) this.__signAsync(unsignedCode, this.encodeHelper);
    return { formHTML, linkHref };
  }

  private __getOptionModifiers(
    option: Required<Data>['items'][number]['custom_options'][number],
    optionItemCategory: Resource<Rels.ItemCategory> | null,
    currencyCode: string
  ) {
    if (option.value_configurable) return '';
    const modifiers = [];

    if (option.price) {
      const operator = option.replace_price ? ':' : Math.sign(option.price) === -1 ? '-' : '+';
      if (option.replace_price || option.price !== 0)
        modifiers.push(`p${operator}${Math.abs(option.price)}${currencyCode}`);
    }

    if (option.weight) {
      const operator = option.replace_weight ? ':' : Math.sign(option.weight) === -1 ? '-' : '+';
      if (option.replace_weight || option.weight !== 0)
        modifiers.push(`w${operator}${Math.abs(option.weight)}`);
    }

    if (option.item_category_uri && !optionItemCategory) return '';
    if (optionItemCategory) modifiers.push(`y:${optionItemCategory.code}`);

    if (option.code) {
      const operator = option.replace_code ? ':' : '+';
      if (option.replace_code || option.code !== '') modifiers.push(`c${operator}${option.code}`);
    }

    return modifiers.length ? `{${modifiers.join('|')}}` : '';
  }
}