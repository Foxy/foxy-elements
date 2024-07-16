import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalAsyncComboBoxControl } from '../../internal/InternalAsyncComboBoxControl/InternalAsyncComboBoxControl';
import { InternalCheckboxGroupControl } from '../../internal/InternalCheckboxGroupControl/InternalCheckboxGroupControl';
import { InternalEditableListControl } from '../../internal/InternalEditableListControl/InternalEditableListControl';
import { InternalRadioGroupControl } from '../../internal/InternalRadioGroupControl/InternalRadioGroupControl';
import { InternalFrequencyControl } from '../../internal/InternalFrequencyControl/InternalFrequencyControl';
import { InternalPasswordControl } from '../../internal/InternalPasswordControl/InternalPasswordControl';
import { InternalIntegerControl } from '../../internal/InternalIntegerControl/InternalIntegerControl';
import { InternalNumberControl } from '../../internal/InternalNumberControl/InternalNumberControl';
import { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { StoreForm as Form } from './StoreForm';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { I18n } from '../I18n/I18n';
import { getByKey } from '../../../testgen/getByKey';
import { getByTag } from '../../../testgen/getByTag';
import { getByTestId } from '../../../testgen/getByTestId';
import { stub } from 'sinon';
import { set } from 'lodash-es';

describe('StoreForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines vaadin-button', () => {
    expect(customElements.get('vaadin-button')).to.exist;
  });

  it('imports and defines foxy-internal-checkbox-group-control', () => {
    const element = customElements.get('foxy-internal-checkbox-group-control');
    expect(element).to.equal(InternalCheckboxGroupControl);
  });

  it('imports and defines foxy-internal-async-combo-box-control', () => {
    const element = customElements.get('foxy-internal-async-combo-box-control');
    expect(element).to.equal(InternalAsyncComboBoxControl);
  });

  it('imports and defines foxy-internal-editable-list-control', () => {
    const element = customElements.get('foxy-internal-editable-list-control');
    expect(element).to.equal(InternalEditableListControl);
  });

  it('imports and defines foxy-internal-radio-group-control', () => {
    const element = customElements.get('foxy-internal-radio-group-control');
    expect(element).to.equal(InternalRadioGroupControl);
  });

  it('imports and defines foxy-internal-frequency-control', () => {
    const element = customElements.get('foxy-internal-frequency-control');
    expect(element).to.equal(InternalFrequencyControl);
  });

  it('imports and defines foxy-internal-password-control', () => {
    const element = customElements.get('foxy-internal-password-control');
    expect(element).to.equal(InternalPasswordControl);
  });

  it('imports and defines foxy-internal-integer-control', () => {
    const element = customElements.get('foxy-internal-integer-control');
    expect(element).to.equal(InternalIntegerControl);
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

  it('produces the webhook-url:v8n_required error if legacy webhook is enabled and url is empty', () => {
    const form = new Form();

    form.edit({ use_webhook: false, webhook_url: '' });
    expect(form.errors).to.not.include('webhook-url:v8n_required');

    form.edit({ use_webhook: true, webhook_url: '' });
    expect(form.errors).to.include('webhook-url:v8n_required');

    form.edit({ use_webhook: true, webhook_url: 'https://example.com' });
    expect(form.errors).to.not.include('webhook-url:v8n_required');
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
    expect(form.errors).to.not.include('webhook-url:v8n_required');

    form.edit({ use_webhook: true, webhook_key: '' });
    expect(form.errors).to.include('webhook-url:v8n_required');
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

  it('produces the custom-display-id-config-enabled:v8n_too_long error if custom display id config is longer than 100 characters', () => {
    const form = new Form();

    form.edit({ custom_display_id_config: 'A'.repeat(101) });
    expect(form.errors).to.include('custom-display-id-config-enabled:v8n_too_long');

    form.edit({ custom_display_id_config: 'A'.repeat(100) });
    expect(form.errors).to.not.include('custom-display-id-config-enabled:v8n_too_long');
  });

  it('renders a form header', () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders a text control for store name', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="store-name"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text control for logo url', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="logo-url"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text control for store domain', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="store-domain"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);

    element.edit({ use_remote_domain: false, store_domain: 'test' });
    await element.requestUpdate();

    expect(control).to.have.attribute('helper-text', 'store-domain.helper_text');
    expect(control).to.have.attribute('suffix', '.foxycart.com');

    element.edit({ use_remote_domain: true, store_domain: 'test.com' });
    await element.requestUpdate();

    expect(control).to.have.attribute('helper-text', 'store-domain.custom_domain_note');
    expect(control).to.have.attribute('suffix', '');

    control.setValue('test');
    expect(element).to.have.nested.property('form.use_remote_domain', false);
    expect(element).to.have.nested.property('form.store_domain', 'test');

    control.setValue('test.com');
    expect(element).to.have.nested.property('form.use_remote_domain', true);
    expect(element).to.have.nested.property('form.store_domain', 'test.com');
  });

  it('renders a text control for store url', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="store-url"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders an editable list control for store email', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="store-email"]'
    ) as InternalEditableListControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalEditableListControl);

    control.setValue([{ value: 'a@b.c' }, { value: 'd@e.f' }]);
    expect(element).to.have.nested.property('form.store_email', 'a@b.c,d@e.f');

    element.edit({ store_email: 'test1@example.com,test2@example.com' });
    expect(control.getValue()).to.deep.equal([
      { value: 'test1@example.com' },
      { value: 'test2@example.com' },
    ]);
  });

  it('renders a select control for timezone', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="timezone"]') as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);

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
    await waitUntil(() => !!control.options.length, '', { timeout: 5000 });

    expect(control).to.have.deep.property('options', [
      {
        value: 'America/Los_Angeles',
        label: '(GMT-08:00) Pacific Time (US and Canada)',
      },
      {
        value: 'America/Denver',
        label: '(GMT-07:00) Mountain Time (US and Canada)',
      },
    ]);
  });

  it('renders an async combo box control for store version', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="store-version-uri"]'
    ) as InternalAsyncComboBoxControl;

    element.data!.store_version_uri = '';
    element.data = { ...element.data! };
    await element.requestUpdate();

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalAsyncComboBoxControl);
    expect(control).to.have.attribute('item-label-path', 'version');
    expect(control).to.have.attribute('item-value-path', '_links.self.href');
    expect(control).to.not.have.attribute('first');
    expect(control).to.have.property('selectedItem', null);

    element.storeVersions = 'https://demo.api/hapi/store_versions';
    await element.requestUpdate();

    expect(control).to.have.attribute('first', 'https://demo.api/hapi/store_versions');

    element.edit({ store_version_uri: 'https://demo.api/hapi/store_versions/0' });
    const storeVersion = await getTestData('./hapi/store_versions/0', router);
    await element.requestUpdate();
    await waitUntil(() => !!control.selectedItem, '', { timeout: 5000 });

    expect(control).to.have.deep.property('selectedItem', storeVersion);
  });

  it('renders a text control for "from" email', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="from-email"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);

    element.edit({ store_email: 'a@test.com,b@test.com' });
    await element.requestUpdate();
    expect(control).to.have.attribute('placeholder', 'a@test.com');

    element.edit({ store_email: '' });
    await element.requestUpdate();
    expect(control).to.have.attribute('placeholder', 'from-email.placeholder');
  });

  it('renders a checkbox for the "bcc_on_receipt_email" flag', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector<InternalCheckboxGroupControl>(
      '[infer="bcc-on-receipt-email"]'
    );

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_checked', value: 'checked' },
    ]);

    element.edit({ bcc_on_receipt_email: false });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal([]);

    element.edit({ bcc_on_receipt_email: true });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['checked']);
  });

  it('renders a checkbox for the "use_email_dns" flag', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="use-email-dns"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_checked', value: 'checked' },
    ]);

    element.edit({ use_email_dns: false });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal([]);

    element.edit({ use_email_dns: true });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['checked']);
  });

  it('renders a warning when "use_email_dns" is enabled', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    expect(await getByKey(element, 'use_email_dns_helper_text')).to.not.exist;

    element.data = { ...element.data!, use_email_dns: false };
    element.edit({ use_email_dns: true });
    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      '[infer="use-email-dns"]'
    ) as InternalCheckboxGroupControl;

    const warning = control.nextElementSibling as HTMLDivElement;
    const warningText = await getByKey(warning, 'use_email_dns_helper_text');
    const warningLink = await getByTag(warning, 'a');

    expect(warningText).to.exist;
    expect(warningText).to.have.attribute('infer', '');

    expect(warningLink).to.exist;
    expect(warningLink).to.include.text('How Emails Are Sent (SPF, DKIM, DMARC, etc.)');
    expect(warningLink).to.have.attribute(
      'href',
      'https://wiki.foxycart.com/v/1.1/emails#how_emails_are_sent_spf_dkim_dmarc_etc'
    );
  });

  it('hides the email dns warning when "use-email-dns" checkbox is hidden', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        hiddencontrols="use-email-dns"
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    expect(await getByKey(element, 'use_email_dns_helper_text')).to.not.exist;

    element.data = { ...element.data!, use_email_dns: false };
    element.edit({ use_email_dns: true });
    await element.requestUpdate();
    expect(await getByKey(element, 'use_email_dns_helper_text')).to.not.exist;
  });

  it('renders a checkbox for smtp_config', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="use-smtp-config"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_checked', value: 'checked' },
    ]);

    element.edit({ smtp_config: '' });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal([]);

    element.edit({
      smtp_config: JSON.stringify({
        username: '',
        password: '',
        security: '',
        host: '',
        port: '',
      }),
    });

    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['checked']);
  });

  it('renders smtp config fields when "smtp_config" is not empty', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    element.data = { ...element.data!, smtp_config: '' };
    await element.requestUpdate();

    ['host', 'port', 'username', 'password', 'security'].forEach(prop => {
      const control = element.renderRoot.querySelector(`[infer="smtp-config-${prop}"]`);
      expect(control).to.not.exist;
    });

    element.edit({
      smtp_config: JSON.stringify({
        username: '',
        password: '',
        security: '',
        host: '',
        port: '',
      }),
    });

    await element.requestUpdate();

    const $ = (selector: string) => element.renderRoot.querySelector(selector);
    const hostControl = $('[infer="smtp-config-host"]') as InternalTextControl;
    const portControl = $('[infer="smtp-config-port"]') as InternalIntegerControl;
    const usernameControl = $('[infer="smtp-config-username"]') as InternalTextControl;
    const passwordControl = $('[infer="smtp-config-password"]') as InternalPasswordControl;
    const securityControl = $('[infer="smtp-config-security"]') as InternalRadioGroupControl;

    expect(hostControl).to.be.instanceOf(InternalTextControl);
    hostControl.setValue('test.host');
    expect(JSON.parse(element.form.smtp_config!)).to.have.property('host', 'test.host');
    expect(hostControl.getValue()).to.equal('test.host');

    expect(portControl).to.be.instanceOf(InternalIntegerControl);
    portControl.setValue(1234);
    expect(JSON.parse(element.form.smtp_config!)).to.have.property('port', 1234);
    expect(portControl.getValue()).to.equal(1234);

    expect(usernameControl).to.be.instanceOf(InternalTextControl);
    usernameControl.setValue('test-user');
    expect(JSON.parse(element.form.smtp_config!)).to.have.property('username', 'test-user');
    expect(usernameControl.getValue()).to.equal('test-user');

    expect(passwordControl).to.be.instanceOf(InternalPasswordControl);
    passwordControl.setValue('testpw');
    expect(JSON.parse(element.form.smtp_config!)).to.have.property('password', 'testpw');
    expect(passwordControl.getValue()).to.equal('testpw');

    expect(securityControl).to.be.instanceOf(InternalRadioGroupControl);
    expect(securityControl).to.have.deep.property('options', [
      { label: 'option_ssl', value: 'ssl' },
      { label: 'option_tls', value: 'tls' },
      { label: 'option_none', value: '' },
    ]);

    securityControl.setValue('ssl');
    expect(JSON.parse(element.form.smtp_config!)).to.have.property('security', 'ssl');
    expect(securityControl.getValue()).to.equal('ssl');
  });

  it('renders a select control for country', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="country"]') as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);

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
    await waitUntil(() => !!control.options.length, '', { timeout: 5000 });

    expect(control).to.have.deep.property('options', [
      { value: 'GB', label: 'United Kingdom' },
      { value: 'US', label: 'United States' },
    ]);
  });

  it('renders a select control for region', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="region"]') as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);

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

    element.regions = 'https://demo.api/hapi/property_helpers/4';
    await waitUntil(() => !!control.options.length, '', { timeout: 5000 });

    expect(control).to.have.deep.property('options', [
      { value: 'SD', label: 'South Dakota' },
      { value: 'TN', label: 'Tennessee' },
    ]);
  });

  it('renders a text control for postal code', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="postal-code"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a select control for shipping address type', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="shipping-address-type"]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);

    await new Form.API(element).fetch('https://demo.api/hapi/property_helpers/5', {
      method: 'PATCH',
      body: JSON.stringify({
        values: {
          residential: 'Rate as Residential',
          commercial: 'Rate as Commercial',
        },
      }),
    });

    element.shippingAddressTypes = 'https://demo.api/hapi/property_helpers/5';
    await waitUntil(() => !!control.options.length, '', { timeout: 5000 });

    expect(control).to.have.deep.property('options', [
      { value: 'residential', label: 'Rate as Residential' },
      { value: 'commercial', label: 'Rate as Commercial' },
    ]);
  });

  it('renders a checkbox for the "features_multiship" flag', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="features-multiship"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_checked', value: 'checked' },
    ]);

    element.edit({ features_multiship: false });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal([]);

    element.edit({ features_multiship: true });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['checked']);
  });

  it('renders a checkbox for the "require_signed_shipping_rates" flag', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="require-signed-shipping-rates"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_checked', value: 'checked' },
    ]);

    element.edit({ require_signed_shipping_rates: false });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal([]);

    element.edit({ require_signed_shipping_rates: true });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['checked']);
  });

  it('renders a warning when "require_signed_shipping_rates" is enabled', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    expect(await getByKey(element, 'require_signed_shipping_rates_helper_text')).to.not.exist;

    element.data = { ...element.data!, require_signed_shipping_rates: false };
    element.edit({ require_signed_shipping_rates: true });
    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      '[infer="require-signed-shipping-rates"]'
    ) as InternalCheckboxGroupControl;

    const warning = control.nextElementSibling as HTMLDivElement;
    const warningText = await getByKey(warning, 'require_signed_shipping_rates_helper_text');

    expect(warningText).to.exist;
    expect(warningText).to.have.attribute('infer', '');
  });

  it('renders a select control for language', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="language"]') as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);

    await new Form.API(element).fetch('https://demo.api/hapi/property_helpers/6', {
      method: 'PATCH',
      body: JSON.stringify({
        values: {
          dutch: 'Dutch',
          english: 'English',
        },
      }),
    });

    element.languages = 'https://demo.api/hapi/property_helpers/6';
    await waitUntil(() => !!control.options.length, '', { timeout: 5000 });

    expect(control).to.have.deep.property('options', [
      { value: 'dutch', label: 'Dutch' },
      { value: 'english', label: 'English' },
    ]);
  });

  it('renders a select control for locale code', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="locale-code"]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);

    await new Form.API(element).fetch('https://demo.api/hapi/property_helpers/7', {
      method: 'PATCH',
      body: JSON.stringify({
        values: {
          en_AU: 'English locale for Australia (Currency: AUD:$)',
          en_BW: 'English locale for Botswana (Currency: BWP:Pu)',
        },
      }),
    });

    element.localeCodes = 'https://demo.api/hapi/property_helpers/7';
    await waitUntil(() => !!control.options.length, '', { timeout: 5000 });

    expect(control).to.have.deep.property('options', [
      { value: 'en_AU', label: 'English locale for Australia (Currency: AUD:$)' },
      { value: 'en_BW', label: 'English locale for Botswana (Currency: BWP:Pu)' },
    ]);
  });

  it('renders currency style selector', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const control = (await getByTestId(element, 'currency-style')) as HTMLDivElement;
    const labels = control.querySelectorAll('label');
    const inputs = control.querySelectorAll<HTMLInputElement>('label input');

    expect(labels).to.have.length(6);

    inputs.forEach(input => {
      expect(input).to.have.attribute('name', 'currency-style');
      expect(input).to.have.attribute('type', 'radio');
      expect(input).to.not.have.attribute('disabled');
      expect(input).to.not.have.attribute('readonly');
    });

    expect(labels[0]).to.include.text('12.34');
    expect(labels[1]).to.include.text('USD 12.34');
    expect(labels[2]).to.include.text('$12.34');
    expect(labels[3]).to.include.text('12');
    expect(labels[4]).to.include.text('USD 12');
    expect(labels[5]).to.include.text('$12');

    element.edit({ hide_currency_symbol: false });
    element.edit({ use_international_currency_symbol: false });
    element.edit({ hide_decimal_characters: false });
    await element.requestUpdate();

    expect(inputs[2]).to.have.attribute('checked');

    element.edit({ hide_currency_symbol: true });
    element.edit({ use_international_currency_symbol: false });
    element.edit({ hide_decimal_characters: false });
    await element.requestUpdate();

    expect(inputs[0]).to.have.attribute('checked');

    element.edit({ hide_currency_symbol: false });
    element.edit({ use_international_currency_symbol: true });
    element.edit({ hide_decimal_characters: false });
    await element.requestUpdate();

    expect(inputs[1]).to.have.attribute('checked');

    element.edit({ hide_currency_symbol: false });
    element.edit({ hide_decimal_characters: false });
    element.edit({ use_international_currency_symbol: true });
    await element.requestUpdate();

    expect(inputs[1]).to.have.attribute('checked');

    element.edit({ hide_currency_symbol: true });
    element.edit({ hide_decimal_characters: false });
    element.edit({ use_international_currency_symbol: true });
    await element.requestUpdate();

    expect(inputs[0]).to.have.attribute('checked');

    element.edit({ hide_currency_symbol: false });
    element.edit({ hide_decimal_characters: true });
    element.edit({ use_international_currency_symbol: true });
    await element.requestUpdate();

    expect(inputs[4]).to.have.attribute('checked');

    element.edit({ hide_currency_symbol: true });
    element.edit({ hide_decimal_characters: true });
    element.edit({ use_international_currency_symbol: true });
    await element.requestUpdate();

    expect(inputs[3]).to.have.attribute('checked');

    element.edit({ hide_currency_symbol: true });
    element.edit({ hide_decimal_characters: true });
    element.edit({ use_international_currency_symbol: false });
    await element.requestUpdate();

    expect(inputs[3]).to.have.attribute('checked');
  });

  it('disables currency style selector if it matches disabled selector', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        disabledcontrols="currency-style"
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const control = (await getByTestId(element, 'currency-style')) as HTMLDivElement;
    const inputs = control.querySelectorAll<HTMLInputElement>('label input');

    inputs.forEach(input => expect(input).to.have.attribute('disabled'));
  });

  it('makes currency style selector readonly if it matches readonly selector', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        readonlycontrols="currency-style"
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const control = (await getByTestId(element, 'currency-style')) as HTMLDivElement;
    const inputs = control.querySelectorAll<HTMLInputElement>('label input');

    inputs.forEach(input => expect(input).to.have.attribute('readonly'));
  });

  it('hides currency style selector if it matches hidden selector', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        hiddencontrols="currency-style"
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    expect(await getByTestId(element, 'currency-style')).to.not.exist;
  });

  it('renders before and after slots/templates for currency style selector', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    stub(element, 'renderTemplateOrSlot').callsFake(name => html`<div data-slot=${name}></div>`);
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const control = (await getByTestId(element, 'currency-style')) as HTMLDivElement;
    expect(control.firstElementChild).to.have.attribute('data-slot', 'currency-style:before');
    expect(control.lastElementChild).to.have.attribute('data-slot', 'currency-style:after');
  });

  it('renders currency style label and helper text', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const control = (await getByTestId(element, 'currency-style')) as HTMLDivElement;
    const label = await getByKey(control, 'currency_style_label');
    const helperText = await getByKey(control, 'currency_style_helper_text');

    expect(label).to.exist;
    expect(label).to.have.attribute('infer', '');

    expect(helperText).to.exist;
    expect(helperText).to.have.attribute('infer', '');
  });

  it('renders a checkbox enabling custom transaction id display', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="custom-display-id-config-enabled"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_checked', value: 'checked' },
    ]);

    element.edit({ custom_display_id_config: '' });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal([]);

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
    expect(control?.getValue()).to.deep.equal(['checked']);

    control.setValue([]);
    expect(JSON.parse(element.form.custom_display_id_config!)).to.have.property('enabled', false);

    control.setValue(['checked']);
    expect(JSON.parse(element.form.custom_display_id_config!)).to.have.property('enabled', true);
  });

  it('renders start, length, prefix, suffix controls if custom transaction id display is on', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    element.edit({ custom_display_id_config: '' });
    await element.requestUpdate();

    ['start', 'length', 'prefix', 'suffix'].forEach(field => {
      const selector = `[infer="custom-display-id-config-${field}"]`;
      const control = element.renderRoot.querySelector(selector);
      expect(control).to.not.exist;
    });

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

    for (const field of ['start', 'length', 'prefix', 'suffix']) {
      const control = element.renderRoot.querySelector(
        `[infer="custom-display-id-config-${field}"]`
      ) as InternalTextControl | InternalIntegerControl;

      const config = JSON.parse(element.form.custom_display_id_config as string);

      if (field === 'start' || field === 'length') {
        config[field] = 123;
        element.edit({ custom_display_id_config: JSON.stringify(config) });
        await element.requestUpdate();

        expect(control).to.be.instanceOf(InternalIntegerControl);
        expect(control.getValue()).to.equal(123);

        control.setValue(456);
        const newConfig = JSON.parse(element.form.custom_display_id_config as string);
        expect(newConfig).to.have.property(field, '456');
      } else {
        config[field] = 'foobar';
        element.edit({ custom_display_id_config: JSON.stringify(config) });
        await element.requestUpdate();

        expect(control).to.be.instanceOf(InternalTextControl);
        expect(control.getValue()).to.equal('foobar');

        control.setValue('bazqux');
        const newConfig = JSON.parse(element.form.custom_display_id_config as string);
        expect(newConfig).to.have.property(field, 'bazqux');
      }
    }
  });

  it('renders examples if custom transaction id display is on', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    element.edit({ custom_display_id_config: '' });
    expect(await getByTestId(element, 'custom-display-id-config-examples')).to.not.exist;

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

    const examples = (await getByTestId(
      element,
      'custom-display-id-config-examples'
    )) as HTMLTableElement;

    expect(examples).to.exist;
    expect(examples.rows).to.have.length(2);
    expect(examples.rows[0].cells).to.have.length(2);
    expect(examples.rows[1].cells).to.have.length(2);

    const label1Selector = 'foxy-i18n[infer=""][key="custom-display-id-config-first-example"]';
    expect(examples.rows[0].cells[0].querySelector(label1Selector)).to.exist;
    expect(examples.rows[0].cells[1].textContent?.trim()).to.equal('FOO-0008-BAR');

    const label2Selector = 'foxy-i18n[infer=""][key="custom-display-id-config-random-example"]';
    expect(examples.rows[1].cells[0].querySelector(label2Selector)).to.exist;

    const randomExample = examples.rows[1].cells[1].textContent?.trim();
    const randomExamplePrefix = randomExample!.split('-')[0] as string;
    const randomExampleId = randomExample!.split('-')[1] as string;
    const randomExampleSuffix = randomExample!.split('-')[2] as string;

    expect(randomExamplePrefix).to.equal('FOO');
    expect(parseInt(randomExampleId)).to.be.greaterThanOrEqual(8);
    expect(randomExampleId).to.have.length(4);
    expect(randomExampleSuffix).to.equal('BAR');
  });

  it('renders a checkbox enabling custom transaction journal entry id display when custom transaction id display is on', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    let control = element.renderRoot.querySelector(
      '[infer="custom-display-id-config-transaction-journal-entries-enabled"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.not.exist;

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
    control = element.renderRoot.querySelector(
      '[infer="custom-display-id-config-transaction-journal-entries-enabled"]'
    ) as InternalCheckboxGroupControl;

    expect(control?.getValue()).to.deep.equal([]);
    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_checked', value: 'checked' },
    ]);

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: true,
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
    expect(control?.getValue()).to.deep.equal(['checked']);

    control.setValue([]);
    expect(JSON.parse(element.form.custom_display_id_config!)).to.have.nested.property(
      'transaction_journal_entries.enabled',
      false
    );

    control.setValue(['checked']);
    expect(JSON.parse(element.form.custom_display_id_config!)).to.have.nested.property(
      'transaction_journal_entries.enabled',
      true
    );
  });

  it('renders prefix and separator settings if custom transaction journal id display is on', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    element.edit({ custom_display_id_config: '' });
    await element.requestUpdate();

    const paths = [
      'transaction_separator',
      'log_detail_request_types.transaction_authcapture.prefix',
      'log_detail_request_types.transaction_capture.prefix',
      'log_detail_request_types.transaction_void.prefix',
      'log_detail_request_types.transaction_refund.prefix',
    ];

    paths.forEach(path => {
      const field = path.replace(/\.|_/g, '-');
      const selector = `[infer="custom-display-id-config-transaction-journal-entries-${field}"]`;
      const control = element.renderRoot.querySelector(selector);
      expect(control).to.not.exist;
    });

    element.edit({
      custom_display_id_config: JSON.stringify({
        enabled: true,
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

    for (const path of paths) {
      const field = path.replace(/\.|_/g, '-');
      const selector = `[infer="custom-display-id-config-transaction-journal-entries-${field}"]`;
      const control = element.renderRoot.querySelector(selector) as InternalTextControl;

      const topConfig = JSON.parse(element.form.custom_display_id_config as string);
      const config = topConfig.transaction_journal_entries;

      set(config, path, 'foobar');
      element.edit({ custom_display_id_config: JSON.stringify(topConfig) });
      await element.requestUpdate();

      expect(control).to.be.instanceOf(InternalTextControl);
      expect(control.getValue()).to.equal('foobar');

      control.setValue('bazqux');
      const newTopConfig = JSON.parse(element.form.custom_display_id_config as string);
      const newConfig = newTopConfig.transaction_journal_entries;
      expect(newConfig).to.have.nested.property(path, 'bazqux');
    }
  });

  it('renders examples if custom transaction journal id display is on', async () => {
    const testId = 'custom-display-id-config-transaction-journal-entries-examples';
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    element.edit({ custom_display_id_config: '' });
    expect(await getByTestId(element, testId)).to.not.exist;

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

    const examples = (await getByTestId(element, testId)) as HTMLTableElement;

    expect(examples).to.exist;
    expect(examples.rows).to.have.length(4);
    Array.from(examples.rows).forEach(row => expect(row).to.have.length(2));

    const getLabelSelector = (type: string) => {
      return `foxy-i18n[infer=""][key="custom-display-id-config-transaction-journal-entries-${type}-example"]`;
    };

    expect(examples.rows[0].cells[0].querySelector(getLabelSelector('authcapture'))).to.exist;
    expect(examples.rows[1].cells[0].querySelector(getLabelSelector('capture'))).to.exist;
    expect(examples.rows[2].cells[0].querySelector(getLabelSelector('void'))).to.exist;
    expect(examples.rows[3].cells[0].querySelector(getLabelSelector('refund'))).to.exist;

    const authcaptureExample = examples.rows[0].cells[1].textContent?.trim();
    const captureExample = examples.rows[1].cells[1].textContent?.trim();
    const voidExample = examples.rows[2].cells[1].textContent?.trim();
    const refundExample = examples.rows[3].cells[1].textContent?.trim();

    expect(authcaptureExample).to.match(/FOO-\d{4}-BAR\|AU-\d+/);
    expect(captureExample).to.match(/FOO-\d{4}-BAR\|CA-\d+/);
    expect(voidExample).to.match(/FOO-\d{4}-BAR\|VO-\d+/);
    expect(refundExample).to.match(/FOO-\d{4}-BAR\|RE-\d+/);
  });

  it('hides custom transaction id display settings if targeted by hidden selector', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        hiddencontrols="custom-display-id-config"
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
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
    const controls = element.renderRoot.querySelectorAll('[infer^="custom-display-id-config-"]');
    expect(controls).to.be.empty;
  });

  it('renders a text control for receipt continue url', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="receipt-continue-url"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a frequency control for app session time', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="app-session-time"]'
    ) as InternalFrequencyControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalFrequencyControl);
    expect(control).to.have.deep.property('options', [
      { value: 's', label: 'second' },
      { value: 'm', label: 'minute' },
      { value: 'h', label: 'hour' },
      { value: 'd', label: 'day' },
    ]);

    element.edit({ app_session_time: 86400 });
    expect(control.getValue()).to.equal('1d');

    element.edit({ app_session_time: 3600 });
    expect(control.getValue()).to.equal('1h');

    element.edit({ app_session_time: 60 });
    expect(control.getValue()).to.equal('1m');

    element.edit({ app_session_time: 1 });
    expect(control.getValue()).to.equal('1s');

    control.setValue('1d');
    expect(element).to.have.nested.property('form.app_session_time', 86400);

    control.setValue('1h');
    expect(element).to.have.nested.property('form.app_session_time', 3600);

    control.setValue('1m');
    expect(element).to.have.nested.property('form.app_session_time', 60);

    control.setValue('1s');
    expect(element).to.have.nested.property('form.app_session_time', 1);
  });

  it('renders a checkbox for the "products_require_expires_property" flag', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="products-require-expires-property"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_checked', value: 'checked' },
    ]);

    element.edit({ products_require_expires_property: false });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal([]);

    element.edit({ products_require_expires_property: true });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['checked']);
  });

  it('renders a warning when "products_require_expires_property" is enabled', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    expect(await getByKey(element, 'products_require_expires_property_helper_text')).to.not.exist;

    element.data = { ...element.data!, products_require_expires_property: false };
    element.edit({ products_require_expires_property: true });
    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      '[infer="products-require-expires-property"]'
    ) as InternalCheckboxGroupControl;

    const warning = control.nextElementSibling as HTMLDivElement;
    const warningText = await getByKey(warning, 'products_require_expires_property_helper_text');

    expect(warningText).to.exist;
    expect(warningText).to.have.attribute('infer', '');
  });

  it('renders a checkbox for the "use_cart_validation" flag', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="use-cart-validation"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_checked', value: 'checked' },
    ]);

    element.edit({ use_cart_validation: false });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal([]);

    element.edit({ use_cart_validation: true });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['checked']);
  });

  it('renders a warning when "use_cart_validation" is enabled', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    expect(await getByKey(element, 'use_cart_validation_helper_text')).to.not.exist;

    element.data = { ...element.data!, use_cart_validation: false };
    element.edit({ use_cart_validation: true });
    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      '[infer="use-cart-validation"]'
    ) as InternalCheckboxGroupControl;

    const warning = control.nextElementSibling as HTMLDivElement;
    const warningText = await getByKey(warning, 'use_cart_validation_helper_text');
    const warningLink = await getByTag(warning, 'a');

    expect(warningText).to.exist;
    expect(warningText).to.have.attribute('infer', '');

    expect(warningLink).to.exist;
    expect(warningLink).to.include.text(
      'HMAC Product Verification: Locking Down your Add-To-Cart Links and Forms'
    );
    expect(warningLink).to.have.attribute(
      'href',
      'https://wiki.foxycart.com/v/2.0/hmac_validation'
    );
  });

  it('renders a select control for checkout type', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="checkout-type"]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);

    await new Form.API(element).fetch('https://demo.api/hapi/property_helpers/8', {
      method: 'PATCH',
      body: JSON.stringify({
        values: {
          default_account: 'Default account',
          default_guest: 'Default guest',
        },
      }),
    });

    element.checkoutTypes = 'https://demo.api/hapi/property_helpers/8';
    await waitUntil(() => !!control.options.length, '', { timeout: 5000 });

    expect(control).to.have.deep.property('options', [
      { value: 'default_account', label: 'Default account' },
      { value: 'default_guest', label: 'Default guest' },
    ]);
  });

  it('renders a select control for customer password hash type', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="customer-password-hash-type"]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);

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
    await waitUntil(() => !!control.options.length, '', { timeout: 5000 });

    expect(control).to.have.deep.property('options', [
      { value: 'concrete5', label: 'Concrete5' },
      { value: 'phpass', label: 'phpass' },
    ]);

    control.setValue('concrete5');
    expect(element).to.have.nested.property('form.customer_password_hash_config', 'PASSWORD_SALT');

    control.setValue('phpass');
    expect(element).to.have.nested.property('form.customer_password_hash_config', 8);
  });

  it('renders a text or a number control for customer password hash config', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    element.edit({ customer_password_hash_config: 'foo' });

    await element.requestUpdate();
    let control = element.renderRoot.querySelector('[infer="customer-password-hash-config"]');
    expect(control).to.be.instanceOf(InternalTextControl);

    element.edit({ customer_password_hash_config: 8 });
    await element.requestUpdate();
    control = element.renderRoot.querySelector('[infer="customer-password-hash-config"]');

    expect(control).to.be.instanceOf(InternalNumberControl);
  });

  it('renders a password control for unified order entry password', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="unified-order-entry-password"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalPasswordControl);
  });

  it('renders a text control for sso url', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="single-sign-on-url"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);

    element.edit({ use_single_sign_on: false, single_sign_on_url: 'https://example.com' });
    expect(control.getValue()).to.equal('');

    element.edit({ use_single_sign_on: true, single_sign_on_url: 'https://example.com' });
    expect(control.getValue()).to.equal('https://example.com');

    control.setValue('');
    expect(element).to.have.nested.property('form.use_single_sign_on', false);
    expect(element).to.have.nested.property('form.single_sign_on_url', '');

    control.setValue('https://example.com');
    expect(element).to.have.nested.property('form.use_single_sign_on', true);
    expect(element).to.have.nested.property('form.single_sign_on_url', 'https://example.com');
  });

  it('renders a text control for webhook url', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="webhook-url"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);

    element.edit({ use_webhook: false, webhook_url: 'https://example.com' });
    expect(control.getValue()).to.equal('');

    element.edit({ use_webhook: true, webhook_url: 'https://example.com' });
    expect(control.getValue()).to.equal('https://example.com');

    control.setValue('');
    expect(element).to.have.nested.property('form.use_webhook', false);
    expect(element).to.have.nested.property('form.webhook_url', '');

    control.setValue('https://example.com');
    expect(element).to.have.nested.property('form.use_webhook', true);
    expect(element).to.have.nested.property('form.webhook_url', 'https://example.com');
  });

  it('renders password controls for secret keys when "webhook_key" is a string', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    element.edit({ webhook_key: 'ABCTEST' });
    await element.requestUpdate();

    for (const key of ['cart_signing', 'xml_datafeed', 'api_legacy', 'sso']) {
      const infer = `webhook-key-${key.replace('_', '-')}`;
      const control = element.renderRoot.querySelector(
        `[infer="${infer}"]`
      ) as InternalPasswordControl;

      expect(control).to.be.instanceOf(InternalPasswordControl);
      expect(control.getValue()).to.equal('ABCTEST');

      control.setValue('FOOBAR');
      expect(JSON.parse(element.form.webhook_key!)).to.have.property(key, 'FOOBAR');

      element.edit({ webhook_key: 'ABCTEST' });
    }
  });

  it('renders password controls for secret keys when "webhook_key" is JSON', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    const exampleKey: Record<string, string> = {
      cart_signing: 'CRT_SGN_123',
      xml_datafeed: 'XML_DFD_456',
      api_legacy: 'API_LCY_789',
      sso: 'SSO_123_456',
    };

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    element.edit({ webhook_key: JSON.stringify(exampleKey) });
    await element.requestUpdate();

    for (const key of ['cart_signing', 'xml_datafeed', 'api_legacy', 'sso']) {
      const infer = `webhook-key-${key.replace('_', '-')}`;
      const control = element.renderRoot.querySelector(
        `[infer="${infer}"]`
      ) as InternalPasswordControl;

      expect(control).to.be.instanceOf(InternalPasswordControl);
      expect(control.getValue()).to.equal(exampleKey[key]);

      control.setValue('FOOBAR');
      expect(JSON.parse(element.form.webhook_key!)).to.have.property(key, 'FOOBAR');

      element.edit({ webhook_key: JSON.stringify(exampleKey) });
    }
  });

  it('renders maintenance mode switch', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    element.data = { ...element.data!, is_maintenance_mode: true };
    await element.requestUpdate();

    const wrapper = (await getByTestId(element, 'is-maintenance-mode'))!;
    let label = (await getByKey(wrapper, 'maintenance_mode_on_explainer'))!;
    const button = (await getByTag(wrapper, 'vaadin-button')) as HTMLElement;
    let buttonLabel = button.querySelector('foxy-i18n[key="disable_maintenance_mode"]')!;

    expect(wrapper).to.exist;
    expect(label).to.exist;
    expect(label).to.have.attribute('infer', '');
    expect(button).to.exist;
    expect(buttonLabel).to.exist;
    expect(buttonLabel).to.have.attribute('infer', '');

    button.click();
    await waitUntil(() => element.in('idle'), '', { timeout: 5000 });
    expect(element).to.have.nested.property('data.is_maintenance_mode', false);

    label = (await getByKey(wrapper, 'maintenance_mode_off_explainer'))!;
    buttonLabel = button.querySelector('foxy-i18n[key="enable_maintenance_mode"]')!;

    expect(label).to.exist;
    expect(label).to.have.attribute('infer', '');
    expect(buttonLabel).to.exist;
    expect(buttonLabel).to.have.attribute('infer', '');

    button.click();
    await waitUntil(() => element.in('idle'), '', { timeout: 5000 });
    expect(element).to.have.nested.property('data.is_maintenance_mode', true);
  });

  it('hides maintenance mode switch if targeted by hidden selector', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        hiddencontrols="is-maintenance-mode"
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    expect(await getByTestId(element, 'is-maintenance-mode')).to.not.exist;
  });

  it('disables maintenance mode switch if targeted by disabled selector', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-form
        href="https://demo.api/hapi/stores/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const wrapper = (await getByTestId(element, 'is-maintenance-mode'))!;
    const button = (await getByTag(wrapper, 'vaadin-button')) as HTMLElement;

    expect(button).to.not.have.attribute('disabled');

    element.setAttribute('disabledcontrols', 'is-maintenance-mode');
    await element.requestUpdate();

    expect(button).to.have.attribute('disabled');
  });
});
