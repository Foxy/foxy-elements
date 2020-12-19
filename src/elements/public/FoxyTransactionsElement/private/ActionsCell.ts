import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { CollectionTableCell } from '../../../private/CollectionTable/CollectionTableCell';
import { I18N } from '../../../private';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

type Transaction = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Transaction, { zoom: 'items' }>;

export class ActionsCell extends CollectionTableCell<Transaction> {
  static get scopedElements(): ScopedElementsMap {
    return { 'x-i18n': I18N };
  }

  render(): TemplateResult {
    if (!this.context) return html``;

    return html`
      <a
        class="text-s font-medium tracking-wide text-primary rounded px-xs -mx-xs hover:underline focus:outline-none focus:shadow-outline"
        href=${this.context._links['fx:receipt'].href}
        target="_blank"
      >
        <x-i18n .ns=${this.ns} .lang=${this.lang} key="receipt"></x-i18n>
      </a>
    `;
  }
}
