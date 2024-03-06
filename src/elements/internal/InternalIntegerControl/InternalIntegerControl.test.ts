import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';

import get from 'lodash-es/get';

import { InternalIntegerControl as Control } from './index';
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

  testValue = 0;

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

  protected set _value(newValue: number) {
    this.testValue = newValue;
    super._value = newValue;
  }
}

customElements.define('test-internal-integer-control', TestControl);

describe('InternalIntegerControl', () => {
  it('imports and defines vaadin-integer-field', () => {
    expect(customElements.get('vaadin-integer-field')).to.not.be.undefined;
  });

  it('imports and defines foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.equal(InternalEditableControl);
  });

  it('imports and defines itself as foxy-internal-integer-control', () => {
    expect(customElements.get('foxy-internal-integer-control')).to.equal(Control);
  });

  it('extends InternalEditableControl', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('renders vaadin-integer-field element', async () => {
    const layout = html`<test-internal-integer-control></test-internal-integer-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field');

    expect(field).to.not.be.null;
  });

  it('sets "errorMessage" on vaadin-integer-field from "_errorMessage" on itself', async () => {
    const layout = html`<test-internal-integer-control></test-internal-integer-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field')!;

    expect(field).to.have.property('errorMessage', '');

    control.testErrorMessage = 'test error message';
    await control.requestUpdate();

    expect(field).to.have.property('errorMessage', 'test error message');
  });

  it('sets "helperText" on vaadin-integer-field from "helperText" on itself', async () => {
    const layout = html`<test-internal-integer-control></test-internal-integer-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field')!;

    expect(field).to.have.property('helperText', 'helper_text');

    control.helperText = 'test helper text';
    await control.requestUpdate();

    expect(field).to.have.property('helperText', 'test helper text');
  });

  it('sets "placeholder" on vaadin-integer-field from "placeholder" on itself', async () => {
    const layout = html`<test-internal-integer-control></test-internal-integer-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field')!;

    expect(field).to.have.property('placeholder', 'placeholder');

    control.placeholder = 'test placeholder';
    await control.requestUpdate();

    expect(field).to.have.property('placeholder', 'test placeholder');
  });

  it('sets "label" on vaadin-integer-field from "label" on itself', async () => {
    const layout = html`<test-internal-integer-control></test-internal-integer-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field')!;

    expect(field).to.have.property('label', 'label');

    control.label = 'test label';
    await control.requestUpdate();

    expect(field).to.have.property('label', 'test label');
  });

  it('sets "disabled" on vaadin-integer-field from "disabled" on itself', async () => {
    const layout = html`<test-internal-integer-control></test-internal-integer-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field')!;

    control.disabled = true;
    await control.requestUpdate();
    expect(field).to.have.property('disabled', true);

    control.disabled = false;
    await control.requestUpdate();
    expect(field).to.have.property('disabled', false);
  });

  it('sets "readonly" on vaadin-integer-field from "readonly" on itself', async () => {
    const layout = html`<test-internal-integer-control></test-internal-integer-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field')!;

    control.readonly = true;
    await control.requestUpdate();
    expect(field).to.have.property('readonly', true);

    control.readonly = false;
    await control.requestUpdate();
    expect(field).to.have.property('readonly', false);
  });

  it('sets "checkValidity" on vaadin-integer-field from "_checkValidity" on itself', async () => {
    const layout = html`<test-internal-integer-control></test-internal-integer-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field')!;

    expect(field).to.have.property('checkValidity', get(control, '_checkValidity'));
  });

  it('sets "value" on vaadin-integer-field from "_value" on itself', async () => {
    const layout = html`<test-internal-integer-control></test-internal-integer-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field')!;

    expect(field).to.have.property('value', '0');

    control.testValue = 42;
    await control.requestUpdate();

    expect(field).to.have.property('value', '42');
  });

  it('writes to "_value" on change', async () => {
    const layout = html`<test-internal-integer-control></test-internal-integer-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field')!;

    expect(field).to.have.property('value', '0');

    field.value = '42';
    field.dispatchEvent(new CustomEvent('change'));

    expect(control).to.have.property('testValue', 42);
  });

  it('submits the host nucleon form on Enter', async () => {
    const layout = html`<test-internal-integer-control></test-internal-integer-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field')!;
    const submitMethod = stub(control.nucleon, 'submit');

    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(submitMethod).to.have.been.calledOnce;

    submitMethod.restore();
  });
});
