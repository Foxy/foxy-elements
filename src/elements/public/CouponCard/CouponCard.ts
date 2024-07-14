import { Data } from './types';
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
 * @element foxy-coupon-card
 * @since 1.15.0
 */
export class CouponCard extends Base<Data> {
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
      <div data-testid="title">
        ${this.renderTemplateOrSlot('title:before')}

        <div class="flex items-center justify-between">
          <div class="font-medium truncate">${this.data?.name ?? html`&ZeroWidthSpace;`}</div>

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
    let summary: TemplateResult | null = null;

    if (this.data) {
      const details = this.data.coupon_discount_details;
      const type = this.data.coupon_discount_type;
      const ns = this.ns;

      summary = html`
        <foxy-i18n
          options=${JSON.stringify({ params: { details, type, ns } })}
          lang=${this.lang}
          key="discount_summary"
          ns=${this.ns}
        >
        </foxy-i18n>
      `;
    }

    return html`
      <div data-testid="description">
        ${this.renderTemplateOrSlot('description:before')}
        <div class="truncate text-s text-secondary">${summary ?? html`&ZeroWidthSpace;`}</div>
        ${this.renderTemplateOrSlot('description:after')}
      </div>
    `;
  }

  private __renderStatus() {
    const { start_date: start, end_date: end } = this.data ?? {};
    const type = start && end ? 'complete' : start ? 'from' : end ? 'until' : 'any';

    return html`
      <div data-testid="status">
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
