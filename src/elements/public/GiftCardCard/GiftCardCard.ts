import { Data, Templates } from './types';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

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
        class="relative leading-s font-lumo text-m"
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
      <div data-testid="title">
        ${this.renderTemplateOrSlot('title:before')}

        <div class="flex items-center justify-between">
          <div class="font-medium truncate">${name}</div>
          <div class="text-tertiary uppercase text-s flex-shrink-0">${code}</div>
        </div>

        ${this.renderTemplateOrSlot('title:after')}
      </div>
    `;
  }

  private __renderStatus() {
    const expiresAfter = this.data?.expires_after;

    return html`
      <div data-testid="status">
        ${this.renderTemplateOrSlot('status:before')}

        <foxy-i18n
          options=${JSON.stringify({ value: expiresAfter })}
          class="block truncate text-s text-secondary"
          lang=${this.lang}
          key=${expiresAfter ? 'expires_after_value' : 'never_expires'}
          ns=${this.ns}
        >
        </foxy-i18n>

        ${this.renderTemplateOrSlot('status:after')}
      </div>
    `;
  }
}
