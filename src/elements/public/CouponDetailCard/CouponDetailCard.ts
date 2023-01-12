import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';

const NS = 'coupon-detail-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Basic card displaying a coupon detail.
 *
 * @slot title:before
 * @slot title:after
 *
 * @slot subtitle:before
 * @slot subtitle:after
 *
 * @element foxy-coupon-detail-card
 * @since 1.17.0
 */
export class CouponDetailCard extends Base<Data> {
  private __currencyDisplay = '';

  private __currency = '';

  renderBody(): TemplateResult {
    return super.renderBody({
      title: data => html`${data.name} &bull; ${data.code}`,
      subtitle: data => {
        let text: string;

        try {
          text = Math.abs(data.amount_per).toLocaleString(this.lang || 'en', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
            currencyDisplay: this.__currencyDisplay,
            currency: this.__currency,
            style: 'currency',
          });
        } catch {
          text = '--';
        }

        return html`
          <span class=${data.amount_per > 0 ? 'text-success' : 'text-error'}>${text}</span>
        `;
      },
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
