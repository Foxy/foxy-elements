import type { PropertyDeclarations } from 'lit-element';
import type { DiscountBuilder } from '../DiscountBuilder/DiscountBuilder';
import type { Data } from './types';

import type { TemplateResult } from 'lit-html';
import type { ParsedValue } from '../DiscountBuilder/types';
import type { NucleonV8N } from '../NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-html';

/**
 * Form element for item categories (`fx:item_category`).
 *
 * @since 1.21.0
 * @element foxy-item-category-form
 */
export class ItemCategoryForm extends TranslatableMixin(InternalForm, 'item-category-form')<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      emailTemplates: { attribute: 'email-templates' },
      taxes: {},
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ code: v }) => !!v || 'code:v8n_required',
      ({ code: v }) => (v && v.length <= 50) || 'code:v8n_too_long',

      ({ name: v }) => !!v || 'name:v8n_required',
      ({ name: v }) => (v && v.length <= 50) || 'name:v8n_too_long',

      ({ item_delivery_type: v }) => !!v || 'item-delivery-type:v8n_required',

      ({ item_delivery_type: t, max_downloads_per_customer: v }) => {
        return (
          (t === 'downloaded' ? typeof v === 'number' : true) ||
          'max-downloads-per-customer:v8n_required'
        );
      },

      ({ max_downloads_per_customer: v }) => {
        return (typeof v === 'number' ? v >= 0 : true) || 'max-downloads-per-customer:v8n_negative';
      },

      ({ item_delivery_type: t, max_downloads_time_period: v }) => {
        return (
          (t === 'downloaded' ? typeof v === 'number' : true) ||
          'max-downloads-time-period:v8n_required'
        );
      },

      ({ max_downloads_time_period: v }) => {
        return (typeof v === 'number' ? v >= 0 : true) || 'max-downloads-time-period:v8n_negative';
      },

      ({ customs_value: v }) => {
        return (typeof v === 'number' ? v >= 0 : true) || 'customs-value:v8n_negative';
      },

      ({ item_delivery_type: t, default_weight: v }) => {
        return (t === 'shipped' ? typeof v === 'number' : true) || 'default-weight:v8n_required';
      },

      ({ default_weight: v }) => {
        return (typeof v === 'number' ? v >= 0 : true) || 'default-weight:v8n_negative';
      },

      ({ item_delivery_type: t, default_weight_unit: v }) => {
        return (
          (t === 'shipped' ? typeof v === 'string' : true) || 'default-weight-unit:v8n_required'
        );
      },

      ({ item_delivery_type: t, default_length_unit: v }) => {
        return (
          (t === 'shipped' ? typeof v === 'string' : true) || 'default-length-unit:v8n_required'
        );
      },

      ({ item_delivery_type: t, shipping_flat_rate: v }) => {
        return (
          (t === 'flat_rate' ? typeof v === 'number' : true) || 'shipping-flat-rate:v8n_required'
        );
      },

      ({ shipping_flat_rate: v }) => {
        return (typeof v === 'number' ? v >= 0 : true) || 'shipping-flat-rate:v8n_negative';
      },

      ({ item_delivery_type: t, shipping_flat_rate_type: v }) => {
        return (
          (t === 'flat_rate' ? typeof v === 'string' : true) ||
          'shipping-flat-rate-type:v8n_required'
        );
      },

      ({ handling_fee_type: v }) => !!v || 'handling-fee-type:v8n_required',

      ({ handling_fee_type: t, handling_fee_minimum: v }) => {
        return (
          (t === 'flat_percent_with_minimum' ? typeof v === 'number' : true) ||
          'handling-fee-minimum:v8n_required'
        );
      },

      ({ handling_fee_minimum: v }) => {
        return (typeof v === 'number' ? v >= 0 : true) || 'handling-fee-minimum:v8n_negative';
      },

      ({ handling_fee_type: t, handling_fee_percentage: v }) => {
        return (
          (t === 'flat_percent_with_minimum' || t === 'flat_percent'
            ? typeof v === 'number'
            : true) || 'handling-fee-percentage:v8n_required'
        );
      },

      ({ handling_fee_percentage: v }) => {
        return (typeof v === 'number' ? v >= 0 : true) || 'handling-fee-percentage:v8n_negative';
      },
    ];
  }

  /** URL of the `fx:email_templates` collection for a store. */
  emailTemplates: string | null = null;

  /** URL of the `fx:taxes` collection for a store. */
  taxes: string | null = null;

  private static __shippingFlatRateTypeOptions = [
    { label: 'option_per_order', value: 'per_order' },
    { label: 'option_per_item', value: 'per_item' },
  ];

  private static __defaultWeightUnitOptions = [
    { label: 'option_lbs', value: 'LBS' },
    { label: 'option_kgs', value: 'KGS' },
  ];

  private static __defaultLengthUnitOptions = [
    { label: 'option_in', value: 'IN' },
    { label: 'option_cm', value: 'CM' },
  ];

  private static __itemDeliveryTypeOptions = [
    { label: 'option_notshipped', value: 'notshipped' },
    { label: 'option_downloaded', value: 'downloaded' },
    { label: 'option_flat_rate', value: 'flat_rate' },
    { label: 'option_shipped', value: 'shipped' },
    { label: 'option_pickup', value: 'pickup' },
  ];

  private static __handlingFeeTypeOptions = [
    { label: 'option_none', value: 'none' },
    { label: 'option_flat_per_order', value: 'flat_per_order' },
    { label: 'option_flat_per_item', value: 'flat_per_item' },
    { label: 'option_flat_percent', value: 'flat_percent' },
    { label: 'option_flat_percent_with_minimum', value: 'flat_percent_with_minimum' },
  ];

  private readonly __discountNameSetValue = (v: string) => {
    this.edit({ discount_name: v });
    if (!v) this.edit({ discount_type: '', discount_details: '' });
  };

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [super.readonlySelector.toString()];
    if (this.data?.code === 'DEFAULT') alwaysMatch.unshift('code', 'name');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];
    if (!this.data) alwaysMatch.unshift('taxes');
    if (this.data?.code === 'DEFAULT') alwaysMatch.unshift('delete');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    const itemDeliveryType = this.form.item_delivery_type;
    const handlingFeeType = this.form.handling_fee_type ?? 'none';

    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control infer="name" layout="summary-item"></foxy-internal-text-control>
        <foxy-internal-text-control infer="code" layout="summary-item"></foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-async-resource-link-list-control
        foreign-key-for-uri="tax_uri"
        foreign-key-for-id="tax_id"
        own-key-for-uri="item_category_uri"
        options-href=${ifDefined(this.taxes ?? undefined)}
        links-href=${ifDefined(this.data?._links['fx:tax_item_categories'].href)}
        embed-key="fx:tax_item_categories"
        own-uri=${ifDefined(this.data?._links.self.href)}
        infer="taxes"
        limit="5"
        item="foxy-tax-card"
      >
      </foxy-internal-async-resource-link-list-control>

      <foxy-internal-summary-control infer="delivery">
        <foxy-internal-select-control
          layout="summary-item"
          infer="item-delivery-type"
          .options=${ItemCategoryForm.__itemDeliveryTypeOptions}
        >
        </foxy-internal-select-control>

        ${itemDeliveryType === 'downloaded'
          ? this.__renderDownloadDeliveryControls()
          : itemDeliveryType === 'flat_rate'
          ? [this.__renderFlatRateControls(), this.__renderCustomsValue()]
          : itemDeliveryType === 'shipped'
          ? [this.__renderShippingControls(), this.__renderCustomsValue()]
          : ''}
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="handling-and-discount">
        <foxy-internal-select-control
          layout="summary-item"
          infer="handling-fee-type"
          .options=${ItemCategoryForm.__handlingFeeTypeOptions}
        >
        </foxy-internal-select-control>

        ${handlingFeeType === 'none'
          ? ''
          : html`
              ${this.__renderHandlingFee()}
              ${handlingFeeType.includes('percent') ? this.__renderHandlingFeePercentage() : ''}
              ${handlingFeeType === 'flat_percent_with_minimum'
                ? this.__renderHandlingFeeMinimum()
                : ''}
            `}

        <foxy-internal-text-control
          layout="summary-item"
          infer="discount-name"
          .setValue=${this.__discountNameSetValue}
        >
        </foxy-internal-text-control>

        ${this.form.discount_name ? this.__renderDiscountBuilder() : ''}
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="emails">
        <foxy-internal-resource-picker-control
          layout="summary-item"
          first=${ifDefined(this.emailTemplates ?? undefined)}
          infer="gift-recipient-email-template-uri"
          item="foxy-email-template-card"
        >
        </foxy-internal-resource-picker-control>

        <div
          class="flex items-start"
          style="gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
        >
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="flex-shrink-0 text-primary" style="width: 1.25em"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>`}
          <p>
            <foxy-i18n infer="" key="wip_message"></foxy-i18n>
            <br />
            <a
              target="_blank"
              class="mt-xs inline-block rounded font-medium text-primary transition-colors cursor-pointer hover-opacity-80 focus-outline-none focus-ring-2 focus-ring-primary-50"
              href="https://admin.foxycart.com"
            >
              admin.foxycart.com
            </a>
          </p>
        </div>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }

  private __renderHandlingFee() {
    return html`
      <foxy-internal-number-control layout="summary-item" infer="handling-fee" min="0">
      </foxy-internal-number-control>
    `;
  }

  private __renderHandlingFeePercentage() {
    return html`
      <foxy-internal-number-control
        layout="summary-item"
        suffix="%"
        infer="handling-fee-percentage"
        min="0"
      >
      </foxy-internal-number-control>
    `;
  }

  private __renderHandlingFeeMinimum() {
    return html`
      <foxy-internal-number-control layout="summary-item" infer="handling-fee-minimum" min="0">
      </foxy-internal-number-control>
    `;
  }

  private __renderDownloadDeliveryControls() {
    return html`
      <foxy-internal-number-control
        layout="summary-item"
        infer="max-downloads-per-customer"
        step="1"
        min="0"
      >
      </foxy-internal-number-control>

      <foxy-internal-number-control
        layout="summary-item"
        infer="max-downloads-time-period"
        step="1"
        min="0"
      >
      </foxy-internal-number-control>
    `;
  }

  private __renderFlatRateControls() {
    return html`
      <foxy-internal-number-control layout="summary-item" infer="shipping-flat-rate" min="0">
      </foxy-internal-number-control>

      <foxy-internal-select-control
        layout="summary-item"
        infer="shipping-flat-rate-type"
        .options=${ItemCategoryForm.__shippingFlatRateTypeOptions}
      >
      </foxy-internal-select-control>
    `;
  }

  private __renderShippingControls() {
    return html`
      <foxy-internal-number-control layout="summary-item" infer="default-weight" min="0">
      </foxy-internal-number-control>

      <foxy-internal-select-control
        layout="summary-item"
        infer="default-weight-unit"
        .options=${ItemCategoryForm.__defaultWeightUnitOptions}
      >
      </foxy-internal-select-control>

      <foxy-internal-select-control
        layout="summary-item"
        infer="default-length-unit"
        .options=${ItemCategoryForm.__defaultLengthUnitOptions}
      >
      </foxy-internal-select-control>
    `;
  }

  private __renderCustomsValue() {
    return html`
      <foxy-internal-number-control layout="summary-item" infer="customs-value" min="0">
      </foxy-internal-number-control>
    `;
  }

  private __renderDiscountBuilder() {
    const parsedValue: ParsedValue = {
      name: this.form.discount_name ?? '',
      type: this.form.discount_type || 'quantity_amount',
      details: this.form.discount_details ?? '',
    };

    return html`
      <foxy-discount-builder
        infer="discount-builder"
        class="col-span-2"
        .parsedValue=${parsedValue}
        @change=${(evt: CustomEvent) => {
          const builder = evt.currentTarget as DiscountBuilder;

          this.edit({
            discount_name: builder.parsedValue.name,
            discount_type: builder.parsedValue.type,
            discount_details: builder.parsedValue.details,
          });
        }}
      >
      </foxy-discount-builder>
    `;
  }
}
