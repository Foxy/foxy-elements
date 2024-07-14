import type { InternalCheckboxGroupControl } from '../../internal/InternalCheckboxGroupControl/InternalCheckboxGroupControl';
import type { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, html, fixture, waitUntil } from '@open-wc/testing';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { AddressForm } from './AddressForm';
import { getTestData } from '../../../testgen/getTestData';
import { countries } from './countries';

describe('AddressForm', () => {
  it('imports and registers foxy-internal-checkbox-group-control', () => {
    expect(customElements.get('foxy-internal-checkbox-group-control')).to.exist;
  });

  it('imports and registers foxy-internal-select-control', () => {
    expect(customElements.get('foxy-internal-select-control')).to.exist;
  });

  it('imports and registers foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and registers foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and registers itself as foxy-address-form', () => {
    expect(customElements.get('foxy-address-form')).to.equal(AddressForm);
  });

  it('extends InternalForm', () => {
    expect(new AddressForm()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18next namespace of "address-form"', () => {
    expect(AddressForm).to.have.property('defaultNS', 'address-form');
    expect(new AddressForm()).to.have.property('ns', 'address-form');
  });

  it('produces "address-name:v8n_required" v8n error when address_name is empty', async () => {
    const element = new AddressForm();
    expect(element.errors).to.include('address-name:v8n_required');

    element.edit({ address_name: 'foo' });
    expect(element.errors).not.to.include('address-name:v8n_required');
  });

  it('produces "address-name:v8n_too_long" v8n error when address_name is too long', async () => {
    const element = new AddressForm();
    expect(element.errors).to.not.include('address-name:v8n_too_long');

    element.edit({ address_name: 'foo' });
    expect(element.errors).not.to.include('address-name:v8n_too_long');

    element.edit({ address_name: 'a'.repeat(101) });
    expect(element.errors).to.include('address-name:v8n_too_long');
  });

  it('produces "first-name:v8n_too_long" v8n error when first_name is too long', async () => {
    const element = new AddressForm();
    expect(element.errors).to.not.include('first-name:v8n_too_long');

    element.edit({ first_name: 'foo' });
    expect(element.errors).not.to.include('first-name:v8n_too_long');

    element.edit({ first_name: 'a'.repeat(51) });
    expect(element.errors).to.include('first-name:v8n_too_long');
  });

  it('produces "last-name:v8n_too_long" v8n error when last_name is too long', async () => {
    const element = new AddressForm();
    expect(element.errors).to.not.include('last-name:v8n_too_long');

    element.edit({ last_name: 'foo' });
    expect(element.errors).not.to.include('last-name:v8n_too_long');

    element.edit({ last_name: 'a'.repeat(51) });
    expect(element.errors).to.include('last-name:v8n_too_long');
  });

  it('produces "region:v8n_too_long" v8n error when region is too long', async () => {
    const element = new AddressForm();
    expect(element.errors).to.not.include('region:v8n_too_long');

    element.edit({ region: 'foo' });
    expect(element.errors).not.to.include('region:v8n_too_long');

    element.edit({ region: 'a'.repeat(51) });
    expect(element.errors).to.include('region:v8n_too_long');
  });

  it('produces "city:v8n_too_long" v8n error when city is too long', async () => {
    const element = new AddressForm();
    expect(element.errors).to.not.include('city:v8n_too_long');

    element.edit({ city: 'foo' });
    expect(element.errors).not.to.include('city:v8n_too_long');

    element.edit({ city: 'a'.repeat(51) });
    expect(element.errors).to.include('city:v8n_too_long');
  });

  it('produces "phone:v8n_too_long" v8n error when phone is too long', async () => {
    const element = new AddressForm();
    expect(element.errors).to.not.include('phone:v8n_too_long');

    element.edit({ phone: 'foo' });
    expect(element.errors).not.to.include('phone:v8n_too_long');

    element.edit({ phone: 'a'.repeat(51) });
    expect(element.errors).to.include('phone:v8n_too_long');
  });

  it('produces "company:v8n_too_long" v8n error when company is too long', async () => {
    const element = new AddressForm();
    expect(element.errors).to.not.include('company:v8n_too_long');

    element.edit({ company: 'foo' });
    expect(element.errors).not.to.include('company:v8n_too_long');

    element.edit({ company: 'a'.repeat(51) });
    expect(element.errors).to.include('company:v8n_too_long');
  });

  it('produces "address-two:v8n_too_long" v8n error when address2 is too long', async () => {
    const element = new AddressForm();
    expect(element.errors).to.not.include('address-two:v8n_too_long');

    element.edit({ address2: 'foo' });
    expect(element.errors).not.to.include('address-two:v8n_too_long');

    element.edit({ address2: 'a'.repeat(101) });
    expect(element.errors).to.include('address-two:v8n_too_long');
  });

  it('produces "address-one:v8n_required" v8n error when address1 is empty', async () => {
    const element = new AddressForm();
    expect(element.errors).to.include('address-one:v8n_required');

    element.edit({ address1: 'foo' });
    expect(element.errors).not.to.include('address-one:v8n_required');
  });

  it('produces "address-one:v8n_too_long" v8n error when address1 is too long', async () => {
    const element = new AddressForm();
    expect(element.errors).to.not.include('address-one:v8n_too_long');

    element.edit({ address1: 'foo' });
    expect(element.errors).not.to.include('address-one:v8n_too_long');

    element.edit({ address1: 'a'.repeat(101) });
    expect(element.errors).to.include('address-one:v8n_too_long');
  });

  it('produces "postal-code:v8n_too_long" v8n error when postal code is too long', async () => {
    const element = new AddressForm();
    expect(element.errors).to.not.include('postal-code:v8n_too_long');

    element.edit({ postal_code: 'foo' });
    expect(element.errors).not.to.include('postal-code:v8n_too_long');

    element.edit({ postal_code: 'a'.repeat(51) });
    expect(element.errors).to.include('postal-code:v8n_too_long');
  });

  it('makes address name readonly for default billing address', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const data = await getTestData<Data>('./hapi/customer_addresses/0');

    expect(element.readonlySelector.matches('address-name', true)).to.be.false;

    data.is_default_billing = true;
    data.is_default_shipping = false;
    element.data = data;

    expect(element.readonlySelector.matches('address-name', true)).to.be.true;
  });

  it('makes address name readonly for default shipping address', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const data = await getTestData<Data>('./hapi/customer_addresses/0');

    expect(element.readonlySelector.matches('address-name', true)).to.be.false;

    data.is_default_billing = false;
    data.is_default_shipping = true;
    element.data = data;

    expect(element.readonlySelector.matches('address-name', true)).to.be.true;
  });

  it('makes Delete button disabled for default billing address', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const data = await getTestData<Data>('./hapi/customer_addresses/0');

    expect(element.disabledSelector.matches('delete', true)).to.be.false;

    data.is_default_billing = true;
    data.is_default_shipping = false;
    element.data = data;

    expect(element.disabledSelector.matches('delete', true)).to.be.true;
  });

  it('makes Delete button disabled for default shipping address', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const data = await getTestData<Data>('./hapi/customer_addresses/0');

    expect(element.disabledSelector.matches('delete', true)).to.be.false;

    data.is_default_billing = false;
    data.is_default_shipping = true;
    element.data = data;

    expect(element.disabledSelector.matches('delete', true)).to.be.true;
  });

  it('renders a text control for address name', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const control = element.renderRoot.querySelector(
      'foxy-internal-text-control[infer="address-name"]'
    );

    expect(control).to.exist;
  });

  it('renders a text control for first name', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const control = element.renderRoot.querySelector(
      'foxy-internal-text-control[infer="first-name"]'
    );

    expect(control).to.exist;
  });

  it('renders a text control for last name', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const control = element.renderRoot.querySelector(
      'foxy-internal-text-control[infer="last-name"]'
    );

    expect(control).to.exist;
  });

  it('renders a text control for company', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const control = element.renderRoot.querySelector('foxy-internal-text-control[infer="company"]');

    expect(control).to.exist;
  });

  it('renders a text control for phone', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const control = element.renderRoot.querySelector('foxy-internal-text-control[infer="phone"]');

    expect(control).to.exist;
  });

  it('renders a text control for address line 1', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const control = element.renderRoot.querySelector(
      'foxy-internal-text-control[infer="address-one"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('property', 'address1');
  });

  it('renders a text control for address line 2', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const control = element.renderRoot.querySelector(
      'foxy-internal-text-control[infer="address-two"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('property', 'address2');
  });

  it('renders a select control for country', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const control = element.renderRoot.querySelector(
      'foxy-internal-select-control[infer="country"]'
    );

    expect(control).to.exist;
    expect(control).to.have.deep.property(
      'options',
      Object.keys(countries).map(code => ({
        label: `country_${code.toLowerCase()}`,
        value: code,
      }))
    );
  });

  it('clears region selection when country changes', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const control = element.renderRoot.querySelector(
      'foxy-internal-select-control[infer="country"]'
    ) as InternalSelectControl;

    element.edit({ country: 'US', region: 'NY' });
    expect(element.form).to.have.property('region', 'NY');
    control.setValue('CA');
    expect(element.form).to.have.property('region', '');
  });

  it('renders a select control for region when country has regions in foxy records', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);

    element.edit({ country: 'US' });
    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      'foxy-internal-select-control[infer="region"]'
    );

    expect(control).to.exist;
    expect(control).to.have.deep.property(
      'options',
      countries.US.map(code => ({
        label: `country_us_region_${code.toLowerCase()}`,
        value: code,
      }))
    );
  });

  it('renders a text control for region when country is not selected or has no regions in foxy records', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    let control = element.renderRoot.querySelector('foxy-internal-text-control[infer="region"]');
    expect(control).to.exist;

    element.edit({ country: 'MX' });
    await element.requestUpdate();

    control = element.renderRoot.querySelector('foxy-internal-text-control[infer="region"]');
    expect(control).to.exist;
  });

  it('renders a text control for city', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const control = element.renderRoot.querySelector('foxy-internal-text-control[infer="city"]');

    expect(control).to.exist;
  });

  it('renders a text control for postal code', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const control = element.renderRoot.querySelector(
      'foxy-internal-text-control[infer="postal-code"]'
    );

    expect(control).to.exist;
  });

  it('renders a checkbox group control for ignoring address restrictions', async () => {
    const layout = html`<foxy-address-form></foxy-address-form>`;
    const element = await fixture<AddressForm>(layout);
    const control = element.renderRoot.querySelector<InternalCheckboxGroupControl>(
      'foxy-internal-checkbox-group-control[infer="ignore-address-restrictions"]'
    );

    expect(control).to.exist;
    expect(control).to.have.deep.property('options', [{ label: 'option_true', value: 'true' }]);
    expect(control?.getValue()).to.deep.equal([]);

    element.edit({ ignore_address_restrictions: true });
    expect(control?.getValue()).to.deep.equal(['true']);

    control?.setValue([]);
    expect(element.form).to.have.property('ignore_address_restrictions', false);

    control?.setValue(['true']);
    expect(element.form).to.have.property('ignore_address_restrictions', true);
  });

  it('renders "country_banned" general error when selected country is disallowed by store settings', async () => {
    const form = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);

    form.data = await getTestData<Data>('./hapi/customer_addresses/0');
    form.addEventListener('fetch', (evt: Event) => {
      const event = evt as FetchEvent;
      const body = JSON.stringify({
        _embedded: {
          'fx:errors': [{ message: 'Country is invalid or disallowed by store configuration' }],
        },
      });

      event.respondWith(Promise.resolve(new Response(body, { status: 400 })));
    });

    form.edit({ address_name: 'Test Address', address1: 'Foo Bar 123' });
    form.submit();

    await waitUntil(() => !!form.in('idle'));
    expect(form.errors).to.include('error:country_banned');
  });

  it('renders "address_name_exists" general error when address name is already taken', async () => {
    const form = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);

    form.data = await getTestData<Data>('./hapi/customer_addresses/0');
    form.addEventListener('fetch', (evt: Event) => {
      const event = evt as FetchEvent;
      const body = JSON.stringify({
        _embedded: {
          'fx:errors': [{ message: 'this address name already exists for this customer' }],
        },
      });

      event.respondWith(Promise.resolve(new Response(body, { status: 400 })));
    });

    form.edit({ address_name: 'Test Address', address1: 'Foo Bar 123' });
    form.submit();

    await waitUntil(() => !!form.in('idle'));
    expect(form.errors).to.include('error:address_name_exists');
  });
});
