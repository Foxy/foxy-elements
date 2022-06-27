import { expect, fixture, waitUntil } from '@open-wc/testing';
import { html } from 'lit-html';
import { createRouter } from '../../../server/index';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { ItemForm } from './index';

describe('ItemForm', () => {
  it('imports and defines foxy-internal-integer-control', () => {
    expect(customElements.get('foxy-internal-integer-control')).to.exist;
  });

  it('imports and defines foxy-internal-async-details-control', () => {
    expect(customElements.get('foxy-internal-async-details-control')).to.exist;
  });

  it('imports and defines foxy-internal-number-control', () => {
    expect(customElements.get('foxy-internal-number-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
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

  it('imports and defines foxy-coupon-card', () => {
    expect(customElements.get('foxy-coupon-card')).to.exist;
  });

  it('imports and defines foxy-internal-item-form-line-item-discount-control', () => {
    expect(customElements.get('foxy-internal-item-form-line-item-discount-control')).to.exist;
  });

  it('imports and defines foxy-internal-item-form-subscription-control', () => {
    expect(customElements.get('foxy-internal-item-form-subscription-control')).to.exist;
  });

  it('imports and defines foxy-internal-item-form-inventory-control', () => {
    expect(customElements.get('foxy-internal-item-form-inventory-control')).to.exist;
  });

  it('imports and defines foxy-internal-item-form-shipping-control', () => {
    expect(customElements.get('foxy-internal-item-form-shipping-control')).to.exist;
  });

  it('imports and defines foxy-internal-item-form-cart-control', () => {
    expect(customElements.get('foxy-internal-item-form-cart-control')).to.exist;
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

  it('renders subscription info as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-item-form-subscription-control'
    );

    expect(control).to.exist;
  });

  it('renders line item discount info as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-item-form-line-item-discount-control'
    );

    expect(control).to.exist;
  });

  it('renders cart info as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-item-form-cart-control');

    expect(control).to.exist;
  });

  it('renders item shipping info as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-item-form-shipping-control');

    expect(control).to.exist;
  });

  it('renders item inventory info as a control', async () => {
    const element = await fixture<ItemForm>(html`<foxy-item-form></foxy-item-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-item-form-inventory-control');

    expect(control).to.exist;
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
      'foxy-internal-async-details-control[infer="discount-details"]'
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
      'foxy-internal-async-details-control[infer="coupon-details"]'
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
      'foxy-internal-async-details-control[infer="attributes"]'
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
          href="https://demo.api/hapi/items/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-item-form>
      `
    );

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    const control = element.renderRoot.querySelector(
      'foxy-internal-async-details-control[infer="item-options"]'
    );

    expect(control).to.exist;

    expect(control).to.have.property('form', 'foxy-item-option-form');
    expect(control).to.have.property('item', 'foxy-item-option-card');
    expect(control).to.have.property('limit', 5);
    expect(control).to.have.property('first', element.data!._links['fx:item_options'].href);

    expect(control).to.have.deep.property('related', [
      'https://demo.api/hapi/transactions/0',
      'https://demo.api/hapi/shipments/0',
      'https://demo.api/hapi/items?transaction_id=0',
    ]);
  });
});
