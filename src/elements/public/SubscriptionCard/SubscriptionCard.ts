import type { PropertyDeclarations } from 'lit-element';
import type { Data, Settings } from './types';

import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { parseFrequency } from '../../../utils/parse-frequency';

import {
  getExtendedSubscriptionStatus,
  getSubscriptionStatus,
} from '../../../utils/get-subscription-status';

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
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      settings: { type: Object },
    };
  }

  settings: Settings | null = null;

  render(): TemplateResult {
    const status = this.settings
      ? getExtendedSubscriptionStatus(this.data, this.settings)
      : getSubscriptionStatus(this.data);

    const isRed = status === 'failed';
    const isGreen = status?.startsWith('next_payment') || !!status?.startsWith('will_end');
    const isNormal = !isGreen && !isRed;

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
              'text-success bg-success-10': isGreen,
              'text-body bg-contrast-5': isNormal,
              'text-error bg-error-10': isRed,
            })}
          >
            <iron-icon
              class="m-auto"
              icon=${isRed ? 'error-outline' : isGreen ? 'done' : 'done-all'}
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
                  'text-tertiary': isNormal,
                  'text-success': isGreen,
                  'text-error': isRed,
                })}
              >
                <foxy-i18n
                  data-testid="status"
                  lang=${this.lang}
                  key="status_${status}"
                  ns=${this.ns}
                  .options=${this.data}
                >
                </foxy-i18n>
                &#8203;
              </div>
            </div>

            <div class="flex-1 leading-xs mb-xs sm-mb-0 sm-text-right order-0 sm-order-1">
              <foxy-i18n
                data-testid="price"
                options=${JSON.stringify(this.__getPriceOptions())}
                class="text-xxs sm-text-l font-tnum tracking-wide sm-tracking-normal uppercase sm-normal-case font-medium text-secondary sm-text-body sm-block"
                lang=${this.lang}
                key="price${this.settings?.cart_display_config.show_sub_frequency ?? true
                  ? `_${this.data?.frequency === '.5m' ? 'twice_a_month' : 'recurring'}`
                  : ''}"
                ns=${this.ns}
              >
              </foxy-i18n>

              <span class="text-secondary font-medium sm-font-normal sm-block text-xxs sm-text-s">
                <span class="sm-hidden">(</span>
                <span class="hidden sm-inline">*</span>
                <foxy-i18n infer="" key="fees_hint"></foxy-i18n>
                <span class="sm-hidden">)</span>
                <iron-icon id="hint" icon="icons:info-outline" class="icon-inline"></iron-icon>
                <vcf-tooltip
                  position="bottom"
                  style="--lumo-base-color: black"
                  theme="light"
                  for="hint"
                >
                  <foxy-i18n
                    infer=""
                    class="text-s whitespace-nowrap"
                    style="color: white"
                    key="fees_explainer"
                  >
                  </foxy-i18n>
                </vcf-tooltip>
              </span>
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
      count_minus_one: items.length - 1,
      first_item: items[0],
      count: items.length,
    };
  }

  private __getPriceOptions() {
    if (this.data === null) return {};

    const cart = this.data._embedded['fx:transaction_template'];
    const amount = `${cart.total_order} ${cart.currency_code}`;
    return { ...parseFrequency(this.data.frequency), amount };
  }
}
