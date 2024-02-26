import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { decode } from 'html-entities';
import { html } from 'lit-html';

const NS = 'shipment-card';
const Base = TranslatableMixin(InternalCard, NS);

/**
 * Basic card displaying a shipment (`fx:shipment`).
 *
 * @element foxy-shipment-card
 * @since 1.17.0
 */
export class ShipmentCard extends Base<Data> {
  private readonly __transactionLoaderId = 'transactionLoader';

  private readonly __storeLoaderId = 'storeLoader';

  renderBody(): TemplateResult {
    const { address_name, address1, address2, city, region, postal_code } = this.data ?? {};
    const addressOptions = { address_name, address1, address2, city, region, postal_code };

    const amount = `${this.data?.total_shipping} ${this.__currencyCode}`;
    const currencyDisplay = this.__currencyDisplay;
    const priceOptions = { amount, currencyDisplay };
    const description = this.data?.shipping_service_description;
    const items = this.data?._embedded?.['fx:items'] ?? [];

    return html`
      <foxy-nucleon
        infer=""
        href=${ifDefined(this.data?._links['fx:transaction'].href)}
        id=${this.__transactionLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        infer=""
        href=${ifDefined(this.data?._links['fx:store'].href)}
        id=${this.__storeLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <div class="space-y-s">
        <div class="grid leading-s text-body">
          <foxy-i18n
            class="truncate text-m font-medium"
            infer=""
            key="full_address"
            .options=${addressOptions}
          >
          </foxy-i18n>

          <span class="truncate text-s text-secondary">
            ${description ? html`${decode(description)} &bull; ` : ''}
            <foxy-i18n key="price" infer="" .options=${priceOptions}></foxy-i18n>
            &bull;
            <foxy-i18n infer="" key="item" .options=${{ count: items.length }}></foxy-i18n>
          </span>
        </div>

        ${items.length > 0
          ? html`
              <div class="border-t border-dashed border-contrast-20"></div>
              <div class="overflow-auto">
                <table class="text-s leading-s whitespace-nowrap">
                  <thead></thead>
                  <tbody>
                    ${items.map(item => {
                      const category = item._embedded?.['fx:item_category'];
                      const lengthUnit = category?.default_length_unit;
                      const weightUnit = category?.default_weight_unit;

                      return html`
                        <tr>
                          <td class="pr-s font-medium">
                            ${item.code || html`<foxy-i18n infer="" key="no_code"></foxy-i18n>`}
                          </td>
                          <td class="px-s text-secondary">${item.name}</td>
                          <td class="px-s text-tertiary">
                            ${item.width}&times;${item.height}&times;${item.length} ${lengthUnit}
                          </td>
                          <td class="px-s text-tertiary">${item.weight} ${weightUnit}</td>
                          <td class="pl-s font-medium">
                            <foxy-i18n infer="" key="quantity" .options=${{ count: item.quantity }}>
                            </foxy-i18n>
                          </td>
                        </tr>
                      `;
                    })}
                  </tbody>
                </table>
              </div>
            `
          : ''}
      </div>
    `;
  }

  get isBodyReady() {
    return super.isBodyReady && !!this.__currencyDisplay && !!this.__currencyCode;
  }

  private get __transactionLoader() {
    type Loader = NucleonElement<Resource<Rels.Transaction>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__transactionLoaderId}`);
  }

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__storeLoaderId}`);
  }

  private get __currencyDisplay() {
    const store = this.__storeLoader?.data;
    return store ? (store.use_international_currency_symbol ? 'code' : 'symbol') : void 0;
  }

  private get __currencyCode() {
    return this.__transactionLoader?.data?.currency_code;
  }
}
