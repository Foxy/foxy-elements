import type { VanillaHCaptchaWebComponent } from 'vanilla-hcaptcha';
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

import slugify from '@sindresorhus/slugify';
import memoize from 'lodash-es/memoize';
import merge from 'lodash-es/merge';

const NS = 'store-form';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));

function parseWebhookKey(webhookKey: string): ParsedWebhookKey | null {
  try {
    return JSON.parse(webhookKey);
  } catch {
    return null;
  }
}

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
      reportingStoreDomainExists: { attribute: 'reporting-store-domain-exists' },
      customerPasswordHashTypes: { attribute: 'customer-password-hash-types' },
      shippingAddressTypes: { attribute: 'shipping-address-types' },
      storeSecretsPageUrl: { attribute: 'store-secrets-page-url' },
      hCaptchaSiteKey: { attribute: 'h-captcha-site-key' },
      storeVersions: { attribute: 'store-versions' },
      checkoutTypes: { attribute: 'checkout-types' },
      localeCodes: { attribute: 'locale-codes' },
      languages: {},
      timezones: {},
      countries: {},
      regions: {},
    };
  }

  static get v8n(): NucleonV8N<Data, StoreForm> {
    const isURL = memoize((value: string) => {
      try {
        return Boolean(new URL(value));
      } catch {
        return false;
      }
    });

    return [
      ({ store_name: v }) => !!v || 'store-name:v8n_required',
      ({ store_name: v }) => (v && v.length <= 50) || 'store-name:v8n_too_long',
      ({ store_domain: storeDomain, use_remote_domain: useRemoteDomain }) => {
        if (!storeDomain) return 'store-domain:v8n_required';
        if (storeDomain.length > 100) return 'store-domain:v8n_too_long';

        const [tld, ...slds] = storeDomain.split('.').reverse();

        if (
          useRemoteDomain &&
          slds.length > 1 &&
          slds.every(s => /^(?!-)[a-z0-9-]{1,63}(?<!-)$/.test(s)) &&
          /^[a-z]{2,63}$/.test(tld)
        ) {
          return true;
        }

        if (
          !useRemoteDomain &&
          slds.length === 0 &&
          /^(?!-)[a-z0-9-]{1,63}(?<!-)$/.test(storeDomain)
        ) {
          return true;
        }

        return 'store-domain:v8n_invalid';
      },
      ({ store_url: v }) => !!v || 'store-url:v8n_required',
      ({ store_url: v }) => (v && v.length <= 300) || 'store-url:v8n_too_long',
      ({ store_url: v }) => !v || isURL(v) || 'store-url:v8n_invalid',
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

      ({ webhook_url: v, use_webhook }) => !use_webhook || !!v || 'webhook-url:v8n_required',
      ({ webhook_url: v, use_webhook }) => {
        return !use_webhook || !v || v.length <= 300 || 'webhook-url:v8n_too_long';
      },

      ({ webhook_key: v }) => v === void 0 || v.length > 0 || 'webhook-key:v8n_required',
      ({ webhook_key: v }, host) => {
        // TODO remove the line below when API limit is corrected to match the legacy admin
        if (host.data?.webhook_key === v) return true;
        return !v || v.length <= 100 || 'webhook-key:v8n_too_long';
      },

      ({ webhook_key: v, use_webhook: on }: Partial<Data>) => {
        const parsedV = parseWebhookKey(v ?? '');
        const code = 'use-webhook:v8n_webhook_key_required';
        return !on || !!(parsedV ? parsedV.xml_datafeed : v) || code;
      },

      ({ webhook_key: v, use_cart_validation: on }: Partial<Data>) => {
        const parsedV = parseWebhookKey(v ?? '');
        const code = 'use-cart-validation:v8n_webhook_key_required';
        return !on || !!(parsedV ? parsedV.cart_signing : v) || code;
      },

      ({ webhook_key: v, use_single_sign_on: on }: Partial<Data>) => {
        const parsedV = parseWebhookKey(v ?? '');
        const code = 'use-single-sign-on:v8n_webhook_key_required';
        return !on || !!(parsedV ? parsedV.sso : v) || code;
      },

      ...(['xml_datafeed', 'cart_signing', 'api_legacy', 'sso'] as const)
        .map(prop => [
          ({ webhook_key: v }: Partial<Data>) => {
            const parsedV = parseWebhookKey(v ?? '');
            const code = `webhook-key-${prop.replace(/_/g, '-')}:v8n_required`;
            return !parsedV || !!parsedV[prop] || code;
          },
          ({ webhook_key: v }: Partial<Data>) => {
            const parsedV = parseWebhookKey(v ?? '');
            const code = `webhook-key-${prop.replace(/_/g, '-')}:v8n_too_long`;
            return !parsedV || parsedV[prop].length <= 100 || code;
          },
        ])
        .flat(),

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
    ];
  }

  /** URL of the `fx:reporting_store_domain_exists` endpoint. */
  reportingStoreDomainExists: string | null = null;

  /** URL of the `fx:customer_password_hash_types` property helper resource. */
  customerPasswordHashTypes: string | null = null;

  /** URL of the `fx:shipping_address_types` property helper resource. */
  shippingAddressTypes: string | null = null;

  /** URL of the Store Secrets settings page if you are using this form on multiple pages. */
  storeSecretsPageUrl: string | null = null;

  /** hCaptcha site key for signup verification. If provided, requires users to complete a captcha before creating a store. */
  hCaptchaSiteKey: string | null = null;

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

  private readonly __checkStoreDomainAvailability = async (value: string) => {
    if (this.reportingStoreDomainExists) {
      if (value === this.data?.store_domain) return true;

      const url = new URL(this.reportingStoreDomainExists);
      url.searchParams.set('store_domain', value);

      const response = await new StoreForm.API(this).fetch(url.toString());
      return response.ok || 'store-domain:v8n_unavailable';
    } else {
      throw new Error('reportingStoreDomainExists is not set.');
    }
  };

  private readonly __storeNameSetValue = (newValue: string) => {
    const previousSuggestedDomain = slugify(this.form.store_name ?? '');
    const currentStoreDomain = this.form.store_domain ?? '';
    const newSuggestedDomain = slugify(newValue);

    if (previousSuggestedDomain === currentStoreDomain) {
      this.edit({ store_domain: newSuggestedDomain });
    }

    this.edit({ store_name: newValue });
  };

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
    if (this.data) {
      if (newValue.endsWith('.foxycart.com')) {
        const domain = newValue.substring(0, newValue.length - 13);
        this.edit({ store_domain: domain, use_remote_domain: false });
      } else {
        this.edit({ store_domain: newValue, use_remote_domain: newValue.includes('.') });
      }
    } else {
      this.edit({ store_domain: newValue.split('.')[0] ?? '', use_remote_domain: false });
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

  private readonly __singleWebhookKeyGeneratorOptions = { length: 90, separator: '' };

  private readonly __jsonWebhookKeyGeneratorOptions = { length: 90, separator: '' };

  private readonly __useSingleWebhookKeyGetValue = () => {
    try {
      JSON.parse(this.form.webhook_key ?? '');
      return false;
    } catch {
      return true;
    }
  };

  private readonly __useSingleWebhookKeySetValue = (newValue: boolean) => {
    if (newValue) {
      this.edit({ webhook_key: '' });
    } else {
      const parsedKey: ParsedWebhookKey = {
        cart_signing: '',
        xml_datafeed: '',
        api_legacy: '',
        sso: '',
      };

      this.edit({ webhook_key: JSON.stringify(parsedKey) });
    }
  };

  private readonly __sendHtmlEmailOptions = [
    { label: 'option_text_only', value: 'text_only' },
    { label: 'option_text_plus_html', value: 'text_plus_html' },
  ];

  private readonly __sendHtmlEmailGetValue = () => {
    return this.form.send_html_email ? 'text_plus_html' : 'text_only';
  };

  private readonly __sendHtmlEmailSetValue = (newValue: 'text_only' | 'text_plus_html') => {
    this.edit({ send_html_email: newValue === 'text_plus_html' });
  };

  private __hCaptchaToken: string | null = null;

  get headerSubtitleOptions(): Record<string, unknown> {
    return { context: this.data?.is_active ? 'active' : 'inactive' };
  }

  renderBody(): TemplateResult {
    const storeDomainHelperText = this.t(
      this.form.use_remote_domain && !this.data?.use_remote_domain
        ? 'essentials-group-one.store-domain.custom_domain_note'
        : 'essentials-group-one.store-domain.helper_text'
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

    const rawWebhookKey = this.data?.webhook_key ?? '';
    const parsedWebhookKey = parseWebhookKey(rawWebhookKey);
    const cartSigningKey = parsedWebhookKey?.cart_signing ?? rawWebhookKey;
    const xmlDatafeedKey = parsedWebhookKey?.xml_datafeed ?? rawWebhookKey;
    const ssoKey = parsedWebhookKey?.sso ?? rawWebhookKey;

    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="essentials-group-one">
        <foxy-internal-text-control
          layout="summary-item"
          infer="store-name"
          .setValue=${this.__storeNameSetValue}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="logo-url">
        </foxy-internal-text-control>

        <foxy-internal-text-control
          helper-text=${storeDomainHelperText}
          layout="summary-item"
          suffix=${storeDomainSuffix}
          infer="store-domain"
          .setValue=${this.__setStoreDomainValue}
          .checkValidityAsync=${this.reportingStoreDomainExists
            ? this.__checkStoreDomainAvailability
            : null}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="store-url">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="essentials-group-two">
        <foxy-internal-switch-control infer="is-maintenance-mode"></foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="essentials-group-three">
        <foxy-internal-editable-list-control
          layout="summary-item"
          infer="store-email"
          .getValue=${this.__getStoreEmailValue}
          .setValue=${this.__setStoreEmailValue}
        >
        </foxy-internal-editable-list-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="essentials-group-four">
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

      <foxy-internal-summary-control infer="store-secrets" id="store-secrets">
        <foxy-internal-switch-control
          infer="use-single-secret"
          .getValue=${this.__useSingleWebhookKeyGetValue}
          .setValue=${this.__useSingleWebhookKeySetValue}
        >
        </foxy-internal-switch-control>

        ${this.__useSingleWebhookKeyGetValue()
          ? html`
              <foxy-internal-password-control
                layout="summary-item"
                infer="webhook-key"
                show-generator
                .generatorOptions=${this.__singleWebhookKeyGeneratorOptions}
              >
              </foxy-internal-password-control>
            `
          : html`
              <foxy-internal-password-control
                json-path="api_legacy"
                property="webhook_key"
                layout="summary-item"
                infer="webhook-key-api-legacy"
                show-generator
                .generatorOptions=${this.__jsonWebhookKeyGeneratorOptions}
              >
              </foxy-internal-password-control>

              <foxy-internal-password-control
                json-path="cart_signing"
                property="webhook_key"
                layout="summary-item"
                infer="webhook-key-cart-signing"
                show-generator
                .generatorOptions=${this.__jsonWebhookKeyGeneratorOptions}
              >
              </foxy-internal-password-control>

              <foxy-internal-password-control
                json-path="sso"
                property="webhook_key"
                layout="summary-item"
                infer="webhook-key-sso"
                show-generator
                .generatorOptions=${this.__jsonWebhookKeyGeneratorOptions}
              >
              </foxy-internal-password-control>

              <foxy-internal-password-control
                json-path="xml_datafeed"
                property="webhook_key"
                layout="summary-item"
                infer="webhook-key-xml-datafeed"
                show-generator
                .generatorOptions=${this.__jsonWebhookKeyGeneratorOptions}
              >
              </foxy-internal-password-control>
            `}
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

        <foxy-internal-select-control
          layout="summary-item"
          infer="send-html-email"
          .getValue=${this.__sendHtmlEmailGetValue}
          .setValue=${this.__sendHtmlEmailSetValue}
          .options=${this.__sendHtmlEmailOptions}
        >
        </foxy-internal-select-control>
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

        ${cartSigningKey && this.form.use_cart_validation
          ? this.__renderReadonlyWebhookKey('webhook-key-cart-signing', cartSigningKey)
          : ''}
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
              ${ssoKey ? this.__renderReadonlyWebhookKey('webhook-key-sso', ssoKey) : ''}
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
              ${xmlDatafeedKey
                ? this.__renderReadonlyWebhookKey('webhook-key-xml-datafeed', xmlDatafeedKey)
                : ''}
            `
          : ''}
      </foxy-internal-summary-control>

      ${this.renderTemplateOrSlot()}
      ${this.href || !this.hCaptchaSiteKey
        ? ''
        : html`
            <div class="text-xs text-tertiary">
              <foxy-i18n infer="hcaptcha" key="disclaimer"></foxy-i18n>
              <br />
              <a
                target="_blank"
                class="transition-colors hover-text-body rounded-s focus-outline-none focus-ring-2 focus-ring-primary-50"
                href="https://www.hcaptcha.com/privacy"
                rel="noopener noreferrer"
              >
                <foxy-i18n class="underline" infer="hcaptcha" key="privacy_policy"></foxy-i18n>
              </a>
              <span>&bull;</span>
              <a
                target="_blank"
                class="transition-colors hover-text-body rounded-s focus-outline-none focus-ring-2 focus-ring-primary-50"
                href="https://www.hcaptcha.com/terms"
                rel="noopener noreferrer"
              >
                <foxy-i18n class="underline" infer="hcaptcha" key="terms_of_service"></foxy-i18n>
              </a>
              <h-captcha
                site-key=${this.hCaptchaSiteKey}
                class="hidden"
                size="invisible"
                hl=${this.lang}
                @verified=${({ token }: Record<'token' | 'eKey', string>) => {
                  this.__hCaptchaToken = token;
                  super.submit();
                }}
              >
              </h-captcha>
            </div>
          `}
      ${super.renderBody()}
      ${customerPasswordHashTypesLoader.render(this.customerPasswordHashTypes)}
      ${shippingAddressTypesLoader.render(this.shippingAddressTypes)}
      ${timezonesLoader.render(this.timezones)} ${countriesLoader.render(this.countries)}
      ${regionsLoader.render(regionsUrl)}
    `;
  }

  submit(): void {
    if (!this.href && this.hCaptchaSiteKey) {
      this.__hCaptcha?.reset();
      this.__hCaptcha?.execute();
    } else {
      super.submit();
    }
  }

  protected async _fetch<TResult = Data>(...args: Parameters<Window['fetch']>): Promise<TResult> {
    try {
      const request = new StoreForm.API.WHATWGRequest(...args);
      if (this.__hCaptchaToken) request.headers.set('h-captcha-code', this.__hCaptchaToken);
      return await super._fetch(request);
    } catch (err) {
      let errorText;

      try {
        errorText = await (err as Response).text();
      } catch {
        throw err;
      }

      if (
        errorText.includes('store_domain is invalid because it has a reserved format') ||
        errorText.includes('store_domain can not end with')
      ) {
        throw ['error:store_domain_reserved'];
      }

      if (errorText.includes('store_domain is already in use')) {
        throw ['error:store_domain_exists'];
      }

      throw err;
    }
  }

  private get __displayIdExamples() {
    const config = this.__getCustomDisplayIdConfig();
    const startAsInt = parseInt(config.start || '0');
    const lengthAsInt = parseInt(config.length || '0');
    const randomExampleNumericId = Math.min(
      startAsInt + Math.floor(Math.random() * Math.pow(10, lengthAsInt)),
      Math.pow(10, lengthAsInt) - 1
    );

    if (config.start && config.length && startAsInt / 10 <= lengthAsInt) {
      return {
        first: `${config.prefix}${startAsInt.toString().padStart(lengthAsInt, '0')}${
          config.suffix
        }`,
        random: `${config.prefix}${randomExampleNumericId.toString().padStart(lengthAsInt, '0')}${
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
    const randomExampleNumericId = Math.min(
      startAsInt + Math.floor(Math.random() * Math.pow(10, lengthAsInt)),
      Math.pow(10, lengthAsInt) - 1
    );

    const randomExampleId = `${customDisplayIdConfig.prefix}${randomExampleNumericId
      .toString()
      .padStart(lengthAsInt, '0')}${customDisplayIdConfig.suffix}`;

    const randomNumericEntryId = Math.floor(Math.random() * 1000);
    const randomEntryId = String(randomNumericEntryId).padStart(3, '0');

    if (
      customDisplayIdConfig.start &&
      customDisplayIdConfig.length &&
      startAsInt / 10 <= lengthAsInt
    ) {
      return {
        authcapture: `${randomExampleId}${transactionJournalEntriesConfig.transaction_separator}${transactionJournalEntriesConfig.log_detail_request_types.transaction_authcapture.prefix}${randomEntryId}`,
        capture: `${randomExampleId}${transactionJournalEntriesConfig.transaction_separator}${transactionJournalEntriesConfig.log_detail_request_types.transaction_capture.prefix}${randomEntryId}`,
        refund: `${randomExampleId}${transactionJournalEntriesConfig.transaction_separator}${transactionJournalEntriesConfig.log_detail_request_types.transaction_refund.prefix}${randomEntryId}`,
        void: `${randomExampleId}${transactionJournalEntriesConfig.transaction_separator}${transactionJournalEntriesConfig.log_detail_request_types.transaction_void.prefix}${randomEntryId}`,
      };
    }
  }

  private get __hCaptcha() {
    return this.renderRoot.querySelector<VanillaHCaptchaWebComponent>('h-captcha');
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

    return merge(defaultConfig, this.form.custom_display_id_config || void 0);
  }

  private __setCustomDisplayIdConfig<TKey extends keyof ParsedCustomDisplayIdConfig>(
    key: TKey,
    value: ParsedCustomDisplayIdConfig[TKey]
  ) {
    const currentConfig = this.__getCustomDisplayIdConfig();
    currentConfig[key] = value;
    this.edit({ custom_display_id_config: currentConfig });
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

  private __renderReadonlyWebhookKey(scope: string, key: string) {
    return html`
      <div class="leading-xs">
        <div class="flex items-center gap-s">
          <p class="flex-1">
            <foxy-i18n infer=${scope} key="label"></foxy-i18n>
          </p>
          <p class="text-tertiary">${'*'.repeat(8)}${key.substr(-4)}</p>
          <foxy-copy-to-clipboard
            layout="complete"
            infer="${scope} copy-to-clipboard"
            theme="contrast tertiary-inline"
            text=${key}
          >
          </foxy-copy-to-clipboard>
        </div>
        <p class="text-xs text-secondary">
          <foxy-i18n infer=${scope} key="helper_text"></foxy-i18n>
          <a
            class="text-body font-medium rounded-s hover-underline focus-outline-none focus-ring-2 focus-ring-primary-50"
            href=${this.storeSecretsPageUrl ?? '#store-secrets'}
          >
            <foxy-i18n infer=${scope} key="link_text"></foxy-i18n>
          </a>
        </p>
      </div>
    `;
  }
}
