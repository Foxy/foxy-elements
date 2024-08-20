import type { CustomFieldElement } from '@vaadin/vaadin-custom-field';

import { InternalFrequencyControl as Control } from './index';
import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { expect, fixture, html } from '@open-wc/testing';
import { NucleonElement } from '../../public/NucleonElement/index';
import { stub } from 'sinon';

import get from 'lodash-es/get';

class TestControl extends Control {
  static get properties() {
    return {
      ...super.properties,
      testCheckValidity: { attribute: false },
      testErrorMessage: { attribute: false },
      testValue: { attribute: false },
    };
  }

  testCheckValidity = () => true;

  testErrorMessage = '';

  testValue = null as string | null;

  nucleon = new NucleonElement();

  protected get _checkValidity() {
    return this.testCheckValidity;
  }

  protected get _errorMessage() {
    return this.testErrorMessage;
  }

  protected get _value() {
    return this.testValue;
  }

  protected set _value(newValue: string | null) {
    this.testValue = newValue;
    super._value = newValue;
  }
}

customElements.define('test-internal-frequency-control', TestControl);

describe('InternalFrequencyControl', () => {
  it('imports and defines vaadin-integer-field', () => {
    expect(customElements.get('vaadin-integer-field')).to.not.be.undefined;
  });

  it('imports and defines vaadin-custom-field', () => {
    expect(customElements.get('vaadin-custom-field')).to.not.be.undefined;
  });

  it('imports and defines vaadin-combo-box', () => {
    expect(customElements.get('vaadin-combo-box')).to.not.be.undefined;
  });

  it('imports and defines itself as foxy-internal-frequency-control', () => {
    expect(customElements.get('foxy-internal-frequency-control')).to.equal(Control);
  });

  it('has a reactive property "max"', () => {
    expect(new Control()).to.have.property('max', 999);
    expect(Control).to.have.deep.nested.property('properties.max', { type: Number });
  });

  it('has a reactive property "layout"', () => {
    expect(new Control()).to.have.property('layout', null);
    expect(Control).to.have.deep.nested.property('properties.layout', {});
  });

  it('has a reactive property "allowTwiceAMonth"', () => {
    expect(new Control()).to.have.property('allowTwiceAMonth', false);
    expect(Control).to.have.deep.nested.property('properties.allowTwiceAMonth', {
      type: Boolean,
      attribute: 'allow-twice-a-month',
    });
  });

  it('extends InternalEditableControl', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('renders vaadin-custom-field element in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field');

    expect(field).to.not.be.null;
  });

  it('renders vaadin-integer-field element as part of custom field in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field > vaadin-integer-field');

    expect(field).to.not.be.null;
  });

  it('renders vaadin-combo-box element as part of custom field in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field > vaadin-combo-box');

    expect(field).to.not.be.null;
  });

  it('sets "errorMessage" on vaadin-custom-field from "_errorMessage" on itself in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field')!;

    expect(field).to.have.property('errorMessage', '');

    control.testErrorMessage = 'test error message';
    await control.requestUpdate();

    expect(field).to.have.property('errorMessage', 'test error message');
  });

  it('sets "helperText" on vaadin-custom-field from "helperText" on itself in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field')!;

    expect(field).to.have.property('helperText', 'helper_text');

    control.helperText = 'test helper text';
    await control.requestUpdate();

    expect(field).to.have.property('helperText', 'test helper text');
  });

  it('sets "label" on vaadin-custom-field from "label" on itself in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field')!;

    expect(field).to.have.property('label', 'label');

    control.label = 'test label';
    await control.requestUpdate();

    expect(field).to.have.property('label', 'test label');
  });

  it('sets "disabled" on vaadin elements from "disabled" on itself in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const customField = control.renderRoot.querySelector('vaadin-custom-field')!;
    const integerField = control.renderRoot.querySelector('vaadin-integer-field')!;
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    control.disabled = true;
    await control.requestUpdate();

    expect(customField).to.have.attribute('disabled');
    expect(integerField).to.have.attribute('disabled');
    expect(comboBox).to.have.attribute('disabled');

    control.disabled = false;
    await control.requestUpdate();

    expect(customField).to.not.have.attribute('disabled');
    expect(integerField).to.not.have.attribute('disabled');
    expect(comboBox).to.not.have.attribute('disabled');
  });

  it('sets "readonly" on vaadin elements from "readonly" on itself in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const customField = control.renderRoot.querySelector('vaadin-custom-field')!;
    const integerField = control.renderRoot.querySelector('vaadin-integer-field')!;
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    control.readonly = true;
    await control.requestUpdate();

    expect(customField).to.have.attribute('readonly');
    expect(integerField).to.have.attribute('readonly');
    expect(comboBox).to.have.attribute('readonly');

    control.readonly = false;
    await control.requestUpdate();

    expect(customField).to.not.have.attribute('readonly');
    expect(integerField).to.not.have.attribute('readonly');
    expect(comboBox).to.not.have.attribute('readonly');
  });

  it('sets "checkValidity" on vaadin-custom-field from "_checkValidity" on itself in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field')!;

    expect(field).to.have.property('checkValidity', get(control, '_checkValidity'));
  });

  it('sets "invalid" on custom field children if "_checkValidity" returns false in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);

    const integerField = control.renderRoot.querySelector('vaadin-integer-field')!;
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    control.testCheckValidity = () => false;
    await control.requestUpdate();

    expect(integerField).to.have.attribute('invalid');
    expect(comboBox).to.have.attribute('invalid');

    control.testCheckValidity = () => true;
    await control.requestUpdate();

    expect(integerField).to.not.have.attribute('invalid');
    expect(comboBox).to.not.have.attribute('invalid');
  });

  it('sets "value" on vaadin-custom-field from "_value" on itself in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field')!;

    expect(field).to.have.property('value', '');

    control.testValue = '2w';
    await control.requestUpdate();

    expect(field).to.have.property('value', '2w');
  });

  it('parses provided frequency to distribute among custom field elements in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector<CustomFieldElement>('vaadin-custom-field')!;

    expect(field.i18n.parseValue('1w')).to.deep.equal(['1', 'w']);
    expect(field.i18n.parseValue('12m')).to.deep.equal(['12', 'm']);
  });

  it('serializes frequency parts provided by custom field elements in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector<CustomFieldElement>('vaadin-custom-field')!;

    expect(field.i18n.formatValue(['1', 'w'])).to.equal('1w');
    expect(field.i18n.formatValue(['12', 'm'])).to.equal('12m');
  });

  it('writes to "_value" on change in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field')!;

    expect(field).to.have.property('value', '');

    field.value = '2w';
    field.dispatchEvent(new CustomEvent('change'));

    expect(control).to.have.property('testValue', '2w');
  });

  it('submits the host nucleon form on Enter (vaadin-integer-field) in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field')!;
    const submitMethod = stub(control.nucleon, 'submit');

    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(submitMethod).to.have.been.calledOnce;

    submitMethod.restore();
  });

  it('submits the host nucleon form on Enter (vaadin-combo-box) in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-combo-box')!;
    const submitMethod = stub(control.nucleon, 'submit');

    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(submitMethod).to.have.been.calledOnce;

    submitMethod.restore();
  });

  it('uses "max" value on vaadin-integer-field in standalone layout', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field')!;
    expect(field).to.have.attribute('max', '999');

    control.max = 100;
    await control.requestUpdate();
    expect(field).to.have.attribute('max', '100');
  });

  it('renders label in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-frequency-control layout="summary-item"></test-internal-frequency-control>
    `);

    expect(control.renderRoot).to.include.text('label');

    control.label = 'Foo bar';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('label');
    expect(control.renderRoot).to.include.text('Foo bar');
  });

  it('renders helper text in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-frequency-control layout="summary-item"></test-internal-frequency-control>
    `);

    expect(control.renderRoot).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('helper_text');
    expect(control.renderRoot).to.include.text('Test helper text');
  });

  it('renders error text in summary item layout if available', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-frequency-control layout="summary-item"></test-internal-frequency-control>
    `);

    expect(control.renderRoot).to.not.include.text('Test error message');

    control.testErrorMessage = 'Test error message';
    await control.requestUpdate();

    expect(control.renderRoot).to.include.text('Test error message');
  });

  it('renders input for frequency count in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-frequency-control layout="summary-item"> </test-internal-frequency-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    expect(input).to.have.property('value', '0');
    expect(input).to.have.attribute('min', '1');
    expect(input).to.have.attribute('type', 'number');
    expect(input).to.have.attribute('step', '1');
    expect(input).to.have.attribute('inputmode', 'numeric');

    control.testValue = '2w';
    await control.requestUpdate();
    expect(input).to.have.property('value', '2');

    input.value = '5';
    input.dispatchEvent(new Event('input'));
    expect(control).to.have.property('testValue', '5w');
  });

  it('uses "max" value on input in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-frequency-control layout="summary-item"> </test-internal-frequency-control>
    `);

    const input = control.renderRoot.querySelector('input');
    expect(input).to.have.attribute('max', '999');

    control.max = 100;
    await control.requestUpdate();
    expect(input).to.have.attribute('max', '100');
  });

  it('renders frequency units selector in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-frequency-control layout="summary-item"></test-internal-frequency-control>
    `);

    const select = control.renderRoot.querySelector('select')!;

    expect(select).to.have.property('value', '');
    expect(select.options.length).to.equal(5);
    expect(select.options[0]).to.have.property('value', '');
    expect(select.options[1]).to.have.property('value', 'd');
    expect(select.options[1]).to.include.text('day');
    expect(select.options[2]).to.have.property('value', 'w');
    expect(select.options[2]).to.include.text('week');
    expect(select.options[3]).to.have.property('value', 'm');
    expect(select.options[3]).to.include.text('month');
    expect(select.options[4]).to.have.property('value', 'y');
    expect(select.options[4]).to.include.text('year');

    control.testValue = '2w';
    await control.requestUpdate();
    expect(select).to.have.property('value', 'w');

    select.value = 'm';
    select.dispatchEvent(new Event('change'));
    expect(control).to.have.property('testValue', '2m');
  });

  it('renders custom options in frequency units selector in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-frequency-control
        layout="summary-item"
        .options=${[
          { value: 'a', label: 'foo' },
          { value: 'b', label: 'bar' },
        ]}
      >
      </test-internal-frequency-control>
    `);

    const select = control.renderRoot.querySelector('select')!;

    expect(select.options.length).to.equal(3);
    expect(select.options[0]).to.have.property('value', '');
    expect(select.options[1]).to.have.property('value', 'a');
    expect(select.options[1]).to.include.text('foo');
    expect(select.options[2]).to.have.property('value', 'b');
    expect(select.options[2]).to.include.text('bar');
  });

  it('disables input and select in summary item layout if control is disabled', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-frequency-control layout="summary-item"></test-internal-frequency-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    const select = control.renderRoot.querySelector('select')!;

    expect(input).to.not.have.attribute('disabled');
    expect(select).to.not.have.attribute('disabled');

    control.disabled = true;
    await control.requestUpdate();

    expect(input).to.have.attribute('disabled');
    expect(select).to.have.attribute('disabled');
  });

  it('supports ".5m" frequency in summary item layout when enabled', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-frequency-control layout="summary-item"></test-internal-frequency-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    const select = control.renderRoot.querySelector('select')!;

    control.testValue = '.5m';
    await control.requestUpdate();

    expect(input).to.have.property('value', '');
    expect(select).to.have.property('value', '');

    control.allowTwiceAMonth = true;
    control.testValue = '.5m';
    await control.requestUpdate();

    expect(input).to.have.property('value', '2');
    expect(select).to.have.property('value', 'times_a_month');
  });
});
