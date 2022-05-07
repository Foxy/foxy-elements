import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';

const NS = 'item-option-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Basic card displaying an item option.
 *
 * @slot title:before
 * @slot title:after
 *
 * @slot subtitle:before
 * @slot subtitle:after
 *
 * @element foxy-item-option-card
 * @since 1.17.0
 */
export class ItemOptionCard extends Base<Data> {
  private __currencyDisplay = '';

  private __currency = '';

  render(): TemplateResult {
    return super.render({
      title: data => {
        let priceMod: string;

        try {
          priceMod = Math.abs(data.price_mod).toLocaleString(this.lang || 'en', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
            currencyDisplay: this.__currencyDisplay,
            currency: this.__currency,
            style: 'currency',
          });
        } catch {
          priceMod = '--';
        }

        return html`${data.name} &bull; ${priceMod} &bull; ${data.weight_mod}`;
      },
      subtitle: data => html`${data.value}`,
    });
  }

  protected async _sendGet(): Promise<Data> {
    type Transaction = Resource<Rels.Transaction>;
    type Store = Resource<Rels.Store>;

    const discount = await super._sendGet();
    const [transaction, store] = await Promise.all([
      super._fetch<Transaction>(discount._links['fx:transaction'].href),
      super._fetch<Store>(discount._links['fx:store'].href),
    ]);

    this.__currency = transaction.currency_code;
    this.__currencyDisplay = store.use_international_currency_symbol ? 'code' : 'symbol';

    return discount;
  }
}
