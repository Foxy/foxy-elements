import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { Data } from './types';
import { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { GiftCardCodeForm } from './index';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NumberFieldElement } from '@vaadin/vaadin-text-field/vaadin-number-field';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('GiftCardCodeForm', () => {
  it('extends NucleonElement', () => {
    expect(new GiftCardCodeForm()).to.be.instanceOf(NucleonElement);
  });

  it('defines a custom element named foxy-gift-card-code-form', () => {
    expect(customElements.get('foxy-gift-card-code-form')).to.equal(GiftCardCodeForm);
  });

  it('has a default i18next namespace "gift-card-code-form"', () => {
    expect(new GiftCardCodeForm()).to.have.property('ns', 'gift-card-code-form');
  });

  describe('code', () => {
    it('has i18n label key "code"', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'code');

      expect(control).to.have.property('label', 'code');
    });

    it('has value of form.code', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      element.edit({ code: 'TEST_123' });

      const control = await getByTestId<TextFieldElement>(element, 'code');
      expect(control).to.have.property('value', 'TEST_123');
    });

    it('writes to form.code on input', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'code');

      control!.value = 'TEST_123';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.code', 'TEST_123');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/gift_card_codes/0');
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'code');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ code: 'TEST_123' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "code:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'code:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "code:before" slot with template "code:before" if available', async () => {
      const name = 'code:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "code:after" slot by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'code:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "code:after" slot with template "code:after" if available', async () => {
      const name = 'code:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'code')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-gift-card-code-form readonly></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes code', async () => {
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form readonlycontrols="code"></foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'code')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'code')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-gift-card-code-form href=${href}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-gift-card-code-form href=${href}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-gift-card-code-form disabled></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes code', async () => {
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form disabledcontrols="code"></foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'code')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-gift-card-code-form hidden></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'code')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes code', async () => {
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form hiddencontrols="code"></foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'code')).to.not.exist;
    });
  });

  describe('current-balance', () => {
    it('has i18n label key "current_balance"', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const control = await getByTestId<NumberFieldElement>(element, 'current-balance');

      expect(control).to.have.property('label', 'current_balance');
    });

    it('has value of form.current_balance', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      element.edit({ current_balance: 10 });

      const control = await getByTestId<NumberFieldElement>(element, 'current-balance');
      expect(control).to.have.property('value', '10');
    });

    it('writes to form.current_balance on change', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const control = await getByTestId<NumberFieldElement>(element, 'current-balance');

      control!.value = '10';
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.current_balance', 10);
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/gift_card_codes/0');
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const control = await getByTestId<NumberFieldElement>(element, 'current-balance');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ current_balance: 10 });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "current-balance:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'current-balance:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "current-balance:before" slot with template "current-balance:before" if available', async () => {
      const name = 'current-balance:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "current-balance:after" slot by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'current-balance:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "current-balance:after" slot with template "current-balance:after" if available', async () => {
      const name = 'current-balance:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'current-balance')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-gift-card-code-form readonly></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes current-balance', async () => {
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form readonlycontrols="current-balance"></foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'current-balance')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-gift-card-code-form href=${href}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-gift-card-code-form href=${href}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-gift-card-code-form disabled></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes current-balance', async () => {
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form disabledcontrols="current-balance"></foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'current-balance')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-gift-card-code-form hidden></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'current-balance')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes current-balance', async () => {
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form hiddencontrols="current-balance"></foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'current-balance')).to.not.exist;
    });
  });

  describe('end-date', () => {
    it('has i18n label key "end_date"', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const control = await getByTestId<DatePickerElement>(element, 'end-date');

      expect(control).to.have.property('label', 'end_date');
    });

    it('has value of form.end_date', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      element.edit({ end_date: '2022-12-31' });

      const control = await getByTestId<DatePickerElement>(element, 'end-date');
      expect(control).to.have.property('value', '2022-12-31');
    });

    it('writes to form.end_date on change', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const control = await getByTestId<DatePickerElement>(element, 'end-date');

      control!.value = '2022-12-31';
      control!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.end_date', '2022-12-31');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/gift_card_codes/0');
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const control = await getByTestId<DatePickerElement>(element, 'end-date');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ end_date: '2022-12-31' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "end-date:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'end-date:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "end-date:before" slot with template "end-date:before" if available', async () => {
      const name = 'end-date:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "end-date:after" slot by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'end-date:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "end-date:after" slot with template "end-date:after" if available', async () => {
      const name = 'end-date:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'end-date')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-gift-card-code-form readonly></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'end-date')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes end-date', async () => {
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form readonlycontrols="end-date"></foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'end-date')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'end-date')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-gift-card-code-form href=${href}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'end-date')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-gift-card-code-form href=${href}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'end-date')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-gift-card-code-form disabled></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'end-date')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes end-date', async () => {
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form disabledcontrols="end-date"></foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'end-date')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'end-date')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-gift-card-code-form hidden></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'end-date')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes end-date', async () => {
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form hiddencontrols="end-date"></foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'end-date')).to.not.exist;
    });
  });

  describe('timestamps', () => {
    it('once form data is loaded, renders a property table with created and modified dates', async () => {
      const data = await getTestData<Data>('./hapi/gift_card_codes/0');
      const layout = html`<foxy-gift-card-code-form .data=${data}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const control = await getByTestId(element, 'timestamps');
      const items = [
        { name: 'date_modified', value: 'date' },
        { name: 'date_created', value: 'date' },
      ];

      expect(control).to.have.deep.property('items', items);
    });

    it('once form data is loaded, renders "timestamps:before" slot', async () => {
      const data = await getTestData<Data>('./hapi/gift_card_codes/0');
      const layout = html`<foxy-gift-card-code-form .data=${data}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:before" slot with template "timestamps:before" if available', async () => {
      const data = await getTestData<Data>('./hapi/gift_card_codes/0');
      const name = 'timestamps:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('once form data is loaded, renders "timestamps:after" slot', async () => {
      const data = await getTestData<Data>('./hapi/gift_card_codes/0');
      const layout = html`<foxy-gift-card-code-form .data=${data}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:after" slot with template "timestamps:after" if available', async () => {
      const data = await getTestData<Data>('./hapi/gift_card_codes/0');
      const name = 'timestamps:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('create', () => {
    it('if data is empty, renders create button', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'create')).to.exist;
    });

    it('renders with i18n key "create" for caption', async () => {
      const layout = html`<foxy-gift-card-code-form lang="es"></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const control = await getByTestId(element, 'create');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'create');
      expect(caption).to.have.attribute('ns', 'gift-card-code-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-gift-card-code-form disabled></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      element.edit({ code: 'TEST_123' });
      element.submit();

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "create"', async () => {
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form disabledcontrols="create"></foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'create');
      const submit = stub(element, 'submit');

      element.edit({ code: 'TEST_123' });
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-gift-card-code-form hidden></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "create"', async () => {
      const layout = html`<foxy-gift-card-code-form
        hiddencontrols="create"
      ></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('renders with "create:before" slot by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'create:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:before" slot with template "create:before" if available and rendered', async () => {
      const name = 'create:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "create:after" slot by default', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'create:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:after" slot with template "create:after" if available and rendered', async () => {
      const name = 'create:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('delete', () => {
    it('renders delete button once resource is loaded', async () => {
      const href = 'https://demo.api/hapi/gift_card_codes/0';
      const data = await getTestData<Data>(href);
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form .data=${data} disabled></foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'delete')).to.exist;
    });

    it('renders with i18n key "delete" for caption', async () => {
      const layout = html`<foxy-gift-card-code-form></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      element.data = await getTestData<Data>('https://demo.api/hapi/gift_card_codes/0');
      element.lang = 'es';
      element.ns = 'foo';

      const control = await getByTestId(element, 'delete');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'delete');
      expect(caption).to.have.attribute('ns', 'foo');
    });

    it('renders disabled if form is disabled', async () => {
      const href = 'https://demo.api/hapi/gift_card_codes/0';
      const data = await getTestData<Data>(href);
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form .data=${data} disabled></foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const href = 'https://demo.api/hapi/gift_card_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-gift-card-code-form .data=${data}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);

      element.edit({ code: 'TEST_123' });
      element.submit();

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "delete"', async () => {
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form
          .data=${await getTestData<Data>('./hapi/gift_card_codes/0')}
          disabledcontrols="delete"
        >
        </foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('shows deletion confirmation dialog on click', async () => {
      const href = 'https://demo.api/hapi/gift_card_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-gift-card-code-form .data=${data}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'delete');
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.called;
    });

    it('deletes resource if deletion is confirmed', async () => {
      const href = 'https://demo.api/hapi/gift_card_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-gift-card-code-form .data=${data}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(false));

      expect(deleteMethod).to.have.been.called;
    });

    it('keeps resource if deletion is cancelled', async () => {
      const href = 'https://demo.api/hapi/gift_card_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-gift-card-code-form .data=${data}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(true));

      expect(deleteMethod).not.to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const href = 'https://demo.api/hapi/gift_card_codes/0';
      const data = await getTestData<Data>(href);
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form .data=${data} hidden></foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "delete"', async () => {
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form
          .data=${await getTestData<Data>('./hapi/gift_card_codes/0')}
          hiddencontrols="delete"
        >
        </foxy-gift-card-code-form>
      `);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('renders with "delete:before" slot by default', async () => {
      const href = 'https://demo.api/hapi/gift_card_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-gift-card-code-form .data=${data}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:before" slot with template "delete:before" if available and rendered', async () => {
      const href = 'https://demo.api/hapi/gift_card_codes/0';
      const name = 'delete:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-code-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "delete:after" slot by default', async () => {
      const href = 'https://demo.api/hapi/gift_card_codes/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-gift-card-code-form .data=${data}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:after" slot with template "delete:after" if available and rendered', async () => {
      const href = 'https://demo.api/hapi/gift_card_codes/0';
      const name = 'delete:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-gift-card-code-form>
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
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form href=${href} lang="es"></foxy-gift-card-code-form>
      `);

      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'gift-card-code-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const element = await fixture<GiftCardCodeForm>(html`
        <foxy-gift-card-code-form href=${href} lang="es"></foxy-gift-card-code-form>
      `);

      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'gift-card-code-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('./hapi/gift_card_codes/0');
      const layout = html`<foxy-gift-card-code-form .data=${data}></foxy-gift-card-code-form>`;
      const element = await fixture<GiftCardCodeForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
