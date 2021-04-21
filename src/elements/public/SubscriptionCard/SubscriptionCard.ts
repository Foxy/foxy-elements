import { CSSResult, CSSResultArray } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { Themeable } from '../../../mixins/themeable';
import { addBreakpoints } from '../../../utils/add-breakpoints';
import { classMap } from '../../../utils/class-map';
import { parseFrequency } from '../../../utils/parse-frequency';

export class SubscriptionCard extends NucleonElement<Data> {
  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  private static __ns = 'subscription-card';

  private __removeBreakpoints?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__removeBreakpoints = addBreakpoints(this);
  }

  render(): TemplateResult {
    return html`
      <div class="relative text-left">
        <div
          class=${classMap({
            'flex items-center space-x-m transition duration-150 ease-in-out': true,
            'opacity-0': !this.in({ idle: 'snapshot' }),
          })}
        >
          <div
            class=${classMap({
              'min-w-0 flex-shrink-0 rounded-full relative flex items-center justify-center p-s': true,
              'text-success bg-success-10': !!this.data?.is_active,
              'text-body bg-contrast-5': !!this.data?.end_date,
              'text-error bg-error-10': !!this.data?.first_failed_transaction_date,
            })}
          >
            <iron-icon
              icon=${this.data?.first_failed_transaction_date
                ? 'error-outline'
                : this.data?.end_date
                ? 'done-all'
                : 'done'}
            >
            </iron-icon>
          </div>

          <div class="flex-1 min-w-0 leading-s">
            <div class="text-body font-medium origin-top-left text-m">
              <foxy-i18n
                ns=${SubscriptionCard.__ns}
                key="transaction_summary"
                lang=${this.lang}
                options=${JSON.stringify(this.__getSummaryOptions())}
              >
              </foxy-i18n>
              &#8203;
            </div>

            <div
              class=${classMap({
                'text-s tracking-wide': true,
                'text-tertiary': !!this.data?.end_date,
                'text-success': !!this.data?.is_active,
                'text-error': !!this.data?.first_failed_transaction_date,
              })}
            >
              <foxy-i18n
                ns=${SubscriptionCard.__ns}
                key=${this.__getStatusKey()}
                lang=${this.lang}
                options=${JSON.stringify(this.__getStatusOptions())}
              >
              </foxy-i18n>
              &#8203;
            </div>
          </div>

          <div class="flex-1 font-medium text-right hidden text-body text-xl md-block font-tnum">
            <foxy-i18n
              lang=${this.lang}
              key="price_${this.data?.frequency === '.5m' ? 'twice_a_month' : 'recurring'}"
              ns=${SubscriptionCard.__ns}
              options=${JSON.stringify(this.__getPriceOptions())}
            >
            </foxy-i18n>
            &#8203;
          </div>
        </div>

        <div
          class=${classMap({
            'pointer-events-none absolute inset-0 flex items-center justify-center transition ease-in-out duration-150': true,
            'opacity-0': this.in({ idle: 'snapshot' }),
          })}
        >
          <foxy-spinner
            lang=${this.lang}
            state=${this.in('fail') ? 'error' : this.in({ idle: 'template' }) ? 'empty' : 'busy'}
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__removeBreakpoints?.();
  }

  private __getSummaryOptions() {
    if (!this.in({ idle: 'snapshot' })) return {};
    const items = this.data._embedded['fx:transaction_template']._embedded['fx:items'];

    return {
      most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
      count: items.length,
    };
  }

  private __getStatusOptions() {
    if (!this.in({ idle: 'snapshot' })) return {};
    return {
      date:
        this.data.first_failed_transaction_date ??
        this.data.end_date ??
        this.data.next_transaction_date,
    };
  }

  private __getPriceOptions() {
    if (!this.in({ idle: 'snapshot' })) return {};

    const transaction = this.data._embedded['fx:last_transaction'];
    const amount = `${transaction.total_order} ${transaction.currency_code}`;
    return { ...parseFrequency(this.data.frequency), amount };
  }

  private __getStatusKey() {
    if (this.data?.first_failed_transaction_date) return 'subscription_failed';

    if (this.data?.end_date) {
      const hasEnded = new Date(this.data.end_date).getTime() > Date.now();
      return hasEnded ? 'subscription_will_be_cancelled' : 'subscription_cancelled';
    }

    return 'subscription_active';
  }
}
