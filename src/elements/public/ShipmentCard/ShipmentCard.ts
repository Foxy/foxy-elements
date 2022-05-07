import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector, Resource } from '@foxy.io/sdk/core';
import { Rels } from '@foxy.io/sdk/backend';
import { PropertyDeclarations } from 'lit-element';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { FormRenderer } from '../FormDialog/types';

export class ShipmentCard extends TranslatableMixin(InternalCard, 'shipment-card')<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __customerAddresses: { attribute: false },
      __currencyDisplay: { attribute: false },
      __itemCategories: { attribute: false },
      __editable: { attribute: false },
      __currency: { attribute: false },
      __coupons: { attribute: false },
    };
  }

  __customerAddresses = '';

  __currencyDisplay = '';

  __itemCategories = '';

  __editable = false;

  __currency = '';

  __coupons = '';

  get hiddenSelector(): BooleanSelector {
    return new BooleanSelector(`${super.hiddenSelector.toString()} address:not=full-address`);
  }

  get readonlySelector(): BooleanSelector {
    return this.__editable ? super.readonlySelector : BooleanSelector.True;
  }

  renderBody(): TemplateResult {
    let itemsLink: string | undefined = undefined;

    if (this.data) {
      try {
        const url = new URL(this.data._links['fx:items'].href);
        url.searchParams.set('zoom', 'item_options');
        itemsLink = url.toString();
      } catch {
        //
      }
    }

    const itemFormRenderer: FormRenderer = ({ html, dialog, handleFetch, handleUpdate }) => html`
      <foxy-item-form
        disabledcontrols=${dialog.disabledSelector.toString()}
        readonlycontrols=${dialog.readonlySelector.toString()}
        hiddencontrols=${dialog.hiddenSelector.toString()}
        customer-addresses=${this.__customerAddresses}
        item-categories=${this.__itemCategories}
        coupons=${this.__coupons}
        parent=${dialog.parent}
        href=${dialog.href}
        lang=${dialog.lang}
        ns=${dialog.ns}
        @fetch=${handleFetch}
        @update=${handleUpdate}
      >
      </foxy-item-form>
    `;

    return html`
      <div class="space-y-m">
        <foxy-address-card
          infer="address"
          href=${ifDefined(this.data?._links['fx:customer_address'].href)}
        >
          <div slot="full-address:after" class="flex items-center text-m space-x-s text-secondary">
            <iron-icon icon="maps:local-shipping" class="icon-inline flex-shrink-0"></iron-icon>
            <span class="truncate">
              ${this.data?.shipping_service_description} &bull;
              <foxy-i18n
                options=${JSON.stringify({
                  amount: `${this.data?.total_shipping} ${this.__currency}`,
                  currencyDisplay: this.__currencyDisplay,
                })}
                key="price"
                infer
              >
              </foxy-i18n>
            </span>
          </div>
        </foxy-address-card>

        <foxy-internal-collection-card
          infer="items"
          first=${ifDefined(itemsLink)}
          limit="5"
          item="foxy-item-card"
          open
          .form=${itemFormRenderer}
        >
        </foxy-internal-collection-card>
      </div>
    `;
  }

  protected async _sendGet(): Promise<Data> {
    type Transaction = Resource<Rels.Transaction>;
    type Customer = Resource<Rels.Customer>;
    type Store = Resource<Rels.Store>;

    const shipment = await super._sendGet();
    const [transaction, customer, store] = await Promise.all([
      super._fetch<Transaction>(shipment._links['fx:transaction'].href),
      super._fetch<Customer>(shipment._links['fx:customer'].href),
      super._fetch<Store>(shipment._links['fx:store'].href),
    ]);

    this.__customerAddresses = customer._links['fx:customer_addresses'].href;
    this.__currencyDisplay = store.use_international_currency_symbol ? 'code' : 'symbol';
    this.__itemCategories = store._links['fx:item_categories'].href;
    this.__currency = transaction.currency_code;
    this.__editable = !!transaction._links['fx:void'] || !!transaction._links['fx:refund'];
    this.__coupons = store._links['fx:coupons'].href;

    return shipment;
  }
}
