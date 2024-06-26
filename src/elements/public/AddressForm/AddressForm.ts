import type { Data, Templates } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { countries } from './countries';
import { html } from 'lit-html';

const NS = 'address-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Basic form displaying customer address.
 *
 * @slot address-name:before - **new in v1.4.0**
 * @slot address-name:after - **new in v1.4.0**
 *
 * @slot first-name:before - **new in v1.4.0**
 * @slot first-name:after - **new in v1.4.0**
 *
 * @slot last-name:before - **new in v1.4.0**
 * @slot last-name:after - **new in v1.4.0**
 *
 * @slot region:before - **new in v1.4.0**
 * @slot region:after - **new in v1.4.0**
 *
 * @slot city:before - **new in v1.4.0**
 * @slot city:after - **new in v1.4.0**
 *
 * @slot phone:before - **new in v1.4.0**
 * @slot phone:after - **new in v1.4.0**
 *
 * @slot company:before - **new in v1.4.0**
 * @slot company:after - **new in v1.4.0**
 *
 * @slot address-one:before - **new in v1.4.0**
 * @slot address-one:after - **new in v1.4.0**
 *
 * @slot address-two:before - **new in v1.4.0**
 * @slot address-two:after - **new in v1.4.0**
 *
 * @slot country:before - **new in v1.4.0**
 * @slot country:after - **new in v1.4.0**
 *
 * @slot postal-code:before - **new in v1.4.0**
 * @slot postal-code:after - **new in v1.4.0**
 *
 * @slot timestamps:before - **new in v1.4.0**
 * @slot timestamps:after - **new in v1.4.0**
 *
 * @slot create:before - **new in v1.4.0**
 * @slot create:after - **new in v1.4.0**
 *
 * @slot delete:before - **new in v1.4.0**
 * @slot delete:after - **new in v1.4.0**
 *
 * @element foxy-address-form
 * @since 1.2.0
 */
export class AddressForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ address_name: v }) => (v && v.length > 0) || 'address-name:v8n_required',
      ({ address_name: v }) => !v || v.length <= 100 || 'address-name:v8n_too_long',
      ({ first_name: v }) => !v || v.length <= 50 || 'first-name:v8n_too_long',
      ({ last_name: v }) => !v || v.length <= 50 || 'last-name:v8n_too_long',
      ({ region: v }) => !v || v.length <= 50 || 'region:v8n_too_long',
      ({ city: v }) => !v || v.length <= 50 || 'city:v8n_too_long',
      ({ phone: v }) => !v || v.length <= 50 || 'phone:v8n_too_long',
      ({ company: v }) => !v || v.length <= 50 || 'company:v8n_too_long',
      ({ address2: v }) => !v || v.length <= 100 || 'address-two:v8n_too_long',
      ({ address1: v }) => (v && v.length > 0) || 'address-one:v8n_required',
      ({ address1: v }) => !v || v.length <= 100 || 'address-one:v8n_too_long',
      ({ postal_code: v }) => !v || v.length <= 50 || 'postal-code:v8n_too_long',
    ];
  }

  templates: Templates = {};

  private __countrySetValue = (newValue: string) => {
    this.edit({ country: newValue, region: '' });
  };

  get readonlySelector(): BooleanSelector {
    const alwaysReadonly = [super.readonlySelector.toString()];
    const isDefault = !!this.data?.is_default_shipping || !!this.data?.is_default_billing;
    if (isDefault) alwaysReadonly.unshift('address-name');
    return new BooleanSelector(alwaysReadonly.join(' ').trim());
  }

  get disabledSelector(): BooleanSelector {
    const alwaysDisabled = [super.disabledSelector.toString()];
    const isDefault = !!this.data?.is_default_shipping || !!this.data?.is_default_billing;
    if (isDefault) alwaysDisabled.unshift('delete');
    return new BooleanSelector(alwaysDisabled.join(' ').trim());
  }

  renderBody(): TemplateResult {
    const regionOptions = this.__regionOptions;

    return html`
      <div class="grid grid-cols-2 gap-m">
        <foxy-internal-text-control class="col-span-2" infer="address-name">
        </foxy-internal-text-control>

        <foxy-internal-text-control infer="first-name"></foxy-internal-text-control>
        <foxy-internal-text-control infer="last-name"></foxy-internal-text-control>
        <foxy-internal-text-control infer="company"></foxy-internal-text-control>
        <foxy-internal-text-control infer="phone"></foxy-internal-text-control>

        <foxy-internal-text-control class="col-span-2" infer="address-one" property="address1">
        </foxy-internal-text-control>

        <foxy-internal-text-control class="col-span-2" infer="address-two" property="address2">
        </foxy-internal-text-control>

        <foxy-internal-select-control
          infer="country"
          .options=${this.__countryOptions}
          .setValue=${this.__countrySetValue}
        >
        </foxy-internal-select-control>

        ${regionOptions.length > 0
          ? html`
              <foxy-internal-select-control infer="region" .options=${regionOptions}>
              </foxy-internal-select-control>
            `
          : html`<foxy-internal-text-control infer="region"></foxy-internal-text-control>`}

        <foxy-internal-text-control infer="city"></foxy-internal-text-control>
        <foxy-internal-text-control infer="postal-code"></foxy-internal-text-control>
      </div>
      ${super.renderBody()}
    `;
  }

  private get __countryOptions() {
    return Object.keys(countries).map(code => ({
      label: this.t(`country_${code.toLowerCase()}`),
      value: code,
    }));
  }

  private get __regionOptions() {
    const country = this.form.country ?? '';
    const source = countries[country] ?? [];

    return source.map(code => ({
      label: this.t(`country_${country.toLowerCase()}_region_${code.toLowerCase()}`),
      value: code,
    }));
  }
}
