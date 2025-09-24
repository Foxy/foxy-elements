import type { InternalResourcePickerControl } from '../../internal/InternalResourcePickerControl/InternalResourcePickerControl';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { GiftCardCodeForm } from './GiftCardCodeForm';
import { getResourceId } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { Type } from '../QueryBuilder/types';
import { stub } from 'sinon';

describe('GiftCardCodeForm', () => {
  it('imports and defines foxy-internal-resource-picker-control', () => {
    expect(customElements.get('foxy-internal-resource-picker-control')).to.exist;
  });

  it('imports and defines foxy-internal-async-list-control', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-number-control', () => {
    expect(customElements.get('foxy-internal-number-control')).to.exist;
  });

  it('imports and defines foxy-internal-date-control', () => {
    expect(customElements.get('foxy-internal-date-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-gift-card-code-log-card', () => {
    expect(customElements.get('foxy-gift-card-code-log-card')).to.exist;
  });

  it('imports and defines foxy-customer-card', () => {
    expect(customElements.get('foxy-customer-card')).to.exist;
  });

  it('imports and defines foxy-item-card', () => {
    expect(customElements.get('foxy-item-card')).to.exist;
  });

  it('imports and defines foxy-nucleon', () => {
    expect(customElements.get('foxy-nucleon')).to.exist;
  });

  it('imports and defines itself as foxy-gift-card-code-form', () => {
    expect(customElements.get('foxy-gift-card-code-form')).to.equal(GiftCardCodeForm);
  });

  it('extends InternalForm', () => {
    expect(new GiftCardCodeForm()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18next namespace of gift-card-code-form', () => {
    expect(new GiftCardCodeForm()).to.have.property('ns', 'gift-card-code-form');
  });

  it('has a reactive property "getTransactionPageHref"', () => {
    expect(new GiftCardCodeForm()).to.have.property('getTransactionPageHref', null);
    expect(GiftCardCodeForm).to.have.deep.nested.property('properties.getTransactionPageHref', {
      attribute: false,
    });
  });

  it('has a reactive property "getCustomerHref"', () => {
    expect(GiftCardCodeForm).to.have.deep.nested.property('properties.getCustomerHref', {
      attribute: false,
    });

    expect(new GiftCardCodeForm()).to.have.property('getCustomerHref');
    expect(new GiftCardCodeForm().getCustomerHref(123)).to.equal(
      'https://api.foxycart.com/customers/123'
    );
  });

  it('produces v8n error "code:v8n_required" if code is missing', () => {
    const element = new GiftCardCodeForm();
    expect(element.errors).to.include('code:v8n_required');
    element.edit({ code: 'abc' });
    expect(element.errors).not.to.include('code:v8n_required');
  });

  it('produces v8n error "code:v8n_too_long" if code is longer than 50 characters', () => {
    const element = new GiftCardCodeForm();
    expect(element.errors).not.to.include('code:v8n_too_long');
    element.edit({ code: 'a'.repeat(51) });
    expect(element.errors).to.include('code:v8n_too_long');
  });

  it('produces v8n error "code:v8n_has_spaces" if code contains spaces', () => {
    const element = new GiftCardCodeForm();
    expect(element.errors).not.to.include('code:v8n_has_spaces');
    element.edit({ code: 'a b' });
    expect(element.errors).to.include('code:v8n_has_spaces');
  });

  it('produces v8n error "current-balance:v8n_required" if current_balance is missing', () => {
    const element = new GiftCardCodeForm();
    expect(element.errors).to.include('current-balance:v8n_required');
    element.edit({ current_balance: 0 });
    expect(element.errors).not.to.include('current-balance:v8n_required');
  });

  it('hides customer, cart-item and logs when empty on in create mode', () => {
    const element = new GiftCardCodeForm();
    expect(element.hiddenSelector.matches('customer', true)).to.be.true;
    expect(element.hiddenSelector.matches('cart-item', true)).to.be.true;
    expect(element.hiddenSelector.matches('logs', true)).to.be.true;

    element.href = 'https://demo.api/hapi/gift_card_codes/0';
    expect(element.hiddenSelector.matches('customer', true)).to.be.false;
    expect(element.hiddenSelector.matches('cart-item', true)).to.be.false;
    expect(element.hiddenSelector.matches('logs', true)).to.be.false;
  });

  it('always keeps cart-item readonly', () => {
    const element = new GiftCardCodeForm();
    expect(element.readonlySelector.matches('cart-item', true)).to.be.true;
  });

  it('renders a form header', () => {
    const form = new GiftCardCodeForm();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders a summary control for settings', async () => {
    const element = await fixture<GiftCardCodeForm>(
      html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`
    );

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="settings"]'
    );

    expect(control).to.exist;
  });

  it('renders a text control for code inside of the settings summary', async () => {
    const element = await fixture<GiftCardCodeForm>(
      html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`
    );

    const control = element.renderRoot.querySelector(
      '[infer="settings"] foxy-internal-text-control[infer="code"]'
    );

    expect(control).to.exist;
  });

  it('renders a number control for current balance inside of the settings summary', async () => {
    const element = await fixture<GiftCardCodeForm>(
      html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`
    );

    const control = element.renderRoot.querySelector(
      '[infer="settings"] foxy-internal-number-control[infer="current-balance"]'
    );

    expect(control).to.exist;
  });

  it('renders a date control for end date inside of the settings summary', async () => {
    const element = await fixture<GiftCardCodeForm>(
      html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`
    );

    const control = element.renderRoot.querySelector(
      '[infer="settings"] foxy-internal-date-control[infer="end-date"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('format', 'iso-long');
  });

  it('renders a resource picker control for associated customer', async () => {
    const router = createRouter();
    const getCustomerHref = (id: number | string) => `https://demo.api/hapi/customers/${id}`;
    const element = await fixture<GiftCardCodeForm>(
      html`
        <foxy-gift-card-code-form
          href="https://demo.api/hapi/gift_card_codes/0"
          .getCustomerHref=${getCustomerHref}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-code-form>
      `
    );

    const control = element.renderRoot.querySelector(
      'foxy-internal-resource-picker-control[infer="customer"]'
    ) as InternalResourcePickerControl;

    expect(control).to.exist;
    await waitUntil(() => control.hasAttribute('first'));

    expect(control).to.have.attribute('first', 'https://demo.api/hapi/customers?store_id=0');
    expect(control).to.have.property('item', 'foxy-customer-card');
    expect(control).to.have.deep.property('filters', [
      { type: Type.String, path: 'id', label: 'filters.id' },
      { type: Type.String, path: 'tax_id', label: 'filters.tax_id' },
      { type: Type.String, path: 'email', label: 'filters.email' },
      { type: Type.String, path: 'first_name', label: 'filters.first_name' },
      { type: Type.String, path: 'last_name', label: 'filters.last_name' },
      {
        type: Type.Boolean,
        path: 'is_anonymous',
        label: 'filters.is_anonymous',
        list: [
          { label: 'filters.is_anonymous_true', value: 'true' },
          { label: 'filters.is_anonymous_false', value: 'false' },
        ],
      },
      { type: Type.Date, path: 'last_login_date', label: 'filters.last_login_date' },
      { type: Type.Date, path: 'date_created', label: 'filters.date_created' },
      { type: Type.Date, path: 'date_modified', label: 'filters.date_modified' },
    ]);

    expect(control.getValue()).to.equal(undefined);

    control.setValue('https://demo.api/hapi/customers/0');
    expect(element).to.have.nested.property('form.customer_id', 0);

    element.edit({ customer_id: 2 });
    expect(control.getValue()).to.equal('https://demo.api/hapi/customers/2');

    const testParams = new URLSearchParams();
    control.extendFilter?.(testParams);
    expect(testParams.get('is_anonymous')).to.equal('false|is_anonymous=true');
  });

  it('renders a resource picker control for associated cart item', async () => {
    const router = createRouter();
    const getTransactionPageHref = (href: string) => {
      return `https://example.com/transactions/${getResourceId(href)}`;
    };

    const element = await fixture<GiftCardCodeForm>(
      html`
        <foxy-gift-card-code-form
          href="https://demo.api/hapi/gift_card_codes/0"
          .getTransactionPageHref=${getTransactionPageHref}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-code-form>
      `
    );

    await waitUntil(() => !!element.data);
    const control = element.renderRoot.querySelector<InternalResourcePickerControl>(
      'foxy-internal-resource-picker-control[infer="cart-item"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('item', 'foxy-item-card');
    expect(control?.getValue()).to.equal('https://demo.api/hapi/items/0?zoom=item_options');
    expect(
      control?.getItemUrl?.('https://demo.api/hapi/items/0', await getTestData('./hapi/items/0'))
    ).to.equal('https://example.com/transactions/0');
  });

  it('renders a list control for logs', async () => {
    const element = await fixture<GiftCardCodeForm>(
      html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`
    );
    const control = element.renderRoot.querySelector(
      'foxy-internal-async-list-control[infer="logs"]'
    );

    expect(control).to.exist;
    expect(control).to.not.have.attribute('first');
    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('item', 'foxy-gift-card-code-log-card');

    element.data = await getTestData('./hapi/gift_card_codes/0');
    await element.requestUpdate();
    expect(control).to.have.attribute(
      'first',
      element.data?._links?.['fx:gift_card_code_logs'].href
    );
  });
});
