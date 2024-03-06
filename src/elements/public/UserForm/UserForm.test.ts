import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import { expect, fixture, html } from '@open-wc/testing';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { getByTestClass } from '../../../testgen/getByTestClass';
import { ButtonElement } from '@vaadin/vaadin-button';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { getByTestId } from '../../../testgen/getByTestId';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { getByName } from '../../../testgen/getByName';
import { UserForm } from './index';
import { Checkbox } from '../../private/index';
import { stub } from 'sinon';
import { I18n } from '../I18n/index';

describe('UserForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-confirm-dialog element', () => {
    expect(customElements.get('foxy-internal-confirm-dialog')).to.exist;
  });

  it('imports and defines vaadin-text-field element', () => {
    expect(customElements.get('vaadin-text-field')).to.exist;
  });

  it('imports and defines vaadin-button element', () => {
    expect(customElements.get('vaadin-button')).to.exist;
  });

  it('imports and defines foxy-internal-form element', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-spinner element', () => {
    expect(customElements.get('foxy-spinner')).to.exist;
  });

  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines itself as foxy-user-form', () => {
    expect(customElements.get('foxy-user-form')).to.equal(UserForm);
  });

  it('extends InternalForm', () => {
    expect(new UserForm()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace of user-form', () => {
    expect(UserForm).to.have.property('defaultNS', 'user-form');
    expect(new UserForm()).to.have.property('ns', 'user-form');
  });

  it('produces a v8n error if first name is too long', () => {
    const form = new UserForm();
    expect(form.errors).to.not.include('first_name_too_long');

    form.edit({ first_name: 'A'.repeat(50) });
    expect(form.errors).to.not.include('first_name_too_long');

    form.edit({ first_name: 'A'.repeat(51) });
    expect(form.errors).to.include('first_name_too_long');
  });

  it('produces a v8n error if last name is too long', () => {
    const form = new UserForm();
    expect(form.errors).to.not.include('last_name_too_long');

    form.edit({ last_name: 'A'.repeat(50) });
    expect(form.errors).to.not.include('last_name_too_long');

    form.edit({ last_name: 'A'.repeat(51) });
    expect(form.errors).to.include('last_name_too_long');
  });

  it('produces a v8n error if email is missing', () => {
    const form = new UserForm();
    expect(form.errors).to.include('email_required');

    form.edit({ email: 'A'.repeat(100) });
    expect(form.errors).to.not.include('email_required');
  });

  it('produces a v8n error if email is too long', () => {
    const form = new UserForm();
    expect(form.errors).to.not.include('email_too_long');

    form.edit({ email: 'A'.repeat(100) });
    expect(form.errors).to.not.include('email_too_long');

    form.edit({ email: 'A'.repeat(101) });
    expect(form.errors).to.include('email_too_long');
  });

  it('produces a v8n error if email is invalid', () => {
    const form = new UserForm();
    expect(form.errors).to.not.include('email_invalid_email');

    form.edit({ email: 'A'.repeat(100) });
    expect(form.errors).to.include('email_invalid_email');

    form.edit({ email: 'test@example.com' });
    expect(form.errors).to.not.include('email_invalid_email');
  });

  it('produces a v8n error if phone is too long', () => {
    const form = new UserForm();
    expect(form.errors).to.not.include('phone_too_long');

    form.edit({ phone: 'A'.repeat(50) });
    expect(form.errors).to.not.include('phone_too_long');

    form.edit({ phone: 'A'.repeat(51) });
    expect(form.errors).to.include('phone_too_long');
  });

  describe('first-name', () => {
    it('is an instance of Vaadin.TextFieldElement', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'first_name');

      expect(control).to.be.instanceOf(TextFieldElement);
    });

    it('has i18n label key "first_name"', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'first_name');

      expect(control).to.have.property('label', 'first_name');
    });

    it('has value of form.first_name', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);

      element.edit({ first_name: 'Alex' });

      const control = await getByTestId<TextFieldElement>(element, 'first_name');
      expect(control).to.have.property('value', 'Alex');
    });

    it('writes to form.first_name on input', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'first_name');

      control!.value = 'Alex';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.first_name', 'Alex');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/users/0');
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'first_name');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ first_name: 'Alex' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "first-name:before" slot by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByName(element, 'first-name:before')).to.have.property('localName', 'slot');
    });

    it('replaces "first-name:before" slot with template "first-name:before" if available', async () => {
      const name = 'first-name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "first-name:after" slot by default', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'first-name:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "first-name:after" slot with template "first-name:after" if available', async () => {
      const name = 'first-name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'first_name')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-user-form readonly></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'first_name')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes first-name', async () => {
      const layout = html`<foxy-user-form readonlycontrols="first-name"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'first_name')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'first_name')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-user-form href=${href}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'first_name')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-user-form href=${href}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'first_name')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-user-form disabled></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'first_name')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes first-name', async () => {
      const layout = html`<foxy-user-form disabledcontrols="first-name"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'first_name')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'first_name')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-user-form hidden></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'first_name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes first-name', async () => {
      const layout = html`<foxy-user-form hiddencontrols="first-name"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'first_name')).to.not.exist;
    });
  });

  describe('last-name', () => {
    it('is an instance of Vaadin.TextFieldElement', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'last_name');

      expect(control).to.be.instanceOf(TextFieldElement);
    });

    it('has i18n label key "last_name"', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'last_name');

      expect(control).to.have.property('label', 'last_name');
    });

    it('has value of form.last_name', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);

      element.edit({ last_name: 'Alex' });

      const control = await getByTestId<TextFieldElement>(element, 'last_name');
      expect(control).to.have.property('value', 'Alex');
    });

    it('writes to form.last_name on input', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'last_name');

      control!.value = 'Alex';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.last_name', 'Alex');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/users/0');
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'last_name');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ last_name: 'Alex' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "last-name:before" slot by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByName(element, 'last-name:before')).to.have.property('localName', 'slot');
    });

    it('replaces "last-name:before" slot with template "last-name:before" if available', async () => {
      const name = 'last-name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "last-name:after" slot by default', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'last-name:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "last-name:after" slot with template "last-name:after" if available', async () => {
      const name = 'last-name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'last_name')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-user-form readonly></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'last_name')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes last-name', async () => {
      const layout = html`<foxy-user-form readonlycontrols="last-name"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'last_name')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'last_name')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-user-form href=${href}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'last_name')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-user-form href=${href}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'last_name')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-user-form disabled></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'last_name')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes last-name', async () => {
      const layout = html`<foxy-user-form disabledcontrols="last-name"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'last_name')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'last_name')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-user-form hidden></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'last_name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes last-name', async () => {
      const layout = html`<foxy-user-form hiddencontrols="last-name"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'last_name')).to.not.exist;
    });
  });

  describe('email', () => {
    it('is an instance of Vaadin.TextFieldElement', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'email');

      expect(control).to.be.instanceOf(TextFieldElement);
    });

    it('has i18n label key "email"', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'email');

      expect(control).to.have.property('label', 'email');
    });

    it('has value of form.email', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);

      element.edit({ email: 'Alex' });

      const control = await getByTestId<TextFieldElement>(element, 'email');
      expect(control).to.have.property('value', 'Alex');
    });

    it('writes to form.email on input', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'email');

      control!.value = 'Alex';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.email', 'Alex');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/users/0');
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'email');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ email: 'Alex' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "email:before" slot by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByName(element, 'email:before')).to.have.property('localName', 'slot');
    });

    it('replaces "email:before" slot with template "email:before" if available', async () => {
      const name = 'email:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "email:after" slot by default', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'email:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "email:after" slot with template "email:after" if available', async () => {
      const name = 'email:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'email')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-user-form readonly></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes email', async () => {
      const layout = html`<foxy-user-form readonlycontrols="email"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'email')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-user-form href=${href}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-user-form href=${href}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-user-form disabled></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes email', async () => {
      const layout = html`<foxy-user-form disabledcontrols="email"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'email')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-user-form hidden></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'email')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes email', async () => {
      const layout = html`<foxy-user-form hiddencontrols="email"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'email')).to.not.exist;
    });
  });

  describe('phone', () => {
    it('is an instance of Vaadin.TextFieldElement', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'phone');

      expect(control).to.be.instanceOf(TextFieldElement);
    });

    it('has i18n label key "phone"', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'phone');

      expect(control).to.have.property('label', 'phone');
    });

    it('has value of form.phone', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);

      element.edit({ phone: 'Alex' });

      const control = await getByTestId<TextFieldElement>(element, 'phone');
      expect(control).to.have.property('value', 'Alex');
    });

    it('writes to form.phone on input', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'phone');

      control!.value = 'Alex';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.phone', 'Alex');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/users/0');
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'phone');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ phone: 'Alex' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "phone:before" slot by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByName(element, 'phone:before')).to.have.property('localName', 'slot');
    });

    it('replaces "phone:before" slot with template "phone:before" if available', async () => {
      const name = 'phone:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "phone:after" slot by default', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'phone:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "phone:after" slot with template "phone:after" if available', async () => {
      const name = 'phone:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'phone')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-user-form readonly></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'phone')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes phone', async () => {
      const layout = html`<foxy-user-form readonlycontrols="phone"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'phone')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'phone')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-user-form href=${href}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'phone')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-user-form href=${href}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'phone')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-user-form disabled></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'phone')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes phone', async () => {
      const layout = html`<foxy-user-form disabledcontrols="phone"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'phone')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'phone')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-user-form hidden></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'phone')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes phone', async () => {
      const layout = html`<foxy-user-form hiddencontrols="phone"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'phone')).to.not.exist;
    });
  });

  describe('role', () => {
    it('renders checkboxes with role options', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const checkboxes = await getByTestClass(element, 'role-option');

      const merchant = checkboxes[0];
      const merchantLabel = merchant.querySelector('[key="merchant"]');
      const merchantExplainer = merchant.querySelector('[key="merchant_explainer"]');

      const backendDev = checkboxes[1];
      const backendDevLabel = backendDev.querySelector('[key="backend_developer"]');
      const backendDevExplainer = backendDev.querySelector('[key="backend_developer_explainer"]');

      const frontendDev = checkboxes[2];
      const frontendDevLabel = frontendDev.querySelector('[key="frontend_developer"]');
      const frontendDevExplainer = frontendDev.querySelector(
        '[key="frontend_developer_explainer"]'
      );

      const designer = checkboxes[3];
      const designerLabel = designer.querySelector('[key="designer"]');
      const designerExplainer = designer.querySelector('[key="designer_explainer"]');

      expect(merchant).to.be.instanceOf(Checkbox);
      expect(merchantLabel).to.be.instanceOf(I18n);
      expect(merchantLabel).to.have.attribute('infer', '');
      expect(merchantExplainer).to.be.instanceOf(I18n);
      expect(merchantExplainer).to.have.attribute('infer', '');

      expect(backendDev).to.be.instanceOf(Checkbox);
      expect(backendDevLabel).to.be.instanceOf(I18n);
      expect(backendDevLabel).to.have.attribute('infer', '');
      expect(backendDevExplainer).to.be.instanceOf(I18n);
      expect(backendDevExplainer).to.have.attribute('infer', '');

      expect(frontendDev).to.be.instanceOf(Checkbox);
      expect(frontendDevLabel).to.be.instanceOf(I18n);
      expect(frontendDevLabel).to.have.attribute('infer', '');
      expect(frontendDevExplainer).to.be.instanceOf(I18n);
      expect(frontendDevExplainer).to.have.attribute('infer', '');

      expect(designer).to.be.instanceOf(Checkbox);
      expect(designerLabel).to.be.instanceOf(I18n);
      expect(designerLabel).to.have.attribute('infer', '');
      expect(designerExplainer).to.be.instanceOf(I18n);
      expect(designerExplainer).to.have.attribute('infer', '');
    });

    it('reflects the value of is_merchant to checkboxes', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const checkboxes = await getByTestClass(element, 'role-option');

      const merchant = checkboxes[0];
      const backendDev = checkboxes[1];
      const frontendDev = checkboxes[2];
      const designer = checkboxes[3];

      expect(merchant).to.not.have.attribute('checked');
      expect(backendDev).to.not.have.attribute('checked');
      expect(frontendDev).to.not.have.attribute('checked');
      expect(designer).to.not.have.attribute('checked');

      element.edit({ is_merchant: true });
      await element.requestUpdate();

      expect(merchant).to.have.attribute('checked');
      expect(backendDev).to.not.have.attribute('checked');
      expect(frontendDev).to.not.have.attribute('checked');
      expect(designer).to.not.have.attribute('checked');
    });

    it('reflects the value of is_programmer to checkboxes', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const checkboxes = await getByTestClass(element, 'role-option');

      const merchant = checkboxes[0];
      const backendDev = checkboxes[1];
      const frontendDev = checkboxes[2];
      const designer = checkboxes[3];

      expect(merchant).to.not.have.attribute('checked');
      expect(backendDev).to.not.have.attribute('checked');
      expect(frontendDev).to.not.have.attribute('checked');
      expect(designer).to.not.have.attribute('checked');

      element.edit({ is_programmer: true });
      await element.requestUpdate();

      expect(merchant).to.not.have.attribute('checked');
      expect(backendDev).to.have.attribute('checked');
      expect(frontendDev).to.not.have.attribute('checked');
      expect(designer).to.not.have.attribute('checked');
    });

    it('reflects the value of is_front_end_developer to checkboxes', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const checkboxes = await getByTestClass(element, 'role-option');

      const merchant = checkboxes[0];
      const backendDev = checkboxes[1];
      const frontendDev = checkboxes[2];
      const designer = checkboxes[3];

      expect(merchant).to.not.have.attribute('checked');
      expect(backendDev).to.not.have.attribute('checked');
      expect(frontendDev).to.not.have.attribute('checked');
      expect(designer).to.not.have.attribute('checked');

      element.edit({ is_front_end_developer: true });
      await element.requestUpdate();

      expect(merchant).to.not.have.attribute('checked');
      expect(backendDev).to.not.have.attribute('checked');
      expect(frontendDev).to.have.attribute('checked');
      expect(designer).to.not.have.attribute('checked');
    });

    it('reflects the value of is_designer to checkboxes', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const checkboxes = await getByTestClass(element, 'role-option');

      const merchant = checkboxes[0];
      const backendDev = checkboxes[1];
      const frontendDev = checkboxes[2];
      const designer = checkboxes[3];

      expect(merchant).to.not.have.attribute('checked');
      expect(backendDev).to.not.have.attribute('checked');
      expect(frontendDev).to.not.have.attribute('checked');
      expect(designer).to.not.have.attribute('checked');

      element.edit({ is_designer: true });
      await element.requestUpdate();

      expect(merchant).to.not.have.attribute('checked');
      expect(backendDev).to.not.have.attribute('checked');
      expect(frontendDev).to.not.have.attribute('checked');
      expect(designer).to.have.attribute('checked');
    });

    it('sets the value of is_merchant on change', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      expect(element).to.not.have.nested.property('form.is_merchant');

      const checkboxes = await getByTestClass<Checkbox>(element, 'role-option');
      checkboxes[0].checked = true;
      checkboxes[0].dispatchEvent(new CustomEvent('change'));
      expect(element).to.have.nested.property('form.is_merchant', true);

      checkboxes[0].checked = false;
      checkboxes[0].dispatchEvent(new CustomEvent('change'));
      expect(element).to.have.nested.property('form.is_merchant', false);
    });

    it('sets the value of is_programmer on change', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      expect(element).to.not.have.nested.property('form.is_programmer');

      const checkboxes = await getByTestClass<Checkbox>(element, 'role-option');
      checkboxes[1].checked = true;
      checkboxes[1].dispatchEvent(new CustomEvent('change'));
      expect(element).to.have.nested.property('form.is_programmer', true);

      checkboxes[1].checked = false;
      checkboxes[1].dispatchEvent(new CustomEvent('change'));
      expect(element).to.have.nested.property('form.is_programmer', false);
    });

    it('sets the value of is_front_end_developer on change', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      expect(element).to.not.have.nested.property('form.is_front_end_developer');

      const checkboxes = await getByTestClass<Checkbox>(element, 'role-option');
      checkboxes[2].checked = true;
      checkboxes[2].dispatchEvent(new CustomEvent('change'));
      expect(element).to.have.nested.property('form.is_front_end_developer', true);

      checkboxes[2].checked = false;
      checkboxes[2].dispatchEvent(new CustomEvent('change'));
      expect(element).to.have.nested.property('form.is_front_end_developer', false);
    });

    it('sets the value of is_designer on change', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      expect(element).to.not.have.nested.property('form.is_designer');

      const checkboxes = await getByTestClass<Checkbox>(element, 'role-option');
      checkboxes[3].checked = true;
      checkboxes[3].dispatchEvent(new CustomEvent('change'));
      expect(element).to.have.nested.property('form.is_designer', true);

      checkboxes[3].checked = false;
      checkboxes[3].dispatchEvent(new CustomEvent('change'));
      expect(element).to.have.nested.property('form.is_designer', false);
    });

    it('renders "role:before" slot by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByName(element, 'role:before')).to.have.property('localName', 'slot');
    });

    it('replaces "role:before" slot with template "role:before" if available', async () => {
      const name = 'role:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "role:after" slot by default', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'role:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "role:after" slot with template "role:after" if available', async () => {
      const name = 'role:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const checkboxes = await getByTestClass(element, 'role-option');
      checkboxes.forEach(checkbox => expect(checkbox).to.not.have.attribute('readonly'));
    });

    it('is readonly when the form is readonly', async () => {
      const layout = html`<foxy-user-form readonly></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const checkboxes = await getByTestClass(element, 'role-option');
      checkboxes.forEach(checkbox => expect(checkbox).to.have.attribute('readonly'));
    });

    it('is readonly when targeted with readonlycontrols', async () => {
      const layout = html`<foxy-user-form readonlycontrols="role"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const checkboxes = await getByTestClass(element, 'role-option');
      checkboxes.forEach(checkbox => expect(checkbox).to.have.attribute('readonly'));
    });

    it('is interactive by default', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const checkboxes = await getByTestClass(element, 'role-option');
      checkboxes.forEach(checkbox => expect(checkbox).to.not.have.attribute('disabled'));
    });

    it('is disabled when the form is disabled', async () => {
      const layout = html`<foxy-user-form disabled></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const checkboxes = await getByTestClass(element, 'role-option');
      checkboxes.forEach(checkbox => expect(checkbox).to.have.attribute('disabled'));
    });

    it('is disabled when targeted with disabledcontrols', async () => {
      const layout = html`<foxy-user-form disabledcontrols="role"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const checkboxes = await getByTestClass(element, 'role-option');
      checkboxes.forEach(checkbox => expect(checkbox).to.have.attribute('disabled'));
    });

    it('is disabled when the form is loading data', async () => {
      const router = createRouter();
      const element = await fixture<UserForm>(
        html`
          <foxy-user-form
            href="https://demo.api/virtual/stall"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </foxy-user-form>
        `
      );

      const checkboxes = await getByTestClass(element, 'role-option');
      checkboxes.forEach(checkbox => expect(checkbox).to.have.attribute('disabled'));
    });
  });

  describe('create', () => {
    it('if data is empty, renders create button', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'create')).to.exist;
    });

    it('renders with i18n key "create" for caption', async () => {
      const layout = html`<foxy-user-form lang="es"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId(element, 'create');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'create');
      expect(caption).to.have.attribute('ns', 'user-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-user-form disabled></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);

      element.edit({ email: 'test@example.com' });
      element.submit();

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "create"', async () => {
      const layout = html`<foxy-user-form disabledcontrols="create"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const submit = stub(element, 'submit');
      element.edit({ email: 'test@example.com' });

      const control = await getByTestId<ButtonElement>(element, 'create');
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-user-form hidden></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "create"', async () => {
      const layout = html`<foxy-user-form hiddencontrols="create"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('renders with "create:before" slot by default', async () => {
      const layout = html`<foxy-user-form></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'create:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:before" slot with template "create:before" if available and rendered', async () => {
      const name = 'create:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "create:after" slot by default', async () => {
      const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'create:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:after" slot with template "create:after" if available and rendered', async () => {
      const name = 'create:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('delete', () => {
    it('renders delete button once resource is loaded', async () => {
      const href = './hapi/users/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-user-form .data=${data} disabled></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);

      expect(await getByTestId(element, 'delete')).to.exist;
    });

    it('renders with i18n key "delete" for caption', async () => {
      const data = await getTestData('./hapi/users/0');
      const layout = html`<foxy-user-form .data=${data} lang="es"></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId(element, 'delete');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'delete');
      expect(caption).to.have.attribute('ns', 'user-form');
    });

    it('renders disabled if form is disabled', async () => {
      const data = await getTestData('./hapi/users/0');
      const layout = html`<foxy-user-form .data=${data} disabled></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const data = await getTestData('./hapi/users/0');
      const layout = html`<foxy-user-form .data=${data}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);

      element.edit({ email: 'test@example.com' });
      element.submit();

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "delete"', async () => {
      const element = await fixture<UserForm>(html`
        <foxy-user-form
          .data=${await getTestData<Data>('./hapi/users/0')}
          disabledcontrols="delete"
        >
        </foxy-user-form>
      `);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('shows deletion confirmation dialog on click', async () => {
      const data = await getTestData('./hapi/users/0');
      const layout = html`<foxy-user-form .data=${data}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'delete');
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.called;
    });

    it('deletes resource if deletion is confirmed', async () => {
      const data = await getTestData('./hapi/users/0');
      const layout = html`<foxy-user-form .data=${data}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(false));

      expect(deleteMethod).to.have.been.called;
    });

    it('keeps resource if deletion is cancelled', async () => {
      const data = await getTestData('./hapi/users/0');
      const layout = html`<foxy-user-form .data=${data}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(true));

      expect(deleteMethod).not.to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const data = await getTestData('./hapi/users/0');
      const layout = html`<foxy-user-form .data=${data} hidden></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "delete"', async () => {
      const element = await fixture<UserForm>(html`
        <foxy-user-form .data=${await getTestData<Data>('./hapi/users/0')} hiddencontrols="delete">
        </foxy-user-form>
      `);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('renders with "delete:before" slot by default', async () => {
      const data = await getTestData('./hapi/users/0');
      const layout = html`<foxy-user-form .data=${data}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:before" slot with template "delete:before" if available and rendered', async () => {
      const href = './hapi/users/0';
      const name = 'delete:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "delete:after" slot by default', async () => {
      const data = await getTestData('./hapi/users/0');
      const layout = html`<foxy-user-form .data=${data}></foxy-user-form>`;
      const element = await fixture<UserForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:after" slot with template "delete:after" if available and rendered', async () => {
      const href = './hapi/users/0';
      const name = 'delete:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<UserForm>(html`
        <foxy-user-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-user-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });
});
