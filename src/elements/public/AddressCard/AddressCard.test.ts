import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { AddressCard } from './AddressCard';
import { Data } from './types';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { NucleonElement } from '../NucleonElement';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('AddressCard', () => {
  it('extends NucleonElement', () => {
    expect(new AddressCard()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-address-card', () => {
    expect(customElements.get('foxy-address-card')).to.equal(AddressCard);
  });

  describe('address-name', () => {
    it('renders foxy-i18n with key "default_billing_address" for default billing address when loaded', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);

      data.is_default_billing = true;
      data.is_default_shipping = false;

      const layout = html`<foxy-address-card .data=${data} lang="es"></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      const control = await getByTestId(element, 'address-name');

      expect(control).to.have.property('localName', 'foxy-i18n');
      expect(control).to.have.attribute('lang', 'es');
      expect(control).to.have.attribute('key', 'default_billing_address');
      expect(control).to.have.attribute('ns', 'address-card');
    });

    it('renders foxy-i18n with key "default_shipping_address" for default shipping address when loaded', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);

      data.is_default_billing = false;
      data.is_default_shipping = true;

      const layout = html`<foxy-address-card .data=${data} lang="es"></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      const control = await getByTestId(element, 'address-name');

      expect(control).to.have.property('localName', 'foxy-i18n');
      expect(control).to.have.attribute('lang', 'es');
      expect(control).to.have.attribute('key', 'default_shipping_address');
      expect(control).to.have.attribute('ns', 'address-card');
    });

    it('renders foxy-i18n with key "default_shipping_address" for default shipping address when loaded', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);

      data.is_default_billing = false;
      data.is_default_shipping = true;

      const layout = html`<foxy-address-card .data=${data} lang="es"></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      const control = await getByTestId(element, 'address-name');

      expect(control).to.have.property('localName', 'foxy-i18n');
      expect(control).to.have.attribute('lang', 'es');
      expect(control).to.have.attribute('key', 'default_shipping_address');
      expect(control).to.have.attribute('ns', 'address-card');
    });

    it('renders address name for custom address when loaded', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);

      data.is_default_billing = false;
      data.is_default_shipping = false;
      data.address_name = 'Home';

      const layout = html`<foxy-address-card .data=${data} lang="es"></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);

      expect(await getByTestId(element, 'address-name')).to.contain.text('Home');
    });

    it('renders "address-name:before" slot by default', async () => {
      const element = await fixture<AddressCard>(html`<foxy-address-card></foxy-address-card>`);
      const slot = await getByName<HTMLSlotElement>(element, 'address-name:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "address-name:before" slot with template "address-name:before" if available', async () => {
      const name = 'address-name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressCard>(html`
        <foxy-address-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "address-name:after" slot by default', async () => {
      const element = await fixture<AddressCard>(html`<foxy-address-card></foxy-address-card>`);
      const slot = await getByName<HTMLSlotElement>(element, 'address-name:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "address-name:after" slot with template "address-name:after" if available', async () => {
      const name = 'address-name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressCard>(html`
        <foxy-address-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-card></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      expect(await getByTestId(element, 'address-name')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-address-card hidden></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      expect(await getByTestId(element, 'address-name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes address-name', async () => {
      const layout = html`<foxy-address-card hiddencontrols="address-name"></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      expect(await getByTestId(element, 'address-name')).to.not.exist;
    });
  });

  describe('full-name', () => {
    it('renders foxy-i18n with key "full-name" when loaded', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-address-card .data=${data} lang="es"></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      const wrapper = await getByTestId(element, 'full-name');
      const control = wrapper!.firstElementChild;

      expect(control).to.have.property('localName', 'foxy-i18n');
      expect(control).to.have.attribute('options', JSON.stringify(data));
      expect(control).to.have.attribute('lang', 'es');
      expect(control).to.have.attribute('key', 'full_name');
      expect(control).to.have.attribute('ns', 'address-card');
    });

    it('renders "full-name:before" slot by default', async () => {
      const element = await fixture<AddressCard>(html`<foxy-address-card></foxy-address-card>`);
      const slot = await getByName<HTMLSlotElement>(element, 'full-name:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "full-name:before" slot with template "full-name:before" if available', async () => {
      const name = 'full-name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressCard>(html`
        <foxy-address-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "full-name:after" slot by default', async () => {
      const element = await fixture<AddressCard>(html`<foxy-address-card></foxy-address-card>`);
      const slot = await getByName<HTMLSlotElement>(element, 'full-name:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "full-name:after" slot with template "full-name:after" if available', async () => {
      const name = 'full-name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressCard>(html`
        <foxy-address-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-card></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      expect(await getByTestId(element, 'full-name')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-address-card hidden></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      expect(await getByTestId(element, 'full-name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes full-name', async () => {
      const layout = html`<foxy-address-card hiddencontrols="full-name"></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      expect(await getByTestId(element, 'full-name')).to.not.exist;
    });
  });

  describe('company', () => {
    it('renders company name when loaded', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = { ...(await getTestData<Data>(href)), company: 'Acme Corporation' };
      const layout = html`<foxy-address-card .data=${data}></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);

      expect(await getByTestId(element, 'company')).to.contain.text('Acme Corporation');
    });

    it('renders "company:before" slot by default', async () => {
      const element = await fixture<AddressCard>(html`<foxy-address-card></foxy-address-card>`);
      const slot = await getByName<HTMLSlotElement>(element, 'company:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "company:before" slot with template "company:before" if available', async () => {
      const name = 'company:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressCard>(html`
        <foxy-address-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "company:after" slot by default', async () => {
      const element = await fixture<AddressCard>(html`<foxy-address-card></foxy-address-card>`);
      const slot = await getByName<HTMLSlotElement>(element, 'company:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "company:after" slot with template "company:after" if available', async () => {
      const name = 'company:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressCard>(html`
        <foxy-address-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-card></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      expect(await getByTestId(element, 'company')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-address-card hidden></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      expect(await getByTestId(element, 'company')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes company', async () => {
      const layout = html`<foxy-address-card hiddencontrols="company"></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      expect(await getByTestId(element, 'company')).to.not.exist;
    });
  });

  describe('phone', () => {
    it('renders phone name when loaded', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = { ...(await getTestData<Data>(href)), phone: '+1-202-555-0177' };
      const layout = html`<foxy-address-card .data=${data}></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);

      expect(await getByTestId(element, 'phone')).to.contain.text('+1-202-555-0177');
    });

    it('renders "phone:before" slot by default', async () => {
      const element = await fixture<AddressCard>(html`<foxy-address-card></foxy-address-card>`);
      const slot = await getByName<HTMLSlotElement>(element, 'phone:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "phone:before" slot with template "phone:before" if available', async () => {
      const name = 'phone:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressCard>(html`
        <foxy-address-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "phone:after" slot by default', async () => {
      const element = await fixture<AddressCard>(html`<foxy-address-card></foxy-address-card>`);
      const slot = await getByName<HTMLSlotElement>(element, 'phone:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "phone:after" slot with template "phone:after" if available', async () => {
      const name = 'phone:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressCard>(html`
        <foxy-address-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-card></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      expect(await getByTestId(element, 'phone')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-address-card hidden></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      expect(await getByTestId(element, 'phone')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes phone', async () => {
      const layout = html`<foxy-address-card hiddencontrols="phone"></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      expect(await getByTestId(element, 'phone')).to.not.exist;
    });
  });

  describe('spinner', () => {
    it('renders "empty" foxy-spinner by default', async () => {
      const layout = html`<foxy-address-card lang="es"></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'empty');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'address-card spinner');
    });

    it('renders "busy" foxy-spinner while loading', async () => {
      const layout = html`<foxy-address-card href="/" lang="es"></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'address-card spinner');
    });

    it('renders "error" foxy-spinner if loading fails', async () => {
      const layout = html`<foxy-address-card href="/" lang="es"></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'address-card spinner');
    });

    it('hides the spinner once loaded', async () => {
      const data = await getTestData('./hapi/customer_addresses/0');
      const layout = html`<foxy-address-card .data=${data}></foxy-address-card>`;
      const element = await fixture<AddressCard>(layout);
      const spinner = await getByTestId(element, 'spinner');

      expect(spinner!.parentElement).to.have.class('opacity-0');
    });
  });
});
