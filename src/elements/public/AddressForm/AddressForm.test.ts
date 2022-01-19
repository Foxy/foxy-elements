import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { AddressForm } from './AddressForm';
import { ButtonElement } from '@vaadin/vaadin-button';
import { Data } from './types';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { NucleonElement } from '../NucleonElement';
import { SelectElement } from '@vaadin/vaadin-select';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { createRouter } from '../../../server/virtual';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-element';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('AddressForm', () => {
  it('extends NucleonElement', () => {
    expect(new AddressForm()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-address-form', () => {
    expect(customElements.get('foxy-address-form')).to.equal(AddressForm);
  });

  describe('address-name', () => {
    it('has i18n label key "address_name"', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'address-name');
      expect(control).to.have.property('label', 'address_name');
    });

    it('has value of form.address_name', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      element.edit({ address_name: 'Home' });

      const control = await getByTestId<TextFieldElement>(element, 'address-name');
      expect(control).to.have.property('value', 'Home');
    });

    it('writes to form.address_name on input', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'address-name');

      control!.value = 'Home';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.address_name', 'Home');
    });

    it('invalidates the form when empty', async () => {
      const validData = await getTestData<Data>('./hapi/customer_addresses/0');
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);

      element.data = validData;
      element.edit({ address_name: '' });

      expect(element.in({ idle: { snapshot: { dirty: 'invalid' } } })).to.be.true;
      expect(element.errors).to.include('address_name_required');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/customer_addresses/0');
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'address-name');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ address_name: 'Home' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "address-name:before" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'address-name:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "address-name:before" slot with template "address-name:before" if available', async () => {
      const name = 'address-name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "address-name:after" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'address-name:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "address-name:after" slot with template "address-name:after" if available', async () => {
      const name = 'address-name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-name')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-address-form readonly></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-name')).to.have.attribute('readonly');
    });

    it('is readonly when resource is a default billing address', async () => {
      const data = await getTestData<Data>('./hapi/customer_addresses/0');

      data.is_default_billing = true;

      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);

      expect(await getByTestId(element, 'address-name')).to.have.attribute('readonly');
    });

    it('is readonly when resource is a default shipping address', async () => {
      const data = await getTestData<Data>('./hapi/customer_addresses/0');

      data.is_default_shipping = true;

      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);

      expect(await getByTestId(element, 'address-name')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes address-name', async () => {
      const layout = html`<foxy-address-form readonlycontrols="address-name"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-name')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-name')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-name')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-name')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-address-form disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-name')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes address-name', async () => {
      const layout = html`<foxy-address-form disabledcontrols="address-name"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-name')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-name')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-address-form hidden></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes address-name', async () => {
      const layout = html`<foxy-address-form hiddencontrols="address-name"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-name')).to.not.exist;
    });
  });

  describe('first-name', () => {
    it('has i18n label key "first_name"', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'first-name');
      expect(control).to.have.property('label', 'first_name');
    });

    it('has value of form.first_name', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      element.edit({ first_name: 'Justice' });

      const control = await getByTestId<TextFieldElement>(element, 'first-name');
      expect(control).to.have.property('value', 'Justice');
    });

    it('writes to form.first_name on input', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'first-name');

      control!.value = 'Justice';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.first_name', 'Justice');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/customer_addresses/0');
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'first-name');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ first_name: 'Justice' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "first-name:before" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'first-name:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "first-name:before" slot with template "first-name:before" if available', async () => {
      const name = 'first-name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "first-name:after" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'first-name:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "first-name:after" slot with template "first-name:after" if available', async () => {
      const name = 'first-name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'first-name')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-address-form readonly></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes first-name', async () => {
      const layout = html`<foxy-address-form readonlycontrols="first-name"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'first-name')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-address-form disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes first-name', async () => {
      const layout = html`<foxy-address-form disabledcontrols="first-name"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-address-form hidden></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes first-name', async () => {
      const layout = html`<foxy-address-form hiddencontrols="first-name"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.not.exist;
    });
  });

  describe('last-name', () => {
    it('has i18n label key "last_name"', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'last-name');
      expect(control).to.have.property('label', 'last_name');
    });

    it('has value of form.last_name', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      element.edit({ last_name: 'Witt' });

      const control = await getByTestId<TextFieldElement>(element, 'last-name');
      expect(control).to.have.property('value', 'Witt');
    });

    it('writes to form.last_name on input', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'last-name');

      control!.value = 'Witt';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.last_name', 'Witt');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/customer_addresses/0');
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'last-name');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ last_name: 'Witt' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "last-name:before" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'last-name:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "last-name:before" slot with template "last-name:before" if available', async () => {
      const name = 'last-name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "last-name:after" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'last-name:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "last-name:after" slot with template "last-name:after" if available', async () => {
      const name = 'last-name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'last-name')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-address-form readonly></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes last-name', async () => {
      const layout = html`<foxy-address-form readonlycontrols="last-name"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'last-name')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-address-form disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes last-name', async () => {
      const layout = html`<foxy-address-form disabledcontrols="last-name"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-address-form hidden></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes last-name', async () => {
      const layout = html`<foxy-address-form hiddencontrols="last-name"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.not.exist;
    });
  });

  describe('company', () => {
    it('has i18n label key "company"', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'company');
      expect(control).to.have.property('label', 'company');
    });

    it('has value of form.company', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      element.edit({ company: 'Acme Corporation' });

      const control = await getByTestId<TextFieldElement>(element, 'company');
      expect(control).to.have.property('value', 'Acme Corporation');
    });

    it('writes to form.company on input', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'company');

      control!.value = 'Acme Corporation';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.company', 'Acme Corporation');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/customer_addresses/0');
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'company');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ company: 'Acme Corporation' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "company:before" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'company:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "company:before" slot with template "company:before" if available', async () => {
      const name = 'company:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "company:after" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'company:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "company:after" slot with template "company:after" if available', async () => {
      const name = 'company:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'company')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-address-form readonly></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'company')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes company', async () => {
      const layout = html`<foxy-address-form readonlycontrols="company"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'company')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'company')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'company')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'company')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-address-form disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'company')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes company', async () => {
      const layout = html`<foxy-address-form disabledcontrols="company"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'company')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'company')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-address-form hidden></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'company')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes company', async () => {
      const layout = html`<foxy-address-form hiddencontrols="company"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'company')).to.not.exist;
    });
  });

  describe('phone', () => {
    it('has i18n label key "phone"', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'phone');
      expect(control).to.have.property('label', 'phone');
    });

    it('has value of form.phone', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      element.edit({ phone: '+1-202-555-0177' });

      const control = await getByTestId<TextFieldElement>(element, 'phone');
      expect(control).to.have.property('value', '+1-202-555-0177');
    });

    it('writes to form.phone on input', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'phone');

      control!.value = '+1-202-555-0177';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.phone', '+1-202-555-0177');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/customer_addresses/0');
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'phone');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ phone: '+1-202-555-0177' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "phone:before" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'phone:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "phone:before" slot with template "phone:before" if available', async () => {
      const name = 'phone:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "phone:after" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'phone:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "phone:after" slot with template "phone:after" if available', async () => {
      const name = 'phone:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'phone')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-address-form readonly></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'phone')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes phone', async () => {
      const layout = html`<foxy-address-form readonlycontrols="phone"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'phone')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'phone')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'phone')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'phone')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-address-form disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'phone')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes phone', async () => {
      const layout = html`<foxy-address-form disabledcontrols="phone"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'phone')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'phone')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-address-form hidden></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'phone')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes phone', async () => {
      const layout = html`<foxy-address-form hiddencontrols="phone"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'phone')).to.not.exist;
    });
  });

  describe('address-one', () => {
    it('has i18n label key "address1"', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'address-one');
      expect(control).to.have.property('label', 'address1');
    });

    it('has value of form.address1', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      element.edit({ address1: '1459 Aaron Smith Drive' });

      const control = await getByTestId<TextFieldElement>(element, 'address-one');
      expect(control).to.have.property('value', '1459 Aaron Smith Drive');
    });

    it('writes to form.address1 on input', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'address-one');

      control!.value = '1459 Aaron Smith Drive';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.address1', '1459 Aaron Smith Drive');
    });

    it('invalidates the form when empty', async () => {
      const validData = await getTestData<Data>('./hapi/customer_addresses/0');
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);

      element.data = validData;
      element.edit({ address1: '' });

      expect(element.in({ idle: { snapshot: { dirty: 'invalid' } } })).to.be.true;
      expect(element.errors).to.include('address1_required');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/customer_addresses/0');
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'address-one');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ address1: '1459 Aaron Smith Drive' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "address-one:before" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'address-one:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "address-one:before" slot with template "address-one:before" if available', async () => {
      const name = 'address-one:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "address-one:after" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'address-one:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "address-one:after" slot with template "address-one:after" if available', async () => {
      const name = 'address-one:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-one')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-address-form readonly></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-one')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes address-one', async () => {
      const layout = html`<foxy-address-form readonlycontrols="address-one"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-one')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-one')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-one')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-one')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-address-form disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-one')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes address-one', async () => {
      const layout = html`<foxy-address-form disabledcontrols="address-one"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-one')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-one')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-address-form hidden></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-one')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes address-one', async () => {
      const layout = html`<foxy-address-form hiddencontrols="address-one"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-one')).to.not.exist;
    });
  });

  describe('address-two', () => {
    it('has i18n label key "address2"', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'address-two');
      expect(control).to.have.property('label', 'address2');
    });

    it('has value of form.address2', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      element.edit({ address2: 'Apt. 12' });

      const control = await getByTestId<TextFieldElement>(element, 'address-two');
      expect(control).to.have.property('value', 'Apt. 12');
    });

    it('writes to form.address2 on input', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'address-two');

      control!.value = 'Apt. 12';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.address2', 'Apt. 12');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/customer_addresses/0');
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'address-two');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ address2: 'Apt. 12' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "address-two:before" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'address-two:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "address-two:before" slot with template "address-two:before" if available', async () => {
      const name = 'address-two:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "address-two:after" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'address-two:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "address-two:after" slot with template "address-two:after" if available', async () => {
      const name = 'address-two:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-two')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-address-form readonly></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-two')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes address-two', async () => {
      const layout = html`<foxy-address-form readonlycontrols="address-two"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-two')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-two')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-two')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-two')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-address-form disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-two')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes address-two', async () => {
      const layout = html`<foxy-address-form disabledcontrols="address-two"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-two')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-two')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-address-form hidden></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-two')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes address-two', async () => {
      const layout = html`<foxy-address-form hiddencontrols="address-two"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'address-two')).to.not.exist;
    });
  });

  describe('country', () => {
    it('has i18n label key "country"', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<SelectElement>(element, 'country');
      expect(control).to.have.property('label', 'country');
    });

    it('has value of form.country', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      element.edit({ country: 'US' });

      const control = await getByTestId<SelectElement>(element, 'country');
      expect(control).to.have.property('value', 'US');
    });

    it('writes to form.country on change', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<SelectElement>(element, 'country');

      control!.value = 'US';
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.country', 'US');
    });

    it('renders "country:before" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'country:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "country:before" slot with template "country:before" if available', async () => {
      const name = 'country:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "country:after" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'country:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "country:after" slot with template "country:after" if available', async () => {
      const name = 'country:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'country')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-address-form readonly></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'country')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes country', async () => {
      const layout = html`<foxy-address-form readonlycontrols="country"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'country')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'country')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'country')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'country')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-address-form disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'country')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes country', async () => {
      const layout = html`<foxy-address-form disabledcontrols="country"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'country')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'country')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-address-form hidden></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'country')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes country', async () => {
      const layout = html`<foxy-address-form hiddencontrols="country"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'country')).to.not.exist;
    });
  });

  describe('region', () => {
    it('has i18n label key "region"', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<SelectElement>(element, 'region');
      expect(control).to.have.property('label', 'region');
    });

    it('has value of form.region', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      element.edit({ region: 'GA' });

      const control = await getByTestId<SelectElement>(element, 'region');
      expect(control).to.have.property('value', 'GA');
    });

    it('writes to form.region on change', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<SelectElement>(element, 'region');

      control!.value = 'GA';
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.region', 'GA');
    });

    it('renders "region:before" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'region:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "region:before" slot with template "region:before" if available', async () => {
      const name = 'region:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "region:after" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'region:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "region:after" slot with template "region:after" if available', async () => {
      const name = 'region:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'region')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-address-form readonly></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'region')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes region', async () => {
      const layout = html`<foxy-address-form readonlycontrols="region"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'region')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'region')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'region')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'region')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-address-form disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'region')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes region', async () => {
      const layout = html`<foxy-address-form disabledcontrols="region"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'region')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'region')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-address-form hidden></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'region')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes region', async () => {
      const layout = html`<foxy-address-form hiddencontrols="region"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'region')).to.not.exist;
    });
  });

  describe('city', () => {
    it('has i18n label key "city"', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'city');
      expect(control).to.have.property('label', 'city');
    });

    it('has value of form.city', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      element.edit({ city: 'Mershon' });

      const control = await getByTestId<TextFieldElement>(element, 'city');
      expect(control).to.have.property('value', 'Mershon');
    });

    it('writes to form.city on input', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'city');

      control!.value = 'Mershon';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.city', 'Mershon');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/customer_addresses/0');
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'city');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ city: 'Mershon' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "city:before" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'city:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "city:before" slot with template "city:before" if available', async () => {
      const name = 'city:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "city:after" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'city:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "city:after" slot with template "city:after" if available', async () => {
      const name = 'city:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'city')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-address-form readonly></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'city')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes city', async () => {
      const layout = html`<foxy-address-form readonlycontrols="city"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'city')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'city')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'city')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'city')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-address-form disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'city')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes city', async () => {
      const layout = html`<foxy-address-form disabledcontrols="city"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'city')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'city')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-address-form hidden></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'city')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes city', async () => {
      const layout = html`<foxy-address-form hiddencontrols="city"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'city')).to.not.exist;
    });
  });

  describe('postal-code', () => {
    it('has i18n label key "postal_code"', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'postal-code');
      expect(control).to.have.property('label', 'postal_code');
    });

    it('has value of form.postal_code', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      element.edit({ postal_code: '31551' });

      const control = await getByTestId<TextFieldElement>(element, 'postal-code');
      expect(control).to.have.property('value', '31551');
    });

    it('writes to form.postal_code on input', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'postal-code');

      control!.value = '31551';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.postal_code', '31551');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/customer_addresses/0');
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'postal-code');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ postal_code: '31551' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "postal-code:before" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'postal-code:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "postal-code:before" slot with template "postal-code:before" if available', async () => {
      const name = 'postal-code:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "postal-code:after" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'postal-code:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "postal-code:after" slot with template "postal-code:after" if available', async () => {
      const name = 'postal-code:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'postal-code')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-address-form readonly></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'postal-code')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes postal-code', async () => {
      const layout = html`<foxy-address-form readonlycontrols="postal-code"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'postal-code')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'postal-code')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'postal-code')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-address-form href=${href}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'postal-code')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-address-form disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'postal-code')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes postal-code', async () => {
      const layout = html`<foxy-address-form disabledcontrols="postal-code"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'postal-code')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'postal-code')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-address-form hidden></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'postal-code')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes postal-code', async () => {
      const layout = html`<foxy-address-form hiddencontrols="postal-code"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'postal-code')).to.not.exist;
    });
  });

  describe('timestamps', () => {
    it('once form data is loaded, renders a property table with created and modified dates', async () => {
      const data = await getTestData<Data>('./hapi/customer_addresses/0');
      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      const control = await getByTestId(element, 'timestamps');
      const items = [
        { name: 'date_modified', value: 'date' },
        { name: 'date_created', value: 'date' },
      ];

      expect(control).to.have.deep.property('items', items);
    });

    it('once form data is loaded, renders "timestamps:before" slot', async () => {
      const data = await getTestData<Data>('./hapi/customer_addresses/0');
      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:before" slot with template "timestamps:before" if available', async () => {
      const data = await getTestData<Data>('./hapi/customer_addresses/0');
      const name = 'timestamps:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('once form data is loaded, renders "timestamps:after" slot', async () => {
      const data = await getTestData<Data>('./hapi/customer_addresses/0');
      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:after" slot with template "timestamps:after" if available', async () => {
      const data = await getTestData<Data>('./hapi/customer_addresses/0');
      const name = 'timestamps:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('create', () => {
    it('if data is empty, renders create button', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      expect(await getByTestId(element, 'create')).to.exist;
    });

    it('renders with i18n key "create" for caption', async () => {
      const layout = html`<foxy-address-form lang="es"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      const control = await getByTestId(element, 'create');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'create');
      expect(caption).to.have.attribute('ns', 'address-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-address-form disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      element.edit({ address1: '?'.repeat(1024) });
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-address-form></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);

      element.edit({ address1: '1459 Aaron Smith Drive' });
      element.submit();

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "create"', async () => {
      const layout = html`<foxy-address-form disabledcontrols="create"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const control = await getByTestId<ButtonElement>(element, 'create');
      const submit = stub(element, 'submit');

      element.edit({ address1: '1459 Aaron Smith Drive', address_name: 'Home' });
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-address-form hidden></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "create"', async () => {
      const layout = html`<foxy-address-form hiddencontrols="create"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('renders with "create:before" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'create:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:before" slot with template "create:before" if available and rendered', async () => {
      const name = 'create:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "create:after" slot by default', async () => {
      const element = await fixture<AddressForm>(html`<foxy-address-form></foxy-address-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'create:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:after" slot with template "create:after" if available and rendered', async () => {
      const name = 'create:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('delete', () => {
    it('renders delete button once resource is loaded', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-address-form .data=${data} disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);

      expect(await getByTestId(element, 'delete')).to.exist;
    });

    it('renders with i18n key "delete" for caption', async () => {
      const layout = html`<foxy-address-form href="foxy://null" lang="es"></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      const control = await getByTestId(element, 'delete');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'delete');
      expect(caption).to.have.attribute('ns', 'address-form');
    });

    it('renders disabled if form is disabled', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-address-form .data=${data} disabled></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if data.is_default_billing is true', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);

      data.is_default_billing = true;

      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if data.is_default_shipping is true', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);

      data.is_default_shipping = true;

      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);

      element.edit({ address1: '1459 Aaron Smith Drive' });
      element.submit();

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "delete"', async () => {
      const element = await fixture<AddressForm>(html`
        <foxy-address-form
          .data=${await getTestData<Data>('./hapi/customer_addresses/0')}
          disabledcontrols="delete"
        >
        </foxy-address-form>
      `);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('shows deletion confirmation dialog on click', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'delete');
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.called;
    });

    it('deletes resource if deletion is confirmed', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(false));

      expect(deleteMethod).to.have.been.called;
    });

    it('keeps resource if deletion is cancelled', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(true));

      expect(deleteMethod).not.to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-address-form .data=${data} hidden></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "delete"', async () => {
      const element = await fixture<AddressForm>(html`
        <foxy-address-form
          .data=${await getTestData<Data>('./hapi/customer_addresses/0')}
          hiddencontrols="delete"
        >
        </foxy-address-form>
      `);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('renders with "delete:before" slot by default', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:before" slot with template "delete:before" if available and rendered', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const name = 'delete:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "delete:after" slot by default', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:after" slot with template "delete:after" if available and rendered', async () => {
      const href = 'https://demo.api/hapi/customer_addresses/0';
      const name = 'delete:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AddressForm>(html`
        <foxy-address-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-address-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const router = createRouter();
      const layout = html`
        <foxy-address-form
          href="https://demo.api/virtual/stall"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-address-form>
      `;

      const element = await fixture<AddressForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'address-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const router = createRouter();
      const layout = html`
        <foxy-address-form
          href="https://demo.api/virtual/empty?status=404"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-address-form>
      `;

      const element = await fixture<AddressForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'address-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('./hapi/customer_addresses/0');
      const layout = html`<foxy-address-form .data=${data}></foxy-address-form>`;
      const element = await fixture<AddressForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
