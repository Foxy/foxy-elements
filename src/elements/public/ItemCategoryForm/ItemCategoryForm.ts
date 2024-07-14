import type { PropertyDeclarations } from 'lit-element';
import type { DiscountBuilder } from '../DiscountBuilder/DiscountBuilder';
import type { Data } from './types';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { ParsedValue } from '../DiscountBuilder/types';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

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

      ({ send_admin_email: s, admin_email: v }) => (s ? !!v : true) || 'admin-email:v8n_required',
    ];
  }

  /** URL of the `fx:email_templates` collection for a store. */
  emailTemplates: string | null = null;

  /** URL of the `fx:taxes` collection for a store. */
  taxes: string | null = null;

  private static __shippingFlatRateTypeOptions = [
    { label: 'option_per_order', value: 'per_order' },
    { label: 'option_per_shipment', value: 'per_shipment' },
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

  private readonly __giftRecipientEmailTemplateLoaderId = 'gift-recipient-email-template-loader';

  private readonly __customerEmailTemplateLoaderId = 'customer-email-template-loader';

  private readonly __adminEmailTemplateLoaderId = 'admin-email-template-loader';

  get hiddenSelector(): BooleanSelector {
    const alwaysHidden = [super.hiddenSelector.toString()];
    if (!this.data) alwaysHidden.unshift('taxes');
    return new BooleanSelector(alwaysHidden.join(' ').trim());
  }

  renderBody(): TemplateResult {
    const itemDeliveryType = this.form.item_delivery_type;
    const handlingFeeType = this.form.handling_fee_type ?? 'none';

    return html`
      <div class="grid grid-cols-2 gap-m">
        <foxy-internal-text-control infer="name" class="col-span-2"></foxy-internal-text-control>
        <foxy-internal-text-control infer="code" class="col-span-2"></foxy-internal-text-control>

        <foxy-internal-select-control
          infer="handling-fee-type"
          class="col-span-2"
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

        <foxy-internal-select-control
          infer="item-delivery-type"
          class="col-span-2"
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

        <foxy-internal-text-control infer="discount-name" class="col-span-2">
        </foxy-internal-text-control>

        ${this.form.discount_name ? this.__renderDiscountBuilder() : ''}

        <foxy-internal-async-combo-box-control
          item-label-path="description"
          item-value-path="_links.self.href"
          first=${ifDefined(this.emailTemplates ?? undefined)}
          infer="admin-email-template-uri"
          class=${this.form.send_admin_email ? '' : 'col-span-2'}
          .selectedItem=${this.__adminEmailTemplateLoader?.data}
          @change=${(evt: CustomEvent) => {
            this.edit({
              send_admin_email: !!evt.detail,
              admin_email: evt.detail ? this.form.admin_email : '',
            });
          }}
        >
        </foxy-internal-async-combo-box-control>

        ${this.form.send_admin_email ? this.__renderAdminEmail() : ''}

        <foxy-internal-async-combo-box-control
          item-label-path="description"
          item-value-path="_links.self.href"
          first=${ifDefined(this.emailTemplates ?? undefined)}
          infer="customer-email-template-uri"
          class="col-span-2"
          .selectedItem=${this.__customerEmailTemplateLoader?.data}
          @change=${(evt: CustomEvent) => this.edit({ send_customer_email: !!evt.detail })}
        >
        </foxy-internal-async-combo-box-control>

        <foxy-internal-async-combo-box-control
          item-label-path="description"
          item-value-path="_links.self.href"
          first=${ifDefined(this.emailTemplates ?? undefined)}
          infer="gift-recipient-email-template-uri"
          class="col-span-2"
          .selectedItem=${this.__giftRecipientEmailTemplateLoader?.data}
        >
        </foxy-internal-async-combo-box-control>

        <foxy-internal-async-resource-link-list-control
          foreign-key-for-uri="tax_uri"
          foreign-key-for-id="tax_id"
          own-key-for-uri="item_category_uri"
          own-uri=${ifDefined(this.data?._links.self.href)}
          embed-key="fx:tax_item_categories"
          options-href=${ifDefined(this.taxes ?? undefined)}
          links-href=${ifDefined(this.data?._links['fx:tax_item_categories'].href)}
          infer="taxes"
          class="col-span-2"
          limit="5"
          item="foxy-tax-card"
        >
        </foxy-internal-async-resource-link-list-control>
      </div>

      ${super.renderBody()}

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.form.customer_email_template_uri || undefined)}
        id=${this.__customerEmailTemplateLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.form.gift_recipient_email_template_uri || undefined)}
        id=${this.__giftRecipientEmailTemplateLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.form.admin_email_template_uri || undefined)}
        id=${this.__adminEmailTemplateLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private get __giftRecipientEmailTemplateLoader() {
    const id = this.__giftRecipientEmailTemplateLoaderId;
    type Loader = NucleonElement<Resource<Rels.EmailTemplate>>;
    return this.renderRoot.querySelector<Loader>(`#${id}`);
  }

  private get __customerEmailTemplateLoader() {
    const id = this.__customerEmailTemplateLoaderId;
    type Loader = NucleonElement<Resource<Rels.EmailTemplate>>;
    return this.renderRoot.querySelector<Loader>(`#${id}`);
  }

  private get __adminEmailTemplateLoader() {
    const id = this.__adminEmailTemplateLoaderId;
    type Loader = NucleonElement<Resource<Rels.EmailTemplate>>;
    return this.renderRoot.querySelector<Loader>(`#${id}`);
  }

  private __renderHandlingFee() {
    return html`
      <foxy-internal-number-control
        infer="handling-fee"
        class=${this.form.handling_fee_type === 'flat_percent' ? '' : 'col-span-2'}
      >
      </foxy-internal-number-control>
    `;
  }

  private __renderHandlingFeePercentage() {
    return html`
      <foxy-internal-number-control infer="handling-fee-percentage"> </foxy-internal-number-control>
    `;
  }

  private __renderHandlingFeeMinimum() {
    return html`
      <foxy-internal-number-control infer="handling-fee-minimum"> </foxy-internal-number-control>
    `;
  }

  private __renderDownloadDeliveryControls() {
    return html`
      <foxy-internal-integer-control infer="max-downloads-per-customer">
      </foxy-internal-integer-control>

      <foxy-internal-integer-control infer="max-downloads-time-period">
      </foxy-internal-integer-control>
    `;
  }

  private __renderFlatRateControls() {
    return html`
      <foxy-internal-number-control infer="shipping-flat-rate"> </foxy-internal-number-control>

      <foxy-internal-select-control
        infer="shipping-flat-rate-type"
        .options=${ItemCategoryForm.__shippingFlatRateTypeOptions}
      >
      </foxy-internal-select-control>
    `;
  }

  private __renderShippingControls() {
    return html`
      <foxy-internal-integer-control infer="default-weight" class="col-span-2">
      </foxy-internal-integer-control>

      <foxy-internal-select-control
        infer="default-weight-unit"
        .options=${ItemCategoryForm.__defaultWeightUnitOptions}
      >
      </foxy-internal-select-control>

      <foxy-internal-select-control
        infer="default-length-unit"
        .options=${ItemCategoryForm.__defaultLengthUnitOptions}
      >
      </foxy-internal-select-control>
    `;
  }

  private __renderCustomsValue() {
    return html`
      <foxy-internal-number-control infer="customs-value" class="col-span-2">
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

  private __renderAdminEmail() {
    return html`<foxy-internal-text-control infer="admin-email"> </foxy-internal-text-control>`;
  }
}
