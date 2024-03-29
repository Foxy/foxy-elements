import './index';

import { expect, fixture, html } from '@open-wc/testing';
import { GiftCardCodeForm } from './GiftCardCodeForm';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { getTestData } from '../../../testgen/getTestData';

describe('GiftCardCodeForm', () => {
  it('imports and defines foxy-internal-async-list-control', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
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

  it('imports and defines foxy-internal-gift-card-code-form-item-control', () => {
    expect(customElements.get('foxy-internal-gift-card-code-form-item-control')).to.exist;
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

  it('hides cart-item and logs when empty on in create mode', () => {
    const element = new GiftCardCodeForm();
    expect(element.hiddenSelector.matches('cart-item', true)).to.be.true;
    expect(element.hiddenSelector.matches('logs', true)).to.be.true;

    element.href = 'https://demo.api/hapi/gift_card_codes/0';
    expect(element.hiddenSelector.matches('cart-item', true)).to.be.false;
    expect(element.hiddenSelector.matches('logs', true)).to.be.false;
  });

  it('renders a text control for code', async () => {
    const element = await fixture<GiftCardCodeForm>(
      html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`
    );
    const control = element.renderRoot.querySelector('foxy-internal-text-control[infer="code"]');
    expect(control).to.exist;
  });

  it('renders a number control for current balance', async () => {
    const element = await fixture<GiftCardCodeForm>(
      html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`
    );
    const control = element.renderRoot.querySelector(
      'foxy-internal-number-control[infer="current-balance"]'
    );
    expect(control).to.exist;
  });

  it('renders a date control for end date', async () => {
    const element = await fixture<GiftCardCodeForm>(
      html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`
    );
    const control = element.renderRoot.querySelector(
      'foxy-internal-date-control[infer="end-date"]'
    );
    expect(control).to.exist;
  });

  it('renders a custom control for associated cart item', async () => {
    const element = await fixture<GiftCardCodeForm>(
      html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`
    );
    const control = element.renderRoot.querySelector(
      'foxy-internal-gift-card-code-form-item-control[infer="cart-item"]'
    );
    expect(control).to.exist;
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
