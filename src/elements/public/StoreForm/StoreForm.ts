import type { PropertyDeclarations } from 'lit-element';
import type { Resource, Graph } from '@foxy.io/sdk/core';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Item } from '../../internal/InternalEditableListControl/types';
import type { Rels } from '@foxy.io/sdk/backend';

import type {
  ParsedCustomDisplayIdConfig,
  ParsedSmtpConfig,
  ParsedWebhookKey,
  Data,
} from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

import cloneDeep from 'lodash-es/cloneDeep';

const NS = 'store-form';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));

/**
 * Form element for store settings (`fx:store`).
 *
 * @element foxy-store-form
 * @since 1.21.0
 */
export class StoreForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      customerPasswordHashTypes: { attribute: 'customer-password-hash-types' },
      shippingAddressTypes: { attribute: 'shipping-address-types' },
      storeVersions: { attribute: 'store-versions' },
      checkoutTypes: { attribute: 'checkout-types' },
      localeCodes: { attribute: 'locale-codes' },
      languages: {},
      timezones: {},
      countries: {},
      regions: {},
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ store_name: v }) => !!v || 'store-name:v8n_required',
      ({ store_name: v }) => (v && v.length <= 50) || 'store-name:v8n_too_long',
      ({ store_domain: v }) => !!v || 'store-domain:v8n_required',
      ({ store_domain: v }) => (v && v.length <= 100) || 'store-domain:v8n_too_long',
      ({ store_url: v }) => !!v || 'store-url:v8n_required',
      ({ store_url: v }) => (v && v.length <= 300) || 'store-url:v8n_too_long',
      ({ receipt_continue_url: v }) => !v || v.length <= 300 || 'receipt-continue-url:v8n_too_long',
      ({ store_email: v }) => !!v || 'store-email:v8n_required',
      ({ store_email: v }) => (v && v.length <= 300) || 'store-email:v8n_too_long',
      ({ from_email: v }) => !v || v.length <= 100 || 'from-email:v8n_too_long',
      ({ smtp_config: v }) => !v || v.length <= 1000 || 'use-smtp-config:v8n_too_long',
      ({ postal_code: v }) => !!v || 'postal-code:v8n_required',
      ({ postal_code: v }) => (v && v.length <= 50) || 'postal-code:v8n_too_long',
      ({ region: v }) => !!v || 'region:v8n_required',
      ({ region: v }) => (v && v.length <= 100) || 'region:v8n_too_long',
      ({ country: v }) => !!v || 'country:v8n_required',
      ({ logo_url: v }) => !v || v.length <= 200 || 'logo-url:v8n_too_long',

      ({ webhook_url: v, use_webhook }) => {
        return !use_webhook || !v || v.length <= 300 || 'webhook-url:v8n_too_long';
      },

      ({ webhook_key: v, use_webhook: on, use_cart_validation: hmac }) => {
        return (!on && !hmac) || !!v || 'webhook-key:v8n_required';
      },

      ({ webhook_key: v, use_webhook: on, use_cart_validation: hmac }) => {
        return (!on && !hmac) || !v || v.length <= 200 || 'webhook-key:v8n_too_long';
      },

      ({ single_sign_on_url: v, use_single_sign_on: on }) => {
        return !on || !!v || 'single-sign-on-url:v8n_required';
      },

      ({ single_sign_on_url: v, use_single_sign_on: on }) => {
        return !on || !v || v.length <= 300 || 'single-sign-on-url:v8n_too_long';
      },

      ({ customer_password_hash_config: v }) => {
        return !v || String(v).length <= 100 || 'customer-password-hash-config:v8n_too_long';
      },

      ({ unified_order_entry_password: v }) => {
        return !v || String(v).length <= 100 || 'unified-order-entry-password:v8n_too_long';
      },

      ({ custom_display_id_config: v }) => {
        return !v || String(v).length <= 500 || 'custom-display-id-config-enabled:v8n_too_long';
      },
    ];
  }

  /** URL of the `fx:customer_password_hash_types` property helper resource. */
  customerPasswordHashTypes: string | null = null;

  /** URL of the `fx:shipping_address_types` property helper resource. */
  shippingAddressTypes: string | null = null;

  /**
   * URL of the `fx:store_versions` property helper resource.
   * @deprecated All elements in this library are designed to work with store version 2.0.
   */
  storeVersions: string | null = null;

  /**
   * URL of the `fx:checkout_types` property helper resource.
   * @deprecated Checkout type is effectively controlled by the default template config.
   */
  checkoutTypes: string | null = null;

  /**
   * URL of the `fx:locale_codes` property helper resource.
   * @deprecated Default locale code is effectively controlled by the active template set.
   */
  localeCodes: string | null = null;

  /**
   * URL of the `fx:languages` property helper resource.
   * @deprecated Default language is effectively controlled by the active template set.
   */
  languages: string | null = null;

  /** URL of the `fx:timezones` property helper resource. */
  timezones: string | null = null;

  /** URL of the `fx:countries` property helper resource. */
  countries: string | null = null;

  /** URL of the `fx:regions` property helper resource. */
  regions: string | null = null;

  private readonly __currencyStyleOptions = [
    { rawLabel: '12.34', value: '101' },
    { rawLabel: 'USD 12.34', value: '001' },
    { rawLabel: '$12.34', value: '000' },
    { rawLabel: '12', value: '111' },
    { rawLabel: 'USD 12', value: '011' },
    { rawLabel: '$12', value: '010' },
  ];

  private readonly __currencyStyleGetValue = () => {
    const map: Record<string, string> = {
      '101': '101',
      '100': '101',
      '001': '001',
      '000': '000',
      '111': '111',
      '110': '111',
      '011': '011',
      '010': '010',
    };

    const selectionCode = [
      this.form.hide_currency_symbol,
      this.form.hide_decimal_characters,
      this.form.use_international_currency_symbol,
    ]
      .map(v => Number(Boolean(v)))
      .join('');

    return map[selectionCode];
  };

  private readonly __currencyStyleSetValue = (newValue: string) => {
    this.edit({
      hide_currency_symbol: Boolean(Number(newValue[0])),
      hide_decimal_characters: Boolean(Number(newValue[1])),
      use_international_currency_symbol: Boolean(Number(newValue[2])),
    });
  };

  private readonly __appSessionTimeOptions = [
    { value: 's', label: 'second' },
    { value: 'm', label: 'minute' },
    { value: 'h', label: 'hour' },
    { value: 'd', label: 'day' },
  ];

  private readonly __getStoreEmailValue = (): Item[] => {
    const emails = this.form.store_email ?? '';
    return emails
      .split(',')
      .map(v => ({ value: v.trim() }))
      .filter(({ value }) => value.length > 0);
  };

  private readonly __setStoreEmailValue = (newValue: Item[]) => {
    this.edit({ store_email: newValue.map(v => v.value).join(',') });
  };

  private readonly __getUseSmtpConfigValue = () => {
    return !!this.form.smtp_config;
  };

  private readonly __setUseSmtpConfigValue = (newValue: boolean) => {
    if (newValue) {
      this.edit({
        smtp_config: JSON.stringify({
          username: '',
          password: '',
          security: '',
          host: '',
          port: '',
        }),
      });
    } else {
      this.edit({ smtp_config: '' });
    }
  };

  private readonly __getAppSessionTimeValue = () => {
    const valueInSeconds = this.form.app_session_time || 43200;

    if (valueInSeconds % 86400 === 0) return `${valueInSeconds / 86400}d`;
    if (valueInSeconds % 3600 === 0) return `${valueInSeconds / 3600}h`;
    if (valueInSeconds % 60 === 0) return `${valueInSeconds / 60}m`;

    return `${valueInSeconds}s`;
  };

  private readonly __setAppSessionTimeValue = (newValue: string) => {
    const units = newValue[newValue.length - 1];
    const count = parseInt(newValue.substring(0, newValue.length - 1));
    const map: Record<string, number> = { d: 86400, h: 3600, m: 60, s: 1 };

    this.edit({ app_session_time: map[units] * count });
  };

  private readonly __setStoreDomainValue = (newValue: string) => {
    if (newValue.endsWith('.foxycart.com')) {
      const domain = newValue.substring(0, newValue.length - 13);
      this.edit({ store_domain: domain, use_remote_domain: domain.includes('.') });
    } else {
      this.edit({ store_domain: newValue, use_remote_domain: newValue.includes('.') });
    }
  };

  private readonly __smtpConfigHostGetValue = () => {
    return this.__getSmtpConfig().host;
  };

  private readonly __smtpConfigHostSetValue = (newValue: string) => {
    this.__setSmtpConfig('host', newValue);
  };

  private readonly __smtpConfigPortGetValue = () => {
    const port = parseInt(this.__getSmtpConfig().port);
    return isNaN(port) ? undefined : port;
  };

  private readonly __smtpConfigPortSetValue = (newValue: number) => {
    this.__setSmtpConfig('port', String(newValue));
  };

  private readonly __smtpConfigUsernameGetValue = () => {
    return this.__getSmtpConfig().username;
  };

  private readonly __smtpConfigUsernameSetValue = (newValue: string) => {
    this.__setSmtpConfig('username', newValue);
  };

  private readonly __smtpConfigPasswordGetValue = () => {
    return this.__getSmtpConfig().password;
  };

  private readonly __smtpConfigPasswordSetValue = (newValue: string) => {
    this.__setSmtpConfig('password', newValue);
  };

  private readonly __smtpConfigSecurityGetValue = () => {
    return this.__getSmtpConfig().security;
  };

  private readonly __smtpConfigSecuritySetValue = (newValue: string) => {
    this.__setSmtpConfig('security', newValue);
  };

  private readonly __smtpConfigSecurityOptions = [
    { label: 'option_ssl', value: 'ssl' },
    { label: 'option_tls', value: 'tls' },
    { label: 'option_none', value: '' },
  ];

  private readonly __webhookKeyGeneratorOptions = { length: 32, separator: '' };

  private readonly __webhookKeyApiLegacyGetValue = () => {
    return this.__getWebhookKey().api_legacy;
  };

  private readonly __webhookKeyApiLegacySetValue = (newValue: string) => {
    this.__setWebhookKey('api_legacy', newValue);
  };

  private readonly __webhookKeyCartSigningGetValue = () => {
    return this.__getWebhookKey().cart_signing;
  };

  private readonly __webhookKeyCartSigningSetValue = (newValue: string) => {
    this.__setWebhookKey('cart_signing', newValue);
  };

  private readonly __webhookKeyXmlDatafeedGetValue = () => {
    return this.__getWebhookKey().xml_datafeed;
  };

  private readonly __webhookKeyXmlDatafeedSetValue = (newValue: string) => {
    this.__setWebhookKey('xml_datafeed', newValue);
  };

  private readonly __webhookKeySsoGetValue = () => {
    return this.__getWebhookKey().sso;
  };

  private readonly __webhookKeySsoSetValue = (newValue: string) => {
    this.__setWebhookKey('sso', newValue);
  };

  get headerSubtitleOptions(): Record<string, unknown> {
    return { context: this.data?.is_active ? 'active' : 'inactive' };
  }

  renderBody(): TemplateResult {
    const storeDomainHelperText = this.t(
      this.form.use_remote_domain && !this.data?.use_remote_domain
        ? 'essentials.store-domain.custom_domain_note'
        : 'essentials.store-domain.helper_text'
    );

    const storeDomainSuffix =
      !this.form.store_domain || this.form.store_domain.includes('.') ? '' : '.foxycart.com';

    const customerPasswordHashTypesLoader = this.__renderLoader<Rels.CustomerPasswordHashTypes>(1);
    const shippingAddressTypesLoader = this.__renderLoader<Rels.ShippingAddressTypes>(2);
    const timezonesLoader = this.__renderLoader<Rels.Timezones>(7);
    const countriesLoader = this.__renderLoader<Rels.Countries>(8);
    const regionsLoader = this.__renderLoader<Rels.Regions>(9);

    const shippingAddressTypeEntries = Object.entries(
      shippingAddressTypesLoader?.data?.values ?? {}
    );

    const timezones = timezonesLoader?.data?.values.timezone ?? [];
    const countries = Object.values(countriesLoader?.data?.values ?? {});
    const regions = Object.values(regionsLoader?.data?.values ?? {});

    const customerPasswordHashTypeEntries = Object.entries(
      customerPasswordHashTypesLoader?.data?.values ?? {}
    );

    const customerPasswordHashTypeOptions = customerPasswordHashTypeEntries.map(v => ({
      rawLabel: v[1].description,
      value: v[0],
    }));

    const shippingAddressTypeOptions = shippingAddressTypeEntries.map(([value, rawLabel]) => ({
      rawLabel,
      value,
    }));

    const timezoneOptions = timezones.map(t => ({ rawLabel: t.description, value: t.timezone }));
    const countryOptions = countries.map(c => ({ rawLabel: c.default, value: c.cc2 }));
    const regionOptions = regions.map(r => ({ rawLabel: r.default, value: r.code }));

    let regionsUrl: string | undefined;

    try {
      const regionsURL = new URL(this.regions ?? '');
      const country = this.form.country;
      if (country) regionsURL.searchParams.set('country_code', country);
      regionsUrl = regionsURL.toString();
    } catch {
      regionsUrl = undefined;
    }

    const customDisplayIdConfig = this.__getCustomDisplayIdConfig();
    const transactionJournalEntriesConfig = customDisplayIdConfig.transaction_journal_entries;
    const logDetailRequestTypes = transactionJournalEntriesConfig.log_detail_request_types;
    const displayIdExamples = this.__displayIdExamples;
    const journalIdExamples = this.__journalIdExamples;

    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="essentials">
        <foxy-internal-text-control layout="summary-item" infer="store-name">
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="logo-url">
        </foxy-internal-text-control>

        <foxy-internal-text-control
          helper-text=${storeDomainHelperText}
          layout="summary-item"
          suffix=${storeDomainSuffix}
          infer="store-domain"
          .setValue=${this.__setStoreDomainValue}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="store-url">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="essentials" label="" helper-text="">
        <foxy-internal-switch-control infer="is-maintenance-mode"></foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="essentials" label="" helper-text="">
        <foxy-internal-editable-list-control
          layout="summary-item"
          infer="store-email"
          .getValue=${this.__getStoreEmailValue}
          .setValue=${this.__setStoreEmailValue}
        >
        </foxy-internal-editable-list-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="essentials" label="" helper-text="">
        <foxy-internal-select-control
          layout="summary-item"
          infer="timezone"
          .options=${timezoneOptions}
        >
        </foxy-internal-select-control>

        <foxy-internal-select-control
          layout="summary-item"
          infer="country"
          .options=${countryOptions}
        >
        </foxy-internal-select-control>

        ${regionOptions.length > 0
          ? html`
              <foxy-internal-select-control
                layout="summary-item"
                infer="region"
                .options=${regionOptions}
              >
              </foxy-internal-select-control>
            `
          : html`
              <foxy-internal-text-control layout="summary-item" infer="region">
              </foxy-internal-text-control>
            `}

        <foxy-internal-text-control layout="summary-item" infer="postal-code">
        </foxy-internal-text-control>

        <foxy-internal-select-control
          layout="summary-item"
          infer="currency-style"
          .options=${this.__currencyStyleOptions}
          .getValue=${this.__currencyStyleGetValue}
          .setValue=${this.__currencyStyleSetValue}
        >
        </foxy-internal-select-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="legacy-api">
        <foxy-internal-password-control
          layout="summary-item"
          infer="webhook-key-api-legacy"
          show-generator
          .generatorOptions=${this.__webhookKeyGeneratorOptions}
          .getValue=${this.__webhookKeyApiLegacyGetValue}
          .setValue=${this.__webhookKeyApiLegacySetValue}
        >
        </foxy-internal-password-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="emails">
        <foxy-internal-text-control
          layout="summary-item"
          infer="from-email"
          placeholder=${this.__getStoreEmailValue()[0]?.value ??
          this.t('emails.from-email.placeholder')}
        >
        </foxy-internal-text-control>

        <foxy-internal-switch-control infer="use-email-dns" helper-text-as-tooltip>
        </foxy-internal-switch-control>

        <foxy-internal-switch-control
          infer="use-smtp-config"
          helper-text-as-tooltip
          .getValue=${this.__getUseSmtpConfigValue}
          .setValue=${this.__setUseSmtpConfigValue}
        >
        </foxy-internal-switch-control>

        ${this.form.smtp_config
          ? html`
              <foxy-internal-text-control
                layout="summary-item"
                infer="smtp-config-host"
                .getValue=${this.__smtpConfigHostGetValue}
                .setValue=${this.__smtpConfigHostSetValue}
              >
              </foxy-internal-text-control>

              <foxy-internal-number-control
                layout="summary-item"
                infer="smtp-config-port"
                step="1"
                min="0"
                .getValue=${this.__smtpConfigPortGetValue}
                .setValue=${this.__smtpConfigPortSetValue}
              >
              </foxy-internal-number-control>

              <foxy-internal-text-control
                layout="summary-item"
                infer="smtp-config-username"
                .getValue=${this.__smtpConfigUsernameGetValue}
                .setValue=${this.__smtpConfigUsernameSetValue}
              >
              </foxy-internal-text-control>

              <foxy-internal-password-control
                layout="summary-item"
                infer="smtp-config-password"
                .getValue=${this.__smtpConfigPasswordGetValue}
                .setValue=${this.__smtpConfigPasswordSetValue}
              >
              </foxy-internal-password-control>

              <foxy-internal-select-control
                layout="summary-item"
                infer="smtp-config-security"
                .getValue=${this.__smtpConfigSecurityGetValue}
                .setValue=${this.__smtpConfigSecuritySetValue}
                .options=${this.__smtpConfigSecurityOptions}
              >
              </foxy-internal-select-control>
            `
          : ''}
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="shipping">
        <foxy-internal-select-control
          layout="summary-item"
          infer="shipping-address-type"
          .options=${shippingAddressTypeOptions}
        >
        </foxy-internal-select-control>

        <foxy-internal-switch-control infer="features-multiship" helper-text-as-tooltip>
        </foxy-internal-switch-control>

        <foxy-internal-switch-control infer="require-signed-shipping-rates" helper-text-as-tooltip>
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="cart">
        <foxy-internal-frequency-control
          layout="summary-item"
          infer="app-session-time"
          .getValue=${this.__getAppSessionTimeValue}
          .setValue=${this.__setAppSessionTimeValue}
          .options=${this.__appSessionTimeOptions}
        >
        </foxy-internal-frequency-control>

        <foxy-internal-switch-control
          infer="products-require-expires-property"
          helper-text-as-tooltip
        >
        </foxy-internal-switch-control>

        <foxy-internal-switch-control infer="use-cart-validation" helper-text-as-tooltip>
        </foxy-internal-switch-control>

        <foxy-internal-password-control
          layout="summary-item"
          infer="webhook-key-cart-signing"
          show-generator
          .generatorOptions=${this.__webhookKeyGeneratorOptions}
          .getValue=${this.__webhookKeyCartSigningGetValue}
          .setValue=${this.__webhookKeyCartSigningSetValue}
        >
        </foxy-internal-password-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="checkout">
        <foxy-internal-select-control
          layout="summary-item"
          infer="customer-password-hash-type"
          .options=${customerPasswordHashTypeOptions}
          .setValue=${(newValue: string) => {
            const entry = customerPasswordHashTypeEntries.find(([v]) => v === newValue);
            this.edit({
              customer_password_hash_type: newValue,
              customer_password_hash_config: entry?.[1].config ?? '',
            });
          }}
        >
        </foxy-internal-select-control>

        ${typeof this.form.customer_password_hash_config === 'number'
          ? html`
              <foxy-internal-number-control
                layout="summary-item"
                infer="customer-password-hash-config"
              >
              </foxy-internal-number-control>
            `
          : html`
              <foxy-internal-text-control
                layout="summary-item"
                infer="customer-password-hash-config"
              >
              </foxy-internal-text-control>
            `}
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="checkout" label="" helper-text="">
        <foxy-internal-password-control
          layout="summary-item"
          infer="unified-order-entry-password"
          show-generator
        >
        </foxy-internal-password-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="checkout" label="" helper-text="">
        <foxy-internal-switch-control infer="use-single-sign-on"></foxy-internal-switch-control>
        ${this.form.use_single_sign_on
          ? html`
              <foxy-internal-text-control layout="summary-item" infer="single-sign-on-url">
              </foxy-internal-text-control>
              <foxy-internal-password-control
                layout="summary-item"
                infer="webhook-key-sso"
                show-generator
                .generatorOptions=${this.__webhookKeyGeneratorOptions}
                .getValue=${this.__webhookKeySsoGetValue}
                .setValue=${this.__webhookKeySsoSetValue}
              >
              </foxy-internal-password-control>
            `
          : ''}
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="receipt">
        <foxy-internal-text-control layout="summary-item" infer="receipt-continue-url">
        </foxy-internal-text-control>
        <foxy-internal-switch-control infer="bcc-on-receipt-email"></foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="custom-display-id-config">
        <foxy-internal-switch-control
          infer="custom-display-id-config-enabled"
          .getValue=${() => customDisplayIdConfig.enabled}
          .setValue=${(newValue: boolean) => {
            this.__setCustomDisplayIdConfig('enabled', newValue);
          }}
        >
        </foxy-internal-switch-control>

        ${customDisplayIdConfig.enabled
          ? html`
              <foxy-internal-number-control
                layout="summary-item"
                infer="custom-display-id-config-start"
                step="1"
                min="0"
                .getValue=${() => parseInt(customDisplayIdConfig.start || '0')}
                .setValue=${(newValue: number) => {
                  this.__setCustomDisplayIdConfig('start', String(newValue));
                }}
              >
              </foxy-internal-number-control>

              <foxy-internal-number-control
                layout="summary-item"
                infer="custom-display-id-config-length"
                step="1"
                min="0"
                .getValue=${() => parseInt(customDisplayIdConfig.length || '0')}
                .setValue=${(newValue: number) => {
                  this.__setCustomDisplayIdConfig('length', String(newValue));
                }}
              >
              </foxy-internal-number-control>

              <foxy-internal-text-control
                layout="summary-item"
                infer="custom-display-id-config-prefix"
                .getValue=${() => customDisplayIdConfig.prefix}
                .setValue=${(newValue: string) => {
                  this.__setCustomDisplayIdConfig('prefix', newValue);
                }}
              >
              </foxy-internal-text-control>

              <foxy-internal-text-control
                layout="summary-item"
                infer="custom-display-id-config-suffix"
                .getValue=${() => customDisplayIdConfig.suffix}
                .setValue=${(newValue: string) => {
                  this.__setCustomDisplayIdConfig('suffix', newValue);
                }}
              >
              </foxy-internal-text-control>

              <div class="text-right text-secondary">
                <p class="flex justify-end">
                  <foxy-i18n infer="" key="custom-display-id-config-first-example"></foxy-i18n>
                  <span style="font-family: monospace">&nbsp;${displayIdExamples?.first}</span>
                </p>
                <p class="flex justify-end">
                  <foxy-i18n infer="" key="custom-display-id-config-random-example"></foxy-i18n>
                  <span style="font-family: monospace">&nbsp;${displayIdExamples?.random}</span>
                </p>
              </div>
            `
          : ''}
      </foxy-internal-summary-control>

      <foxy-internal-summary-control helper-text="" label="" infer="custom-display-id-config">
        <foxy-internal-switch-control
          infer="custom-display-id-config-transaction-journal-entries-enabled"
          class="sm-col-span-2"
          .getValue=${() => transactionJournalEntriesConfig.enabled}
          .setValue=${(newValue: boolean) => {
            this.__setTransactionJournalEntriesConfig('enabled', newValue);
          }}
        >
        </foxy-internal-switch-control>

        ${transactionJournalEntriesConfig.enabled
          ? html`
              <foxy-internal-text-control
                layout="summary-item"
                infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-authcapture-prefix"
                .getValue=${() => logDetailRequestTypes.transaction_authcapture.prefix}
                .setValue=${(newValue: string) => {
                  this.__setTransactionJournalEntriesPrefix('transaction_authcapture', newValue);
                }}
              >
              </foxy-internal-text-control>

              <foxy-internal-text-control
                layout="summary-item"
                infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-capture-prefix"
                .getValue=${() => logDetailRequestTypes.transaction_capture.prefix}
                .setValue=${(newValue: string) => {
                  this.__setTransactionJournalEntriesPrefix('transaction_capture', newValue);
                }}
              >
              </foxy-internal-text-control>

              <foxy-internal-text-control
                layout="summary-item"
                infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-void-prefix"
                .getValue=${() => logDetailRequestTypes.transaction_void.prefix}
                .setValue=${(newValue: string) => {
                  this.__setTransactionJournalEntriesPrefix('transaction_void', newValue);
                }}
              >
              </foxy-internal-text-control>

              <foxy-internal-text-control
                layout="summary-item"
                infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-refund-prefix"
                .getValue=${() => logDetailRequestTypes.transaction_refund.prefix}
                .setValue=${(newValue: string) => {
                  this.__setTransactionJournalEntriesPrefix('transaction_refund', newValue);
                }}
              >
              </foxy-internal-text-control>

              <foxy-internal-text-control
                layout="summary-item"
                infer="custom-display-id-config-transaction-journal-entries-transaction-separator"
                class="col-span-2"
                .getValue=${() => transactionJournalEntriesConfig.transaction_separator}
                .setValue=${(newValue: string) => {
                  this.__setTransactionJournalEntriesConfig('transaction_separator', newValue);
                }}
              >
              </foxy-internal-text-control>

              <div class="sm-col-span-2 leading-s text-right text-secondary">
                <p>
                  <foxy-i18n
                    infer=""
                    key="custom-display-id-config-transaction-journal-entries-authcapture-example"
                  >
                  </foxy-i18n>
                  <span style="font-family: monospace"> ${journalIdExamples?.authcapture} </span>
                </p>
                <p>
                  <foxy-i18n
                    infer=""
                    key="custom-display-id-config-transaction-journal-entries-capture-example"
                  >
                  </foxy-i18n>
                  <span style="font-family: monospace">${journalIdExamples?.capture}</span>
                </p>
                <p>
                  <foxy-i18n
                    infer=""
                    key="custom-display-id-config-transaction-journal-entries-void-example"
                  >
                  </foxy-i18n>
                  <span style="font-family: monospace">${journalIdExamples?.void}</span>
                </p>
                <p>
                  <foxy-i18n
                    infer=""
                    key="custom-display-id-config-transaction-journal-entries-refund-example"
                  >
                  </foxy-i18n>
                  <span style="font-family: monospace">${journalIdExamples?.refund}</span>
                </p>
              </div>
            `
          : ''}
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="xml-datafeed">
        <foxy-internal-switch-control infer="use-webhook"></foxy-internal-switch-control>
        ${this.form.use_webhook
          ? html`
              <foxy-internal-text-control layout="summary-item" infer="webhook-url">
              </foxy-internal-text-control>
              <foxy-internal-password-control
                layout="summary-item"
                infer="webhook-key-xml-datafeed"
                show-generator
                .generatorOptions=${this.__webhookKeyGeneratorOptions}
                .getValue=${this.__webhookKeyXmlDatafeedGetValue}
                .setValue=${this.__webhookKeyXmlDatafeedSetValue}
              >
              </foxy-internal-password-control>
            `
          : ''}
      </foxy-internal-summary-control>

      ${super.renderBody()}
      ${customerPasswordHashTypesLoader.render(this.customerPasswordHashTypes)}
      ${shippingAddressTypesLoader.render(this.shippingAddressTypes)}
      ${timezonesLoader.render(this.timezones)} ${countriesLoader.render(this.countries)}
      ${regionsLoader.render(regionsUrl)}
    `;
  }

  private get __displayIdExamples() {
    const config = this.__getCustomDisplayIdConfig();
    const startAsInt = parseInt(config.start || '0');
    const lengthAsInt = parseInt(config.length || '0');
    const numericLength = lengthAsInt - config.prefix.length - config.suffix.length;
    const randomExampleNumericId = Math.min(
      startAsInt + Math.floor(Math.random() * Math.pow(10, numericLength)),
      Math.pow(10, numericLength) - 1
    );

    if (config.start && config.length && startAsInt / 10 <= numericLength) {
      return {
        first: `${config.prefix}${startAsInt.toString().padStart(numericLength, '0')}${
          config.suffix
        }`,
        random: `${config.prefix}${randomExampleNumericId.toString().padStart(numericLength, '0')}${
          config.suffix
        }`,
      };
    }
  }

  private get __journalIdExamples() {
    const customDisplayIdConfig = this.__getCustomDisplayIdConfig();
    const transactionJournalEntriesConfig = customDisplayIdConfig.transaction_journal_entries;
    const startAsInt = parseInt(customDisplayIdConfig.start || '0');
    const lengthAsInt = parseInt(customDisplayIdConfig.length || '0');
    const numericLength =
      lengthAsInt - customDisplayIdConfig.prefix.length - customDisplayIdConfig.suffix.length;

    const randomExampleNumericId = Math.min(
      startAsInt + Math.floor(Math.random() * Math.pow(10, numericLength)),
      Math.pow(10, numericLength) - 1
    );

    const randomExampleId = `${customDisplayIdConfig.prefix}${randomExampleNumericId
      .toString()
      .padStart(numericLength, '0')}${customDisplayIdConfig.suffix}`;

    const randomNumericEntryId = Math.floor(Math.random() * 1000);
    const randomEntryId = String(randomNumericEntryId).padStart(3, '0');

    if (
      customDisplayIdConfig.start &&
      customDisplayIdConfig.length &&
      startAsInt / 10 <= numericLength
    ) {
      return {
        authcapture: `${randomExampleId}${transactionJournalEntriesConfig.transaction_separator}${transactionJournalEntriesConfig.log_detail_request_types.transaction_authcapture.prefix}${randomEntryId}`,
        capture: `${randomExampleId}${transactionJournalEntriesConfig.transaction_separator}${transactionJournalEntriesConfig.log_detail_request_types.transaction_capture.prefix}${randomEntryId}`,
        refund: `${randomExampleId}${transactionJournalEntriesConfig.transaction_separator}${transactionJournalEntriesConfig.log_detail_request_types.transaction_refund.prefix}${randomEntryId}`,
        void: `${randomExampleId}${transactionJournalEntriesConfig.transaction_separator}${transactionJournalEntriesConfig.log_detail_request_types.transaction_void.prefix}${randomEntryId}`,
      };
    }
  }

  private __getWebhookKey() {
    let parsedKey: ParsedWebhookKey;

    try {
      parsedKey = JSON.parse(this.form.webhook_key ?? '');
    } catch {
      const v = this.form.webhook_key ?? '';
      parsedKey = { cart_signing: v, xml_datafeed: v, api_legacy: v, sso: v };
    }

    return parsedKey;
  }

  private __setWebhookKey(key: keyof ParsedWebhookKey, value: string) {
    const parsedKey = this.__getWebhookKey();
    parsedKey[key] = value;
    this.edit({ webhook_key: JSON.stringify(parsedKey) });
  }

  private __getCustomDisplayIdConfig() {
    const defaultConfig: ParsedCustomDisplayIdConfig = {
      enabled: false,
      start: '0',
      length: '0',
      prefix: '',
      suffix: '',
      transaction_journal_entries: {
        enabled: false,
        transaction_separator: '',
        log_detail_request_types: {
          transaction_authcapture: { prefix: '' },
          transaction_capture: { prefix: '' },
          transaction_refund: { prefix: '' },
          transaction_void: { prefix: '' },
        },
      },
    };

    let config: ParsedCustomDisplayIdConfig;

    try {
      config = JSON.parse(this.form.custom_display_id_config ?? '');
    } catch {
      config = cloneDeep(defaultConfig);
    }

    return config;
  }

  private __setCustomDisplayIdConfig<TKey extends keyof ParsedCustomDisplayIdConfig>(
    key: TKey,
    value: ParsedCustomDisplayIdConfig[TKey]
  ) {
    const currentConfig = this.__getCustomDisplayIdConfig();
    currentConfig[key] = value;
    this.edit({ custom_display_id_config: JSON.stringify(currentConfig) });
  }

  private __getTransactionJournalEntriesConfig() {
    return this.__getCustomDisplayIdConfig().transaction_journal_entries;
  }

  private __setTransactionJournalEntriesConfig<
    TKey extends keyof ParsedCustomDisplayIdConfig['transaction_journal_entries']
  >(key: TKey, value: ParsedCustomDisplayIdConfig['transaction_journal_entries'][TKey]) {
    const config = this.__getCustomDisplayIdConfig().transaction_journal_entries;
    config[key] = value;
    this.__setCustomDisplayIdConfig('transaction_journal_entries', config);
  }

  private __setTransactionJournalEntriesPrefix(
    key: keyof ParsedCustomDisplayIdConfig['transaction_journal_entries']['log_detail_request_types'],
    value: string
  ) {
    const config = this.__getTransactionJournalEntriesConfig();
    config.log_detail_request_types[key].prefix = value;
    this.__setTransactionJournalEntriesConfig(
      'log_detail_request_types',
      config.log_detail_request_types
    );
  }

  private __getSmtpConfig() {
    let config: ParsedSmtpConfig;

    try {
      config = JSON.parse(this.form.smtp_config ?? '');
    } catch {
      config = {
        username: '',
        password: '',
        security: '',
        host: '',
        port: '',
      };
    }

    return config;
  }

  private __setSmtpConfig<TKey extends keyof ParsedSmtpConfig>(
    key: TKey,
    value: ParsedSmtpConfig[TKey]
  ) {
    const config = this.__getSmtpConfig();
    config[key] = value;
    this.edit({ smtp_config: JSON.stringify(config) });
  }

  private __renderLoader<T extends Graph & { links: { self: unknown } }>(index: number) {
    const id = `loader-${index}`;
    return {
      data: this.renderRoot.querySelector<NucleonElement<Resource<T>>>(`#${id}`)?.data,
      render: (href?: string | null) => html`
        <foxy-nucleon
          class="hidden"
          infer=""
          href=${ifDefined(href ?? undefined)}
          id=${id}
          @update=${() => this.requestUpdate()}
        >
        </foxy-nucleon>
      `,
    };
  }
}
