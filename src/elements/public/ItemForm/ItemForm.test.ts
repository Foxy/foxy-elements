import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ItemForm } from './ItemForm';
import { html } from 'lit-html';
import { InternalAsyncComboBoxControl } from '../../internal/InternalAsyncComboBoxControl';
import { DiscountBuilder } from '../DiscountBuilder/DiscountBuilder';

describe('ItemForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines vaadin-details', () => {
    expect(customElements.get('vaadin-details')).to.exist;
  });

  it('imports and defines foxy-internal-async-combo-box-control', () => {
    expect(customElements.get('foxy-internal-async-combo-box-control')).to.exist;
  });

  it('imports and defines foxy-internal-async-list-control', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-frequency-control', () => {
    expect(customElements.get('foxy-internal-frequency-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-area-control', () => {
    expect(customElements.get('foxy-internal-text-area-control')).to.exist;
  });

  it('imports and defines foxy-internal-integer-control', () => {
    expect(customElements.get('foxy-internal-integer-control')).to.exist;
  });

  it('imports and defines foxy-internal-number-control', () => {
    expect(customElements.get('foxy-internal-number-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-date-control', () => {
    expect(customElements.get('foxy-internal-date-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-discount-detail-card', () => {
    expect(customElements.get('foxy-discount-detail-card')).to.exist;
  });

  it('imports and defines foxy-coupon-detail-card', () => {
    expect(customElements.get('foxy-coupon-detail-card')).to.exist;
  });

  it('imports and defines foxy-discount-builder', () => {
    expect(customElements.get('foxy-discount-builder')).to.exist;
  });

  it('imports and defines foxy-item-option-card', () => {
    expect(customElements.get('foxy-item-option-card')).to.exist;
  });

  it('imports and defines foxy-item-option-form', () => {
    expect(customElements.get('foxy-item-option-form')).to.exist;
  });

  it('imports and defines foxy-attribute-card', () => {
    expect(customElements.get('foxy-attribute-card')).to.exist;
  });

  it('imports and defines foxy-attribute-form', () => {
    expect(customElements.get('foxy-attribute-form')).to.exist;
  });

  it('imports and defines itself as foxy-item-form', () => {
    expect(customElements.get('foxy-item-form')).to.equal(ItemForm);
  });

  it('extends InternalForm', () => {
    expect(new ItemForm()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace "item-form"', () => {
    expect(ItemForm).to.have.property('defaultNS', 'item-form');
    expect(new ItemForm()).to.have.property('ns', 'item-form');
  });

  it('has a reactive property/attribute "customerAddresses"', () => {
    expect(ItemForm).to.have.nested.property('properties.customerAddresses');
    expect(ItemForm).to.have.nested.property('properties.customerAddresses.type', String);
    expect(ItemForm).to.have.nested.property(
      'properties.customerAddresses.attribute',
      'customer-addresses'
    );

    expect(new ItemForm()).to.have.property('customerAddresses', null);
  });

  it('has a reactive property/attribute "itemCategories"', () => {
    expect(ItemForm).to.have.nested.property('properties.itemCategories');
    expect(ItemForm).to.have.nested.property('properties.itemCategories.type', String);
    expect(ItemForm).to.have.nested.property(
      'properties.itemCategories.attribute',
      'item-categories'
    );

    expect(new ItemForm()).to.have.property('itemCategories', null);
  });

  it('has a reactive property/attribute "coupons"', () => {
    expect(ItemForm).to.have.nested.property('properties.coupons');
    expect(ItemForm).to.have.nested.property('properties.coupons.type', String);
    expect(new ItemForm()).to.have.property('coupons', null);
  });

  it('renders name as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-text-control[infer="name"]');

    expect(control).to.exist;
  });

  it('renders price as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-number-control[infer="price"]');

    expect(control).to.exist;
  });

  it('renders quantity as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-integer-control[infer="quantity"]'
    );

    expect(control).to.exist;
  });

  it('renders item category as a control', async () => {
    const element = await fixture<ItemForm>(html`
      <foxy-item-form item-categories="https://demo.api/hapi/item_categories"></foxy-item-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-async-combo-box-control[infer="item-category-uri"]'
    );

    expect(control).to.exist;
    expect(control).to.have.property('itemValuePath', '_links.self.href');
    expect(control).to.have.property('itemLabelPath', 'name');
    expect(control).to.have.property('property', 'item_category_uri');
    expect(control).to.have.property('first', 'https://demo.api/hapi/item_categories');
  });

  it('renders item code as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-text-control[infer="code"]');
    expect(control).to.exist;
  });

  it('renders item parent code as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-text-control[infer="parent-code"]'
    );

    expect(control).to.exist;
  });

  it('renders min quantity as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-integer-control[infer="quantity-min"]'
    );

    expect(control).to.exist;
  });

  it('renders max quantity as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-integer-control[infer="quantity-max"]'
    );

    expect(control).to.exist;
  });

  it('renders weight as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-number-control[infer="weight"]'
    );
    expect(control).to.exist;
  });

  it('renders width as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-number-control[infer="width"]');
    expect(control).to.exist;
  });

  it('renders height as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-number-control[infer="height"]'
    );
    expect(control).to.exist;
  });

  it('renders length as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-number-control[infer="length"]'
    );
    expect(control).to.exist;
  });

  it('renders subscription frequency as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-frequency-control[infer="subscription-frequency"]'
    );
    expect(control).to.exist;
  });

  it('renders subscription start date as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-date-control[infer="subscription-start-date"]'
    );
    expect(control).to.exist;
  });

  it('renders subscription end date as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-date-control[infer="subscription-end-date"]'
    );
    expect(control).to.exist;
  });

  it('renders item url as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-text-area-control[infer="url"]'
    );

    expect(control).to.exist;
  });

  it('renders item image url as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-text-area-control[infer="image"]'
    );

    expect(control).to.exist;
  });

  it('renders discount name as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-text-control[infer="discount-name"]'
    );

    expect(control).to.exist;
  });

  it('renders discount builder', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);

    element.edit({
      discount_type: 'price_amount',
      discount_details: '1-2|3-4',
      discount_name: 'Test',
    });

    const builder = element.renderRoot.querySelector<DiscountBuilder>('foxy-discount-builder')!;
    await element.requestUpdate();

    expect(builder).to.exist;
    expect(builder).to.have.property('infer', 'discount-builder');
    expect(builder).to.have.deep.property('parsedValue', {
      type: 'price_amount',
      details: '1-2|3-4',
      name: 'Test',
    });

    builder.parsedValue = {
      type: 'quantity_amount',
      details: '5-6|7-8|9-10',
      name: 'Foo Bar',
    };

    builder.dispatchEvent(new CustomEvent('change'));

    expect(element).to.have.nested.property('form.discount_type', 'quantity_amount');
    expect(element).to.have.nested.property('form.discount_details', '5-6|7-8|9-10');
    expect(element).to.have.nested.property('form.discount_name', 'Foo Bar');
  });

  it('renders customer address as a control', async () => {
    const element = await fixture<ItemForm>(html`
      <foxy-item-form customer-addresses="https://demo.api/hapi/customer_addresses">
      </foxy-item-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-async-combo-box-control[infer="shipto"]'
    );

    expect(control).to.exist;
    expect(control).to.have.property('itemValuePath', 'address_name');
    expect(control).to.have.property('itemLabelPath', 'address_name');
    expect(control).to.have.property('first', 'https://demo.api/hapi/customer_addresses');
  });

  it('renders expiry date as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-date-control[infer="expires"]');

    expect(control).to.exist;
    expect(control).to.have.property('format', 'unix');
  });

  it('for existing items, renders discount details as a control', async () => {
    const router = createRouter();
    const element = await fixture<ItemForm>(
      html`
        <foxy-item-form
          href="https://demo.api/hapi/items/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-item-form>
      `
    );

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    const control = element.renderRoot.querySelector(
      'foxy-internal-async-list-control[infer="discount-details"]'
    );

    expect(control).to.exist;
    expect(control).to.have.property('item', 'foxy-discount-detail-card');
    expect(control).to.have.property('limit', 5);
    expect(control).to.have.property('first', element.data!._links['fx:discount_details'].href);
  });

  it('for existing items, renders coupon details as a control', async () => {
    const router = createRouter();
    const element = await fixture<ItemForm>(
      html`
        <foxy-item-form
          href="https://demo.api/hapi/items/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-item-form>
      `
    );

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    const control = element.renderRoot.querySelector(
      'foxy-internal-async-list-control[infer="coupon-details"]'
    );

    expect(control).to.exist;
    expect(control).to.have.property('item', 'foxy-coupon-detail-card');
    expect(control).to.have.property('limit', 5);
    expect(control).to.have.property('first', element.data!._links['fx:coupon_details'].href);
  });

  it('for existing items, renders attributes as a control', async () => {
    const router = createRouter();
    const element = await fixture<ItemForm>(
      html`
        <foxy-item-form
          href="https://demo.api/hapi/items/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-item-form>
      `
    );

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    const control = element.renderRoot.querySelector(
      'foxy-internal-async-list-control[infer="attributes"]'
    );

    expect(control).to.exist;
    expect(control).to.have.property('form', 'foxy-attribute-form');
    expect(control).to.have.property('item', 'foxy-attribute-card');
    expect(control).to.have.property('limit', 5);
    expect(control).to.have.property('first', element.data!._links['fx:attributes'].href);
  });

  it('for existing items, renders item options as a control', async () => {
    const router = createRouter();
    const element = await fixture<ItemForm>(
      html`
        <foxy-item-form
          locale-codes="https://demo.api/hapi/property_helpers/7"
          href="https://demo.api/hapi/items/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-item-form>
      `
    );

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    const control = element.renderRoot.querySelector(
      'foxy-internal-async-list-control[infer="item-options"]'
    );

    expect(control).to.exist;

    expect(control).to.have.property('form', 'foxy-item-option-form');
    expect(control).to.have.property('item', 'foxy-item-option-card');
    expect(control).to.have.property('limit', 5);
    expect(control).to.have.property('first', element.data!._links['fx:item_options'].href);

    expect(control).to.have.deep.property('related', [
      'https://demo.api/hapi/subscriptions/0',
      'https://demo.api/hapi/transactions/0',
      'https://demo.api/hapi/shipments/0',
      'https://demo.api/hapi/items?cart_id=0',
    ]);

    expect(control).to.have.deep.property('props', {
      'locale-codes': 'https://demo.api/hapi/property_helpers/7',
    });
  });
});
