import './index';

import { expect, fixture, html } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { InternalCalendar } from './InternalCalendar';
import { LitElement } from 'lit-element';
import { getByTestClass } from '../../../testgen/getByTestClass';
import { getByTestId } from '../../../testgen/getByTestId';

describe('InternalCalendar', () => {
  it('extends LitElement', () => {
    expect(new InternalCalendar()).to.be.instanceOf(LitElement);
  });

  it('registers as foxy-internal-calendar', () => {
    expect(customElements.get('foxy-internal-calendar')).to.equal(InternalCalendar);
  });

  it('initializes with the correct defaults', () => {
    const element = new InternalCalendar();

    expect(element).to.have.property('readonly', false);
    expect(element).to.have.property('disabled', false);
    expect(element).to.have.property('value', '');
    expect(element).to.have.property('start', '');
    expect(element).to.have.property('lang', '');

    expect(element.checkAvailability(new Date())).to.be.true;
  });

  it('reflects attribute values to respective properties', async () => {
    expect(InternalCalendar).to.have.nested.property('properties.readonly.reflect', true);
    expect(InternalCalendar).to.have.nested.property('properties.disabled.reflect', true);
  });

  it('renders "previous" button setting the calendar to the previous month', async () => {
    const layout = html`<foxy-internal-calendar start="2021-01-01"></foxy-internal-calendar>`;
    const element = await fixture<InternalCalendar>(layout);
    const button = (await getByTestId(element, 'prev')) as ButtonElement;

    button.click();
    expect(element).to.have.property('start', '2020-12-01');
  });

  it('renders "next" button setting the calendar to the next month', async () => {
    const layout = html`<foxy-internal-calendar start="2021-01-01"></foxy-internal-calendar>`;
    const element = await fixture<InternalCalendar>(layout);
    const button = (await getByTestId(element, 'next')) as ButtonElement;

    button.dispatchEvent(new CustomEvent('click'));
    expect(element).to.have.property('start', '2021-02-01');
  });

  it('renders current month and year in the title', async () => {
    const element = await fixture<InternalCalendar>(html`
      <foxy-internal-calendar value="2021-01-01" lang="en"></foxy-internal-calendar>
    `);

    const options = { month: 'long', year: 'numeric' };
    const title = (await getByTestId(element, 'month')) as ButtonElement;
    const text = new Date(2021, 0, 1).toLocaleDateString('en', options);

    expect(title).to.include.text(text);
  });

  it('renders the days of the month of "start"', async () => {
    const element = await fixture<InternalCalendar>(html`
      <foxy-internal-calendar start="2021-01-01" lang="en"></foxy-internal-calendar>
    `);

    const days = await getByTestClass<HTMLElement>(element, 'day-of-month');

    for (let i = 1; i <= 31; ++i) {
      expect(days[i - 1]).to.exist;
      expect(days[i - 1]).to.include.text(i.toString());
    }
  });

  it('changes the "value" property on date click', async () => {
    const element = await fixture<InternalCalendar>(html`
      <foxy-internal-calendar value="2021-01-01" lang="en"></foxy-internal-calendar>
    `);

    const days = await getByTestClass<HTMLElement>(element, 'day-of-month');
    const input = days[3].querySelector('input') as HTMLInputElement;

    input.click();
    expect(element).to.have.property('value', '2021-01-04');
  });

  it('disables the entire control if "disabled" is true', async () => {
    const layout = html`<foxy-internal-calendar disabled></foxy-internal-calendar>`;
    const element = await fixture<InternalCalendar>(layout);

    element.querySelectorAll('vaadin-button, input').forEach(control => {
      expect(control).to.have.attribute('disabled');
    });
  });

  it('disables the entire control if "readonly" is true', async () => {
    const layout = html`<foxy-internal-calendar readonly></foxy-internal-calendar>`;
    const element = await fixture<InternalCalendar>(layout);

    element.querySelectorAll('vaadin-button, input').forEach(control => {
      expect(control).to.have.attribute('disabled');
    });
  });

  it('disables the dates selected by .checkAvailability', async () => {
    const element = await fixture<InternalCalendar>(html`
      <foxy-internal-calendar
        value="2021-01-01"
        .checkAvailability=${(date: Date) => date.getDate() > 15}
      >
      </foxy-internal-calendar>
    `);

    const inputs = element.renderRoot.querySelectorAll('input');

    for (let i = 1; i <= 15; ++i) expect(inputs[i - 1]).to.have.attribute('disabled');
    for (let i = 16; i <= 31; ++i) expect(inputs[i - 1]).not.to.have.attribute('disabled');
  });
});
