import type { PropertyDeclarations } from 'lit-element';
import type { DiscountBuilder } from '../DiscountBuilder/DiscountBuilder';
import type { Data, Templates } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

/**
 * Form element for creating or editing items (`fx:item`).
 *
 * @slot name:before
 * @slot name:after
 *
 * @slot price:before
 * @slot price:after
 *
 * @slot quantity:before
 * @slot quantity:after
 *
 * @slot subscription-frequency:before – new in 1.25.0
 * @slot subscription-frequency:after – new in 1.25.0
 *
 * @slot subscription-start-date:before – new in 1.25.0
 * @slot subscription-start-date:after – new in 1.25.0
 *
 * @slot subscription-end-date:before – new in 1.25.0
 * @slot subscription-end-date:after – new in 1.25.0
 *
 * @slot discount-name:before – new in 1.25.0
 * @slot discount-name:after – new in 1.25.0
 *
 * @slot discount-builder:before – new in 1.25.0
 * @slot discount-builder:after – new in 1.25.0
 *
 * @slot expires:before – new in 1.25.0
 * @slot expires:after – new in 1.25.0
 *
 * @slot url:before – new in 1.25.0
 * @slot url:after – new in 1.25.0
 *
 * @slot image:before – new in 1.25.0
 * @slot image:after – new in 1.25.0
 *
 * @slot quantity-min:before – new in 1.25.0
 * @slot quantity-min:after – new in 1.25.0
 *
 * @slot quantity-max:before – new in 1.25.0
 * @slot quantity-max:after – new in 1.25.0
 *
 * @slot shipto:before – new in 1.25.0
 * @slot shipto:after – new in 1.25.0
 *
 * @slot width:before – new in 1.25.0
 * @slot width:after – new in 1.25.0
 *
 * @slot height:before – new in 1.25.0
 * @slot height:after – new in 1.25.0
 *
 * @slot length:before – new in 1.25.0
 * @slot length:after – new in 1.25.0
 *
 * @slot weight:before – new in 1.25.0
 * @slot weight:after – new in 1.25.0
 *
 * @slot item-category-uri:before – new in 1.25.0
 * @slot item-category-uri:after – new in 1.25.0
 *
 * @slot code:before – new in 1.25.0
 * @slot code:after – new in 1.25.0
 *
 * @slot parent-code:before – new in 1.25.0
 * @slot parent-code:after – new in 1.25.0
 *
 * @slot discount-details:before – new in 1.25.0
 * @slot discount-details:after – new in 1.25.0
 *
 * @slot coupon-details:before – new in 1.25.0
 * @slot coupon-details:after – new in 1.25.0
 *
 * @slot attributes:before – new in 1.25.0
 * @slot attributes:after – new in 1.25.0
 *
 * @slot item-options:before – new in 1.25.0
 * @slot item-options:after – new in 1.25.0
 *
 * @slot timestamps:before
 * @slot timestamps:after
 *
 * @slot delete:before
 * @slot delete:after
 *
 * @slot create:before
 * @slot create:after
 *
 * @element foxy-item-form
 * @since 1.17.0
 */
