import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { FormDialogElement } from '../FormDialog/index';
import { I18nElement } from '../I18n/index';
import { NucleonTableElement } from '../../private/NucleonTable/NucleonTableElement';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { parseDuration } from '../../../utils/parse-duration';

export class SubscriptionsTableElement extends NucleonTableElement<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'foxy-i18n': customElements.get('foxy-i18n'),
    };
  }

  private static __ns = 'subscriptions-table';

  private __untrackTranslations?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = I18nElement.onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    const { lang } = this;
    const ns = SubscriptionsTableElement.__ns;

    return html`
      <foxy-form-dialog
        data-testclass="i18n"
        data-testid="subscriptionDialog"
        header="edit_header"
        parent=${this.href}
        form="foxy-subscription-form"
        lang=${lang}
        ns=${ns}
        id="form-dialog"
      >
      </foxy-form-dialog>

      ${super.render([
        {
          header: () => this.__t('th_frequency').toString(),
          cell: sub => {
            const transaction = sub._embedded['fx:last_transaction'];
            const amount = `${transaction.total_order} ${transaction.currency_code}`;

            return html`
              <foxy-i18n
                data-testclass="i18n frequencies"
                class="font-medium tracking-wide font-tnum"
                lang=${lang}
                key=${sub.frequency === '.5m' ? 'sub_pricing_0_5m' : 'sub_pricing'}
                ns=${ns}
                .opts=${{ ...parseDuration(sub.frequency), amount }}
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

            return html`
              <foxy-i18n
                data-testclass="i18n summaries"
                lang=${lang}
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
          cell: sub => {
            let color: string;
            let date: string;
            let key: string;

            if (sub.first_failed_transaction_date) {
              date = sub.first_failed_transaction_date;
              key = 'status_failed';
              color = 'bg-error-10 text-error';
            } else if (sub.end_date) {
              date = sub.end_date;
              const dateAsObject = new Date(date);
              const hasEnded = dateAsObject.getTime() > Date.now();
              key = hasEnded ? 'status_will_be_cancelled' : 'status_cancelled';
              color = hasEnded ? 'bg-success-10 text-success' : 'bg-contrast-5 text-tertiary';
            } else {
              date = sub.next_transaction_date;
              key = 'status_active';
              color = 'bg-success-10 text-success';
            }

            return html`
              <foxy-i18n
                data-testclass="i18n statuses"
                class="px-s text-s font-medium tracking-wide rounded ${color}"
                lang=${lang}
                key=${key}
                ns=${ns}
                .opts=${{ date }}
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
                data-testclass="editButtons"
                class="text-s font-medium tracking-wide text-primary rounded px-xs -mx-xs hover:underline focus:outline-none focus:shadow-outline"
                @click=${() => {
                  const dialog = this.renderRoot.querySelector('#form-dialog') as FormDialogElement;
                  dialog.href = sub._links.self.href;
                  dialog.show();
                }}
              >
                <foxy-i18n data-testclass="i18n" ns=${ns} lang=${lang} key="edit"></foxy-i18n>
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
    return I18nElement.i18next.getFixedT(this.lang, SubscriptionsTableElement.__ns);
  }
}
