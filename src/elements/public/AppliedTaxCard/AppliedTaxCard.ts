import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';

/**
 * Basic card displaying an applied tax.
 *
 * @slot title:before
 * @slot title:after
 *
 * @slot subtitle:before
 * @slot subtitle:after
 *
 * @element foxy-applied-tax-card
 * @since 1.11.0
 */
export class AppliedTaxCard extends TranslatableMixin(TwoLineCard, 'applied-tax-card')<Data> {
  private __currencyDisplay = '';

  private __currency = '';

  render(): TemplateResult {
    return super.render({
      title: data => html`${data.name}`,
      subtitle: data => {
        return html`
          <foxy-i18n
            options=${JSON.stringify({
              amount: `${data.amount} ${this.__currency}`,
              currencyDisplay: this.__currencyDisplay,
            })}
            lang=${this.lang}
            key="price"
            ns=${this.ns}
          >
          </foxy-i18n>

          <span>&bull;</span>

          <foxy-i18n
            options=${JSON.stringify({ fraction: data.rate / 100 })}
            lang=${this.lang}
            key="percent"
            ns=${this.ns}
          >
          </foxy-i18n>
        `;
      },
    });
  }

  protected async _sendGet(): Promise<Data> {
    type Transaction = Resource<Rels.Transaction>;
    type Store = Resource<Rels.Store>;

    const appliedTax = await super._sendGet();
    const [transaction, store] = await Promise.all([
      super._fetch<Transaction>(appliedTax._links['fx:transaction'].href),
      super._fetch<Store>(appliedTax._links['fx:store'].href),
    ]);

    this.__currency = transaction.currency_code;
    this.__currencyDisplay = store.use_international_currency_symbol ? 'code' : 'symbol';

    return appliedTax;
  }
}
