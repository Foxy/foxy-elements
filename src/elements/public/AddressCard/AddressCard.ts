import { Data, Templates } from './types';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

const NS = 'address-card';
const Base = ConfigurableMixin(ThemeableMixin(TranslatableMixin(NucleonElement, NS)));

/**
 * Card element displaying a customer address.
 *
 * @slot address-name:before - **new in v1.4.0**
 * @slot address-name:after - **new in v1.4.0**
 *
 * @slot full-name:before - **new in v1.4.0**
 * @slot full-name:after - **new in v1.4.0**
 *
 * @slot full-address:before - **new in v1.4.0**
 * @slot full-address:after - **new in v1.4.0**
 *
 * @slot company:before - **new in v1.4.0**
 * @slot company:after - **new in v1.4.0**
 *
 * @slot phone:before - **new in v1.4.0**
 * @slot phone:after - **new in v1.4.0**
 *
 * @element foxy-address-card
 * @since 1.2.0
 */
export class AddressCard extends Base<Data> {
  templates: Templates = {};

  private readonly __renderAddressName = () => {
    const isDefaultBilling = !!this.data?.is_default_billing;
    const isDefaultShipping = !!this.data?.is_default_shipping;

    return html`
      <div class="mb-s leading-none">
        ${this.renderTemplateOrSlot('address-name:before')}

        <span class="font-medium">
          ${isDefaultBilling || isDefaultShipping
            ? html`
                <foxy-i18n
                  data-testid="address-name"
                  lang=${this.lang}
                  key="default_${isDefaultBilling ? 'billing' : 'shipping'}_address"
                  ns=${this.ns}
                >
                </foxy-i18n>
              `
            : html`<span data-testid="address-name">${this.data?.address_name}</span>`}
          &ZeroWidthSpace;
        </span>

        ${this.renderTemplateOrSlot('address-name:after')}
      </div>
    `;
  };

  private readonly __renderLine = (id: string, icon: string, text: TemplateResult) => {
    return html`
      <p>
        ${this.renderTemplateOrSlot(`${id}:before`)}

        <span class="flex items-center text-m space-x-s text-secondary">
          <iron-icon icon=${icon} class="icon-inline flex-shrink-0"></iron-icon>
          <span class="truncate" data-testid=${id}>${text}</span>
          &ZeroWidthSpace;
        </span>

        ${this.renderTemplateOrSlot(`${id}:after`)}
      </p>
    `;
  };

  private readonly __renderFullName = () => {
    const text = this.data
      ? html`
          <foxy-i18n
            options=${JSON.stringify(this.data)}
            lang=${this.lang}
            key="full_name"
            ns=${this.ns}
          >
          </foxy-i18n>
        `
      : html`–`;

    return this.__renderLine('full-name', 'social:person', text);
  };

  private readonly __renderFullAddress = () => {
    const text = this.data
      ? html`
          <foxy-i18n
            data-testid="full-address"
            options=${JSON.stringify(this.data)}
            lang=${this.lang}
            key="full_address"
            ns=${this.ns}
          >
          </foxy-i18n>
        `
      : html`–`;

    return this.__renderLine('full-address', 'maps:place', text);
  };

  private readonly __renderCompany = () => {
    const text = html`${this.data?.company || '–'}`;
    return this.__renderLine('company', 'icons:work', text);
  };

  private readonly __renderPhone = () => {
    const text = html`${this.data?.phone || '–'}`;
    return this.__renderLine('phone', 'maps:local-phone', text);
  };

  render(): TemplateResult {
    const hiddenSelector = this.hiddenSelector;
    const isLoaded = this.in({ idle: 'snapshot' });
    const isEmpty = this.in({ idle: 'template' });
    const isBusy = this.in('busy');

    return html`
      <div
        class="relative h-full text-left text-m leading-m font-lumo text-body"
        aria-live="polite"
        aria-busy=${isBusy}
        data-testid="wrapper"
      >
        <div
          class=${classMap({
            'transition duration-250 ease-in-out': true,
            'opacity-0 pointer-events-none': !isLoaded,
          })}
        >
          ${hiddenSelector.matches('address-name', true) ? '' : this.__renderAddressName()}
          ${hiddenSelector.matches('full-name', true) ? '' : this.__renderFullName()}
          ${hiddenSelector.matches('full-address', true) ? '' : this.__renderFullAddress()}
          ${hiddenSelector.matches('company', true) ? '' : this.__renderCompany()}
          ${hiddenSelector.matches('phone', true) ? '' : this.__renderPhone()}
        </div>

        <div
          class=${classMap({
            'transition duration-250 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': isLoaded,
          })}
        >
          <foxy-spinner
            data-testid="spinner"
            state=${this.in('fail') ? 'error' : isEmpty ? 'empty' : 'busy'}
            class="m-auto"
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }
}
