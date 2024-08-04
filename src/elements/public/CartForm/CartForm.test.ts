import type { InternalResourcePickerControl } from '../../internal/InternalResourcePickerControl/InternalResourcePickerControl';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import './index';

import { InternalCartFormCreateSessionAction } from './internal/InternalCartFormCreateSessionAction/InternalCartFormCreateSessionAction';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { CartForm as Form } from './CartForm';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import { Type } from '../QueryBuilder/types';

async function waitForIdle(element: Form) {
  await waitUntil(() => element.in('idle'), '', { timeout: 5000 });
  await waitUntil(
    () => {
      const loaders = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...loaders].every(loader => loader.in('idle'));
    },
    '',
    { timeout: 5000 }
  );
}

async function createElement(router = createRouter()) {
  return await fixture<Form>(html`
    <foxy-cart-form
      payment-card-embed-url="https://embed.foxy.io/v1.html"
      item-categories="https://demo.api/hapi/item_categories?store_id=0"
      template-sets="https://demo.api/hapi/template_sets?store_id=0"
      locale-codes="https://demo.api/hapi/property_helpers/7"
      languages="https://demo.api/hapi/property_helpers/6"
      customers="https://demo.api/hapi/customers?store_id=0"
      countries="https://demo.api/hapi/property_helpers/3"
      regions="https://demo.api/hapi/property_helpers/4"
      coupons="https://demo.api/hapi/coupons?store_id=0"
      href="https://demo.api/hapi/carts/0?zoom=discounts"
      @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
    >
    </foxy-cart-form>
  `);
}

