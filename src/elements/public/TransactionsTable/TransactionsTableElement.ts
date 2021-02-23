import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { I18NElement } from '../I18n/index';
import { NucleonTableElement } from '../../private/NucleonTable/NucleonTableElement';

export class TransactionsTableElement extends NucleonTableElement<Data> {
  private static __ns = 'transactions-table';

  private __untrackTranslations?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = I18NElement.onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    const ns = TransactionsTableElement.__ns;

    return super.render([
      {
        header: () => this.__t('th_total').toString(),
        cell: transaction => {
          return html`
            <span class="font-medium tracking-wide font-tnum">
              ${this.__formatPrice(transaction.total_order, transaction.currency_code)}
            </span>
          `;
        },
      },

      {
        header: () => this.__t('th_summary').toString(),
        cell: transaction => {
          const items = transaction._embedded?.['fx:items'];
          if (!items)
            return html`<foxy-i18n lang=${this.lang} key="no_summary" ns=${ns}></foxy-i18n>`;

          const opts = {
            most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
            count: items.length,
          };

          return html`
            <foxy-i18n lang=${this.lang} key="summary" ns=${ns} .opts=${opts}></foxy-i18n>
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
              ns=${ns}
              key=${`status_${transaction.status}`}
              lang=${this.lang}
              class="px-s text-s font-medium tracking-wide rounded ${colors[transaction.status]}"
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
            <span class="text-s text-secondary font-tnum">
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
            <span class="text-s text-secondary font-tnum">
              ${this.__formatDate(new Date(transaction.transaction_date))}
            </span>
          `;
        },
      },

      {
        header: () => this.__t('th_actions').toString(),
        cell: transaction => {
          return html`
            <a
              class="text-s font-medium tracking-wide text-primary rounded px-xs -mx-xs hover:underline focus:outline-none focus:shadow-outline"
              href=${transaction._links['fx:receipt'].href}
              target="_blank"
            >
              <foxy-i18n ns=${ns} lang=${this.lang} key="receipt"></foxy-i18n>
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
    return I18NElement.i18next.getFixedT(this.lang, TransactionsTableElement.__ns);
  }

  private __formatDate(date: Date, lang = this.lang): string {
    try {
      return date.toLocaleString(lang, {
        year: new Date().getFullYear() === date.getFullYear() ? undefined : 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
    } catch {
      return this.__formatDate(date, I18NElement.fallbackLng);
    }
  }

  private __formatPrice(value: number, currency: string, lang = this.lang): string {
    try {
      return value.toLocaleString(lang, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        style: 'currency',
        currency,
      });
    } catch {
      return this.__formatPrice(value, currency, I18NElement.fallbackLng);
    }
  }
}
