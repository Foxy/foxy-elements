import type { InternalQueryBuilderControl } from '../../internal/InternalQueryBuilderControl/InternalQueryBuilderControl';
import type { InternalEditableListControl } from '../../internal/InternalEditableListControl/InternalEditableListControl';
import type { InternalAsyncListControl } from '../../internal/InternalAsyncListControl/InternalAsyncListControl';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { CouponForm } from './CouponForm';
import { Type } from '../QueryBuilder/types';
import { stub } from 'sinon';

describe('CouponForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-async-resource-link-list-control', () => {
    expect(customElements.get('foxy-internal-async-resource-link-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-switch-control', () => {
    expect(customElements.get('foxy-internal-switch-control')).to.exist;
  });

  it('imports and defines foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-editable-list-control', () => {
    expect(customElements.get('foxy-internal-editable-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-query-builder-control', () => {
    expect(customElements.get('foxy-internal-query-builder-control')).to.exist;
  });

  it('imports and defines foxy-internal-array-map-control', () => {
    expect(customElements.get('foxy-internal-array-map-control')).to.exist;
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

  it('imports and defines foxy-generate-codes-form', () => {
    expect(customElements.get('foxy-generate-codes-form')).to.exist;
  });

  it('imports and defines foxy-item-category-card', () => {
    expect(customElements.get('foxy-item-category-card')).to.exist;
  });

  it('imports and defines foxy-coupon-codes-form', () => {
    expect(customElements.get('foxy-coupon-codes-form')).to.exist;
  });

  it('imports and defines foxy-coupon-code-card', () => {
    expect(customElements.get('foxy-coupon-code-card')).to.exist;
  });

  it('imports and defines foxy-coupon-code-form', () => {
    expect(customElements.get('foxy-coupon-code-form')).to.exist;
  });

  it('imports and defines foxy-nucleon', () => {
    expect(customElements.get('foxy-nucleon')).to.exist;
  });

  it('imports and defines foxy-attribute-form', () => {
    expect(customElements.get('foxy-attribute-form')).to.exist;
  });

  it('imports and defines foxy-attribute-card', () => {
    expect(customElements.get('foxy-attribute-card')).to.exist;
  });

  it('imports and defines foxy-internal-bulk-add-action-control', () => {
    expect(customElements.get('foxy-internal-bulk-add-action-control')).to.exist;
  });

  it('imports and defines foxy-internal-coupon-form-rules-control', () => {
    expect(customElements.get('foxy-internal-coupon-form-rules-control')).to.exist;
  });

  it('defines itself as foxy-coupon-form', () => {
    expect(customElements.get('foxy-coupon-form')).to.equal(CouponForm);
  });

  it('has a default i18n namespace of "coupon-form"', () => {
    expect(CouponForm).to.have.property('defaultNS', 'coupon-form');
    expect(new CouponForm()).to.have.property('ns', 'coupon-form');
  });

  it('extends foxy-internal-form', () => {
    expect(new CouponForm()).to.be.instanceOf(customElements.get('foxy-internal-form'));
  });

  it('has a reactive property "getTransactionPageHref', () => {
    expect(new CouponForm()).to.haveOwnProperty('getTransactionPageHref', null);
    expect(CouponForm).to.have.deep.nested.property('properties.getTransactionPageHref', {
      attribute: false,
    });
  });

  it('produces a v8n error "name:v8n_required" when name is empty', () => {
    const element = new CouponForm();
    expect(element.errors).to.include('name:v8n_required');
    element.edit({ name: 'foo' });
    expect(element.errors).not.to.include('name:v8n_required');
  });

  it('produces a v8n error "name:v8n_too_long" when name is too long', () => {
    const element = new CouponForm();
    expect(element.errors).to.not.include('name:v8n_too_long');

    element.edit({ name: 'a'.repeat(50) });
    expect(element.errors).to.not.include('name:v8n_too_long');

    element.edit({ name: 'a'.repeat(51) });
    expect(element.errors).to.include('name:v8n_too_long');
  });

  it('produces a v8n error "inclusive-tax-rate:v8n_too_small" when inclusive tax rate is less than 0', () => {
    const element = new CouponForm();
    expect(element.errors).to.not.include('inclusive-tax-rate:v8n_too_small');

    element.edit({ inclusive_tax_rate: 0 });
    expect(element.errors).to.not.include('inclusive-tax-rate:v8n_too_small');

    element.edit({ inclusive_tax_rate: -1 });
    expect(element.errors).to.include('inclusive-tax-rate:v8n_too_small');
  });

  it('produces a v8n error "inclusive-tax-rate:v8n_too_big" when inclusive tax rate is greater than 1', () => {
    const element = new CouponForm();
    expect(element.errors).to.not.include('inclusive-tax-rate:v8n_too_big');

    element.edit({ inclusive_tax_rate: 1 });
    expect(element.errors).to.not.include('inclusive-tax-rate:v8n_too_big');

    element.edit({ inclusive_tax_rate: 1.1 });
    expect(element.errors).to.include('inclusive-tax-rate:v8n_too_big');
  });

  it('produces a v8n error "number-of-uses-allowed:v8n_too_small" when number of uses allowed is less than 0', () => {
    const element = new CouponForm();
    expect(element.errors).to.not.include('number-of-uses-allowed:v8n_too_small');

    element.edit({ number_of_uses_allowed: 0 });
    expect(element.errors).to.not.include('number-of-uses-allowed:v8n_too_small');

    element.edit({ number_of_uses_allowed: -1 });
    expect(element.errors).to.include('number-of-uses-allowed:v8n_too_small');
  });

  it('produces a v8n error "rules:v8n_required" when rules are empty', () => {
    const element = new CouponForm();
    expect(element.errors).to.include('rules:v8n_required');

    element.edit({ coupon_discount_details: 'allunits|5-10|10-20' });
    expect(element.errors).not.to.include('rules:v8n_required');
  });

  it('produces a v8n error "rules:v8n_too_long" when rules are empty', () => {
    const element = new CouponForm();
    expect(element.errors).to.not.include('rules:v8n_too_long');

    element.edit({ coupon_discount_details: 'allunits|5-10|10-20' });
    expect(element.errors).to.not.include('rules:v8n_too_long');

    element.edit({ coupon_discount_details: `allunits${'|5-10'.repeat(38)}` });
    expect(element.errors).to.not.include('rules:v8n_too_long');

    element.edit({ coupon_discount_details: `allunits${'|5-10'.repeat(39)}` });
    expect(element.errors).to.include('rules:v8n_too_long');
  });

  it('produces a v8n error "item-option-restrictions:v8n_too_long" when item option restrictions are too long', () => {
    const element = new CouponForm();
    expect(element.errors).to.not.include('item-option-restrictions:v8n_too_long');

    element.edit({ item_option_restrictions: {} });
    expect(element.errors).to.not.include('item-option-restrictions:v8n_too_long');

    element.edit({ item_option_restrictions: { foo: ['a'.repeat(5988)] } });
    expect(element.errors).to.not.include('item-option-restrictions:v8n_too_long');

    element.edit({ item_option_restrictions: { foo: ['a'.repeat(5989)] } });
    expect(element.errors).to.include('item-option-restrictions:v8n_too_long');
  });

  it('produces a v8n error "product-code-restrictions:v8n_too_long" when product code restrictions are too long', () => {
    const element = new CouponForm();
    expect(element.errors).to.not.include('product-code-restrictions:v8n_too_long');

    element.edit({ product_code_restrictions: 'a'.repeat(5000) });
    expect(element.errors).to.not.include('product-code-restrictions:v8n_too_long');

    element.edit({ product_code_restrictions: 'a'.repeat(5001) });
    expect(element.errors).to.include('product-code-restrictions:v8n_too_long');
  });

  it('produces a v8n error "customer-attribute-restrictions:v8n_too_long" when customer attribute restrictions are too long', () => {
    const element = new CouponForm();
    expect(element.errors).to.not.include('customer-attribute-restrictions:v8n_too_long');

    element.edit({ customer_attribute_restrictions: 'a'.repeat(2000) });
    expect(element.errors).to.not.include('customer-attribute-restrictions:v8n_too_long');

    element.edit({ customer_attribute_restrictions: 'a'.repeat(2001) });
    expect(element.errors).to.include('customer-attribute-restrictions:v8n_too_long');
  });

  it('produces a v8n error "number-of-uses-allowed-per-code:v8n_too_small" when number of uses allowed per code is less than 0', () => {
    const element = new CouponForm();
    expect(element.errors).to.not.include('number-of-uses-allowed-per-code:v8n_too_small');

    element.edit({ number_of_uses_allowed_per_code: 0 });
    expect(element.errors).to.not.include('number-of-uses-allowed-per-code:v8n_too_small');

    element.edit({ number_of_uses_allowed_per_code: -1 });
    expect(element.errors).to.include('number-of-uses-allowed-per-code:v8n_too_small');
  });

  it('produces a v8n error "customer-subscription-restrictions:v8n_too_long" when customer subscription restrictions are too long', () => {
    const element = new CouponForm();
    expect(element.errors).to.not.include('customer-subscription-restrictions:v8n_too_long');

    element.edit({ customer_subscription_restrictions: 'a'.repeat(200) });
    expect(element.errors).to.not.include('customer-subscription-restrictions:v8n_too_long');

    element.edit({ customer_subscription_restrictions: 'a'.repeat(201) });
    expect(element.errors).to.include('customer-subscription-restrictions:v8n_too_long');
  });

  it('produces a v8n error "number-of-uses-allowed-per-customer:v8n_too_small" when number of uses allowed per customer is less than 0', () => {
    const element = new CouponForm();
    expect(element.errors).to.not.include('number-of-uses-allowed-per-customer:v8n_too_small');

    element.edit({ number_of_uses_allowed_per_customer: 0 });
    expect(element.errors).to.not.include('number-of-uses-allowed-per-customer:v8n_too_small');

    element.edit({ number_of_uses_allowed_per_customer: -1 });
    expect(element.errors).to.include('number-of-uses-allowed-per-customer:v8n_too_small');
  });

  it('hides coupon codes, category restrictions and attributes when there is no data', async () => {
    const element = new CouponForm();

    expect(element.hiddenSelector.matches('coupon-codes', true)).to.be.true;
    expect(element.hiddenSelector.matches('category-restrictions', true)).to.be.true;
    expect(element.hiddenSelector.matches('attributes', true)).to.be.true;

    element.data = await getTestData('./hapi/coupons/0');

    expect(element.hiddenSelector.matches('coupon-codes', true)).to.be.false;
    expect(element.hiddenSelector.matches('category-restrictions', true)).to.be.false;
    expect(element.hiddenSelector.matches('attributes', true)).to.be.false;
  });

  it('renders a form header', () => {
    const form = new CouponForm();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders header subtitle with custom options', async () => {
    const element = await fixture<CouponForm>(html`
      <foxy-coupon-form .data=${await getTestData('./hapi/coupons/0')}> </foxy-coupon-form>
    `);

    expect(element.headerSubtitleOptions).to.deep.equal({
      ...element.data,
      id: element.headerCopyIdValue,
    });
  });

  it('renders bulk add control for the Generate Codes header action', async () => {
    const element = await fixture<CouponForm>(html`
      <foxy-coupon-form .data=${await getTestData('./hapi/coupons/0')}></foxy-coupon-form>
    `);

    const action = element.renderRoot.querySelector('[infer=generate]');

    expect(action).to.exist;
    expect(action).to.have.attribute('parent', element.data?._links['fx:generate_codes'].href);
    expect(action).to.have.attribute('form', 'foxy-generate-codes-form');
    expect(action).to.be.instanceOf(customElements.get('foxy-internal-bulk-add-action-control'));
    expect(action).to.have.deep.property('related', [element.data?._links['fx:coupon_codes'].href]);
  });

  it('renders bulk add control for the Import Codes header action', async () => {
    const element = await fixture<CouponForm>(html`
      <foxy-coupon-form .data=${await getTestData('./hapi/coupons/0')}></foxy-coupon-form>
    `);

    const action = element.renderRoot.querySelector('[infer=import]');

    expect(action).to.exist;
    expect(action).to.have.attribute('parent', element.data?._links['fx:coupon_codes'].href);
    expect(action).to.have.attribute('form', 'foxy-coupon-codes-form');
    expect(action).to.be.instanceOf(customElements.get('foxy-internal-bulk-add-action-control'));
    expect(action).to.have.deep.property('related', [element.data?._links['fx:coupon_codes'].href]);
  });

  it('renders a General summary control', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer=general]'
    );

    expect(control).to.exist;
  });

  it('renders text control for name inside of the General summary', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      '[infer=general] foxy-internal-text-control[infer=name]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders rules control for rules', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-coupon-form-rules-control[infer=rules]'
    );

    expect(control).to.exist;
  });

  it('renders async list control for coupon codes', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').resolves();
    const getTransactionPageHref = () => '';

    const element = await fixture<CouponForm>(html`
      <foxy-coupon-form
        .getTransactionPageHref=${getTransactionPageHref}
        .data=${await getTestData('./hapi/coupons/0')}
      >
      </foxy-coupon-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-async-list-control[infer=coupon-codes]'
    ) as InternalAsyncListControl;

    expect(control).to.exist;

    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/coupon_codes?coupon_id=0&order=date_created+desc'
    );

    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('item', 'foxy-coupon-code-card');
    expect(control).to.have.attribute('form', 'foxy-coupon-code-form');
    expect(control).to.have.attribute('alert');

    expect(control).to.have.deep.property('formProps', {
      '.getTransactionPageHref': getTransactionPageHref,
    });

    expect(control.actions).to.have.length(1);
    expect(control.actions[0]).to.have.property('theme', 'contrast');
    expect(control.actions[0]).to.have.property('state', 'idle');
    expect(control.actions[0]).to.have.property('text', 'copy_button_text');

    const couponCode = await getTestData<Resource<Rels.CouponCode>>('./hapi/coupon_codes/0');
    control.actions[0].onClick(couponCode);

    await waitUntil(() => {
      try {
        expect(writeTextMethod).to.have.been.calledOnceWith(couponCode.code);
        return true;
      } catch {
        return false;
      }
    });

    expect(writeTextMethod).to.have.been.calledOnceWith(couponCode.code);
    writeTextMethod.restore();

    expect(control).to.have.deep.property('filters', [
      { label: 'code', path: 'code', type: Type.String },
      { label: 'used_codes', path: 'number_of_uses_to_date', type: Type.Number },
      { label: 'date_created', path: 'date_created', type: Type.Date },
      { label: 'date_modified', path: 'date_modified', type: Type.Date },
    ]);
  });

  it('renders array map control for item option restrictions', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-array-map-control[infer=item-option-restrictions]'
    ) as InternalQueryBuilderControl;

    expect(control).to.exist;
  });

  it('renders editable list control for product code restrictions', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-editable-list-control[infer=product-code-restrictions]'
    ) as InternalEditableListControl;

    expect(control).to.exist;
    expect(control).to.have.deep.property('units', [
      { label: 'product-code-restrictions.unit_allow', value: 'allow' },
      { label: 'product-code-restrictions.unit_block', value: 'block' },
    ]);

    expect(control.getValue()).to.equal(undefined);
    control.setValue([{ value: 'a' }, { unit: 'block', value: 'b' }]);
    expect(element).to.have.deep.nested.property('form.product_code_restrictions', 'a,-b');

    element.edit({ product_code_restrictions: '-foo,bar' });
    expect(control.getValue()).to.deep.equal([
      { label: 'product-code-restrictions.label_block', value: '-foo' },
      { label: 'product-code-restrictions.label_allow', value: 'bar' },
    ]);
  });

  it('renders async resource link list control for category restrictions', async () => {
    const router = createRouter();
    const element = await fixture<CouponForm>(
      html`
        <foxy-coupon-form
          href="https://demo.api/hapi/coupons/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-coupon-form>
      `
    );

    await waitUntil(() => element.in('idle'));
    const control = element.renderRoot.querySelector(
      'foxy-internal-async-resource-link-list-control[infer=category-restrictions]'
    );

    expect(control).to.exist;
    await waitUntil(() => !!control?.hasAttribute('options-href'));

    expect(control).to.have.attribute('foreign-key-for-uri', 'item_category_uri');
    expect(control).to.have.attribute('foreign-key-for-id', 'item_category_id');
    expect(control).to.have.attribute('own-key-for-uri', 'coupon_uri');
    expect(control).to.have.attribute('own-uri', 'https://demo.api/hapi/coupons/0');
    expect(control).to.have.attribute('embed-key', 'fx:coupon_item_categories');

    expect(control).to.have.attribute(
      'options-href',
      'https://demo.api/hapi/item_categories?store_id=0'
    );

    expect(control).to.have.attribute(
      'links-href',
      'https://demo.api/hapi/coupon_item_categories?coupon_id=0'
    );

    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('item', 'foxy-item-category-card');
  });

  it('renders a Usage summary control', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-summary-control[infer=uses]');

    expect(control).to.exist;
  });

  it('renders number control for number of uses allowed inside of the Usage summary', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      '[infer=uses] foxy-internal-number-control[infer=number-of-uses-allowed]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '0');
    expect(control).to.have.attribute('step', '1');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders number control for number of uses allowed per customer inside of the Usage summary', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      '[infer=uses] foxy-internal-number-control[infer=number-of-uses-allowed-per-customer]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '0');
    expect(control).to.have.attribute('step', '1');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders number control for number of uses allowed per code inside of the Usage summary', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      '[infer=uses] foxy-internal-number-control[infer=number-of-uses-allowed-per-code]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '0');
    expect(control).to.have.attribute('step', '1');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a Date Restrictions summary control', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer=timeframe]'
    );

    expect(control).to.exist;
  });

  it('renders date control for start date inside of the Date Restrictions summary', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      '[infer=timeframe] foxy-internal-date-control[infer=start-date]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders date control for end date inside of the Date Restrictions summary', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      '[infer=timeframe] foxy-internal-date-control[infer=end-date]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a Taxes summary control', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-summary-control[infer=taxes]');

    expect(control).to.exist;
  });

  it('renders number control for inclusive tax rate', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      '[infer=taxes] foxy-internal-number-control[infer=inclusive-tax-rate]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('min', '0');
    expect(control).to.have.attribute('max', '1');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders an Options summary control', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer=options]'
    );

    expect(control).to.exist;
  });

  const props = [
    'multiple-codes-allowed',
    'combinable',
    'exclude-category-discounts',
    'exclude-line-item-discounts',
    'is-taxable',
    'shared-codes-allowed',
  ] as const;

  for (const prop of props) {
    it(`renders switch control for ${prop} inside of the Options summary`, async () => {
      const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
      const control = element.renderRoot.querySelector(
        `[infer=options] foxy-internal-switch-control[infer="${prop}"]`
      );

      expect(control).to.exist;
    });
  }

  it('renders a Customer Restrictions summary control', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="customer-restrictions"]'
    );

    expect(control).to.exist;
  });

  it('renders editable list control for subscription restrictions inside of the Customer Restrictions summary', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      '[infer=customer-restrictions] foxy-internal-editable-list-control[infer=customer-subscription-restrictions]'
    ) as InternalEditableListControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');

    expect(control.getValue()).to.deep.equal([]);
    control.setValue([{ value: 'a' }, { value: 'b' }]);
    expect(element).to.have.deep.nested.property('form.customer_subscription_restrictions', 'a,b');

    element.edit({ customer_subscription_restrictions: 'foo,bar' });
    expect(control.getValue()).to.deep.equal([{ value: 'foo' }, { value: 'bar' }]);
  });

  it('renders query builder control for customer attribute restrictions inside of the Customer Restrictions summary', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      '[infer=customer-restrictions] foxy-internal-query-builder-control[infer=customer-attribute-restrictions]'
    ) as InternalQueryBuilderControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control.getValue()).to.equal('');

    const cases = [
      ['attributes:name[color]', 'red'],
      ['attributes:name[color]:in', 'red,blue'],
      ['attributes:name[color]:in', 'red,blue|attributes:name[color]=orange'],
    ];

    const results = [
      ['color', 'red'],
      ['color:in', 'red,blue'],
      ['color:in', 'red,blue|color=orange'],
    ];

    cases.forEach((c, i) => {
      element.edit({ customer_attribute_restrictions: new URLSearchParams([c]).toString() });
      expect(control.getValue()).to.equal(new URLSearchParams([results[i]]).toString());
    });

    results.forEach((r, i) => {
      control.setValue(new URLSearchParams([r]).toString());
      expect(element).to.have.nested.property(
        'form.customer_attribute_restrictions',
        new URLSearchParams([cases[i]]).toString()
      );
    });
  });

  it('renders switch control for auto-apply inside of the Customer Restrictions summary', async () => {
    const element = await fixture<CouponForm>(html`<foxy-coupon-form></foxy-coupon-form>`);
    const control = element.renderRoot.querySelector(
      '[infer=customer-restrictions] foxy-internal-switch-control[infer=customer-auto-apply]'
    );

    expect(control).to.exist;
  });

  it('renders async list control for attributes', async () => {
    const element = await fixture<CouponForm>(
      html`<foxy-coupon-form .data=${await getTestData('./hapi/coupons/0')}></foxy-coupon-form>`
    );

    const control = element.renderRoot.querySelector(
      'foxy-internal-async-list-control[infer=attributes]'
    ) as InternalAsyncListControl;

    expect(control).to.exist;
    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/coupon_attributes?coupon_id=0'
    );

    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('item', 'foxy-attribute-card');
    expect(control).to.have.attribute('form', 'foxy-attribute-form');
    expect(control).to.have.attribute('alert');
  });
});
