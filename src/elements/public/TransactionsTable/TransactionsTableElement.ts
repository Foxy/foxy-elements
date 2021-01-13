import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { HypermediaResourceTable } from '../../private/HypermediaResourceTable/HypermediaResourceTable';
import { I18N } from '../../private';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';

type Collection = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Transactions, { zoom: 'items' }>;

export class TransactionsTableElement extends HypermediaResourceTable<Collection> {
  static readonly defaultNodeName = 'foxy-transactions-table';

  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'x-i18n': I18N,
    };
  }

  readonly rel = 'transactions';

  constructor() {
    super('transactions');
  }

  render(): TemplateResult {
    return super.render([
      {
        header: () => this._t('th_total').toString(),
        cell: transaction => {
          return html`
            <span class="font-medium tracking-wide font-tnum">
              ${transaction.total_order.toLocaleString(this.lang, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
                currency: transaction.currency_code,
                style: 'currency',
              })}
            </span>
          `;
        },
      },

      {
        header: () => this._t('th_summary').toString(),
        cell: transaction => {
          const items = transaction._embedded['fx:items'];
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
        cell: transaction => {
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
              key=${`status_${transaction.status}`}
              lang=${this.lang}
              class="px-s text-s font-medium tracking-wide rounded ${colors[transaction.status]}"
            >
            </x-i18n>
          `;
        },
      },

      {
        mdAndUp: true,
        header: () => this._t('th_id').toString(),
        cell: transaction => {
          return html`
            <span class="text-s text-secondary font-tnum">
              <span class="text-tertiary">ID</span> ${transaction.id}
            </span>
          `;
        },
      },

      {
        mdAndUp: true,
        header: () => this._t('th_date').toString(),
        cell: transaction => {
          const date = new Date(transaction.transaction_date);
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
        },
      },

      {
        header: () => this._t('th_actions').toString(),
        cell: transaction => {
          return html`
            <a
              class="text-s font-medium tracking-wide text-primary rounded px-xs -mx-xs hover:underline focus:outline-none focus:shadow-outline"
              href=${transaction._links['fx:receipt'].href}
              target="_blank"
            >
              <x-i18n .ns=${this.ns} .lang=${this.lang} key="receipt"></x-i18n>
            </a>
          `;
        },
      },
    ]);
  }
}
