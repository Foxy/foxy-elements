import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Option } from '../../internal/InternalRadioGroupControl/types';
import type { Data } from './types';
import type { Item } from '../../internal/InternalEditableListControl/types';
import type { Rels } from '@foxy.io/sdk/backend';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-html';

import * as defaults from './defaults';
import memoize from 'lodash-es/memoize';

const NS = 'native-integration-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for configuring native integrations (`fx:native_integration`).
 *
 * @element foxy-native-integration-form
 * @since 1.25.0
 */
export class NativeIntegrationForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      itemCategoryBase: { attribute: 'item-category-base' },
      store: {},
    };
  }

  static get v8n(): NucleonV8N<Data> {
    const parse = memoize(JSON.parse);
    const isURL = memoize((value: string) => {
      try {
        return Boolean(new URL(value));
      } catch {
        return false;
      }
    });

    return [
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const url = parse(c).service_url;
        const err = url ? (isURL(url) ? null : 'v8n_invalid') : 'v8n_required';
        return p === 'avalara' && err ? `avalara-service-url:${err}` : true;
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        return p !== 'avalara' || !!parse(c).id || 'avalara-id:v8n_required';
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        return p !== 'avalara' || !!parse(c).key || 'avalara-key:v8n_required';
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        return p !== 'avalara' || !!parse(c).company_code || 'avalara-company-code:v8n_required';
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        return p !== 'taxjar' || !!parse(c).api_token || 'taxjar-api-token:v8n_required';
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const url = parse(c).service_url;
        const err = url ? (isURL(url) ? null : 'v8n_invalid') : 'v8n_required';
        return p === 'onesource' && err ? `onesource-service-url:${err}` : true;
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const prefix = 'onesource-external-company-id';
        return p !== 'onesource' || !!parse(c).external_company_id || `${prefix}:v8n_required`;
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const prefix = 'onesource-calling-system-number';
        return p !== 'onesource' || !!parse(c).calling_system_number || `${prefix}:v8n_required`;
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const prefix = 'onesource-from-city';
        return p !== 'onesource' || !!parse(c).from_city || `${prefix}:v8n_required`;
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const prefix = 'onesource-host-system';
        return p !== 'onesource' || !!parse(c).host_system || `${prefix}:v8n_required`;
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const { service: s, title: t } = parse(c);
        return p !== 'webhook' || s !== 'json' || !!t || 'webhook-json-title:v8n_required';
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const { service: s, encryption_key: e } = parse(c);
        return p !== 'webhook' || s !== 'json' || !!e || 'webhook-json-encryption-key:v8n_required';
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const { service: s, url: u } = parse(c);
        const err = u ? (isURL(u) ? null : 'v8n_invalid') : 'v8n_required';
        return p === 'webhook' && s === 'json' && err ? `webhook-json-url:${err}` : true;
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const { service: s, title: t } = parse(c);
        const err = 'webhook-legacy-xml-title:v8n_required';
        return p !== 'webhook' || s !== 'legacy_xml' || !!t || err;
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const { service: s, url: u } = parse(c);
        const err = u ? (isURL(u) ? null : 'v8n_invalid') : 'v8n_required';
        const prefix = 'webhook-legacy-xml-url';
        return p === 'webhook' && s === 'legacy_xml' && err ? `${prefix}:${err}` : true;
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        return p !== 'webflow' || !!parse(c).site_id || 'webflow-site-id:v8n_required';
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        return p !== 'webflow' || !!parse(c).site_name || 'webflow-site-name:v8n_required';
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        return p !== 'webflow' || !!parse(c).collection_id || 'webflow-collection-id:v8n_required';
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const err = 'webflow-collection-name:v8n_required';
        return p !== 'webflow' || !!parse(c).collection_name || err;
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        return p !== 'webflow' || !!parse(c).sku_field_id || 'webflow-sku-field-id:v8n_required';
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const err = 'webflow-sku-field-name:v8n_required';
        return p !== 'webflow' || !!parse(c).sku_field_name || err;
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const err = 'webflow-inventory-field-id:v8n_required';
        return p !== 'webflow' || !!parse(c).inventory_field_id || err;
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        const err = 'webflow-inventory-field-name:v8n_required';
        return p !== 'webflow' || !!parse(c).inventory_field_name || err;
      },
      ({ provider: p = 'avalara', config: c = '{}' }) => {
        return p !== 'webflow' || !!parse(c).auth || 'webflow-auth:v8n_required';
      },
    ];
  }

  itemCategoryBase: string | null = null;

  store: string | null = null;

  private readonly __createConfigGetterFor = memoize((key: string) => {
    return () => this.__config?.[key];
  });

  private readonly __createConfigSetterFor = memoize((key: string) => {
    return (value: unknown) => (this.__config = { [key]: value });
  });

  private readonly __providerGetValue = () => this.form.provider;

  private readonly __providerSetValue = (value: string) => {
    this.edit({ provider: value, config: '{}' });
    this.__config = {};
  };

  private readonly __templateProviderOptions: Option[] = [
    { value: 'avalara', label: 'option_avalara' },
    { value: 'onesource', label: 'option_onesource' },
    { value: 'taxjar', label: 'option_taxjar' },
    { value: 'custom_tax', label: 'option_custom_tax' },
  ];

  private readonly __avalaraAddressValidationCountriesOptions = [{ value: 'US' }, { value: 'CA' }];

  private readonly __onesourceCompanyRoleOptions = [
    { value: 'B', label: 'option_buyer' },
    { value: 'M', label: 'option_middleman' },
    { value: 'S', label: 'option_seller' },
  ];

  private readonly __onesourceProductOrderPriorityGetValue = () => {
    const value = this.__config?.product_order_priority.split(',') ?? [];
    return value.filter((v: string) => !!v).map((v: string) => ({ value: v }));
  };

  private readonly __onesourceProductOrderPrioritySetValue = (value: Item[]) => {
    this.__config = { product_order_priority: value.map(i => i.value).join(',') };
  };

  private readonly __onesourceAuditSettingsOptions = [
    { value: 'capture_only', label: 'option_capture_only' },
    { value: 'auth_and_capture', label: 'option_auth_and_capture' },
    { value: 'never', label: 'option_never' },
  ];

  private readonly __webhookServiceOptions = [
    { value: 'json', label: 'option_json' },
    { value: 'legacy_xml', label: 'option_legacy_xml' },
  ];

  private readonly __webhookJsonEventsOptions = [
    { value: 'transaction/created', label: 'option_transaction_created' },
    { value: 'subscription/cancelled', label: 'option_subscription_cancelled' },
  ];

  get readonlySelector(): BooleanSelector {
    const match = [super.readonlySelector.toString()];

    if (this.href) {
      match.push('apple-pay-group-one', 'zapier-group-one', 'provider-group-one');
    }

    return new BooleanSelector(match.join(' ').trim());
  }

  get headerTitleOptions(): Record<string, unknown> {
    return {
      context: this.data ? `existing_${this.data.provider}` : 'new',
      id: this.headerCopyIdValue,
    };
  }

  renderBody(): TemplateResult {
    const provider = this.form.provider;

    return html`
      ${this.renderHeader()}
      ${this.href
        ? ''
        : html`
            <foxy-internal-summary-control infer="provider-group-one">
              <foxy-internal-select-control
                layout="summary-item"
                infer="provider"
                .getValue=${this.__providerGetValue}
                .setValue=${this.__providerSetValue}
                .options=${this.__templateProviderOptions}
              >
              </foxy-internal-select-control>
            </foxy-internal-summary-control>
          `}
      ${provider === 'avalara'
        ? this.__renderAvalaraConfig()
        : provider === 'taxjar'
        ? this.__renderTaxJarConfig()
        : provider === 'onesource'
        ? this.__renderOneSourceConfig()
        : provider === 'webflow'
        ? this.__renderWebflowConfig()
        : provider === 'zapier'
        ? this.__renderZapierConfig()
        : provider === 'webhook'
        ? this.__renderWebhookConfig()
        : provider === 'apple_pay'
        ? this.__renderApplePayConfig()
        : provider === 'custom_tax'
        ? this.__renderCustomTaxConfig()
        : ''}
      ${super.renderBody()}

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.store ?? void 0)}
        id="storeLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  protected async _fetch<TResult = Data>(...args: Parameters<Window['fetch']>): Promise<TResult> {
    try {
      return await super._fetch(...args);
    } catch (err) {
      let message;

      try {
        message = (await (err as Response).json())._embedded['fx:errors'][0].message;
      } catch {
        throw err;
      }

      if (message.includes('has already been configured')) {
        throw ['error:already_configured'];
      } else {
        throw err;
      }
    }
  }

  private get __config() {
    try {
      return JSON.parse(this.form.config as string);
    } catch {
      return null;
    }
  }

  private set __config(value: any) {
    const config = this.__config;
    const provider = this.form.provider ?? 'avalara';
    const serializedDefaultConfig = (() => {
      if (provider === 'avalara') return defaults.avalara;
      if (provider === 'taxjar') return defaults.taxjar;
      if (provider === 'onesource') return defaults.onesource;
      if (provider === 'webflow') return defaults.webflow;
      if (provider === 'zapier') return defaults.zapier;
      if (provider === 'webhook') {
        if (config?.service === 'legacy_xml') return defaults.webhookLegacyXml;
        return defaults.webhookJson;
      }
    })();

    const defaultConfig = serializedDefaultConfig ? JSON.parse(serializedDefaultConfig) : {};
    const newConfig = JSON.stringify({ ...defaultConfig, ...config, ...value });
    this.edit({ provider, config: newConfig });
  }

  private __renderAvalaraConfig() {
    const isActive = this.__storeLoader?.data?.is_active;
    const itemCategories = this.__storeLoader?.data?._links['fx:item_categories'].href;
    const serviceUrlPlaceholder =
      typeof isActive === 'boolean'
        ? this.t(
            `avalara-group-one.avalara-service-url.placeholder_${isActive ? 'active' : 'inactive'}`
          )
        : void 0;

    return html`
      <foxy-internal-summary-control infer="avalara-group-one">
        <foxy-internal-text-control
          json-template=${defaults.avalara}
          placeholder=${ifDefined(serviceUrlPlaceholder)}
          json-path="service_url"
          property="config"
          layout="summary-item"
          infer="avalara-service-url"
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          json-template=${defaults.avalara}
          json-path="id"
          property="config"
          layout="summary-item"
          infer="avalara-id"
        >
        </foxy-internal-text-control>

        <foxy-internal-password-control
          json-template=${defaults.avalara}
          json-path="key"
          property="config"
          layout="summary-item"
          infer="avalara-key"
        >
        </foxy-internal-password-control>

        <foxy-internal-text-control
          json-template=${defaults.avalara}
          json-path="company_code"
          property="config"
          layout="summary-item"
          infer="avalara-company-code"
        >
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="avalara-group-two">
        <foxy-internal-switch-control
          json-template=${defaults.avalara}
          json-path="use_ava_tax"
          property="config"
          infer="avalara-use-ava-tax"
        >
        </foxy-internal-switch-control>

        <foxy-internal-switch-control
          json-template=${defaults.avalara}
          json-path="use_address_validation"
          property="config"
          infer="avalara-use-address-validation"
        >
        </foxy-internal-switch-control>

        ${this.__config?.use_address_validation
          ? html`
              <foxy-internal-editable-list-control
                json-template=${defaults.avalara}
                json-path="address_validation_countries"
                property="config"
                layout="summary-item"
                infer="avalara-address-validation-countries"
                .options=${this.__avalaraAddressValidationCountriesOptions}
              >
              </foxy-internal-editable-list-control>
            `
          : ''}

        <foxy-internal-switch-control
          json-template=${defaults.avalara}
          json-path="create_invoice"
          property="config"
          infer="avalara-create-invoice"
        >
        </foxy-internal-switch-control>

        <foxy-internal-switch-control
          json-template=${defaults.avalara}
          json-path="enable_colorado_delivery_fee"
          property="config"
          infer="avalara-enable-colorado-delivery-fee"
        >
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-native-integration-form-code-map-control
        item-category-base=${ifDefined(this.itemCategoryBase ?? void 0)}
        item-categories=${ifDefined(itemCategories)}
        json-template=${defaults.avalara}
        json-path="category_to_product_tax_code_mappings"
        property="config"
        layout="summary-item"
        infer="avalara-category-to-product-tax-code-mappings"
      >
      </foxy-internal-native-integration-form-code-map-control>
    `;
  }

  private __renderTaxJarConfig() {
    const itemCategories = this.__storeLoader?.data?._links['fx:item_categories'].href;

    return html`
      <foxy-internal-summary-control infer="taxjar-group-one">
        <foxy-internal-password-control
          json-template=${defaults.taxjar}
          json-path="api_token"
          property="config"
          layout="summary-item"
          infer="taxjar-api-token"
        >
        </foxy-internal-password-control>

        <foxy-internal-switch-control
          json-template=${defaults.taxjar}
          json-path="create_invoice"
          property="config"
          infer="taxjar-create-invoice"
        >
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-native-integration-form-code-map-control
        item-category-base=${ifDefined(this.itemCategoryBase ?? void 0)}
        item-categories=${ifDefined(itemCategories)}
        json-template=${defaults.taxjar}
        json-path="category_to_product_tax_code_mappings"
        property="config"
        infer="taxjar-category-to-product-tax-code-mappings"
      >
      </foxy-internal-native-integration-form-code-map-control>
    `;
  }

  private __renderOneSourceConfig() {
    return html`
      <foxy-internal-summary-control infer="onesource-group-one">
        <foxy-internal-text-control
          json-template=${defaults.onesource}
          json-path="service_url"
          property="config"
          layout="summary-item"
          infer="onesource-service-url"
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          json-template=${defaults.onesource}
          json-path="external_company_id"
          property="config"
          layout="summary-item"
          infer="onesource-external-company-id"
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          json-template=${defaults.onesource}
          json-path="from_city"
          property="config"
          layout="summary-item"
          infer="onesource-from-city"
        >
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="onesource-group-two">
        <foxy-internal-text-control
          json-template=${defaults.onesource}
          json-path="calling_system_number"
          property="config"
          layout="summary-item"
          infer="onesource-calling-system-number"
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          json-template=${defaults.onesource}
          json-path="host_system"
          property="config"
          layout="summary-item"
          infer="onesource-host-system"
        >
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="onesource-group-three">
        <foxy-internal-select-control
          json-template=${defaults.onesource}
          json-path="audit_settings"
          property="config"
          layout="summary-item"
          infer="onesource-audit-settings"
          .options=${this.__onesourceAuditSettingsOptions}
        >
        </foxy-internal-select-control>

        <foxy-internal-select-control
          json-template=${defaults.onesource}
          json-path="company_role"
          property="config"
          layout="summary-item"
          infer="onesource-company-role"
          .options=${this.__onesourceCompanyRoleOptions}
        >
        </foxy-internal-select-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="onesource-group-four">
        <foxy-internal-text-control
          json-template=${defaults.onesource}
          json-path="part_number_product_option"
          property="config"
          layout="summary-item"
          infer="onesource-part-number-product-option"
          .getValue=${this.__createConfigGetterFor('part_number_product_option')}
          .setValue=${this.__createConfigSetterFor('part_number_product_option')}
        >
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="onesource-group-five">
        <foxy-internal-editable-list-control
          layout="summary-item"
          infer="onesource-product-order-priority"
          .getValue=${this.__onesourceProductOrderPriorityGetValue}
          .setValue=${this.__onesourceProductOrderPrioritySetValue}
        >
        </foxy-internal-editable-list-control>
      </foxy-internal-summary-control>
    `;
  }

  private __renderWebhookConfig() {
    return html`
      <div
        class="flex items-start border border-error rounded"
        style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px); gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
      >
        ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="flex-shrink-0 text-error" style="width: 1.25em"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>`}
        <p>
          <foxy-i18n infer="webhook-warning" key="warning_text"></foxy-i18n>
          <br />
          <a
            target="_blank"
            class="mt-xs inline-block rounded font-medium text-error transition-colors cursor-pointer hover-opacity-80 focus-outline-none focus-ring-2 focus-ring-primary-50"
            href="https://admin.foxycart.com"
          >
            <foxy-i18n infer="webhook-warning" key="link_text"></foxy-i18n>
          </a>
        </p>
      </div>

      ${this.__config?.service === 'json'
        ? this.__renderWebhookJsonConfig()
        : this.__config?.service === 'legacy_xml'
        ? this.__renderWebhookLegacyXmlConfig()
        : ''}
    `;
  }

  private __renderWebhookJsonConfig() {
    return html`
      <foxy-internal-summary-control infer="webhook-json-group-one">
        <foxy-internal-text-control
          json-template=${defaults.webhookJson}
          json-path="title"
          property="config"
          layout="summary-item"
          infer="webhook-json-title"
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          json-template=${defaults.webhookJson}
          json-path="url"
          property="config"
          layout="summary-item"
          infer="webhook-json-url"
        >
        </foxy-internal-text-control>

        <foxy-internal-select-control
          json-template=${defaults.webhookJson}
          json-path="service"
          property="config"
          layout="summary-item"
          infer="webhook-service"
          .options=${this.__webhookServiceOptions}
        >
        </foxy-internal-select-control>

        <foxy-internal-password-control
          json-template=${defaults.webhookJson}
          json-path="encryption_key"
          property="config"
          layout="summary-item"
          infer="webhook-json-encryption-key"
        >
        </foxy-internal-password-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="webhook-json-group-two">
        ${this.__webhookJsonEventsOptions.map(option => {
          return html`
            <foxy-internal-switch-control
              infer=${`webhook-json-events-${option.value.replace(/\//g, '-')}`}
              .getValue=${() => this.__config?.events?.includes(option.value)}
              .setValue=${(value: boolean) => {
                const events = this.__config?.events ?? [];
                this.__config = {
                  events: value
                    ? [...events, option.value]
                    : events.filter((v: string) => v !== option.value),
                };
              }}
            >
            </foxy-internal-switch-control>
          `;
        })}
      </foxy-internal-summary-control>
    `;
  }

  private __renderWebhookLegacyXmlConfig() {
    return html`
      <foxy-internal-summary-control infer="webhook-legacy-xml-group-one">
        <foxy-internal-text-control
          json-template=${defaults.webhookLegacyXml}
          json-path="title"
          property="config"
          layout="summary-item"
          infer="webhook-legacy-xml-title"
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          json-template=${defaults.webhookLegacyXml}
          json-path="url"
          property="config"
          layout="summary-item"
          infer="webhook-legacy-xml-url"
        >
        </foxy-internal-text-control>

        <foxy-internal-select-control
          json-template=${defaults.webhookLegacyXml}
          json-path="service"
          property="config"
          layout="summary-item"
          infer="webhook-service"
          .options=${this.__webhookServiceOptions}
        >
        </foxy-internal-select-control>
      </foxy-internal-summary-control>
    `;
  }

  private __renderWebflowConfig() {
    return html`
      <foxy-internal-summary-control infer="webflow-group-one">
        <foxy-internal-text-control
          json-template=${defaults.webflow}
          json-path="site_id"
          property="config"
          layout="summary-item"
          infer="webflow-site-id"
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          json-template=${defaults.webflow}
          json-path="site_name"
          property="config"
          layout="summary-item"
          infer="webflow-site-name"
        >
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="webflow-group-two">
        <foxy-internal-text-control
          json-template=${defaults.webflow}
          json-path="collection_id"
          property="config"
          layout="summary-item"
          infer="webflow-collection-id"
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          json-template=${defaults.webflow}
          json-path="collection_name"
          property="config"
          layout="summary-item"
          infer="webflow-collection-name"
        >
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="webflow-group-three">
        <foxy-internal-text-control
          json-template=${defaults.webflow}
          json-path="sku_field_id"
          property="config"
          layout="summary-item"
          infer="webflow-sku-field-id"
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          json-template=${defaults.webflow}
          json-path="sku_field_name"
          property="config"
          layout="summary-item"
          infer="webflow-sku-field-name"
        >
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="webflow-group-four">
        <foxy-internal-text-control
          json-template=${defaults.webflow}
          json-path="inventory_field_id"
          property="config"
          layout="summary-item"
          infer="webflow-inventory-field-id"
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          json-template=${defaults.webflow}
          json-path="inventory_field_name"
          property="config"
          layout="summary-item"
          infer="webflow-inventory-field-name"
        >
        </foxy-internal-text-control>
      </foxy-internal-summary-control>
    `;
  }

  private __renderZapierConfig() {
    return html`
      <foxy-internal-summary-control infer="zapier-group-one">
        <foxy-internal-text-control
          json-template=${defaults.zapier}
          json-path="url"
          property="config"
          layout="summary-item"
          infer="zapier-url"
        >
        </foxy-internal-text-control>

        <foxy-internal-editable-list-control
          json-template=${defaults.zapier}
          json-path="events"
          property="config"
          layout="summary-item"
          infer="zapier-events"
          simple-value
        >
        </foxy-internal-editable-list-control>

        <p class="text-secondary leading-xs">
          <foxy-i18n infer="zapier-warning" key="warning_text"></foxy-i18n>
        </p>
      </foxy-internal-summary-control>
    `;
  }

  private __renderApplePayConfig() {
    return html`
      <foxy-internal-summary-control infer="apple-pay-group-one">
        <foxy-internal-text-control
          json-template=${defaults.applePay}
          json-path="merchantID"
          property="config"
          layout="summary-item"
          infer="apple-pay-merchant-id"
        >
        </foxy-internal-text-control>

        <p class="text-secondary leading-xs">
          <foxy-i18n infer="apple-pay-warning" key="warning_text"></foxy-i18n>
        </p>
      </foxy-internal-summary-control>
    `;
  }

  private __renderCustomTaxConfig() {
    return html`
      <foxy-internal-summary-control infer="custom-tax-group-one">
        <foxy-internal-text-control
          json-template=${defaults.customTax}
          json-path="url"
          property="config"
          layout="summary-item"
          infer="custom-tax-url"
        >
        </foxy-internal-text-control>
      </foxy-internal-summary-control>
    `;
  }

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>('#storeLoader');
  }
}
