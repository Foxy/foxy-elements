import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { CollectionTableCell } from '../../../private/CollectionTable/CollectionTableCell';
import { I18N } from '../../../private';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { parseDuration } from '../../../../utils/parse-duration';

type Subscription = FoxySDK.Core.Resource<
  FoxySDK.Integration.Rels.Subscription,
  { zoom: 'last_transaction' }
>;

export class FrequencyCell extends CollectionTableCell<Subscription> {
  static get scopedElements(): ScopedElementsMap {
    return { 'x-i18n': I18N };
  }

  render(): TemplateResult {
    if (!this.context) return html``;

    const frequency = parseDuration(this.context.frequency);
    const transaction = this.context._embedded['fx:last_transaction'];
    const opts = {
      count: frequency.count,
      units: this._t(frequency.units, { count: frequency.count }),
      amount: transaction.total_order.toLocaleString(this.lang, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        currency: transaction.currency_code,
        style: 'currency',
      }),
    };

    return html`
      <x-i18n
        .ns=${this.ns}
        .lang=${this.lang}
        .opts=${opts}
        class="font-medium tracking-wide font-tnum"
        key="frequency"
      >
      </x-i18n>
    `;
  }
}
