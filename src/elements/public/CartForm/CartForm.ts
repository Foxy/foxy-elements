import type { PropertyDeclarations } from 'lit-element';
import type { Templates, Data } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { FormRenderer } from '../FormDialog/types';
import type { ItemRenderer } from '../CollectionPage/types';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

import set from 'lodash-es/set';
import get from 'lodash-es/get';

const NS = 'cart-form';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));

/**
 * Form element for creating or editing carts (`fx:cart`).
 *
 * @slot customer-type:before
 * @slot customer-type:after
 *
 * @slot customer:before
 * @slot customer:after
 *
 * @slot template-set-uri:before
 * @slot template-set-uri:after
 *
 * @slot items:before
 * @slot items:after
 *
 * @slot applied-coupon-codes:before
 * @slot applied-coupon-codes:after
 *
 * @slot custom-fields:before
 * @slot custom-fields:after
 *
 * @slot attributes:before
 * @slot attributes:after
 *
 * @slot billing-first-name:before
 * @slot billing-first-name:after
 *
 * @slot billing-last-name:before
 * @slot billing-last-name:after
 *
 * @slot billing-company:before
 * @slot billing-company:after
 *
 * @slot billing-phone:before
 * @slot billing-phone:after
 *
 * @slot billing-address-one:before
 * @slot billing-address-one:after
 *
 * @slot billing-address-two:before
 * @slot billing-address-two:after
 *
 * @slot billing-country:before
 * @slot billing-country:after
 *
 * @slot billing-region:before
 * @slot billing-region:after
 *
 * @slot billing-city:before
 * @slot billing-city:after
 *
 * @slot billing-postal-code:before
 * @slot billing-postal-code:after
 *
 * @slot shipping-first-name:before
 * @slot shipping-first-name:after
 *
 * @slot shipping-last-name:before
 * @slot shipping-last-name:after
 *
 * @slot shipping-company:before
 * @slot shipping-company:after
 *
 * @slot shipping-phone:before
 * @slot shipping-phone:after
 *
 * @slot shipping-address-one:before
 * @slot shipping-address-one:after
 *
 * @slot shipping-address-two:before
 * @slot shipping-address-two:after
 *
 * @slot shipping-country:before
 * @slot shipping-country:after
 *
 * @slot shipping-region:before
 * @slot shipping-region:after
 *
 * @slot shipping-city:before
 * @slot shipping-city:after
 *
 * @slot shipping-postal-code:before
 * @slot shipping-postal-code:after
 *
 * @slot view-as-customer:before
 * @slot view-as-customer:after
 *
 * @slot delete:before
 * @slot delete:after
 *
 * @slot create:before
 * @slot create:after
 *
 * @element foxy-cart-form
 * @since 1.21.0
 */
