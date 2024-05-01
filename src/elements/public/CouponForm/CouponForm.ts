import type { TemplateResult, PropertyDeclarations } from 'lit-element';
import type { Data, TransactionPageHrefGetter } from './types';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Action } from '../../internal/InternalAsyncListControl/types';
import type { Option } from '../QueryBuilder/types';
import type { Item } from '../../internal/InternalEditableListControl/types';
import type { Rels } from '@foxy.io/sdk/backend';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { Operator, Type } from '../QueryBuilder/types';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'coupon-form';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));

/**
 * Form element for creating or editing coupons (`fx:coupon`).
 *
 * @slot import:before
 * @slot import:after
 *
 * @slot generate:before
 * @slot generate:after
 *
 * @slot name:before
 * @slot name:after
 *
 * @slot rules:before
 * @slot rules:after
 *
 * @slot coupon-codes:before
 * @slot coupon-codes:after
 *
 * @slot item-option-restrictions:before
 * @slot item-option-restrictions:after
 *
 * @slot product-code-restrictions:before
 * @slot product-code-restrictions:after
 *
 * @slot category-restrictions:before
 * @slot category-restrictions:after
 *
 * @slot number-of-uses-allowed:before
 * @slot number-of-uses-allowed:after
 *
 * @slot number-of-uses-allowed-per-customer:before
 * @slot number-of-uses-allowed-per-customer:after
 *
 * @slot number-of-uses-allowed-per-code:before
 * @slot number-of-uses-allowed-per-code:after
 *
 * @slot start-date:before
 * @slot start-date:after
 *
 * @slot end-date:before
 * @slot end-date:after
 *
 * @slot inclusive-tax-rate:before
 * @slot inclusive-tax-rate:after
 *
 * @slot options:before
 * @slot options:after
 *
 * @slot customer-subscription-restrictions:before
 * @slot customer-subscription-restrictions:after
 *
 * @slot customer-attribute-restrictions:before
 * @slot customer-attribute-restrictions:after
 *
 * @slot attributes:before
 * @slot attributes:after
 *
 * @slot create:before
 * @slot create:after
 *
 * @slot delete:before
 * @slot delete:after
 *
 * @slot timestamps:before
 * @slot timestamps:after
 *
 *
 * @element foxy-coupon-form
 * @since 1.15.0
 */
