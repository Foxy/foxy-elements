import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { CollectionTableCell } from '../../../private/CollectionTable/CollectionTableCell';

type Transaction = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Transaction, { zoom: 'items' }>;

export class DateCell extends CollectionTableCell<Transaction> {
  render(): TemplateResult {
    if (!this.context) return html``;

    const date = new Date(this.context.transaction_date);
    const now = new Date();

    return html`
      <span class="text-s text-secondary font-tnum">
        ${date.toLocaleString(this.lang, {
          year: now.getFullYear() === date.getFullYear() ? undefined : 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        })}
      </span>
    `;
  }
}
