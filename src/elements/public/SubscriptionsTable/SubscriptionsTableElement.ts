import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { FormDialogElement } from '../FormDialog/index';
import { I18N } from '../../private/index';
import { I18NElement } from '../I18n/index';
import { NucleonTableElement } from '../../private/NucleonTable/NucleonTableElement';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { parseDuration } from '../../../utils/parse-duration';

export class SubscriptionsTableElement extends NucleonTableElement<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'foxy-i18n': I18N,
    };
  }

  private static __ns = 'subscriptions-table';

  private __untrackTranslations?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = I18NElement.onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    const { lang } = this;
    const ns = SubscriptionsTableElement.__ns;

    return html`
      <foxy-form-dialog
        ns=${ns}
        lang=${lang}
        header="edit_header"
        form="foxy-subscription-form"
        id="form-dialog"
      >
      </foxy-form-dialog>

      ${super.render([
        {
          header: () => this.__t('th-frequency').toString(),
          cell: sub => {
            const frequency = parseDuration(sub.frequency);
            const transaction = sub._embedded['fx:last_transaction'];
            const opts = {
              count: frequency.count,
              units: this.__t(frequency.units, { count: frequency.count }),
              amount: this.__formatPrice(transaction.total_order, transaction.currency_code),
            };

            return html`
              <foxy-i18n
                ns=${ns}
                lang=${lang}
                .opts=${opts}
                class="font-medium tracking-wide font-tnum"
                key="frequency"
              >
              </foxy-i18n>
            `;
          },
        },

        {
          header: () => this.__t('th_summary').toString(),
          cell: sub => {
            const items = sub._embedded['fx:transaction_template']._embedded['fx:items'];
            const opts = {
              most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
              count: items.length,
            };

            return html`<foxy-i18n ns=${ns} lang=${lang} .opts=${opts} key="summary"></foxy-i18n>`;
          },
        },

        {
          mdAndUp: true,
          header: () => this.__t('th_status').toString(),
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

            return html`
              <foxy-i18n
                ns=${ns}
                lang=${lang}
                key=${key}
                .opts=${{ date: this.__formatDate(date ?? new Date()) }}
                class="px-s text-s font-medium tracking-wide rounded ${color}"
              >
              </foxy-i18n>
            `;
          },
        },

        {
          header: () => this.__t('th_actions').toString(),
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
                <foxy-i18n ns=${ns} lang=${lang} key="edit"></foxy-i18n>
              </button>
            `;
          },
        },
      ])}
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__untrackTranslations?.();
  }

  private get __t() {
    return I18NElement.i18next.getFixedT(this.lang, SubscriptionsTableElement.__ns);
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
