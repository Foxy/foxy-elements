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
            'flex items-start space-x-m transition duration-150 ease-in-out': true,
            'opacity-0': !this.in({ idle: 'snapshot' }),
          })}
        >
          <div
            style="width: calc(var(--lumo-font-size-m) * var(--lumo-line-height-xs) * 2); height: calc(var(--lumo-font-size-m) * var(--lumo-line-height-xs) * 2)"
            class=${classMap({
              'min-w-0 flex-shrink-0 rounded-full relative flex': true,
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

          <div class="flex-1 min-w-0 leading-xs flex flex-col gap-m sm-flex-row">
            <div>
              <div class="text-body font-medium origin-top-left text-m">
                <foxy-i18n
                  data-testid="summary"
                  infer=""
                  key="summary"
                  .options=${this.__getSummaryOptions()}
                >
                </foxy-i18n>
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
                  infer=""
                  key="status_${status}"
                  .options=${this.data}
                >
                </foxy-i18n>
              </div>
            </div>

            <div class="flex-1 leading-xs sm-text-right sm-flex-shrink-0 sm-whitespace-nowrap">
              <foxy-i18n
                data-testid="price"
                options=${JSON.stringify(this.__getPriceOptions())}
                class="text-l font-medium block"
                infer=""
                key="price${this.settings?.cart_display_config.show_sub_frequency ?? true
                  ? `_${this.data?.frequency === '.5m' ? 'twice_a_month' : 'recurring'}`
                  : ''}"
              >
              </foxy-i18n>

              <span class="text-secondary font-normal block text-s">
                <foxy-i18n infer="" key="fees_hint"></foxy-i18n>
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
            infer="spinner"
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
    const count = items.length;
    const context =
      count === 1
        ? 'one_item'
        : count === 2
        ? 'two_items'
        : count === 3
        ? 'three_items'
        : 'four_plus_items';

    return { items, count_minus_three: count - 3, context };
  }

  private __getPriceOptions() {
    if (this.data === null) return {};

    const cart = this.data._embedded['fx:transaction_template'];
    const amount = `${cart.total_order} ${cart.currency_code}`;
    return { ...parseFrequency(this.data.frequency), amount };
  }
}
