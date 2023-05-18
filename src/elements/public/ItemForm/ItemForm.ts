import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
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
 * @slot subscription:before
 * @slot subscription:after
 *
 * @slot line-item-discount:before
 * @slot line-item-discount:after
 *
 * @slot cart:before
 * @slot cart:after
 *
 * @slot shipping:before
 * @slot shipping:after
 *
 * @slot inventory:before
 * @slot inventory:after
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

  /** Link to the collection of coupons that can be used with this item. */
  coupons: string | null = null;

  private __itemsLink = '';

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-text-control infer="name"></foxy-internal-text-control>

      <div class="grid grid-cols-2 gap-m">
        <foxy-internal-number-control infer="price"></foxy-internal-number-control>
        <foxy-internal-integer-control infer="quantity"></foxy-internal-integer-control>
      </div>

      <foxy-internal-item-form-subscription-control></foxy-internal-item-form-subscription-control>

      ${this.data
        ? html`
            <foxy-internal-async-details-control
              infer="item-options"
              first=${this.data._links['fx:item_options'].href}
              limit="5"
              form="foxy-item-option-form"
              item="foxy-item-option-card"
              .related=${this.__itemOptionRelatedUrls}
              .props=${{ 'locale-codes': this.localeCodes ?? '' }}
            >
            </foxy-internal-async-details-control>
          `
        : ''}

      <foxy-internal-item-form-line-item-discount-control></foxy-internal-item-form-line-item-discount-control>
      <foxy-internal-item-form-cart-control></foxy-internal-item-form-cart-control>
      <foxy-internal-item-form-shipping-control></foxy-internal-item-form-shipping-control>
      <foxy-internal-item-form-inventory-control></foxy-internal-item-form-inventory-control>

      ${this.data
        ? html`
            <foxy-internal-async-details-control
              infer="discount-details"
              first=${this.data._links['fx:discount_details'].href}
              limit="5"
              item="foxy-discount-detail-card"
            >
            </foxy-internal-async-details-control>

            <foxy-internal-async-details-control
              infer="coupon-details"
              first=${this.data._links['fx:coupon_details'].href}
              limit="5"
              item="foxy-coupon-detail-card"
            >
            </foxy-internal-async-details-control>

            <foxy-internal-async-details-control
              infer="attributes"
              first=${this.data._links['fx:attributes'].href}
              limit="5"
              item="foxy-attribute-card"
              form="foxy-attribute-form"
            >
            </foxy-internal-async-details-control>
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
