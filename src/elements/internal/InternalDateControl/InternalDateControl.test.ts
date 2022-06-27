import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';

import get from 'lodash-es/get';

import { InternalDateControl as Control } from './index';
import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { NucleonElement } from '../../public/NucleonElement/index';
import { stub } from 'sinon';
import { parseDate } from '../../../utils/parse-date';

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

  testValue = this._value;

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

  protected set _value(newValue: unknown) {
    this.testValue = newValue;
    super._value = newValue;
  }
}

customElements.define('test-internal-date-control', TestControl);

describe('InternalDateControl', () => {
  it('imports and defines vaadin-date-picker', () => {
    expect(customElements.get('vaadin-date-picker')).to.not.be.undefined;
  });

  it('imports and defines foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.equal(InternalEditableControl);
  });

  it('imports and defines itself as foxy-internal-date-control', () => {
    expect(customElements.get('foxy-internal-date-control')).to.equal(Control);
  });

  it('extends InternalEditableControl', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('defines a reactive property for "format" (String)', () => {
    expect(Control).to.have.nested.property('properties.format.type', String);
    expect(new Control()).to.have.property('format', null);
  });

  it('renders vaadin-date-picker element', async () => {
    const layout = html`<test-internal-date-control></test-internal-date-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-date-picker');

    expect(field).to.not.be.null;
  });

  it('sets "errorMessage" on vaadin-date-picker from "_errorMessage" on itself', async () => {
    const layout = html`<test-internal-date-control></test-internal-date-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-date-picker')!;

    expect(field).to.have.property('errorMessage', '');

    control.testErrorMessage = 'test error message';
    await control.updateComplete;

    expect(field).to.have.property('errorMessage', 'test error message');
  });

  it('sets "helperText" on vaadin-date-picker from "helperText" on itself', async () => {
    const layout = html`<test-internal-date-control></test-internal-date-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-date-picker')!;

    expect(field).to.have.property('helperText', 'helper_text');

    control.helperText = 'test helper text';
    await control.updateComplete;

    expect(field).to.have.property('helperText', 'test helper text');
  });

  it('sets "placeholder" on vaadin-date-picker from "placeholder" on itself', async () => {
    const layout = html`<test-internal-date-control></test-internal-date-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-date-picker')!;

    expect(field).to.have.property('placeholder', 'placeholder');

    control.placeholder = 'test placeholder';
    await control.updateComplete;

    expect(field).to.have.property('placeholder', 'test placeholder');
  });

  it('sets "label" on vaadin-date-picker from "label" on itself', async () => {
    const layout = html`<test-internal-date-control></test-internal-date-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-date-picker')!;

    expect(field).to.have.property('label', 'label');

    control.label = 'test label';
    await control.updateComplete;

    expect(field).to.have.property('label', 'test label');
  });

  it('sets "disabled" on vaadin-date-picker from "disabled" on itself', async () => {
    const layout = html`<test-internal-date-control></test-internal-date-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-date-picker')!;

    control.disabled = true;
    await control.updateComplete;
    expect(field).to.have.property('disabled', true);

    control.disabled = false;
    await control.updateComplete;
    expect(field).to.have.property('disabled', false);
  });

  it('sets "readonly" on vaadin-date-picker from "readonly" on itself', async () => {
    const layout = html`<test-internal-date-control></test-internal-date-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-date-picker')!;

    control.readonly = true;
    await control.updateComplete;
    expect(field).to.have.property('readonly', true);

    control.readonly = false;
    await control.updateComplete;
    expect(field).to.have.property('readonly', false);
  });

  it('sets "checkValidity" on vaadin-date-picker from "_checkValidity" on itself', async () => {
    const layout = html`<test-internal-date-control></test-internal-date-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-date-picker')!;

    expect(field).to.have.property('checkValidity', get(control, '_checkValidity'));
  });

  it('sets ISO "value" on vaadin-date-picker from "_value" on itself', async () => {
    const layout = html`<test-internal-date-control></test-internal-date-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-date-picker')!;

    expect(field).to.have.property('value', '');

    control.testValue = '2020-01-01';
    await control.updateComplete;

    expect(field).to.have.property('value', '2020-01-01');
  });

  it('sets UNIX "value" on vaadin-date-picker from "_value" on itself', async () => {
    const layout = html`<test-internal-date-control></test-internal-date-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-date-picker')!;

    expect(field).to.have.property('value', '');

    control.format = 'unix';
    control.testValue = 1577826000;
    await control.updateComplete;

    expect(field).to.have.property('value', '2020-01-01');
  });

  it('writes ISO date to "_value" on change', async () => {
    const layout = html`<test-internal-date-control></test-internal-date-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-date-picker')!;

    expect(field).to.have.property('value', '');

    field.value = '2020-01-01';
    field.dispatchEvent(new CustomEvent('change'));

    expect(control).to.have.property('testValue', '2020-01-01');
  });

  it('writes UNIX date to "_value" on change', async () => {
    const layout = html`<test-internal-date-control></test-internal-date-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-date-picker')!;

    expect(field).to.have.property('value', '');

    control.format = 'unix';
    field.value = '2020-01-01';
    field.dispatchEvent(new CustomEvent('change'));

    const expectedValue = Math.floor((parseDate('2020-01-01')?.getTime() ?? 0) / 1000);
    expect(control).to.have.property('testValue', expectedValue);
  });

  it('submits the host nucleon form on Enter', async () => {
    const layout = html`<test-internal-date-control></test-internal-date-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-date-picker')!;
    const submitMethod = stub(control.nucleon, 'submit');

    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(submitMethod).to.have.been.calledOnce;

    submitMethod.restore();
  });
});
