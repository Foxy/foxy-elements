import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';

import get from 'lodash-es/get';

import { InternalTextControl as Control } from './index';
import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { NucleonElement } from '../../public/NucleonElement/index';
import { stub } from 'sinon';

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

  testValue = '';

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

  protected set _value(newValue: string) {
    this.testValue = newValue;
    super._value = newValue;
  }
}

customElements.define('test-internal-text-control', TestControl);

describe('InternalTextControl', () => {
  it('imports and defines vaadin-text-field', () => {
    expect(customElements.get('vaadin-text-field')).to.not.be.undefined;
  });

  it('imports and defines foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.equal(InternalEditableControl);
  });

  it('imports and defines itself as foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.equal(Control);
  });

  it('extends InternalEditableControl', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('defines a reactive property for "layout" (String)', () => {
    expect(Control).to.have.deep.nested.property('properties.layout', {});
    expect(new Control()).to.have.property('layout', null);
  });

  it('renders vaadin-text-field element', async () => {
    const layout = html`<test-internal-text-control></test-internal-text-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-text-field');

    expect(field).to.not.be.null;
  });

  it('sets "errorMessage" on vaadin-text-field from "_errorMessage" on itself in standalone mode', async () => {
    const layout = html`<test-internal-text-control></test-internal-text-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-text-field')!;

    expect(field).to.have.property('errorMessage', '');

    control.testErrorMessage = 'test error message';
    await control.requestUpdate();

    expect(field).to.have.property('errorMessage', 'test error message');
  });

  it('sets "helperText" on vaadin-text-field from "helperText" on itself in standalone mode', async () => {
    const layout = html`<test-internal-text-control></test-internal-text-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-text-field')!;

    expect(field).to.have.property('helperText', 'helper_text');

    control.helperText = 'test helper text';
    await control.requestUpdate();

    expect(field).to.have.property('helperText', 'test helper text');
  });

  it('sets "placeholder" on vaadin-text-field from "placeholder" on itself in standalone mode', async () => {
    const layout = html`<test-internal-text-control></test-internal-text-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-text-field')!;

    expect(field).to.have.property('placeholder', 'placeholder');

    control.placeholder = 'test placeholder';
    await control.requestUpdate();

    expect(field).to.have.property('placeholder', 'test placeholder');
  });

  it('sets "label" on vaadin-text-field from "label" on itself in standalone mode', async () => {
    const layout = html`<test-internal-text-control></test-internal-text-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-text-field')!;

    expect(field).to.have.property('label', 'label');

    control.label = 'test label';
    await control.requestUpdate();

    expect(field).to.have.property('label', 'test label');
  });

  it('sets "disabled" on vaadin-text-field from "disabled" on itself in standalone mode', async () => {
    const layout = html`<test-internal-text-control></test-internal-text-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-text-field')!;

    control.disabled = true;
    await control.requestUpdate();
    expect(field).to.have.property('disabled', true);

    control.disabled = false;
    await control.requestUpdate();
    expect(field).to.have.property('disabled', false);
  });

  it('sets "readonly" on vaadin-text-field from "readonly" on itself in standalone mode', async () => {
    const layout = html`<test-internal-text-control></test-internal-text-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-text-field')!;

    control.readonly = true;
    await control.requestUpdate();
    expect(field).to.have.property('readonly', true);

    control.readonly = false;
    await control.requestUpdate();
    expect(field).to.have.property('readonly', false);
  });

  it('sets "checkValidity" on vaadin-text-field from "_checkValidity" on itself in standalone mode', async () => {
    const layout = html`<test-internal-text-control></test-internal-text-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-text-field')!;

    expect(field).to.have.property('checkValidity', get(control, '_checkValidity'));
  });

  it('sets "value" on vaadin-text-field from "_value" on itself in standalone mode', async () => {
    const layout = html`<test-internal-text-control></test-internal-text-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-text-field')!;

    expect(field).to.have.property('value', '');

    control.testValue = 'test_value';
    await control.requestUpdate();

    expect(field).to.have.property('value', 'test_value');
  });

  it('writes to "_value" on input in standalone mode', async () => {
    const layout = html`<test-internal-text-control></test-internal-text-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-text-field')!;

    expect(field).to.have.property('value', '');

    field.value = 'test_value';
    field.dispatchEvent(new CustomEvent('input'));

    expect(control).to.have.property('testValue', 'test_value');
  });

  it('submits the host nucleon form on Enter in standalone mode', async () => {
    const layout = html`<test-internal-text-control></test-internal-text-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-text-field')!;
    const submitMethod = stub(control.nucleon, 'submit');

    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(submitMethod).to.have.been.calledOnce;

    submitMethod.restore();
  });

  it('renders label in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-text-control layout="summary-item"></test-internal-text-control>
    `);

    expect(control.renderRoot).to.include.text('label');

    control.label = 'Foo bar';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('label');
    expect(control.renderRoot).to.include.text('Foo bar');
  });

  it('renders helper text in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-text-control layout="summary-item"></test-internal-text-control>
    `);

    expect(control.renderRoot).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('helper_text');
    expect(control.renderRoot).to.include.text('Test helper text');
  });

  it('renders error text in summary item layout if available', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-text-control layout="summary-item"></test-internal-text-control>
    `);

    expect(control.renderRoot).to.not.include.text('Test error message');

    control.testErrorMessage = 'Test error message';
    await control.requestUpdate();

    expect(control.renderRoot).to.include.text('Test error message');
  });

  it('renders text input in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-text-control layout="summary-item"></test-internal-text-control>
    `);

    const vaadinTextField = control.renderRoot.querySelector('vaadin-text-field');
    expect(vaadinTextField).to.be.null;

    const input = control.renderRoot.querySelector('input');
    expect(input).to.not.be.null;
    expect(input).to.have.attribute('type', 'text');
  });

  it('sets "disabled" on input from "disabled" on itself in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-text-control layout="summary-item"></test-internal-text-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    expect(input).to.have.property('disabled', false);

    control.disabled = true;
    await control.requestUpdate();

    expect(input).to.have.property('disabled', true);

    control.disabled = false;
    await control.requestUpdate();

    expect(input).to.have.property('disabled', false);
  });

  it('sets "readonly" on input from "readonly" on itself in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-text-control layout="summary-item"></test-internal-text-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    expect(input).to.have.property('readOnly', false);

    control.readonly = true;
    await control.requestUpdate();

    expect(input).to.have.property('readOnly', true);

    control.readonly = false;
    await control.requestUpdate();

    expect(input).to.have.property('readOnly', false);
  });

  it('sets "placeholder" on input from "placeholder" on itself in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-text-control layout="summary-item"></test-internal-text-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    expect(input).to.have.property('placeholder', 'placeholder');

    control.placeholder = 'Test placeholder';
    await control.requestUpdate();

    expect(input).to.have.property('placeholder', 'Test placeholder');
  });

  it('sets "value" on input from "_value" on itself in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-text-control layout="summary-item"></test-internal-text-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    expect(input).to.have.property('value', '');

    control.testValue = 'test_value';
    await control.requestUpdate();

    expect(input).to.have.property('value', 'test_value');
  });

  it('writes to "_value" on input in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-text-control layout="summary-item"></test-internal-text-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    expect(input).to.have.property('value', '');

    input.value = 'test_value';
    input.dispatchEvent(new CustomEvent('input'));

    expect(control).to.have.property('testValue', 'test_value');
  });

  it('submits the host nucleon form on Enter in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-text-control layout="summary-item"></test-internal-text-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    const submitMethod = stub(control.nucleon, 'submit');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(submitMethod).to.have.been.calledOnce;

    submitMethod.restore();
  });
});
