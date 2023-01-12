import type { PropertyDeclarations } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'item-card';
const Base = ConfigurableMixin(TranslatableMixin(InternalCard, NS));

/**
 * Basic card displaying an item.
 *
 * @element foxy-item-card
 * @since 1.17.0
 */
export class ItemCard extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      localeCodes: { type: String, attribute: 'locale-codes' },
    };
  }

  localeCodes: string | null = null;

  private static readonly __placeholder =
    'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="40" height="40" fill="%23E8E8E8"/%3E%3Cpath d="M31.5143 0H24.5476L0 24.5476V31.5143L11.7046 19.8097L11.9841 17.0782C12.0983 15.9624 13.0131 15.1154 14.1038 15.1154H15.7373V12.1923C15.7373 10.9815 16.6915 10 17.8687 10H21.5143L31.5143 0Z" fill="white"/%3E%3Cpath d="M11.5434 21.3852L0 32.9285V39.8953L11.5822 28.3131C11.172 27.8663 10.9438 27.2444 11.012 26.5782L11.5434 21.3852Z" fill="white"/%3E%3Cpath d="M12.4305 28.879L1.30951 40H8.27631L19.2763 29H13.1316C12.8853 29 12.6495 28.9573 12.4305 28.879Z" fill="white"/%3E%3Cpath d="M28.3113 19.965L28.0159 17.0782C27.9116 16.0591 27.1395 15.2642 26.1754 15.1341L40 1.3095V8.27627L28.3113 19.965Z" fill="white"/%3E%3Cpath d="M20.6905 29L9.69049 40H16.6572L27.9755 28.6817C27.6541 28.8832 27.2756 29 26.8684 29H20.6905Z" fill="white"/%3E%3Cpath d="M28.6572 28C28.9128 27.5952 29.0415 27.1003 28.988 26.5782L28.4426 21.2479L40 9.69053V16.6572L28.6572 28Z" fill="white"/%3E%3Cpath d="M25.0381 40H18.0715L40 18.0715V25.0381L25.0381 40Z" fill="white"/%3E%3Cpath d="M26.4524 40H33.4191L40 33.4191V26.4524L26.4524 40Z" fill="white"/%3E%3Cpath d="M40 40H34.8333L40 34.8333V40Z" fill="white"/%3E%3Cpath d="M16.1666 0H23.1334L0 23.1334V16.1666L16.1666 0Z" fill="white"/%3E%3Cpath d="M14.7524 0H7.78571L0 7.78573V14.7524L14.7524 0Z" fill="white"/%3E%3Cpath d="M0 0H6.37152L0 6.37151V0Z" fill="white"/%3E%3Cpath d="M21.467 11.4615H17.8687C17.4763 11.4615 17.1582 11.7887 17.1582 12.1923V15.1154H22.8418V12.1923C22.8418 11.7887 22.5237 11.4615 22.1313 11.4615H21.467Z" fill="white"/%3E%3Cpath d="M24.7798 15.1154H24.2627V12.1923C24.2627 11.227 23.6562 10.4075 22.8138 10.1148L32.9286 0H39.89L24.7798 15.1154Z" fill="white"/%3E%3C/svg%3E';

  private readonly __transactionTemplateLoaderId = 'transactionTemplateLoader';

  private readonly __defaultTemplateSetLoaderId = 'defaultTemplateSetLoader';

  private readonly __localeCodesHelperLoaderId = 'localeCodesLoader';

  private readonly __transactionLoaderId = 'transactionLoader';

  private readonly __templateSetLoaderId = 'templateSetLoader';

  private readonly __storeLoaderId = 'storeLoader';

  private readonly __cartLoaderId = 'cartLoader';

  renderBody(): TemplateResult {
    const quantity = this.data?.quantity ?? 0;
    const options = this.data?._embedded?.['fx:item_options'];
    const price = this.data?.price ?? 0;

    const currencyDisplay = this.__currencyDisplay;
    const currencyCode = this.__currencyCode;
    const totalPrice = quantity * price;

    return html`
      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__transactionTemplateHref)}
        id=${this.__transactionTemplateLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__defaultTemplateSetHref)}
        id=${this.__defaultTemplateSetLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__localeCodesHelperHref)}
        id=${this.__localeCodesHelperLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__transactionHref)}
        id=${this.__transactionLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__templateSetHref)}
        id=${this.__templateSetLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__storeHref)}
        id=${this.__storeLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__cartHref)}
        id=${this.__cartLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <div
        class="flex items-start leading-xs"
        style="gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
      >
        <img
          class="relative h-s w-s object-cover rounded-full bg-contrast-20 flex-shrink-0 shadow-xs"
          src=${ifDefined(this.data?.image)}
          alt=""
          @error=${(evt: Event) => {
            const img = evt.currentTarget as HTMLImageElement;
            img.src = ItemCard.__placeholder;
          }}
        />

        <div class="flex-1 min-w-0">
          <div class="flex-1 h-s flex items-center">
            <div class="flex-1">
              <div class="font-semibold text-m truncate">${this.data?.name}</div>
              <div class="text-tertiary text-s truncate">
                ${quantity} &times;

                <foxy-i18n
                  options=${JSON.stringify({
                    amount: `${price} ${currencyCode}`,
                    currencyDisplay,
                  })}
                  key="price"
                  infer=""
                >
                </foxy-i18n>

                &equals;

                <foxy-i18n
                  options=${JSON.stringify({
                    amount: `${totalPrice} ${currencyCode}`,
                    currencyDisplay,
                  })}
                  key="price"
                  infer=""
                >
                </foxy-i18n>
              </div>
            </div>

            ${this.data?.subscription_frequency &&
            !this.hiddenSelector.matches('autorenew-icon', true)
              ? html`
                  <div
                    class="w-xs h-xs flex items-center justify-center rounded-full bg-contrast-5"
                  >
                    <iron-icon icon="icons:autorenew" class="icon-inline text-s"></iron-icon>
                  </div>
                `
              : ''}
          </div>

          ${options && options.length > 0
            ? html`
                <div class="mt-s">
                  ${options.map(
                    option => html`
                      <div
                        data-testclass="option"
                        class="flex items-center text-s space-x-xs leading-m"
                      >
                        <div class="flex-1 text-tertiary truncate">
                          ${option.name}: ${option.value}
                        </div>
                        ${option.price_mod
                          ? html`
                              <div
                                class="${option.price_mod > 0
                                  ? 'text-success'
                                  : 'text-error'} rounded px-xs truncate"
                              >
                                <foxy-i18n
                                  options=${JSON.stringify({
                                    amount: `${option.price_mod} ${currencyCode}`,
                                    currencyDisplay: currencyDisplay,
                                  })}
                                  key="price"
                                  infer=""
                                >
                                </foxy-i18n>
                              </div>
                            `
                          : ''}
                        ${option.weight_mod
                          ? html`
                              <div
                                class="${option.price_mod > 0
                                  ? 'text-success'
                                  : 'text-error'} rounded px-xs truncate"
                              >
                                ${option.weight_mod}
                                <foxy-i18n key="wgt" infer=""></foxy-i18n>
                              </div>
                            `
                          : ''}
                      </div>
                    `
                  )}
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  get isBodyReady(): boolean {
    const isLoaded = !!this.__currencyDisplay && !!this.__currencyCode;
    return super.isBodyReady && isLoaded;
  }

  private get __transactionTemplateHref() {
    try {
      const links = this.data?._links as Partial<Record<string, { href: string }>> | undefined;
      const url = new URL(links?.['fx:subscription']?.href ?? '');
      url.searchParams.set('zoom', 'transaction_template');
      return url.toString();
    } catch {
      //
    }
  }

  private get __defaultTemplateSetHref() {
    const templateSetUri = (this.__cart ?? this.__transactionTemplate)?.template_set_uri;

    if (templateSetUri === '') {
      try {
        const url = new URL(this.__store?._links['fx:template_sets'].href ?? '');
        url.searchParams.set('code', 'DEFAULT');
        return url.toString();
      } catch {
        //
      }
    }
  }

  private get __localeCodesHelperHref() {
    if (this.__defaultTemplateSetHref || this.__templateSetHref) {
      return this.localeCodes ?? void 0;
    }
  }

  private get __transactionHref() {
    return this.data?._links['fx:transaction']?.href;
  }

  private get __templateSetHref() {
    const cart = this.__cart ?? this.__transactionTemplate;
    // TODO: remove the directive below once SDK is updated
    // @ts-expect-error SDK types are incomplete
    const currencyCode = cart?.currency_code as string | undefined;

    if (!currencyCode) return cart?.template_set_uri || void 0;
  }

  private get __storeHref() {
    return this.data?._links['fx:store']?.href;
  }

  private get __cartHref() {
    const links = this.data?._links as Partial<Record<string, { href: string }>> | undefined;
    return links?.['fx:cart']?.href;
  }

  private get __transactionTemplate() {
    type Loader = NucleonElement<Resource<Rels.Subscription, { zoom: 'transaction_template' }>>;
    const selector = `#${this.__transactionTemplateLoaderId}`;
    const loader = this.renderRoot.querySelector<Loader>(selector);
    return loader?.data?._embedded['fx:transaction_template'] ?? null;
  }

  private get __defaultTemplateSet() {
    type Loader = NucleonElement<Resource<Rels.TemplateSets>>;
    const selector = `#${this.__defaultTemplateSetLoaderId}`;
    const loader = this.renderRoot.querySelector<Loader>(selector);
    return loader?.data?._embedded['fx:template_sets'][0] ?? null;
  }

  private get __localeCodesHelper() {
    type Loader = NucleonElement<Resource<Rels.LocaleCodes>>;
    const selector = `#${this.__localeCodesHelperLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private get __transaction() {
    type Loader = NucleonElement<Resource<Rels.Transaction>>;
    const selector = `#${this.__transactionLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private get __templateSet() {
    type Loader = NucleonElement<Resource<Rels.TemplateSet>>;
    const selector = `#${this.__templateSetLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private get __store() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    const selector = `#${this.__storeLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private get __cart() {
    type Loader = NucleonElement<Resource<Rels.Cart>>;
    const selector = `#${this.__cartLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private get __currencyDisplay() {
    const useCode = this.__store?.use_international_currency_symbol;

    if (useCode === true) return 'code';
    if (useCode === false) return 'symbol';
    if (this.data && !this.data._links['fx:store']) return 'symbol';
  }

  private get __currencyCode() {
    const transaction = this.__transaction;

    if (transaction) {
      return transaction.currency_code;
    } else {
      const cart = this.__cart ?? this.__transactionTemplate;

      if (cart && 'currency_code' in cart) {
        // TODO: remove the directive below once the SDK is updated
        // @ts-expect-error SDK types are incomplete
        return cart.currency_code as string;
      } else {
        const allLocaleCodes = this.__localeCodesHelper;
        const localeCode = (this.__templateSet ?? this.__defaultTemplateSet)?.locale_code;
        const localeInfo = localeCode ? allLocaleCodes?.values[localeCode] : void 0;

        if (localeInfo) return /Currency: ([A-Z]{3})/g.exec(localeInfo)?.[1];
      }
    }
  }
}
