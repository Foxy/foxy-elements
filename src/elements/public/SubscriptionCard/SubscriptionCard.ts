import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { parseFrequency } from '../../../utils/parse-frequency';

const NS = 'subscription-card';
const Base = ResponsiveMixin(ThemeableMixin(TranslatableMixin(NucleonElement, NS)));

/**
 * Card element displaying subscription summary.
 *
 * @element foxy-subscription-card
 * @since 1.4.0
 */
export class SubscriptionCard extends Base<Data> {
  render(): TemplateResult {
    const isActive = !!this.data?.is_active;
    const isFailed = !!this.data?.first_failed_transaction_date;

    return html`
      <div class="relative text-left">
        <div
          class=${classMap({
            'flex items-start sm-items-center space-x-m transition duration-150 ease-in-out': true,
            'opacity-0': !this.in({ idle: 'snapshot' }),
          })}
        >
          <div
            class=${classMap({
              'min-w-0 flex-shrink-0 rounded-full relative flex items-center justify-center p-s':
                true,
              'text-success bg-success-10': isActive && !isFailed,
              'text-body bg-contrast-5': !isActive && !isFailed,
              'text-error bg-error-10': isFailed,
            })}
          >
            <iron-icon icon=${isFailed ? 'error-outline' : isActive ? 'done' : 'done-all'}>
            </iron-icon>
          </div>

          <div class="flex-1 min-w-0 leading-s flex flex-col sm-flex-row sm-items-center">
            <div class="order-1 sm-order-0">
              <div class="text-body font-medium origin-top-left text-l">
                <foxy-i18n
                  ns=${this.ns}
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
                  'text-tertiary': !isActive && !isFailed,
                  'text-success': isActive && !isFailed,
                  'text-error': isFailed,
                })}
              >
                <foxy-i18n
                  ns=${this.ns}
                  key=${this.__getStatusKey()}
                  lang=${this.lang}
                  options=${JSON.stringify(this.__getStatusOptions())}
                >
                </foxy-i18n>
                &#8203;
              </div>
            </div>

            <div
              class="flex-1 font-medium leading-xs mb-xs sm-mb-0 sm-text-right text-xxs sm-text-xl tracking-wide sm-tracking-normal uppercase sm-normal-case order-0 sm-order-1 font-tnum text-secondary sm-text-body"
            >
              <foxy-i18n
                lang=${this.lang}
                key="price_${this.data?.frequency === '.5m' ? 'twice_a_month' : 'recurring'}"
                ns=${this.ns}
                options=${JSON.stringify(this.__getPriceOptions())}
              >
              </foxy-i18n>
              &#8203;
            </div>
          </div>
        </div>

        <div
          class=${classMap({
            'pointer-events-none absolute inset-0 flex items-center justify-center transition ease-in-out duration-150':
              true,
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
