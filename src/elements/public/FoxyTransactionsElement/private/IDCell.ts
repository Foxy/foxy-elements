import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { CollectionTableCell } from '../../../private/CollectionTable/CollectionTableCell';

type Transaction = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Transaction, { zoom: 'items' }>;

export class IDCell extends CollectionTableCell<Transaction> {
  render(): TemplateResult {
    if (!this.context) return html``;

    return html`
      <span class="text-s text-secondary font-tnum">
        <span class="text-tertiary">ID</span> ${this.context.id}
      </span>
    `;
  }
}
