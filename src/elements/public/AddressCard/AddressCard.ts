import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { Data } from './types';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

const NS = 'address-card';
const Base = ConfigurableMixin(ThemeableMixin(TranslatableMixin(NucleonElement, NS)));

/**
 * Card element displaying a customer address.
 *
 * Configurable controls **(new in v1.4.0)**:
 *
 * - `address-name`
 * - `full-name`
 * - `full-address`
 * - `company`
 * - `phone`
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
  private readonly __renderAddressName = () => {
    const key = this.data?.is_default_billing
      ? 'default_billing_address'
      : this.data?.is_default_shipping
      ? 'default_shipping_address'
      : this.data?.address_name ?? '';

    return html`
      <div class="mb-s leading-none">
        <slot name="address-name:before"></slot>

        <span class="uppercase text-xxs font-medium text-secondary tracking-wider">
          <foxy-i18n lang=${this.lang} key=${key} ns=${this.ns}></foxy-i18n>
          &ZeroWidthSpace;
        </span>

        <slot name="address-name:after"></slot>
      </div>
    `;
  };

  private readonly __renderLine = (id: string, icon: string, text: TemplateResult) => {
    return html`
      <p>
        <slot name="${id}:before"></slot>

        <span class="flex items-center text-m space-x-s">
          <iron-icon icon=${icon} class="icon-inline flex-shrink-0"></iron-icon>
          <span class="truncate">${text}</span>
          &ZeroWidthSpace;
        </span>

        <slot name="${id}:after"></slot>
      </p>
    `;
  };

  private readonly __renderFullName = () => {
    const text = this.data
      ? html`
          <foxy-i18n
            ns=${this.ns}
            key="full_name"
            lang=${this.lang}
            options=${JSON.stringify(this.data)}
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
            ns=${this.ns}
            key="full_address"
            lang=${this.lang}
            data-testid="fullAddress"
            options=${JSON.stringify(this.data)}
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
            'transition duration-250 ease-in-out absolute inset-0 flex items-center justify-center': true,
            'opacity-0 pointer-events-none': isLoaded,
          })}
        >
          <foxy-spinner
            state=${this.in('fail') ? 'error' : isEmpty ? 'empty' : 'busy'}
            lang=${this.lang}
            ns=${this.ns}
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }
}
