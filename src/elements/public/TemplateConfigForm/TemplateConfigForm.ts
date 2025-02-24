import type { Data, TemplateConfigJSON } from './types';
import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { getDefaultJSON } from './defaults';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-html';

const NS = 'template-config-form';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));

/**
 * Form element for creating or editing template configs (`fx:template_config`).
 *
 * @element foxy-template-config-form
 * @since 1.14.0
 */
export class TemplateConfigForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      countries: {},
      regions: {},
      store: {},
    };
  }

  /** URI of the `fx:countries` hAPI resource with `?include_regions=true`. */
  countries: string | null = null;

  /** @deprecated URI of the `fx:regions` hAPI resource. */
  regions: string | null = null;

  /** URI of the `fx:store` hAPI resource related to this template config. If this property is `null`, a link relationship will be used when available. */
  store: string | null = null;

  private readonly __customCheckoutFieldCouponEntryRequirementsOptions = JSON.stringify([
    { label: 'option_enabled', value: 'enabled' },
    { label: 'option_disabled', value: 'disabled' },
  ]);

  private readonly __customCheckoutFieldRequirementsOptions = JSON.stringify([
    { label: 'option_default', value: 'default' },
    { label: 'option_optional', value: 'optional' },
    { label: 'option_required', value: 'required' },
    { label: 'option_hidden', value: 'hidden' },
  ]);

  private readonly __tosCheckboxSettingsInitialStateOptions = JSON.stringify([
    { label: 'option_checked', value: 'checked' },
    { label: 'option_unchecked', value: 'unchecked' },
  ]);

  private readonly __locationFilteringFilterTypeOptions = JSON.stringify([
    { label: 'option_blocklist', value: 'blacklist' },
    { label: 'option_allowlist', value: 'whitelist' },
  ]);

  private readonly __foxycompleteShowComboboxOptions = JSON.stringify([
    { label: 'option_combobox', value: 'combobox' },
    { label: 'option_search', value: 'search' },
  ]);

  private readonly __tosCheckboxSettingsUsageOptions = JSON.stringify([
    { label: 'option_none', value: 'none' },
    { label: 'option_optional', value: 'optional' },
    { label: 'option_required', value: 'required' },
  ]);

  private readonly __locationFilteringUsageOptions = JSON.stringify([
    { label: 'option_none', value: 'none' },
    { label: 'option_shipping', value: 'shipping' },
    { label: 'option_billing', value: 'billing' },
    { label: 'option_both', value: 'both' },
    { label: 'option_independent', value: 'independent' },
  ]);

  private readonly __cscRequirementsValueOptions = JSON.stringify([
    { label: 'option_all_cards', value: 'all_cards' },
    { label: 'option_sso_only', value: 'sso_only' },
    { label: 'option_new_cards_only', value: 'new_cards_only' },
  ]);

  private readonly __checkoutTypeDefaultOptions = JSON.stringify([
    { label: 'option_default_account', value: 'default_account' },
    { label: 'option_default_guest', value: 'default_guest' },
  ]);

  private readonly __checkoutTypeAccountOptions = JSON.stringify([
    { label: 'option_account', value: 'account_only' },
    { label: 'option_guest', value: 'guest_only' },
    { label: 'option_both', value: 'default_guest' },
  ]);

  private readonly __cartTypeOptions = JSON.stringify([
    { label: 'option_default', value: 'default' },
    { label: 'option_fullpage', value: 'fullpage' },
    { label: 'option_custom', value: 'custom' },
  ]);

  private readonly __locationFilteringFilterValuesSetValue = (
    newValue: Record<string, '*' | string[]>
  ) => {
    const formJson = this.__formJson;
    const newConfig = {
      ...formJson.location_filtering,
      shipping_filter_values: newValue,
      billing_filter_values: newValue,
    };

    this.edit({ json: JSON.stringify({ ...formJson, location_filtering: newConfig }) });
  };

  private readonly __locationFilteringFilterTypeSetValue = (value: string) => {
    const formJson = this.__formJson;
    const newValue = {
      ...formJson.location_filtering,
      shipping_filter_type: value,
      billing_filter_type: value,
    };

    this.edit({ json: JSON.stringify({ ...formJson, location_filtering: newValue }) });
  };

  private readonly __foxycompleteShowComboboxGetValue = () => {
    return this.__formJson.foxycomplete.show_combobox ? 'combobox' : 'search';
  };

  private readonly __foxycompleteShowComboboxSetValue = (value: string) => {
    const newValue = value === 'combobox';
    const foxycomplete = { ...this.__formJson.foxycomplete, show_combobox: newValue };
    this.edit({ json: JSON.stringify({ ...this.__formJson, foxycomplete }) });
  };

  private readonly __checkoutTypeAccountGetValue = () => {
    const formJson = this.__formJson;
    return formJson.checkout_type.includes('default') ? 'default_guest' : formJson.checkout_type;
  };

  private readonly __customConfigGetValue = () => {
    const formJson = this.__formJson;
    if (typeof formJson.custom_config === 'string') return formJson.custom_config;
    return JSON.stringify(formJson.custom_config, null, 2);
  };

  private readonly __customConfigSetValue = (newValue: string) => {
    const formJson = this.__formJson;

    try {
      formJson.custom_config = JSON.parse(newValue);
    } catch {
      formJson.custom_config = newValue;
    }

    this.edit({ json: JSON.stringify(formJson) });
  };

  private readonly __defaultJSON = JSON.stringify(getDefaultJSON());

  get hiddenSelector(): BooleanSelector {
    const alwaysHidden = [super.hiddenSelector.toString()];

    const dataJson = this.__dataJson;
    const formJson = this.__formJson;

    const locationFilteringUsage = formJson.location_filtering.usage;
    const checkoutType = formJson.checkout_type;

    if (formJson.cart_display_config.usage !== 'required') {
      alwaysHidden.unshift('cart-group-two', 'cart-group-three', 'cart-group-four');
    }

    if (formJson.foxycomplete.usage !== 'required') {
      alwaysHidden.unshift(
        'country-and-region-group-one:foxycomplete-show-combobox',
        'country-and-region-group-one:foxycomplete-combobox-open',
        'country-and-region-group-one:foxycomplete-combobox-close',
        'country-and-region-group-one:foxycomplete-show-flags'
      );
    }

    if (formJson.foxycomplete.show_combobox === false) {
      alwaysHidden.unshift(
        'country-and-region-group-one:foxycomplete-combobox-open',
        'country-and-region-group-one:foxycomplete-combobox-close'
      );
    }

    if (locationFilteringUsage !== 'both') {
      alwaysHidden.unshift('country-and-region-group-two');
    }

    if (locationFilteringUsage !== 'shipping' && locationFilteringUsage !== 'independent') {
      alwaysHidden.unshift('country-and-region-group-three');
    }

    if (locationFilteringUsage !== 'billing' && locationFilteringUsage !== 'independent') {
      alwaysHidden.unshift('country-and-region-group-four');
    }

    if (checkoutType !== 'default_account' && checkoutType !== 'default_guest') {
      alwaysHidden.unshift('customer-accounts:checkout-type-default');
    }

    if (formJson.tos_checkbox_settings.usage === 'none') {
      alwaysHidden.unshift(
        'consent-group-one:tos-checkbox-settings-url',
        'consent-group-one:tos-checkbox-settings-initial-state',
        'consent-group-one:tos-checkbox-settings-is-hidden'
      );
    }

    if (formJson.analytics_config.usage !== 'required') {
      alwaysHidden.unshift('analytics-config-google-analytics', 'analytics-config-google-tag');
    }

    if (dataJson?.analytics_config.google_analytics.usage !== 'required') {
      alwaysHidden.unshift('analytics-config-google-analytics');
    }

    if (formJson.analytics_config.google_analytics.usage !== 'required') {
      alwaysHidden.unshift(
        'analytics-config-google-analytics:analytics-config-google-analytics-account-id',
        'analytics-config-google-analytics:analytics-config-google-analytics-include-on-site'
      );
    }

    if (formJson.analytics_config.google_tag.usage !== 'required') {
      alwaysHidden.unshift('analytics-config-google-tag:analytics-config-google-tag-account-id');
      alwaysHidden.unshift('analytics-config-google-tag:analytics-config-google-tag-send-to');
    }

    if (this.__storeLoader?.data?.features_multiship !== true) {
      alwaysHidden.unshift('custom-script-values-multiship-checkout-fields');
    }

    return new BooleanSelector(alwaysHidden.join(' ').trim());
  }

  renderBody(): TemplateResult {
    const customCheckoutFieldRequirementsControls = [
      [
        'billing_address1',
        'billing_address2',
        'billing_city',
        'billing_region',
        'billing_postal_code',
        'billing_country',
      ],
      [
        'billing_first_name',
        'billing_last_name',
        'billing_company',
        'billing_tax_id',
        'billing_phone',
        'coupon_entry',
      ],
    ];

    const cartDisplayConfigFields = [
      ['show_product_weight', 'show_product_category', 'show_product_code', 'show_product_options'],
      ['show_sub_frequency', 'show_sub_startdate', 'show_sub_nextdate', 'show_sub_enddate'],
    ];

    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="cart-group-one">
        <foxy-internal-select-control
          json-template=${this.__defaultJSON}
          json-path="cart_type"
          property="json"
          options=${this.__cartTypeOptions}
          layout="summary-item"
          infer="cart-type"
        >
        </foxy-internal-select-control>

        <foxy-internal-switch-control
          json-template=${this.__defaultJSON}
          false-alias="none"
          true-alias="required"
          json-path="cart_display_config.usage"
          property="json"
          infer="cart-display-config-usage"
          invert
        >
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <div
        class="grid sm-grid-cols-2 gap-m"
        ?hidden=${cartDisplayConfigFields.every((group, index) => {
          return group.every(prop => {
            const suffix = index === 0 ? 'two' : 'three';
            const sel = `cart-group-${suffix}:cart-display-config-${prop.replace(/_/g, '-')}`;
            return this.hiddenSelector.matches(sel, true);
          });
        })}
      >
        ${cartDisplayConfigFields.map((group, index) => {
          const suffix = index === 0 ? 'two' : 'three';
          return html`
            <foxy-internal-summary-control infer="cart-group-${suffix}">
              ${group.map(prop => {
                return html`
                  <foxy-internal-switch-control
                    json-template=${this.__defaultJSON}
                    json-path="cart_display_config.${prop}"
                    property="json"
                    infer="cart-display-config-${prop.replace(/_/g, '-')}"
                  >
                  </foxy-internal-switch-control>
                `;
              })}
            </foxy-internal-summary-control>
          `;
        })}
      </div>

      <foxy-internal-summary-control infer="cart-group-four">
        <foxy-internal-editable-list-control
          json-template=${this.__defaultJSON}
          json-path="cart_display_config.hidden_product_options"
          property="json"
          layout="summary-item"
          infer="cart-display-config-hidden-product-options"
          simple-value
        >
        </foxy-internal-editable-list-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="country-and-region-group-one">
        <foxy-internal-switch-control
          json-template=${this.__defaultJSON}
          false-alias="none"
          true-alias="required"
          json-path="foxycomplete.usage"
          property="json"
          infer="foxycomplete-usage"
        >
        </foxy-internal-switch-control>

        <foxy-internal-select-control
          options=${this.__foxycompleteShowComboboxOptions}
          layout="summary-item"
          infer="foxycomplete-show-combobox"
          .getValue=${this.__foxycompleteShowComboboxGetValue}
          .setValue=${this.__foxycompleteShowComboboxSetValue}
        >
        </foxy-internal-select-control>

        <foxy-internal-text-control
          json-template=${this.__defaultJSON}
          json-path="foxycomplete.combobox_open"
          property="json"
          layout="summary-item"
          infer="foxycomplete-combobox-open"
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          json-template=${this.__defaultJSON}
          json-path="foxycomplete.combobox_close"
          property="json"
          layout="summary-item"
          infer="foxycomplete-combobox-close"
        >
        </foxy-internal-text-control>

        <foxy-internal-switch-control
          json-template=${this.__defaultJSON}
          json-path="foxycomplete.show_flags"
          property="json"
          infer="foxycomplete-show-flags"
        >
        </foxy-internal-switch-control>

        <foxy-internal-switch-control
          json-template=${this.__defaultJSON}
          false-alias="none"
          true-alias="enabled"
          json-path="postal_code_lookup.usage"
          property="json"
          infer="postal-code-lookup"
        >
        </foxy-internal-switch-control>

        <foxy-internal-select-control
          json-template=${this.__defaultJSON}
          json-path="location_filtering.usage"
          property="json"
          options=${this.__locationFilteringUsageOptions}
          layout="summary-item"
          infer="location-filtering-usage"
        >
        </foxy-internal-select-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="country-and-region-group-two">
        <foxy-internal-select-control
          json-template=${this.__defaultJSON}
          json-path="location_filtering.shipping_filter_type"
          property="json"
          options=${this.__locationFilteringFilterTypeOptions}
          layout="summary-item"
          infer="location-filtering-filter-type"
          .setValue=${this.__locationFilteringFilterTypeSetValue}
        >
        </foxy-internal-select-control>

        <foxy-internal-template-config-form-filter-values-control
          json-template=${this.__defaultJSON}
          json-path="location_filtering.shipping_filter_values"
          countries=${ifDefined(this.countries ?? void 0)}
          property="json"
          infer="location-filtering-filter-values"
          .setValue=${this.__locationFilteringFilterValuesSetValue}
        >
        </foxy-internal-template-config-form-filter-values-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="country-and-region-group-three">
        <foxy-internal-select-control
          json-template=${this.__defaultJSON}
          json-path="location_filtering.shipping_filter_type"
          property="json"
          options=${this.__locationFilteringFilterTypeOptions}
          layout="summary-item"
          infer="location-filtering-shipping-filter-type"
        >
        </foxy-internal-select-control>

        <foxy-internal-template-config-form-filter-values-control
          json-template=${this.__defaultJSON}
          json-path="location_filtering.shipping_filter_values"
          countries=${ifDefined(this.countries ?? void 0)}
          property="json"
          infer="location-filtering-shipping-filter-values"
        >
        </foxy-internal-template-config-form-filter-values-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="country-and-region-group-four">
        <foxy-internal-select-control
          json-template=${this.__defaultJSON}
          json-path="location_filtering.billing_filter_type"
          property="json"
          options=${this.__locationFilteringFilterTypeOptions}
          layout="summary-item"
          infer="location-filtering-billing-filter-type"
        >
        </foxy-internal-select-control>

        <foxy-internal-template-config-form-filter-values-control
          json-template=${this.__defaultJSON}
          json-path="location_filtering.billing_filter_values"
          countries=${ifDefined(this.countries ?? void 0)}
          property="json"
          infer="location-filtering-billing-filter-values"
        >
        </foxy-internal-template-config-form-filter-values-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="customer-accounts">
        <foxy-internal-select-control
          json-template=${this.__defaultJSON}
          json-path="checkout_type"
          property="json"
          options=${this.__checkoutTypeAccountOptions}
          layout="summary-item"
          infer="checkout-type-account"
          .getValue=${this.__checkoutTypeAccountGetValue}
        >
        </foxy-internal-select-control>

        <foxy-internal-select-control
          json-template=${this.__defaultJSON}
          json-path="checkout_type"
          property="json"
          options=${this.__checkoutTypeDefaultOptions}
          layout="summary-item"
          infer="checkout-type-default"
        >
        </foxy-internal-select-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="consent-group-one">
        <foxy-internal-select-control
          json-template=${this.__defaultJSON}
          json-path="tos_checkbox_settings.usage"
          property="json"
          options=${this.__tosCheckboxSettingsUsageOptions}
          layout="summary-item"
          infer="tos-checkbox-settings-usage"
        >
        </foxy-internal-select-control>

        <foxy-internal-text-control
          json-template=${this.__defaultJSON}
          json-path="tos_checkbox_settings.url"
          property="json"
          layout="summary-item"
          infer="tos-checkbox-settings-url"
        >
        </foxy-internal-text-control>

        <foxy-internal-select-control
          json-template=${this.__defaultJSON}
          json-path="tos_checkbox_settings.initial_state"
          property="json"
          options=${this.__tosCheckboxSettingsInitialStateOptions}
          layout="summary-item"
          infer="tos-checkbox-settings-initial-state"
        >
        </foxy-internal-select-control>

        <foxy-internal-switch-control
          json-template=${this.__defaultJSON}
          json-path="tos_checkbox_settings.is_hidden"
          property="json"
          infer="tos-checkbox-settings-is-hidden"
        >
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="consent-group-two">
        <foxy-internal-switch-control
          json-template=${this.__defaultJSON}
          false-alias="none"
          true-alias="required"
          json-path="eu_secure_data_transfer_consent.usage"
          property="json"
          infer="eu-secure-data-transfer-consent-usage"
        >
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="consent-group-three">
        <foxy-internal-switch-control
          json-template=${this.__defaultJSON}
          false-alias="none"
          true-alias="required"
          json-path="newsletter_subscribe.usage"
          property="json"
          infer="newsletter-subscribe-usage"
        >
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="supported-cards-group">
        <foxy-internal-template-config-form-supported-cards-control
          json-template=${this.__defaultJSON}
          json-path="supported_payment_cards"
          property="json"
          infer="supported-payment-cards"
        >
        </foxy-internal-template-config-form-supported-cards-control>

        <p class="flex items-start gap-s">
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="flex-shrink-0 text-primary" style="width: 1.25em"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>`}
          <foxy-i18n infer="" key="disclaimer"></foxy-i18n>
        </p>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="csc-requirements-group">
        <foxy-internal-select-control
          json-template=${this.__defaultJSON}
          json-path="csc_requirements"
          property="json"
          options=${this.__cscRequirementsValueOptions}
          layout="summary-item"
          infer="csc-requirements"
        >
        </foxy-internal-select-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="checkout-fields-group-one">
        <foxy-internal-switch-control
          json-template=${this.__defaultJSON}
          false-alias="disabled"
          true-alias="enabled"
          json-path="custom_checkout_field_requirements.cart_controls"
          property="json"
          infer="custom-checkout-field-requirements-cart-controls"
        >
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <div
        class="grid sm-grid-cols-2 gap-m"
        ?hidden=${customCheckoutFieldRequirementsControls.every((group, index) => {
          return group.every(prop => {
            const suffix = index === 0 ? 'two' : 'three';
            const infer = prop.replace(/_/g, '-').replace('1', '-one').replace('2', '-two');
            const sel = `checkout-fields-group-${suffix}:custom-checkout-field-requirements-${infer}`;
            return this.hiddenSelector.matches(sel, true);
          });
        })}
      >
        ${customCheckoutFieldRequirementsControls.map((group, index) => {
          const suffix = index === 0 ? 'two' : 'three';
          return html`
            <foxy-internal-summary-control infer="checkout-fields-group-${suffix}">
              ${group.map(prop => {
                const infer = prop.replace(/_/g, '-').replace('1', '-one').replace('2', '-two');
                const path = `custom_checkout_field_requirements.${prop}`;
                return html`
                  <foxy-internal-select-control
                    json-template=${this.__defaultJSON}
                    json-path=${path}
                    property="json"
                    options=${prop === 'coupon_entry'
                      ? this.__customCheckoutFieldCouponEntryRequirementsOptions
                      : this.__customCheckoutFieldRequirementsOptions}
                    layout="summary-item"
                    infer="custom-checkout-field-requirements-${infer}"
                  >
                  </foxy-internal-select-control>
                `;
              })}
            </foxy-internal-summary-control>
          `;
        })}
      </div>

      <foxy-internal-summary-control infer="analytics-config">
        <foxy-internal-switch-control
          json-template=${this.__defaultJSON}
          false-alias="none"
          true-alias="required"
          json-path="analytics_config.usage"
          property="json"
          infer="analytics-config-usage"
        >
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="analytics-config-google-analytics">
        <foxy-internal-switch-control
          json-template=${this.__defaultJSON}
          false-alias="none"
          true-alias="required"
          json-path="analytics_config.google_analytics.usage"
          property="json"
          infer="analytics-config-google-analytics-usage"
        >
        </foxy-internal-switch-control>

        <foxy-internal-text-control
          json-template=${this.__defaultJSON}
          json-path="analytics_config.google_analytics.account_id"
          property="json"
          layout="summary-item"
          infer="analytics-config-google-analytics-account-id"
        >
        </foxy-internal-text-control>

        <foxy-internal-switch-control
          json-template=${this.__defaultJSON}
          json-path="analytics_config.google_analytics.include_on_site"
          property="json"
          infer="analytics-config-google-analytics-include-on-site"
        >
        </foxy-internal-switch-control>

        <p class="flex items-start gap-s bg-error-10 text-error">
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="flex-shrink-0 text-error" style="width: 1.25em"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>`}
          <foxy-i18n infer="" key="deprecation_notice"></foxy-i18n>
        </p>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="analytics-config-google-tag">
        <foxy-internal-switch-control
          json-template=${this.__defaultJSON}
          false-alias="none"
          true-alias="required"
          json-path="analytics_config.google_tag.usage"
          property="json"
          infer="analytics-config-google-tag-usage"
        >
        </foxy-internal-switch-control>

        <foxy-internal-text-control
          json-template=${this.__defaultJSON}
          json-path="analytics_config.google_tag.account_id"
          property="json"
          layout="summary-item"
          infer="analytics-config-google-tag-account-id"
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          json-template=${this.__defaultJSON}
          json-path="analytics_config.google_tag.send_to"
          property="json"
          layout="summary-item"
          infer="analytics-config-google-tag-send-to"
        >
        </foxy-internal-text-control>

        <p class="flex items-start gap-s">
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="flex-shrink-0 text-primary" style="width: 1.25em"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>`}
          <span>
            <foxy-i18n infer="" key="usage_notice"></foxy-i18n>
            <br />
            <a
              target="_blank"
              class="cursor-pointer group text-primary rounded-s font-medium focus-outline-none focus-ring-2 focus-ring-primary-50"
              href="https://wiki.foxycart.com/v/2.0/analytics#google_tag_ga4_google_ads"
              rel="nofollow noreferrer noopener"
            >
              <foxy-i18n class="transition-opacity group-hover-opacity-80" infer="" key="docs_link">
              </foxy-i18n>
            </a>
          </span>
        </p>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="debug">
        <foxy-internal-switch-control
          json-template=${this.__defaultJSON}
          false-alias="none"
          true-alias="required"
          json-path="debug.usage"
          property="json"
          infer="debug-usage"
        >
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-source-control
        infer="custom-config"
        .getValue=${this.__customConfigGetValue}
        .setValue=${this.__customConfigSetValue}
      >
      </foxy-internal-source-control>

      <foxy-internal-source-control
        json-template=${this.__defaultJSON}
        json-path="custom_script_values.header"
        property="json"
        infer="custom-script-values-header"
      >
      </foxy-internal-source-control>

      <foxy-internal-source-control
        json-template=${this.__defaultJSON}
        json-path="custom_script_values.checkout_fields"
        property="json"
        infer="custom-script-values-checkout-fields"
      >
      </foxy-internal-source-control>

      <foxy-internal-source-control
        json-template=${this.__defaultJSON}
        json-path="custom_script_values.multiship_checkout_fields"
        property="json"
        infer="custom-script-values-multiship-checkout-fields"
      >
      </foxy-internal-source-control>

      <foxy-internal-source-control
        json-template=${this.__defaultJSON}
        json-path="custom_script_values.footer"
        property="json"
        infer="custom-script-values-footer"
      >
      </foxy-internal-source-control>

      ${super.renderBody()}

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.store ?? this.data?._links['fx:store'].href)}
        id="storeLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>('#storeLoader');
  }

  private get __formJson(): TemplateConfigJSON {
    return this.form.json ? JSON.parse(this.form.json) : getDefaultJSON();
  }

  private get __dataJson(): TemplateConfigJSON | null {
    return this.data?.json ? JSON.parse(this.data.json) : null;
  }
}
