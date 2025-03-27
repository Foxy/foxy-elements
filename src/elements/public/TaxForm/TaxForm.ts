import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'tax-form';
const Base = TranslatableMixin(InternalForm, NS);

// prettier-ignore
const defaultLiveRateCountries: (string | undefined)[] = ['US', 'CA', 'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IM', 'IT', 'LT', 'LU', 'LV', 'MC', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];
const taxJarLiveRateCountries = [...defaultLiveRateCountries, 'AU'];

/**
 * Form element for creating or editing taxes (`fx:tax`).
 *
 * @element foxy-tax-form
 * @since 1.13.0
 */
export class TaxForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      nativeIntegrations: { attribute: 'native-integrations' },
      itemCategories: { attribute: 'item-categories' },
      countries: {},
      regions: {},
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !!v || 'name:v8n_required',
      ({ name: v }) => !v || v.length <= 30 || 'name:v8n_too_long',
      ({ country: c, type: t }) => t !== 'country' || !!c || 'country:v8n_required',
      ({ country: c, type: t }) => t !== 'region' || !!c || 'country:v8n_required',
      ({ country: c, use_origin_rates: r }) => !r || !!c || 'country:v8n_required',
      ({ region: v, type: t }) => t != 'region' || !!v || 'region:v8n_required',
      ({ region: v }) => !v || v.length <= 20 || 'region:v8n_too_long',
      ({ city: v }) => !v || v.length <= 50 || 'city:v8n_too_long',
      ({ city: c, type: t }) => t != 'local' || !!c || 'city:v8n_required',
      ({ rate: v, type, is_live }) => {
        return (
          v === void 0 ||
          v > 0 ||
          // @ts-expect-error SDK types are not up to date.
          type === 'custom_tax_endpoint' ||
          type === void 0 ||
          is_live ||
          'rate:v8n_invalid'
        );
      },
    ];
  }

  /** URL of the `fx:native_integrations` collection for the store. */
  nativeIntegrations: string | null = null;

  /** URL of the `fx:item_categories` collection for the store. */
  itemCategories: string | null = null;

  /** URL of the `fx:countries` property helper resource. */
  countries: string | null = null;

  /** URL of the `fx:regions` property helper resource. */
  regions: string | null = null;

  private __countrySetValue = (newValue: string) => {
    this.edit({ country: newValue, region: '', city: '' });
    this.edit({ apply_to_shipping: this.__isApplyToShippingHidden });
  };

  private __regionSetValue = (newValue: string) => {
    this.edit({ region: newValue, city: '' });
  };

  private __typeSetValue = (newValue: Data['type']) => {
    this.edit({
      type: newValue,
      country: '',
      region: '',
      city: '',
      // @ts-expect-error SDK types are not up to date.
      service_provider: newValue === 'custom_tax_endpoint' ? 'custom_tax' : '',
      apply_to_shipping: false,
      use_origin_rates: false,
      exempt_all_customer_tax_ids: false,
      is_live: false,
      rate: 0,
    });
  };

  private readonly __typeOptions = JSON.stringify([
    { label: 'option_custom_tax_endpoint', value: 'custom_tax_endpoint' },
    { label: 'option_global', value: 'global' },
    { label: 'option_union', value: 'union' },
    { label: 'option_country', value: 'country' },
    { label: 'option_region', value: 'region' },
    { label: 'option_local', value: 'local' },
  ]);

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [super.readonlySelector.toString()];
    alwaysMatch.unshift('native-integrations');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];
    const type = this.form.type as string | undefined;

    if (type === 'global' || type === 'custom_tax_endpoint') {
      alwaysMatch.unshift('group-one:is-live', 'group-one:service-provider');
      if (type === 'custom_tax_endpoint') alwaysMatch.unshift('group-one:rate');
    } else {
      if (this.form.is_live) {
        alwaysMatch.unshift('group-one:rate');
      } else {
        alwaysMatch.unshift('group-one:service-provider');
      }
    }

    if (this.__nativeIntegrationsUrl === void 0) alwaysMatch.unshift('native-integrations');
    if (this.__isCountryHidden) alwaysMatch.unshift('group-three:country');
    if (this.__isRegionHidden) {
      alwaysMatch.unshift('group-three:region-select', 'group-three:region-input');
    }

    if (this.__isCityHidden) alwaysMatch.unshift('group-three:city');
    if (this.__isApplyToShippingHidden) alwaysMatch.unshift('group-two:apply-to-shipping');
    if (this.__isUseOriginRatesHidden) alwaysMatch.unshift('group-two:use-origin-rates');
    if (this.__isExemptAllCustomerTaxIdsHidden) {
      alwaysMatch.unshift('group-two:exempt-all-customer-tax-ids');
    }

    const regions = Object.values(this.__regionsLoader?.data?.values ?? {});
    alwaysMatch.unshift(`group-three:region-${regions.length ? 'input' : 'select'}`);

    if (!this.data || !this.itemCategories) alwaysMatch.unshift('item-categories');

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    const countries = Object.values(this.__countriesLoader?.data?.values ?? {});
    const countryOptions = countries.map(c => ({ rawLabel: c.default, value: c.cc2 }));

    const regions = Object.values(this.__regionsLoader?.data?.values ?? {});
    const regionOptions = regions.map(r => ({ rawLabel: r.default, value: r.code }));

    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="group-one">
        <foxy-internal-text-control layout="summary-item" infer="name"></foxy-internal-text-control>

        <foxy-internal-select-control
          options=${this.__typeOptions}
          layout="summary-item"
          infer="type"
          .setValue=${this.__typeSetValue}
        >
        </foxy-internal-select-control>

        <foxy-internal-switch-control infer="is-live"></foxy-internal-switch-control>

        <foxy-internal-select-control
          options=${JSON.stringify(this.__serviceProviderOptions)}
          layout="summary-item"
          infer="service-provider"
        >
        </foxy-internal-select-control>

        <foxy-internal-number-control layout="summary-item" suffix="%" infer="rate" min="0">
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      <foxy-internal-async-list-control
        infer="native-integrations"
        first=${ifDefined(this.__nativeIntegrationsUrl)}
        item="foxy-native-integration-card"
      >
      </foxy-internal-async-list-control>

      <foxy-internal-summary-control infer="group-two">
        <foxy-internal-switch-control infer="exempt-all-customer-tax-ids">
        </foxy-internal-switch-control>
        <foxy-internal-switch-control infer="apply-to-shipping"></foxy-internal-switch-control>
        <foxy-internal-switch-control infer="use-origin-rates"></foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="group-three">
        <foxy-internal-select-control
          options=${JSON.stringify(countryOptions)}
          layout="summary-item"
          infer="country"
          .setValue=${this.__countrySetValue}
        >
        </foxy-internal-select-control>

        <foxy-internal-select-control
          property="region"
          options=${JSON.stringify(regionOptions)}
          layout="summary-item"
          infer="region-select"
          .setValue=${this.__regionSetValue}
        >
        </foxy-internal-select-control>

        <foxy-internal-text-control
          property="region"
          layout="summary-item"
          infer="region-input"
          .setValue=${this.__regionSetValue}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="city"></foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-async-resource-link-list-control
        foreign-key-for-uri="item_category_uri"
        foreign-key-for-id="item_category_id"
        own-key-for-uri="tax_uri"
        own-uri=${ifDefined(this.data?._links.self.href)}
        options-href=${ifDefined(this.itemCategories ?? undefined)}
        links-href=${ifDefined(this.data?._links['fx:tax_item_categories'].href)}
        embed-key="fx:tax_item_categories"
        infer="item-categories"
        limit="5"
        item="foxy-item-category-card"
      >
      </foxy-internal-async-resource-link-list-control>

      ${super.renderBody()}

      <foxy-nucleon
        infer=""
        class="hidden"
        href=${ifDefined(this.countries ?? void 0)}
        id="countriesLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        infer=""
        class="hidden"
        href=${ifDefined(this.__regionsUrl)}
        id="regionsLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private get __serviceProviderOptions() {
    const options = [
      { label: 'option_avalara', value: 'avalara' },
      { label: 'option_onesource', value: 'onesource' },
    ];

    if (
      this.form.type === 'union' ||
      !this.form.country ||
      defaultLiveRateCountries.includes(this.form.country)
    ) {
      options.unshift({ label: 'option_default', value: '' });
    }

    if (
      this.form.type === 'union' ||
      !this.form.country ||
      taxJarLiveRateCountries.includes(this.form.country)
    ) {
      options.push({ label: 'option_taxjar', value: 'taxjar' });
    }

    return options;
  }

  private get __nativeIntegrationsUrl() {
    try {
      const url = new URL(this.nativeIntegrations ?? '');
      const provider = this.form.service_provider;
      if (provider) {
        url.searchParams.set('provider', provider);
        return url.toString();
      }
    } catch {
      // do nothing
    }
  }

  private get __regionsUrl() {
    try {
      const regionsURL = new URL(this.regions ?? '');
      const country = this.form.country;
      if (country) regionsURL.searchParams.set('country_code', country);
      return regionsURL.toString();
    } catch {
      // do nothing
    }
  }

  private get __countriesLoader() {
    type Loader = NucleonElement<Resource<Rels.Countries>>;
    return this.renderRoot.querySelector<Loader>('#countriesLoader');
  }

  private get __regionsLoader() {
    type Loader = NucleonElement<Resource<Rels.Regions>>;
    return this.renderRoot.querySelector<Loader>('#regionsLoader');
  }

  private get __isExemptAllCustomerTaxIdsHidden() {
    const type = this.form.type as string | undefined;
    if (type === 'custom_tax_endpoint') return true;
    if (type === 'country' || type === 'region' || type === 'local') return !!this.form.is_live;

    const provider = this.form.service_provider as string | undefined;
    return !provider || provider === 'onesource' || provider === 'avalara' || provider === 'taxjar';
  }

  private get __isApplyToShippingHidden() {
    const type = this.form.type as string | undefined;

    if (!type || type === 'custom_tax_endpoint') return true;
    if (type === 'union') return false;
    if (type === 'country' && this.form.is_live) return true;
    if (type === 'region' && this.form.is_live) return true;

    return !!this.form.is_live && defaultLiveRateCountries.includes(this.form.country);
  }

  private get __isUseOriginRatesHidden() {
    return this.form.type !== 'union' || !this.form.is_live || !!this.form.service_provider;
  }

  private get __isCountryHidden() {
    if (this.form.type === 'union') {
      return (!this.form.service_provider || this.form.is_live) && !this.form.use_origin_rates;
    } else {
      return !(['country', 'region', 'local'] as unknown[]).includes(this.form.type);
    }
  }

  private get __isRegionHidden() {
    return this.form.type !== 'local' && this.form.type !== 'region';
  }

  private get __isCityHidden() {
    return this.form.type !== 'local';
  }
}
