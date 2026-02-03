import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';

import { InternalNativeDateControl as Control } from './index';
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

customElements.define('test-internal-native-date-control', TestControl);

describe('InternalNativeDateControl', () => {
  it('imports and defines foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.equal(InternalEditableControl);
  });

  it('imports and defines itself as foxy-internal-native-date-control', () => {
    expect(customElements.get('foxy-internal-native-date-control')).to.equal(Control);
  });

  it('extends InternalEditableControl', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('defines a reactive property for "format" (String, default "date")', () => {
    expect(Control).to.have.deep.nested.property('properties.format', {});
    expect(new Control()).to.have.property('format', 'date');
  });

  it('renders a date input element', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    const input = control.renderRoot.querySelector('input');
    expect(input).to.not.be.null;
    expect(input).to.have.attribute('type', 'date');
  });

  it('renders a datetime-local input when format is "datetime-local"', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control
        format="datetime-local"
      ></test-internal-native-date-control>
    `);

    const input = control.renderRoot.querySelector('input');
    expect(input).to.not.be.null;
    expect(input).to.have.attribute('type', 'datetime-local');
  });

  it('renders label', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    expect(control.renderRoot).to.include.text('label');

    control.label = 'Foo bar';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('label');
    expect(control.renderRoot).to.include.text('Foo bar');
  });

  it('renders helper text', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    expect(control.renderRoot).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('helper_text');
    expect(control.renderRoot).to.include.text('Test helper text');
  });

  it('renders error text after reportValidity() is called', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    expect(control.renderRoot).to.not.include.text('Test error message');

    control.testErrorMessage = 'Test error message';
    await control.requestUpdate();

    // Error message should still be hidden until reportValidity() is called
    const errorElement = control.renderRoot.querySelector('.text-error');
    expect(errorElement).to.have.attribute('hidden');

    control.reportValidity();
    await control.requestUpdate();

    expect(errorElement).to.not.have.attribute('hidden');
    expect(control.renderRoot).to.include.text('Test error message');
  });

  it('shows error text after input blur', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    control.testErrorMessage = 'Test error message';
    await control.requestUpdate();

    const errorElement = control.renderRoot.querySelector('.text-error');
    expect(errorElement).to.have.attribute('hidden');

    const input = control.renderRoot.querySelector('input')!;
    input.dispatchEvent(new Event('blur'));
    await control.requestUpdate();

    expect(errorElement).to.not.have.attribute('hidden');
    expect(control.renderRoot).to.include.text('Test error message');
  });

  it('hides error text when disabled', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    control.testErrorMessage = 'Test error message';
    control.reportValidity();
    control.disabled = true;
    await control.requestUpdate();

    const errorElement = control.renderRoot.querySelector('.text-error');
    expect(errorElement).to.have.attribute('hidden');
  });

  it('hides error text when readonly', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    control.testErrorMessage = 'Test error message';
    control.reportValidity();
    control.readonly = true;
    await control.requestUpdate();

    const errorElement = control.renderRoot.querySelector('.text-error');
    expect(errorElement).to.have.attribute('hidden');
  });

  it('sets "disabled" on input from "disabled" on itself', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
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

  it('sets "readonly" on input from "readonly" on itself', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
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

  it('sets "placeholder" on input from "placeholder" on itself', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    expect(input).to.have.property('placeholder', 'placeholder');

    control.placeholder = 'Test placeholder';
    await control.requestUpdate();

    expect(input).to.have.property('placeholder', 'Test placeholder');
  });

  it('sets "value" on input from "_value" on itself', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    expect(input).to.have.property('value', '');

    control.testValue = '2023-01-15';
    await control.requestUpdate();

    expect(input).to.have.property('value', '2023-01-15');
  });

  it('writes to "_value" on input', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    expect(input).to.have.property('value', '');

    input.value = '2023-01-15';
    input.dispatchEvent(new CustomEvent('input'));

    expect(control).to.have.property('testValue', '2023-01-15');
  });

  it('submits the host nucleon form on Enter', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    const submitMethod = stub(control.nucleon, 'submit');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(submitMethod).to.have.been.calledOnce;

    submitMethod.restore();
  });

  it('renders a clear button', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    control.testValue = '2023-01-15';
    await control.requestUpdate();

    const button = control.renderRoot.querySelector('button');
    expect(button).to.not.be.null;
    expect(button).to.have.attribute('aria-label', 'clear');
  });

  it('clears the value and dispatches "clear" event when clear button is clicked', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    control.testValue = '2023-01-15';
    await control.requestUpdate();

    const button = control.renderRoot.querySelector('button')!;
    const clearHandler = stub();
    control.addEventListener('clear', clearHandler);

    button.click();

    expect(control).to.have.property('testValue', '');
    expect(clearHandler).to.have.been.calledOnce;
  });

  it('hides clear button when readonly', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    control.testValue = '2023-01-15';
    control.readonly = true;
    await control.requestUpdate();

    const button = control.renderRoot.querySelector('button');
    expect(button).to.have.attribute('hidden');
  });

  it('hides clear button when value is empty', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    control.testValue = '';
    await control.requestUpdate();

    const button = control.renderRoot.querySelector('button');
    expect(button).to.have.attribute('hidden');
  });

  it('disables clear button when control is disabled', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    control.testValue = '2023-01-15';
    control.disabled = true;
    await control.requestUpdate();

    const button = control.renderRoot.querySelector('button');
    expect(button).to.have.property('disabled', true);
  });

  it('focuses input when clicking outside INPUT and LABEL elements', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    const focusStub = stub(input, 'focus');

    const mockEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(mockEvent, 'composedPath', {
      value: () => [control],
    });

    // @ts-expect-error accessing protected member for testing purposes
    control._handleHostClick(mockEvent);

    expect(focusStub).to.have.been.calledOnce;

    focusStub.restore();
  });

  it('does not focus input when clicking on INPUT element', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    const focusStub = stub(input, 'focus');

    const mockEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(mockEvent, 'composedPath', {
      value: () => [input],
    });

    // @ts-expect-error accessing protected member for testing purposes
    control._handleHostClick(mockEvent);

    expect(focusStub).to.not.have.been.called;

    focusStub.restore();
  });

  it('does not focus input when clicking on LABEL element', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-native-date-control></test-internal-native-date-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    const focusStub = stub(input, 'focus');
    const label = document.createElement('label');

    const mockEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(mockEvent, 'composedPath', {
      value: () => [label],
    });

    // @ts-expect-error accessing protected member for testing purposes
    control._handleHostClick(mockEvent);

    expect(focusStub).to.not.have.been.called;

    focusStub.restore();
  });
});
