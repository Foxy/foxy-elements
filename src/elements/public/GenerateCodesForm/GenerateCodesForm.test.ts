import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { GenerateCodesForm } from './index';
import { IntegerFieldElement } from '@vaadin/vaadin-text-field/vaadin-integer-field';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NumberFieldElement } from '@vaadin/vaadin-text-field/vaadin-number-field';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('GenerateCodesForm', () => {
  it('extends NucleonElement', () => {
    expect(new GenerateCodesForm()).to.be.instanceOf(NucleonElement);
  });

  it('defines a custom element named foxy-generate-codes-form', () => {
    expect(customElements.get('foxy-generate-codes-form')).to.equal(GenerateCodesForm);
  });

  it('has a default i18next namespace "generate-codes-form"', () => {
    expect(new GenerateCodesForm()).to.have.property('ns', 'generate-codes-form');
  });

  describe('length', () => {
    it('has i18n label key "length"', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<IntegerFieldElement>(element, 'length');

      expect(control).to.have.property('label', 'length');
    });

    it('has value of form.length', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      element.edit({ length: 10 });

      const control = await getByTestId<IntegerFieldElement>(element, 'length');
      expect(control).to.have.property('value', '10');
    });

    it('writes to form.length on change', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<IntegerFieldElement>(element, 'length');

      control!.value = '10';
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.length', 10);
    });

    it('submits valid form on enter', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<IntegerFieldElement>(element, 'length');
      const submit = stub(element, 'submit');

      element.edit({ length: 10, number_of_codes: 100 });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "length:before" slot by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'length:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "length:before" slot with template "length:before" if available', async () => {
      const name = 'length:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-generate-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "length:after" slot by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'length:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "length:after" slot with template "length:after" if available', async () => {
      const name = 'length:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-generate-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'length')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-generate-codes-form readonly></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'length')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes length', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form readonlycontrols="length"></foxy-generate-codes-form>
      `);

      expect(await getByTestId(element, 'length')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'length')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-generate-codes-form href=${href}></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'length')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-generate-codes-form href=${href}></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'length')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-generate-codes-form disabled></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'length')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes length', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form disabledcontrols="length"></foxy-generate-codes-form>
      `);

      expect(await getByTestId(element, 'length')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'length')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-generate-codes-form hidden></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'length')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes length', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form hiddencontrols="length"></foxy-generate-codes-form>
      `);

      expect(await getByTestId(element, 'length')).to.not.exist;
    });
  });

  describe('number-of-codes', () => {
    it('has i18n label key "number_of_codes"', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<IntegerFieldElement>(element, 'number-of-codes');

      expect(control).to.have.property('label', 'number_of_codes');
    });

    it('has value of form.number_of_codes', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      element.edit({ number_of_codes: 10 });

      const control = await getByTestId<IntegerFieldElement>(element, 'number-of-codes');
      expect(control).to.have.property('value', '10');
    });

    it('writes to form.number_of_codes on change', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<IntegerFieldElement>(element, 'number-of-codes');

      control!.value = '10';
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.number_of_codes', 10);
    });

    it('submits valid form on enter', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<IntegerFieldElement>(element, 'number-of-codes');
      const submit = stub(element, 'submit');

      element.edit({ length: 10, number_of_codes: 100 });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "number-of-codes:before" slot by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'number-of-codes:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "number-of-codes:before" slot with template "number-of-codes:before" if available', async () => {
      const name = 'number-of-codes:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-generate-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "number-of-codes:after" slot by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'number-of-codes:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "number-of-codes:after" slot with template "number-of-codes:after" if available', async () => {
      const name = 'number-of-codes:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-generate-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'number-of-codes')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-generate-codes-form readonly></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'number-of-codes')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes number-of-codes', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form readonlycontrols="number-of-codes"></foxy-generate-codes-form>
      `);

      expect(await getByTestId(element, 'number-of-codes')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'number-of-codes')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-generate-codes-form href=${href}></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'number-of-codes')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-generate-codes-form href=${href}></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'number-of-codes')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-generate-codes-form disabled></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'number-of-codes')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes number-of-codes', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form disabledcontrols="number-of-codes"></foxy-generate-codes-form>
      `);

      expect(await getByTestId(element, 'number-of-codes')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'number-of-codes')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-generate-codes-form hidden></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'number-of-codes')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes number-of-codes', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form hiddencontrols="number-of-codes"></foxy-generate-codes-form>
      `);

      expect(await getByTestId(element, 'number-of-codes')).to.not.exist;
    });
  });

  describe('current-balance', () => {
    it('has i18n label key "balance"', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<NumberFieldElement>(element, 'current-balance');

      expect(control).to.have.property('label', 'balance');
    });

    it('has value of form.current_balance', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      element.edit({ current_balance: 10 });

      const control = await getByTestId<NumberFieldElement>(element, 'current-balance');
      expect(control).to.have.property('value', '10');
    });

    it('writes to form.current_balance on change', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<NumberFieldElement>(element, 'current-balance');

      control!.value = '10';
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.current_balance', 10);
    });

    it('submits valid form on enter', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<NumberFieldElement>(element, 'current-balance');
      const submit = stub(element, 'submit');

      element.edit({ length: 10, number_of_codes: 100 });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "current-balance:before" slot by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'current-balance:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "current-balance:before" slot with template "current-balance:before" if available', async () => {
      const name = 'current-balance:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-generate-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "current-balance:after" slot by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'current-balance:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "current-balance:after" slot with template "current-balance:after" if available', async () => {
      const name = 'current-balance:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-generate-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-generate-codes-form readonly></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes current-balance', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form readonlycontrols="current-balance"></foxy-generate-codes-form>
      `);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-generate-codes-form href=${href}></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-generate-codes-form href=${href}></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-generate-codes-form disabled></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes current-balance', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form disabledcontrols="current-balance"></foxy-generate-codes-form>
      `);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-generate-codes-form hidden></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes current-balance', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form hiddencontrols="current-balance"></foxy-generate-codes-form>
      `);

      expect(await getByTestId(element, 'current-balance')).to.not.exist;
    });
  });

  describe('prefix', () => {
    it('has i18n label key "prefix"', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'prefix');

      expect(control).to.have.attribute('label', 'prefix');
    });

    it('has i18n helper text key "leave_empty_for_random_codes"', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'prefix');

      expect(control).to.have.attribute('helper-text', 'leave_empty_for_random_codes');
    });

    it('has value of form.prefix', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      element.edit({ prefix: 'foo' });

      const control = await getByTestId<TextFieldElement>(element, 'prefix');
      expect(control).to.have.property('value', 'foo');
    });

    it('writes to form.prefix on change', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'prefix');

      control!.value = 'foo';
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.prefix', 'foo');
    });

    it('submits valid form on enter', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'prefix');
      const submit = stub(element, 'submit');

      element.edit({ length: 10, number_of_codes: 100 });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "prefix:before" slot by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'prefix:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "prefix:before" slot with template "prefix:before" if available', async () => {
      const name = 'prefix:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-generate-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "prefix:after" slot by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'prefix:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "prefix:after" slot with template "prefix:after" if available', async () => {
      const name = 'prefix:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-generate-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'prefix')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-generate-codes-form readonly></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'prefix')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes prefix', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form readonlycontrols="prefix"></foxy-generate-codes-form>
      `);

      expect(await getByTestId(element, 'prefix')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'prefix')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-generate-codes-form href=${href}></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'prefix')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-generate-codes-form href=${href}></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'prefix')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-generate-codes-form disabled></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'prefix')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes prefix', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form disabledcontrols="prefix"></foxy-generate-codes-form>
      `);

      expect(await getByTestId(element, 'prefix')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'prefix')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-generate-codes-form hidden></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'prefix')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes prefix', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form hiddencontrols="prefix"></foxy-generate-codes-form>
      `);

      expect(await getByTestId(element, 'prefix')).to.not.exist;
    });
  });

  describe('generate', () => {
    it('if data is empty, renders generate button', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'generate')).to.exist;
    });

    it('renders with i18n key "generate" for caption', async () => {
      const layout = html`<foxy-generate-codes-form lang="es"></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId(element, 'generate');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'generate');
      expect(caption).to.have.attribute('ns', 'generate-codes-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-generate-codes-form disabled></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'generate')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      element.edit({ length: 10 });

      expect(await getByTestId(element, 'generate')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      element.edit({ length: 10, number_of_codes: 100 });
      element.submit();

      expect(await getByTestId(element, 'generate')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "generate"', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form disabledcontrols="generate"></foxy-generate-codes-form>
      `);

      element.edit({ length: 10, number_of_codes: 100 });
      await element.updateComplete;

      expect(await getByTestId(element, 'generate')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'generate');
      const submit = stub(element, 'submit');

      element.edit({ length: 10, number_of_codes: 100 });
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-generate-codes-form hidden></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);

      expect(await getByTestId(element, 'generate')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "generate"', async () => {
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form hiddencontrols="generate"></foxy-generate-codes-form>
      `);

      expect(await getByTestId(element, 'generate')).to.not.exist;
    });

    it('renders with "generate:before" slot by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'generate:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "generate:before" slot with template "generate:before" if available and rendered', async () => {
      const name = 'generate:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-generate-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "generate:after" slot by default', async () => {
      const layout = html`<foxy-generate-codes-form></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'generate:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "generate:after" slot with template "generate:after" if available and rendered', async () => {
      const name = 'generate:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-generate-codes-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const href = 'https://demo.api/virtual/stall';
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form href=${href} lang="es"></foxy-generate-codes-form>
      `);

      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'generate-codes-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const element = await fixture<GenerateCodesForm>(html`
        <foxy-generate-codes-form href=${href} lang="es"></foxy-generate-codes-form>
      `);

      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'generate-codes-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('./hapi/generate_codes/0');
      const layout = html`<foxy-generate-codes-form .data=${data}></foxy-generate-codes-form>`;
      const element = await fixture<GenerateCodesForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
