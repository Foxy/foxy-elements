import './index';

import { expect, fixture, html } from '@open-wc/testing';
import { ReportForm as Form } from './ReportForm';
import { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import { InternalNativeDateControl } from '../../internal/InternalNativeDateControl/InternalNativeDateControl';
import { InternalSwitchControl } from '../../internal/InternalSwitchControl/InternalSwitchControl';
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
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';

describe('ReportForm', () => {
  it('imports and defines foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-select-control', () => {
    expect(customElements.get('foxy-internal-select-control')).to.exist;
  });

  it('imports and defines foxy-internal-native-date-control', () => {
    expect(customElements.get('foxy-internal-native-date-control')).to.exist;
  });

  it('imports and defines foxy-internal-switch-control', () => {
    expect(customElements.get('foxy-internal-switch-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines itself as foxy-report-form', () => {
    expect(customElements.get('foxy-report-form')).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(customElements.get('foxy-internal-form'));
  });

  it('has a default i18n namespace "report-form"', () => {
    expect(Form).to.have.property('defaultNS', 'report-form');
    expect(new Form()).to.have.property('ns', 'report-form');
  });

  it('renders a form header', async () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.data = await getTestData('./hapi/reports/0');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders a foxy-internal-select-control for name', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const control = element.renderRoot.querySelector('[infer="name"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-select-control'));
  });

  it('renders a foxy-internal-select-control for preset', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const control = element.renderRoot.querySelector('[infer="preset"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-select-control'));
  });

  it('renders a foxy-internal-native-date-control for datetime-start', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const control = element.renderRoot.querySelector('[infer="datetime-start"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-native-date-control'));
  });

  it('renders a foxy-internal-native-date-control for datetime-end', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const control = element.renderRoot.querySelector('[infer="datetime-end"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-native-date-control'));
  });

  it('renders a foxy-internal-switch-control for datetime-precise', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const control = element.renderRoot.querySelector('[infer="datetime-precise"]');
    expect(control).to.be.instanceOf(customElements.get('foxy-internal-switch-control'));
  });

  it('produces name:v8n_required error when name is missing', () => {
    const element = new Form();
    expect(element.errors).to.include('name:v8n_required');
  });

  it('produces datetime-start:v8n_required error when datetime_start is missing', () => {
    const element = new Form();
    expect(element.errors).to.include('datetime-start:v8n_required');
  });

  it('produces datetime-end:v8n_required error when datetime_end is missing', () => {
    const element = new Form();
    expect(element.errors).to.include('datetime-end:v8n_required');
  });

  it('marks name as readonly when data is loaded', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    element.data = await getTestData('./hapi/reports/0');
    expect(element.readonlySelector.matches('name', true)).to.be.true;
  });

  it('marks preset as readonly when data is loaded', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    element.data = await getTestData('./hapi/reports/0');
    expect(element.readonlySelector.matches('preset', true)).to.be.true;
  });

  it('marks datetime-precise as readonly when data is loaded', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    element.data = await getTestData('./hapi/reports/0');
    expect(element.readonlySelector.matches('datetime-precise', true)).to.be.true;
  });

  it('marks datetime-start as readonly when data is loaded', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    element.data = await getTestData('./hapi/reports/0');
    expect(element.readonlySelector.matches('datetime-start', true)).to.be.true;
  });

  it('marks datetime-end as readonly when data is loaded', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    element.data = await getTestData('./hapi/reports/0');
    expect(element.readonlySelector.matches('datetime-end', true)).to.be.true;
  });

  it('hides preset when data is loaded', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    element.data = await getTestData('./hapi/reports/0');
    expect(element.hiddenSelector.matches('preset', true)).to.be.true;
  });

  it('hides datetime-precise when data is loaded', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    element.data = await getTestData('./hapi/reports/0');
    expect(element.hiddenSelector.matches('datetime-precise', true)).to.be.true;
  });

  it('uses custom getValue for preset control to return matching preset or "custom"', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const control = element.renderRoot.querySelector<InternalSelectControl>('[infer="preset"]')!;

    // When no dates are set, should return 'custom'
    expect(control.getValue()).to.equal('custom');

    // When dates match a preset, should return that preset's value
    const { start, end } = getCurrentMonth();

    element.edit({
      datetime_start: toAPIDateTime(start),
      datetime_end: toAPIDateTime(end),
    });

    expect(control.getValue()).to.equal('4'); // 'this_month' preset
  });

  it('uses calendar-aligned boundaries for all report date range presets', () => {
    const now = new Date(2026, 3, 17, 12, 34, 56);
    const cases = [
      { range: getPreviousQuarter(now), start: '2026-01-01T00:00:00', end: '2026-03-31T23:59:59' },
      { range: getCurrentQuarter(now), start: '2026-04-01T00:00:00', end: '2026-06-30T23:59:59' },
      { range: getPreviousMonth(now), start: '2026-03-01T00:00:00', end: '2026-03-31T23:59:59' },
      { range: getCurrentMonth(now), start: '2026-04-01T00:00:00', end: '2026-04-30T23:59:59' },
      { range: getPreviousYear(now), start: '2025-01-01T00:00:00', end: '2025-12-31T23:59:59' },
      { range: getCurrentYear(now), start: '2026-01-01T00:00:00', end: '2026-12-31T23:59:59' },
      { range: getLast365Days(now), start: '2025-04-17T00:00:00', end: '2026-04-17T23:59:59' },
      { range: getLast30Days(now), start: '2026-03-18T00:00:00', end: '2026-04-17T23:59:59' },
    ];

    cases.forEach(({ range, start, end }) => {
      expect(toAPIDateTime(range.start)).to.equal(start);
      expect(toAPIDateTime(range.end)).to.equal(end);
    });
  });

  it('uses previous year when previous quarter crosses year boundary', () => {
    const { start, end } = getPreviousQuarter(new Date(2026, 0, 7, 9, 0, 0));
    expect(toAPIDateTime(start)).to.equal('2025-10-01T00:00:00');
    expect(toAPIDateTime(end)).to.equal('2025-12-31T23:59:59');
  });

  it('uses custom setValue for preset control to set datetime_start and datetime_end', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const control = element.renderRoot.querySelector<InternalSelectControl>('[infer="preset"]')!;

    // Set to 'this_month' preset (value '4')
    control.setValue('4');

    const { start, end } = getCurrentMonth();

    expect(element.form.datetime_start).to.equal(toAPIDateTime(start));
    expect(element.form.datetime_end).to.equal(toAPIDateTime(end));
  });

  it('uses custom getValue for datetime-start control to return formatted date', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const control = element.renderRoot.querySelector<InternalNativeDateControl>(
      '[infer="datetime-start"]'
    )!;

    // When no value, returns empty string
    expect(control.getValue()).to.equal('');

    // When value is set, returns formatted date (without time when not in precise mode)
    element.edit({ datetime_start: '2022-01-15T10:30:00' });
    expect(control.getValue()).to.equal('2022-01-15');
  });

  it('uses custom getValue for datetime-start control to return datetime when in precise mode', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const preciseControl = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="datetime-precise"]'
    )!;

    // Enable precise mode
    preciseControl.setValue(true);
    element.edit({ datetime_start: '2022-01-15T10:30:00' });

    const control = element.renderRoot.querySelector<InternalNativeDateControl>(
      '[infer="datetime-start"]'
    )!;
    expect(control.getValue()).to.equal('2022-01-15T10:30');
  });

  it('uses custom setValue for datetime-start control to set datetime_start with default time', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const control = element.renderRoot.querySelector<InternalNativeDateControl>(
      '[infer="datetime-start"]'
    )!;

    control.setValue('2022-06-15');
    expect(element.form.datetime_start).to.equal('2022-06-15T00:00:00');
  });

  it('uses custom setValue for datetime-start control to preserve time in precise mode', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const preciseControl = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="datetime-precise"]'
    )!;

    // Enable precise mode
    preciseControl.setValue(true);

    const control = element.renderRoot.querySelector<InternalNativeDateControl>(
      '[infer="datetime-start"]'
    )!;
    control.setValue('2022-06-15T14:30');
    expect(element.form.datetime_start).to.equal('2022-06-15T14:30:00');
  });

  it('uses custom getValue for datetime-end control to return formatted date', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const control =
      element.renderRoot.querySelector<InternalNativeDateControl>('[infer="datetime-end"]')!;

    // When no value, returns empty string
    expect(control.getValue()).to.equal('');

    // When value is set, returns formatted date (without time when not in precise mode)
    element.edit({ datetime_end: '2022-01-15T23:59:59' });
    expect(control.getValue()).to.equal('2022-01-15');
  });

  it('uses custom getValue for datetime-end control to return datetime when in precise mode', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const preciseControl = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="datetime-precise"]'
    )!;

    // Enable precise mode
    preciseControl.setValue(true);
    element.edit({ datetime_end: '2022-01-15T18:45:00' });

    const control =
      element.renderRoot.querySelector<InternalNativeDateControl>('[infer="datetime-end"]')!;
    expect(control.getValue()).to.equal('2022-01-15T18:45');
  });

  it('uses custom setValue for datetime-end control to set datetime_end with default end-of-day time', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const control =
      element.renderRoot.querySelector<InternalNativeDateControl>('[infer="datetime-end"]')!;

    control.setValue('2022-06-15');
    expect(element.form.datetime_end).to.equal('2022-06-15T23:59:59');
  });

  it('uses custom setValue for datetime-end control to preserve time in precise mode', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const preciseControl = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="datetime-precise"]'
    )!;

    // Enable precise mode
    preciseControl.setValue(true);

    const control =
      element.renderRoot.querySelector<InternalNativeDateControl>('[infer="datetime-end"]')!;
    control.setValue('2022-06-15T18:45');
    expect(element.form.datetime_end).to.equal('2022-06-15T18:45:59');
  });

  it('uses custom getValue for datetime-precise control to return current precise mode state', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const control = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="datetime-precise"]'
    )!;

    // Default is false
    expect(control.getValue()).to.be.false;

    // After setting to true
    control.setValue(true);
    expect(control.getValue()).to.be.true;
  });

  it('uses custom setValue for datetime-precise control to toggle precise mode', async () => {
    const element = await fixture<Form>(html`<foxy-report-form></foxy-report-form>`);
    const control = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="datetime-precise"]'
    )!;

    control.setValue(true);
    expect(control.getValue()).to.be.true;

    control.setValue(false);
    expect(control.getValue()).to.be.false;
  });
});
