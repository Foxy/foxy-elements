import type { Data } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Option } from '../../internal/InternalRadioGroupControl/types';
import type { Item } from '../../internal/InternalEditableListControl/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

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
        if (p !== 'avalara') return true;
        const mappings = parse(c).category_to_product_tax_code_mappings;
        const err = 'avalara-category-to-product-tax-code-mappings:v8n_required';
        return (mappings && Object.entries(mappings).length > 0) || err;
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

  private readonly __createConfigGetterFor = memoize((key: string) => {
    return () => this.__config?.[key];
  });

  private readonly __createConfigSetterFor = memoize((key: string) => {
    return (value: unknown) => (this.__config = { [key]: value });
  });

  private readonly __providerGetValue = () => {
    return this.form.provider ?? 'avalara';
  };

  private readonly __providerSetValue = (value: string) => {
    this.edit({ provider: value, config: '{}' });
    this.__config = {};
  };

  private readonly __templateProviderOptions: Option[] = [
    { value: 'avalara', label: 'option_avalara' },
    { value: 'onesource', label: 'option_onesource' },
    { value: 'taxjar', label: 'option_taxjar' },
  ];

  private readonly __avalaraConfigOptions: Option[] = [
    {
      value: 'use_ava_tax',
      label: 'option_use_ava_tax',
    },
    {
      value: 'enable_colorado_delivery_fee',
      label: 'option_enable_colorado_delivery_fee',
    },
    {
      value: 'create_invoice',
      label: 'option_create_invoice',
    },
    {
      value: 'use_address_validation',
      label: 'option_use_address_validation',
    },
  ];

  private readonly __taxjarConfigOptions: Option[] = [
    {
      value: 'create_invoice',
      label: 'option_create_invoice',
    },
  ];

  private readonly __configOptionsGetValue = () => {
    const config = this.__config;
    const value: string[] = [];

    if (config?.enable_colorado_delivery_fee) value.push('enable_colorado_delivery_fee');
    if (config?.use_address_validation) value.push('use_address_validation');
    if (config?.create_invoice) value.push('create_invoice');
    if (config?.use_ava_tax) value.push('use_ava_tax');

    return value;
  };

  private readonly __configOptionsSetValue = (value: string[]) => {
    this.__config = {
      enable_colorado_delivery_fee: value.includes('enable_colorado_delivery_fee'),
      use_address_validation: value.includes('use_address_validation'),
      create_invoice: value.includes('create_invoice'),
      use_ava_tax: value.includes('use_ava_tax'),
    };
  };

  private readonly __avalaraAddressValidationCountriesOptions = [
    { value: 'US', label: 'option_US' },
    { value: 'CA', label: 'option_CA' },
  ];

  private readonly __codeMappingsGetValue = () => {
    const mappings = this.__config?.category_to_product_tax_code_mappings ?? {};
    return Object.entries(mappings).map(([foxyCategory, vndTaxCode]) => {
      return { value: `${foxyCategory}:${vndTaxCode}` };
    });
  };

  private readonly __codeMappingsSetValue = (value: Item[]) => {
    const mappings: Record<string, string> = {};

    for (const { value: mapping } of value) {
      const [foxyCategory, vndTaxCode] = mapping.split(':');
      if (foxyCategory && vndTaxCode) mappings[foxyCategory] = vndTaxCode;
    }

    this.__config = { category_to_product_tax_code_mappings: mappings };
  };

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
      match.push(
        'apple-pay-merchant-id',
        'custom-tax-url',
        'zapier-events',
        'zapier-url',
        'provider'
      );
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
    const provider = this.form.provider ?? 'avalara';

    return html`
      ${this.renderHeader()}
      ${this.href
        ? ''
        : html`
            <foxy-internal-radio-group-control
              infer="provider"
              .getValue=${this.__providerGetValue}
              .setValue=${this.__providerSetValue}
              .options=${this.__templateProviderOptions}
            >
            </foxy-internal-radio-group-control>
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
    const defaultConfig = (() => {
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

    const newConfig = JSON.stringify({ ...defaultConfig, ...config, ...value });
    this.edit({ provider, config: newConfig });
  }

  private __renderAvalaraConfig() {
    return html`
      <foxy-internal-text-control
        infer="avalara-service-url"
        .getValue=${this.__createConfigGetterFor('service_url')}
        .setValue=${this.__createConfigSetterFor('service_url')}
      >
      </foxy-internal-text-control>

      <foxy-internal-text-control
        infer="avalara-id"
        .getValue=${this.__createConfigGetterFor('id')}
        .setValue=${this.__createConfigSetterFor('id')}
      >
      </foxy-internal-text-control>

      <foxy-internal-password-control
        infer="avalara-key"
        .getValue=${this.__createConfigGetterFor('key')}
        .setValue=${this.__createConfigSetterFor('key')}
      >
      </foxy-internal-password-control>

      <foxy-internal-text-control
        infer="avalara-company-code"
        .getValue=${this.__createConfigGetterFor('company_code')}
        .setValue=${this.__createConfigSetterFor('company_code')}
      >
      </foxy-internal-text-control>

      <foxy-internal-editable-list-control
        infer="avalara-category-to-product-tax-code-mappings"
        .getValue=${this.__codeMappingsGetValue}
        .setValue=${this.__codeMappingsSetValue}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-checkbox-group-control
        infer="avalara-options"
        .getValue=${this.__configOptionsGetValue}
        .setValue=${this.__configOptionsSetValue}
        .options=${this.__avalaraConfigOptions}
      >
      </foxy-internal-checkbox-group-control>

      ${this.__config?.use_address_validation
        ? html`
            <foxy-internal-checkbox-group-control
              infer="avalara-address-validation-countries"
              .getValue=${this.__createConfigGetterFor('address_validation_countries')}
              .setValue=${this.__createConfigSetterFor('address_validation_countries')}
              .options=${this.__avalaraAddressValidationCountriesOptions}
            >
            </foxy-internal-checkbox-group-control>
          `
        : ''}
    `;
  }

  private __renderTaxJarConfig() {
    return html`
      <foxy-internal-password-control
        infer="taxjar-api-token"
        .getValue=${this.__createConfigGetterFor('api_token')}
        .setValue=${this.__createConfigSetterFor('api_token')}
      >
      </foxy-internal-password-control>

      <foxy-internal-editable-list-control
        infer="taxjar-category-to-product-tax-code-mappings"
        .getValue=${this.__codeMappingsGetValue}
        .setValue=${this.__codeMappingsSetValue}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-checkbox-group-control
        infer="taxjar-options"
        .getValue=${this.__configOptionsGetValue}
        .setValue=${this.__configOptionsSetValue}
        .options=${this.__taxjarConfigOptions}
      >
      </foxy-internal-checkbox-group-control>
    `;
  }

  private __renderOneSourceConfig() {
    return html`
      <foxy-internal-text-control
        infer="onesource-service-url"
        .getValue=${this.__createConfigGetterFor('service_url')}
        .setValue=${this.__createConfigSetterFor('service_url')}
      >
      </foxy-internal-text-control>

      <foxy-internal-text-control
        infer="onesource-external-company-id"
        .getValue=${this.__createConfigGetterFor('external_company_id')}
        .setValue=${this.__createConfigSetterFor('external_company_id')}
      >
      </foxy-internal-text-control>

      <foxy-internal-text-control
        infer="onesource-calling-system-number"
        .getValue=${this.__createConfigGetterFor('calling_system_number')}
        .setValue=${this.__createConfigSetterFor('calling_system_number')}
      >
      </foxy-internal-text-control>

      <foxy-internal-text-control
        infer="onesource-from-city"
        .getValue=${this.__createConfigGetterFor('from_city')}
        .setValue=${this.__createConfigSetterFor('from_city')}
      >
      </foxy-internal-text-control>

      <foxy-internal-text-control
        infer="onesource-host-system"
        .getValue=${this.__createConfigGetterFor('host_system')}
        .setValue=${this.__createConfigSetterFor('host_system')}
      >
      </foxy-internal-text-control>

      <foxy-internal-radio-group-control
        infer="onesource-company-role"
        .getValue=${this.__createConfigGetterFor('company_role')}
        .setValue=${this.__createConfigSetterFor('company_role')}
        .options=${this.__onesourceCompanyRoleOptions}
      >
      </foxy-internal-radio-group-control>

      <foxy-internal-text-control
        infer="onesource-part-number-product-option"
        .getValue=${this.__createConfigGetterFor('part_number_product_option')}
        .setValue=${this.__createConfigSetterFor('part_number_product_option')}
      >
      </foxy-internal-text-control>

      <foxy-internal-editable-list-control
        infer="onesource-product-order-priority"
        .getValue=${this.__onesourceProductOrderPriorityGetValue}
        .setValue=${this.__onesourceProductOrderPrioritySetValue}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-radio-group-control
        infer="onesource-audit-settings"
        .getValue=${this.__createConfigGetterFor('audit_settings')}
        .setValue=${this.__createConfigSetterFor('audit_settings')}
        .options=${this.__onesourceAuditSettingsOptions}
      >
      </foxy-internal-radio-group-control>
    `;
  }

  private __renderWebhookConfig() {
    return html`
      <p
        style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
        class="rounded bg-error-10 text-error font-medium"
      >
        <foxy-i18n infer="webhook-warning" key="warning_text"></foxy-i18n>
        <br />
        <br />
        <a
          target="_blank"
          class="text-body rounded hover-underline hover-cursor-pointer focus-outline-none focus-ring-2 focus-ring-error-50"
          lang="en"
          rel="noopener"
          href="https://www.foxy.io/blog/new-feature-json-webhook/"
        >
          <foxy-i18n infer="webhook-warning" key="link_text"></foxy-i18n>
        </a>
      </p>

      ${this.__config?.service === 'json'
        ? this.__renderWebhookJsonConfig()
        : this.__config?.service === 'legacy_xml'
        ? this.__renderWebhookLegacyXmlConfig()
        : ''}
    `;
  }

  private __renderWebhookJsonConfig() {
    return html`
      <foxy-internal-text-control
        infer="webhook-json-title"
        .getValue=${this.__createConfigGetterFor('title')}
        .setValue=${this.__createConfigSetterFor('title')}
      >
      </foxy-internal-text-control>

      <foxy-internal-text-area-control
        infer="webhook-json-url"
        .getValue=${this.__createConfigGetterFor('url')}
        .setValue=${this.__createConfigSetterFor('url')}
      >
      </foxy-internal-text-area-control>

      <foxy-internal-radio-group-control
        infer="webhook-service"
        .getValue=${this.__createConfigGetterFor('service')}
        .setValue=${this.__createConfigSetterFor('service')}
        .options=${this.__webhookServiceOptions}
      >
      </foxy-internal-radio-group-control>

      <foxy-internal-checkbox-group-control
        infer="webhook-json-events"
        .getValue=${this.__createConfigGetterFor('events')}
        .setValue=${this.__createConfigSetterFor('events')}
        .options=${this.__webhookJsonEventsOptions}
      >
      </foxy-internal-checkbox-group-control>

      <foxy-internal-password-control
        infer="webhook-json-encryption-key"
        .getValue=${this.__createConfigGetterFor('encryption_key')}
        .setValue=${this.__createConfigSetterFor('encryption_key')}
      >
      </foxy-internal-password-control>
    `;
  }

  private __renderWebhookLegacyXmlConfig() {
    return html`
      <foxy-internal-text-control
        infer="webhook-legacy-xml-title"
        .getValue=${this.__createConfigGetterFor('title')}
        .setValue=${this.__createConfigSetterFor('title')}
      >
      </foxy-internal-text-control>

      <foxy-internal-text-area-control
        infer="webhook-legacy-xml-url"
        .getValue=${this.__createConfigGetterFor('url')}
        .setValue=${this.__createConfigSetterFor('url')}
      >
      </foxy-internal-text-area-control>

      <foxy-internal-radio-group-control
        infer="webhook-service"
        .getValue=${this.__createConfigGetterFor('service')}
        .setValue=${this.__createConfigSetterFor('service')}
        .options=${this.__webhookServiceOptions}
      >
      </foxy-internal-radio-group-control>
    `;
  }

  private __renderWebflowConfig() {
    return html`
      <div class="grid grid-cols-2 gap-m">
        <foxy-internal-text-control
          infer="webflow-site-id"
          .getValue=${this.__createConfigGetterFor('site_id')}
          .setValue=${this.__createConfigSetterFor('site_id')}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          infer="webflow-site-name"
          .getValue=${this.__createConfigGetterFor('site_name')}
          .setValue=${this.__createConfigSetterFor('site_name')}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          infer="webflow-collection-id"
          .getValue=${this.__createConfigGetterFor('collection_id')}
          .setValue=${this.__createConfigSetterFor('collection_id')}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          infer="webflow-collection-name"
          .getValue=${this.__createConfigGetterFor('collection_name')}
          .setValue=${this.__createConfigSetterFor('collection_name')}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          infer="webflow-sku-field-id"
          .getValue=${this.__createConfigGetterFor('sku_field_id')}
          .setValue=${this.__createConfigSetterFor('sku_field_id')}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          infer="webflow-sku-field-name"
          .getValue=${this.__createConfigGetterFor('sku_field_name')}
          .setValue=${this.__createConfigSetterFor('sku_field_name')}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          infer="webflow-inventory-field-id"
          .getValue=${this.__createConfigGetterFor('inventory_field_id')}
          .setValue=${this.__createConfigSetterFor('inventory_field_id')}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          infer="webflow-inventory-field-name"
          .getValue=${this.__createConfigGetterFor('inventory_field_name')}
          .setValue=${this.__createConfigSetterFor('inventory_field_name')}
        >
        </foxy-internal-text-control>
      </div>
    `;
  }

  private __renderZapierConfig() {
    return html`
      <foxy-internal-editable-list-control
        infer="zapier-events"
        .getValue=${this.__createConfigGetterFor('events')}
        .setValue=${this.__createConfigSetterFor('events')}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-text-area-control
        infer="zapier-url"
        .getValue=${this.__createConfigGetterFor('url')}
        .setValue=${this.__createConfigSetterFor('url')}
      >
      </foxy-internal-text-area-control>

      <p class="text-xs text-secondary leading-xs">
        <foxy-i18n infer="zapier-warning" key="warning_text"></foxy-i18n>
      </p>
    `;
  }

  private __renderApplePayConfig() {
    return html`
      <foxy-internal-text-control
        infer="apple-pay-merchant-id"
        .getValue=${this.__createConfigGetterFor('merchantID')}
        .setValue=${this.__createConfigSetterFor('merchantID')}
      >
      </foxy-internal-text-control>

      <p class="text-xs text-secondary leading-xs">
        <foxy-i18n infer="apple-pay-warning" key="warning_text"></foxy-i18n>
      </p>
    `;
  }

  private __renderCustomTaxConfig() {
    return html`
      <foxy-internal-text-control
        infer="custom-tax-url"
        .getValue=${this.__createConfigGetterFor('url')}
        .setValue=${this.__createConfigSetterFor('url')}
      >
      </foxy-internal-text-control>

      <p class="text-xs text-secondary leading-xs">
        <foxy-i18n infer="custom-tax-warning" key="warning_text"></foxy-i18n>
      </p>
    `;
  }
}
