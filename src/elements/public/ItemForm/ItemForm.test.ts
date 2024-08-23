import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ItemForm } from './ItemForm';
import { html } from 'lit-html';
import { DiscountBuilder } from '../DiscountBuilder/DiscountBuilder';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import { NucleonElement } from '../NucleonElement';
import { Resource } from '@foxy.io/sdk/core';
import { Rels } from '@foxy.io/sdk/backend';

describe('ItemForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-resource-picker-control', () => {
    expect(customElements.get('foxy-internal-resource-picker-control')).to.exist;
  });

  it('imports and defines foxy-internal-async-list-control', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-frequency-control', () => {
    expect(customElements.get('foxy-internal-frequency-control')).to.exist;
  });

  it('imports and defines foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
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

  it('imports and defines foxy-item-category-card', () => {
    expect(customElements.get('foxy-item-category-card')).to.exist;
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

  it('imports and defines foxy-nucleon', () => {
    expect(customElements.get('foxy-nucleon')).to.exist;
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
    expect(ItemForm).to.have.nested.property(
      'properties.customerAddresses.attribute',
      'customer-addresses'
    );

    expect(new ItemForm()).to.have.property('customerAddresses', null);
  });

  it('has a reactive property/attribute "itemCategories"', () => {
    expect(ItemForm).to.have.nested.property('properties.itemCategories');
    expect(ItemForm).to.have.nested.property(
      'properties.itemCategories.attribute',
      'item-categories'
    );

    expect(new ItemForm()).to.have.property('itemCategories', null);
  });

  it('has a reactive property/attribute "coupons"', () => {
    expect(ItemForm).to.have.nested.property('properties.coupons');
    expect(new ItemForm()).to.have.property('coupons', null);
  });

  it('has a reactive property/attribute "store"', () => {
    expect(ItemForm).to.have.nested.property('properties.store');
    expect(new ItemForm()).to.have.property('store', null);
  });

  it('sets subscription controls to readonly when form is in snapshot state', () => {
    const form = new ItemForm();
    expect(form.readonlySelector.matches('subscriptions', true)).to.be.false;
    form.href = 'https://demo.api/hapi/items/0';
    expect(form.readonlySelector.matches('subscriptions', true)).to.be.true;
  });

  it('hides shipto field when multiship is disabled for the store', async () => {
    const router = createRouter();
    const element = await fixture<ItemForm>(
      html`
        <foxy-item-form
          store="https://demo.api/hapi/stores/0"
          href="https://demo.api/hapi/items/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-item-form>
      `
    );

    await waitUntil(() => {
      if (!element.in({ idle: 'snapshot' })) return false;
      const nucleons = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...nucleons].every(nucleon => nucleon.in({ idle: 'snapshot' }));
    });

    expect(element.hiddenSelector.matches('general:shipto', true)).to.be.true;

    const store = await getTestData<Resource<Rels.Store>>('./hapi/stores/0', router);
    store.features_multiship = true;
    ItemForm.Rumour('').share({ source: 'https://demo.api/hapi/stores/0', data: store });
    await element.requestUpdate();

    expect(element.hiddenSelector.matches('general:shipto', true)).to.be.false;
  });

  it('hides subscription fields if item is not part of subscription', async () => {
    const form = new ItemForm();
    expect(form.hiddenSelector.matches('subscriptions', true)).to.be.false;

    const item = await getTestData<Data>('./hapi/items/0');
    item.subscription_frequency = '';
    form.data = item;
    expect(form.hiddenSelector.matches('subscriptions', true)).to.be.true;

    item.subscription_frequency = '1m';
    form.data = { ...item };
    expect(form.hiddenSelector.matches('subscriptions', true)).to.be.false;
  });

  it('hides discount builder if discount name is empty', () => {
    const form = new ItemForm();
    expect(form.hiddenSelector.matches('discount:discount-builder', true)).to.be.true;
    form.edit({ discount_name: 'Test' });
    expect(form.hiddenSelector.matches('discount:discount-builder', true)).to.be.false;
  });

  it('hides linked collections when in template state', () => {
    const form = new ItemForm();

    expect(form.hiddenSelector.matches('discount-details', true)).to.be.true;
    expect(form.hiddenSelector.matches('coupon-details', true)).to.be.true;
    expect(form.hiddenSelector.matches('item-options', true)).to.be.true;
    expect(form.hiddenSelector.matches('attributes', true)).to.be.true;

    form.href = 'https://demo.api/hapi/items/0';

    expect(form.hiddenSelector.matches('discount-details', true)).to.be.false;
    expect(form.hiddenSelector.matches('coupon-details', true)).to.be.false;
    expect(form.hiddenSelector.matches('item-options', true)).to.be.false;
    expect(form.hiddenSelector.matches('attributes', true)).to.be.false;
  });

  it('renders a form header', () => {
    const form = new ItemForm();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('uses custom header subtitle options', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const data = await getTestData<Data>('./hapi/items/0');

    element.data = { ...data, is_future_line_item: true };
    expect(element.headerSubtitleOptions).to.deep.equal({ context: 'future_line_item' });

    element.data = { ...data, is_future_line_item: false };
    expect(element.headerSubtitleOptions).to.deep.equal({ context: 'regular' });
  });

  it('renders General summary control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="general"]'
    );

    expect(control).to.exist;
  });

  it('renders name as a control inside of the General summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="general"] foxy-internal-text-control[infer="name"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders price as a control inside of the General summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="general"] foxy-internal-number-control[infer="price"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '0');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders quantity as a control inside of the General summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="general"] foxy-internal-number-control[infer="quantity"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '1');
    expect(control).to.have.attribute('step', '1');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders item category as a control inside of the General summary', async () => {
    const element = await fixture<ItemForm>(html`
      <foxy-item-form item-categories="https://demo.api/hapi/item_categories"></foxy-item-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="general"] foxy-internal-resource-picker-control[infer="item-category-uri"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('first', 'https://demo.api/hapi/item_categories');
    expect(control).to.have.attribute('item', 'foxy-item-category-card');
  });

  it('renders item code as a control inside of the General summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="general"] foxy-internal-text-control[infer="code"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders item parent code as a control inside of the General summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="general"] foxy-internal-text-control[infer="parent-code"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders shipto as a control inside of the General summary', async () => {
    const element = await fixture<ItemForm>(html`
      <foxy-item-form customer-addresses="https://demo.api/hapi/customer_addresses">
      </foxy-item-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="general"] foxy-internal-text-control[infer="shipto"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders Subscriptions summary control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="subscriptions"]'
    );

    expect(control).to.exist;
  });

  it('renders subscription frequency as a control inside of the Subscriptions summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="subscriptions"] foxy-internal-frequency-control[infer="subscription-frequency"]'
    );

    expect(control).to.exist;
    expect(control).to.have.property('layout', 'summary-item');
  });

  it('renders subscription start date as a control inside of the Subscriptions summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="subscriptions"] foxy-internal-date-control[infer="subscription-start-date"]'
    );

    expect(control).to.exist;
    expect(control).to.have.property('layout', 'summary-item');
  });

  it('renders subscription end date as a control inside of the Subscriptions summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="subscriptions"] foxy-internal-date-control[infer="subscription-end-date"]'
    );

    expect(control).to.exist;
    expect(control).to.have.property('layout', 'summary-item');
  });

  it('renders item options as a control', async () => {
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

  it('renders Dimensions summary control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="dimensions"]'
    );

    expect(control).to.exist;
  });

  it('renders weight as a control inside of the Dimensions summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="dimensions"] foxy-internal-number-control[infer="weight"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '0');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders length as a control inside of the Dimensions summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="dimensions"] foxy-internal-number-control[infer="length"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '0');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders width as a control inside of the Dimensions summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="dimensions"] foxy-internal-number-control[infer="width"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '0');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders height as a control inside of the Dimensions summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="dimensions"] foxy-internal-number-control[infer="height"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '0');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders Meta summary control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-summary-control[infer="meta"]');

    expect(control).to.exist;
  });

  it('renders item url as a control inside of the Meta summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="meta"] foxy-internal-text-control[infer="url"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders item image url as a control inside of the Meta summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="meta"] foxy-internal-text-control[infer="image"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders min quantity as a control inside of the Meta summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="meta"] foxy-internal-number-control[infer="quantity-min"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('step', '1');
    expect(control).to.have.attribute('min', '1');
  });

  it('renders max quantity as a control inside of the Meta summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="meta"] foxy-internal-number-control[infer="quantity-max"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('step', '1');
    expect(control).to.have.attribute('min', '1');
  });

  it('renders expiry date as a control inside of the Meta summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="meta"] foxy-internal-date-control[infer="expires"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('format', 'unix');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders Discount summary control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="discount"]'
    );

    expect(control).to.exist;
  });

  it('renders discount name as a control inside of the Discount summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="discount"] foxy-internal-text-control[infer="discount-name"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders discount builder inside of the Discount summary', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);

    element.edit({
      discount_type: 'price_amount',
      discount_details: '1-2|3-4',
      discount_name: 'Test',
    });

    const builder = element.renderRoot.querySelector<DiscountBuilder>(
      '[infer="discount"] foxy-discount-builder[infer="discount-builder"]'
    )!;
    await element.requestUpdate();

    expect(builder).to.exist;
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

  it('renders discount details as a control', async () => {
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
    expect(control).to.have.property('first', element.data!._links['fx:discount_details'].href);
  });

  it('renders coupon details as a control', async () => {
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
    expect(control).to.have.property('first', element.data!._links['fx:coupon_details'].href);
  });

  it('renders attributes as a control', async () => {
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
    expect(control).to.have.property('first', element.data!._links['fx:attributes'].href);
  });
});
