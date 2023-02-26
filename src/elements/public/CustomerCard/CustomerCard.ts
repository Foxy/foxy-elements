import { Data, Templates } from './types';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

const NS = 'customer-card';
const Base = ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, NS)));

/**
 * Basic card displaying a customer record.
 *
 * @slot name:before
 * @slot name:after
 * @slot email:before
 * @slot email:after
 *
 * @element foxy-customer-card
 * @since 1.12.0
 */
class CustomerCard extends Base<Data> {
  templates: Templates = {};

  render(): TemplateResult {
    const hiddenSelector = this.hiddenSelector;

    return html`
      <div
        aria-busy=${this.in('busy')}
        aria-live="polite"
        class="relative leading-m font-lumo text-m"
      >
        <div
          class=${classMap({
            'leading-xs transition-opacity': true,
            'opacity-0': !this.data,
          })}
        >
          ${hiddenSelector.matches('name', true) ? '' : this.__renderName()}
          ${hiddenSelector.matches('email', true) ? '' : this.__renderEmail()}
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

  private __renderName() {
    const data = this.data;
    const name = `${data?.first_name ?? ''} ${data?.last_name ?? ''}`.trim() || '–';
    const content = data ? html`${name}` : html`&ZeroWidthSpace;`;

    let id: string;

    try {
      const url = new URL(this.data?._links.self.href ?? '');
      id = url.pathname.split('/').pop() ?? '';
    } catch {
      id = '';
    }

    return html`
      <div data-testid="name">
        ${this.renderTemplateOrSlot('name:before')}
        <div class="flex items-center gap-m">
          <div class="font-medium text-body truncate mr-auto">${content}</div>
          <div class="text-tertiary text-s">ID ${id}</div>
        </div>
        ${this.renderTemplateOrSlot('name:after')}
      </div>
    `;
  }

  private __renderEmail() {
    const data = this.data;
    const email = `${data?.email ?? ''}`.trim() || '–';
    const content = data ? html`${email}` : html`&ZeroWidthSpace;`;

    return html`
      <div data-testid="email">
        ${this.renderTemplateOrSlot('email:before')}
        <div class="text-secondary truncate text-s">${content}</div>
        ${this.renderTemplateOrSlot('email:after')}
      </div>
    `;
  }
}

export { CustomerCard };
