import { Data, Templates } from './types';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

const NS = 'coupon-card';
const Base = ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, NS)));

/**
 * Basic card displaying a coupon.
 *
 * @slot title:before
 * @slot title:after
 * @slot description:before
 * @slot description:after
 * @slot status:before
 * @slot status:after
 *
 * @element foxy-coupon-card
 * @since 1.15.0
 */
export class CouponCard extends Base<Data> {
  templates: Templates = {};

  render(): TemplateResult {
    const hiddenSelector = this.hiddenSelector;

    return html`
      <div
        aria-busy=${this.in('busy')}
        aria-live="polite"
        class="relative leading-m font-lumo text-m"
      >
        <div class=${classMap({ 'transition-opacity': true, 'opacity-0': !this.data })}>
          ${hiddenSelector.matches('title', true) ? '' : this.__renderTitle()}
          ${hiddenSelector.matches('description', true) ? '' : this.__renderDescription()}
          ${hiddenSelector.matches('status', true) ? '' : this.__renderStatus()}
        </div>

        <div
          class=${classMap({
            'pointer-events-none absolute inset-0 flex transition-opacity': true,
            'opacity-0': !!this.data,
          })}
        >
          <foxy-spinner
            data-testid="spinner"
            state=${this.in('fail') ? 'error' : this.in({ idle: 'template' }) ? 'empty' : 'busy'}
            class="m-auto"
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  private __renderTitle() {
    const count = this.data?.number_of_uses_to_date ?? 0;
    const total = this.data?.number_of_uses_allowed ?? 0;

    return html`
      <div>
        ${this.renderTemplateOrSlot('title:before')}

        <div class="flex items-center justify-between">
          <div class="font-semibold truncate">${this.data?.name}</div>

          <foxy-i18n
            options=${JSON.stringify({ count, total })}
            class="text-tertiary text-s flex-shrink-0"
            lang=${this.lang}
            key=${total === 0 ? 'uses_count' : 'uses_to_total_count'}
            ns=${this.ns}
          >
          </foxy-i18n>
        </div>

        ${this.renderTemplateOrSlot('title:after')}
      </div>
    `;
  }

  private __renderDescription() {
    let descriptions: TemplateResult[];

    if (this.data) {
      const methods = ['allunits', 'incremental', 'repeat', 'single'];
      const factor = this.data.coupon_discount_type.endsWith('_percentage') ? 0.01 : 1;
      const tiers = this.data.coupon_discount_details.split('|');
      const method = methods.includes(tiers[0]) ? tiers.shift() : 'single';
      const i18nKey = `${method}_${this.data.coupon_discount_type}_discount_summary`;

      descriptions = tiers.map((tier, index) => {
        const signIndex = /[-+]/.exec(tier)?.index ?? -1;
        const adjustment = parseFloat(tier.substring(signIndex)) * factor;
        const from = parseFloat(tier.substring(0, signIndex));

        return html`
          ${index === 0 ? '' : html`&bull;`}

          <foxy-i18n
            options=${JSON.stringify({ adjustment, from })}
            lang=${this.lang}
            key=${i18nKey}
            ns=${this.ns}
          >
          </foxy-i18n>
        `;
      });
    } else {
      descriptions = [html`&ZeroWidthSpace;`];
    }

    return html`
      <div>
        ${this.renderTemplateOrSlot('description:before')}
        <div class="truncate text-s text-secondary">${descriptions}</div>
        ${this.renderTemplateOrSlot('description:after')}
      </div>
    `;
  }

  private __renderStatus() {
    const { start_date: start, end_date: end } = this.data ?? {};
    const type = start && end ? 'complete' : start ? 'from' : end ? 'until' : 'any';

    return html`
      <div>
        ${this.renderTemplateOrSlot('status:before')}

        <foxy-i18n
          options=${JSON.stringify({ start, end })}
          class="block truncate text-s text-tertiary"
          lang=${this.lang}
          key="date_range_${type}"
          ns=${this.ns}
        >
        </foxy-i18n>

        ${this.renderTemplateOrSlot('status:after')}
      </div>
    `;
  }
}