export class ItemForm extends TranslatableMixin(InternalForm, 'item-form')<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      customerAddresses: { type: String, attribute: 'customer-addresses' },
      itemCategories: { type: String, attribute: 'item-categories' },
      localeCodes: { attribute: 'locale-codes' },
      coupons: { type: String },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !!v || 'name:v8n_required',
      ({ name: v }) => (!!v && v.length <= 255) || 'name:v8n_too_long',
      ({ price: v }) => (typeof v === 'number' && !isNaN(v)) || 'price:v8n_required',
      ({ price: v }) => (typeof v === 'number' && v >= 0) || 'price:v8n_negative',
      ({ quantity: v }) => (typeof v === 'number' && v >= 1) || 'quantity:v8n_less_than_one',
    ];
  }

  /** Link to the collection of customer addresses that can be used with this item. */
  customerAddresses: string | null = null;

  /** Link to the collection of item categories that can be used with this item. */
  itemCategories: string | null = null;

  /** Link to the `fx:locale_codes` property helper for currency formatting. */
  localeCodes: string | null = null;

  /** @deprecated Link to the collection of coupons that can be used with this item. */
  coupons: string | null = null;

  templates: Templates = {};

  private __itemsLink = '';

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-text-control infer="name"></foxy-internal-text-control>

      <div class="grid grid-cols-2 gap-s">
        <foxy-internal-number-control infer="price"></foxy-internal-number-control>
        <foxy-internal-integer-control infer="quantity"></foxy-internal-integer-control>
      </div>

      <foxy-internal-async-combo-box-control
        item-value-path="_links.self.href"
        item-label-path="name"
        first=${ifDefined(this?.itemCategories ?? undefined)}
        infer="item-category-uri"
      >
      </foxy-internal-async-combo-box-control>

      <foxy-internal-text-control infer="code"></foxy-internal-text-control>
      <foxy-internal-text-control infer="parent-code"></foxy-internal-text-control>

      <div class="grid grid-cols-2 gap-s">
        <foxy-internal-integer-control infer="quantity-min"></foxy-internal-integer-control>
        <foxy-internal-integer-control infer="quantity-max"></foxy-internal-integer-control>
      </div>

      <div>
        <vaadin-details theme="reverse">
          <foxy-i18n infer="" slot="summary" key="dimensions"></foxy-i18n>
          <div class="grid grid-cols-2 gap-s pt-m">
            <foxy-internal-number-control infer="weight"></foxy-internal-number-control>
            <foxy-internal-number-control infer="width"></foxy-internal-number-control>
            <foxy-internal-number-control infer="height"></foxy-internal-number-control>
            <foxy-internal-number-control infer="length"></foxy-internal-number-control>
          </div>
        </vaadin-details>

        <vaadin-details theme="reverse">
          <foxy-i18n infer="" slot="summary" key="subscriptions"></foxy-i18n>
          <div class="space-y-m pt-m">
            <foxy-internal-frequency-control infer="subscription-frequency">
            </foxy-internal-frequency-control>

            <foxy-internal-date-control infer="subscription-start-date">
            </foxy-internal-date-control>

            <foxy-internal-date-control infer="subscription-end-date"></foxy-internal-date-control>
          </div>
        </vaadin-details>
      </div>

      <foxy-internal-text-area-control infer="url"></foxy-internal-text-area-control>
      <foxy-internal-text-area-control infer="image"></foxy-internal-text-area-control>

      <vaadin-details theme="reverse">
        <foxy-i18n infer="" slot="summary" key="discount"></foxy-i18n>
        <div class="space-y-m pt-m">
          <foxy-internal-text-control infer="discount-name"></foxy-internal-text-control>

          <foxy-discount-builder
            infer="discount-builder"
            .parsedValue=${{
              details: this.form.discount_details,
              type: this.form.discount_type,
              name: this.form.discount_name,
            }}
            @change=${(evt: CustomEvent) => {
              const builder = evt.currentTarget as DiscountBuilder;
              const value = builder.parsedValue;

              this.edit({
                discount_details: value.details,
                discount_type: value.type,
                discount_name: value.name,
              });
            }}
          >
          </foxy-discount-builder>
        </div>
      </vaadin-details>

      <foxy-internal-async-combo-box-control
        item-value-path="address_name"
        item-label-path="address_name"
        first=${ifDefined(this?.customerAddresses ?? undefined)}
        infer="shipto"
      >
      </foxy-internal-async-combo-box-control>

      <foxy-internal-date-control infer="expires" format="unix"></foxy-internal-date-control>

      ${this.data
        ? html`
            <foxy-internal-async-list-control
              label=${this.t('item-options.title')}
              infer="item-options"
              first=${this.data._links['fx:item_options'].href}
              limit="5"
              form="foxy-item-option-form"
              item="foxy-item-option-card"
              alert
              .related=${this.__itemOptionRelatedUrls}
              .props=${{ 'locale-codes': this.localeCodes ?? '' }}
            >
            </foxy-internal-async-list-control>
          `
        : ''}
      ${this.data
        ? html`
            <foxy-internal-async-list-control
              label=${this.t('discount-details.title')}
              infer="discount-details"
              first=${this.data._links['fx:discount_details'].href}
              limit="5"
              item="foxy-discount-detail-card"
            >
            </foxy-internal-async-list-control>

            <foxy-internal-async-list-control
              label=${this.t('coupon-details.title')}
              infer="coupon-details"
              first=${this.data._links['fx:coupon_details'].href}
              limit="5"
              item="foxy-coupon-detail-card"
            >
            </foxy-internal-async-list-control>

            <foxy-internal-async-list-control
              label=${this.t('attributes.title')}
              infer="attributes"
              first=${this.data._links['fx:attributes'].href}
              limit="5"
              item="foxy-attribute-card"
              form="foxy-attribute-form"
              alert
            >
            </foxy-internal-async-list-control>
          `
        : ''}
      ${super.renderBody()}
    `;
  }

  protected async _sendGet(): Promise<Data> {
    type TransactionTemplate = Resource<Rels.TransactionTemplate>;
    type Subscription = Resource<Rels.Subscription>;
    type Transaction = Resource<Rels.Transaction>;
    type Cart = Resource<Rels.Cart>;

    const item = await super._sendGet();

    if (item._links['fx:subscription']) {
      const subscriptionHref = item._links['fx:subscription'].href;
      const subscription = await super._fetch<Subscription>(subscriptionHref);

      const transactionTemplateHref = subscription._links['fx:transaction_template'].href;
      const transactionTemplate = await super._fetch<TransactionTemplate>(transactionTemplateHref);

      this.__itemsLink = transactionTemplate._links['fx:items'].href;
      return item;
    }

    if (item._links['fx:transaction']) {
      const transaction = await super._fetch<Transaction>(item._links['fx:transaction'].href);
      this.__itemsLink = transaction._links['fx:items'].href;
      return item;
    }

    if (item._links['fx:cart']) {
      const cart = await super._fetch<Cart>(item._links['fx:cart'].href);
      this.__itemsLink = cart._links['fx:items'].href;
      return item;
    }

    return item;
  }

  private get __itemOptionRelatedUrls() {
    const links = (this.data?._links ?? {}) as Record<string, { href: string }>;
    const urls: string[] = [];

    if (links['fx:subscription']) urls.push(links['fx:subscription'].href);
    if (links['fx:transaction']) urls.push(links['fx:transaction'].href);
    if (links['fx:shipment']) urls.push(links['fx:shipment'].href);
    if (links['fx:cart']) urls.push(links['fx:cart'].href);
    if (this.__itemsLink) urls.push(this.__itemsLink);

    return urls;
  }
}
