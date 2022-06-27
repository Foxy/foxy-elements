import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';
import { Resource } from '@foxy.io/sdk/core';
import { Rels } from '@foxy.io/sdk/backend';

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

            <foxy-internal-async-details-control
              infer="item-options"
              first=${this.data._links['fx:item_options'].href}
              limit="5"
              item="foxy-item-option-card"
              form="foxy-item-option-form"
              .related=${[
                this.data._links['fx:transaction'].href,
                this.data._links['fx:shipment'].href,
                this.__itemsLink,
              ]}
            >
            </foxy-internal-async-details-control>
          `
        : ''}
      ${super.renderBody()}
    `;
  }

  protected async _sendGet(): Promise<Data> {
    type Transaction = Resource<Rels.Transaction>;

    const item = await super._sendGet();
    const transaction = await super._fetch<Transaction>(item._links['fx:transaction'].href);

    this.__itemsLink = transaction._links['fx:items'].href;

    return item;
  }
}
