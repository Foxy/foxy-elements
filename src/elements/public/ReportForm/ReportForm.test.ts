import type { FetchEvent } from '../NucleonElement/FetchEvent';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import {
  getCurrentMonth,
  getCurrentQuarter,
  getCurrentYear,
  getLast30Days,
  getLast365Days,
  getPreviousMonth,
  getPreviousQuarter,
  getPreviousYear,
  toAPIDateTime,
} from './utils';

import { ButtonElement } from '@vaadin/vaadin-button';
import { CheckboxElement } from '@vaadin/vaadin-checkbox';
import { Choice } from '../../private/Choice/Choice';
import { ChoiceChangeEvent } from '../../private/Choice/ChoiceChangeEvent';
import { Data } from './types';
import { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { DateTimePicker } from '@vaadin/vaadin-date-time-picker';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ReportForm } from './index';
import { SelectElement } from '@vaadin/vaadin-select';
import { createRouter } from '../../../server/index';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('ReportForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('extends NucleonElement', () => {
    expect(new ReportForm()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-report-form', () => {
    expect(customElements.get('foxy-report-form')).to.equal(ReportForm);
  });

  it('has a default i18next namespace of "report-form"', () => {
    expect(new ReportForm()).to.have.property('ns', 'report-form');
  });

  describe('name', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      expect(await getByTestId(element, 'name')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-report-form hidden></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      expect(await getByTestId(element, 'name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes name', async () => {
      const element = await fixture<ReportForm>(
        html`<foxy-report-form hiddencontrols="name"></foxy-report-form>`
      );

      expect(await getByTestId(element, 'name')).to.not.exist;
    });

    it('renders "name:before" slot by default', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const slot = await getByName(element, 'name:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "name:before" slot with template "name:before" if available', async () => {
      const type = 'name:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<ReportForm>(html`
        <foxy-report-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-report-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "name:after" slot by default', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const slot = await getByName(element, 'name:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "name:after" slot with template "name:after" if available', async () => {
      const type = 'name:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<ReportForm>(html`
        <foxy-report-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-report-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a group label with i18n key "name"', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'name')) as HTMLElement;
      const label = await getByKey(control, 'name');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders a choice of report names', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const control = (await getByTestId(element, 'name')) as HTMLElement;
      const choice = (await getByTestId(control, 'name-choice')) as Choice;

      expect(choice).to.exist;
      expect(choice).to.have.deep.property('items', ['complete', 'customers', 'customers_ltv']);
    });

    it('reflects the value of form.name', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const data = await getTestData<Data>('./hapi/reports/0');

      element.data = data;
      element.edit({ name: 'customers_ltv' });

      const control = (await getByTestId(element, 'name')) as HTMLElement;
      const choice = (await getByTestId(control, 'name-choice')) as Choice;

      expect(choice).to.have.property('value', 'customers_ltv');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const control = (await getByTestId(element, 'name')) as HTMLElement;
      const choice = (await getByTestId(control, 'name-choice')) as Choice;

      expect(choice).to.not.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-report-form disabled></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const control = (await getByTestId(element, 'name')) as HTMLElement;
      const choice = (await getByTestId(control, 'name-choice')) as Choice;

      expect(choice).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes name', async () => {
      const element = await fixture<ReportForm>(html`
        <foxy-report-form disabledcontrols="name"></foxy-report-form>
      `);

      const control = (await getByTestId(element, 'name')) as HTMLElement;
      const choice = (await getByTestId(control, 'name-choice')) as Choice;

      expect(choice).to.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const control = (await getByTestId(element, 'name')) as HTMLElement;
      const choice = (await getByTestId(control, 'name-choice')) as Choice;

      expect(choice).to.not.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-report-form readonly></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const control = (await getByTestId(element, 'name')) as HTMLElement;
      const choice = (await getByTestId(control, 'name-choice')) as Choice;

      expect(choice).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes name', async () => {
      const element = await fixture<ReportForm>(html`
        <foxy-report-form readonlycontrols="name"></foxy-report-form>
      `);

      const control = (await getByTestId(element, 'name')) as HTMLElement;
      const choice = (await getByTestId(control, 'name-choice')) as Choice;

      expect(choice).to.have.attribute('readonly');
    });

    it('writes to form.name on change', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const control = (await getByTestId(element, 'name')) as HTMLElement;
      const choice = (await getByTestId(control, 'name-choice')) as Choice;

      choice.value = 'customers_ltv';
      choice.dispatchEvent(new ChoiceChangeEvent('customers_ltv'));

      expect(element).to.have.nested.property('form.name', 'customers_ltv');
    });

    ['customers', 'customers_ltv', 'complete'].forEach(type => {
      it(`renders i18n label and explainer for "${type}" report name`, async () => {
        const layout = html`<foxy-report-form></foxy-report-form>`;
        const element = await fixture<ReportForm>(layout);

        element.lang = 'es';
        element.ns = 'foo';

        const control = (await getByTestId(element, 'name')) as HTMLElement;
        const choice = (await getByTestId(control, 'name-choice')) as Choice;
        const wrapper = choice.querySelector(`[slot="${type}-label"]`) as HTMLElement;
        const label = await getByKey(wrapper, `name_${type}`);
        const explainer = await getByKey(wrapper, `name_${type}_explainer`);

        expect(label).to.exist;
        expect(label).to.have.attribute('lang', 'es');
        expect(label).to.have.attribute('ns', 'foo');

        expect(explainer).to.exist;
        expect(explainer).to.have.attribute('lang', 'es');
        expect(explainer).to.have.attribute('ns', 'foo');
      });
    });
  });

  describe('range', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      expect(await getByTestId(element, 'range')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-report-form hidden></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      expect(await getByTestId(element, 'range')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes range', async () => {
      const element = await fixture<ReportForm>(
        html`<foxy-report-form hiddencontrols="range"></foxy-report-form>`
      );

      expect(await getByTestId(element, 'range')).to.not.exist;
    });

    it('renders "range:before" slot by default', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const slot = await getByName(element, 'range:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "range:before" slot with template "range:before" if available', async () => {
      const type = 'range:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<ReportForm>(html`
        <foxy-report-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-report-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "range:after" slot by default', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const slot = await getByName(element, 'range:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "range:after" slot with template "range:after" if available', async () => {
      const type = 'range:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<ReportForm>(html`
        <foxy-report-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-report-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a group label with i18n key "range"', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'range')) as HTMLElement;
      const label = await getByKey(control, 'range');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders a range preset picker', async () => {
      const options = [
        [
          { value: '0', label: 'preset_previous_quarter', ...getPreviousQuarter() },
          { value: '1', label: 'preset_previous_month', ...getPreviousMonth() },
          { value: '2', label: 'preset_previous_year', ...getPreviousYear() },
        ],
        [
          { value: '3', label: 'preset_this_quarter', ...getCurrentQuarter() },
          { value: '4', label: 'preset_this_month', ...getCurrentMonth() },
          { value: '5', label: 'preset_this_year', ...getCurrentYear() },
        ],
        [
          { value: '6', label: 'preset_last_365_days', ...getLast365Days() },
          { value: '7', label: 'preset_last_30_days', ...getLast30Days() },
        ],
      ];

      const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
      const control = (await getByTestId(element, 'range')) as HTMLElement;
      const picker = (await getByTestId(control, 'range:preset')) as SelectElement;

      const dummyRoot = document.createElement('div');
      picker.renderer!(dummyRoot);

      expect(picker).to.have.property('value', 'custom');

      for (const group of options) {
        for (const { value, label, start, end } of group) {
          const item = dummyRoot.querySelector(`vaadin-item[value="${value}"]`);

          expect(item).to.exist;
          expect(item).to.have.text(label);

          picker.value = value;
          picker.dispatchEvent(new CustomEvent('change'));

          expect(element).to.have.nested.property('form.datetime_start', toAPIDateTime(start));
          expect(element).to.have.nested.property('form.datetime_end', toAPIDateTime(end));
        }
      }

      const customItem = dummyRoot.querySelector(`vaadin-item[value="custom"]`);

      expect(customItem).to.exist;
      expect(customItem).to.have.text('preset_custom');
    });

    it('renders start date picker by default', async () => {
      const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
      element.edit({ datetime_start: '2022-01-01T00:00:00' });

      const control = (await getByTestId(element, 'range')) as HTMLElement;
      const picker = (await getByTestId(control, 'range:start')) as SelectElement;

      expect(picker).to.be.instanceOf(DatePickerElement);
      expect(picker).to.have.property('value', '2022-01-01');

      picker.value = '2024-12-31';
      picker.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.datetime_start', '2024-12-31T00:00:00');
    });

    it('renders end date picker by default', async () => {
      const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
      element.edit({ datetime_end: '2022-01-01T23:59:59' });

      const control = (await getByTestId(element, 'range')) as HTMLElement;
      const picker = (await getByTestId(control, 'range:end')) as SelectElement;

      expect(picker).to.be.instanceOf(DatePickerElement);
      expect(picker).to.have.property('value', '2022-01-01');

      picker.value = '2024-12-31';
      picker.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.datetime_end', '2024-12-31T23:59:59');
    });

    it('renders start datetime picker on demand', async () => {
      const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
      element.edit({ datetime_start: '2022-01-01T00:00:00' });

      const control = (await getByTestId(element, 'range')) as HTMLElement;
      const toggle = (await getByTestId(control, 'range:toggle')) as CheckboxElement;

      toggle.checked = true;
      toggle.dispatchEvent(new CustomEvent('change'));
      await element.requestUpdate();

      const picker = (await getByTestId(control, 'range:start')) as SelectElement;

      expect(picker).to.be.instanceOf(DateTimePicker);
      expect(picker).to.have.property('value', '2022-01-01T00:00:00');

      picker.value = '2024-12-31T00:00:00';
      picker.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.datetime_start', '2024-12-31T00:00:00');
    });

    it('renders end datetime picker on demand', async () => {
      const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
      element.edit({ datetime_end: '2022-01-01T12:31:00' });

      const control = (await getByTestId(element, 'range')) as HTMLElement;
      const toggle = (await getByTestId(control, 'range:toggle')) as CheckboxElement;

      toggle.checked = true;
      toggle.dispatchEvent(new CustomEvent('change'));
      await element.requestUpdate();

      const picker = (await getByTestId(control, 'range:end')) as SelectElement;

      expect(picker).to.be.instanceOf(DateTimePicker);
      expect(picker).to.have.property('value', '2022-01-01T12:31:00');

      picker.value = '2024-12-31T12:31:00';
      picker.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.datetime_end', '2024-12-31T12:31:00');
    });

    [true, false].forEach(isChecked => {
      const pickerType = isChecked ? 'datetime' : 'date';

      it(`is enabled by default (with ${pickerType} picker)`, async () => {
        const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
        const control = (await getByTestId(element, 'range')) as HTMLElement;
        const toggle = (await getByTestId(control, 'range:toggle')) as CheckboxElement;

        toggle.checked = isChecked;
        toggle.dispatchEvent(new CustomEvent('change'));
        await element.requestUpdate();

        const preset = (await getByTestId(control, 'range:preset')) as HTMLElement;
        const start = (await getByTestId(control, 'range:start')) as HTMLElement;
        const end = (await getByTestId(control, 'range:end')) as HTMLElement;

        expect(toggle).to.not.have.attribute('disabled');
        expect(preset).to.not.have.attribute('disabled');
        expect(start).to.not.have.attribute('disabled');
        expect(end).to.not.have.attribute('disabled');
      });

      it(`is disabled when the form is disabled (with ${pickerType} picker)`, async () => {
        const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
        const control = (await getByTestId(element, 'range')) as HTMLElement;
        const toggle = (await getByTestId(control, 'range:toggle')) as CheckboxElement;

        toggle.checked = isChecked;
        toggle.dispatchEvent(new CustomEvent('change'));
        await element.requestUpdate();

        element.setAttribute('disabled', 'disabled');
        await element.requestUpdate();

        const preset = (await getByTestId(control, 'range:preset')) as HTMLElement;
        const start = (await getByTestId(control, 'range:start')) as HTMLElement;
        const end = (await getByTestId(control, 'range:end')) as HTMLElement;

        expect(toggle).to.have.attribute('disabled');
        expect(preset).to.have.attribute('disabled');
        expect(start).to.have.attribute('disabled');
        expect(end).to.have.attribute('disabled');
      });

      it(`is disabled when disabledcontrols includes range (with ${pickerType} picker)`, async () => {
        const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
        const control = (await getByTestId(element, 'range')) as HTMLElement;
        const toggle = (await getByTestId(control, 'range:toggle')) as CheckboxElement;

        toggle.checked = isChecked;
        toggle.dispatchEvent(new CustomEvent('change'));
        await element.requestUpdate();

        element.setAttribute('disabledcontrols', 'range');
        await element.requestUpdate();

        const preset = (await getByTestId(control, 'range:preset')) as HTMLElement;
        const start = (await getByTestId(control, 'range:start')) as HTMLElement;
        const end = (await getByTestId(control, 'range:end')) as HTMLElement;

        expect(toggle).to.have.attribute('disabled');
        expect(preset).to.have.attribute('disabled');
        expect(start).to.have.attribute('disabled');
        expect(end).to.have.attribute('disabled');
      });

      it(`is disabled when the form is busy (with ${pickerType} picker)`, async () => {
        const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
        const control = (await getByTestId(element, 'range')) as HTMLElement;
        const toggle = (await getByTestId(control, 'range:toggle')) as CheckboxElement;
        const router = createRouter();

        toggle.checked = isChecked;
        toggle.dispatchEvent(new CustomEvent('change'));
        await element.requestUpdate();

        element.addEventListener('fetch', (evt: any) => router.handleEvent(evt));
        element.href = 'https://demo.api/virtual/stall';
        await waitUntil(() => element.in('busy'));

        const preset = (await getByTestId(control, 'range:preset')) as HTMLElement;
        const start = (await getByTestId(control, 'range:start')) as HTMLElement;
        const end = (await getByTestId(control, 'range:end')) as HTMLElement;

        expect(toggle).to.have.attribute('disabled');
        expect(preset).to.have.attribute('disabled');
        expect(start).to.have.attribute('disabled');
        expect(end).to.have.attribute('disabled');
      });

      it(`is editable by default (with ${pickerType} picker)`, async () => {
        const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
        const control = (await getByTestId(element, 'range')) as HTMLElement;
        const toggle = (await getByTestId(control, 'range:toggle')) as CheckboxElement;

        toggle.checked = isChecked;
        toggle.dispatchEvent(new CustomEvent('change'));
        await element.requestUpdate();

        const preset = (await getByTestId(control, 'range:preset')) as HTMLElement;
        const start = (await getByTestId(control, 'range:start')) as HTMLElement;
        const end = (await getByTestId(control, 'range:end')) as HTMLElement;

        expect(preset).to.not.have.attribute('readonly');
        expect(start).to.not.have.attribute('readonly');
        expect(end).to.not.have.attribute('readonly');
      });

      it(`is readonly when the form is readonly (with ${pickerType} picker)`, async () => {
        const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
        const control = (await getByTestId(element, 'range')) as HTMLElement;
        const toggle = (await getByTestId(control, 'range:toggle')) as CheckboxElement;

        toggle.checked = isChecked;
        toggle.dispatchEvent(new CustomEvent('change'));
        await element.requestUpdate();

        element.setAttribute('readonly', 'readonly');
        await element.requestUpdate();

        const preset = (await getByTestId(control, 'range:preset')) as HTMLElement;
        const start = (await getByTestId(control, 'range:start')) as HTMLElement;
        const end = (await getByTestId(control, 'range:end')) as HTMLElement;

        expect(preset).to.have.attribute('readonly');
        expect(start).to.have.attribute('readonly');
        expect(end).to.have.attribute('readonly');
      });

      it(`is readonly when readonlycontrols includes range (with ${pickerType} picker)`, async () => {
        const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
        const control = (await getByTestId(element, 'range')) as HTMLElement;
        const toggle = (await getByTestId(control, 'range:toggle')) as CheckboxElement;

        toggle.checked = isChecked;
        toggle.dispatchEvent(new CustomEvent('change'));
        await element.requestUpdate();

        element.setAttribute('readonlycontrols', 'range');
        await element.requestUpdate();

        const preset = (await getByTestId(control, 'range:preset')) as HTMLElement;
        const start = (await getByTestId(control, 'range:start')) as HTMLElement;
        const end = (await getByTestId(control, 'range:end')) as HTMLElement;

        expect(preset).to.have.attribute('readonly');
        expect(start).to.have.attribute('readonly');
        expect(end).to.have.attribute('readonly');
      });
    });
  });

  describe('timestamps', () => {
    it('once form data is loaded, renders a property table with created and modified dates', async () => {
      const data = await getTestData<Data>('./hapi/reports/0');
      const layout = html`<foxy-report-form .data=${data}></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const control = await getByTestId(element, 'timestamps');
      const items = [
        { name: 'date_modified', value: 'date' },
        { name: 'date_created', value: 'date' },
      ];

      expect(control).to.have.deep.property('items', items);
    });

    it('once form data is loaded, renders "timestamps:before" slot', async () => {
      const data = await getTestData<Data>('./hapi/reports/0');
      const layout = html`<foxy-report-form .data=${data}></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:before" slot with template "timestamps:before" if available', async () => {
      const data = await getTestData<Data>('./hapi/reports/0');
      const name = 'timestamps:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<ReportForm>(html`
        <foxy-report-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-report-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('once form data is loaded, renders "timestamps:after" slot', async () => {
      const data = await getTestData<Data>('./hapi/reports/0');
      const layout = html`<foxy-report-form .data=${data}></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:after" slot with template "timestamps:after" if available', async () => {
      const data = await getTestData<Data>('./hapi/reports/0');
      const name = 'timestamps:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<ReportForm>(html`
        <foxy-report-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-report-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('create', () => {
    it('if data is empty, renders create button', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      expect(await getByTestId(element, 'create')).to.exist;
    });

    it('renders with i18n key "create" for caption', async () => {
      const layout = html`<foxy-report-form lang="es"></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const control = await getByTestId(element, 'create');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'create');
      expect(caption).to.have.attribute('ns', 'report-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-report-form disabled></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);

      element.edit({
        datetime_start: '2020-01-01T00:00:00',
        datetime_end: '2022-12-31T23:59:59',
        name: 'complete',
      });

      element.submit();

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "create"', async () => {
      const layout = html`<foxy-report-form disabledcontrols="create"></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
      const submit = stub(element, 'submit');

      element.edit({
        datetime_start: '2020-01-01T00:00:00',
        datetime_end: '2022-12-31T23:59:59',
        name: 'complete',
      });

      const control = await getByTestId<ButtonElement>(element, 'create');
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-report-form hidden></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "create"', async () => {
      const layout = html`<foxy-report-form hiddencontrols="create"></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('renders with "create:before" slot by default', async () => {
      const layout = html`<foxy-report-form></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'create:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:before" slot with template "create:before" if available and rendered', async () => {
      const name = 'create:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<ReportForm>(html`
        <foxy-report-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-report-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "create:after" slot by default', async () => {
      const element = await fixture<ReportForm>(html`<foxy-report-form></foxy-report-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'create:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:after" slot with template "create:after" if available and rendered', async () => {
      const name = 'create:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<ReportForm>(html`
        <foxy-report-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-report-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('delete', () => {
    it('renders delete button once resource is loaded', async () => {
      const href = './hapi/reports/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-report-form .data=${data} disabled></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);

      expect(await getByTestId(element, 'delete')).to.exist;
    });

    it('renders with i18n key "delete" for caption', async () => {
      const data = await getTestData('./hapi/reports/0');
      const layout = html`<foxy-report-form .data=${data} lang="es"></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const control = await getByTestId(element, 'delete');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'delete');
      expect(caption).to.have.attribute('ns', 'report-form');
    });

    it('renders disabled if form is disabled', async () => {
      const data = await getTestData('./hapi/reports/0');
      const layout = html`<foxy-report-form .data=${data} disabled></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const data = await getTestData('./hapi/reports/0');
      const layout = html`<foxy-report-form .data=${data}></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);

      element.edit({
        datetime_start: '2020-01-01T00:00:00',
        datetime_end: '2022-12-31T23:59:59',
        name: 'complete',
      });

      element.submit();

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "delete"', async () => {
      const element = await fixture<ReportForm>(html`
        <foxy-report-form
          .data=${await getTestData<Data>('./hapi/reports/0')}
          disabledcontrols="delete"
        >
        </foxy-report-form>
      `);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('shows deletion confirmation dialog on click', async () => {
      const data = await getTestData('./hapi/reports/0');
      const layout = html`<foxy-report-form .data=${data}></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'delete');
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.called;
    });

    it('deletes resource if deletion is confirmed', async () => {
      const data = await getTestData('./hapi/reports/0');
      const layout = html`<foxy-report-form .data=${data}></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(false));

      expect(deleteMethod).to.have.been.called;
    });

    it('keeps resource if deletion is cancelled', async () => {
      const data = await getTestData('./hapi/reports/0');
      const layout = html`<foxy-report-form .data=${data}></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(true));

      expect(deleteMethod).not.to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const data = await getTestData('./hapi/reports/0');
      const layout = html`<foxy-report-form .data=${data} hidden></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "delete"', async () => {
      const element = await fixture<ReportForm>(html`
        <foxy-report-form
          .data=${await getTestData<Data>('./hapi/reports/0')}
          hiddencontrols="delete"
        >
        </foxy-report-form>
      `);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('renders with "delete:before" slot by default', async () => {
      const data = await getTestData('./hapi/reports/0');
      const layout = html`<foxy-report-form .data=${data}></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:before" slot with template "delete:before" if available and rendered', async () => {
      const href = './hapi/reports/0';
      const name = 'delete:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<ReportForm>(html`
        <foxy-report-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-report-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "delete:after" slot by default', async () => {
      const data = await getTestData('./hapi/reports/0');
      const layout = html`<foxy-report-form .data=${data}></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:after" slot with template "delete:after" if available and rendered', async () => {
      const href = './hapi/reports/0';
      const name = 'delete:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<ReportForm>(html`
        <foxy-report-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-report-form>
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
        <foxy-report-form
          href="https://demo.api/virtual/stall"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-report-form>
      `;

      const element = await fixture<ReportForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'report-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = './hapi/not-found';
      const layout = html`<foxy-report-form href=${href} lang="es"></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'report-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('./hapi/reports/0');
      const layout = html`<foxy-report-form .data=${data}></foxy-report-form>`;
      const element = await fixture<ReportForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
