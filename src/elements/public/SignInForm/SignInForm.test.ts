import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { BooleanSelector } from '@foxy.io/sdk/core';
import { ButtonElement } from '@vaadin/vaadin-button';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { NucleonElement } from '../NucleonElement';
import { PasswordFieldElement } from '@vaadin/vaadin-text-field/vaadin-password-field';
import { SignInForm } from './SignInForm';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-element';
import { router } from '../../../server';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('SignInForm', () => {
  it('extends NucleonElement', () => {
    expect(new SignInForm()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-sign-in-form', () => {
    expect(customElements.get('foxy-sign-in-form')).to.equal(SignInForm);
  });

  describe('email', () => {
    it('has i18n label key "email"', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'email');
      expect(control).to.have.property('label', 'email');
    });

    it('has value of form.credential.email', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: 'justice.witt@example.com', password: '' } });

      const control = await getByTestId<TextFieldElement>(element, 'email');
      expect(control).to.have.property('value', 'justice.witt@example.com');
    });

    it('writes to form.credential.email on input', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'email');

      control!.value = 'justice.witt@example.com';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.credential.email', 'justice.witt@example.com');
    });

    it('invalidates the form when empty', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      expect(element.in({ idle: { template: { clean: 'invalid' } } })).to.be.true;
      expect(element.errors).to.include('email_required');
    });

    it('submits valid form on enter', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'email');
      const submit = stub(element, 'submit');

      element.edit({
        type: 'password',
        credential: { email: 'justice.witt@example.com', password: '74ylbsXd47ybOa_3!' },
      });

      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "email:before" slot by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'email:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "email:before" slot with template "email:before" if available', async () => {
      const name = 'email:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-sign-in-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "email:after" slot by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'email:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "email:after" slot with template "email:after" if available', async () => {
      const name = 'email:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-sign-in-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'email')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-sign-in-form readonly></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes email', async () => {
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form readonlycontrols="email"></foxy-sign-in-form>
      `);

      expect(await getByTestId(element, 'email')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'email')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-sign-in-form href=${href}></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.foxycart.com/s/admin/not-found';
      const layout = html`<foxy-sign-in-form href=${href}></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-sign-in-form disabled></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes email', async () => {
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form disabledcontrols="email"></foxy-sign-in-form>
      `);

      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'email')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-sign-in-form hidden></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'email')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes email', async () => {
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form hiddencontrols="email"></foxy-sign-in-form>
      `);

      expect(await getByTestId(element, 'email')).to.not.exist;
    });
  });

  describe('password', () => {
    it('has i18n label key "password"', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'password');

      expect(control).to.have.property('label', 'password');
    });

    it('has value of form.credential.password', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: '', password: '74ylbsXd47ybOa_3!' } });

      const control = await getByTestId<TextFieldElement>(element, 'password');
      expect(control).to.have.property('value', '74ylbsXd47ybOa_3!');
    });

    it('writes to form.credential.password on input', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'password');

      control!.value = '74ylbsXd47ybOa_3!';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.credential.password', '74ylbsXd47ybOa_3!');
    });

    it('invalidates the form when empty', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      expect(element.in({ idle: { template: { clean: 'invalid' } } })).to.be.true;
      expect(element.errors).to.include('password_required');
    });

    it('submits valid form on enter', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'password');
      const submit = stub(element, 'submit');

      element.edit({
        type: 'password',
        credential: { email: 'justice.witt@example.com', password: '74ylbsXd47ybOa_3!' },
      });

      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "password:before" slot by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'password:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "password:before" slot with template "password:before" if available', async () => {
      const name = 'password:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-sign-in-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "password:after" slot by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'password:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "password:after" slot with template "password:after" if available', async () => {
      const name = 'password:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-sign-in-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'password')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-sign-in-form readonly></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'password')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes password', async () => {
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form readonlycontrols="password"></foxy-sign-in-form>
      `);

      expect(await getByTestId(element, 'password')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'password')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-sign-in-form href=${href}></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      expect(await getByTestId(element, 'password')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.foxycart.com/s/admin/not-found';
      const layout = html`<foxy-sign-in-form href=${href}></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      expect(await getByTestId(element, 'password')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-sign-in-form disabled></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'password')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes password', async () => {
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form disabledcontrols="password"></foxy-sign-in-form>
      `);

      expect(await getByTestId(element, 'password')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'password')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-sign-in-form hidden></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'password')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes password', async () => {
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form hiddencontrols="password"></foxy-sign-in-form>
      `);

      expect(await getByTestId(element, 'password')).to.not.exist;
    });
  });

  describe('new-password', () => {
    it('is visible if form.credential.new_password exists', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: '', password: '', new_password: '' } });

      expect(await getByTestId(element, 'new-password')).to.exist;
    });

    ['new_password_required_error', 'new_password_format_error'].forEach(error => {
      it(`is visible if form.errors includes "${error}"`, async () => {
        const element = await fixture<SignInForm>(
          html`
            <foxy-sign-in-form
              parent="https://demo.foxycart.com/s/virtual/session?code=${error}"
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </foxy-sign-in-form>
          `
        );

        element.edit({
          type: 'password',
          credential: { email: 'foo@example.com', password: 'bar' },
        });

        element.submit();
        await waitUntil(() => element.in({ idle: { template: { dirty: 'invalid' } } }));

        expect(await getByTestId(element, 'new-password')).to.exist;
      });
    });

    it('is hidden by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'new-password')).to.not.exist;
    });

    it('is hidden when the form is hidden', async () => {
      const layout = html`<foxy-sign-in-form hidden></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: '', password: '', new_password: '' } });

      expect(await getByTestId(element, 'new-password')).to.not.exist;
    });

    it('is hidden when hiddencontrols matches "new-password"', async () => {
      const layout = html`<foxy-sign-in-form hiddencontrols="new-password"></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: '', password: '', new_password: '' } });

      expect(await getByTestId(element, 'new-password')).to.not.exist;
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: '', password: '', new_password: '' } });

      expect(await getByTestId(element, 'new-password')).not.to.have.attribute('readonly');
    });

    it('is readonly when the form is readonly', async () => {
      const layout = html`<foxy-sign-in-form readonly></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: '', password: '', new_password: '' } });

      expect(await getByTestId(element, 'new-password')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols matches "new-password"', async () => {
      const layout = html`<foxy-sign-in-form readonlycontrols="new-password"></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: '', password: '', new_password: '' } });

      expect(await getByTestId(element, 'new-password')).to.have.attribute('readonly');
    });

    it('is interactive by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: '', password: '', new_password: '' } });

      expect(await getByTestId(element, 'new-password')).not.to.have.attribute('disabled');
    });

    it('is disabled when the form is disabled', async () => {
      const layout = html`<foxy-sign-in-form disabled></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: '', password: '', new_password: '' } });

      expect(await getByTestId(element, 'new-password')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols matches "new-password"', async () => {
      const layout = html`<foxy-sign-in-form disabledcontrols="new-password"></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: '', password: '', new_password: '' } });

      expect(await getByTestId(element, 'new-password')).to.have.attribute('disabled');
    });

    it('has the value of form.credential.new_password', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: '', password: '', new_password: 'Test' } });

      expect(await getByTestId(element, 'new-password')).to.have.property('value', 'Test');
    });

    it('writes to form.credential.new_password on input', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      element.edit({ credential: { email: '', password: '', new_password: '' } });
      const field = (await getByTestId(element, 'new-password')) as PasswordFieldElement;
      field.value = 'Test';
      field.dispatchEvent(new CustomEvent('input'));

      expect(await getByTestId(element, 'new-password')).to.have.property('value', 'Test');
    });

    it('invalidates the form when empty', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      element.edit({
        type: 'password',
        credential: { email: 'foo@example.com', password: 'bar', new_password: '' },
      });

      expect(element.in({ idle: { template: { dirty: 'invalid' } } })).to.be.true;
      expect(element.errors).to.include('new_password_required');
    });

    it('submits valid form on enter', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const submitMethod = stub(element, 'submit');

      element.edit({
        type: 'password',
        credential: { email: 'foo@example.com', password: 'bar', new_password: 'baz' },
      });

      const field = (await getByTestId(element, 'password')) as PasswordFieldElement;
      field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submitMethod).to.have.been.called;
    });

    it('renders "new-password:before" slot when visible', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: '', password: '', new_password: '' } });

      expect(await getByName(element, 'new-password:before')).to.have.property('localName', 'slot');
    });

    it('replaces "new-password:before" slot with template "new-password:before" if available', async () => {
      const name = 'new-password:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-sign-in-form>
      `);

      element.edit({ credential: { email: '', password: '', new_password: '' } });
      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "new-password:after" slot by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      element.edit({ credential: { email: '', password: '', new_password: '' } });

      expect(await getByName(element, 'new-password:after')).to.have.property('localName', 'slot');
    });

    it('replaces "new-password:after" slot with template "new-password:after" if available', async () => {
      const name = 'new-password:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-sign-in-form>
      `);

      element.edit({ credential: { email: '', password: '', new_password: '' } });
      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('error', () => {
    it('is hidden by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const error = await getByTestId(element, 'error');

      expect(error).to.not.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      element.hidden = true;
      element.data = await getTestData('https://demo.foxycart.com/s/virtual/session');

      expect(await getByTestId(element, 'error')).to.not.exist;
    });

    it('is hidden when "error" is part of hiddenControls', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      element.hiddenControls = new BooleanSelector('error');
      element.data = await getTestData('https://demo.foxycart.com/s/virtual/session');

      expect(await getByTestId(element, 'error')).to.not.exist;
    });

    it('is visible with i18n key "unknown_error" if request fails with non-401 status code', async () => {
      const layout = html`<foxy-sign-in-form lang="es"></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      element.edit({
        type: 'password',
        credential: { email: 'justice.witt@example.com', password: '74ylbsXd47ybOa_3!' },
      });

      element.submit();
      await waitUntil(() => element.in('idle'));

      const error = await getByTestId(element, 'error');

      expect(error).to.exist;
      expect(error).to.have.attribute('lang', 'es');
      expect(error).to.have.attribute('key', 'unknown_error');
      expect(error).to.have.attribute('ns', 'sign-in-form');
    });

    [
      'invalid_credential_error',
      'new_password_required_error',
      'new_password_format_error',
    ].forEach(code => {
      it(`is visible with i18n key "${code}" if request fails with code "${code}"`, async () => {
        const element = await fixture<SignInForm>(
          html` <foxy-sign-in-form
            parent="https://demo.foxycart.com/s/virtual/session?code=${code}"
            lang="es"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </foxy-sign-in-form>`
        );

        element.edit({
          type: 'password',
          credential: { email: 'justice.witt@example.com', password: '74ylbsXd47ybOa_3!' },
        });

        element.submit();
        await waitUntil(() => element.in('idle'));

        const error = await getByTestId(element, 'error');

        expect(error).to.exist;
        expect(error).to.have.attribute('lang', 'es');
        expect(error).to.have.attribute('key', code);
        expect(error).to.have.attribute('ns', 'sign-in-form');
      });
    });

    it('renders with "error:before" slot when visible', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      element.edit(await getTestData('https://demo.foxycart.com/s/virtual/session'));
      element.submit();
      await waitUntil(() => element.in('idle'));

      expect(await getByName(element, 'error:before')).to.have.property('localName', 'slot');
    });

    it('replaces "error:before" slot with template "error:before" if available and visible', async () => {
      const name = 'error:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-sign-in-form>
      `);

      element.edit(await getTestData('https://demo.foxycart.com/s/virtual/session'));
      element.submit();
      await waitUntil(() => element.in('idle'));

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "error:after" slot when visible', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      element.edit(await getTestData('https://demo.foxycart.com/s/virtual/session'));
      element.submit();
      await waitUntil(() => element.in('idle'));

      expect(await getByName(element, 'error:after')).to.have.property('localName', 'slot');
    });

    it('replaces "error:after" slot with template "error:after" if available and visible', async () => {
      const name = 'error:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-sign-in-form>
      `);

      element.edit(await getTestData('https://demo.foxycart.com/s/virtual/session'));
      element.submit();
      await waitUntil(() => element.in('idle'));

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('submit', () => {
    it('if data is empty, renders submit button', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'submit')).to.exist;
    });

    it('renders with i18n key "sign_in" for caption', async () => {
      const layout = html`<foxy-sign-in-form lang="es"></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const control = await getByTestId(element, 'submit');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'sign_in');
      expect(caption).to.have.attribute('ns', 'sign-in-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-sign-in-form disabled></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'submit')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'submit')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);

      element.edit({
        type: 'password',
        credential: { email: 'justice.witt@example.com', password: '74ylbsXd47ybOa_3!' },
      });

      element.submit();

      expect(await getByTestId(element, 'submit')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "submit"', async () => {
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form disabledcontrols="submit"></foxy-sign-in-form>
      `);

      expect(await getByTestId(element, 'submit')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'submit');
      const submit = stub(element, 'submit');

      element.edit({
        type: 'password',
        credential: { email: 'justice.witt@example.com', password: '74ylbsXd47ybOa_3!' },
      });

      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-sign-in-form hidden></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      expect(await getByTestId(element, 'submit')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "submit"', async () => {
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form hiddencontrols="submit"></foxy-sign-in-form>
      `);

      expect(await getByTestId(element, 'submit')).to.not.exist;
    });

    it('renders with "submit:before" slot by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'submit:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "submit:before" slot with template "submit:before" if available and rendered', async () => {
      const name = 'submit:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-sign-in-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "submit:after" slot by default', async () => {
      const layout = html`<foxy-sign-in-form></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'submit:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "submit:after" slot with template "submit:after" if available and rendered', async () => {
      const name = 'submit:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-sign-in-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const element = await fixture<SignInForm>(html`
        <foxy-sign-in-form href="https://demo.foxycart.com/s/admin/sleep" lang="es">
        </foxy-sign-in-form>
      `);

      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'sign-in-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('https://demo.foxycart.com/s/virtual/session');
      const layout = html`<foxy-sign-in-form .data=${data}></foxy-sign-in-form>`;
      const element = await fixture<SignInForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
