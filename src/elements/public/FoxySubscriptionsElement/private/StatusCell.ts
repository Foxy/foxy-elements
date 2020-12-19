import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { CollectionTableCell } from '../../../private/CollectionTable/CollectionTableCell';
import { I18N } from '../../../private';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

type Subscription = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Subscription, undefined>;

export class StatusCell extends CollectionTableCell<Subscription> {
  static get scopedElements(): ScopedElementsMap {
    return { 'x-i18n': I18N };
  }

  render(): TemplateResult {
    if (!this.context) return html``;

    let color = '';
    let date: Date | null = null;
    let key = '';

    if (this.context.first_failed_transaction_date) {
      date = new Date(this.context.first_failed_transaction_date);
      key = 'status_failed';
      color = 'bg-error-10 text-error';
    } else if (this.context.end_date) {
      date = new Date(this.context.end_date);
      const hasEnded = date.getTime() > Date.now();
      key = hasEnded ? 'status_will_be_cancelled' : 'status_cancelled';
      color = hasEnded ? 'bg-success-10 text-success' : 'bg-contrast-5 text-tertiary';
    } else {
      date = new Date(this.context.next_transaction_date);
      key = 'status_active';
      color = 'bg-success-10 text-success';
    }

    const opts = {
      date: date?.toLocaleDateString(this.lang, {
        year: date.getFullYear() === new Date().getFullYear() ? 'full' : undefined,
        month: 'long',
        day: 'numeric',
      }),
    };

    return html`
      <x-i18n
        .ns=${this.ns}
        .lang=${this.lang}
        .key=${key}
        .opts=${opts}
        class="px-s text-s font-medium tracking-wide rounded ${color}"
      >
      </x-i18n>
    `;
  }
}
