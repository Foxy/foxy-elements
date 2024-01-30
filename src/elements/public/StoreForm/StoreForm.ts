import type { PropertyDeclarations } from 'lit-element';
import type { Resource, Graph } from '@foxy.io/sdk/core';
import type { Data, Templates } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Item } from '../../internal/InternalEditableListControl/types';
import type { Rels } from '@foxy.io/sdk/backend';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

import cloneDeep from 'lodash-es/cloneDeep';

const NS = 'store-form';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));

/**
 * Form element for store settings (`fx:store`).
 *
 * @slot store-name:before
 * @slot store-name:after
 *
 * @slot logo-url:before
 * @slot logo-url:after
 *
 * @slot store-domain:before
 * @slot store-domain:after
 *
 * @slot store-url:before
 * @slot store-url:after
 *
 * @slot store-email:before
 * @slot store-email:after
 *
 * @slot timezone:before
 * @slot timezone:after
 *
 * @slot store-version-uri:before
 * @slot store-version-uri:after
 *
 * @slot from-email:before
 * @slot from-email:after
 *
 * @slot bcc-on-receipt-email:before
 * @slot bcc-on-receipt-email:after
 *
 * @slot use-email-dns:before
 * @slot use-email-dns:after
 *
 * @slot use-smtp-config:before
 * @slot use-smtp-config:after
 *
 * @slot smtp-config:before
 * @slot smtp-config:after
 *
 * @slot smtp-config-host:before
 * @slot smtp-config-host:after
 *
 * @slot smtp-config-port:before
 * @slot smtp-config-port:after
 *
 * @slot smtp-config-username:before
 * @slot smtp-config-username:after
 *
 * @slot smtp-config-password:before
 * @slot smtp-config-password:after
 *
 * @slot smtp-config-security:before
 * @slot smtp-config-security:after
 *
 * @slot country:before
 * @slot country:after
 *
 * @slot region:before
 * @slot region:after
 *
 * @slot postal-code:before
 * @slot postal-code:after
 *
 * @slot shipping-address-type:before
 * @slot shipping-address-type:after
 *
 * @slot features-multiship:before
 * @slot features-multiship:after
 *
 * @slot require-signed-shipping-rates:before
 * @slot require-signed-shipping-rates:after
 *
 * @slot language:before
 * @slot language:after
 *
 * @slot locale-code:before
 * @slot locale-code:after
 *
 * @slot currency-style:before
 * @slot currency-style:after
 *
 * @slot custom-display-id-config:before
 * @slot custom-display-id-config:after
 *
 * @slot receipt-continue-url:before
 * @slot receipt-continue-url:after
 *
 * @slot app-session-time:before
 * @slot app-session-time:after
 *
 * @slot products-require-expires-property:before
 * @slot products-require-expires-property:after
 *
 * @slot use-cart-validation:before
 * @slot use-cart-validation:after
 *
 * @slot checkout-type:before
 * @slot checkout-type:after
 *
 * @slot customer-password-hash-type:before
 * @slot customer-password-hash-type:after
 *
 * @slot customer-password-hash-config:before
 * @slot customer-password-hash-config:after
 *
 * @slot unified-order-entry-password:before
 * @slot unified-order-entry-password:after
 *
 * @slot single-sign-on-url:before
 * @slot single-sign-on-url:after
 *
 * @slot webhook-url:before
 * @slot webhook-url:after
 *
 * @slot webhook-key-cart-signing:before
 * @slot webhook-key-cart-signing:after
 *
 * @slot webhook-key-xml-datafeed:before
 * @slot webhook-key-xml-datafeed:after
 *
 * @slot webhook-key-api-legacy:before
 * @slot webhook-key-api-legacy:after
 *
 * @slot webhook-key-sso:before
 * @slot webhook-key-sso:after
 *
 * @slot is-maintenance-mode:before
 * @slot is-maintenance-mode:after
 *
 * @slot timestamps:before
 * @slot timestamps:after
 *
 * @slot create:before
 * @slot create:after
 *
 * @slot delete:before
 * @slot delete:after
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

      ({ webhook_url: v, use_webhook }) => !use_webhook || !!v || 'webhook-url:v8n_required',

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
        return !v || String(v).length <= 100 || 'custom-display-id-config-enabled:v8n_too_long';
      },
    ];
  }

  /** URL of the `fx:customer_password_hash_types` property helper resource. */
  customerPasswordHashTypes: string | null = null;

  /** URL of the `fx:shipping_address_types` property helper resource. */
  shippingAddressTypes: string | null = null;

  /** URL of the `fx:store_versions` property helper resource. */
  storeVersions: string | null = null;

  /** URL of the `fx:checkout_types` property helper resource. */
  checkoutTypes: string | null = null;

  /** URL of the `fx:locale_codes` property helper resource. */
  localeCodes: string | null = null;

  /** URL of the `fx:languages` property helper resource. */
  languages: string | null = null;

  /** URL of the `fx:timezones` property helper resource. */
  timezones: string | null = null;

  /** URL of the `fx:countries` property helper resource. */
  countries: string | null = null;

  /** URL of the `fx:regions` property helper resource. */
  regions: string | null = null;

  /** Template render functions mapped to their name. */
  templates: Templates = {};

  private __singleCheckboxGroupOptions = [{ label: 'option_checked', value: 'checked' }];

  private __appSessionTimeOptions = [
    { value: 's', label: 'second' },
    { value: 'm', label: 'minute' },
    { value: 'h', label: 'hour' },
    { value: 'd', label: 'day' },
  ];

  private __getStoreEmailValue = (): Item[] => {
    const emails = this.form.store_email ?? '';
    return emails
      .split(',')
      .map(v => ({ value: v.trim() }))
      .filter(({ value }) => value.length > 0);
  };

  private __setStoreEmailValue = (newValue: Item[]) => {
    this.edit({ store_email: newValue.map(v => v.value).join(',') });
  };

  private __getBccOnReceiptEmailValue = () => {
    return this.form.bcc_on_receipt_email ? ['checked'] : [];
  };

  private __setBccOnReceiptEmailValue = (newValue: string[]) => {
    this.edit({ bcc_on_receipt_email: newValue.includes('checked') });
  };

  private __getUseEmailDnsValue = () => {
    return this.form.use_email_dns ? ['checked'] : [];
  };

  private __setUseEmailDnsValue = (newValue: string[]) => {
    this.edit({ use_email_dns: newValue.includes('checked') });
  };

  private __getUseSmtpConfigValue = () => {
    return this.form.smtp_config ? ['checked'] : [];
  };

  private __setUseSmtpConfigValue = (newValue: string[]) => {
    if (newValue.includes('checked')) {
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

  private __getFeaturesMultishipValue = () => {
    return this.form.features_multiship ? ['checked'] : [];
  };

  private __setFeaturesMultishipValue = (newValue: string[]) => {
    this.edit({ features_multiship: newValue.includes('checked') });
  };

  private __getRequireSignedShippingRatesValue = () => {
    return this.form.require_signed_shipping_rates ? ['checked'] : [];
  };

  private __setRequireSignedShippingRatesValue = (newValue: string[]) => {
    this.edit({ require_signed_shipping_rates: newValue.includes('checked') });
  };

  private __getAppSessionTimeValue = () => {
    const valueInSeconds = this.form.app_session_time || 43200;

    if (valueInSeconds % 86400 === 0) return `${valueInSeconds / 86400}d`;
    if (valueInSeconds % 3600 === 0) return `${valueInSeconds / 3600}h`;
    if (valueInSeconds % 60 === 0) return `${valueInSeconds / 60}m`;

    return `${valueInSeconds}s`;
  };

  private __setAppSessionTimeValue = (newValue: string) => {
    const units = newValue[newValue.length - 1];
    const count = parseInt(newValue.substring(0, newValue.length - 1));
    const map: Record<string, number> = { d: 86400, h: 3600, m: 60, s: 1 };

    this.edit({ app_session_time: map[units] * count });
  };

  private __getProductsRequireExpiresPropertyValue = () => {
    return this.form.products_require_expires_property ? ['checked'] : [];
  };

  private __setProductsRequireExpiresPropertyValue = (newValue: string[]) => {
    this.edit({ products_require_expires_property: newValue.includes('checked') });
  };

  private __getUseCartValidationValue = () => {
    return this.form.use_cart_validation ? ['checked'] : [];
  };

  private __setUseCartValidationValue = (newValue: string[]) => {
    this.edit({ use_cart_validation: newValue.includes('checked') });
  };

  private __getSingleSignOnUrlValue = () => {
    return this.form.use_single_sign_on ? this.form.single_sign_on_url ?? '' : '';
  };

  private __setSingleSignOnUrlValue = (newValue: string) => {
    this.edit({ use_single_sign_on: !!newValue, single_sign_on_url: newValue });
  };

  private __getWebhookUrlValue = () => {
    return this.form.use_webhook ? this.form.webhook_url ?? '' : '';
  };

  private __setWebhookUrlValue = (newValue: string) => {
    this.edit({ use_webhook: !!newValue, webhook_url: newValue });
  };

  private __setStoreDomainValue = (newValue: string) => {
    if (newValue.endsWith('.foxycart.com')) {
      const domain = newValue.substring(0, newValue.length - 13);
      this.edit({ store_domain: domain, use_remote_domain: domain.includes('.') });
    } else {
      this.edit({ store_domain: newValue, use_remote_domain: newValue.includes('.') });
    }
  };

  renderBody(): TemplateResult {
    const isUseEmailDnsWarningVisible =
      this.form.use_email_dns &&
      !this.data?.use_email_dns &&
      !this.hiddenSelector.matches('use-email-dns', true);

    const isRequireSignedShippingRatesWarningVisible =
      this.form.require_signed_shipping_rates &&
      !this.data?.require_signed_shipping_rates &&
      !this.hiddenSelector.matches('require-signed-shipping-rates', true);

    const isProductsRequireExpiresPropertyWarningVisible =
      this.form.products_require_expires_property &&
      !this.data?.products_require_expires_property &&
      !this.hiddenSelector.matches('products-require-expires-property', true);

    const isUseCartValidationWarningVisible =
      this.form.use_cart_validation &&
      !this.data?.use_cart_validation &&
      !this.hiddenSelector.matches('use-cart-validation', true);

    const storeDomainHelperText = this.t(
      this.form.use_remote_domain && !this.data?.use_remote_domain
        ? 'store-domain.custom_domain_note'
        : 'store-domain.helper_text'
    );

    const storeDomainSuffix =
      !this.form.store_domain || this.form.store_domain.includes('.') ? '' : '.foxycart.com';

    const customerPasswordHashTypesLoader = this.__renderLoader<Rels.CustomerPasswordHashTypes>(1);
    const shippingAddressTypesLoader = this.__renderLoader<Rels.ShippingAddressTypes>(2);
    const checkoutTypesLoader = this.__renderLoader<Rels.CheckoutTypes>(3);
    const storeVersionLoader = this.__renderLoader<Rels.StoreVersion>(4);
    const localeCodesLoader = this.__renderLoader<Rels.LocaleCodes>(5);
    const languagesLoader = this.__renderLoader<Rels.Languages>(6);
    const timezonesLoader = this.__renderLoader<Rels.Timezones>(7);
    const countriesLoader = this.__renderLoader<Rels.Countries>(8);
    const regionsLoader = this.__renderLoader<Rels.Regions>(9);

    const shippingAddressTypeEntries = Object.entries(
      shippingAddressTypesLoader?.data?.values ?? {}
    );

    const storeVersion = storeVersionLoader?.data;
    const localeCodes = localeCodesLoader?.data;
    const languages = languagesLoader?.data;
    const timezones = timezonesLoader?.data?.values.timezone ?? [];
    const countries = Object.values(countriesLoader?.data?.values ?? {});
    const regions = Object.values(regionsLoader?.data?.values ?? {});

    const customerPasswordHashTypeEntries = Object.entries(
      customerPasswordHashTypesLoader?.data?.values ?? {}
    );

    const checkoutTypeEntries = Object.entries(checkoutTypesLoader?.data?.values ?? {});
    const localeCodeEntries = Object.entries(localeCodes?.values ?? {});
    const languageEntries = Object.entries(languages?.values ?? {});

    const customerPasswordHashTypeOptions = customerPasswordHashTypeEntries.map(v => ({
      label: v[1].description,
      value: v[0],
    }));

    const shippingAddressTypeOptions = shippingAddressTypeEntries.map(([value, label]) => ({
      label,
      value,
    }));

    const checkoutTypeOptions = checkoutTypeEntries.map(([value, label]) => ({ label, value }));
    const localeCodeOptions = localeCodeEntries.map(([value, label]) => ({ value, label }));
    const languageOptions = languageEntries.map(([value, label]) => ({ value, label }));
    const timezoneOptions = timezones.map(t => ({ label: t.description, value: t.timezone }));
    const countryOptions = countries.map(c => ({ label: c.default, value: c.cc2 }));
    const regionOptions = regions.map(r => ({ label: r.default, value: r.code }));

    let regionsUrl: string | undefined;

    try {
      const regionsURL = new URL(this.regions ?? '');
      const country = this.form.country;
      if (country) regionsURL.searchParams.set('country_code', country);
      regionsUrl = regionsURL.toString();
    } catch {
      regionsUrl = undefined;
    }

    return html`
      ${customerPasswordHashTypesLoader.render(this.customerPasswordHashTypes)}
      ${shippingAddressTypesLoader.render(this.shippingAddressTypes)}
      ${checkoutTypesLoader.render(this.checkoutTypes)}
      ${storeVersionLoader.render(this.form.store_version_uri)}
      ${localeCodesLoader.render(this.localeCodes)} ${timezonesLoader.render(this.timezones)}
      ${countriesLoader.render(this.countries)} ${languagesLoader.render(this.languages)}
      ${regionsLoader.render(regionsUrl)}

      <div class="grid gap-m grid-cols-1 sm-grid-cols-2">
        <foxy-internal-text-control infer="store-name"></foxy-internal-text-control>

        <foxy-internal-text-control infer="logo-url"></foxy-internal-text-control>

        <foxy-internal-text-control
          helper-text=${storeDomainHelperText}
          suffix=${storeDomainSuffix}
          infer="store-domain"
          .setValue=${this.__setStoreDomainValue}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control infer="store-url"></foxy-internal-text-control>

        <foxy-internal-editable-list-control
          infer="store-email"
          class="sm-col-span-2"
          .getValue=${this.__getStoreEmailValue}
          .setValue=${this.__setStoreEmailValue}
        >
        </foxy-internal-editable-list-control>

        <foxy-internal-select-control
          infer="timezone"
          class="sm-col-span-2"
          .options=${timezoneOptions}
        >
        </foxy-internal-select-control>

        <foxy-internal-async-combo-box-control
          item-label-path="version"
          item-value-path="_links.self.href"
          infer="store-version-uri"
          first=${ifDefined(this.storeVersions ?? undefined)}
          .selectedItem=${storeVersion}
        >
        </foxy-internal-async-combo-box-control>

        <foxy-internal-text-control
          infer="from-email"
          class="sm-col-span-2"
          placeholder=${this.__getStoreEmailValue()[0]?.value ?? this.t('from-email.placeholder')}
        >
        </foxy-internal-text-control>

        <foxy-internal-checkbox-group-control
          infer="bcc-on-receipt-email"
          class="-mt-xs -mb-m sm-col-span-2"
          .getValue=${this.__getBccOnReceiptEmailValue}
          .setValue=${this.__setBccOnReceiptEmailValue}
          .options=${this.__singleCheckboxGroupOptions}
        >
        </foxy-internal-checkbox-group-control>

        <foxy-internal-checkbox-group-control
          infer="use-email-dns"
          class="-mt-xs -mb-m sm-col-span-2"
          .getValue=${this.__getUseEmailDnsValue}
          .setValue=${this.__setUseEmailDnsValue}
          .options=${this.__singleCheckboxGroupOptions}
        >
        </foxy-internal-checkbox-group-control>

        ${isUseEmailDnsWarningVisible
          ? this.__renderWarning('use_email_dns_helper_text', {
              href: 'https://wiki.foxycart.com/v/1.1/emails#how_emails_are_sent_spf_dkim_dmarc_etc',
              caption: 'How Emails Are Sent (SPF, DKIM, DMARC, etc.)',
            })
          : ''}

        <foxy-internal-checkbox-group-control
          infer="use-smtp-config"
          class="-mt-xs -mb-m sm-col-span-2"
          .getValue=${this.__getUseSmtpConfigValue}
          .setValue=${this.__setUseSmtpConfigValue}
          .options=${this.__singleCheckboxGroupOptions}
        >
        </foxy-internal-checkbox-group-control>

        ${this.form.smtp_config && !this.hiddenSelector.matches('smtp-config', true)
          ? this.__renderSmtpConfig()
          : ''}

        <foxy-internal-select-control infer="country" .options=${countryOptions}>
        </foxy-internal-select-control>

        <foxy-internal-select-control infer="region" .options=${regionOptions}>
        </foxy-internal-select-control>

        <foxy-internal-text-control infer="postal-code"></foxy-internal-text-control>

        <foxy-internal-select-control
          infer="shipping-address-type"
          .options=${shippingAddressTypeOptions}
        >
        </foxy-internal-select-control>

        <foxy-internal-checkbox-group-control
          infer="features-multiship"
          class="-mt-xs -mb-m sm-col-span-2"
          .getValue=${this.__getFeaturesMultishipValue}
          .setValue=${this.__setFeaturesMultishipValue}
          .options=${this.__singleCheckboxGroupOptions}
        >
        </foxy-internal-checkbox-group-control>

        <foxy-internal-checkbox-group-control
          infer="require-signed-shipping-rates"
          class="-mt-xs -mb-m sm-col-span-2"
          .getValue=${this.__getRequireSignedShippingRatesValue}
          .setValue=${this.__setRequireSignedShippingRatesValue}
          .options=${this.__singleCheckboxGroupOptions}
        >
        </foxy-internal-checkbox-group-control>

        ${isRequireSignedShippingRatesWarningVisible
          ? this.__renderWarning('require_signed_shipping_rates_helper_text')
          : ''}

        <foxy-internal-select-control infer="language" .options=${languageOptions}>
        </foxy-internal-select-control>

        <foxy-internal-select-control infer="locale-code" .options=${localeCodeOptions}>
        </foxy-internal-select-control>

        ${!this.hiddenSelector.matches('currency-style', true)
          ? this.__renderCurrencyStyleSelector()
          : ''}

        <!-- -->

        ${!this.hiddenSelector.matches('custom-display-id-config', true)
          ? this.__renderCustomIDSettings()
          : ''}

        <!-- -->

        <foxy-internal-text-control class="sm-col-span-2" infer="receipt-continue-url">
        </foxy-internal-text-control>

        <foxy-internal-frequency-control
          class="sm-col-span-2"
          infer="app-session-time"
          .getValue=${this.__getAppSessionTimeValue}
          .setValue=${this.__setAppSessionTimeValue}
          .options=${this.__appSessionTimeOptions}
        >
        </foxy-internal-frequency-control>

        <foxy-internal-checkbox-group-control
          infer="products-require-expires-property"
          class="-mt-xs -mb-m sm-col-span-2"
          .getValue=${this.__getProductsRequireExpiresPropertyValue}
          .setValue=${this.__setProductsRequireExpiresPropertyValue}
          .options=${this.__singleCheckboxGroupOptions}
        >
        </foxy-internal-checkbox-group-control>

        ${isProductsRequireExpiresPropertyWarningVisible
          ? this.__renderWarning('products_require_expires_property_helper_text')
          : ''}

        <foxy-internal-checkbox-group-control
          infer="use-cart-validation"
          class="-mt-xs -mb-m sm-col-span-2"
          .getValue=${this.__getUseCartValidationValue}
          .setValue=${this.__setUseCartValidationValue}
          .options=${this.__singleCheckboxGroupOptions}
        >
        </foxy-internal-checkbox-group-control>

        ${isUseCartValidationWarningVisible
          ? this.__renderWarning('use_cart_validation_helper_text', {
              href: 'https://wiki.foxycart.com/v/2.0/hmac_validation',
              caption: 'HMAC Product Verification: Locking Down your Add-To-Cart Links and Forms',
            })
          : ''}

        <foxy-internal-select-control
          infer="checkout-type"
          class="sm-col-span-2"
          .options=${checkoutTypeOptions}
        >
        </foxy-internal-select-control>

        <foxy-internal-select-control
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
              <foxy-internal-number-control infer="customer-password-hash-config">
              </foxy-internal-number-control>
            `
          : html`
              <foxy-internal-text-control infer="customer-password-hash-config">
              </foxy-internal-text-control>
            `}

        <foxy-internal-password-control infer="unified-order-entry-password">
        </foxy-internal-password-control>

        <foxy-internal-text-control
          infer="single-sign-on-url"
          .getValue=${this.__getSingleSignOnUrlValue}
          .setValue=${this.__setSingleSignOnUrlValue}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          infer="webhook-url"
          class="sm-col-span-2"
          .getValue=${this.__getWebhookUrlValue}
          .setValue=${this.__setWebhookUrlValue}
        >
        </foxy-internal-text-control>

        ${this.__renderWebhookKey()}

        <!-- -->

        ${this.data && !this.hiddenSelector.matches('is-maintenance-mode', true)
          ? this.__renderMaintenanceModeSwitch()
          : ''}
      </div>

      ${super.renderBody()}
    `;
  }

  private __renderWebhookKey() {
    type ParsedKey = {
      cart_signing: string;
      xml_datafeed: string;
      api_legacy: string;
      sso: string;
    };

    let parsedKey: ParsedKey;

    try {
      parsedKey = JSON.parse(this.form.webhook_key ?? '');
    } catch {
      const v = this.form.webhook_key ?? '';
      parsedKey = { cart_signing: v, xml_datafeed: v, api_legacy: v, sso: v };
    }

    return Object.keys(parsedKey).map(key => {
      return html`
        <foxy-internal-password-control
          infer="webhook-key-${key.replace('_', '-')}"
          .getValue=${() => parsedKey[key as keyof ParsedKey]}
          .setValue=${(newValue: string) => {
            parsedKey[key as keyof ParsedKey] = newValue;
            this.edit({ webhook_key: JSON.stringify(parsedKey) });
          }}
        >
        </foxy-internal-password-control>
      `;
    });
  }

  private __renderMaintenanceModeSwitch() {
    const isActive = !!this.data?.is_maintenance_mode;
    const buttonKey = `${isActive ? 'disable' : 'enable'}_maintenance_mode`;
    const explainerKey = `maintenance_mode_${isActive ? 'on' : 'off'}_explainer`;

    return html`
      <div
        data-testid="is-maintenance-mode"
        class=${classMap({
          'rounded leading-s text-s sm-col-span-2': true,
          'text-tertiary': !isActive,
          'text-error': isActive,
        })}
      >
        <foxy-i18n infer="" class="block mb-s" key=${explainerKey}></foxy-i18n>

        <vaadin-button
          theme="tertiary small ${isActive ? 'contrast' : ''}"
          class="p-0"
          ?disabled=${this.disabledSelector.matches('is-maintenance-mode', true)}
          @click=${() => {
            this.edit({ is_maintenance_mode: !this.form.is_maintenance_mode });
            this.submit();
          }}
        >
          <foxy-i18n infer="" key=${buttonKey}></foxy-i18n>
        </vaadin-button>
      </div>
    `;
  }

  private __renderCurrencyStyleSelector() {
    const map: Record<string, number> = {
      '101': 0,
      '100': 0,
      '001': 1,
      '000': 2,
      '111': 3,
      '110': 3,
      '011': 4,
      '010': 5,
    };

    const selectionCode = [
      this.form.hide_currency_symbol,
      this.form.hide_decimal_characters,
      this.form.use_international_currency_symbol,
    ]
      .map(v => Number(Boolean(v)))
      .join('');

    const selectionIndex = map[selectionCode];
    const isDisabled = this.disabledSelector.matches('currency-style', true);
    const isReadonly = this.readonlySelector.matches('currency-style', true);

    return html`
      <div data-testid="currency-style" class="sm-col-span-2">
        ${this.renderTemplateOrSlot('currency-style:before')}

        <div
          class="grid grid-cols-1 gap-xs transition-colors text-secondary hover-text-body sm-col-span-2"
        >
          <foxy-i18n infer="" class="font-medium text-s" key="currency_style_label"></foxy-i18n>

          <div class="grid grid-cols-3 bg-contrast-10 rounded" style="gap: 1px; padding: 1px">
            ${['12.34', 'USD 12.34', '$12.34', '12', 'USD 12', '$12'].map((example, index) => {
              return html`
                <label
                  style="--lumo-border-radius: calc(var(--lumo-border-radius-m) - 1px)"
                  class=${classMap({
                    'relative z-0 px-s h-m flex items-center transition-colors': true,
                    'hover-cursor-pointer': true,
                    'focus-within-z-10 focus-within-ring-2 focus-within-ring-primary-50': true,
                    'bg-base text-body hover-bg-transparent': index !== selectionIndex,
                    'bg-primary text-primary-contrast': index === selectionIndex,
                    'rounded-tl': index === 0,
                    'rounded-tr': index === 2,
                    'rounded-bl': index === 3,
                    'rounded-br': index === 5,
                  })}
                >
                  <span class="font-medium font-tnum">${example}</span>
                  <input
                    class="sr-only"
                    value=${index}
                    type="radio"
                    name="currency-style"
                    ?checked=${index === selectionIndex}
                    ?disabled=${isDisabled}
                    ?readonly=${isReadonly}
                    @change=${() => {
                      const set = Object.entries(map).find(v => v[1] === index)![0];

                      this.edit({
                        hide_currency_symbol: Boolean(Number(set[0])),
                        hide_decimal_characters: Boolean(Number(set[1])),
                        use_international_currency_symbol: Boolean(Number(set[2])),
                      });
                    }}
                  />
                </label>
              `;
            })}
          </div>

          <foxy-i18n infer="" class="text-xs" key="currency_style_helper_text"></foxy-i18n>
        </div>

        ${this.renderTemplateOrSlot('currency-style:after')}
      </div>
    `;
  }

  private __renderCustomIDSettings() {
    const defaultConfig = {
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

    let config: typeof defaultConfig;

    try {
      config = JSON.parse(this.form.custom_display_id_config ?? '');
    } catch {
      config = cloneDeep(defaultConfig);
    }

    const startAsInt = parseInt(config.start || '0');
    const lengthAsInt = parseInt(config.length || '0');
    const numericLength = lengthAsInt - config.prefix.length - config.suffix.length;
    const randomExampleNumericId = Math.min(
      startAsInt + Math.floor(Math.random() * Math.pow(10, numericLength)),
      Math.pow(10, numericLength) - 1
    );

    const randomExampleId = `${config.prefix}${randomExampleNumericId
      .toString()
      .padStart(numericLength, '0')}${config.suffix}`;

    const randomNumericEntryId = Math.floor(Math.random() * 1000);
    const randomEntryId = String(randomNumericEntryId).padStart(3, '0');

    return html`
      <foxy-internal-checkbox-group-control
        infer="custom-display-id-config-enabled"
        class="-mt-xs -mb-m sm-col-span-2"
        .getValue=${() => (config.enabled ? ['checked'] : [])}
        .setValue=${(newValue: string[]) => {
          config.enabled = newValue.includes('checked');
          this.edit({ custom_display_id_config: JSON.stringify(config) });
        }}
        .options=${this.__singleCheckboxGroupOptions}
      >
      </foxy-internal-checkbox-group-control>

      ${config.enabled
        ? html`
            <div
              class="rounded-t-l rounded-b-l border border-contrast-10 p-m grid grid-cols-2 gap-m sm-col-span-2"
            >
              <foxy-internal-integer-control
                infer="custom-display-id-config-start"
                min="0"
                .getValue=${() => parseInt(config.start || '0')}
                .setValue=${(newValue: number) => {
                  config.start = String(newValue);
                  this.edit({ custom_display_id_config: JSON.stringify(config) });
                }}
              >
              </foxy-internal-integer-control>

              <foxy-internal-integer-control
                infer="custom-display-id-config-length"
                min="0"
                .getValue=${() => parseInt(config.length || '0')}
                .setValue=${(newValue: number) => {
                  config.length = String(newValue);
                  this.edit({ custom_display_id_config: JSON.stringify(config) });
                }}
              >
              </foxy-internal-integer-control>

              <foxy-internal-text-control
                infer="custom-display-id-config-prefix"
                .getValue=${() => config.prefix}
                .setValue=${(newValue: string) => {
                  config.prefix = newValue;
                  this.edit({ custom_display_id_config: JSON.stringify(config) });
                }}
              >
              </foxy-internal-text-control>

              <foxy-internal-text-control
                infer="custom-display-id-config-suffix"
                .getValue=${() => config.suffix}
                .setValue=${(newValue: string) => {
                  config.suffix = newValue;
                  this.edit({ custom_display_id_config: JSON.stringify(config) });
                }}
              >
              </foxy-internal-text-control>

              ${config.start && config.length && startAsInt / 10 <= numericLength
                ? html`
                    <table
                      data-testid="custom-display-id-config-examples"
                      style="font-family: monospace"
                      class="col-span-2 text-xs text-secondary whitespace-nowrap"
                    >
                      <tbody>
                        <tr>
                          <td style="width: 1%">
                            <foxy-i18n infer="" key="custom-display-id-config-first-example">
                            </foxy-i18n>
                          </td>
                          <td>
                            ${config.prefix}${startAsInt
                              .toString()
                              .padStart(numericLength, '0')}${config.suffix}
                          </td>
                        </tr>
                        <tr style="width: 1%">
                          <td>
                            <foxy-i18n infer="" key="custom-display-id-config-random-example">
                            </foxy-i18n>
                          </td>
                          <td>${randomExampleId}</td>
                        </tr>
                      </tbody>
                    </table>
                  `
                : ''}
            </div>

            <foxy-internal-checkbox-group-control
              infer="custom-display-id-config-transaction-journal-entries-enabled"
              class="-mt-xs -mb-m sm-col-span-2"
              .getValue=${() => (config.transaction_journal_entries.enabled ? ['checked'] : [])}
              .setValue=${(newValue: string[]) => {
                config.transaction_journal_entries.enabled = newValue.includes('checked');
                this.edit({ custom_display_id_config: JSON.stringify(config) });
              }}
              .options=${this.__singleCheckboxGroupOptions}
            >
            </foxy-internal-checkbox-group-control>

            ${config.transaction_journal_entries.enabled
              ? html`
                  <div
                    class="rounded-t-l rounded-b-l border border-contrast-10 p-m grid grid-cols-2 gap-m sm-col-span-2"
                  >
                    <foxy-internal-text-control
                      infer="custom-display-id-config-transaction-journal-entries-transaction-separator"
                      class="col-span-2"
                      .getValue=${() => config.transaction_journal_entries.transaction_separator}
                      .setValue=${(newValue: string) => {
                        config.transaction_journal_entries.transaction_separator = newValue;
                        this.edit({ custom_display_id_config: JSON.stringify(config) });
                      }}
                    >
                    </foxy-internal-text-control>

                    <foxy-internal-text-control
                      infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-authcapture-prefix"
                      .getValue=${() =>
                        config.transaction_journal_entries.log_detail_request_types
                          .transaction_authcapture.prefix}
                      .setValue=${(newValue: string) => {
                        config.transaction_journal_entries.log_detail_request_types.transaction_authcapture.prefix =
                          newValue;
                        this.edit({ custom_display_id_config: JSON.stringify(config) });
                      }}
                    >
                    </foxy-internal-text-control>

                    <foxy-internal-text-control
                      infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-capture-prefix"
                      .getValue=${() =>
                        config.transaction_journal_entries.log_detail_request_types
                          .transaction_capture.prefix}
                      .setValue=${(newValue: string) => {
                        config.transaction_journal_entries.log_detail_request_types.transaction_capture.prefix =
                          newValue;
                        this.edit({ custom_display_id_config: JSON.stringify(config) });
                      }}
                    >
                    </foxy-internal-text-control>

                    <foxy-internal-text-control
                      infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-void-prefix"
                      .getValue=${() =>
                        config.transaction_journal_entries.log_detail_request_types.transaction_void
                          .prefix}
                      .setValue=${(newValue: string) => {
                        config.transaction_journal_entries.log_detail_request_types.transaction_void.prefix =
                          newValue;
                        this.edit({ custom_display_id_config: JSON.stringify(config) });
                      }}
                    >
                    </foxy-internal-text-control>

                    <foxy-internal-text-control
                      infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-refund-prefix"
                      .getValue=${() =>
                        config.transaction_journal_entries.log_detail_request_types
                          .transaction_refund.prefix}
                      .setValue=${(newValue: string) => {
                        config.transaction_journal_entries.log_detail_request_types.transaction_refund.prefix =
                          newValue;
                        this.edit({ custom_display_id_config: JSON.stringify(config) });
                      }}
                    >
                    </foxy-internal-text-control>

                    ${config.start && config.length && startAsInt / 10 <= numericLength
                      ? html`
                          <table
                            data-testid="custom-display-id-config-transaction-journal-entries-examples"
                            style="font-family: monospace"
                            class="col-span-2 text-xs text-secondary whitespace-nowrap"
                          >
                            <tbody>
                              <tr>
                                <td style="width: 1%">
                                  <foxy-i18n
                                    infer=""
                                    key="custom-display-id-config-transaction-journal-entries-authcapture-example"
                                  >
                                  </foxy-i18n>
                                </td>
                                <td>
                                  ${randomExampleId}${config.transaction_journal_entries
                                    .transaction_separator}${config.transaction_journal_entries
                                    .log_detail_request_types.transaction_authcapture
                                    .prefix}${randomEntryId}
                                </td>
                              </tr>
                              <tr>
                                <td style="width: 1%">
                                  <foxy-i18n
                                    infer=""
                                    key="custom-display-id-config-transaction-journal-entries-capture-example"
                                  >
                                  </foxy-i18n>
                                </td>
                                <td>
                                  ${randomExampleId}${config.transaction_journal_entries
                                    .transaction_separator}${config.transaction_journal_entries
                                    .log_detail_request_types.transaction_capture
                                    .prefix}${randomEntryId}
                                </td>
                              </tr>
                              <tr>
                                <td style="width: 1%">
                                  <foxy-i18n
                                    infer=""
                                    key="custom-display-id-config-transaction-journal-entries-void-example"
                                  >
                                  </foxy-i18n>
                                </td>
                                <td>
                                  ${randomExampleId}${config.transaction_journal_entries
                                    .transaction_separator}${config.transaction_journal_entries
                                    .log_detail_request_types.transaction_void
                                    .prefix}${randomEntryId}
                                </td>
                              </tr>
                              <tr>
                                <td style="width: 1%">
                                  <foxy-i18n
                                    infer=""
                                    key="custom-display-id-config-transaction-journal-entries-refund-example"
                                  >
                                  </foxy-i18n>
                                </td>
                                <td>
                                  ${randomExampleId}${config.transaction_journal_entries
                                    .transaction_separator}${config.transaction_journal_entries
                                    .log_detail_request_types.transaction_refund
                                    .prefix}${randomEntryId}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        `
                      : ''}
                  </div>
                `
              : ''}
          `
        : ''}
    `;
  }

  private __renderSmtpConfig() {
    return html`
      <div
        class="grid grid-cols-2 gap-m p-m rounded-t-l rounded-b-l border border-contrast-10 sm-col-span-2"
      >
        ${['host', 'port', 'username', 'password', 'security'].map(prop => {
          const getValue = () => {
            const config = JSON.parse(this.form.smtp_config || '{}');
            return config[prop];
          };

          const setValue = (newValue: string) => {
            const config = JSON.parse(this.form.smtp_config || '{}');
            this.edit({
              smtp_config: JSON.stringify({
                username: config.username ?? '',
                password: config.password ?? '',
                security: config.security ?? '',
                host: config.host ?? '',
                port: config.port ?? '',
                [prop]: newValue,
              }),
            });
          };

          const infer = `smtp-config-${prop}`;

          if (prop === 'password') {
            return html`
              <foxy-internal-password-control
                infer=${infer}
                .getValue=${getValue}
                .setValue=${setValue}
              >
              </foxy-internal-password-control>
            `;
          } else if (prop === 'port') {
            return html`
              <foxy-internal-integer-control
                infer=${infer}
                .getValue=${getValue}
                .setValue=${setValue}
              >
              </foxy-internal-integer-control>
            `;
          } else if (prop === 'security') {
            return html`
              <foxy-internal-radio-group-control
                infer=${infer}
                class="-mt-xs -mx-xs -mb-m col-span-2"
                .getValue=${getValue}
                .setValue=${setValue}
                .options=${[
                  { label: 'option_ssl', value: 'ssl' },
                  { label: 'option_tls', value: 'tls' },
                  { label: 'option_none', value: '' },
                ]}
              >
              </foxy-internal-radio-group-control>
            `;
          } else {
            return html`
              <foxy-internal-text-control
                infer=${infer}
                .getValue=${getValue}
                .setValue=${setValue}
              >
              </foxy-internal-text-control>
            `;
          }
        })}
      </div>
    `;
  }

  private __renderWarning(key: string, link?: { href: string; caption: string }) {
    return html`
      <div class="p-s leading-m text-s rounded bg-primary-10 text-primary sm-col-span-2">
        <foxy-i18n infer="" key=${key}></foxy-i18n>

        ${link
          ? html`
              <a
                target="_blank"
                class="font-medium hover-underline rounded focus-outline-none focus-ring-2 focus-ring-primary"
                href=${link.href}
                lang="en"
              >
                ${link.caption}
                <iron-icon class="icon-inline" icon="icons:open-in-new"></iron-icon>
              </a>
            `
          : ''}
      </div>
    `;
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
