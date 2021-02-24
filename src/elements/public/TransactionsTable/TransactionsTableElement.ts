import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { I18nElement } from '../I18n/index';
import { NucleonTableElement } from '../../private/NucleonTable/NucleonTableElement';

export class TransactionsTableElement extends NucleonTableElement<Data> {
  private static __ns = 'transactions-table';

  private __untrackTranslations?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = I18nElement.onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    const ns = TransactionsTableElement.__ns;

    return super.render([
      {
        header: () => this.__t('th_total').toString(),
        cell: transaction => html`
          <foxy-i18n
            data-testclass="i18n totals"
            class="font-medium tracking-wide font-tnum"
            lang=${this.lang}
            key="total"
            ns=${ns}
            .opts=${{ value: `${transaction.total_order} ${transaction.currency_code}` }}
          >
          </foxy-i18n>
        `,
      },

      {
        header: () => this.__t('th_summary').toString(),
        cell: transaction => {
          const items = transaction._embedded?.['fx:items'];
          if (!items) return '';

          const opts = {
            most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
            count: items.length,
          };

          return html`
            <foxy-i18n
              data-testclass="i18n summaries"
              lang=${this.lang}
              key="summary"
              ns=${ns}
              .opts=${opts}
            >
            </foxy-i18n>
          `;
        },
      },

      {
        mdAndUp: true,
        header: () => this.__t('th_status').toString(),
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
            <foxy-i18n
              data-testclass="i18n statuses"
              class="px-s text-s font-medium tracking-wide rounded ${colors[transaction.status]}"
              lang=${this.lang}
              key=${`status_${transaction.status}`}
              ns=${ns}
            >
            </foxy-i18n>
          `;
        },
      },

      {
        mdAndUp: true,
        header: () => this.__t('th_id').toString(),
        cell: transaction => {
          return html`
            <span class="text-s text-secondary font-tnum" data-testclass="ids">
              <span class="text-tertiary">ID</span> ${transaction.id}
            </span>
          `;
        },
      },

      {
        mdAndUp: true,
        header: () => this.__t('th_date').toString(),
        cell: transaction => {
          return html`
            <foxy-i18n
              data-testclass="i18n dates"
              class="text-s text-secondary font-tnum"
              lang=${this.lang}
              key="date"
              ns=${ns}
              .opts=${{ value: transaction.transaction_date }}
            >
            </foxy-i18n>
          `;
        },
      },

      {
        header: () => this.__t('th_actions').toString(),
        cell: transaction => {
          return html`
            <a
              data-testclass="links"
              target="_blank"
              class="text-s font-medium tracking-wide text-primary rounded px-xs -mx-xs hover:underline focus:outline-none focus:shadow-outline"
              href=${transaction._links['fx:receipt'].href}
            >
              <foxy-i18n data-testclass="i18n" ns=${ns} lang=${this.lang} key="receipt"></foxy-i18n>
            </a>
          `;
        },
      },
    ]);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__untrackTranslations?.();
  }

  private get __t() {
    return I18nElement.i18next.getFixedT(this.lang, TransactionsTableElement.__ns);
  }
}
