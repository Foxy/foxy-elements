import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import { InternalEditableListControl } from '../../internal/InternalEditableListControl/InternalEditableListControl';
import { InternalFrequencyControl } from '../../internal/InternalFrequencyControl/InternalFrequencyControl';
import { InternalPasswordControl } from '../../internal/InternalPasswordControl/InternalPasswordControl';
import { InternalSummaryControl } from '../../internal/InternalSummaryControl/InternalSummaryControl';
import { InternalSwitchControl } from '../../internal/InternalSwitchControl/InternalSwitchControl';
import { InternalNumberControl } from '../../internal/InternalNumberControl/InternalNumberControl';
import { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { StoreForm as Form } from './StoreForm';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server/index';
import { I18n } from '../I18n/I18n';
import { stub } from 'sinon';
import { VanillaHCaptchaWebComponent } from 'vanilla-hcaptcha';
import { getTestData } from '../../../testgen/getTestData';

describe('StoreForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-editable-list-control', () => {
    const element = customElements.get('foxy-internal-editable-list-control');
    expect(element).to.equal(InternalEditableListControl);
  });

  it('imports and defines foxy-internal-frequency-control', () => {
    const element = customElements.get('foxy-internal-frequency-control');
    expect(element).to.equal(InternalFrequencyControl);
  });

  it('imports and defines foxy-internal-password-control', () => {
    const element = customElements.get('foxy-internal-password-control');
    expect(element).to.equal(InternalPasswordControl);
  });

  it('imports and defines foxy-internal-summary-control', () => {
    const element = customElements.get('foxy-internal-summary-control');
    expect(element).to.equal(InternalSummaryControl);
  });

  it('imports and defines foxy-internal-switch-control', () => {
    const element = customElements.get('foxy-internal-switch-control');
    expect(element).to.equal(InternalSwitchControl);
  });

  it('imports and defines foxy-internal-number-control', () => {
    const element = customElements.get('foxy-internal-number-control');
    expect(element).to.equal(InternalNumberControl);
  });

  it('imports and defines foxy-internal-select-control', () => {
    const element = customElements.get('foxy-internal-select-control');
    expect(element).to.equal(InternalSelectControl);
  });

  it('imports and defines foxy-internal-text-control', () => {
    const element = customElements.get('foxy-internal-text-control');
    expect(element).to.equal(InternalTextControl);
  });

  it('imports and defines foxy-internal-form', () => {
    const element = customElements.get('foxy-internal-form');
    expect(element).to.equal(InternalForm);
  });

  it('imports and defines foxy-nucleon', () => {
    const element = customElements.get('foxy-nucleon');
    expect(element).to.equal(NucleonElement);
  });

  it('imports and defines foxy-i18n', () => {
    const element = customElements.get('foxy-i18n');
    expect(element).to.equal(I18n);
  });

  it('imports and defines h-captcha', () => {
    const element = customElements.get('h-captcha');
    expect(element).to.exist;
  });

  it('imports and defines itself as foxy-store-form', () => {
    const element = customElements.get('foxy-store-form');
    expect(element).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace "store-form"', () => {
    expect(Form).to.have.property('defaultNS', 'store-form');
    expect(new Form()).to.have.property('ns', 'store-form');
  });

  it('has a reactive property "customerPasswordHashTypes"', () => {
    expect(new Form()).to.have.property('customerPasswordHashTypes', null);
    expect(Form).to.have.nested.property('properties.customerPasswordHashTypes');
    expect(Form).to.not.have.nested.property('properties.customerPasswordHashTypes.type');
    expect(Form).to.have.nested.property(
      'properties.customerPasswordHashTypes.attribute',
      'customer-password-hash-types'
    );
  });

  it('has a reactive property "shippingAddressTypes"', () => {
    expect(new Form()).to.have.property('shippingAddressTypes', null);
    expect(Form).to.have.nested.property('properties.shippingAddressTypes');
    expect(Form).to.not.have.nested.property('properties.shippingAddressTypes.type');
    expect(Form).to.have.nested.property(
      'properties.shippingAddressTypes.attribute',
      'shipping-address-types'
    );
  });

  it('has a reactive property "hCaptchaSiteKey"', () => {
    expect(new Form()).to.have.property('hCaptchaSiteKey', null);
    expect(Form).to.have.nested.property('properties.hCaptchaSiteKey');
    expect(Form).to.not.have.nested.property('properties.hCaptchaSiteKey.type');
    expect(Form).to.have.nested.property(
      'properties.hCaptchaSiteKey.attribute',
      'h-captcha-site-key'
    );
  });

  it('has a reactive property "storeVersions"', () => {
    expect(new Form()).to.have.property('storeVersions', null);
    expect(Form).to.have.nested.property('properties.storeVersions');
    expect(Form).to.not.have.nested.property('properties.storeVersions.type');
    expect(Form).to.have.nested.property('properties.storeVersions.attribute', 'store-versions');
  });

  it('has a reactive property "checkoutTypes"', () => {
    expect(new Form()).to.have.property('checkoutTypes', null);
    expect(Form).to.have.nested.property('properties.checkoutTypes');
    expect(Form).to.not.have.nested.property('properties.checkoutTypes.type');
    expect(Form).to.have.nested.property('properties.checkoutTypes.attribute', 'checkout-types');
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
    expect(Form).to.not.have.nested.property('properties.languages.attribute');
  });

  it('has a reactive property "timezones"', () => {
    expect(new Form()).to.have.property('timezones', null);
    expect(Form).to.have.nested.property('properties.timezones');
    expect(Form).to.not.have.nested.property('properties.timezones.type');
    expect(Form).to.not.have.nested.property('properties.timezones.attribute');
  });

  it('has a reactive property "countries"', () => {
    expect(new Form()).to.have.property('countries', null);
    expect(Form).to.have.nested.property('properties.countries');
    expect(Form).to.not.have.nested.property('properties.countries.type');
    expect(Form).to.not.have.nested.property('properties.countries.attribute');
  });

  it('has a reactive property "regions"', () => {
    expect(new Form()).to.have.property('regions', null);
    expect(Form).to.have.nested.property('properties.regions');
    expect(Form).to.not.have.nested.property('properties.regions.type');
    expect(Form).to.not.have.nested.property('properties.regions.attribute');
  });

  it('produces the store-name:v8n_required error if store name is empty', () => {
    const form = new Form();

    form.edit({ store_name: '' });
    expect(form.errors).to.include('store-name:v8n_required');

    form.edit({ store_name: 'Test' });
    expect(form.errors).to.not.include('store-name:v8n_required');
  });

  it('produces the store-name:v8n_too_long error if store name is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ store_name: 'A'.repeat(51) });
    expect(form.errors).to.include('store-name:v8n_too_long');

    form.edit({ store_name: 'A'.repeat(50) });
    expect(form.errors).to.not.include('store-name:v8n_too_long');
  });

  it('produces the store-domain:v8n_required error if store domain is empty', () => {
    const form = new Form();

    form.edit({ store_domain: '' });
    expect(form.errors).to.include('store-domain:v8n_required');

    form.edit({ store_domain: 'test' });
    expect(form.errors).to.not.include('store-domain:v8n_required');
  });

  it('produces the store-domain:v8n_too_long error if store domain is longer than 100 characters', () => {
    const form = new Form();

    form.edit({ store_domain: 'a'.repeat(101) });
    expect(form.errors).to.include('store-domain:v8n_too_long');

    form.edit({ store_domain: 'a'.repeat(100) });
    expect(form.errors).to.not.include('store-domain:v8n_too_long');
  });

  it('produces the store-url:v8n_required error if store url is empty', () => {
    const form = new Form();

    form.edit({ store_url: '' });
    expect(form.errors).to.include('store-url:v8n_required');

    form.edit({ store_url: 'test' });
    expect(form.errors).to.not.include('store-url:v8n_required');
  });

  it('produces the store-url:v8n_too_long error if store url is longer than 300 characters', () => {
    const form = new Form();

    form.edit({ store_url: 'a'.repeat(301) });
    expect(form.errors).to.include('store-url:v8n_too_long');

    form.edit({ store_url: 'a'.repeat(300) });
    expect(form.errors).to.not.include('store-url:v8n_too_long');
  });

  it('produces the receipt-continue-url:v8n_too_long error if receipt continue url is longer than 300 characters', () => {
    const form = new Form();

    form.edit({ receipt_continue_url: 'a'.repeat(301) });
    expect(form.errors).to.include('receipt-continue-url:v8n_too_long');

    form.edit({ receipt_continue_url: 'a'.repeat(300) });
    expect(form.errors).to.not.include('receipt-continue-url:v8n_too_long');
  });

  it('produces the store-email:v8n_required error if store email is empty', () => {
    const form = new Form();

    form.edit({ store_email: '' });
    expect(form.errors).to.include('store-email:v8n_required');

    form.edit({ store_email: 'test@example.com' });
    expect(form.errors).to.not.include('store-email:v8n_required');
  });

  it('produces the store-email:v8n_too_long error if store email is longer than 300 characters', () => {
    const form = new Form();

    form.edit({ store_email: 'a'.repeat(301) });
    expect(form.errors).to.include('store-email:v8n_too_long');

    form.edit({ store_email: 'a'.repeat(300) });
    expect(form.errors).to.not.include('store-email:v8n_too_long');
  });

  it('produces the from-email:v8n_too_long error if from email is longer than 100 characters', () => {
    const form = new Form();

    form.edit({ from_email: 'a'.repeat(101) });
    expect(form.errors).to.include('from-email:v8n_too_long');

    form.edit({ from_email: 'a'.repeat(100) });
    expect(form.errors).to.not.include('from-email:v8n_too_long');
  });

  it('produces the use-smtp-config:v8n_too_long error if smtp config is longer than 1000 characters', () => {
    const form = new Form();

    form.edit({ smtp_config: 'a'.repeat(1001) });
    expect(form.errors).to.include('use-smtp-config:v8n_too_long');

    form.edit({ smtp_config: 'a'.repeat(1000) });
    expect(form.errors).to.not.include('use-smtp-config:v8n_too_long');
  });

  it('produces the postal-code:v8n_required error if postal code is empty', () => {
    const form = new Form();

    form.edit({ postal_code: '' });
    expect(form.errors).to.include('postal-code:v8n_required');

    form.edit({ postal_code: '012345' });
    expect(form.errors).to.not.include('postal-code:v8n_required');
  });

  it('produces the postal-code:v8n_too_long error if postal code is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ postal_code: '1'.repeat(51) });
    expect(form.errors).to.include('postal-code:v8n_too_long');

    form.edit({ postal_code: '1'.repeat(50) });
    expect(form.errors).to.not.include('postal-code:v8n_too_long');
  });

  it('produces the region:v8n_required error if region is empty', () => {
    const form = new Form();

    form.edit({ region: '' });
    expect(form.errors).to.include('region:v8n_required');

    form.edit({ region: 'TX' });
    expect(form.errors).to.not.include('region:v8n_required');
  });

  it('produces the region:v8n_too_long error if region is longer than 100 characters', () => {
    const form = new Form();

    form.edit({ region: 'A'.repeat(101) });
    expect(form.errors).to.include('region:v8n_too_long');

    form.edit({ region: 'A'.repeat(100) });
    expect(form.errors).to.not.include('region:v8n_too_long');
  });

  it('produces the country:v8n_required error if country is empty', () => {
    const form = new Form();

    form.edit({ country: '' });
    expect(form.errors).to.include('country:v8n_required');

    form.edit({ country: 'US' });
    expect(form.errors).to.not.include('country:v8n_required');
  });

  it('produces the logo-url:v8n_too_long error if logo url is longer than 200 characters', () => {
    const form = new Form();

    form.edit({ logo_url: 'A'.repeat(201) });
    expect(form.errors).to.include('logo-url:v8n_too_long');

    form.edit({ logo_url: 'A'.repeat(200) });
    expect(form.errors).to.not.include('logo-url:v8n_too_long');
  });

  it('produces the webhook-url:v8n_too_long error if legacy webhook is enabled and the url exceeds 300 characters', () => {
    const form = new Form();

    form.edit({ use_webhook: false, webhook_url: '' });
    expect(form.errors).to.not.include('webhook-url:v8n_too_long');

    form.edit({ use_webhook: false, webhook_url: 'A'.repeat(300) });
    expect(form.errors).to.not.include('webhook-url:v8n_too_long');

    form.edit({ use_webhook: false, webhook_url: 'A'.repeat(301) });
    expect(form.errors).to.not.include('webhook-url:v8n_too_long');

    form.edit({ use_webhook: true, webhook_url: '' });
    expect(form.errors).to.not.include('webhook-url:v8n_too_long');

    form.edit({ use_webhook: true, webhook_url: 'A'.repeat(300) });
    expect(form.errors).to.not.include('webhook-url:v8n_too_long');

    form.edit({ use_webhook: true, webhook_url: 'A'.repeat(301) });
    expect(form.errors).to.include('webhook-url:v8n_too_long');
  });

  it('produces the webhook-key:v8n_required error if legacy webhook is enabled and key is empty', () => {
    const form = new Form();

    form.edit({ use_webhook: false, webhook_key: '' });
    expect(form.errors).to.not.include('webhook-key:v8n_required');

    form.edit({ use_webhook: true, webhook_key: '' });
    expect(form.errors).to.include('webhook-key:v8n_required');
  });

  it('produces the webhook-key:v8n_required error if hmac for carts is enabled and key is empty', () => {
    const form = new Form();

    form.edit({ use_cart_validation: false, webhook_key: '' });
    expect(form.errors).to.not.include('webhook-key:v8n_required');

    form.edit({ use_cart_validation: true, webhook_key: '' });
    expect(form.errors).to.include('webhook-key:v8n_required');
  });

  it('produces the webhook-key:v8n_too_long error if legacy webhook is enabled and the key exceeds 200 characters', () => {
    const form = new Form();

    form.edit({ use_webhook: false, webhook_key: '' });
    expect(form.errors).to.not.include('webhook-key:v8n_too_long');

    form.edit({ use_webhook: false, webhook_key: 'A'.repeat(200) });
    expect(form.errors).to.not.include('webhook-key:v8n_too_long');

    form.edit({ use_webhook: false, webhook_key: 'A'.repeat(201) });
    expect(form.errors).to.not.include('webhook-key:v8n_too_long');

    form.edit({ use_webhook: true, webhook_key: '' });
    expect(form.errors).to.not.include('webhook-key:v8n_too_long');

    form.edit({ use_webhook: true, webhook_key: 'A'.repeat(200) });
    expect(form.errors).to.not.include('webhook-key:v8n_too_long');

    form.edit({ use_webhook: true, webhook_key: 'A'.repeat(201) });
    expect(form.errors).to.include('webhook-key:v8n_too_long');
  });

  it('produces the single-sign-on-url:v8n_required error if sso is enabled and url is empty', () => {
    const form = new Form();

    form.edit({ use_single_sign_on: false, single_sign_on_url: '' });
    expect(form.errors).to.not.include('single-sign-on-url:v8n_required');

    form.edit({ use_single_sign_on: true, single_sign_on_url: '' });
    expect(form.errors).to.include('single-sign-on-url:v8n_required');

    form.edit({ use_single_sign_on: true, single_sign_on_url: 'https://example.com' });
    expect(form.errors).to.not.include('single-sign-on-url:v8n_required');
  });

  it('produces the single-sign-on-url:v8n_too_long error if sso is enabled and the url exceeds 300 characters', () => {
    const form = new Form();

    form.edit({ use_single_sign_on: false, single_sign_on_url: '' });
    expect(form.errors).to.not.include('single-sign-on-url:v8n_too_long');

    form.edit({ use_single_sign_on: false, single_sign_on_url: 'A'.repeat(300) });
    expect(form.errors).to.not.include('single-sign-on-url:v8n_too_long');

    form.edit({ use_single_sign_on: false, single_sign_on_url: 'A'.repeat(301) });
    expect(form.errors).to.not.include('single-sign-on-url:v8n_too_long');

    form.edit({ use_single_sign_on: true, single_sign_on_url: '' });
    expect(form.errors).to.not.include('single-sign-on-url:v8n_too_long');

    form.edit({ use_single_sign_on: true, single_sign_on_url: 'A'.repeat(300) });
    expect(form.errors).to.not.include('single-sign-on-url:v8n_too_long');

    form.edit({ use_single_sign_on: true, single_sign_on_url: 'A'.repeat(301) });
    expect(form.errors).to.include('single-sign-on-url:v8n_too_long');
  });

  it('produces the customer-password-hash-config:v8n_too_long error if customer password hash config is longer than 100 characters', () => {
    const form = new Form();

    form.edit({ customer_password_hash_config: 'A'.repeat(101) });
    expect(form.errors).to.include('customer-password-hash-config:v8n_too_long');

    form.edit({ customer_password_hash_config: 'A'.repeat(100) });
    expect(form.errors).to.not.include('customer-password-hash-config:v8n_too_long');
  });

  it('produces the unified-order-entry-password:v8n_too_long error if unified order entry password is longer than 100 characters', () => {
    const form = new Form();

    form.edit({ unified_order_entry_password: 'A'.repeat(101) });
    expect(form.errors).to.include('unified-order-entry-password:v8n_too_long');

    form.edit({ unified_order_entry_password: 'A'.repeat(100) });
    expect(form.errors).to.not.include('unified-order-entry-password:v8n_too_long');
  });

  it('produces the custom-display-id-config-enabled:v8n_too_long error if custom display id config is longer than 500 characters', () => {
    const form = new Form();

    form.edit({ custom_display_id_config: 'A'.repeat(501) });
    expect(form.errors).to.include('custom-display-id-config-enabled:v8n_too_long');

    form.edit({ custom_display_id_config: 'A'.repeat(500) });
    expect(form.errors).to.not.include('custom-display-id-config-enabled:v8n_too_long');
  });

  it('renders a form header', () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders a summary control for Essentials section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="essentials"]'
    );

    expect(control).to.exist;
  });

  it('renders a text control for store name in the Essentials section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="essentials"] foxy-internal-text-control[infer="store-name"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('generates a store domain based on the store name unless a custom one is provided', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector<InternalTextControl>(
      '[infer="essentials"] foxy-internal-text-control[infer="store-name"]'
    );

    control?.setValue('My Test Store');
    expect(element).to.have.nested.property('form.store_domain', 'my-test-store');

    element.data = await getTestData('./hapi/stores/0');
    element.data = { ...element.data!, store_domain: 'test' };
    control?.setValue('My Test Store');
    expect(element).to.have.nested.property('form.store_domain', 'test');
  });

  it('renders a text control for logo url in the Essentials section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="essentials"] foxy-internal-text-control[infer="logo-url"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for store domain in the Essentials section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="essentials"] foxy-internal-text-control[infer="store-domain"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');

    element.edit({ use_remote_domain: false, store_domain: 'test' });
    await element.requestUpdate();

    expect(control).to.have.attribute('helper-text', 'essentials.store-domain.helper_text');
    expect(control).to.have.attribute('suffix', '.foxycart.com');

    element.edit({ use_remote_domain: true, store_domain: 'test.com' });
    await element.requestUpdate();

    expect(control).to.have.attribute('helper-text', 'essentials.store-domain.custom_domain_note');
    expect(control).to.have.attribute('suffix', '');

    control.setValue('test');
    expect(element).to.have.nested.property('form.use_remote_domain', false);
    expect(element).to.have.nested.property('form.store_domain', 'test');

    control.setValue('test.com');
    expect(element).to.have.nested.property('form.use_remote_domain', true);
    expect(element).to.have.nested.property('form.store_domain', 'test.com');
  });

  it('renders a text control for store url in the Essentials section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="essentials"] foxy-internal-text-control[infer="store-url"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a switch control for maintenance mode in the Essentials section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="essentials"] foxy-internal-switch-control[infer="is-maintenance-mode"]'
    );

    expect(control).to.exist;
  });

  it('renders an editable list control for store email in the Essentials section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="essentials"] foxy-internal-editable-list-control[infer="store-email"]'
    ) as InternalEditableListControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');

    control.setValue([{ value: 'a@b.c' }, { value: 'd@e.f' }]);
    expect(element).to.have.nested.property('form.store_email', 'a@b.c,d@e.f');

    element.edit({ store_email: 'test1@example.com,test2@example.com' });
    expect(control.getValue()).to.deep.equal([
      { value: 'test1@example.com' },
      { value: 'test2@example.com' },
    ]);
  });

  it('renders a select control for timezone in the Essentials section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(
      html`
        <foxy-store-form
          @fetch=${(evt: FetchEvent) => !evt.defaultPrevented && router.handleEvent(evt)}
        >
        </foxy-store-form>
      `
    );

    const control = element.renderRoot.querySelector(
      '[infer="essentials"] [infer="timezone"]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.attribute('layout', 'summary-item');

    await new Form.API(element).fetch('https://demo.api/hapi/property_helpers/2', {
      method: 'PATCH',
      body: JSON.stringify({
        values: {
          timezone: [
            {
              timezone: 'America/Los_Angeles',
              description: '(GMT-08:00) Pacific Time (US and Canada)',
            },
            {
              timezone: 'America/Denver',
              description: '(GMT-07:00) Mountain Time (US and Canada)',
            },
          ],
        },
      }),
    });

    element.timezones = 'https://demo.api/hapi/property_helpers/2';
    await element.requestUpdate();
    await waitUntil(() => !!control.options.length, '', { timeout: 5000 });

    expect(control).to.have.deep.property('options', [
      {
        value: 'America/Los_Angeles',
        rawLabel: '(GMT-08:00) Pacific Time (US and Canada)',
      },
      {
        value: 'America/Denver',
        rawLabel: '(GMT-07:00) Mountain Time (US and Canada)',
      },
    ]);
  });

  it('renders a select control for country in the Essentials section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-store-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="essentials"] [infer="country"]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.attribute('layout', 'summary-item');

    await new Form.API(element).fetch('https://demo.api/hapi/property_helpers/3', {
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
    });

    element.countries = 'https://demo.api/hapi/property_helpers/3';
    await element.requestUpdate();
    await waitUntil(() => !!control.options.length, '', { timeout: 5000 });

    expect(control).to.have.deep.property('options', [
      { value: 'GB', rawLabel: 'United Kingdom' },
      { value: 'US', rawLabel: 'United States' },
    ]);
  });

  it('renders a select control for region in the Essentials section when there are predefined regions', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-store-form>
    `);

    await new Form.API(element).fetch('https://demo.api/hapi/property_helpers/4', {
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
    });

    let control: InternalTextControl | null = null;
    element.regions = 'https://demo.api/hapi/property_helpers/4';
    await element.requestUpdate();

    await waitUntil(
      () => {
        control = element.renderRoot.querySelector('foxy-internal-select-control[infer="region"]');
        return !!control;
      },
      '',
      { timeout: 5000 }
    );

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('options', [
      { value: 'SD', rawLabel: 'South Dakota' },
      { value: 'TN', rawLabel: 'Tennessee' },
    ]);
  });

  it('renders a text control for region in the Essentials section when there are no predefined regions', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-store-form>
    `);

    await new Form.API(element).fetch('https://demo.api/hapi/property_helpers/4', {
      method: 'PATCH',
      body: JSON.stringify({
        values: {},
      }),
    });

    let control: InternalTextControl | null = null;
    element.regions = 'https://demo.api/hapi/property_helpers/4';
    await element.requestUpdate();

    await waitUntil(
      () => {
        control = element.renderRoot.querySelector(
          '[infer="essentials"] foxy-internal-text-control[infer="region"]'
        );
        return !!control;
      },
      '',
      { timeout: 5000 }
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for postal code in the Essentials section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-store-form>
    `);

    const control = element.renderRoot.querySelector('[infer="essentials"] [infer="postal-code"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a select control for currency style in the Essentials section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector<InternalSelectControl>(
      '[infer="essentials"] [infer="currency-style"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('options', [
      { rawLabel: '12.34', value: '101' },
      { rawLabel: 'USD 12.34', value: '001' },
      { rawLabel: '$12.34', value: '000' },
      { rawLabel: '12', value: '111' },
      { rawLabel: 'USD 12', value: '011' },
      { rawLabel: '$12', value: '010' },
    ]);

    control?.setValue('101');
    expect(element).to.have.nested.property('form.hide_currency_symbol', true);
    expect(element).to.have.nested.property('form.hide_decimal_characters', false);
    expect(element).to.have.nested.property('form.use_international_currency_symbol', true);

    control?.setValue('001');
    expect(element).to.have.nested.property('form.hide_currency_symbol', false);
    expect(element).to.have.nested.property('form.hide_decimal_characters', false);
    expect(element).to.have.nested.property('form.use_international_currency_symbol', true);

    control?.setValue('000');
    expect(element).to.have.nested.property('form.hide_currency_symbol', false);
    expect(element).to.have.nested.property('form.hide_decimal_characters', false);
    expect(element).to.have.nested.property('form.use_international_currency_symbol', false);

    control?.setValue('111');
    expect(element).to.have.nested.property('form.hide_currency_symbol', true);
    expect(element).to.have.nested.property('form.hide_decimal_characters', true);
    expect(element).to.have.nested.property('form.use_international_currency_symbol', true);

    control?.setValue('011');
    expect(element).to.have.nested.property('form.hide_currency_symbol', false);
    expect(element).to.have.nested.property('form.hide_decimal_characters', true);
    expect(element).to.have.nested.property('form.use_international_currency_symbol', true);

    control?.setValue('010');
    expect(element).to.have.nested.property('form.hide_currency_symbol', false);
    expect(element).to.have.nested.property('form.hide_decimal_characters', true);
    expect(element).to.have.nested.property('form.use_international_currency_symbol', false);

    element.edit({
      hide_currency_symbol: true,
      hide_decimal_characters: false,
      use_international_currency_symbol: true,
    });

    expect(control?.getValue()).to.equal('101');

    element.edit({
      hide_currency_symbol: false,
      hide_decimal_characters: false,
      use_international_currency_symbol: true,
    });

    expect(control?.getValue()).to.equal('001');

    element.edit({
      hide_currency_symbol: false,
      hide_decimal_characters: false,
      use_international_currency_symbol: false,
    });

    expect(control?.getValue()).to.equal('000');

    element.edit({
      hide_currency_symbol: true,
      hide_decimal_characters: true,
      use_international_currency_symbol: true,
    });

    expect(control?.getValue()).to.equal('111');

    element.edit({
      hide_currency_symbol: false,
      hide_decimal_characters: true,
      use_international_currency_symbol: true,
    });

    expect(control?.getValue()).to.equal('011');

    element.edit({
      hide_currency_symbol: false,
      hide_decimal_characters: true,
      use_international_currency_symbol: false,
    });

    expect(control?.getValue()).to.equal('010');
  });

  it('renders a summary control for Legacy API section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="legacy-api"]'
    );

    expect(control).to.exist;
  });

  it('renders a password control for the legacy api key inside of the Legacy API section (JSON keys)', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector<InternalPasswordControl>(
      '[infer="legacy-api"] foxy-internal-password-control[infer="webhook-key-api-legacy"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('show-generator');
    expect(control).to.have.deep.property('generatorOptions', { length: 32, separator: '' });

    element.edit({ webhook_key: JSON.stringify({ api_legacy: 'test' }) });
    expect(control?.getValue()).to.equal('test');

    control?.setValue('foo');
    expect(element).to.have.nested.property(
      'form.webhook_key',
      JSON.stringify({ api_legacy: 'foo' })
    );
  });

  it('renders a password control for the legacy api key inside of the Legacy API section (string key)', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector<InternalPasswordControl>(
      '[infer="legacy-api"] foxy-internal-password-control[infer="webhook-key-api-legacy"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('show-generator');
    expect(control).to.have.deep.property('generatorOptions', { length: 32, separator: '' });

    element.edit({ webhook_key: 'test' });
    expect(control?.getValue()).to.equal('test');

    control?.setValue('foo');
    expect(element).to.have.nested.property(
      'form.webhook_key',
      JSON.stringify({ cart_signing: 'test', xml_datafeed: 'test', api_legacy: 'foo', sso: 'test' })
    );
  });

  it('renders a summary control for Emails section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="emails"]'
    );

    expect(control).to.exist;
  });

  it('renders a text control for "from" email in the Emails section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-store-form>
    `);

    const control = element.renderRoot.querySelector('[infer="emails"] [infer="from-email"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');

    element.edit({ store_email: 'a@test.com,b@test.com' });
    await element.requestUpdate();
    expect(control).to.have.attribute('placeholder', 'a@test.com');

    element.edit({ store_email: '' });
    await element.requestUpdate();
    expect(control).to.have.attribute('placeholder', 'emails.from-email.placeholder');
  });

  it('renders a switch control for "Use Email DNS" setting in the Emails section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector('[infer="emails"] [infer="use-email-dns"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSwitchControl);
    expect(control).to.have.attribute('helper-text-as-tooltip');
  });

  it('renders a switch control for "Use SMTP Config" setting in the Emails section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector('[infer="emails"] [infer="use-smtp-config"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSwitchControl);
    expect(control).to.have.attribute('helper-text-as-tooltip');
  });

  it('renders a text control for SMTP host in the Emails section when "Use SMTP Config" is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalTextControl>(
        '[infer="emails"] [infer="smtp-config-host"]'
      )
    ).to.not.exist;

    element.edit({
      smtp_config: JSON.stringify({
        enabled: true,
        host: 'test.com',
        port: '123',
        username: 'test',
        password: 'test',
        security: 'ssl',
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalTextControl>(
      '[infer="emails"] [infer="smtp-config-host"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control?.getValue()).to.equal('test.com');

    control?.setValue('foo.bar');
    expect(JSON.parse(element.form.smtp_config!)).to.have.property('host', 'foo.bar');
  });

  it('renders a number control for SMTP port in the Emails section when "Use SMTP Config" is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalNumberControl>(
        '[infer="emails"] [infer="smtp-config-port"]'
      )
    ).to.not.exist;

    element.edit({
      smtp_config: JSON.stringify({
        enabled: true,
        host: 'test.com',
        port: '123',
        username: 'test',
        password: 'test',
        security: 'ssl',
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalNumberControl>(
      '[infer="emails"] [infer="smtp-config-port"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalNumberControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('step', '1');
    expect(control).to.have.attribute('min', '0');
    expect(control?.getValue()).to.equal(123);

    control?.setValue(456);
    expect(JSON.parse(element.form.smtp_config!)).to.have.property('port', '456');
  });

  it('renders a text control for SMTP username in the Emails section when "Use SMTP Config" is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalTextControl>(
        '[infer="emails"] [infer="smtp-config-username"]'
      )
    ).to.not.exist;

    element.edit({
      smtp_config: JSON.stringify({
        enabled: true,
        host: 'test.com',
        port: '123',
        username: 'test',
        password: 'test',
        security: 'ssl',
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalTextControl>(
      '[infer="emails"] [infer="smtp-config-username"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control?.getValue()).to.equal('test');

    control?.setValue('foo');
    expect(JSON.parse(element.form.smtp_config!)).to.have.property('username', 'foo');
  });

  it('renders a password control for SMTP password in the Emails section when "Use SMTP Config" is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalPasswordControl>(
        '[infer="emails"] [infer="smtp-config-password"]'
      )
    ).to.not.exist;

    element.edit({
      smtp_config: JSON.stringify({
        enabled: true,
        host: 'test.com',
        port: '123',
        username: 'test',
        password: 'test',
        security: 'ssl',
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalPasswordControl>(
      '[infer="emails"] [infer="smtp-config-password"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalPasswordControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control?.getValue()).to.equal('test');

    control?.setValue('foo');
    expect(JSON.parse(element.form.smtp_config!)).to.have.property('password', 'foo');
  });

  it('renders a select control for SMTP security in the Emails section when "Use SMTP Config" is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalSelectControl>(
        '[infer="emails"] [infer="smtp-config-security"]'
      )
    ).to.not.exist;

    element.edit({
      smtp_config: JSON.stringify({
        enabled: true,
        host: 'test.com',
        port: '123',
        username: 'test',
        password: 'test',
        security: 'ssl',
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalSelectControl>(
      '[infer="emails"] [infer="smtp-config-security"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control?.getValue()).to.equal('ssl');
    expect(control).to.have.deep.property('options', [
      { label: 'option_ssl', value: 'ssl' },
      { label: 'option_tls', value: 'tls' },
      { label: 'option_none', value: '' },
    ]);

    control?.setValue('tls');
    expect(JSON.parse(element.form.smtp_config!)).to.have.property('security', 'tls');
  });

  it('renders a summary control for Shipping section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="shipping"]'
    );

    expect(control).to.exist;
  });

  it('renders a select control for shipping address type in the Shipping section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}></foxy-store-form>
    `);

    await new Form.API(element).fetch('https://demo.api/hapi/property_helpers/5', {
      method: 'PATCH',
      body: JSON.stringify({
        values: {
          residential: 'Rate as Residential',
          commercial: 'Rate as Commercial',
          determine_by_company: 'Rate based on Company field',
        },
      }),
    });

    element.shippingAddressTypes = 'https://demo.api/hapi/property_helpers/5';
    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalSelectControl>(
      '[infer="shipping"] [infer="shipping-address-type"]'
    );

    await waitUntil(() => !!control?.options.length, '', { timeout: 5000 });
    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('options', [
      { value: 'residential', rawLabel: 'Rate as Residential' },
      { value: 'commercial', rawLabel: 'Rate as Commercial' },
      { value: 'determine_by_company', rawLabel: 'Rate based on Company field' },
    ]);
  });

  it('renders a switch control for Features Multiship flag in the Shipping section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="shipping"] [infer="features-multiship"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSwitchControl);
    expect(control).to.have.attribute('helper-text-as-tooltip');
  });

  it('renders a switch control for Require Signed Shipping Rates flag in the Shipping section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="shipping"] [infer="require-signed-shipping-rates"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSwitchControl);
    expect(control).to.have.attribute('helper-text-as-tooltip');
  });

  it('renders a summary control for Cart section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-summary-control[infer="cart"]');
    expect(control).to.exist;
  });

  it('renders a frequency control for App Session Time setting in the Cart section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector<InternalFrequencyControl>(
      '[infer="cart"] [infer="app-session-time"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalFrequencyControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('options', [
      { value: 's', label: 'second' },
      { value: 'm', label: 'minute' },
      { value: 'h', label: 'hour' },
      { value: 'd', label: 'day' },
    ]);

    expect(control?.getValue()).to.equal('12h');

    element.edit({ app_session_time: 45 });
    expect(control?.getValue()).to.equal('45s');

    element.edit({ app_session_time: 45 * 60 });
    expect(control?.getValue()).to.equal('45m');

    element.edit({ app_session_time: 45 * 60 * 60 });
    expect(control?.getValue()).to.equal('45h');

    element.edit({ app_session_time: 45 * 60 * 60 * 24 });
    expect(control?.getValue()).to.equal('45d');

    control?.setValue('45s');
    expect(element).to.have.nested.property('form.app_session_time', 45);

    control?.setValue('45m');
    expect(element).to.have.nested.property('form.app_session_time', 45 * 60);

    control?.setValue('45h');
    expect(element).to.have.nested.property('form.app_session_time', 45 * 60 * 60);

    control?.setValue('45d');
    expect(element).to.have.nested.property('form.app_session_time', 45 * 60 * 60 * 24);
  });

  it('renders a switch control for Products Require Expires Property flag in the Cart section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="cart"] [infer="products-require-expires-property"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSwitchControl);
    expect(control).to.have.attribute('helper-text-as-tooltip');
  });

  it('renders a switch control for Use Cart Validation flag in the Cart section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="cart"] [infer="use-cart-validation"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSwitchControl);
    expect(control).to.have.attribute('helper-text-as-tooltip');
  });

  it('renders a password control for the cart signing key in the Cart section (JSON keys)', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector<InternalPasswordControl>(
      '[infer="cart"] foxy-internal-password-control[infer="webhook-key-cart-signing"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('show-generator');
    expect(control).to.have.deep.property('generatorOptions', { length: 32, separator: '' });

    element.edit({
      webhook_key: JSON.stringify({
        cart_signing: 'test',
        xml_datafeed: 'test',
        api_legacy: 'test',
        sso: 'test',
      }),
    });

    expect(control?.getValue()).to.equal('test');

    control?.setValue('foo');
    expect(element).to.have.nested.property(
      'form.webhook_key',
      JSON.stringify({ cart_signing: 'foo', xml_datafeed: 'test', api_legacy: 'test', sso: 'test' })
    );
  });

  it('renders a password control for the cart signing key in the Cart section (string key)', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector<InternalPasswordControl>(
      '[infer="cart"] foxy-internal-password-control[infer="webhook-key-cart-signing"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('show-generator');
    expect(control).to.have.deep.property('generatorOptions', { length: 32, separator: '' });

    element.edit({ webhook_key: 'test' });
    expect(control?.getValue()).to.equal('test');

    control?.setValue('foo');
    expect(element).to.have.nested.property(
      'form.webhook_key',
      JSON.stringify({ cart_signing: 'foo', xml_datafeed: 'test', api_legacy: 'test', sso: 'test' })
    );
  });

  it('renders a summary control for Checkout section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="checkout"]'
    );

    expect(control).to.exist;
  });

  it('renders a select control for customer password hash type in the Checkout section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}></foxy-store-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="checkout"] [infer="customer-password-hash-type"]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.attribute('layout', 'summary-item');

    await new Form.API(element).fetch('https://demo.api/hapi/property_helpers/9', {
      method: 'PATCH',
      body: JSON.stringify({
        values: {
          concrete5: { description: 'Concrete5', config: 'PASSWORD_SALT' },
          phpass: { description: 'phpass', config: 8 },
        },
      }),
    });

    element.customerPasswordHashTypes = 'https://demo.api/hapi/property_helpers/9';
    await element.requestUpdate();
    await waitUntil(() => !!control.options.length, '', { timeout: 5000 });

    expect(control).to.have.deep.property('options', [
      { value: 'concrete5', rawLabel: 'Concrete5' },
      { value: 'phpass', rawLabel: 'phpass' },
    ]);

    control.setValue('concrete5');
    expect(element).to.have.nested.property('form.customer_password_hash_config', 'PASSWORD_SALT');

    control.setValue('phpass');
    expect(element).to.have.nested.property('form.customer_password_hash_config', 8);
  });

  it('renders a text or a number control for customer password hash config in the Checkout section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}> </foxy-store-form>
    `);

    element.edit({ customer_password_hash_config: 'foo' });
    await element.requestUpdate();
    let control = element.renderRoot.querySelector(
      '[infer="checkout"] [infer="customer-password-hash-config"]'
    );

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');

    element.edit({ customer_password_hash_config: 8 });
    await element.requestUpdate();
    control = element.renderRoot.querySelector(
      '[infer="checkout"] [infer="customer-password-hash-config"]'
    );

    expect(control).to.be.instanceOf(InternalNumberControl);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a password control for UOE password in the Checkout section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector<InternalPasswordControl>(
      '[infer="checkout"] foxy-internal-password-control[infer="unified-order-entry-password"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('show-generator');
  });

  it('renders a switch control for Use Single Sign-On flag in the Checkout section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="checkout"] [infer="use-single-sign-on"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSwitchControl);
  });

  it('renders a text control for SSO URL in the Checkout section when SSO is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    expect(
      element.renderRoot.querySelector<InternalTextControl>(
        '[infer="checkout"] [infer="single-sign-on-url"]'
      )
    ).to.not.exist;

    element.edit({ use_single_sign_on: true });
    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalTextControl>(
      '[infer="checkout"] [infer="single-sign-on-url"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a password control for SSO key in the Checkout section when SSO is enabled (JSON keys)', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    expect(
      element.renderRoot.querySelector<InternalPasswordControl>(
        '[infer="checkout"] [infer="webhook-key-sso"]'
      )
    ).to.not.exist;

    element.edit({
      use_single_sign_on: true,
      webhook_key: JSON.stringify({
        cart_signing: 'test',
        xml_datafeed: 'test',
        api_legacy: 'test',
        sso: 'test',
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalPasswordControl>(
      '[infer="checkout"] [infer="webhook-key-sso"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalPasswordControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('show-generator');
    expect(control).to.have.deep.property('generatorOptions', { length: 32, separator: '' });
    expect(control?.getValue()).to.equal('test');

    control?.setValue('foo');
    expect(element).to.have.nested.property(
      'form.webhook_key',
      JSON.stringify({ cart_signing: 'test', xml_datafeed: 'test', api_legacy: 'test', sso: 'foo' })
    );
  });

  it('renders a password control for SSO key in the Checkout section when SSO is enabled (string key)', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    expect(
      element.renderRoot.querySelector<InternalPasswordControl>(
        '[infer="checkout"] [infer="webhook-key-sso"]'
      )
    ).to.not.exist;

    element.edit({ use_single_sign_on: true, webhook_key: 'test' });
    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalPasswordControl>(
      '[infer="checkout"] [infer="webhook-key-sso"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalPasswordControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('show-generator');
    expect(control).to.have.deep.property('generatorOptions', { length: 32, separator: '' });
    expect(control?.getValue()).to.equal('test');

    control?.setValue('foo');
    expect(element).to.have.nested.property(
      'form.webhook_key',
      JSON.stringify({ cart_signing: 'test', xml_datafeed: 'test', api_legacy: 'test', sso: 'foo' })
    );
  });

  it('renders a summary control for Receipt section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="receipt"]'
    );

    expect(control).to.exist;
  });

  it('renders a text control for Receipt Continue URL setting in the Receipt section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector<InternalTextControl>(
      '[infer="receipt"] [infer="receipt-continue-url"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a switch control for BCC on Receipt Email flag in the Receipt section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="receipt"] [infer="bcc-on-receipt-email"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSwitchControl);
  });

  it('renders a summary control for Custom Display ID Config section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="custom-display-id-config"]'
    );

    expect(control).to.exist;
  });

  it('renders a switch control enabling custom Display ID in the Custom Display ID Config section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="custom-display-id-config"] [infer="custom-display-id-config-enabled"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSwitchControl);
    expect(control?.getValue()).to.be.false;

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: true,
        start: '0',
        length: '0',
        prefix: '',
        suffix: '',
        transaction_journal_entries: {
          enabled: false,
          transaction_separator: '',
          log_detail_request_types: {
            transaction_authcapture: { prefix: '' },
            transaction_capture: { prefix: '' },
            transaction_refund: { prefix: '' },
            transaction_void: { prefix: '' },
          },
        },
      }),
    });

    await element.requestUpdate();
    expect(control?.getValue()).to.be.true;
    control?.setValue(false);
    expect(JSON.parse(element.form.custom_display_id_config!)).to.have.property('enabled', false);
  });

  it('renders a number control for custom Display ID start in the Custom Display ID Config section when Custom Display ID is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalNumberControl>(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-start"]'
      )
    ).to.not.exist;

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: true,
        start: '2',
        length: '0',
        prefix: '',
        suffix: '',
        transaction_journal_entries: {
          enabled: false,
          transaction_separator: '',
          log_detail_request_types: {
            transaction_authcapture: { prefix: '' },
            transaction_capture: { prefix: '' },
            transaction_refund: { prefix: '' },
            transaction_void: { prefix: '' },
          },
        },
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalNumberControl>(
      '[infer="custom-display-id-config"] [infer="custom-display-id-config-start"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalNumberControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('step', '1');
    expect(control).to.have.attribute('min', '0');
    expect(control?.getValue()).to.equal(2);

    control?.setValue(1);
    expect(JSON.parse(element.form.custom_display_id_config!).start).to.equal('1');
  });

  it('renders a number control for custom Display ID length in the Custom Display ID Config section when Custom Display ID is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalNumberControl>(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-length"]'
      )
    ).to.not.exist;

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: true,
        start: '0',
        length: '2',
        prefix: '',
        suffix: '',
        transaction_journal_entries: {
          enabled: false,
          transaction_separator: '',
          log_detail_request_types: {
            transaction_authcapture: { prefix: '' },
            transaction_capture: { prefix: '' },
            transaction_refund: { prefix: '' },
            transaction_void: { prefix: '' },
          },
        },
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalNumberControl>(
      '[infer="custom-display-id-config"] [infer="custom-display-id-config-length"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalNumberControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('step', '1');
    expect(control).to.have.attribute('min', '0');
    expect(control?.getValue()).to.equal(2);

    control?.setValue(1);
    expect(JSON.parse(element.form.custom_display_id_config!).length).to.equal('1');
  });

  it('renders a text control for custom Display ID prefix in the Custom Display ID Config section when Custom Display ID is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalTextControl>(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-prefix"]'
      )
    ).to.not.exist;

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: true,
        start: '0',
        length: '0',
        prefix: 'foo',
        suffix: '',
        transaction_journal_entries: {
          enabled: false,
          transaction_separator: '',
          log_detail_request_types: {
            transaction_authcapture: { prefix: '' },
            transaction_capture: { prefix: '' },
            transaction_refund: { prefix: '' },
            transaction_void: { prefix: '' },
          },
        },
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalTextControl>(
      '[infer="custom-display-id-config"] [infer="custom-display-id-config-prefix"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control?.getValue()).to.equal('foo');

    control?.setValue('bar');
    expect(JSON.parse(element.form.custom_display_id_config!).prefix).to.equal('bar');
  });

  it('renders a text control for custom Display ID suffix in the Custom Display ID Config section when Custom Display ID is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalTextControl>(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-suffix"]'
      )
    ).to.not.exist;

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: true,
        start: '0',
        length: '0',
        prefix: '',
        suffix: 'foo',
        transaction_journal_entries: {
          enabled: false,
          transaction_separator: '',
          log_detail_request_types: {
            transaction_authcapture: { prefix: '' },
            transaction_capture: { prefix: '' },
            transaction_refund: { prefix: '' },
            transaction_void: { prefix: '' },
          },
        },
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalTextControl>(
      '[infer="custom-display-id-config"] [infer="custom-display-id-config-suffix"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control?.getValue()).to.equal('foo');

    control?.setValue('bar');
    expect(JSON.parse(element.form.custom_display_id_config!).suffix).to.equal('bar');
  });

  it('renders examples in the Custom Display ID Config section when Custom Display ID is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalTextControl>(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-first-example"]'
      )
    ).to.not.exist;

    expect(
      element.renderRoot.querySelector<InternalTextControl>(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-random-example"]'
      )
    ).to.not.exist;

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: true,
        start: '8',
        length: '12',
        prefix: 'FOO-',
        suffix: '-BAR',
        transaction_journal_entries: {
          enabled: false,
          transaction_separator: '',
          log_detail_request_types: {
            transaction_authcapture: { prefix: '' },
            transaction_capture: { prefix: '' },
            transaction_refund: { prefix: '' },
            transaction_void: { prefix: '' },
          },
        },
      }),
    });

    await element.requestUpdate();

    const firstExample = element.renderRoot.querySelector(
      '[infer="custom-display-id-config"] [key="custom-display-id-config-first-example"]'
    );

    const randomExample = element.renderRoot.querySelector(
      '[infer="custom-display-id-config"] [key="custom-display-id-config-random-example"]'
    );

    expect(firstExample).to.exist;
    expect(firstExample).to.be.instanceOf(I18n);
    expect(firstExample).to.have.attribute('infer', '');
    expect(firstExample?.nextElementSibling?.textContent?.trim()).to.equal('FOO-0008-BAR');

    expect(randomExample).to.exist;
    expect(randomExample).to.be.instanceOf(I18n);
    expect(randomExample).to.have.attribute('infer', '');

    const randomExampleText = randomExample?.nextElementSibling?.textContent?.trim();
    const randomExamplePrefix = randomExampleText?.split('-')[0];
    const randomExampleId = randomExampleText?.split('-')[1];
    const randomExampleSuffix = randomExampleText?.split('-')[2];

    expect(randomExamplePrefix).to.equal('FOO');
    expect(parseInt(randomExampleId as string)).to.be.greaterThanOrEqual(8);
    expect(randomExampleId).to.have.length(4);
    expect(randomExampleSuffix).to.equal('BAR');
  });

  it('renders a switch control enabling custom Transaction Journal Display ID in the Custom Display ID Config section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-enabled"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSwitchControl);
    expect(control?.getValue()).to.be.false;

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: false,
        start: '0',
        length: '0',
        prefix: '',
        suffix: '',
        transaction_journal_entries: {
          enabled: true,
          transaction_separator: '',
          log_detail_request_types: {
            transaction_authcapture: { prefix: '' },
            transaction_capture: { prefix: '' },
            transaction_refund: { prefix: '' },
            transaction_void: { prefix: '' },
          },
        },
      }),
    });

    await element.requestUpdate();
    expect(control?.getValue()).to.be.true;
    control?.setValue(false);
    expect(JSON.parse(element.form.custom_display_id_config!).transaction_journal_entries.enabled)
      .to.be.false;
  });

  it('renders a text control for authcapture prefix in the Custom Display ID Config section when Custom Transaction Journal Display ID is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalTextControl>(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-authcapture-prefix"]'
      )
    ).to.not.exist;

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: false,
        start: '0',
        length: '0',
        prefix: '',
        suffix: '',
        transaction_journal_entries: {
          enabled: true,
          transaction_separator: '',
          log_detail_request_types: {
            transaction_authcapture: { prefix: 'foo' },
            transaction_capture: { prefix: '' },
            transaction_refund: { prefix: '' },
            transaction_void: { prefix: '' },
          },
        },
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalTextControl>(
      '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-authcapture-prefix"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control?.getValue()).to.equal('foo');

    control?.setValue('bar');
    expect(
      JSON.parse(element.form.custom_display_id_config!).transaction_journal_entries
        .log_detail_request_types.transaction_authcapture.prefix
    ).to.equal('bar');
  });

  it('renders a text control for capture prefix in the Custom Display ID Config section when Custom Transaction Journal Display ID is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalTextControl>(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-capture-prefix"]'
      )
    ).to.not.exist;

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: false,
        start: '0',
        length: '0',
        prefix: '',
        suffix: '',
        transaction_journal_entries: {
          enabled: true,
          transaction_separator: '',
          log_detail_request_types: {
            transaction_authcapture: { prefix: '' },
            transaction_capture: { prefix: 'foo' },
            transaction_refund: { prefix: '' },
            transaction_void: { prefix: '' },
          },
        },
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalTextControl>(
      '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-capture-prefix"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control?.getValue()).to.equal('foo');

    control?.setValue('bar');
    expect(
      JSON.parse(element.form.custom_display_id_config!).transaction_journal_entries
        .log_detail_request_types.transaction_capture.prefix
    ).to.equal('bar');
  });

  it('renders a text control for void prefix in the Custom Display ID Config section when Custom Transaction Journal Display ID is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalTextControl>(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-void-prefix"]'
      )
    ).to.not.exist;

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: false,
        start: '0',
        length: '0',
        prefix: '',
        suffix: '',
        transaction_journal_entries: {
          enabled: true,
          transaction_separator: '',
          log_detail_request_types: {
            transaction_authcapture: { prefix: '' },
            transaction_capture: { prefix: '' },
            transaction_refund: { prefix: '' },
            transaction_void: { prefix: 'foo' },
          },
        },
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalTextControl>(
      '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-void-prefix"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control?.getValue()).to.equal('foo');

    control?.setValue('bar');
    expect(
      JSON.parse(element.form.custom_display_id_config!).transaction_journal_entries
        .log_detail_request_types.transaction_void.prefix
    ).to.equal('bar');
  });

  it('renders a text control for refund prefix in the Custom Display ID Config section when Custom Transaction Journal Display ID is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalTextControl>(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-refund-prefix"]'
      )
    ).to.not.exist;

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: false,
        start: '0',
        length: '0',
        prefix: '',
        suffix: '',
        transaction_journal_entries: {
          enabled: true,
          transaction_separator: '',
          log_detail_request_types: {
            transaction_authcapture: { prefix: '' },
            transaction_capture: { prefix: '' },
            transaction_refund: { prefix: 'foo' },
            transaction_void: { prefix: '' },
          },
        },
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalTextControl>(
      '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-log-detail-request-types-transaction-refund-prefix"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control?.getValue()).to.equal('foo');

    control?.setValue('bar');
    expect(
      JSON.parse(element.form.custom_display_id_config!).transaction_journal_entries
        .log_detail_request_types.transaction_refund.prefix
    ).to.equal('bar');
  });

  it('renders a text control for transaction separator in the Custom Display ID Config section when Custom Transaction Journal Display ID is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector<InternalTextControl>(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-transaction-separator"]'
      )
    ).to.not.exist;

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: false,
        start: '0',
        length: '0',
        prefix: '',
        suffix: '',
        transaction_journal_entries: {
          enabled: true,
          transaction_separator: 'foo',
          log_detail_request_types: {
            transaction_authcapture: { prefix: '' },
            transaction_capture: { prefix: '' },
            transaction_refund: { prefix: '' },
            transaction_void: { prefix: '' },
          },
        },
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalTextControl>(
      '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-transaction-separator"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control?.getValue()).to.equal('foo');

    control?.setValue('bar');
    expect(
      JSON.parse(element.form.custom_display_id_config!).transaction_journal_entries
        .transaction_separator
    ).to.equal('bar');
  });

  it('renders examples in the Custom Display ID Config section when Custom Transaction Journal Display ID is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    expect(
      element.renderRoot.querySelector(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-authcapture-example"]'
      )
    ).to.not.exist;

    expect(
      element.renderRoot.querySelector(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-capture-example"]'
      )
    ).to.not.exist;

    expect(
      element.renderRoot.querySelector(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-void-example"]'
      )
    ).to.not.exist;

    expect(
      element.renderRoot.querySelector(
        '[infer="custom-display-id-config"] [infer="custom-display-id-config-transaction-journal-entries-refund-example"]'
      )
    ).to.not.exist;

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: true,
        start: '8',
        length: '12',
        prefix: 'FOO-',
        suffix: '-BAR',
        transaction_journal_entries: {
          enabled: true,
          transaction_separator: '|',
          log_detail_request_types: {
            transaction_authcapture: { prefix: 'AU-' },
            transaction_capture: { prefix: 'CA-' },
            transaction_refund: { prefix: 'RE-' },
            transaction_void: { prefix: 'VO-' },
          },
        },
      }),
    });

    await element.requestUpdate();

    const authcaptureExample = element.renderRoot.querySelector(
      '[infer="custom-display-id-config"] [key="custom-display-id-config-transaction-journal-entries-authcapture-example"]'
    );

    const captureExample = element.renderRoot.querySelector(
      '[infer="custom-display-id-config"] [key="custom-display-id-config-transaction-journal-entries-capture-example"]'
    );

    const voidExample = element.renderRoot.querySelector(
      '[infer="custom-display-id-config"] [key="custom-display-id-config-transaction-journal-entries-void-example"]'
    );

    const refundExample = element.renderRoot.querySelector(
      '[infer="custom-display-id-config"] [key="custom-display-id-config-transaction-journal-entries-refund-example"]'
    );

    expect(authcaptureExample).to.exist;
    expect(authcaptureExample).to.be.instanceOf(I18n);
    expect(authcaptureExample).to.have.attribute('infer', '');
    expect(authcaptureExample?.nextElementSibling?.textContent?.trim()).to.match(
      /FOO-\d{4}-BAR\|AU-\d{3}/
    );

    expect(captureExample).to.exist;
    expect(captureExample).to.be.instanceOf(I18n);
    expect(captureExample).to.have.attribute('infer', '');
    expect(captureExample?.nextElementSibling?.textContent?.trim()).to.match(
      /FOO-\d{4}-BAR\|CA-\d{3}/
    );

    expect(voidExample).to.exist;
    expect(voidExample).to.be.instanceOf(I18n);
    expect(voidExample).to.have.attribute('infer', '');
    expect(voidExample?.nextElementSibling?.textContent?.trim()).to.match(
      /FOO-\d{4}-BAR\|VO-\d{3}/
    );

    expect(refundExample).to.exist;
    expect(refundExample).to.be.instanceOf(I18n);
    expect(refundExample).to.have.attribute('infer', '');
    expect(refundExample?.nextElementSibling?.textContent?.trim()).to.match(
      /FOO-\d{4}-BAR\|RE-\d{3}/
    );
  });

  it('renders a summary control for XML Datafeed settings', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="xml-datafeed"]'
    );

    expect(control).to.exist;
  });

  it('renders a switch for Use Webhook flag in the XML Datafeed section', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    const control = element.renderRoot.querySelector(
      '[infer="xml-datafeed"] [infer="use-webhook"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSwitchControl);
  });

  it('renders a text control for Webhook URL in the XML Datafeed section when Use Webhook is enabled', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    expect(
      element.renderRoot.querySelector<InternalTextControl>(
        '[infer="xml-datafeed"] [infer="webhook-url"]'
      )
    ).to.not.exist;

    element.edit({ use_webhook: true });
    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalTextControl>(
      '[infer="xml-datafeed"] [infer="webhook-url"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a password control for XML Datafeed key in the XML Datafeed section when Use Webhook is enabled (JSON keys)', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    expect(
      element.renderRoot.querySelector<InternalPasswordControl>(
        '[infer="xml-datafeed"] [infer="webhook-key-xml-datafeed"]'
      )
    ).to.not.exist;

    element.edit({
      use_webhook: true,
      webhook_key: JSON.stringify({
        cart_signing: 'test',
        xml_datafeed: 'test',
        api_legacy: 'test',
        sso: 'test',
      }),
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalPasswordControl>(
      '[infer="xml-datafeed"] [infer="webhook-key-xml-datafeed"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalPasswordControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('show-generator');
    expect(control).to.have.deep.property('generatorOptions', { length: 32, separator: '' });
    expect(control?.getValue()).to.equal('test');

    control?.setValue('foo');
    expect(element).to.have.nested.property(
      'form.webhook_key',
      JSON.stringify({ cart_signing: 'test', xml_datafeed: 'foo', api_legacy: 'test', sso: 'test' })
    );
  });

  it('renders a password control for XML Datafeed key in the XML Datafeed section when Use Webhook is enabled (string key)', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    expect(
      element.renderRoot.querySelector<InternalPasswordControl>(
        '[infer="xml-datafeed"] [infer="webhook-key-xml-datafeed"]'
      )
    ).to.not.exist;

    element.edit({ use_webhook: true, webhook_key: 'test' });
    await element.requestUpdate();
    const control = element.renderRoot.querySelector<InternalPasswordControl>(
      '[infer="xml-datafeed"] [infer="webhook-key-xml-datafeed"]'
    );

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalPasswordControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('show-generator');
    expect(control).to.have.deep.property('generatorOptions', { length: 32, separator: '' });
    expect(control?.getValue()).to.equal('test');

    control?.setValue('foo');
    expect(element).to.have.nested.property(
      'form.webhook_key',
      JSON.stringify({ cart_signing: 'test', xml_datafeed: 'foo', api_legacy: 'test', sso: 'test' })
    );
  });

  it('renders default slot', async () => {
    const element = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    expect(element.renderRoot.querySelector('slot:not([name])')).to.exist;
  });

  it('renders a hCaptcha element when hCaptchaSiteKey is set', async () => {
    const form = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);
    let control = form.renderRoot.querySelector('h-captcha');

    expect(control).to.not.exist;
    expect(form.renderRoot.querySelector('[infer="hcaptcha"][key="disclaimer]')).to.not.exist;
    expect(form.renderRoot.querySelector('[infer="hcaptcha"][key="terms_of_service]')).to.not.exist;
    expect(form.renderRoot.querySelector('[infer="hcaptcha"][key="privacy_policy]')).to.not.exist;

    form.hCaptchaSiteKey = '10000000-ffff-ffff-ffff-000000000001';
    form.lang = 'en-AU';
    await form.requestUpdate();
    control = form.renderRoot.querySelector('h-captcha');

    expect(control).to.exist;
    expect(control).to.have.attribute('site-key', '10000000-ffff-ffff-ffff-000000000001');
    expect(control).to.have.attribute('size', 'invisible');
    expect(control).to.have.attribute('hl', 'en-AU');

    const disclaimer = form.renderRoot.querySelector('[infer="hcaptcha"][key="disclaimer"]');
    const terms = form.renderRoot.querySelector('[infer="hcaptcha"][key="terms_of_service"]');
    const termsLink = terms?.closest('a');
    const privacy = form.renderRoot.querySelector('[infer="hcaptcha"][key="privacy_policy"]');
    const privacyLink = privacy?.closest('a');

    expect(disclaimer).to.exist;
    expect(terms).to.exist;
    expect(privacy).to.exist;

    expect(termsLink).to.have.attribute('href', 'https://www.hcaptcha.com/terms');
    expect(termsLink).to.have.attribute('target', '_blank');
    expect(termsLink).to.have.attribute('rel', 'noopener noreferrer');

    expect(privacyLink).to.have.attribute('href', 'https://www.hcaptcha.com/privacy');
    expect(privacyLink).to.have.attribute('target', '_blank');
    expect(privacyLink).to.have.attribute('rel', 'noopener noreferrer');
  });

  it('includes hCaptcha token on submission when hCaptchaSiteKey is set', async () => {
    const VerifiedEvent = class extends CustomEvent<unknown> {
      token = '456';

      eKey = '789';
    };

    const form = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    form.hCaptchaSiteKey = '10000000-ffff-ffff-ffff-000000000001';
    form.edit({
      store_name: 'Test Store',
      store_domain: 'teststore',
      store_email: 'test@example.com',
      store_url: 'https://example.com',
      postal_code: '012345',
      country: 'US',
      region: 'TX',
    });

    await form.requestUpdate();

    const captcha = form.renderRoot.querySelector('h-captcha') as VanillaHCaptchaWebComponent;
    stub(captcha, 'reset').resolves();
    stub(captcha, 'execute').callsFake(() => {
      captcha.dispatchEvent(new VerifiedEvent('verified'));
    });

    const whenFetchIsFired = oneEvent(form, 'fetch');
    form.submit();
    const evt = (await whenFetchIsFired) as unknown as FetchEvent;
    evt.preventDefault();

    const headers = evt.request.headers;
    expect(headers.get('h-captcha-code')).to.equal('456');
  });

  it('submits without hCaptcha token when hCaptchaSiteKey is not set', async () => {
    const form = await fixture<Form>(html`<foxy-store-form></foxy-store-form>`);

    form.edit({
      store_name: 'Test Store',
      store_domain: 'teststore',
      store_email: 'test@example.com',
      store_url: 'https://example.com',
      postal_code: '012345',
      country: 'US',
      region: 'TX',
    });

    await form.requestUpdate();

    const whenFetchIsFired = oneEvent(form, 'fetch');
    form.submit();
    const evt = (await whenFetchIsFired) as unknown as FetchEvent;
    evt.preventDefault();

    const headers = evt.request.headers;
    expect(headers.get('h-captcha-code')).to.be.null;
  });
});