describe('CartForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-resource-picker-control', () => {
    const element = customElements.get('foxy-internal-resource-picker-control');
    expect(element).to.exist;
  });

  it('imports and defines foxy-internal-async-list-control', () => {
    const element = customElements.get('foxy-internal-async-list-control');
    expect(element).to.exist;
  });

  it('imports and defines foxy-internal-summary-control', () => {
    const element = customElements.get('foxy-internal-summary-control');
    expect(element).to.exist;
  });

  it('imports and defines foxy-internal-switch-control', () => {
    const element = customElements.get('foxy-internal-switch-control');
    expect(element).to.exist;
  });

  it('imports and defines foxy-internal-select-control', () => {
    const element = customElements.get('foxy-internal-select-control');
    expect(element).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    const element = customElements.get('foxy-internal-text-control');
    expect(element).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    const element = customElements.get('foxy-internal-form');
    expect(element).to.exist;
  });

  it('imports and defines foxy-applied-coupon-code-card', () => {
    const element = customElements.get('foxy-applied-coupon-code-card');
    expect(element).to.exist;
  });

  it('imports and defines foxy-applied-coupon-code-form', () => {
    const element = customElements.get('foxy-applied-coupon-code-form');
    expect(element).to.exist;
  });

  it('imports and defines foxy-custom-field-card', () => {
    const element = customElements.get('foxy-custom-field-card');
    expect(element).to.exist;
  });

  it('imports and defines foxy-custom-field-form', () => {
    const element = customElements.get('foxy-custom-field-form');
    expect(element).to.exist;
  });

  it('imports and defines foxy-template-set-card', () => {
    const element = customElements.get('foxy-template-set-card');
    expect(element).to.exist;
  });

  it('imports and defines foxy-nucleon', () => {
    const element = customElements.get('foxy-nucleon');
    expect(element).to.exist;
  });

  it('imports and defines foxy-attribute-card', () => {
    const element = customElements.get('foxy-attribute-card');
    expect(element).to.exist;
  });

  it('imports and defines foxy-attribute-form', () => {
    const element = customElements.get('foxy-attribute-form');
    expect(element).to.exist;
  });

  it('imports and defines foxy-customer-card', () => {
    const element = customElements.get('foxy-customer-card');
    expect(element).to.exist;
  });

  it('imports and defines foxy-item-card', () => {
    const element = customElements.get('foxy-item-card');
    expect(element).to.exist;
  });

  it('imports and defines foxy-item-form', () => {
    const element = customElements.get('foxy-item-form');
    expect(element).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    const element = customElements.get('foxy-i18n');
    expect(element).to.exist;
  });

  it('imports and defines foxy-internal-cart-form-create-session-action', () => {
    const element = customElements.get('foxy-internal-cart-form-create-session-action');
    expect(element).to.exist;
  });

  it('imports and defines foxy-internal-cart-form-address-summary-item', () => {
    const element = customElements.get('foxy-internal-cart-form-address-summary-item');
    expect(element).to.exist;
  });

  it('imports and defines foxy-internal-cart-form-payment-method-form', () => {
    const element = customElements.get('foxy-internal-cart-form-payment-method-form');
    expect(element).to.exist;
  });

  it('imports and defines foxy-internal-cart-form-payment-method-card', () => {
    const element = customElements.get('foxy-internal-cart-form-payment-method-card');
    expect(element).to.exist;
  });

  it('imports and defines foxy-internal-cart-form-totals-control', () => {
    const element = customElements.get('foxy-internal-cart-form-totals-control');
    expect(element).to.exist;
  });

  it('imports and defines itself as foxy-cart-form', () => {
    const element = customElements.get('foxy-cart-form');
    expect(element).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace "cart-form"', () => {
    expect(Form).to.have.property('defaultNS', 'cart-form');
    expect(new Form()).to.have.property('ns', 'cart-form');
  });

  it('has a reactive property "paymentCardEmbedUrl"', () => {
    expect(new Form()).to.have.property('paymentCardEmbedUrl', null);
    expect(Form).to.have.nested.property('properties.paymentCardEmbedUrl');
    expect(Form).to.not.have.nested.property('properties.paymentCardEmbedUrl.type');
    expect(Form).to.have.nested.property(
      'properties.paymentCardEmbedUrl.attribute',
      'payment-card-embed-url'
    );
  });

  it('has a reactive property "itemCategories"', () => {
    expect(new Form()).to.have.property('itemCategories', null);
    expect(Form).to.have.nested.property('properties.itemCategories');
    expect(Form).to.not.have.nested.property('properties.itemCategories.type');
    expect(Form).to.have.nested.property('properties.itemCategories.attribute', 'item-categories');
  });

  it('has a reactive property "templateSets"', () => {
    expect(new Form()).to.have.property('templateSets', null);
    expect(Form).to.have.nested.property('properties.templateSets');
    expect(Form).to.not.have.nested.property('properties.templateSets.type');
    expect(Form).to.have.nested.property('properties.templateSets.attribute', 'template-sets');
  });

  it('has a reactive property "localeCodes"', () => {
    expect(new Form()).to.have.property('localeCodes', null);
    expect(Form).to.have.nested.property('properties.localeCodes');
    expect(Form).to.not.have.nested.property('properties.localeCodes.type');
    expect(Form).to.have.nested.property('properties.localeCodes.attribute', 'locale-codes');
  });

  it('has a reactive property "languages"', () => {
    expect(new Form()).to.have.property('languages', null);
    expect(Form).to.have.nested.property('properties.languages');
    expect(Form).to.not.have.nested.property('properties.languages.type');
  });

  it('has a reactive property "customers"', () => {
    expect(new Form()).to.have.property('customers', null);
    expect(Form).to.have.nested.property('properties.customers');
    expect(Form).to.not.have.nested.property('properties.customers.type');
  });

  it('has a reactive property "countries"', () => {
    expect(new Form()).to.have.property('countries', null);
    expect(Form).to.have.nested.property('properties.countries');
    expect(Form).to.not.have.nested.property('properties.countries.type');
  });

  it('has a reactive property "regions"', () => {
    expect(new Form()).to.have.property('regions', null);
    expect(Form).to.have.nested.property('properties.regions');
    expect(Form).to.not.have.nested.property('properties.regions.type');
  });

  it('has a reactive property "coupons"', () => {
    expect(new Form()).to.have.property('coupons', null);
    expect(Form).to.have.nested.property('properties.coupons');
    expect(Form).to.not.have.nested.property('properties.coupons.type');
  });

  it('produces the billing-first-name:v8n_too_long error if "billing_first_name" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ billing_first_name: 'A'.repeat(51) });
    expect(form.errors).to.include('billing-first-name:v8n_too_long');

    form.edit({ billing_first_name: 'A'.repeat(50) });
    expect(form.errors).to.not.include('billing-first-name:v8n_too_long');
  });

  it('produces the billing-last-name:v8n_too_long error if "billing_last_name" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ billing_last_name: 'A'.repeat(51) });
    expect(form.errors).to.include('billing-last-name:v8n_too_long');

    form.edit({ billing_last_name: 'A'.repeat(50) });
    expect(form.errors).to.not.include('billing-last-name:v8n_too_long');
  });

  it('produces the billing-state:v8n_too_long error if "billing_state" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ billing_state: 'A'.repeat(51) });
    expect(form.errors).to.include('billing-state:v8n_too_long');

    form.edit({ billing_state: 'A'.repeat(50) });
    expect(form.errors).to.not.include('billing-state:v8n_too_long');
  });

  it('produces the billing-city:v8n_too_long error if "billing_city" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ billing_city: 'A'.repeat(51) });
    expect(form.errors).to.include('billing-city:v8n_too_long');

    form.edit({ billing_city: 'A'.repeat(50) });
    expect(form.errors).to.not.include('billing-city:v8n_too_long');
  });

  it('produces the billing-phone:v8n_too_long error if "billing_phone" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ billing_phone: 'A'.repeat(51) });
    expect(form.errors).to.include('billing-phone:v8n_too_long');

    form.edit({ billing_phone: 'A'.repeat(50) });
    expect(form.errors).to.not.include('billing-phone:v8n_too_long');
  });

  it('produces the billing-company:v8n_too_long error if "billing_company" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ billing_company: 'A'.repeat(51) });
    expect(form.errors).to.include('billing-company:v8n_too_long');

    form.edit({ billing_company: 'A'.repeat(50) });
    expect(form.errors).to.not.include('billing-company:v8n_too_long');
  });

  it('produces the billing-address-one:v8n_too_long error if "billing_address1" is longer than 100 characters', () => {
    const form = new Form();

    form.edit({ billing_address1: 'A'.repeat(101) });
    expect(form.errors).to.include('billing-address-one:v8n_too_long');

    form.edit({ billing_address1: 'A'.repeat(100) });
    expect(form.errors).to.not.include('billing-address-one:v8n_too_long');
  });

  it('produces the billing-address-two:v8n_too_long error if "billing_address2" is longer than 100 characters', () => {
    const form = new Form();

    form.edit({ billing_address2: 'A'.repeat(101) });
    expect(form.errors).to.include('billing-address-two:v8n_too_long');

    form.edit({ billing_address2: 'A'.repeat(100) });
    expect(form.errors).to.not.include('billing-address-two:v8n_too_long');
  });

  it('produces the billing-postal-code:v8n_too_long error if "billing_postal_code" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ billing_postal_code: 'A'.repeat(51) });
    expect(form.errors).to.include('billing-postal-code:v8n_too_long');

    form.edit({ billing_postal_code: 'A'.repeat(50) });
    expect(form.errors).to.not.include('billing-postal-code:v8n_too_long');
  });

  it('produces the shipping-first-name:v8n_too_long error if "shipping_first_name" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ shipping_first_name: 'A'.repeat(51) });
    expect(form.errors).to.include('shipping-first-name:v8n_too_long');

    form.edit({ shipping_first_name: 'A'.repeat(50) });
    expect(form.errors).to.not.include('shipping-first-name:v8n_too_long');
  });

  it('produces the shipping-last-name:v8n_too_long error if "shipping_last_name" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ shipping_last_name: 'A'.repeat(51) });
    expect(form.errors).to.include('shipping-last-name:v8n_too_long');

    form.edit({ shipping_last_name: 'A'.repeat(50) });
    expect(form.errors).to.not.include('shipping-last-name:v8n_too_long');
  });

  it('produces the shipping-state:v8n_too_long error if "shipping_state" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ shipping_state: 'A'.repeat(51) });
    expect(form.errors).to.include('shipping-state:v8n_too_long');

    form.edit({ shipping_state: 'A'.repeat(50) });
    expect(form.errors).to.not.include('shipping-state:v8n_too_long');
  });

  it('produces the shipping-city:v8n_too_long error if "shipping_city" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ shipping_city: 'A'.repeat(51) });
    expect(form.errors).to.include('shipping-city:v8n_too_long');

    form.edit({ shipping_city: 'A'.repeat(50) });
    expect(form.errors).to.not.include('shipping-city:v8n_too_long');
  });

  it('produces the shipping-phone:v8n_too_long error if "shipping_phone" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ shipping_phone: 'A'.repeat(51) });
    expect(form.errors).to.include('shipping-phone:v8n_too_long');

    form.edit({ shipping_phone: 'A'.repeat(50) });
    expect(form.errors).to.not.include('shipping-phone:v8n_too_long');
  });

  it('produces the shipping-company:v8n_too_long error if "shipping_company" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ shipping_company: 'A'.repeat(51) });
    expect(form.errors).to.include('shipping-company:v8n_too_long');

    form.edit({ shipping_company: 'A'.repeat(50) });
    expect(form.errors).to.not.include('shipping-company:v8n_too_long');
  });

  it('produces the shipping-address-one:v8n_too_long error if "shipping_address1" is longer than 100 characters', () => {
    const form = new Form();

    form.edit({ shipping_address1: 'A'.repeat(101) });
    expect(form.errors).to.include('shipping-address-one:v8n_too_long');

    form.edit({ shipping_address1: 'A'.repeat(100) });
    expect(form.errors).to.not.include('shipping-address-one:v8n_too_long');
  });

  it('produces the shipping-address-two:v8n_too_long error if "shipping_address2" is longer than 100 characters', () => {
    const form = new Form();

    form.edit({ shipping_address2: 'A'.repeat(101) });
    expect(form.errors).to.include('shipping-address-two:v8n_too_long');

    form.edit({ shipping_address2: 'A'.repeat(100) });
    expect(form.errors).to.not.include('shipping-address-two:v8n_too_long');
  });

  it('produces the shipping-postal-code:v8n_too_long error if "shipping_postal_code" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ shipping_postal_code: 'A'.repeat(51) });
    expect(form.errors).to.include('shipping-postal-code:v8n_too_long');

    form.edit({ shipping_postal_code: 'A'.repeat(50) });
    expect(form.errors).to.not.include('shipping-postal-code:v8n_too_long');
  });

  it('hides customer email when customer uri is set', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('general:customer-email', true)).to.be.false;
    form.edit({ customer_uri: 'https://demo.api/hapi/customers/0' });
    expect(form.hiddenSelector.matches('general:customer-email', true)).to.be.true;
  });

  it('hides payment method uri when customer uri is not set', async () => {
    const form = new Form();
    form.data = await getTestData('https://demo.api/hapi/carts/0?zoom=discounts');
    form.edit({ customer_uri: '' });
    expect(form.hiddenSelector.matches('billing:payment-method-uri', true)).to.be.true;
    form.edit({ customer_uri: 'https://demo.api/hapi/customers/0' });
    expect(form.hiddenSelector.matches('billing:payment-method-uri', true)).to.be.false;
  });

  it('hides shipping address when "Use billing address for shipping" is checked', async () => {
    const form = new Form();
    form.data = await getTestData('https://demo.api/hapi/carts/0?zoom=discounts');
    form.edit({ use_customer_shipping_address: false });
    expect(form.hiddenSelector.matches('shipping:shipping-address', true)).to.be.true;
    form.edit({ use_customer_shipping_address: true });
    expect(form.hiddenSelector.matches('shipping:shipping-address', true)).to.be.false;
  });

  [
    'applied-coupon-codes',
    'custom-fields',
    'attributes',
    'shipping',
    'billing',
    'totals',
    'items',
  ].forEach(control => {
    it(`hides "${control}" when in template state`, async () => {
      const form = new Form();
      expect(form.hiddenSelector.matches(control, true)).to.be.true;
      form.data = await getTestData('https://demo.api/hapi/carts/0?zoom=discounts');
      expect(form.hiddenSelector.matches(control, true)).to.be.false;
    });
  });

  it('renders a form header', () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders "View as customer" button for existing carts', async () => {
    const router = createRouter();
    const element = await createElement(router);

    await waitForIdle(element);
    const control = element.renderRoot.querySelector(`[infer="view-as-customer"]`);
    expect(control).to.be.instanceOf(InternalCartFormCreateSessionAction);
  });

  it('renders General summary', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);

    const summary = element.renderRoot.querySelector(`[infer="general"]`);
    expect(summary).to.exist;
    expect(summary?.localName).to.equal('foxy-internal-summary-control');
  });

  it('renders resource picker control for template set uri inside General summary', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);

    const control = element.renderRoot.querySelector(
      `[infer="general"] [infer="template-set-uri"]`
    );

    expect(control).to.exist;
    expect(control?.localName).to.equal('foxy-internal-resource-picker-control');
    expect(control?.getAttribute('layout')).to.equal('summary-item');
    expect(control?.getAttribute('item')).to.equal('foxy-template-set-card');
    expect(control?.getAttribute('first')).to.equal(
      'https://demo.api/hapi/template_sets?store_id=0'
    );
  });

  it('renders select control for language inside General summary', async () => {
    const router = createRouter();
    const element = await createElement(router);
    const languages = await getTestData<Resource<Rels.Languages>>(
      'https://demo.api/hapi/property_helpers/6',
      router
    );

    await waitForIdle(element);
    const control = element.renderRoot.querySelector(`[infer="general"] [infer="language"]`);

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-select-control');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property(
      'options',
      Object.entries(languages.values).map(([value, rawLabel]) => ({ value, rawLabel }))
    );
  });

  it('renders resource picker control for customer uri inside General summary', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);

    const control = element.renderRoot.querySelector<InternalResourcePickerControl>(
      `[infer="general"] [infer="customer-uri"]`
    );

    expect(control).to.exist;
    expect(control?.localName).to.equal('foxy-internal-resource-picker-control');
    expect(control?.getAttribute('layout')).to.equal('summary-item');
    expect(control?.getAttribute('item')).to.equal('foxy-customer-card');
    expect(control?.getAttribute('first')).to.equal('https://demo.api/hapi/customers?store_id=0');

    expect(control).to.have.deep.property('filters', [
      { label: 'filter_email', path: 'email', type: Type.String },
      {
        label: 'filter_is_anonymous',
        path: 'is_anonymous',
        type: Type.String,
        list: [
          { value: 'false', label: 'filter_is_anonymous_value_false' },
          { value: 'true', label: 'filter_is_anonymous_value_true' },
        ],
      },
    ]);

    element.edit({ customer_email: 'foo@bar.com', customer_uri: '' });
    control?.setValue('https://demo.api/hapi/customers/0');

    expect(element).to.have.nested.property('form.customer_email', '');
    expect(element).to.have.nested.property(
      'form.customer_uri',
      'https://demo.api/hapi/customers/0'
    );
  });

  it('renders text control for customer email inside General summary', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);

    const control = element.renderRoot.querySelector(`[infer="general"] [infer="customer-email"]`);
    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-text-control');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders async list control for items', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);

    const control = element.renderRoot.querySelector(`[infer="items"]`);
    expect(control).to.exist;

    expect(control).to.have.attribute('item', 'foxy-item-card');
    expect(control).to.have.attribute('form', 'foxy-item-form');
    expect(control).to.have.attribute('alert');

    expect(control).to.have.property('localName', 'foxy-internal-async-list-control');

    expect(control).to.have.deep.property('related', [
      'https://demo.api/hapi/carts/0?zoom=discounts',
    ]);

    expect(control).to.have.deep.nested.property(
      'itemProps.locale-codes',
      'https://demo.api/hapi/property_helpers/7'
    );

    expect(control).to.have.deep.nested.property(
      'formProps.customer-addresses',
      'https://demo.api/hapi/customer_addresses?customer_id=0'
    );

    expect(control).to.have.deep.nested.property(
      'formProps.item-categories',
      'https://demo.api/hapi/item_categories?store_id=0'
    );

    expect(control).to.have.deep.nested.property(
      'formProps.locale-codes',
      'https://demo.api/hapi/property_helpers/7'
    );

    expect(control).to.have.deep.nested.property(
      'formProps.coupons',
      'https://demo.api/hapi/coupons?store_id=0'
    );
  });

  it('renders totals control', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);

    const control = element.renderRoot.querySelector(`[infer="totals"]`);
    expect(control).to.exist;
    expect(control?.localName).to.equal('foxy-internal-cart-form-totals-control');
  });

  it('renders async list control for applied coupon codes', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);

    const control = element.renderRoot.querySelector(`[infer="applied-coupon-codes"]`);
    expect(control).to.exist;

    expect(control).to.have.attribute('item', 'foxy-applied-coupon-code-card');
    expect(control).to.have.attribute('form', 'foxy-applied-coupon-code-form');
    expect(control).to.have.attribute('alert');

    expect(control).to.have.property('localName', 'foxy-internal-async-list-control');
    expect(control).to.have.deep.property('related', [
      'https://demo.api/hapi/carts/0?zoom=discounts',
    ]);
  });

  it('renders summary control for Billing', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);

    const control = element.renderRoot.querySelector(`[infer="billing"]`);
    expect(control).to.exist;
    expect(control?.localName).to.equal('foxy-internal-summary-control');
  });

  it('renders resource picker control for payment method uri inside Billing summary', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);

    const control = element.renderRoot.querySelector<InternalResourcePickerControl>(
      `[infer="billing"] [infer="payment-method-uri"]`
    );

    expect(control).to.exist;
    expect(control?.localName).to.equal('foxy-internal-resource-picker-control');
    expect(control?.getAttribute('layout')).to.equal('summary-item');
    expect(control?.getAttribute('item')).to.equal('foxy-internal-cart-form-payment-method-card');
    expect(control?.getAttribute('form')).to.equal('foxy-internal-cart-form-payment-method-form');
    expect(control?.getAttribute('first')).to.equal(
      'https://demo.api/hapi/transactions?customer_id=0&zoom=payments'
    );

    expect(control).to.have.deep.property('formProps', {
      'default-payment-method': 'https://demo.api/hapi/payment_methods/0',
      'payment-card-embed-url': 'https://embed.foxy.test/v1.html?template_set_id=0',
    });

    element.edit({ payment_method_uri: '' });
    control?.setValue('https://demo.api/transactions/0?zoom=payments');
    expect(element).to.have.nested.property(
      'form.payment_method_uri',
      'https://demo.api/transactions/0/payments'
    );

    expect(control).to.have.deep.property('filters', [
      {
        label: 'filter_type',
        type: Type.String,
        path: 'payments:type',
        list: [
          { label: 'filter_type_value_purchase_order', value: 'purchase_order' },
          { label: 'filter_type_value_amazon_mws', value: 'amazon_mws' },
          { label: 'filter_type_value_paypal_ec', value: 'paypal_ec' },
          { label: 'filter_type_value_paypal', value: 'paypal' },
          { label: 'filter_type_value_hosted', value: 'hosted' },
          { label: 'filter_type_value_ogone', value: 'ogone' },
        ],
      },
      {
        label: 'filter_cc_type',
        type: Type.String,
        path: 'payments:cc_type',
        list: [
          { label: 'filter_cc_type_value_mastercard', value: 'mastercard' },
          { label: 'filter_cc_type_value_discover', value: 'discover' },
          { label: 'filter_cc_type_value_unionpay', value: 'unionpay' },
          { label: 'filter_cc_type_value_maestro', value: 'maestro' },
          { label: 'filter_cc_type_value_diners', value: 'diners' },
          { label: 'filter_cc_type_value_visa', value: 'visa' },
          { label: 'filter_cc_type_value_amex', value: 'amex' },
          { label: 'filter_cc_type_value_jcb', value: 'jcb' },
        ],
      },
      {
        label: 'filter_cc_number_masked',
        type: Type.String,
        path: 'payments:cc_number_masked',
      },
    ]);

    expect(control?.getDisplayValueOptions(await getTestData('./hapi/payments'), '')).to.deep.equal(
      {
        cc_exp_month: '01',
        cc_exp_year: '2017',
        cc_last4: '1111',
        cc_type: 'Visa',
        context: '',
      }
    );

    expect(control?.getDisplayValueOptions(null, '')).to.deep.equal({
      cc_exp_month: '12',
      cc_exp_year: '2020',
      cc_last4: '1111',
      cc_type: 'MasterCard',
      context: '',
    });

    element.edit({ customer_uri: '' });
    await element.requestUpdate();
    await waitUntil(
      () =>
        [...element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon')].every(el =>
          el.in('idle')
        ),
      '',
      { timeout: 5000 }
    );

    expect(control?.getDisplayValueOptions(null, '')).to.deep.equal({
      cc_exp_month: '',
      cc_exp_year: '',
      cc_last4: '',
      cc_type: '',
      context: 'empty',
    });
  });

  it('renders cart form address summary item control for billing address inside Billing summary', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);

    const control = element.renderRoot.querySelector(`[infer="billing"] [infer="billing-address"]`);
    expect(control).to.exist;
    expect(control?.localName).to.equal('foxy-internal-cart-form-address-summary-item');

    expect(control).to.have.attribute('countries', 'https://demo.api/hapi/property_helpers/3');
    expect(control).to.have.attribute('regions', 'https://demo.api/hapi/property_helpers/4');
    expect(control).to.have.attribute('type', 'billing');

    expect(control).to.have.deep.property(
      'customer',
      await getTestData(
        './hapi/customers/0?zoom=default_payment_method%2Cdefault_billing_address%2Cdefault_shipping_address'
      )
    );
  });

  it('renders summary control for Shipping', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);

    const control = element.renderRoot.querySelector(`[infer="shipping"]`);
    expect(control).to.exist;
    expect(control?.localName).to.equal('foxy-internal-summary-control');
  });

  it('renders a switch control for using billing address as shipping address inside Shipping summary', async () => {
    const router = createRouter();
    const element = await createElement(router);

    await waitForIdle(element);
    const control = element.renderRoot.querySelector(
      `[infer="shipping"] [infer="use-customer-shipping-address"]`
    );

    expect(control).to.exist;
    expect(control?.localName).to.equal('foxy-internal-switch-control');
    expect(control).to.have.attribute('invert');
  });

  it('renders cart form address summary item control for shipping address inside Shipping summary', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);
    const control = element.renderRoot.querySelector(
      `[infer="shipping"] [infer="shipping-address"]`
    );

    expect(control).to.exist;
    expect(control?.localName).to.equal('foxy-internal-cart-form-address-summary-item');

    expect(control).to.have.attribute('countries', 'https://demo.api/hapi/property_helpers/3');
    expect(control).to.have.attribute('regions', 'https://demo.api/hapi/property_helpers/4');
    expect(control).to.have.attribute('type', 'shipping');

    expect(control).to.have.deep.property(
      'customer',
      await getTestData(
        './hapi/customers/0?zoom=default_payment_method%2Cdefault_billing_address%2Cdefault_shipping_address'
      )
    );
  });

  it('renders async list control for custom fields', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);

    const control = element.renderRoot.querySelector(`[infer="custom-fields"]`);
    expect(control).to.exist;

    expect(control).to.have.attribute('first', 'https://demo.api/hapi/custom_fields?cart_id=0');
    expect(control).to.have.attribute('item', 'foxy-custom-field-card');
    expect(control).to.have.attribute('form', 'foxy-custom-field-form');
    expect(control).to.have.attribute('alert');

    expect(control).to.have.property('localName', 'foxy-internal-async-list-control');
  });

  it('renders async list control for attributes', async () => {
    const router = createRouter();
    const element = await createElement(router);
    await waitForIdle(element);

    const control = element.renderRoot.querySelector(`[infer="attributes"]`);
    expect(control).to.exist;

    expect(control).to.have.attribute('first', 'https://demo.api/hapi/cart_attributes?cart_id=0');
    expect(control).to.have.attribute('item', 'foxy-attribute-card');
    expect(control).to.have.attribute('form', 'foxy-attribute-form');
    expect(control).to.have.attribute('alert');

    expect(control).to.have.property('localName', 'foxy-internal-async-list-control');
  });
});
