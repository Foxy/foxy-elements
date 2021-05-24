import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { CustomerForm } from './CustomerForm';
import { Data } from './types';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { NucleonElement } from '../NucleonElement';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-element';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('CustomerForm', () => {
  it('extends NucleonElement', () => {
    expect(new CustomerForm()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-customer-form', () => {
    expect(customElements.get('foxy-customer-form')).to.equal(CustomerForm);
  });

  describe('first-name', () => {
    it('has i18n label key "first_name"', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'first-name');
      expect(control).to.have.property('label', 'first_name');
    });

    it('has value of form.first_name', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      element.edit({ first_name: 'Justice' });

      const control = await getByTestId<TextFieldElement>(element, 'first-name');
      expect(control).to.have.property('value', 'Justice');
    });

    it('writes to form.first_name on input', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'first-name');

      control!.value = 'Justice';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.first_name', 'Justice');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./s/admin/customers/0');
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'first-name');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ first_name: 'Justice' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "first-name:before" slot by default', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'first-name:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "first-name:before" slot with template "first-name:before" if available', async () => {
      const name = 'first-name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "first-name:after" slot by default', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'first-name:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "first-name:after" slot with template "first-name:after" if available', async () => {
      const name = 'first-name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'first-name')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-customer-form readonly></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes first-name', async () => {
      const layout = html`<foxy-customer-form readonlycontrols="first-name"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'first-name')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-customer-form href=${href}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.foxycart.com/s/admin/not-found';
      const layout = html`<foxy-customer-form href=${href}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-customer-form disabled></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes first-name', async () => {
      const layout = html`<foxy-customer-form disabledcontrols="first-name"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-customer-form hidden></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes first-name', async () => {
      const layout = html`<foxy-customer-form hiddencontrols="first-name"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'first-name')).to.not.exist;
    });
  });

  describe('last-name', () => {
    it('has i18n label key "last_name"', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'last-name');
      expect(control).to.have.property('label', 'last_name');
    });

    it('has value of form.last_name', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      element.edit({ last_name: 'Witt' });

      const control = await getByTestId<TextFieldElement>(element, 'last-name');
      expect(control).to.have.property('value', 'Witt');
    });

    it('writes to form.last_name on input', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'last-name');

      control!.value = 'Witt';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.last_name', 'Witt');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./s/admin/customers/0');
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'last-name');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ last_name: 'Witt' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "last-name:before" slot by default', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'last-name:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "last-name:before" slot with template "last-name:before" if available', async () => {
      const name = 'last-name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "last-name:after" slot by default', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'last-name:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "last-name:after" slot with template "last-name:after" if available', async () => {
      const name = 'last-name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'last-name')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-customer-form readonly></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes last-name', async () => {
      const layout = html`<foxy-customer-form readonlycontrols="last-name"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'last-name')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-customer-form href=${href}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.foxycart.com/s/admin/not-found';
      const layout = html`<foxy-customer-form href=${href}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-customer-form disabled></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes last-name', async () => {
      const layout = html`<foxy-customer-form disabledcontrols="last-name"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-customer-form hidden></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes last-name', async () => {
      const layout = html`<foxy-customer-form hiddencontrols="last-name"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'last-name')).to.not.exist;
    });
  });

  describe('email', () => {
    it('has i18n label key "email"', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'email');
      expect(control).to.have.property('label', 'email');
    });

    it('has value of form.email', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      element.edit({ email: 'justice.witt@example.com' });

      const control = await getByTestId<TextFieldElement>(element, 'email');
      expect(control).to.have.property('value', 'justice.witt@example.com');
    });

    it('writes to form.email on input', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'email');

      control!.value = 'justice.witt@example.com';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.email', 'justice.witt@example.com');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./s/admin/customers/0');
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'email');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ email: 'justice.witt@example.com' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "email:before" slot by default', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'email:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "email:before" slot with template "email:before" if available', async () => {
      const name = 'email:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "email:after" slot by default', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'email:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "email:after" slot with template "email:after" if available', async () => {
      const name = 'email:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'email')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-customer-form readonly></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes email', async () => {
      const layout = html`<foxy-customer-form readonlycontrols="email"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'email')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-customer-form href=${href}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.foxycart.com/s/admin/not-found';
      const layout = html`<foxy-customer-form href=${href}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-customer-form disabled></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes email', async () => {
      const layout = html`<foxy-customer-form disabledcontrols="email"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'email')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-customer-form hidden></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'email')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes email', async () => {
      const layout = html`<foxy-customer-form hiddencontrols="email"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'email')).to.not.exist;
    });
  });

  describe('tax-id', () => {
    it('has i18n label key "tax_id"', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'tax-id');
      expect(control).to.have.property('label', 'tax_id');
    });

    it('has value of form.tax_id', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      element.edit({ tax_id: '1234567890' });

      const control = await getByTestId<TextFieldElement>(element, 'tax-id');
      expect(control).to.have.property('value', '1234567890');
    });

    it('writes to form.tax_id on input', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'tax-id');

      control!.value = '1234567890';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.tax_id', '1234567890');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./s/admin/customers/0');
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const control = await getByTestId<TextFieldElement>(element, 'tax-id');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ tax_id: '1234567890' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "tax-id:before" slot by default', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'tax-id:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "tax-id:before" slot with template "tax-id:before" if available', async () => {
      const name = 'tax-id:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "tax-id:after" slot by default', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'tax-id:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "tax-id:after" slot with template "tax-id:after" if available', async () => {
      const name = 'tax-id:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'tax-id')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-customer-form readonly></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'tax-id')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes tax-id', async () => {
      const layout = html`<foxy-customer-form readonlycontrols="tax-id"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'tax-id')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'tax-id')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-customer-form href=${href}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'tax-id')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.foxycart.com/s/admin/not-found';
      const layout = html`<foxy-customer-form href=${href}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'tax-id')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-customer-form disabled></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'tax-id')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes tax-id', async () => {
      const layout = html`<foxy-customer-form disabledcontrols="tax-id"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'tax-id')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'tax-id')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-customer-form hidden></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'tax-id')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes tax-id', async () => {
      const layout = html`<foxy-customer-form hiddencontrols="tax-id"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'tax-id')).to.not.exist;
    });
  });

  describe('timestamps', () => {
    it('once form data is loaded, renders a property table with created and modified dates', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0');
      const layout = html`<foxy-customer-form .data=${data}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      const control = await getByTestId(element, 'timestamps');
      const items = [
        { name: 'date_modified', value: 'date' },
        { name: 'date_created', value: 'date' },
      ];

      expect(control).to.have.deep.property('items', items);
    });

    it('once form data is loaded, renders "timestamps:before" slot', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0');
      const layout = html`<foxy-customer-form .data=${data}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:before" slot with template "timestamps:before" if available', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0');
      const name = 'timestamps:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('once form data is loaded, renders "timestamps:after" slot', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0');
      const layout = html`<foxy-customer-form .data=${data}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:after" slot with template "timestamps:after" if available', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0');
      const name = 'timestamps:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('create', () => {
    it('if data is empty, renders create button', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      expect(await getByTestId(element, 'create')).to.exist;
    });

    it('renders with i18n key "create" for caption', async () => {
      const layout = html`<foxy-customer-form lang="es"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      const control = await getByTestId(element, 'create');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'create');
      expect(caption).to.have.attribute('ns', 'customer-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-customer-form disabled></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-customer-form></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);

      element.edit({ email: 'justice.witt@example.com' });
      element.submit();

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "create"', async () => {
      const layout = html`<foxy-customer-form disabledcontrols="create"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const control = await getByTestId<ButtonElement>(element, 'create');
      const submit = stub(element, 'submit');

      element.edit({ email: 'justice.witt@example.com' });
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-customer-form hidden></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "create"', async () => {
      const layout = html`<foxy-customer-form hiddencontrols="create"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('renders with "create:before" slot by default', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'create:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:before" slot with template "create:before" if available and rendered', async () => {
      const name = 'create:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "create:after" slot by default', async () => {
      const element = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'create:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:after" slot with template "create:after" if available and rendered', async () => {
      const name = 'create:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('delete', () => {
    it('renders delete button once resource is loaded', async () => {
      const href = 'https://demo.foxycart.com/s/admin/customers/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-customer-form .data=${data} disabled></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);

      expect(await getByTestId(element, 'delete')).to.exist;
    });

    it('renders with i18n key "delete" for caption', async () => {
      const layout = html`<foxy-customer-form href="foxy://null" lang="es"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      const control = await getByTestId(element, 'delete');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'delete');
      expect(caption).to.have.attribute('ns', 'customer-form');
    });

    it('renders disabled if form is disabled', async () => {
      const href = 'https://demo.foxycart.com/s/admin/customers/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-customer-form .data=${data} disabled></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const href = 'https://demo.foxycart.com/s/admin/customers/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-customer-form .data=${data}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);

      element.edit({ email: 'justice.witt@example.com' });
      element.submit();

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "delete"', async () => {
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form
          .data=${await getTestData<Data>('https://demo.foxycart.com/s/admin/customers/0')}
          disabledcontrols="delete"
        >
        </foxy-customer-form>
      `);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('shows deletion confirmation dialog on click', async () => {
      const href = 'https://demo.foxycart.com/s/admin/customers/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-customer-form .data=${data}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'delete');
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.called;
    });

    it('deletes resource if deletion is confirmed', async () => {
      const href = 'https://demo.foxycart.com/s/admin/customers/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-customer-form .data=${data}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(false));

      expect(deleteMethod).to.have.been.called;
    });

    it('keeps resource if deletion is cancelled', async () => {
      const href = 'https://demo.foxycart.com/s/admin/customers/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-customer-form .data=${data}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(true));

      expect(deleteMethod).not.to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const href = 'https://demo.foxycart.com/s/admin/customers/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-customer-form .data=${data} hidden></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "delete"', async () => {
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form
          .data=${await getTestData<Data>('https://demo.foxycart.com/s/admin/customers/0')}
          hiddencontrols="delete"
        >
        </foxy-customer-form>
      `);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('renders with "delete:before" slot by default', async () => {
      const href = 'https://demo.foxycart.com/s/admin/customers/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-customer-form .data=${data}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:before" slot with template "delete:before" if available and rendered', async () => {
      const href = 'https://demo.foxycart.com/s/admin/customers/0';
      const name = 'delete:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "delete:after" slot by default', async () => {
      const href = 'https://demo.foxycart.com/s/admin/customers/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-customer-form .data=${data}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:after" slot with template "delete:after" if available and rendered', async () => {
      const href = 'https://demo.foxycart.com/s/admin/customers/0';
      const name = 'delete:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomerForm>(html`
        <foxy-customer-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-customer-form href=${href} lang="es"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'customer-form');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = 'https://demo.foxycart.com/s/admin/not-found';
      const layout = html`<foxy-customer-form href=${href} lang="es"></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'));

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'customer-form');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('https://demo.foxycart.com/s/admin/customers/0');
      const layout = html`<foxy-customer-form .data=${data}></foxy-customer-form>`;
      const element = await fixture<CustomerForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
