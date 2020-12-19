import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { CollectionTableCell } from '../../../private/CollectionTable/CollectionTableCell';

type Transaction = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Transaction, { zoom: 'items' }>;

export class TotalCell extends CollectionTableCell<Transaction> {
  render(): TemplateResult {
    if (!this.context) return html``;

    return html`
      <span class="font-medium tracking-wide font-tnum">
        ${this.context.total_order.toLocaleString(this.lang, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
          currency: this.context.currency_code,
          style: 'currency',
        })}
      </span>
    `;
  }
}
