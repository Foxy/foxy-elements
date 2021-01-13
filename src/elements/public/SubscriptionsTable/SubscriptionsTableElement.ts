import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { FormDialogElement } from './private/FormDialog';
import { HypermediaResourceTable } from '../../private/HypermediaResourceTable/HypermediaResourceTable';
import { I18N } from '../../private';
import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { parseDuration } from '../../../utils/parse-duration';

type Subscriptions = FoxySDK.Core.Resource<
  FoxySDK.Integration.Rels.Subscriptions,
  { zoom: [{ transaction_template: 'items' }, 'last_transaction'] }
>;

export class SubscriptionsTableElement extends HypermediaResourceTable<Subscriptions> {
  static readonly defaultNodeName = 'foxy-subscriptions-table';

  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'x-form-dialog': FormDialogElement,
      'x-i18n': I18N,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __selection: { attribute: false },
    };
  }

  rel = 'subscriptions';

  constructor() {
    super('subscriptions');
  }

  render(): TemplateResult {
    return html`
      <x-form-dialog
        ns=${this.ns}
        lang=${this.lang}
        header="edit_header"
        id="form-dialog"
        closable
        editable
      >
      </x-form-dialog>

      ${super.render([
        {
          header: () => this._t('th-frequency').toString(),
          cell: sub => {
            const frequency = parseDuration(sub.frequency);
            const transaction = sub._embedded['fx:last_transaction'];
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
          },
        },

        {
          header: () => this._t('th_summary').toString(),
          cell: sub => {
            const items = sub._embedded['fx:transaction_template']._embedded['fx:items'];
            const opts = {
              most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
              count: items.length,
            };

            return html`
              <x-i18n .ns=${this.ns} .lang=${this.lang} .opts=${opts} key="summary"></x-i18n>
            `;
          },
        },

        {
          mdAndUp: true,
          header: () => this._t('th_status').toString(),
          cell: sub => {
            let color = '';
            let date: Date | null = null;
            let key = '';

            if (sub.first_failed_transaction_date) {
              date = new Date(sub.first_failed_transaction_date);
              key = 'status_failed';
              color = 'bg-error-10 text-error';
            } else if (sub.end_date) {
              date = new Date(sub.end_date);
              const hasEnded = date.getTime() > Date.now();
              key = hasEnded ? 'status_will_be_cancelled' : 'status_cancelled';
              color = hasEnded ? 'bg-success-10 text-success' : 'bg-contrast-5 text-tertiary';
            } else {
              date = new Date(sub.next_transaction_date);
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
          },
        },

        {
          header: () => this._t('th_actions').toString(),
          cell: sub => {
            return html`
              <button
                class="text-s font-medium tracking-wide text-primary rounded px-xs -mx-xs hover:underline focus:outline-none focus:shadow-outline"
                @click=${() => {
                  const dialog = this.renderRoot.querySelector('#form-dialog') as FormDialogElement;
                  dialog.href = sub._links.self.href;
                  dialog.show();
                }}
              >
                <x-i18n .ns=${this.ns} .lang=${this.lang} key="edit"></x-i18n>
              </button>
            `;
          },
        },
      ])}
    `;
  }
}
