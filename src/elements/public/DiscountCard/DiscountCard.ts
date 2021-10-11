import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';

/**
 * Basic card displaying a discount.
 *
 * @slot title:before
 * @slot title:after
 *
 * @slot subtitle:before
 * @slot subtitle:after
 *
 * @element foxy-discount-card
 * @since 1.11.0
 */
export class DiscountCard extends TranslatableMixin(TwoLineCard, 'discount-card')<Data> {
  private __currencyDisplay = '';

  private __currency = '';

  render(): TemplateResult {
    return super.render({
      title: data => html`${data.name} &bull; ${data.code}`,
      subtitle: data => html`
        <foxy-i18n
          options=${JSON.stringify({
            currencyDisplay: this.__currencyDisplay,
            amount: `${Math.abs(data.amount)} ${this.__currency}`,
          })}
          lang=${this.lang}
          key="price"
          ns=${this.ns}
        >
        </foxy-i18n>
      `,
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
