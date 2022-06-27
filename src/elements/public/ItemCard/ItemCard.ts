import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';

import { TranslatableMixin } from '../../../mixins/translatable';
import { html } from 'lit-html';
import { Data } from './types';
import { Resource } from '@foxy.io/sdk/core';
import { Rels } from '@foxy.io/sdk/backend';
import { ifDefined } from 'lit-html/directives/if-defined';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ConfigurableMixin } from '../../../mixins/configurable';

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
      __currencyDisplay: { attribute: false },
      __currency: { attribute: false },
    };
  }

  private static readonly __placeholder =
    'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="40" height="40" fill="%23E8E8E8"/%3E%3Cpath d="M31.5143 0H24.5476L0 24.5476V31.5143L11.7046 19.8097L11.9841 17.0782C12.0983 15.9624 13.0131 15.1154 14.1038 15.1154H15.7373V12.1923C15.7373 10.9815 16.6915 10 17.8687 10H21.5143L31.5143 0Z" fill="white"/%3E%3Cpath d="M11.5434 21.3852L0 32.9285V39.8953L11.5822 28.3131C11.172 27.8663 10.9438 27.2444 11.012 26.5782L11.5434 21.3852Z" fill="white"/%3E%3Cpath d="M12.4305 28.879L1.30951 40H8.27631L19.2763 29H13.1316C12.8853 29 12.6495 28.9573 12.4305 28.879Z" fill="white"/%3E%3Cpath d="M28.3113 19.965L28.0159 17.0782C27.9116 16.0591 27.1395 15.2642 26.1754 15.1341L40 1.3095V8.27627L28.3113 19.965Z" fill="white"/%3E%3Cpath d="M20.6905 29L9.69049 40H16.6572L27.9755 28.6817C27.6541 28.8832 27.2756 29 26.8684 29H20.6905Z" fill="white"/%3E%3Cpath d="M28.6572 28C28.9128 27.5952 29.0415 27.1003 28.988 26.5782L28.4426 21.2479L40 9.69053V16.6572L28.6572 28Z" fill="white"/%3E%3Cpath d="M25.0381 40H18.0715L40 18.0715V25.0381L25.0381 40Z" fill="white"/%3E%3Cpath d="M26.4524 40H33.4191L40 33.4191V26.4524L26.4524 40Z" fill="white"/%3E%3Cpath d="M40 40H34.8333L40 34.8333V40Z" fill="white"/%3E%3Cpath d="M16.1666 0H23.1334L0 23.1334V16.1666L16.1666 0Z" fill="white"/%3E%3Cpath d="M14.7524 0H7.78571L0 7.78573V14.7524L14.7524 0Z" fill="white"/%3E%3Cpath d="M0 0H6.37152L0 6.37151V0Z" fill="white"/%3E%3Cpath d="M21.467 11.4615H17.8687C17.4763 11.4615 17.1582 11.7887 17.1582 12.1923V15.1154H22.8418V12.1923C22.8418 11.7887 22.5237 11.4615 22.1313 11.4615H21.467Z" fill="white"/%3E%3Cpath d="M24.7798 15.1154H24.2627V12.1923C24.2627 11.227 23.6562 10.4075 22.8138 10.1148L32.9286 0H39.89L24.7798 15.1154Z" fill="white"/%3E%3C/svg%3E';

  __currencyDisplay = '';

  __currency = '';

  renderBody(): TemplateResult {
    const quantity = this.data?.quantity ?? 0;
    const price = this.data?.price ?? 0;
    const totalPrice = quantity * price;
    const options = this.data?._embedded?.['fx:item_options'];

    return html`
      <div class="flex items-start space-x-m leading-m">
        <div class="w-l h-l relative flex-shrink-0">
          <img
            class="relative w-full h-full object-cover rounded"
            src=${ifDefined(this.data?.image)}
            alt=""
            @error=${(evt: Event) => {
              const img = evt.currentTarget as HTMLImageElement;
              img.src = ItemCard.__placeholder;
            }}
          />

          <div class="border border-contrast-10 absolute inset-0 rounded"></div>
        </div>

        <div class="flex-1">
          <div class="flex-1 h-l flex items-center">
            <div class="flex-1 leading-s">
              <div class="font-semibold text-m">${this.data?.name}</div>
              <div class="text-secondary text-m">
                ${quantity} &times;

                <foxy-i18n
                  options=${JSON.stringify({
                    amount: `${price} ${this.__currency}`,
                    currencyDisplay: this.__currencyDisplay,
                  })}
                  key="price"
                  infer=""
                >
                </foxy-i18n>

                &equals;

                <foxy-i18n
                  options=${JSON.stringify({
                    amount: `${totalPrice} ${this.__currency}`,
                    currencyDisplay: this.__currencyDisplay,
                  })}
                  key="price"
                  infer=""
                >
                </foxy-i18n>
              </div>
            </div>

            ${this.data?.subscription_frequency
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
                      <div class="flex items-center text-m space-x-xs leading-m">
                        <div class="flex-1 text-tertiary">${option.name}: ${option.value}</div>
                        ${option.price_mod
                          ? html`
                              <div
                                class="${option.price_mod > 0
                                  ? 'text-success'
                                  : 'text-error'} rounded px-xs"
                              >
                                <foxy-i18n
                                  options=${JSON.stringify({
                                    amount: `${option.price_mod} ${this.__currency}`,
                                    currencyDisplay: this.__currencyDisplay,
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
                                  : 'text-error'} rounded px-xs"
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

  protected async _sendGet(): Promise<Data> {
    type Transaction = Resource<Rels.Transaction>;
    type Store = Resource<Rels.Store>;

    const item = await super._sendGet();
    const [transaction, store] = await Promise.all([
      super._fetch<Transaction>(item._links['fx:transaction'].href),
      super._fetch<Store>(item._links['fx:store'].href),
    ]);

    this.__currency = transaction.currency_code;
    this.__currencyDisplay = store.use_international_currency_symbol ? 'code' : 'symbol';

    return item;
  }
}
