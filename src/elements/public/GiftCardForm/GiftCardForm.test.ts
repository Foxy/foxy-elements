import type { InternalEditableListControl } from '../../internal/InternalEditableListControl/InternalEditableListControl';
import type { InternalAsyncListControl } from '../../internal/InternalAsyncListControl/InternalAsyncListControl';
import type { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { GiftCardForm } from './GiftCardForm';
import { getTestData } from '../../../testgen/getTestData';
import { currencies } from './currencies';
import { Type } from '../QueryBuilder/types';
import { stub } from 'sinon';

describe('GiftCardForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-async-resource-link-list-control', () => {
    expect(customElements.get('foxy-internal-async-resource-link-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-bulk-add-action-control', () => {
    expect(customElements.get('foxy-internal-bulk-add-action-control')).to.exist;
  });

  it('imports and defines foxy-internal-editable-list-control', () => {
    expect(customElements.get('foxy-internal-editable-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-async-list-control', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-frequency-control', () => {
    expect(customElements.get('foxy-internal-frequency-control')).to.exist;
  });

  it('imports and defines foxy-internal-select-control', () => {
    expect(customElements.get('foxy-internal-select-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-generate-codes-form', () => {
    expect(customElements.get('foxy-generate-codes-form')).to.exist;
  });

  it('imports and defines foxy-gift-card-codes-form', () => {
    expect(customElements.get('foxy-gift-card-codes-form')).to.exist;
  });

  it('imports and defines foxy-item-category-card', () => {
    expect(customElements.get('foxy-item-category-card')).to.exist;
  });

  it('imports and defines foxy-gift-card-code-card', () => {
    expect(customElements.get('foxy-gift-card-code-card')).to.exist;
  });

  it('imports and defines foxy-gift-card-code-form', () => {
    expect(customElements.get('foxy-gift-card-code-form')).to.exist;
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

  it('defines itself as foxy-gift-card-form', () => {
    expect(customElements.get('foxy-gift-card-form')).to.equal(GiftCardForm);
  });

  it('has a default i18n namespace of "gift-card-form"', () => {
    expect(GiftCardForm).to.have.property('defaultNS', 'gift-card-form');
    expect(new GiftCardForm()).to.have.property('ns', 'gift-card-form');
  });

  it('has a reactive property "getCustomerHref"', () => {
    expect(GiftCardForm).to.have.deep.nested.property('properties.getCustomerHref', {
      attribute: false,
    });

    expect(new GiftCardForm()).to.have.property('getCustomerHref');
    expect(new GiftCardForm().getCustomerHref(123)).to.equal(
      'https://api.foxycart.com/customers/123'
    );
  });

  it('extends foxy-internal-form', () => {
    expect(new GiftCardForm()).to.be.instanceOf(customElements.get('foxy-internal-form'));
  });

  it('produces a v8n error "name:v8n_required" when name is empty', () => {
    const element = new GiftCardForm();
    expect(element.errors).to.include('name:v8n_required');
    element.edit({ name: 'foo' });
    expect(element.errors).not.to.include('name:v8n_required');
  });

  it('produces a v8n error "name:v8n_too_long" when name is too long', () => {
    const element = new GiftCardForm();
    expect(element.errors).to.not.include('name:v8n_too_long');

    element.edit({ name: 'a'.repeat(50) });
    expect(element.errors).to.not.include('name:v8n_too_long');

    element.edit({ name: 'a'.repeat(51) });
    expect(element.errors).to.include('name:v8n_too_long');
  });

  it('produces a v8n error "min-balance:v8n_negative" when initial balance min is negative', () => {
    const element = new GiftCardForm();

    expect(element.errors).to.not.include('min-balance:v8n_negative');

    element.edit({
      provisioning_config: {
        allow_autoprovisioning: true,
        initial_balance_min: 0,
        initial_balance_max: 1,
      },
    });

    expect(element.errors).to.not.include('min-balance:v8n_negative');

    element.edit({
      provisioning_config: {
        allow_autoprovisioning: true,
        initial_balance_min: -1,
        initial_balance_max: 1,
      },
    });

    expect(element.errors).to.include('min-balance:v8n_negative');
  });

  it('produces a v8n error "max-balance:v8n_negative" when initial balance max is negative', () => {
    const element = new GiftCardForm();

    expect(element.errors).to.not.include('max-balance:v8n_negative');

    element.edit({
      provisioning_config: {
        allow_autoprovisioning: true,
        initial_balance_min: 0,
        initial_balance_max: 1,
      },
    });

    expect(element.errors).to.not.include('max-balance:v8n_negative');

    element.edit({
      provisioning_config: {
        allow_autoprovisioning: true,
        initial_balance_min: 0,
        initial_balance_max: -1,
      },
    });

    expect(element.errors).to.include('max-balance:v8n_negative');
  });

  it('produces a v8n error "product-code-restrictions:v8n_too_long" when product code restrictions are too long', () => {
    const element = new GiftCardForm();
    expect(element.errors).to.not.include('product-code-restrictions:v8n_too_long');

    element.edit({ product_code_restrictions: 'a'.repeat(5000) });
    expect(element.errors).to.not.include('product-code-restrictions:v8n_too_long');

    element.edit({ product_code_restrictions: 'a'.repeat(5001) });
    expect(element.errors).to.include('product-code-restrictions:v8n_too_long');
  });

  it('hides codes, category restrictions and attributes when there is no data', async () => {
    const element = new GiftCardForm();

    expect(element.hiddenSelector.matches('codes', true)).to.be.true;
    expect(element.hiddenSelector.matches('category-restrictions', true)).to.be.true;
    expect(element.hiddenSelector.matches('attributes', true)).to.be.true;

    element.data = await getTestData('./hapi/gift_cards/0');

    expect(element.hiddenSelector.matches('codes', true)).to.be.false;
    expect(element.hiddenSelector.matches('category-restrictions', true)).to.be.false;
    expect(element.hiddenSelector.matches('attributes', true)).to.be.false;
  });

  it('renders a form header', () => {
    const form = new GiftCardForm();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('uses custom form header subtitle options', async () => {
    const element = await fixture<GiftCardForm>(html`
      <foxy-gift-card-form .data=${await getTestData('./hapi/gift_cards/0')}></foxy-gift-card-form>
    `);

    expect(element.headerSubtitleOptions).to.deep.equal({ id: element.headerCopyIdValue });
  });

  it('renders bulk add control for the Generate Codes header action', async () => {
    const element = await fixture<GiftCardForm>(html`
      <foxy-gift-card-form .data=${await getTestData('./hapi/gift_cards/0')}></foxy-gift-card-form>
    `);

    const action = element.renderRoot.querySelector('[infer=generate]');

    expect(action).to.exist;
    expect(action).to.have.attribute('parent', element.data?._links['fx:generate_codes'].href);
    expect(action).to.have.attribute('form', 'foxy-generate-codes-form');
    expect(action).to.be.instanceOf(customElements.get('foxy-internal-bulk-add-action-control'));
    expect(action).to.have.deep.property('related', [
      element.data?._links['fx:gift_card_codes'].href,
    ]);
  });

  it('renders bulk add control for the Import Codes header action', async () => {
    const element = await fixture<GiftCardForm>(html`
      <foxy-gift-card-form .data=${await getTestData('./hapi/gift_cards/0')}></foxy-gift-card-form>
    `);

    const action = element.renderRoot.querySelector('[infer=import]');

    expect(action).to.exist;
    expect(action).to.have.attribute('parent', element.data?._links['fx:gift_card_codes'].href);
    expect(action).to.have.attribute('form', 'foxy-gift-card-codes-form');
    expect(action).to.be.instanceOf(customElements.get('foxy-internal-bulk-add-action-control'));
    expect(action).to.have.deep.property('related', [
      element.data?._links['fx:gift_card_codes'].href,
    ]);
  });

  it('renders text control for name', async () => {
    const element = await fixture<GiftCardForm>(html`<foxy-gift-card-form></foxy-gift-card-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-text-control[infer=name]');
    expect(control).to.exist;
  });

  it('renders select control for currencies', async () => {
    const element = await fixture<GiftCardForm>(html`<foxy-gift-card-form></foxy-gift-card-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-select-control[infer=currency]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('property', 'currency_code');
    expect(control).to.have.deep.property(
      'options',
      currencies.map(value => ({
        label: `currency.code_${value}`,
        value,
      }))
    );

    expect(control.getValue()).to.equal(undefined);
    control.setValue('usd');
    expect(element).to.have.deep.nested.property('form.currency_code', 'usd');
    expect(control.getValue()).to.equal('usd');
  });

  it('renders frequency control for expiration period', async () => {
    const element = await fixture<GiftCardForm>(html`<foxy-gift-card-form></foxy-gift-card-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-frequency-control[infer=expires]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('property', 'expires_after');
  });

  it('renders provisioning control', async () => {
    const element = await fixture<GiftCardForm>(html`<foxy-gift-card-form></foxy-gift-card-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-gift-card-form-provisioning-control[infer="provisioning"]'
    );

    expect(control).to.exist;
  });

  it('renders async list control for codes', async () => {
    const writeTextMethod = stub(navigator.clipboard, 'writeText').resolves();

    const element = await fixture<GiftCardForm>(html`
      <foxy-gift-card-form .data=${await getTestData('./hapi/gift_cards/0')}> </foxy-gift-card-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-async-list-control[infer=codes]'
    ) as InternalAsyncListControl;

    expect(control).to.exist;
    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/gift_card_codes?gift_card_id=0&order=date_created+desc'
    );

    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('item', 'foxy-gift-card-code-card');
    expect(control).to.have.attribute('form', 'foxy-gift-card-code-form');
    expect(control).to.have.attribute('alert');
    expect(control).to.have.deep.property('formProps', {
      '.getCustomerHref': element.getCustomerHref,
    });

    expect(control.actions).to.have.length(1);
    expect(control.actions[0]).to.have.property('theme', 'contrast');
    expect(control.actions[0]).to.have.property('state', 'idle');
    expect(control.actions[0]).to.have.property('text', 'copy_button_text');

    const couponCode = await getTestData<Resource<Rels.CouponCode>>('./hapi/gift_card_codes/0');
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
      { label: 'current_balance', path: 'current_balance', type: Type.Number },
      { label: 'end_date', path: 'end_date', type: Type.Date },
      { label: 'date_created', path: 'date_created', type: Type.Date },
      { label: 'date_modified', path: 'date_modified', type: Type.Date },
    ]);
  });

  it('renders editable list control for product code restrictions', async () => {
    const element = await fixture<GiftCardForm>(html`<foxy-gift-card-form></foxy-gift-card-form>`);
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
    const element = await fixture<GiftCardForm>(
      html`
        <foxy-gift-card-form
          href="https://demo.api/hapi/gift_cards/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-form>
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
    expect(control).to.have.attribute('own-key-for-uri', 'gift_card_uri');
    expect(control).to.have.attribute('own-uri', 'https://demo.api/hapi/gift_cards/0');
    expect(control).to.have.attribute('embed-key', 'fx:gift_card_item_categories');

    expect(control).to.have.attribute(
      'options-href',
      'https://demo.api/hapi/item_categories?store_id=0'
    );

    expect(control).to.have.attribute(
      'links-href',
      'https://demo.api/hapi/gift_card_item_categories?gift_card_id=0'
    );

    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('item', 'foxy-item-category-card');
  });

  it('renders async list control for attributes', async () => {
    const element = await fixture<GiftCardForm>(
      html`<foxy-gift-card-form
        .data=${await getTestData('./hapi/gift_cards/0')}
      ></foxy-gift-card-form>`
    );

    const control = element.renderRoot.querySelector(
      'foxy-internal-async-list-control[infer=attributes]'
    ) as InternalAsyncListControl;

    expect(control).to.exist;
    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/gift_card_attributes?gift_card_id=0'
    );

    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('item', 'foxy-attribute-card');
    expect(control).to.have.attribute('form', 'foxy-attribute-form');
    expect(control).to.have.attribute('alert');
  });
});
