import './index';

import { expect, fixture, html } from '@open-wc/testing';
import { CouponCodeForm } from './CouponCodeForm';
import { InternalForm } from '../../internal/InternalForm';
import { getTestData } from '../../../testgen/getTestData';

describe('foxy-coupon-code-form', () => {
  it('imports and defines foxy-internal-async-list-control', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-integer-control', () => {
    expect(customElements.get('foxy-internal-integer-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-transaction-card', () => {
    expect(customElements.get('foxy-transaction-card')).to.exist;
  });

  it('defines itself as foxy-coupon-code-form', () => {
    expect(customElements.get('foxy-coupon-code-form')).to.exist;
  });

  it('extends InternalForm', () => {
    expect(new CouponCodeForm()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18next namespace of "coupon-code-form"', () => {
    expect(CouponCodeForm).to.have.property('defaultNS', 'coupon-code-form');
    expect(new CouponCodeForm()).to.have.property('ns', 'coupon-code-form');
  });

  it('has a reactive property getTransactionPageHref', () => {
    expect(new CouponCodeForm()).to.have.property('getTransactionPageHref', null);
    expect(CouponCodeForm).to.have.deep.nested.property('properties.getTransactionPageHref', {
      attribute: false,
    });
  });

  it('produces "code:v8n_required" v8n error when code is empty', () => {
    const element = new CouponCodeForm();
    expect(element.errors).to.include('code:v8n_required');
    element.edit({ code: 'foo' });
    expect(element.errors).not.to.include('code:v8n_required');
  });

  it('produces "code:v8n_too_long" v8n error when code is too long', () => {
    const element = new CouponCodeForm();
    expect(element.errors).to.not.include('code:v8n_too_long');
    element.edit({ code: 'foo' });
    expect(element.errors).not.to.include('code:v8n_too_long');
    element.edit({ code: 'a'.repeat(51) });
    expect(element.errors).to.include('code:v8n_too_long');
  });

  it('produces "code:v8n_has_spaces" v8n error when code contains spaces', () => {
    const element = new CouponCodeForm();
    expect(element.errors).to.not.include('code:v8n_has_spaces');
    element.edit({ code: 'foo' });
    expect(element.errors).not.to.include('code:v8n_has_spaces');
    element.edit({ code: 'foo bar' });
    expect(element.errors).to.include('code:v8n_has_spaces');
  });

  it('hides transactions and number of uses when href is not set', () => {
    const element = new CouponCodeForm();
    expect(element.hiddenSelector.matches('transactions', true)).to.be.true;
    expect(element.hiddenSelector.matches('number-of-uses-to-date', true)).to.be.true;

    element.href = 'https://demo.api/hapi/coupon_codes/0';
    expect(element.hiddenSelector.matches('transactions', true)).to.be.false;
    expect(element.hiddenSelector.matches('number-of-uses-to-date', true)).to.be.false;
  });

  it('always keeps number of uses to date readonly', () => {
    const element = new CouponCodeForm();
    expect(element.readonlySelector.matches('number-of-uses-to-date', true)).to.be.true;
    element.readonly = false;
    expect(element.readonlySelector.matches('number-of-uses-to-date', true)).to.be.true;
  });

  it('renders a text control for code', async () => {
    const element = await fixture<CouponCodeForm>(
      html`<foxy-coupon-code-form></foxy-coupon-code-form>`
    );
    const control = element.renderRoot.querySelector('foxy-internal-text-control[infer="code"]');
    expect(control).to.exist;
  });

  it('renders an integer control for number of uses', async () => {
    const element = await fixture<CouponCodeForm>(
      html`<foxy-coupon-code-form></foxy-coupon-code-form>`
    );
    const control = element.renderRoot.querySelector(
      'foxy-internal-integer-control[infer="number-of-uses-to-date"]'
    );
    expect(control).to.exist;
  });

  it('renders a list of transactions', async () => {
    const element = await fixture<CouponCodeForm>(
      html`<foxy-coupon-code-form></foxy-coupon-code-form>`
    );
    const control = element.renderRoot.querySelector(
      'foxy-internal-async-list-control[infer=transactions]'
    );

    expect(control).to.exist;
    expect(control).to.not.have.attribute('first');
    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('item', 'foxy-transaction-card');
    expect(control).to.have.attribute('hide-delete-button');
    expect(control).to.have.property('getPageHref', null);

    element.getTransactionPageHref = () => 'https://demo.api/hapi/transactions';
    await element.requestUpdate();
    expect(control).to.have.property('getPageHref', element.getTransactionPageHref);

    element.data = await getTestData('./hapi/coupon_codes/0');
    const url = new URL(element.data!._links['fx:coupon_code_transactions'].href);
    url.searchParams.set('zoom', 'items');
    await element.requestUpdate();
    expect(control).to.have.attribute('first', url.toString());
  });
});
