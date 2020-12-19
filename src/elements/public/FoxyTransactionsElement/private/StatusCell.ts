import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { CollectionTableCell } from '../../../private/CollectionTable/CollectionTableCell';
import { I18N } from '../../../private';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

type Transaction = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Transaction, { zoom: 'items' }>;

export class StatusCell extends CollectionTableCell<Transaction> {
  static get scopedElements(): ScopedElementsMap {
    return { 'x-i18n': I18N };
  }

  render(): TemplateResult {
    if (!this.context) return html``;

    const colors = {
      approved: 'bg-contrast-10 text-contrast',
      authorized: 'bg-success-10 text-success',
      declined: 'bg-error-10 text-error',
      pending: 'bg-contrast-10 text-contrast',
      rejected: 'bg-error-10 text-error',
      completed: 'bg-success-10 text-success',
    };

    return html`
      <x-i18n
        ns=${this.ns}
        key=${`status_${this.context.status}`}
        lang=${this.lang}
        class="px-s text-s font-medium tracking-wide rounded ${colors[this.context.status]}"
      >
      </x-i18n>
    `;
  }
}
