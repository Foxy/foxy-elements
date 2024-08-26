import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Option } from '../QueryBuilder/types';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { BooleanSelector, getResourceId } from '@foxy.io/sdk/core';
import { TranslatableMixin } from '../../../mixins/translatable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { Type } from '../QueryBuilder/types';
import { html } from 'lit-html';

const NS = 'cart-form';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));

/**
 * Form element for creating or editing carts (`fx:cart`).
 *
 * @element foxy-cart-form
 * @since 1.21.0
 */
export class CartForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      paymentCardEmbedUrl: { attribute: 'payment-card-embed-url' },
      itemCategories: { attribute: 'item-categories' },
      templateSets: { attribute: 'template-sets' },
      localeCodes: { attribute: 'locale-codes' },
      languages: {},
      customers: {},
      countries: {},
      regions: {},
      coupons: {},
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ billing_first_name: v }) => !v || v.length <= 50 || 'billing-first-name:v8n_too_long',
      ({ billing_last_name: v }) => !v || v.length <= 50 || 'billing-last-name:v8n_too_long',
      ({ billing_state: v }) => !v || v.length <= 50 || 'billing-state:v8n_too_long',
      ({ billing_city: v }) => !v || v.length <= 50 || 'billing-city:v8n_too_long',
      ({ billing_phone: v }) => !v || v.length <= 50 || 'billing-phone:v8n_too_long',
      ({ billing_company: v }) => !v || v.length <= 50 || 'billing-company:v8n_too_long',
      ({ billing_address2: v }) => !v || v.length <= 100 || 'billing-address-two:v8n_too_long',
      ({ billing_address1: v }) => !v || v.length <= 100 || 'billing-address-one:v8n_too_long',
      ({ billing_postal_code: v }) => !v || v.length <= 50 || 'billing-postal-code:v8n_too_long',
      ({ shipping_first_name: v }) => !v || v.length <= 50 || 'shipping-first-name:v8n_too_long',
      ({ shipping_last_name: v }) => !v || v.length <= 50 || 'shipping-last-name:v8n_too_long',
      ({ shipping_state: v }) => !v || v.length <= 50 || 'shipping-state:v8n_too_long',
      ({ shipping_city: v }) => !v || v.length <= 50 || 'shipping-city:v8n_too_long',
      ({ shipping_phone: v }) => !v || v.length <= 50 || 'shipping-phone:v8n_too_long',
      ({ shipping_company: v }) => !v || v.length <= 50 || 'shipping-company:v8n_too_long',
      ({ shipping_address2: v }) => !v || v.length <= 100 || 'shipping-address-two:v8n_too_long',
      ({ shipping_address1: v }) => !v || v.length <= 100 || 'shipping-address-one:v8n_too_long',
      ({ shipping_postal_code: v }) => !v || v.length <= 50 || 'shipping-postal-code:v8n_too_long',
    ];
  }

  /** Payment Card Embed configuration URL. The form will append template set parameter on its own. */
  paymentCardEmbedUrl: string | null = null;

  /** URL of the `fx:item_categories` collection for the store. */
  itemCategories: string | null = null;

  /** URL of the `fx:template_sets` collection for the store. */
  templateSets: string | null = null;

  /** URL of the `fx:locale_codes` property helper. */
  localeCodes: string | null = null;

  /** URL of the `fx:languages` property helper. */
  languages: string | null = null;

  /** URL of the `fx:customers` collection for the store. */
  customers: string | null = null;

  /** URL of the `fx:countries` property helper. */
  countries: string | null = null;

  /** URL of the `fx:regions` property helper. */
  regions: string | null = null;

  /** URL of the `fx:coupons` collection for the store. */
  coupons: string | null = null;

  private readonly __languagesLoaderId = 'languagesLoader';

  private readonly __customerLoaderId = 'customerLoader';

  private readonly __paymentMethodUriGetDisplayValueOptions = (
    payments: Resource<Rels.Payments>
  ) => {
    const payment = payments?._embedded?.['fx:payments']?.[0] ?? null;
    const ccExpMonth = payment?.cc_exp_month;
    const ccExpYear = payment?.cc_exp_year;
    const ccLast4 = payment?.cc_number_masked?.replace(/x/g, '');
    const ccType = payment?.cc_type;

    return {
      cc_exp_month: ccExpMonth ?? '',
      cc_exp_year: ccExpYear ?? '',
      cc_last4: ccLast4 ?? '',
      cc_type: ccType ?? '',
      context: ccLast4 && ccExpMonth && ccExpYear && ccType ? '' : 'empty',
    };
  };

  private readonly __paymentMethodUriSetValue = (transactionUrl: string) => {
    try {
      // TODO use links instead of constructing the URL manually
      const url = new URL(transactionUrl);
      url.search = '';
      url.pathname += '/payments';
      this.edit({ payment_method_uri: url.toString() });
    } catch (err) {
      this.edit({ payment_method_uri: '' });
    }
  };

  private readonly __paymentMethodUriFilters: Option[] = [
    {
      label: 'filter_type',
      type: Type.String,
      path: 'payments:type',
      list: [
        { label: 'filter_type_value_purchase_order', value: 'purchase_order' },
        { label: 'filter_type_value_amazon_mws', value: 'amazon_mws' },
        { label: 'filter_type_value_paypal_ec', value: 'paypal_ec' },
        { label: 'filter_type_value_paypal', value: 'paypal' },
        { label: 'filter_type_value_hosted', value: 'hosted' },
        { label: 'filter_type_value_ogone', value: 'ogone' },
      ],
    },
    {
      label: 'filter_cc_type',
      type: Type.String,
      path: 'payments:cc_type',
      list: [
        { label: 'filter_cc_type_value_mastercard', value: 'mastercard' },
        { label: 'filter_cc_type_value_discover', value: 'discover' },
        { label: 'filter_cc_type_value_unionpay', value: 'unionpay' },
        { label: 'filter_cc_type_value_maestro', value: 'maestro' },
        { label: 'filter_cc_type_value_diners', value: 'diners' },
        { label: 'filter_cc_type_value_visa', value: 'visa' },
        { label: 'filter_cc_type_value_amex', value: 'amex' },
        { label: 'filter_cc_type_value_jcb', value: 'jcb' },
      ],
    },
    {
      label: 'filter_cc_number_masked',
      type: Type.String,
      path: 'payments:cc_number_masked',
    },
  ];

  private readonly __customerUriSetValue = (newValue: string) => {
    this.edit({ customer_uri: newValue, customer_email: '' });
  };

  private readonly __customerUriOptions: Option[] = [
    { label: 'filter_email', path: 'email', type: Type.String },
    {
      label: 'filter_is_anonymous',
      path: 'is_anonymous',
      type: Type.String,
      list: [
        { value: 'false', label: 'filter_is_anonymous_value_false' },
        { value: 'true', label: 'filter_is_anonymous_value_true' },
      ],
    },
  ];

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];

    if (this.form.customer_uri) {
      alwaysMatch.unshift('general:customer-email');
    } else {
      alwaysMatch.unshift('billing:payment-method-uri');
    }

    if (this.data) {
      if (!this.form.use_customer_shipping_address) {
        alwaysMatch.unshift('shipping:shipping-address');
      }
    } else {
      alwaysMatch.unshift(
        'applied-coupon-codes',
        'custom-fields',
        'attributes',
        'shipping',
        'billing',
        'totals',
        'items'
      );
    }

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderHeaderActions(): TemplateResult {
    return html`
      <foxy-internal-cart-form-create-session-action infer="view-as-customer">
      </foxy-internal-cart-form-create-session-action>
    `;
  }

  renderBody(): TemplateResult {
    const links = this.data?._links;
    const customer = this.__customer;

    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-resource-picker-control
          layout="summary-item"
          first=${ifDefined(this.templateSets ?? void 0)}
          infer="template-set-uri"
          item="foxy-template-set-card"
        >
        </foxy-internal-resource-picker-control>

        <foxy-internal-select-control
          layout="summary-item"
          infer="language"
          .options=${this.__languageOptions}
        >
        </foxy-internal-select-control>

        <foxy-internal-resource-picker-control
          layout="summary-item"
          first=${ifDefined(this.customers ?? void 0)}
          infer="customer-uri"
          item="foxy-customer-card"
          .setValue=${this.__customerUriSetValue}
          .filters=${this.__customerUriOptions}
        >
        </foxy-internal-resource-picker-control>

        <foxy-internal-text-control layout="summary-item" infer="customer-email">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-async-list-control
        infer="items"
        class="min-w-0"
        first=${ifDefined(this.__itemsHref)}
        alert
        wide
        item="foxy-item-card"
        form="foxy-item-form"
        .related=${this.href ? [this.href] : []}
        .itemProps=${{ 'locale-codes': this.localeCodes }}
        .formProps=${{
          'item-categories': this.itemCategories,
          'locale-codes': this.localeCodes,
          'store': this.data?._links['fx:store'].href,
        }}
      >
      </foxy-internal-async-list-control>

      <foxy-internal-cart-form-totals-control class="min-w-0" infer="totals">
      </foxy-internal-cart-form-totals-control>

      <foxy-internal-async-list-control
        infer="applied-coupon-codes"
        class="min-w-0"
        first=${ifDefined(links?.['fx:applied_coupon_codes'].href)}
        item="foxy-applied-coupon-code-card"
        form="foxy-applied-coupon-code-form"
        alert
        .related=${this.href ? [this.href] : []}
      >
      </foxy-internal-async-list-control>

      <foxy-internal-summary-control infer="billing">
        <foxy-internal-resource-picker-control
          placeholder=${this.__paymentMethodUriPlaceholder}
          layout="summary-item"
          first=${ifDefined(this.__transactionsWithPaymentsUrl)}
          infer="payment-method-uri"
          item="foxy-internal-cart-form-payment-method-card"
          form="foxy-internal-cart-form-payment-method-form"
          .getDisplayValueOptions=${this.__paymentMethodUriGetDisplayValueOptions}
          .formProps=${{
            'default-payment-method': customer?._links['fx:default_payment_method'].href ?? '',
            'payment-card-embed-url': this.__pickerPaymentCardEmbedUrl ?? '',
          }}
          .setValue=${this.__paymentMethodUriSetValue}
          .filters=${this.__paymentMethodUriFilters}
        >
        </foxy-internal-resource-picker-control>

        <foxy-internal-cart-form-address-summary-item
          countries=${ifDefined(this.countries ?? void 0)}
          regions=${ifDefined(this.regions ?? void 0)}
          infer="billing-address"
          type="billing"
          .customer=${customer}
        >
        </foxy-internal-cart-form-address-summary-item>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="shipping">
        <foxy-internal-switch-control infer="use-customer-shipping-address" invert>
        </foxy-internal-switch-control>

        <foxy-internal-cart-form-address-summary-item
          countries=${ifDefined(this.countries ?? void 0)}
          regions=${ifDefined(this.regions ?? void 0)}
          infer="shipping-address"
          type="shipping"
          .customer=${customer}
        >
        </foxy-internal-cart-form-address-summary-item>
      </foxy-internal-summary-control>

      <foxy-internal-async-list-control
        infer="custom-fields"
        class="min-w-0"
        first=${ifDefined(links?.['fx:custom_fields'].href)}
        limit="5"
        item="foxy-custom-field-card"
        form="foxy-custom-field-form"
        alert
      >
      </foxy-internal-async-list-control>

      <foxy-internal-async-list-control
        infer="attributes"
        class="min-w-0"
        first=${ifDefined(links?.['fx:attributes'].href)}
        limit="5"
        item="foxy-attribute-card"
        form="foxy-attribute-form"
        alert
      >
      </foxy-internal-async-list-control>

      ${super.renderBody()}

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.languages ?? void 0)}
        id=${this.__languagesLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__customerHref)}
        id=${this.__customerLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private get __paymentMethodUriPlaceholder() {
    const defaultPaymentMethod = this.__customer?._embedded['fx:default_payment_method'];
    const ccExpMonth = defaultPaymentMethod?.cc_exp_month ?? null;
    const ccExpYear = defaultPaymentMethod?.cc_exp_year ?? null;
    const ccLast4 = defaultPaymentMethod?.cc_number_masked?.replace(/x/g, '') ?? null;
    const ccType = defaultPaymentMethod?.cc_type ?? null;

    return this.t('billing.payment-method-uri.value', {
      cc_exp_month: ccExpMonth ?? '',
      cc_exp_year: ccExpYear ?? '',
      cc_last4: ccLast4 ?? '',
      cc_type: ccType ?? '',
      context: ccLast4 && ccExpMonth && ccExpYear && ccType ? '' : 'empty',
    });
  }

  private get __transactionsWithPaymentsUrl() {
    try {
      const url = new URL(this.__customer?._links['fx:transactions'].href ?? '');
      url.searchParams.set('zoom', 'payments');
      return url.toString();
    } catch {
      // ignore
    }
  }

  private get __pickerPaymentCardEmbedUrl() {
    try {
      const url = new URL(this.paymentCardEmbedUrl ?? '');
      const id = getResourceId(this.form.template_set_uri ?? '');
      if (id !== null) {
        url.searchParams.set('template_set_id', String(id));
        return url.toString();
      }
    } catch {
      // ignore
    }
  }

  private get __customerHref() {
    try {
      const url = new URL(this.form.customer_uri ?? '');
      url.searchParams.set(
        'zoom',
        'default_payment_method,default_billing_address,default_shipping_address'
      );
      return url.toString();
    } catch {
      // ignore
    }
  }

  private get __itemsHref() {
    try {
      const url = new URL(this.data?._links['fx:items'].href ?? '');
      url.searchParams.set('zoom', 'item_options');
      return url.toString();
    } catch {
      //
    }
  }

  private get __languageOptions() {
    type Loader = NucleonElement<Resource<Rels.Languages>>;
    const loader = this.renderRoot.querySelector<Loader>(`#${this.__languagesLoaderId}`);
    const values = Object.entries(loader?.data?.values ?? {});
    return values.map(([value, rawLabel]) => ({ rawLabel, value }));
  }

  private get __customer() {
    type Loader = NucleonElement<
      Resource<
        Rels.Customer,
        { zoom: ['default_payment_method', 'default_shipping_address', 'default_billing_address'] }
      >
    >;

    return this.renderRoot.querySelector<Loader>(`#${this.__customerLoaderId}`)?.data;
  }
}