export class CouponForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      getTransactionPageHref: { attribute: false },
      __couponCodesActions: { type: Array },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !!v || 'name:v8n_required',
      ({ name: v }) => !v || v.length <= 50 || 'name:v8n_too_long',
      ({ inclusive_tax_rate: v }) => !v || v >= 0 || 'inclusive-tax-rate:v8n_too_small',
      ({ inclusive_tax_rate: v }) => !v || v <= 1 || 'inclusive-tax-rate:v8n_too_big',
      ({ number_of_uses_allowed: v }) => !v || v >= 0 || 'number-of-uses-allowed:v8n_too_small',
      ({ coupon_discount_details: v }) => !!v || 'rules:v8n_required',
      ({ coupon_discount_details: v }) => !v || v.length <= 200 || 'rules:v8n_too_long',
      ({ item_option_restrictions: v }) => {
        return !v || JSON.stringify(v).length <= 6000 || 'item-option-restrictions:v8n_too_long';
      },
      ({ product_code_restrictions: v }) => {
        return !v || v.length <= 5000 || 'product-code-restrictions:v8n_too_long';
      },
      ({ customer_attribute_restrictions: v }) => {
        return !v || v.length <= 2000 || 'customer-attribute-restrictions:v8n_too_long';
      },
      ({ number_of_uses_allowed_per_code: v }) => {
        return !v || v >= 0 || 'number-of-uses-allowed-per-code:v8n_too_small';
      },
      ({ customer_subscription_restrictions: v }) => {
        return !v || v.length <= 200 || 'customer-subscription-restrictions:v8n_too_long';
      },
      ({ number_of_uses_allowed_per_customer: v }) => {
        return !v || v >= 0 || 'number-of-uses-allowed-per-customer:v8n_too_small';
      },
    ];
  }

  getTransactionPageHref: TransactionPageHrefGetter | null = null;

  private readonly __customerSubscriptionRestrictionsGetValue = () => {
    const items = this.form.customer_subscription_restrictions
      ?.split(',')
      .map(value => value.trim())
      .filter((value, index, values) => !!value && values.indexOf(value) === index)
      .map(value => ({ value }));

    return items ?? [];
  };

  private readonly __customerSubscriptionRestrictionsSetValue = (newValue: Item[]) => {
    this.edit({
      customer_subscription_restrictions: newValue
        .map(({ value }) => value.trim())
        .filter((value, index, values) => !!value && values.indexOf(value) === index)
        .join(),
    });

    this.edit({
      customer_auto_apply:
        !!this.form.customer_subscription_restrictions ||
        !!this.form.customer_attribute_restrictions,
    });
  };

  private readonly __productCodeRestrictionsGetValue = () => {
    return this.form.product_code_restrictions
      ?.split(',')
      .filter(v => !!v.trim())
      .map(value => ({
        value,
        label: value.startsWith('-')
          ? this.t(`product-code-restrictions.label_block`, { value: value.substring(1) })
          : this.t(`product-code-restrictions.label_allow`, { value }),
      }));
  };

  private readonly __productCodeRestrictionsSetValue = (newValue: Item[]) => {
    this.edit({
      product_code_restrictions: newValue
        .map(({ value, unit }) => (unit === 'block' ? `-${value}` : value))
        .filter((v, i, a) => !!v && a.indexOf(v) === i)
        .join(','),
    });
  };

  private readonly __itemOptionRestrictionsOperators = [Operator.In];

  private readonly __itemOptionRestrictionsGetValue = () => {
    const query = new URLSearchParams();
    const rules = this.form.item_option_restrictions ?? {};

    for (const key in rules) {
      query.set(`${key}:in`, rules[key].join(','));
    }

    return query.toString();
  };

  private readonly __itemOptionRestrictionsSetValue = (newValue: string) => {
    const rules = Object.fromEntries(
      Array.from(new URLSearchParams(newValue).entries()).map(([key, value]) => {
        return [key.replace(':in', ''), value.split(',').filter(v => !!v.trim())];
      })
    );

    this.edit({ item_option_restrictions: rules });
  };

  private readonly __optionsGetValue = () => {
    const value: string[] = [];

    if (this.form.multiple_codes_allowed) value.push('multiple_codes_allowed');
    if (this.form.combinable) value.push('combinable');
    if (this.form.exclude_category_discounts) value.push('exclude_category_discounts');
    if (this.form.exclude_line_item_discounts) value.push('exclude_line_item_discounts');
    if (this.form.is_taxable) value.push('is_taxable');
    if (this.form.shared_codes_allowed) value.push('shared_codes_allowed');
    if (this.form.customer_auto_apply) value.push('customer_auto_apply');

    return value;
  };

  private readonly __optionsSetValue = (newValue: string[]) => {
    this.edit({
      multiple_codes_allowed: newValue.includes('multiple_codes_allowed'),
      combinable: newValue.includes('combinable'),
      exclude_category_discounts: newValue.includes('exclude_category_discounts'),
      exclude_line_item_discounts: newValue.includes('exclude_line_item_discounts'),
      is_taxable: newValue.includes('is_taxable'),
      shared_codes_allowed: newValue.includes('shared_codes_allowed'),
      customer_auto_apply: newValue.includes('customer_auto_apply'),
    });
  };

  private readonly __optionsOptions = [
    { value: 'multiple_codes_allowed', label: 'option_multiple_codes_allowed' },
    { value: 'combinable', label: 'option_combinable' },
    { value: 'exclude_category_discounts', label: 'option_exclude_category_discounts' },
    { value: 'exclude_line_item_discounts', label: 'option_exclude_line_item_discounts' },
    { value: 'is_taxable', label: 'option_is_taxable' },
    { value: 'shared_codes_allowed', label: 'option_shared_codes_allowed' },
    { value: 'customer_auto_apply', label: 'option_customer_auto_apply' },
  ];

  private readonly __storeLoaderId = 'storeLoader';

  private readonly __codesFilters: Option[] = [
    { label: 'code', path: 'code', type: Type.String },
    { label: 'used_codes', path: 'number_of_uses_to_date', type: Type.Number },
    { label: 'date_created', path: 'date_created', type: Type.Date },
    { label: 'date_modified', path: 'date_modified', type: Type.Date },
  ];

  private __couponCodesActions: Action<Resource<Rels.CouponCode>>[] = [
    {
      theme: 'contrast',
      state: 'idle',
      text: 'copy_button_text',
      onClick: async data => {
        this.__couponCodesActions[0].state = 'busy';
        this.__couponCodesActions = [...this.__couponCodesActions];

        try {
          await navigator.clipboard.writeText(data.code);
          this.__couponCodesActions[0].state = 'end';
        } catch {
          this.__couponCodesActions[0].state = 'error';
        } finally {
          this.__couponCodesActions = [...this.__couponCodesActions];
          setTimeout(() => {
            this.__couponCodesActions[0].state = 'idle';
            this.__couponCodesActions = [...this.__couponCodesActions];
          }, 1000);
        }
      },
    },
  ];

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];

    if (!this.data) {
      alwaysMatch.push('coupon-codes', 'category-restrictions', 'attributes');
    }

    if (!this.form.customer_auto_apply) {
      alwaysMatch.push('customer-attribute-restrictions', 'customer-subscription-restrictions');
    }

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderHeaderActions(data: Data): TemplateResult {
    return html`
      <foxy-internal-coupon-form-bulk-add-control
        parent=${data._links['fx:generate_codes'].href}
        infer="generate"
        form="foxy-generate-codes-form"
      >
      </foxy-internal-coupon-form-bulk-add-control>

      <foxy-internal-coupon-form-bulk-add-control
        parent=${data._links['fx:coupon_codes'].href}
        infer="import"
        form="foxy-coupon-codes-form"
      >
      </foxy-internal-coupon-form-bulk-add-control>

      ${super.renderHeaderActions(data)}
    `;
  }

  renderBody(): TemplateResult {
    let codesUrl: string | undefined;

    try {
      const url = new URL(this.data?._links['fx:coupon_codes'].href ?? '');
      url.searchParams.set('order', 'date_created desc');

      codesUrl = url.toString();
    } catch {
      codesUrl = undefined;
    }

    return html`
      ${this.renderHeader()}

      <foxy-internal-text-control infer="name"></foxy-internal-text-control>

      <foxy-internal-coupon-form-rules-control infer="rules">
      </foxy-internal-coupon-form-rules-control>

      <foxy-internal-async-list-control
        first=${codesUrl}
        limit="5"
        infer="coupon-codes"
        item="foxy-coupon-code-card"
        form="foxy-coupon-code-form"
        alert
        .formProps=${{ '.getTransactionPageHref': this.getTransactionPageHref }}
        .actions=${this.__couponCodesActions}
        .filters=${this.__codesFilters}
      >
      </foxy-internal-async-list-control>

      <foxy-internal-query-builder-control
        infer="item-option-restrictions"
        disable-or
        .operators=${this.__itemOptionRestrictionsOperators}
        .getValue=${this.__itemOptionRestrictionsGetValue}
        .setValue=${this.__itemOptionRestrictionsSetValue}
      >
      </foxy-internal-query-builder-control>

      <foxy-internal-editable-list-control
        infer="product-code-restrictions"
        .getValue=${this.__productCodeRestrictionsGetValue}
        .setValue=${this.__productCodeRestrictionsSetValue}
        .units=${[
          { label: this.t('product-code-restrictions.unit_allow'), value: 'allow' },
          { label: this.t('product-code-restrictions.unit_block'), value: 'block' },
        ]}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-async-resource-link-list-control
        foreign-key-for-uri="item_category_uri"
        foreign-key-for-id="item_category_id"
        own-key-for-uri="coupon_uri"
        own-uri=${ifDefined(this.data?._links.self.href)}
        embed-key="fx:coupon_item_categories"
        options-href=${ifDefined(this.__storeLoader?.data?._links['fx:item_categories'].href)}
        links-href=${ifDefined(this.data?._links['fx:coupon_item_categories'].href)}
        infer="category-restrictions"
        limit="5"
        item="foxy-item-category-card"
      >
      </foxy-internal-async-resource-link-list-control>

      <div class="grid gap-l sm-grid-cols-3">
        <foxy-internal-integer-control infer="number-of-uses-allowed" min="0" show-controls>
        </foxy-internal-integer-control>

        <foxy-internal-integer-control
          infer="number-of-uses-allowed-per-customer"
          min="0"
          show-controls
        >
        </foxy-internal-integer-control>

        <foxy-internal-integer-control
          infer="number-of-uses-allowed-per-code"
          min="0"
          show-controls
        >
        </foxy-internal-integer-control>
      </div>

      <div class="grid gap-l sm-grid-cols-2">
        <foxy-internal-date-control infer="start-date"></foxy-internal-date-control>
        <foxy-internal-date-control infer="end-date"></foxy-internal-date-control>
      </div>

      <foxy-internal-number-control min="0" max="1" infer="inclusive-tax-rate">
      </foxy-internal-number-control>

      <foxy-internal-checkbox-group-control
        infer="options"
        theme="vertical"
        .getValue=${this.__optionsGetValue}
        .setValue=${this.__optionsSetValue}
        .options=${this.__optionsOptions}
      >
      </foxy-internal-checkbox-group-control>

      <foxy-internal-editable-list-control
        infer="customer-subscription-restrictions"
        .getValue=${this.__customerSubscriptionRestrictionsGetValue}
        .setValue=${this.__customerSubscriptionRestrictionsSetValue}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-query-builder-control infer="customer-attribute-restrictions">
      </foxy-internal-query-builder-control>

      <foxy-internal-async-list-control
        first=${ifDefined(this.data?._links['fx:attributes'].href)}
        limit="5"
        infer="attributes"
        item="foxy-attribute-card"
        form="foxy-attribute-form"
        alert
      >
      </foxy-internal-async-list-control>

      ${super.renderBody()}

      <foxy-nucleon
        infer=""
        class="hidden"
        href=${ifDefined(this.data?._links['fx:store'].href)}
        id=${this.__storeLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__storeLoaderId}`);
  }
}