export class CartForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      itemCategories: { attribute: 'item-categories' },
      templateSets: { attribute: 'template-sets' },
      localeCodes: { attribute: 'locale-codes' },
      customers: {},
      countries: {},
      regions: {},
      coupons: {},
      __isGuestMode: { attribute: false },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ billing_first_name: v }) => !v || v.length <= 50 || 'billing-first-name:v8n_too_long',
      ({ billing_last_name: v }) => !v || v.length <= 50 || 'billing-last-name:v8n_too_long',
      ({ billing_region: v }) => !v || v.length <= 50 || 'billing-region:v8n_too_long',
      ({ billing_city: v }) => !v || v.length <= 50 || 'billing-city:v8n_too_long',
      ({ billing_phone: v }) => !v || v.length <= 50 || 'billing-phone:v8n_too_long',
      ({ billing_company: v }) => !v || v.length <= 50 || 'billing-company:v8n_too_long',
      ({ billing_address2: v }) => !v || v.length <= 100 || 'billing-address-two:v8n_too_long',
      ({ billing_address1: v }) => !v || v.length <= 100 || 'billing-address-one:v8n_too_long',
      ({ billing_postal_code: v }) => !v || v.length <= 50 || 'billing-postal-code:v8n_too_long',
      ({ shipping_first_name: v }) => !v || v.length <= 50 || 'shipping-first-name:v8n_too_long',
      ({ shipping_last_name: v }) => !v || v.length <= 50 || 'shipping-last-name:v8n_too_long',
      ({ shipping_region: v }) => !v || v.length <= 50 || 'shipping-region:v8n_too_long',
      ({ shipping_city: v }) => !v || v.length <= 50 || 'shipping-city:v8n_too_long',
      ({ shipping_phone: v }) => !v || v.length <= 50 || 'shipping-phone:v8n_too_long',
      ({ shipping_company: v }) => !v || v.length <= 50 || 'shipping-company:v8n_too_long',
      ({ shipping_address2: v }) => !v || v.length <= 100 || 'shipping-address-two:v8n_too_long',
      ({ shipping_address1: v }) => !v || v.length <= 100 || 'shipping-address-one:v8n_too_long',
      ({ shipping_postal_code: v }) => !v || v.length <= 50 || 'shipping-postal-code:v8n_too_long',
    ];
  }

  /** URL of the `fx:item_categories` collection for the store. */
  itemCategories: string | null = null;

  /** URL of the `fx:template_sets` collection for the store. */
  templateSets: string | null = null;

  /** URL of the `fx:locale_codes` property helper. */
  localeCodes: string | null = null;

  /** URL of the `fx:customers` collection for the store. */
  customers: string | null = null;

  /** URL of the `fx:countries` property helper. */
  countries: string | null = null;

  /** Template render functions mapped to their name. */
  templates: Templates = {};

  /** URL of the `fx:regions` property helper. */
  regions: string | null = null;

  /** URL of the `fx:coupons` collection for the store. */
  coupons: string | null = null;

  private readonly __defaultTemplateSetLoaderId = 'defaultTemplateSetLoader';

  private readonly __localeCodesHelperLoaderId = 'localeCodesLoader';

  private readonly __shippingRegionsLoaderId = 'shippingRegionsLoader';

  private readonly __billingRegionsLoaderId = 'billingRegionsLoader';

  private readonly __templateSetLoaderId = 'templateSetLoader';

  private readonly __countriesHelperLoaderId = 'countriesHelperLoader';

  private readonly __discountsLoaderId = 'discountsLoader';

  private readonly __customerLoaderId = 'customerLoader';

  private readonly __storeLoaderId = 'storeLoader';

  private readonly __customerTypeGetValue = () => {
    if (!this.form.customer_uri) return 'new';
    return this.__customer?.is_anonymous ? 'guest' : 'regular';
  };

  private readonly __customerTypeSetValue = (newValue: string) => {
    this.edit({ customer_uri: '', customer_email: '' });
    this.__isGuestMode = newValue === 'guest';
  };

  private readonly __customerTypeOptions = [
    { label: 'option_new', value: 'new' },
    { label: 'option_guest', value: 'guest' },
    { label: 'option_regular', value: 'regular' },
  ];

  private readonly __customerGetValue = () => {
    return this.form.customer_uri || this.form.customer_email;
  };

  private readonly __customerSetValue = (newValue: string) => {
    try {
      // if newValue isn't a fx:customer URI this will error
      new URL(newValue);

      // filter customer_email out of edits because when supplying the customer_uri the email must
      // be that customer's email and it might not be immediately available at the time this getter is called
      const newEdits: Partial<Data> = {};
      const data = this.data;
      const form = this.form;

      for (const key in this.form) {
        if (key === 'customer_email') continue;
        const formValue = get(form, key);
        if (get(data, key) !== formValue) set(newEdits, key, formValue);
      }

      this.undo();
      this.edit({ ...newEdits, customer_uri: newValue });
    } catch {
      this.edit({ customer_uri: '', customer_email: newValue });
    }
  };

  private __isGuestMode = false;

  renderBody(): TemplateResult {
    const shippingRegions = Object.values(this.__shippingRegions ?? {});
    const billingRegions = Object.values(this.__billingRegions ?? {});
    const countries = Object.values(this.__countriesHelper ?? {});

    const shippingRegionOptions = shippingRegions.map(r => ({ label: r.default, value: r.code }));
    const billingRegionOptions = billingRegions.map(r => ({ label: r.default, value: r.code }));
    const countryOptions = countries.map(c => ({ label: c.default, value: c.cc2 }));

    const customerAddresses = this.__customer?._links['fx:customer_addresses'].href;

    const renderItemForm: FormRenderer = ctx => html`
      <foxy-item-form
        customer-addresses=${ifDefined(customerAddresses ?? void 0)}
        item-categories=${ifDefined(this.itemCategories ?? void 0)}
        locale-codes=${ifDefined(this.localeCodes ?? void 0)}
        coupons=${ifDefined(this.coupons ?? void 0)}
        parent=${ctx.dialog.parent}
        href=${ctx.dialog.href}
        infer=""
        id="form"
        .related=${ctx.dialog.related}
        @fetch=${ctx.handleFetch}
        @update=${ctx.handleUpdate}
      >
      </foxy-item-form>
    `;

    const renderItemCard: ItemRenderer = ctx => html`
      <foxy-item-card
        locale-codes=${this.localeCodes}
        parent=${ctx.parent}
        infer=""
        href=${ctx.href}
        .related=${ctx.related}
      >
      </foxy-item-card>
    `;

    const store = this.__store;
    const currencyDisplay = store
      ? store.use_international_currency_symbol
        ? 'code'
        : 'symbol'
      : void 0;

    let currencyCode: string | null = null;

    if (this.form.currency_code) {
      currencyCode = this.form.currency_code;
    } else {
      const allLocaleCodes = this.__localeCodesHelper;
      const localeCode = (this.__templateSet ?? this.__defaultTemplateSet)?.locale_code;
      const localeInfo = localeCode ? allLocaleCodes?.values[localeCode] : void 0;

      if (localeInfo) currencyCode = /Currency: ([A-Z]{3})/g.exec(localeInfo)?.[1] ?? null;
    }

    return html`
      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__shippingRegionsHref)}
        id=${this.__shippingRegionsLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__billingRegionsHref)}
        id=${this.__billingRegionsLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__countriesHref)}
        id=${this.__countriesHelperLoaderId}
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

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__discountsHref)}
        id=${this.__discountsLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__defaultTemplateSetHref)}
        id=${this.__defaultTemplateSetLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__localeCodesHelperHref)}
        id=${this.__localeCodesHelperLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__templateSetHref)}
        id=${this.__templateSetLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__storeHref)}
        id=${this.__storeLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <div class="grid sm-grid-cols-2 gap-l">
        <div class="sm-col-span-2">
          <foxy-i18n class="text-l font-bold leading-s block" infer="" key="order_section_title">
          </foxy-i18n>

          <foxy-i18n
            class="text-s text-secondary leading-s block"
            infer=""
            key="order_section_description"
          >
          </foxy-i18n>
        </div>

        <foxy-internal-select-control
          infer="customer-type"
          .getValue=${this.__customerTypeGetValue}
          .setValue=${this.__customerTypeSetValue}
          .options=${this.__customerTypeOptions}
          @update=${() => this.requestUpdate()}
        >
        </foxy-internal-select-control>

        <foxy-internal-async-combo-box-control
          item-label-path="email"
          item-value-path="_links.self.href"
          item-id-path="_links.self.href"
          first=${ifDefined(this.__customersHref)}
          infer="customer"
          allow-custom-value
          .selectedItem=${this.__customer}
          .getValue=${this.__customerGetValue}
          .setValue=${this.__customerSetValue}
        >
        </foxy-internal-async-combo-box-control>

        <foxy-internal-async-combo-box-control
          item-label-path="description"
          item-value-path="_links.self.href"
          item-id-path="_links.self.href"
          first=${ifDefined(this.templateSets)}
          class="sm-col-span-2"
          infer="template-set-uri"
          .selectedItem=${this.__templateSet ?? null}
        >
        </foxy-internal-async-combo-box-control>

        <foxy-internal-async-list-control
          infer="items"
          class="min-w-0 sm-col-span-2"
          first=${ifDefined(this.__itemsHref)}
          limit="5"
          .item=${renderItemCard}
          .form=${this.data ? renderItemForm : null}
        >
        </foxy-internal-async-list-control>

        <foxy-internal-async-list-control
          infer="applied-coupon-codes"
          class="min-w-0 sm-col-span-2"
          first=${ifDefined(this.data?._links['fx:applied_coupon_codes'].href)}
          limit="5"
          item="foxy-applied-coupon-code-card"
          form=${ifDefined(this.data ? 'foxy-applied-coupon-code-form' : void 0)}
          alert
        >
        </foxy-internal-async-list-control>

        <foxy-internal-async-list-control
          infer="custom-fields"
          class="min-w-0"
          first=${ifDefined(this.data?._links['fx:custom_fields'].href)}
          limit="5"
          item="foxy-custom-field-card"
          form=${ifDefined(this.data ? 'foxy-custom-field-form' : void 0)}
          alert
        >
        </foxy-internal-async-list-control>

        <foxy-internal-async-list-control
          infer="attributes"
          class="min-w-0"
          first=${ifDefined(this.data?._links['fx:attributes'].href)}
          limit="5"
          item="foxy-attribute-card"
          form=${ifDefined(this.data ? 'foxy-attribute-form' : void 0)}
          alert
        >
        </foxy-internal-async-list-control>

        <div class="grid gap-l">
          <div>
            <foxy-i18n
              class="text-l font-bold leading-s block"
              infer=""
              key="billing_section_title"
            >
            </foxy-i18n>

            <foxy-i18n
              class="text-s text-secondary leading-s block"
              infer=""
              key="billing_section_description"
            >
            </foxy-i18n>
          </div>

          <div class="grid grid-cols-2 gap-m">
            <foxy-internal-text-control infer="billing-first-name"></foxy-internal-text-control>
            <foxy-internal-text-control infer="billing-last-name"></foxy-internal-text-control>
            <foxy-internal-text-control infer="billing-company"></foxy-internal-text-control>
            <foxy-internal-text-control infer="billing-phone"></foxy-internal-text-control>

            <foxy-internal-text-control
              property="billing_address1"
              infer="billing-address-one"
              class="col-span-2"
            >
            </foxy-internal-text-control>

            <foxy-internal-text-control
              property="billing_address2"
              infer="billing-address-two"
              class="col-span-2"
            >
            </foxy-internal-text-control>

            <foxy-internal-select-control infer="billing-country" .options=${countryOptions}>
            </foxy-internal-select-control>

            <foxy-internal-select-control infer="billing-region" .options=${billingRegionOptions}>
            </foxy-internal-select-control>

            <foxy-internal-text-control infer="billing-city"></foxy-internal-text-control>
            <foxy-internal-text-control infer="billing-postal-code"></foxy-internal-text-control>
          </div>
        </div>

        <div class="grid gap-l">
          <div>
            <foxy-i18n
              class="text-l font-bold leading-s block"
              infer=""
              key="shipping_section_title"
            >
            </foxy-i18n>

            <foxy-i18n
              class="text-s text-secondary leading-s block"
              infer=""
              key="shipping_section_description"
            >
            </foxy-i18n>
          </div>

          <div class="grid grid-cols-2 gap-m">
            <foxy-internal-text-control infer="shipping-first-name"></foxy-internal-text-control>
            <foxy-internal-text-control infer="shipping-last-name"></foxy-internal-text-control>
            <foxy-internal-text-control infer="shipping-company"></foxy-internal-text-control>
            <foxy-internal-text-control infer="shipping-phone"></foxy-internal-text-control>

            <foxy-internal-text-control
              property="shipping_address1"
              infer="shipping-address-one"
              class="col-span-2"
            >
            </foxy-internal-text-control>

            <foxy-internal-text-control
              property="shipping_address2"
              infer="shipping-address-two"
              class="col-span-2"
            >
            </foxy-internal-text-control>

            <foxy-internal-select-control infer="shipping-country" .options=${countryOptions}>
            </foxy-internal-select-control>

            <foxy-internal-select-control infer="shipping-region" .options=${shippingRegionOptions}>
            </foxy-internal-select-control>

            <foxy-internal-text-control infer="shipping-city"></foxy-internal-text-control>
            <foxy-internal-text-control infer="shipping-postal-code"></foxy-internal-text-control>
          </div>
        </div>

        <div class="leading-m sm-col-span-2">
          <div class="text-xl font-bold mb-s">
            ${this.__renderTotalOrder(currencyCode, currencyDisplay)}
          </div>
          <div class="border-t border-contrast-10 mb-s"></div>
          ${this.__renderTotals(currencyCode, currencyDisplay)}
          ${this.__renderDiscounts(currencyCode, currencyDisplay)}
        </div>

        ${this.data
          ? html`
              <div class="grid gap-s sm-grid-cols-2 sm-gap-l sm-col-span-2">
                <foxy-internal-cart-form-view-as-customer-control infer="view-as-customer">
                </foxy-internal-cart-form-view-as-customer-control>
                <foxy-internal-delete-control infer="delete"></foxy-internal-delete-control>
              </div>
            `
          : html`<foxy-internal-create-control infer="create"></foxy-internal-create-control>`}
      </div>
    `;
  }

  private get __defaultTemplateSetHref() {
    const templateSetUri = this.data?.template_set_uri;

    if (templateSetUri === '') {
      try {
        const url = new URL(this.__store?._links['fx:template_sets'].href ?? '');
        url.searchParams.set('code', 'DEFAULT');
        return url.toString();
      } catch {
        //
      }
    }
  }

  private get __localeCodesHelperHref() {
    if (this.__defaultTemplateSetHref || this.__templateSetHref) {
      return this.localeCodes ?? void 0;
    }
  }

  private get __shippingRegionsHref() {
    try {
      const url = new URL(this.regions ?? '');
      const code = this.form.shipping_country;
      if (code) url.searchParams.set('country_code', code);
      return url.toString();
    } catch {
      //
    }
  }

  private get __billingRegionsHref() {
    try {
      const url = new URL(this.regions ?? '');
      const code = this.form.billing_country;
      if (code) url.searchParams.set('country_code', code);
      return url.toString();
    } catch {
      //
    }
  }

  private get __templateSetHref() {
    return this.form.template_set_uri || void 0;
  }

  private get __customersHref() {
    try {
      const url = new URL(this.customers ?? '');
      url.searchParams.set('is_anonymous', this.__isGuestMode ? '1' : '0');
      return url.toString();
    } catch {
      //
    }
  }

  private get __countriesHref() {
    return this.countries ?? void 0;
  }

  private get __discountsHref() {
    try {
      const url = new URL(this.data?._links['fx:discounts'].href ?? '');
      url.searchParams.set('limit', '300');
      return url.toString();
    } catch {
      //
    }
  }

  private get __customerHref() {
    return this.form.customer_uri || void 0;
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

  private get __storeHref() {
    return this.data?._links['fx:store']?.href;
  }

  private get __defaultTemplateSet() {
    type Loader = NucleonElement<Resource<Rels.TemplateSets>>;
    const selector = `#${this.__defaultTemplateSetLoaderId}`;
    const loader = this.renderRoot.querySelector<Loader>(selector);
    return loader?.data?._embedded['fx:template_sets'][0] ?? null;
  }

  private get __localeCodesHelper() {
    type Loader = NucleonElement<Resource<Rels.LocaleCodes>>;
    const selector = `#${this.__localeCodesHelperLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private get __shippingRegions() {
    type Loader = NucleonElement<Resource<Rels.Regions>>;
    const loader = this.renderRoot.querySelector<Loader>(`#${this.__shippingRegionsLoaderId}`);
    return loader?.data?.values;
  }

  private get __billingRegions() {
    type Loader = NucleonElement<Resource<Rels.Regions>>;
    const loader = this.renderRoot.querySelector<Loader>(`#${this.__billingRegionsLoaderId}`);
    return loader?.data?.values;
  }

  private get __templateSet() {
    type Loader = NucleonElement<Resource<Rels.TemplateSet>>;
    const selector = `#${this.__templateSetLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private get __discounts() {
    type Loader = NucleonElement<Resource<Rels.Discounts>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__discountsLoaderId}`);
  }

  private get __countriesHelper() {
    type Loader = NucleonElement<Resource<Rels.Countries>>;
    const loader = this.renderRoot.querySelector<Loader>(`#${this.__countriesHelperLoaderId}`);
    return loader?.data?.values;
  }

  private get __customer() {
    type Loader = NucleonElement<Resource<Rels.Customer>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__customerLoaderId}`)?.data;
  }

  private get __store() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    const selector = `#${this.__storeLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private __renderTotalOrder(currency: string | null, currencyDisplay: string | undefined) {
    const data = this.data;
    if (!data || !currency || !currencyDisplay) return html`--`;

    const options = { amount: `${data.total_order} ${currency}`, currencyDisplay };
    return html`<foxy-i18n infer="totals" key="total_order" .options=${options}></foxy-i18n>`;
  }

  private __renderTotals(currency: string | null, currencyDisplay: string | undefined) {
    const keys = ['total_item_price', 'total_shipping', 'total_tax'] as const;
    const data = this.data;
    const isPriceReady = data && currency && currencyDisplay;

    return keys.map(key => {
      const options = { amount: `${data?.[key]} ${currency}`, currencyDisplay };

      return html`
        <div data-testid=${key} class="flex justify-between text-m text-secondary">
          <foxy-i18n key=${key} infer="totals"></foxy-i18n>
          ${isPriceReady
            ? html`<foxy-i18n infer="totals" key="price" .options=${options}></foxy-i18n>`
            : html`<span>--</span>`}
        </div>
      `;
    });
  }

  private __renderDiscounts(currency: string | null, currencyDisplay: string | undefined) {
    const discounts = this.__discounts?.data?._embedded['fx:discounts'];
    const isPriceReady = currency && currencyDisplay;

    return discounts?.map(discount => {
      const options = { amount: `${discount.amount} ${currency}`, currencyDisplay };

      return html`
        <div data-testclass="discount" class="flex justify-between text-m text-secondary">
          <span>${discount.name} &bull; ${discount.code}</span>
          ${isPriceReady
            ? html`<foxy-i18n infer="totals" key="price" .options=${options}></foxy-i18n>`
            : html`<span>--</span>`}
        </div>
      `;
    });
  }
}
