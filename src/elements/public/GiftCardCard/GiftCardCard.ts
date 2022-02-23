import { Data, Templates } from './types';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { parseDuration } from '../../../utils/parse-duration';

const NS = 'gift-card-card';
const Base = ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, NS)));

/**
 * Basic card displaying a gift card.
 *
 * @slot title:before
 * @slot title:after
 * @slot status:before
 * @slot status:after
 *
 * @element foxy-gift-card-card
 * @since 1.15.0
 */
export class GiftCardCard extends Base<Data> {
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
    const name = this.data?.name ?? html`&ZeroWidthSpace;`;
    const code = this.data?.currency_code ?? html`&ZeroWidthSpace;`;

    return html`
      <div>
        ${this.renderTemplateOrSlot('title:before')}

        <div class="flex items-center justify-between">
          <div class="font-semibold truncate">${name}</div>
          <div class="text-tertiary text-s flex-shrink-0">${code}</div>
        </div>

        ${this.renderTemplateOrSlot('title:after')}
      </div>
    `;
  }

  private __renderStatus() {
    let options: string;
    let key: string;

    if (this.data?.expires_after) {
      let value: string;

      try {
        const rtf = new Intl.RelativeTimeFormat(this.lang);
        let { count, units } = parseDuration(this.data.expires_after, true);

        if (count === 0.5 && units === 'month') {
          count = 2;
          units = 'week';
        }

        value = rtf.format(count, units as Intl.RelativeTimeFormatUnit);
      } catch {
        value = this.data.expires_after;
      }

      options = JSON.stringify({ value });
      key = 'expires_after_value';
    } else {
      options = '';
      key = 'never_expires';
    }

    return html`
      <div>
        ${this.renderTemplateOrSlot('status:before')}

        <foxy-i18n
          options=${options}
          class="block truncate text-s text-tertiary"
          lang=${this.lang}
          key=${key}
          ns=${this.ns}
        >
        </foxy-i18n>

        ${this.renderTemplateOrSlot('status:after')}
      </div>
    `;
  }
}
