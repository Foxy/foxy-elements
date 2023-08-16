import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { InternalSourceControl as Control } from './index';
import { NucleonElement } from '../../public/NucleonElement/index';

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

customElements.define('test-internal-source-control', TestControl);

describe('InternalSourceControl', () => {
  it('imports and defines foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.equal(InternalEditableControl);
  });

  it('imports and defines itself as foxy-internal-source-control', () => {
    expect(customElements.get('foxy-internal-source-control')).to.equal(Control);
  });

  it('extends InternalEditableControl', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('renders textarea element', async () => {
    const layout = html`<test-internal-source-control></test-internal-source-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('textarea');

    expect(field).to.not.be.null;
  });

  it('sets "placeholder" on textarea from "placeholder" on itself', async () => {
    const layout = html`<test-internal-source-control></test-internal-source-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('textarea')!;

    expect(field).to.have.property('placeholder', 'placeholder');

    control.placeholder = 'test placeholder';
    await control.updateComplete;

    expect(field).to.have.property('placeholder', 'test placeholder');
  });

  it('renders textarea label from "label" on itself', async () => {
    const layout = html`<test-internal-source-control></test-internal-source-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('textarea')!;

    expect(field.labels[0]).to.contain.text('label');

    control.label = 'test label';
    await control.updateComplete;

    expect(field.labels[0]).to.contain.text('test label');
  });

  it('renders helper text from "helperText" on itself', async () => {
    const layout = html`<test-internal-source-control></test-internal-source-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('textarea')!;

    expect(field.labels[0]).to.contain.text('helper_text');

    control.helperText = 'test helper text';
    await control.updateComplete;

    expect(field.labels[0]).to.contain.text('test helper text');
  });

  it('sets "disabled" on textarea from "disabled" on itself', async () => {
    const layout = html`<test-internal-source-control></test-internal-source-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('textarea')!;

    control.disabled = true;
    await control.updateComplete;
    expect(field).to.have.attribute('disabled');

    control.disabled = false;
    await control.updateComplete;
    expect(field).to.not.have.attribute('disabled');
  });

  it('sets "readonly" on textarea from "readonly" on itself', async () => {
    const layout = html`<test-internal-source-control></test-internal-source-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('textarea')!;

    control.readonly = true;
    await control.updateComplete;
    expect(field).to.have.attribute('readonly');

    control.readonly = false;
    await control.updateComplete;
    expect(field).to.not.have.attribute('readonly');
  });

  it('sets "value" on textarea from "_value" on itself', async () => {
    const layout = html`<test-internal-source-control></test-internal-source-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('textarea')!;

    expect(field).to.have.property('value', '');

    control.testValue = 'test_value';
    await control.updateComplete;

    expect(field).to.have.property('value', 'test_value');
  });

  it('writes to "_value" on input', async () => {
    const layout = html`<test-internal-source-control></test-internal-source-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('textarea')!;

    expect(field).to.have.property('value', '');

    field.value = 'test_value';
    field.dispatchEvent(new CustomEvent('input'));

    expect(control).to.have.property('testValue', 'test_value');
  });
});
