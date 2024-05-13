import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { Data } from './types';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { parseFrequency } from '../../../utils/parse-frequency';

const NS = 'subscription-card';
const Base = ConfigurableMixin(
  ResponsiveMixin(ThemeableMixin(TranslatableMixin(NucleonElement, NS)))
);

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
              'min-w-0 flex-shrink-0 rounded-full relative flex p-s': true,
              'text-success bg-success-10': isActive && !isFailed,
              'text-body bg-contrast-5': !isActive && !isFailed,
              'text-error bg-error-10': isFailed,
            })}
          >
            <iron-icon
              class="m-auto"
              icon=${isFailed ? 'error-outline' : isActive ? 'done' : 'done-all'}
            >
            </iron-icon>
          </div>

          <div class="flex-1 min-w-0 leading-xs flex flex-col sm-flex-row sm-items-center">
            <div class="order-1 sm-order-0">
              <div class="text-body font-medium origin-top-left text-m">
                <foxy-i18n
                  data-testid="summary"
                  options=${JSON.stringify(this.__getSummaryOptions())}
                  lang=${this.lang}
                  key="transaction_summary"
                  ns=${this.ns}
                >
                </foxy-i18n>
                &#8203;
              </div>

              <div
                class=${classMap({
                  'text-m': true,
                  'text-tertiary': !isActive && !isFailed,
                  'text-success': isActive && !isFailed,
                  'text-error': isFailed,
                })}
              >
                <foxy-i18n
                  data-testid="status"
                  options=${JSON.stringify(this.__getStatusOptions())}
                  lang=${this.lang}
                  key=${this.__getStatusKey()}
                  ns=${this.ns}
                >
                </foxy-i18n>
                &#8203;
              </div>
            </div>

            <div
              class="flex-1 leading-xs mb-xs sm-mb-0 sm-text-right order-0 sm-order-1"
            >
              <foxy-i18n
                data-testid="price"
                options=${JSON.stringify(this.__getPriceOptions())}
                class="text-xxs sm-text-l font-tnum tracking-wide sm-tracking-normal uppercase sm-normal-case font-medium text-secondary sm-text-body sm-block"
                lang=${this.lang}
                key="price_${this.data?.frequency === '.5m' ? 'twice_a_month' : 'recurring'}"
                ns=${this.ns}
              >
              </foxy-i18n>
              <span class="text-secondary font-medium sm-font-normal sm-block text-xxs sm-text-s">
                <span class="sm-hidden">(</span><span class="hidden sm-inline">*</span><foxy-i18n infer="" key="fees_hint"></foxy-i18n><span class="sm-hidden">)</span>
                <iron-icon id="hint" icon="icons:info-outline" class="icon-inline"></iron-icon>
                <vcf-tooltip for="hint" position="bottom">
                  <span class="text-s"><foxy-i18n infer="" key="fees_explainer"></foxy-i18n></span>
                </vcf-tooltip>
              <span>
              &#8203;
            </div>
          </div>
        </div>

        <div
          data-testid="spinner"
          class=${classMap({
            'pointer-events-none absolute inset-0 flex transition ease-in-out duration-150': true,
            'opacity-0': this.in({ idle: 'snapshot' }),
          })}
        >
          <foxy-spinner
            state=${this.in('fail') ? 'error' : this.in({ idle: 'template' }) ? 'empty' : 'busy'}
            class="m-auto"
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>

      ${this.renderTemplateOrSlot()}
    `;
  }

  private __getSummaryOptions() {
    if (this.data === null) return {};
    const items = this.data._embedded['fx:transaction_template']._embedded['fx:items'];

    return {
      most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
      count_minus_one: items.length - 1,
      count: items.length,
    };
  }

  private __getStatusOptions() {
    const data = this.data;

    if (data === null) return {};
    if (data.first_failed_transaction_date) return { date: data.first_failed_transaction_date };
    if (data.end_date) return { date: data.end_date };
    if (data.is_active === false) return {};
    if (new Date(data.start_date) > new Date()) return { date: data.start_date };

    return { date: data.next_transaction_date };
  }

  private __getPriceOptions() {
    if (this.data === null) return {};

    const cart = this.data._embedded['fx:transaction_template'];
    const amount = `${cart.total_order} ${cart.currency_code}`;
    return { ...parseFrequency(this.data.frequency), amount };
  }

  private __getStatusKey() {
    const data = this.data;

    if (data === null) return;
    if (data.first_failed_transaction_date) return 'subscription_failed';
    if (data.end_date) {
      const hasEnded = new Date(data.end_date).getTime() > Date.now();
      return hasEnded ? 'subscription_will_be_cancelled' : 'subscription_cancelled';
    }

    if (data.is_active === false) return 'subscription_inactive';
    if (new Date(data.start_date) > new Date()) return 'subscription_will_be_active';

    return 'subscription_active';
  }
}
