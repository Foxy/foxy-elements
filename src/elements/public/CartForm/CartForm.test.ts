import type { ItemRenderer } from '../CollectionPage/types';
import type { FormRenderer } from '../FormDialog/types';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { InternalCartFormViewAsCustomerControl } from './internal/InternalCartFormViewAsCustomerControl/InternalCartFormViewAsCustomerControl';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalAsyncComboBoxControl } from '../../internal/InternalAsyncComboBoxControl/InternalAsyncComboBoxControl';
import { InternalAsyncListControl } from '../../internal/InternalAsyncListControl/InternalAsyncListControl';
import { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import { AppliedCouponCodeCard } from '../AppliedCouponCodeCard/AppliedCouponCodeCard';
import { AppliedCouponCodeForm } from '../AppliedCouponCodeForm/AppliedCouponCodeForm';
import { InternalDeleteControl } from '../../internal/InternalDeleteControl/InternalDeleteControl';
import { InternalCreateControl } from '../../internal/InternalCreateControl/InternalCreateControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { CartForm as Form } from './CartForm';
import { CustomFieldCard } from '../CustomFieldCard/CustomFieldCard';
import { CustomFieldForm } from '../CustomFieldForm/CustomFieldForm';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { getByTestClass } from '../../../testgen/getByTestClass';
import { AttributeCard } from '../AttributeCard/AttributeCard';
import { AttributeForm } from '../AttributeForm/AttributeForm';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { DiscountCard } from '../DiscountCard/DiscountCard';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { getByTestId } from '../../../testgen/getByTestId';
import { FormDialog } from '../FormDialog';
import { getByKey } from '../../../testgen/getByKey';
import { ItemCard } from '../ItemCard/ItemCard';
import { ItemForm } from '../ItemForm/ItemForm';
import { spread } from '@open-wc/lit-helpers';
import { I18n } from '../I18n/I18n';
import { fake } from 'sinon';

describe('CartForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-async-combo-box-control', () => {
    const element = customElements.get('foxy-internal-async-combo-box-control');
    expect(element).to.equal(InternalAsyncComboBoxControl);
  });

  it('imports and defines foxy-internal-async-list-control', () => {
    const element = customElements.get('foxy-internal-async-list-control');
    expect(element).to.equal(InternalAsyncListControl);
  });

  it('imports and defines foxy-internal-select-control', () => {
    const element = customElements.get('foxy-internal-select-control');
    expect(element).to.equal(InternalSelectControl);
  });

  it('imports and defines foxy-internal-delete-control', () => {
    const element = customElements.get('foxy-internal-delete-control');
    expect(element).to.equal(InternalDeleteControl);
  });

  it('imports and defines foxy-internal-create-control', () => {
    const element = customElements.get('foxy-internal-create-control');
    expect(element).to.equal(InternalCreateControl);
  });

  it('imports and defines foxy-internal-text-control', () => {
    const element = customElements.get('foxy-internal-text-control');
    expect(element).to.equal(InternalTextControl);
  });

  it('imports and defines foxy-internal-form', () => {
    const element = customElements.get('foxy-internal-form');
    expect(element).to.equal(InternalForm);
  });

  it('imports and defines foxy-applied-coupon-code-card', () => {
    const element = customElements.get('foxy-applied-coupon-code-card');
    expect(element).to.equal(AppliedCouponCodeCard);
  });

  it('imports and defines foxy-applied-coupon-code-form', () => {
    const element = customElements.get('foxy-applied-coupon-code-form');
    expect(element).to.equal(AppliedCouponCodeForm);
  });

  it('imports and defines foxy-custom-field-card', () => {
    const element = customElements.get('foxy-custom-field-card');
    expect(element).to.equal(CustomFieldCard);
  });

  it('imports and defines foxy-custom-field-form', () => {
    const element = customElements.get('foxy-custom-field-form');
    expect(element).to.equal(CustomFieldForm);
  });

  it('imports and defines foxy-nucleon', () => {
    const element = customElements.get('foxy-nucleon');
    expect(element).to.equal(NucleonElement);
  });

  it('imports and defines foxy-attribute-card', () => {
    const element = customElements.get('foxy-attribute-card');
    expect(element).to.equal(AttributeCard);
  });

  it('imports and defines foxy-attribute-form', () => {
    const element = customElements.get('foxy-attribute-form');
    expect(element).to.equal(AttributeForm);
  });

  it('imports and defines foxy-discount-card', () => {
    const element = customElements.get('foxy-discount-card');
    expect(element).to.equal(DiscountCard);
  });

  it('imports and defines foxy-item-card', () => {
    const element = customElements.get('foxy-item-card');
    expect(element).to.equal(ItemCard);
  });

  it('imports and defines foxy-item-form', () => {
    const element = customElements.get('foxy-item-form');
    expect(element).to.equal(ItemForm);
  });

  it('imports and defines foxy-i18n', () => {
    const element = customElements.get('foxy-i18n');
    expect(element).to.equal(I18n);
  });

  it('imports and defines foxy-internal-cart-form-view-as-customer-control', () => {
    const element = customElements.get('foxy-internal-cart-form-view-as-customer-control');
    expect(element).to.equal(InternalCartFormViewAsCustomerControl);
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

  it('produces the billing-region:v8n_too_long error if "billing_region" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ billing_region: 'A'.repeat(51) });
    expect(form.errors).to.include('billing-region:v8n_too_long');

    form.edit({ billing_region: 'A'.repeat(50) });
    expect(form.errors).to.not.include('billing-region:v8n_too_long');
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

  it('produces the shipping-region:v8n_too_long error if "shipping_region" is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ shipping_region: 'A'.repeat(51) });
    expect(form.errors).to.include('shipping-region:v8n_too_long');

    form.edit({ shipping_region: 'A'.repeat(50) });
    expect(form.errors).to.not.include('shipping-region:v8n_too_long');
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

  it('renders order section title and description', async () => {
    const element = await fixture<Form>(html`<foxy-cart-form></foxy-cart-form>`);
    const title = await getByKey(element, 'order_section_title');
    const description = await getByKey(element, 'order_section_description');

    expect(title).to.exist;
    expect(title).to.have.property('infer', '');

    expect(description).to.exist;
    expect(description).to.have.property('infer', '');
  });

  it('renders a select control for customer type', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}></foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(
      `[infer="customer-type"]`
    ) as InternalSelectControl;

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_new', value: 'new' },
      { label: 'option_guest', value: 'guest' },
      { label: 'option_regular', value: 'regular' },
    ]);

    expect(control.getValue()).to.equal('new');

    const api = new NucleonElement.API(element);
    await api.fetch('https://demo.api/hapi/customers/0', {
      method: 'PATCH',
      body: JSON.stringify({ is_anonymous: true }),
    });
    element.edit({ customer_uri: 'https://demo.api/hapi/customers/0' });
    await waitUntil(() => control.getValue() === 'guest', '', { timeout: 5000 });

    expect(control.getValue()).to.equal('guest');

    await api.fetch('https://demo.api/hapi/customers/0', {
      method: 'PATCH',
      body: JSON.stringify({ is_anonymous: false }),
    });
    element.edit({ customer_uri: '' });
    await element.requestUpdate();
    element.edit({ customer_uri: 'https://demo.api/hapi/customers/0' });
    await waitUntil(() => control.getValue() === 'regular', '', { timeout: 5000 });

    expect(control.getValue()).to.equal('regular');
  });

  it('renders an async combo box control for customer', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form
        customers="https://demo.api/hapi/customers"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-form>
    `);

    const $ = element.renderRoot;
    const control = $.querySelector(`[infer="customer"]`) as InternalAsyncComboBoxControl;

    expect(control).to.be.instanceOf(InternalAsyncComboBoxControl);
    expect(control).to.have.attribute('item-label-path', 'email');
    expect(control).to.have.attribute('item-value-path', '_links.self.href');
    expect(control).to.have.attribute('item-id-path', '_links.self.href');
    expect(control).to.have.attribute('allow-custom-value');
    expect(control).to.have.attribute('first', 'https://demo.api/hapi/customers?is_anonymous=0');

    const customerTypeControl = $.querySelector(`[infer="customer-type"]`) as InternalSelectControl;
    customerTypeControl.setValue('guest');
    await element.requestUpdate();
    expect(control).to.have.attribute('first', 'https://demo.api/hapi/customers?is_anonymous=1');

    element.edit({ customer_email: 'test@example.com', customer_uri: '' });
    expect(control.getValue()).to.equal('test@example.com');

    element.edit({ customer_uri: 'https://demo.api/hapi/customers/0' });
    expect(control.getValue()).to.equal('https://demo.api/hapi/customers/0');

    control.setValue('foo@example.com');
    expect(element).to.have.nested.property('form.customer_email', 'foo@example.com');
    expect(element).to.have.nested.property('form.customer_uri', '');

    control.setValue('https://demo.api/hapi/customers/0');
    expect(element).to.not.have.nested.property('form.customer_email');
    expect(element).to.have.nested.property(
      'form.customer_uri',
      'https://demo.api/hapi/customers/0'
    );

    element.undo();
    await element.requestUpdate();
    expect(control).to.have.property('selectedItem', null);

    element.edit({ customer_uri: 'https://demo.api/hapi/customers/0' });
    const customer = await getTestData('https://demo.api/hapi/customers/0', router);
    await waitUntil(() => !!control.selectedItem, '', { timeout: 5000 });
    expect(control).to.have.deep.property('selectedItem', customer);
  });

  it('renders an async combo box control for template set uri', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form
        template-sets="https://demo.api/hapi/template_sets"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-form>
    `);

    const $ = element.renderRoot;
    const control = $.querySelector(`[infer="template-set-uri"]`) as InternalAsyncComboBoxControl;

    expect(control).to.be.instanceOf(InternalAsyncComboBoxControl);
    expect(control).to.have.attribute('item-label-path', 'description');
    expect(control).to.have.attribute('item-value-path', '_links.self.href');
    expect(control).to.have.attribute('item-id-path', '_links.self.href');
    expect(control).to.have.attribute('first', 'https://demo.api/hapi/template_sets');
    expect(control).to.have.property('selectedItem', null);

    element.edit({ template_set_uri: 'https://demo.api/hapi/template_sets/0' });
    const templateSet = await getTestData('https://demo.api/hapi/template_sets/0', router);
    await waitUntil(() => !!control.selectedItem, '', { timeout: 5000 });
    expect(control).to.have.deep.property('selectedItem', templateSet);
  });

  it('renders an async list control for items', async () => {
    let isCustomerLoaded = false;

    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form
        item-categories="https://demo.api/hapi/item_categories"
        locale-codes="https://demo.api/hapi/property_helpers/7"
        coupons="https://demo.api/hapi/coupons"
        href="https://demo.api/hapi/carts/0"
        @fetch=${(evt: FetchEvent) => {
          router.handleEvent(evt)?.handlerPromise.then(() => {
            if (evt.request.url === 'https://demo.api/hapi/customers/0') {
              setTimeout(() => (isCustomerLoaded = true));
            }
          });
        }}
      >
      </foxy-cart-form>
    `);

    await waitUntil(() => !!element.data && isCustomerLoaded, '', { timeout: 5000 });

    const $ = element.renderRoot;
    const control = $.querySelector(`[infer="items"]`) as InternalAsyncListControl;

    expect(control).to.be.instanceOf(InternalAsyncListControl);
    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/items?cart_id=0&zoom=item_options'
    );

    const card = await fixture<ItemCard>(
      (control.item as ItemRenderer)({
        simplifyNsLoading: false,
        readonlyControls: BooleanSelector.False,
        disabledControls: BooleanSelector.False,
        hiddenControls: BooleanSelector.False,
        templates: {},
        readonly: false,
        disabled: false,
        previous: null,
        related: ['https://demo.api/hapi/carts/0'],
        hidden: false,
        parent: 'https://demo.api/hapi/items',
        spread,
        props: {},
        group: '',
        html,
        lang: 'en',
        href: 'https://demo.api/hapi/items/0',
        data: null,
        next: null,
        ns: 'item-card',
      })
    );

    expect(card).to.have.attribute('locale-codes', 'https://demo.api/hapi/property_helpers/7');
    expect(card).to.have.attribute('parent', 'https://demo.api/hapi/items');
    expect(card).to.have.attribute('href', 'https://demo.api/hapi/items/0');
    expect(card).to.have.deep.property('related', ['https://demo.api/hapi/carts/0']);

    const formHandleUpdate = fake();
    const formHandleFetch = fake();
    const formDialog = await fixture<FormDialog>(html`
      <foxy-form-dialog
        parent="https://demo.api/hapi/items"
        href="https://demo.api/hapi/items/0"
        .related=${['https://demo.api/hapi/carts/0']}
      >
      </foxy-form-dialog>
    `);

    const form = await fixture(
      (control.form as FormRenderer)({
        handleUpdate: formHandleUpdate,
        handleFetch: formHandleFetch,
        dialog: formDialog,
        spread,
        html,
      })
    );

    expect(form).to.have.attribute(
      'customer-addresses',
      'https://demo.api/hapi/customer_addresses?customer_id=0'
    );

    expect(form).to.have.attribute('item-categories', 'https://demo.api/hapi/item_categories');
    expect(form).to.have.attribute('locale-codes', 'https://demo.api/hapi/property_helpers/7');
    expect(form).to.have.attribute('coupons', 'https://demo.api/hapi/coupons');
    expect(form).to.have.attribute('parent', 'https://demo.api/hapi/items');
    expect(form).to.have.attribute('href', 'https://demo.api/hapi/items/0');
    expect(form).to.have.attribute('infer', '');
    expect(form).to.have.attribute('id', 'form');
    expect(form).to.have.deep.property('related', ['https://demo.api/hapi/carts/0']);

    formHandleUpdate.resetHistory();
    form.dispatchEvent(new CustomEvent('update'));
    expect(formHandleUpdate).to.have.been.called;

    formHandleFetch.resetHistory();
    form.dispatchEvent(new CustomEvent('fetch'));
    expect(formHandleFetch).to.have.been.called;
  });

  it('renders an async list control for applied coupon codes', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form
        href="https://demo.api/hapi/carts/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const $ = element.renderRoot;
    const control = $.querySelector(`[infer="applied-coupon-codes"]`) as InternalAsyncListControl;

    expect(control).to.be.instanceOf(InternalAsyncListControl);
    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('alert');
    expect(control).to.have.attribute('item', 'foxy-applied-coupon-code-card');
    expect(control).to.have.attribute('form', 'foxy-applied-coupon-code-form');
    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/applied_coupon_codes?cart_id=0'
    );
  });

  it('renders an async list control for custom fields', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form
        href="https://demo.api/hapi/carts/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const $ = element.renderRoot;
    const control = $.querySelector(`[infer="custom-fields"]`) as InternalAsyncListControl;

    expect(control).to.be.instanceOf(InternalAsyncListControl);
    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('alert');
    expect(control).to.have.attribute('item', 'foxy-custom-field-card');
    expect(control).to.have.attribute('form', 'foxy-custom-field-form');
    expect(control).to.have.attribute('first', 'https://demo.api/hapi/custom_fields?cart_id=0');
  });

  it('renders an async list control for attributes', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form
        href="https://demo.api/hapi/carts/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const $ = element.renderRoot;
    const control = $.querySelector(`[infer="attributes"]`) as InternalAsyncListControl;

    expect(control).to.be.instanceOf(InternalAsyncListControl);
    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('alert');
    expect(control).to.have.attribute('item', 'foxy-attribute-card');
    expect(control).to.have.attribute('form', 'foxy-attribute-form');
    expect(control).to.have.attribute('first', 'https://demo.api/hapi/cart_attributes?cart_id=0');
  });

  it('renders billing section title and description', async () => {
    const element = await fixture<Form>(html`<foxy-cart-form></foxy-cart-form>`);
    const title = await getByKey(element, 'billing_section_title');
    const description = await getByKey(element, 'billing_section_description');

    expect(title).to.exist;
    expect(title).to.have.property('infer', '');

    expect(description).to.exist;
    expect(description).to.have.property('infer', '');
  });

  it('renders a text control for billing first name', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="billing-first-name"]`);
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text control for billing last name', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="billing-last-name"]`);
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text control for billing company', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="billing-company"]`);
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text control for billing phone', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="billing-phone"]`);
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text control for billing address line 1', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="billing-address-one"]`);

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('property', 'billing_address1');
  });

  it('renders a text control for billing address line 2', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="billing-address-two"]`);

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('property', 'billing_address2');
  });

  it('renders a select control for billing country', async () => {
    let isHelperLoaded = false;
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/property_helpers/3', {
        method: 'PATCH',
        body: JSON.stringify({
          values: {
            GB: {
              default: 'United Kingdom',
              cc2: 'GB',
              cc3: 'GBR',
              alternate_values: ['Great Britain', 'England', 'Northern Ireland', 'Britain', 'UK'],
              boost: 4,
              has_regions: false,
              regions_required: false,
              regions_type: 'county',
              active: true,
            },
            US: {
              default: 'United States',
              cc2: 'US',
              cc3: 'USA',
              alternate_values: ['USA', 'United States of America', 'America'],
              boost: 4.5,
              has_regions: true,
              regions_required: true,
              regions_type: 'state',
              active: true,
            },
          },
        }),
      })
    )?.handlerPromise;

    const element = await fixture<Form>(html`
      <foxy-cart-form
        countries="https://demo.api/hapi/property_helpers/3"
        @fetch=${(evt: FetchEvent) => {
          router.handleEvent(evt)?.handlerPromise.then(() => {
            if (evt.request.url === 'https://demo.api/hapi/property_helpers/3') {
              setTimeout(() => (isHelperLoaded = true));
            }
          });
        }}
      >
      </foxy-cart-form>
    `);

    await waitUntil(() => isHelperLoaded, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(`[infer="billing-country"]`);

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', [
      { label: 'United Kingdom', value: 'GB' },
      { label: 'United States', value: 'US' },
    ]);
  });

  it('renders a select control for billing region', async () => {
    let isHelperLoaded = false;
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/property_helpers/4', {
        method: 'PATCH',
        body: JSON.stringify({
          values: {
            SD: {
              default: 'South Dakota',
              code: 'SD',
              alternate_values: [],
              boost: 1,
              active: true,
            },
            TN: {
              default: 'Tennessee',
              code: 'TN',
              alternate_values: [],
              boost: 1,
              active: true,
            },
          },
        }),
      })
    )?.handlerPromise;

    const element = await fixture<Form>(html`
      <foxy-cart-form
        regions="https://demo.api/hapi/property_helpers/4"
        @fetch=${(evt: FetchEvent) => {
          router.handleEvent(evt)?.handlerPromise.then(() => {
            if (evt.request.url === 'https://demo.api/hapi/property_helpers/4?country_code=US') {
              setTimeout(() => (isHelperLoaded = true));
            }
          });
        }}
      >
      </foxy-cart-form>
    `);

    element.edit({ billing_country: 'US' });
    await waitUntil(() => isHelperLoaded, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(`[infer="billing-region"]`);

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', [
      { label: 'South Dakota', value: 'SD' },
      { label: 'Tennessee', value: 'TN' },
    ]);
  });

  it('renders a text control for billing city', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="billing-city"]`);
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text control for billing postal code', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="billing-postal-code"]`);
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders shipping section title and description', async () => {
    const element = await fixture<Form>(html`<foxy-cart-form></foxy-cart-form>`);
    const title = await getByKey(element, 'shipping_section_title');
    const description = await getByKey(element, 'shipping_section_description');

    expect(title).to.exist;
    expect(title).to.have.property('infer', '');

    expect(description).to.exist;
    expect(description).to.have.property('infer', '');
  });

  it('renders a text control for shipping first name', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="shipping-first-name"]`);
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text control for shipping last name', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="shipping-last-name"]`);
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text control for shipping company', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="shipping-company"]`);
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text control for shipping phone', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="shipping-phone"]`);
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text control for shipping address line 1', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="shipping-address-one"]`);

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('property', 'shipping_address1');
  });

  it('renders a text control for shipping address line 2', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="shipping-address-two"]`);

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('property', 'shipping_address2');
  });

  it('renders a select control for shipping country', async () => {
    let isHelperLoaded = false;
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/property_helpers/3', {
        method: 'PATCH',
        body: JSON.stringify({
          values: {
            GB: {
              default: 'United Kingdom',
              cc2: 'GB',
              cc3: 'GBR',
              alternate_values: ['Great Britain', 'England', 'Northern Ireland', 'Britain', 'UK'],
              boost: 4,
              has_regions: false,
              regions_required: false,
              regions_type: 'county',
              active: true,
            },
            US: {
              default: 'United States',
              cc2: 'US',
              cc3: 'USA',
              alternate_values: ['USA', 'United States of America', 'America'],
              boost: 4.5,
              has_regions: true,
              regions_required: true,
              regions_type: 'state',
              active: true,
            },
          },
        }),
      })
    )?.handlerPromise;

    const element = await fixture<Form>(html`
      <foxy-cart-form
        countries="https://demo.api/hapi/property_helpers/3"
        @fetch=${(evt: FetchEvent) => {
          router.handleEvent(evt)?.handlerPromise.then(() => {
            if (evt.request.url === 'https://demo.api/hapi/property_helpers/3') {
              setTimeout(() => (isHelperLoaded = true));
            }
          });
        }}
      >
      </foxy-cart-form>
    `);

    await waitUntil(() => isHelperLoaded, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(`[infer="shipping-country"]`);

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', [
      { label: 'United Kingdom', value: 'GB' },
      { label: 'United States', value: 'US' },
    ]);
  });

  it('renders a select control for shipping region', async () => {
    let isHelperLoaded = false;
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/property_helpers/4', {
        method: 'PATCH',
        body: JSON.stringify({
          values: {
            SD: {
              default: 'South Dakota',
              code: 'SD',
              alternate_values: [],
              boost: 1,
              active: true,
            },
            TN: {
              default: 'Tennessee',
              code: 'TN',
              alternate_values: [],
              boost: 1,
              active: true,
            },
          },
        }),
      })
    )?.handlerPromise;

    const element = await fixture<Form>(html`
      <foxy-cart-form
        regions="https://demo.api/hapi/property_helpers/4"
        @fetch=${(evt: FetchEvent) => {
          router.handleEvent(evt)?.handlerPromise.then(() => {
            if (evt.request.url === 'https://demo.api/hapi/property_helpers/4?country_code=US') {
              setTimeout(() => (isHelperLoaded = true));
            }
          });
        }}
      >
      </foxy-cart-form>
    `);

    element.edit({ shipping_country: 'US' });
    await waitUntil(() => isHelperLoaded, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(`[infer="shipping-region"]`);

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', [
      { label: 'South Dakota', value: 'SD' },
      { label: 'Tennessee', value: 'TN' },
    ]);
  });

  it('renders a text control for shipping city', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="shipping-city"]`);
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text control for shipping postal code', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="shipping-postal-code"]`);
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders total order when currency comes from the cart resource', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/carts/0', {
        method: 'PATCH',
        body: JSON.stringify({ currency_code: 'MXN', total_order: 123 }),
      })
    )?.handlerPromise;

    const element = await fixture<Form>(html`
      <foxy-cart-form
        href="https://demo.api/hapi/carts/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-form>
    `);

    const $ = element.renderRoot;
    await waitUntil(() => !!$.querySelector('[key="total_order"]'), '', { timeout: 5000 });
    const total = await getByKey(element, 'total_order');

    expect(total).to.exist;
    expect(total).to.have.attribute('infer', 'totals');
    expect(total).to.have.nested.property('options.amount', '123 MXN');
  });

  it("renders total order when currency comes from the custom template set's locale", async () => {
    const router = createRouter();

    const newTemplateSetResponse = await router.handleRequest(
      new Request('https://demo.api/hapi/template_sets', {
        method: 'POST',
        body: JSON.stringify({ code: 'TEST', locale_code: 'en_AU' }),
      })
    )!.handlerPromise;

    const newTemplateSet = await newTemplateSetResponse.json();

    const newCartResponse = await router.handleRequest(
      new Request('https://demo.api/hapi/carts', {
        method: 'POST',
        body: JSON.stringify({
          template_set_uri: newTemplateSet._links.self.href,
          total_order: 456,
        }),
      })
    )!.handlerPromise;

    const newCart = await newCartResponse.json();

    const element = await fixture<Form>(html`
      <foxy-cart-form
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href=${newCart._links.self.href}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-form>
    `);

    const $ = element.renderRoot;
    await waitUntil(() => !!$.querySelector('[key="total_order"]'), '', { timeout: 5000 });
    const total = await getByKey(element, 'total_order');

    expect(total).to.exist;
    expect(total).to.have.attribute('infer', 'totals');
    expect(total).to.have.nested.property('options.amount', '456 AUD');
  });

  it("renders total order when currency comes from the default template set's locale", async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/template_sets/0', {
        method: 'PATCH',
        body: JSON.stringify({ code: 'DEFAULT', locale_code: 'en_PH' }),
      })
    )!.handlerPromise;

    const newCartResponse = await router.handleRequest(
      new Request('https://demo.api/hapi/carts', {
        method: 'POST',
        body: JSON.stringify({ total_order: 892 }),
      })
    )!.handlerPromise;

    const newCart = await newCartResponse.json();

    const element = await fixture<Form>(html`
      <foxy-cart-form
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href=${newCart._links.self.href}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-form>
    `);

    const $ = element.renderRoot;
    await waitUntil(() => !!$.querySelector('[key="total_order"]'), '', { timeout: 5000 });
    const total = await getByKey(element, 'total_order');

    expect(total).to.exist;
    expect(total).to.have.attribute('infer', 'totals');
    expect(total).to.have.nested.property('options.amount', '892 PHP');
  });

  it('respects store-wide currency code display setting in total order (international: yes)', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_international_currency_symbol: true }),
      })
    )!.handlerPromise;

    const element = await fixture<Form>(html`
      <foxy-cart-form
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href="https://demo.api/hapi/carts/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-form>
    `);

    const $ = element.renderRoot;
    await waitUntil(() => !!$.querySelector('[key="total_order"]'), '', { timeout: 5000 });
    const total = await getByKey(element, 'total_order');

    expect(total).to.have.nested.property('options.currencyDisplay', 'code');
  });

  it('respects store-wide currency code display setting in total order (international: no)', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_international_currency_symbol: false }),
      })
    )!.handlerPromise;

    const element = await fixture<Form>(html`
      <foxy-cart-form
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href="https://demo.api/hapi/carts/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-form>
    `);

    const $ = element.renderRoot;
    await waitUntil(() => !!$.querySelector('[key="total_order"]'), '', { timeout: 5000 });
    const total = await getByKey(element, 'total_order');

    expect(total).to.have.nested.property('options.currencyDisplay', 'symbol');
  });

  for (const prop of ['total_item_price', 'total_shipping', 'total_tax'] as const) {
    const propDescription = prop.replace(/_/g, ' ');

    it(`renders ${propDescription} when currency comes from the cart resource`, async () => {
      const router = createRouter();

      await router.handleRequest(
        new Request('https://demo.api/hapi/carts/0', {
          method: 'PATCH',
          body: JSON.stringify({ currency_code: 'MXN', [prop]: 123 }),
        })
      )?.handlerPromise;

      const element = await fixture<Form>(html`
        <foxy-cart-form
          href="https://demo.api/hapi/carts/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-cart-form>
      `);

      await waitUntil(() => !!element.data, '', { timeout: 5000 });
      const wrapper = (await getByTestId(element, prop)) as HTMLElement;
      await waitUntil(() => !!wrapper.querySelector('[key="price"]'), '', { timeout: 5000 });

      const label = wrapper.querySelector(`[key="${prop}"]`) as HTMLElement;
      const price = wrapper.querySelector('[key="price"]') as HTMLElement;

      expect(label).to.exist;
      expect(label).to.have.attribute('infer', 'totals');

      expect(price).to.exist;
      expect(price).to.have.attribute('infer', 'totals');
      expect(price).to.have.nested.property('options.amount', '123 MXN');
    });

    it(`renders ${propDescription} when currency comes from the custom template set's locale`, async () => {
      const router = createRouter();

      const newTemplateSetResponse = await router.handleRequest(
        new Request('https://demo.api/hapi/template_sets', {
          method: 'POST',
          body: JSON.stringify({ code: 'TEST', locale_code: 'en_AU' }),
        })
      )!.handlerPromise;

      const newTemplateSet = await newTemplateSetResponse.json();

      const newCartResponse = await router.handleRequest(
        new Request('https://demo.api/hapi/carts', {
          method: 'POST',
          body: JSON.stringify({
            template_set_uri: newTemplateSet._links.self.href,
            [prop]: 456,
          }),
        })
      )!.handlerPromise;

      const newCart = await newCartResponse.json();

      const element = await fixture<Form>(html`
        <foxy-cart-form
          locale-codes="https://demo.api/hapi/property_helpers/7"
          href=${newCart._links.self.href}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-cart-form>
      `);

      await waitUntil(() => !!element.data, '', { timeout: 5000 });
      const wrapper = (await getByTestId(element, prop)) as HTMLElement;
      await waitUntil(() => !!wrapper.querySelector('[key="price"]'), '', { timeout: 5000 });

      const label = wrapper.querySelector(`[key="${prop}"]`) as HTMLElement;
      const price = wrapper.querySelector('[key="price"]') as HTMLElement;

      expect(label).to.exist;
      expect(label).to.have.attribute('infer', 'totals');

      expect(price).to.exist;
      expect(price).to.have.attribute('infer', 'totals');
      expect(price).to.have.nested.property('options.amount', '456 AUD');
    });

    it(`renders ${propDescription} when currency comes from the default template set's locale`, async () => {
      const router = createRouter();

      await router.handleRequest(
        new Request('https://demo.api/hapi/template_sets/0', {
          method: 'PATCH',
          body: JSON.stringify({ code: 'DEFAULT', locale_code: 'en_PH' }),
        })
      )!.handlerPromise;

      const newCartResponse = await router.handleRequest(
        new Request('https://demo.api/hapi/carts', {
          method: 'POST',
          body: JSON.stringify({ [prop]: 892 }),
        })
      )!.handlerPromise;

      const newCart = await newCartResponse.json();

      const element = await fixture<Form>(html`
        <foxy-cart-form
          locale-codes="https://demo.api/hapi/property_helpers/7"
          href=${newCart._links.self.href}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-cart-form>
      `);

      await waitUntil(() => !!element.data, '', { timeout: 5000 });
      const wrapper = (await getByTestId(element, prop)) as HTMLElement;
      await waitUntil(() => !!wrapper.querySelector('[key="price"]'), '', { timeout: 5000 });

      const label = wrapper.querySelector(`[key="${prop}"]`) as HTMLElement;
      const price = wrapper.querySelector('[key="price"]') as HTMLElement;

      expect(label).to.exist;
      expect(label).to.have.attribute('infer', 'totals');

      expect(price).to.exist;
      expect(price).to.have.attribute('infer', 'totals');
      expect(price).to.have.nested.property('options.amount', '892 PHP');
    });

    it(`respects store-wide currency code display setting in ${propDescription} (international: yes)`, async () => {
      const router = createRouter();

      await router.handleRequest(
        new Request('https://demo.api/hapi/stores/0', {
          method: 'PATCH',
          body: JSON.stringify({ use_international_currency_symbol: true }),
        })
      )!.handlerPromise;

      const element = await fixture<Form>(html`
        <foxy-cart-form
          locale-codes="https://demo.api/hapi/property_helpers/7"
          href="https://demo.api/hapi/carts/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-cart-form>
      `);

      await waitUntil(() => !!element.data, '', { timeout: 5000 });
      const wrapper = (await getByTestId(element, prop)) as HTMLElement;
      await waitUntil(() => !!wrapper.querySelector('[key="price"]'), '', { timeout: 5000 });

      const price = wrapper.querySelector('[key="price"]') as HTMLElement;
      expect(price).to.have.nested.property('options.currencyDisplay', 'code');
    });

    it(`respects store-wide currency code display setting in ${propDescription} (international: no)`, async () => {
      const router = createRouter();

      await router.handleRequest(
        new Request('https://demo.api/hapi/stores/0', {
          method: 'PATCH',
          body: JSON.stringify({ use_international_currency_symbol: false }),
        })
      )!.handlerPromise;

      const element = await fixture<Form>(html`
        <foxy-cart-form
          locale-codes="https://demo.api/hapi/property_helpers/7"
          href="https://demo.api/hapi/carts/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-cart-form>
      `);

      await waitUntil(() => !!element.data, '', { timeout: 5000 });
      const wrapper = (await getByTestId(element, prop)) as HTMLElement;
      await waitUntil(() => !!wrapper.querySelector('[key="price"]'), '', { timeout: 5000 });

      const price = wrapper.querySelector('[key="price"]') as HTMLElement;
      expect(price).to.have.nested.property('options.currencyDisplay', 'symbol');
    });
  }

  const discounts = {
    _embedded: {
      'fx:discounts': [
        {
          code: '1WLCM',
          amount: -1,
          name: 'Welcome Bonus',
          display: '-1.00',
          is_taxable: false,
          is_future_discount: false,
          date_created: '2021-03-29T13:57:40-0700',
          date_modified: '2021-03-29T13:57:40-0700',
        },
        {
          code: 'FEE01',
          amount: 5,
          name: 'Test Surcharge',
          display: '+5.00',
          is_taxable: false,
          is_future_discount: false,
          date_created: '2021-03-29T13:57:40-0700',
          date_modified: '2021-03-29T13:57:40-0700',
        },
      ],
    },
  };

  it('renders discounts when currency comes from the cart resource', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/carts/0', {
        method: 'PATCH',
        body: JSON.stringify({ currency_code: 'MXN' }),
      })
    )?.handlerPromise;

    const element = await fixture<Form>(html`
      <foxy-cart-form
        href="https://demo.api/hapi/carts/0"
        @fetch=${(evt: FetchEvent) => {
          if (evt.request.url === 'https://demo.api/hapi/discounts?cart_id=0&limit=300') {
            evt.respondWith(Promise.resolve(new Response(JSON.stringify(discounts))));
          } else {
            router.handleEvent(evt);
          }
        }}
      >
      </foxy-cart-form>
    `);

    const $ = element.renderRoot;
    await waitUntil(() => !!$.querySelector('[data-testclass="discount"] [key="price"]'), '', {
      timeout: 5000,
    });

    const wrappers = await getByTestClass(element, 'discount');
    const wrapper0Price = await getByKey(wrappers[0], 'price');
    const wrapper1Price = await getByKey(wrappers[1], 'price');

    expect(wrappers).to.have.length(2);

    expect(wrappers[0]).to.include.text('Welcome Bonus');
    expect(wrappers[0]).to.include.text('1WLCM');
    expect(wrapper0Price).to.have.attribute('infer', 'totals');
    expect(wrapper0Price).to.have.nested.property('options.amount', '-1 MXN');

    expect(wrappers[1]).to.include.text('Test Surcharge');
    expect(wrappers[1]).to.include.text('FEE01');
    expect(wrapper1Price).to.have.attribute('infer', 'totals');
    expect(wrapper1Price).to.have.nested.property('options.amount', '5 MXN');
  });

  it("renders discounts when currency comes from the custom template set's locale", async () => {
    const router = createRouter();

    const newTemplateSetResponse = await router.handleRequest(
      new Request('https://demo.api/hapi/template_sets', {
        method: 'POST',
        body: JSON.stringify({ code: 'TEST', locale_code: 'en_AU' }),
      })
    )!.handlerPromise;

    const newTemplateSet = await newTemplateSetResponse.json();

    const newCartResponse = await router.handleRequest(
      new Request('https://demo.api/hapi/carts', {
        method: 'POST',
        body: JSON.stringify({ template_set_uri: newTemplateSet._links.self.href }),
      })
    )!.handlerPromise;

    const newCart = await newCartResponse.json();

    const element = await fixture<Form>(html`
      <foxy-cart-form
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href=${newCart._links.self.href}
        @fetch=${(evt: FetchEvent) => {
          if (evt.request.url.startsWith('https://demo.api/hapi/discounts?cart_id=')) {
            evt.respondWith(Promise.resolve(new Response(JSON.stringify(discounts))));
          } else {
            router.handleEvent(evt);
          }
        }}
      >
      </foxy-cart-form>
    `);

    const $ = element.renderRoot;
    await waitUntil(() => !!$.querySelector('[data-testclass="discount"] [key="price"]'), '', {
      timeout: 5000,
    });

    const wrappers = await getByTestClass(element, 'discount');
    const wrapper0Price = await getByKey(wrappers[0], 'price');
    const wrapper1Price = await getByKey(wrappers[1], 'price');

    expect(wrappers).to.have.length(2);

    expect(wrappers[0]).to.include.text('Welcome Bonus');
    expect(wrappers[0]).to.include.text('1WLCM');
    expect(wrapper0Price).to.have.attribute('infer', 'totals');
    expect(wrapper0Price).to.have.nested.property('options.amount', '-1 AUD');

    expect(wrappers[1]).to.include.text('Test Surcharge');
    expect(wrappers[1]).to.include.text('FEE01');
    expect(wrapper1Price).to.have.attribute('infer', 'totals');
    expect(wrapper1Price).to.have.nested.property('options.amount', '5 AUD');
  });

  it("renders discounts when currency comes from the default template set's locale", async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/template_sets/0', {
        method: 'PATCH',
        body: JSON.stringify({ code: 'DEFAULT', locale_code: 'en_PH' }),
      })
    )!.handlerPromise;

    const newCartResponse = await router.handleRequest(
      new Request('https://demo.api/hapi/carts', {
        method: 'POST',
        body: JSON.stringify({}),
      })
    )!.handlerPromise;

    const newCart = await newCartResponse.json();

    const element = await fixture<Form>(html`
      <foxy-cart-form
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href=${newCart._links.self.href}
        @fetch=${(evt: FetchEvent) => {
          if (evt.request.url.startsWith('https://demo.api/hapi/discounts?cart_id=')) {
            evt.respondWith(Promise.resolve(new Response(JSON.stringify(discounts))));
          } else {
            router.handleEvent(evt);
          }
        }}
      >
      </foxy-cart-form>
    `);

    const $ = element.renderRoot;
    await waitUntil(() => !!$.querySelector('[data-testclass="discount"] [key="price"]'), '', {
      timeout: 5000,
    });

    const wrappers = await getByTestClass(element, 'discount');
    const wrapper0Price = await getByKey(wrappers[0], 'price');
    const wrapper1Price = await getByKey(wrappers[1], 'price');

    expect(wrappers).to.have.length(2);

    expect(wrappers[0]).to.include.text('Welcome Bonus');
    expect(wrappers[0]).to.include.text('1WLCM');
    expect(wrapper0Price).to.have.attribute('infer', 'totals');
    expect(wrapper0Price).to.have.nested.property('options.amount', '-1 PHP');

    expect(wrappers[1]).to.include.text('Test Surcharge');
    expect(wrappers[1]).to.include.text('FEE01');
    expect(wrapper1Price).to.have.attribute('infer', 'totals');
    expect(wrapper1Price).to.have.nested.property('options.amount', '5 PHP');
  });

  it('respects store-wide currency code display setting in discounts (international: yes)', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_international_currency_symbol: true }),
      })
    )!.handlerPromise;

    const element = await fixture<Form>(html`
      <foxy-cart-form
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href="https://demo.api/hapi/carts/0"
        @fetch=${(evt: FetchEvent) => {
          if (evt.request.url.startsWith('https://demo.api/hapi/discounts?cart_id=')) {
            evt.respondWith(Promise.resolve(new Response(JSON.stringify(discounts))));
          } else {
            router.handleEvent(evt);
          }
        }}
      >
      </foxy-cart-form>
    `);

    const $ = element.renderRoot;
    await waitUntil(() => !!$.querySelector('[data-testclass="discount"] [key="price"]'), '', {
      timeout: 5000,
    });

    const wrappers = await getByTestClass(element, 'discount');
    const wrapper0Price = await getByKey(wrappers[0], 'price');
    const wrapper1Price = await getByKey(wrappers[1], 'price');

    expect(wrapper0Price).to.have.nested.property('options.currencyDisplay', 'code');
    expect(wrapper1Price).to.have.nested.property('options.currencyDisplay', 'code');
  });

  it('respects store-wide currency code display setting in discounts (international: no)', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ use_international_currency_symbol: false }),
      })
    )!.handlerPromise;

    const element = await fixture<Form>(html`
      <foxy-cart-form
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href="https://demo.api/hapi/carts/0"
        @fetch=${(evt: FetchEvent) => {
          if (evt.request.url.startsWith('https://demo.api/hapi/discounts?cart_id=')) {
            evt.respondWith(Promise.resolve(new Response(JSON.stringify(discounts))));
          } else {
            router.handleEvent(evt);
          }
        }}
      >
      </foxy-cart-form>
    `);

    const $ = element.renderRoot;
    await waitUntil(() => !!$.querySelector('[data-testclass="discount"] [key="price"]'), '', {
      timeout: 5000,
    });

    const wrappers = await getByTestClass(element, 'discount');
    const wrapper0Price = await getByKey(wrappers[0], 'price');
    const wrapper1Price = await getByKey(wrappers[1], 'price');

    expect(wrapper0Price).to.have.nested.property('options.currencyDisplay', 'symbol');
    expect(wrapper1Price).to.have.nested.property('options.currencyDisplay', 'symbol');
  });

  it('renders "View as customer" button for existing carts', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form
        href="https://demo.api/hapi/carts/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(`[infer="view-as-customer"]`);

    expect(control).to.be.instanceOf(InternalCartFormViewAsCustomerControl);
  });

  it('renders "Delete" button for existing carts', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form
        href="https://demo.api/hapi/carts/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(`[infer="delete"]`);

    expect(control).to.be.instanceOf(InternalDeleteControl);
  });

  it('renders "Create" button for new carts', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-cart-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-cart-form>
    `);

    const control = element.renderRoot.querySelector(`[infer="create"]`);
    expect(control).to.be.instanceOf(InternalCreateControl);
  });
});
