import type { PropertyDeclarations } from 'lit-element';
import type { DiscountBuilder } from '../DiscountBuilder/DiscountBuilder';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

/**
 * Form element for creating or editing items (`fx:item`).
 *
 * @element foxy-item-form
 * @since 1.17.0
 */
export class ItemForm extends TranslatableMixin(InternalForm, 'item-form')<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      customerAddresses: { attribute: 'customer-addresses' },
      itemCategories: { attribute: 'item-categories' },
      localeCodes: { attribute: 'locale-codes' },
      coupons: {},
      store: {},
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

  /** @deprecated Link to the collection of customer addresses that can be used with this item. */
  customerAddresses: string | null = null;

  /** Link to the collection of item categories that can be used with this item. */
  itemCategories: string | null = null;

  /** Link to the `fx:locale_codes` property helper for currency formatting. */
  localeCodes: string | null = null;

  /** @deprecated Link to the collection of coupons that can be used with this item. */
  coupons: string | null = null;

  /** Link to `fx:store` this item belongs to. */
  store: string | null = null;

  private __itemsLink = '';

  get headerSubtitleOptions(): Record<string, unknown> {
    return { context: this.data?.is_future_line_item ? 'future_line_item' : 'regular' };
  }

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [super.readonlySelector.toString()];
    if (this.href) alwaysMatch.unshift('subscriptions');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];

    if (!this.__storeLoader?.data?.features_multiship) alwaysMatch.unshift('general:shipto');
    if (this.data && !this.data.subscription_frequency) alwaysMatch.unshift('subscriptions');
    if (!this.form.discount_name) alwaysMatch.unshift('discount:discount-builder');
    if (!this.href) {
      alwaysMatch.unshift('discount-details', 'coupon-details', 'item-options', 'attributes');
    }

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="name"></foxy-internal-text-control>
        <foxy-internal-number-control layout="summary-item" infer="price" min="0">
        </foxy-internal-number-control>
        <foxy-internal-number-control layout="summary-item" infer="quantity" step="1" min="1">
        </foxy-internal-number-control>
        <foxy-internal-resource-picker-control
          layout="summary-item"
          first=${ifDefined(this?.itemCategories ?? undefined)}
          infer="item-category-uri"
          item="foxy-item-category-card"
        >
        </foxy-internal-resource-picker-control>
        <foxy-internal-text-control layout="summary-item" infer="code"></foxy-internal-text-control>
        <foxy-internal-text-control layout="summary-item" infer="parent-code">
        </foxy-internal-text-control>
        <foxy-internal-text-control layout="summary-item" infer="shipto">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="subscriptions">
        <foxy-internal-frequency-control layout="summary-item" infer="subscription-frequency">
        </foxy-internal-frequency-control>
        <foxy-internal-date-control layout="summary-item" infer="subscription-start-date">
        </foxy-internal-date-control>
        <foxy-internal-date-control layout="summary-item" infer="subscription-end-date">
        </foxy-internal-date-control>
      </foxy-internal-summary-control>

      <foxy-internal-async-list-control
        infer="item-options"
        first=${ifDefined(this.data?._links['fx:item_options'].href)}
        form="foxy-item-option-form"
        item="foxy-item-option-card"
        alert
        .related=${this.__itemOptionRelatedUrls}
        .props=${{ 'locale-codes': this.localeCodes ?? '' }}
      >
      </foxy-internal-async-list-control>

      <foxy-internal-summary-control infer="dimensions">
        <foxy-internal-number-control layout="summary-item" infer="weight" min="0">
        </foxy-internal-number-control>
        <foxy-internal-number-control layout="summary-item" infer="length" min="0">
        </foxy-internal-number-control>
        <foxy-internal-number-control layout="summary-item" infer="width" min="0">
        </foxy-internal-number-control>
        <foxy-internal-number-control layout="summary-item" infer="height" min="0">
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="meta">
        <foxy-internal-text-control layout="summary-item" infer="url"></foxy-internal-text-control>
        <foxy-internal-text-control layout="summary-item" infer="image">
        </foxy-internal-text-control>
        <foxy-internal-number-control layout="summary-item" infer="quantity-max" step="1" min="1">
        </foxy-internal-number-control>
        <foxy-internal-number-control layout="summary-item" infer="quantity-min" step="1" min="1">
        </foxy-internal-number-control>
        <foxy-internal-date-control layout="summary-item" infer="expires" format="unix">
        </foxy-internal-date-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="discount">
        <foxy-internal-text-control layout="summary-item" infer="discount-name">
        </foxy-internal-text-control>
        <foxy-discount-builder
          infer="discount-builder"
          class=${classMap({ hidden: this.hiddenSelector.matches('discount-builder', true) })}
          .parsedValue=${this.__discountBuilderParsedValue}
          @change=${this.__handleDiscountBuilderChange}
        >
        </foxy-discount-builder>
      </foxy-internal-summary-control>

      <foxy-internal-async-list-control
        infer="discount-details"
        first=${ifDefined(this.data?._links['fx:discount_details'].href)}
        item="foxy-discount-detail-card"
      >
      </foxy-internal-async-list-control>

      <foxy-internal-async-list-control
        infer="coupon-details"
        first=${ifDefined(this.data?._links['fx:coupon_details'].href)}
        item="foxy-coupon-detail-card"
      >
      </foxy-internal-async-list-control>

      <foxy-internal-async-list-control
        infer="attributes"
        first=${ifDefined(this.data?._links['fx:attributes'].href)}
        item="foxy-attribute-card"
        form="foxy-attribute-form"
        alert
      >
      </foxy-internal-async-list-control>

      ${super.renderBody()}

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.store ?? void 0)}
        id="storeLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
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

  private get __discountBuilderParsedValue() {
    return {
      details: this.form.discount_details,
      type: this.form.discount_type,
      name: this.form.discount_name,
    };
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

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>('#storeLoader');
  }

  private __handleDiscountBuilderChange(evt: CustomEvent) {
    const builder = evt.currentTarget as DiscountBuilder;
    const value = builder.parsedValue;

    this.edit({
      discount_details: value.details,
      discount_type: value.type,
      discount_name: value.name,
    });
  }
}
