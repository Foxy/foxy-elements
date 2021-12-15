import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { AccessRecoveryForm } from './AccessRecoveryForm';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { ButtonElement } from '@vaadin/vaadin-button';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { NucleonElement } from '../NucleonElement';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-element';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('AccessRecoveryForm', () => {
  it('extends NucleonElement', () => {
    expect(new AccessRecoveryForm()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-access-recovery-form', () => {
    expect(customElements.get('foxy-access-recovery-form')).to.equal(AccessRecoveryForm);
  });

  describe('email', () => {
    it('has i18n label key "email"', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'email');
      expect(control).to.have.property('label', 'email');
    });

    it('has value of form.detail.email', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      element.edit({ detail: { email: 'justice.witt@example.com' } });

      const control = await getByTestId<TextFieldElement>(element, 'email');
      expect(control).to.have.property('value', 'justice.witt@example.com');
    });

    it('writes to form.detail.email on input', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'email');

      control!.value = 'justice.witt@example.com';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.detail.email', 'justice.witt@example.com');
    });

    it('invalidates the form when empty', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);

      expect(element.in({ idle: { template: { clean: 'invalid' } } })).to.be.true;
      expect(element.errors).to.include('email_required');
    });

    it('submits valid form on enter', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'email');
      const submit = stub(element, 'submit');

      element.edit({ type: 'email', detail: { email: 'justice.witt@example.com' } });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "email:before" slot by default', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'email:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "email:before" slot with template "email:before" if available', async () => {
      const name = 'email:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AccessRecoveryForm>(html`
        <foxy-access-recovery-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-access-recovery-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "email:after" slot by default', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'email:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "email:after" slot with template "email:after" if available', async () => {
      const name = 'email:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AccessRecoveryForm>(html`
        <foxy-access-recovery-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-access-recovery-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      expect(await getByTestId(element, 'email')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-access-recovery-form readonly></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes email', async () => {
      const element = await fixture<AccessRecoveryForm>(html`
        <foxy-access-recovery-form readonlycontrols="email"></foxy-access-recovery-form>
      `);

      expect(await getByTestId(element, 'email')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      expect(await getByTestId(element, 'email')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-access-recovery-form href=${href}></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);

      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-access-recovery-form href=${href}></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);

      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-access-recovery-form disabled></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes email', async () => {
      const element = await fixture<AccessRecoveryForm>(html`
        <foxy-access-recovery-form disabledcontrols="email"></foxy-access-recovery-form>
      `);

      expect(await getByTestId(element, 'email')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      expect(await getByTestId(element, 'email')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-access-recovery-form hidden></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      expect(await getByTestId(element, 'email')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes email', async () => {
      const element = await fixture<AccessRecoveryForm>(html`
        <foxy-access-recovery-form hiddencontrols="email"></foxy-access-recovery-form>
      `);

      expect(await getByTestId(element, 'email')).to.not.exist;
    });
  });

  describe('message', () => {
    it('is hidden by default', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      const message = await getByTestId(element, 'message');

      expect(message).to.not.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);

      element.hidden = true;
      element.data = await getTestData('https://demo.api/virtual/recovery');

      expect(await getByTestId(element, 'message')).to.not.exist;
    });

    it('is hidden when "message" is part of hiddenControls', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);

      element.hiddenControls = new BooleanSelector('message');
      element.data = await getTestData('https://demo.api/virtual/recovery');

      expect(await getByTestId(element, 'message')).to.not.exist;
    });

    it('is visible with i18n key "unknown_error" in "fail" state', async () => {
      const layout = html`<foxy-access-recovery-form lang="es"></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);

      element.edit({ type: 'email', detail: { email: 'justice.witt@example.com' } });
      element.submit();
      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      const message = await getByTestId(element, 'message');

      expect(message).to.exist;
      expect(message).to.have.attribute('lang', 'es');
      expect(message).to.have.attribute('key', 'unknown_error');
      expect(message).to.have.attribute('ns', 'access-recovery-form');
    });

    it('is visible with i18n key "recover_access_success" in "idle.snapshot" state', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);

      element.data = await getTestData('https://demo.api/virtual/recovery');
      element.lang = 'es';

      const message = await getByTestId(element, 'message');

      expect(message).to.exist;
      expect(message).to.have.attribute('lang', 'es');
      expect(message).to.have.attribute('key', 'recover_access_success');
      expect(message).to.have.attribute('ns', 'access-recovery-form');
    });

    it('renders with "message:before" slot when visible', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);

      element.data = await getTestData('https://demo.api/virtual/recovery');
      element.lang = 'es';

      expect(await getByName(element, 'message:before')).to.have.property('localName', 'slot');
    });

    it('replaces "message:before" slot with template "message:before" if available and visible', async () => {
      const name = 'message:before';
      const data = await getTestData('https://demo.api/virtual/recovery');
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AccessRecoveryForm>(html`
        <foxy-access-recovery-form .data=${data} lang="es">
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-access-recovery-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "message:after" slot when visible', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);

      element.data = await getTestData('https://demo.api/virtual/recovery');
      element.lang = 'es';

      expect(await getByName(element, 'message:after')).to.have.property('localName', 'slot');
    });

    it('replaces "message:after" slot with template "message:after" if available and visible', async () => {
      const name = 'message:after';
      const data = await getTestData('https://demo.api/virtual/recovery');
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AccessRecoveryForm>(html`
        <foxy-access-recovery-form .data=${data} lang="es">
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-access-recovery-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('submit', () => {
    it('if data is empty, renders submit button', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      expect(await getByTestId(element, 'submit')).to.exist;
    });

    it('renders with i18n key "recover_access" for caption', async () => {
      const layout = html`<foxy-access-recovery-form lang="es"></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      const control = await getByTestId(element, 'submit');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'recover_access');
      expect(caption).to.have.attribute('ns', 'access-recovery-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-access-recovery-form disabled></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      expect(await getByTestId(element, 'submit')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      expect(await getByTestId(element, 'submit')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);

      element.edit({ type: 'email', detail: { email: 'justice.witt@example.com' } });
      element.submit();

      expect(await getByTestId(element, 'submit')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "submit"', async () => {
      const element = await fixture<AccessRecoveryForm>(html`
        <foxy-access-recovery-form disabledcontrols="submit"></foxy-access-recovery-form>
      `);

      expect(await getByTestId(element, 'submit')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'submit');
      const submit = stub(element, 'submit');

      element.edit({ type: 'email', detail: { email: 'justice.witt@example.com' } });
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-access-recovery-form hidden></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      expect(await getByTestId(element, 'submit')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "submit"', async () => {
      const element = await fixture<AccessRecoveryForm>(html`
        <foxy-access-recovery-form hiddencontrols="submit"></foxy-access-recovery-form>
      `);

      expect(await getByTestId(element, 'submit')).to.not.exist;
    });

    it('renders with "submit:before" slot by default', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'submit:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "submit:before" slot with template "submit:before" if available and rendered', async () => {
      const name = 'submit:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AccessRecoveryForm>(html`
        <foxy-access-recovery-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-access-recovery-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "submit:after" slot by default', async () => {
      const layout = html`<foxy-access-recovery-form></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'submit:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "submit:after" slot with template "submit:after" if available and rendered', async () => {
      const name = 'submit:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<AccessRecoveryForm>(html`
        <foxy-access-recovery-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-access-recovery-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const element = await fixture<AccessRecoveryForm>(html`
        <foxy-access-recovery-form href="https://demo.api/virtual/stall" lang="es">
        </foxy-access-recovery-form>
      `);

      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'access-recovery-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('https://demo.api/virtual/recovery');
      const layout = html`<foxy-access-recovery-form .data=${data}></foxy-access-recovery-form>`;
      const element = await fixture<AccessRecoveryForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
