import type { TemplateResult, PropertyDeclarations } from 'lit-element';
import type { Data, TransactionPageHrefGetter } from './types';
import type { Option, ParsedValue } from '../QueryBuilder/types';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { SwipeAction } from '../../internal/InternalAsyncListControl/types';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Item } from '../../internal/InternalEditableListControl/types';
import type { Rels } from '@foxy.io/sdk/backend';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { Type, Operator } from '../QueryBuilder/types';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';
import { parse } from '../QueryBuilder/utils/parse';
import { stringify } from '../QueryBuilder/utils/stringify';

const NS = 'coupon-form';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));

/**
 * Form element for creating or editing coupons (`fx:coupon`).
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

  private readonly __customerAttributeRestrictionsOperators: Operator[] = [
    Operator.Not,
    Operator.In,
  ];

  private readonly __customerAttributeRestrictionsGetValue = () => {
    const simplifiedValue = parse(this.form.customer_attribute_restrictions ?? '')
      .filter(value => Array.isArray(value) || typeof value.name === 'string')
      .map(value => {
        if (Array.isArray(value)) {
          return value
            .filter(({ name }) => typeof name === 'string')
            .map(({ name, operator, value }) => {
              const output: ParsedValue = { path: name as string, operator, value };
              return output;
            });
        }

        const output: ParsedValue = {
          operator: value.operator,
          value: value.value,
          path: value.name as string,
        };

        return output;
      });

    return stringify(simplifiedValue, true);
  };

  private readonly __customerAttributeRestrictionsSetValue = (newValue: string) => {
    const augmentedValue = parse(newValue).map(value => {
      if (Array.isArray(value)) {
        return value.map(({ path, operator, value }) => {
          const output: ParsedValue = { name: path, path: 'attributes', operator, value };
          return output;
        });
      } else {
        const output: ParsedValue = {
          operator: value.operator,
          value: value.value,
          path: 'attributes',
          name: value.path,
        };

        return output;
      }
    });

    this.edit({ customer_attribute_restrictions: stringify(augmentedValue, true) });
  };

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

  private readonly __storeLoaderId = 'storeLoader';

  private readonly __codesFilters: Option[] = [
    { label: 'code', path: 'code', type: Type.String },
    { label: 'used_codes', path: 'number_of_uses_to_date', type: Type.Number },
    { label: 'date_created', path: 'date_created', type: Type.Date },
    { label: 'date_modified', path: 'date_modified', type: Type.Date },
  ];

  private __couponCodesActions: SwipeAction<Resource<Rels.CouponCode>>[] = [
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

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get headerSubtitleOptions(): Record<string, unknown> {
    return { ...super.headerSubtitleOptions, id: this.headerCopyIdValue };
  }

  renderHeaderActions(data: Data): TemplateResult {
    return html`
      <foxy-internal-bulk-add-action-control
        parent=${data._links['fx:generate_codes'].href}
        infer="generate"
        form="foxy-generate-codes-form"
        .related=${[data._links['fx:coupon_codes'].href]}
      >
      </foxy-internal-bulk-add-action-control>

      <foxy-internal-bulk-add-action-control
        parent=${data._links['fx:coupon_codes'].href}
        infer="import"
        form="foxy-coupon-codes-form"
        .related=${[data._links['fx:coupon_codes'].href]}
      >
      </foxy-internal-bulk-add-action-control>

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

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="name"></foxy-internal-text-control>
      </foxy-internal-summary-control>

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

      <foxy-internal-array-map-control infer="item-option-restrictions">
      </foxy-internal-array-map-control>

      <foxy-internal-summary-control infer="customer-restrictions">
        <foxy-internal-query-builder-control
          layout="summary-item"
          infer="customer-attribute-restrictions"
          disable-zoom
          .operators=${this.__customerAttributeRestrictionsOperators}
          .getValue=${this.__customerAttributeRestrictionsGetValue}
          .setValue=${this.__customerAttributeRestrictionsSetValue}
        >
        </foxy-internal-query-builder-control>

        <foxy-internal-editable-list-control
          layout="summary-item"
          infer="customer-subscription-restrictions"
          .getValue=${this.__customerSubscriptionRestrictionsGetValue}
          .setValue=${this.__customerSubscriptionRestrictionsSetValue}
        >
        </foxy-internal-editable-list-control>

        <foxy-internal-switch-control infer="customer-auto-apply"></foxy-internal-switch-control>
      </foxy-internal-summary-control>

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

      <foxy-internal-summary-control infer="uses">
        <foxy-internal-number-control
          layout="summary-item"
          infer="number-of-uses-allowed"
          step="1"
          min="0"
        >
        </foxy-internal-number-control>

        <foxy-internal-number-control
          layout="summary-item"
          infer="number-of-uses-allowed-per-customer"
          step="1"
          min="0"
        >
        </foxy-internal-number-control>

        <foxy-internal-number-control
          layout="summary-item"
          infer="number-of-uses-allowed-per-code"
          step="1"
          min="0"
        >
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="timeframe">
        <foxy-internal-date-control layout="summary-item" infer="start-date">
        </foxy-internal-date-control>
        <foxy-internal-date-control layout="summary-item" infer="end-date">
        </foxy-internal-date-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="taxes">
        <foxy-internal-number-control
          layout="summary-item"
          infer="inclusive-tax-rate"
          min="0"
          max="1"
        >
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="options">
        <foxy-internal-switch-control infer="multiple-codes-allowed"></foxy-internal-switch-control>
        <foxy-internal-switch-control infer="combinable"></foxy-internal-switch-control>
        <foxy-internal-switch-control infer="exclude-category-discounts">
        </foxy-internal-switch-control>
        <foxy-internal-switch-control infer="exclude-line-item-discounts">
        </foxy-internal-switch-control>
        <foxy-internal-switch-control infer="is-taxable"></foxy-internal-switch-control>
        <foxy-internal-switch-control infer="shared-codes-allowed"></foxy-internal-switch-control>
      </foxy-internal-summary-control>

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
