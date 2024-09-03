import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';

import get from 'lodash-es/get';

import { InternalPasswordControl as Control } from './index';
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

customElements.define('test-internal-password-control', TestControl);

describe('InternalTextControl', () => {
  it('imports and defines vaadin-password-field', () => {
    expect(customElements.get('vaadin-password-field')).to.not.be.undefined;
  });

  it('imports and defines foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.equal(InternalEditableControl);
  });

  it('imports and defines itself as foxy-internal-password-control', () => {
    expect(customElements.get('foxy-internal-password-control')).to.equal(Control);
  });

  it('has a reactive property for "generatorOptions"', () => {
    expect(Control).to.have.deep.nested.property('properties.generatorOptions', {
      attribute: 'generator-options',
      type: Object,
    });

    expect(new Control()).to.have.property('generatorOptions', null);
  });

  it('has a reactive property for "showGenerator"', () => {
    expect(Control).to.have.deep.nested.property('properties.showGenerator', {
      attribute: 'show-generator',
      type: Boolean,
    });
    expect(new Control()).to.have.property('showGenerator', false);
  });

  it('has a reactive property "layout"', () => {
    expect(Control).to.have.deep.nested.property('properties.layout', {});
    expect(new Control()).to.have.property('layout', null);
  });

  it('extends InternalEditableControl', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('renders vaadin-password-field element', async () => {
    const layout = html`<test-internal-password-control></test-internal-password-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-password-field');

    expect(field).to.not.be.null;
  });

  it('sets "errorMessage" on vaadin-password-field from "_errorMessage" on itself', async () => {
    const layout = html`<test-internal-password-control></test-internal-password-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-password-field')!;

    expect(field).to.have.property('errorMessage', '');

    control.testErrorMessage = 'test error message';
    await control.requestUpdate();

    expect(field).to.have.property('errorMessage', 'test error message');
  });

  it('sets "helperText" on vaadin-password-field from "helperText" on itself', async () => {
    const layout = html`<test-internal-password-control></test-internal-password-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-password-field')!;

    expect(field).to.have.property('helperText', 'helper_text');

    control.helperText = 'test helper text';
    await control.requestUpdate();

    expect(field).to.have.property('helperText', 'test helper text');
  });

  it('sets "placeholder" on vaadin-password-field from "placeholder" on itself', async () => {
    const layout = html`<test-internal-password-control></test-internal-password-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-password-field')!;

    expect(field).to.have.property('placeholder', 'placeholder');

    control.placeholder = 'test placeholder';
    await control.requestUpdate();

    expect(field).to.have.property('placeholder', 'test placeholder');
  });

  it('sets "label" on vaadin-password-field from "label" on itself', async () => {
    const layout = html`<test-internal-password-control></test-internal-password-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-password-field')!;

    expect(field).to.have.property('label', 'label');

    control.label = 'test label';
    await control.requestUpdate();

    expect(field).to.have.property('label', 'test label');
  });

  it('sets "theme" on vaadin-password-field from "layout" on itself', async () => {
    const layout = html`<test-internal-password-control></test-internal-password-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-password-field')!;
    expect(field).to.not.have.attribute('theme');

    control.layout = 'summary-item';
    await control.requestUpdate();
    expect(field).to.have.attribute('theme', 'summary-item');
  });

  it('sets "disabled" on vaadin-password-field from "disabled" on itself', async () => {
    const layout = html`<test-internal-password-control></test-internal-password-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-password-field')!;

    control.disabled = true;
    await control.requestUpdate();
    expect(field).to.have.property('disabled', true);

    control.disabled = false;
    await control.requestUpdate();
    expect(field).to.have.property('disabled', false);
  });

  it('sets "readonly" on vaadin-password-field from "readonly" on itself', async () => {
    const layout = html`<test-internal-password-control></test-internal-password-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-password-field')!;

    control.readonly = true;
    await control.requestUpdate();
    expect(field).to.have.property('readonly', true);

    control.readonly = false;
    await control.requestUpdate();
    expect(field).to.have.property('readonly', false);
  });

  it('sets "checkValidity" on vaadin-password-field from "_checkValidity" on itself', async () => {
    const layout = html`<test-internal-password-control></test-internal-password-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-password-field')!;

    expect(field).to.have.property('checkValidity', get(control, '_checkValidity'));
  });

  it('sets "value" on vaadin-password-field from "_value" on itself', async () => {
    const layout = html`<test-internal-password-control></test-internal-password-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-password-field')!;

    expect(field).to.have.property('value', '');

    control.testValue = 'test_value';
    await control.requestUpdate();

    expect(field).to.have.property('value', 'test_value');
  });

  it('writes to "_value" on input', async () => {
    const layout = html`<test-internal-password-control></test-internal-password-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-password-field')!;

    expect(field).to.have.property('value', '');

    field.value = 'test_value';
    field.dispatchEvent(new CustomEvent('input'));

    expect(control).to.have.property('testValue', 'test_value');
  });

  it('submits the host nucleon form on Enter', async () => {
    const layout = html`<test-internal-password-control></test-internal-password-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-password-field')!;
    const submitMethod = stub(control.nucleon, 'submit');

    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(submitMethod).to.have.been.calledOnce;

    submitMethod.restore();
  });

  it('shows a password generator button when "showGenerator" is true', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-password-control show-generator></test-internal-password-control>
    `);

    let button = control.renderRoot.querySelector<HTMLElement>('[data-testid="generator"]')!;
    expect(button).to.exist;

    button.click();
    expect(control).to.have.property('testValue').that.is.not.empty;

    control.showGenerator = false;
    await control.requestUpdate();

    button = control.renderRoot.querySelector<HTMLElement>('[data-testid="generator"]')!;
    expect(button).to.not.exist;
  });

  it('uses password generator options when generating a password', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-password-control show-generator></test-internal-password-control>
    `);

    const button = control.renderRoot.querySelector<HTMLElement>('[data-testid="generator"]')!;
    expect(button).to.exist;

    button.click();
    expect(control.testValue).to.match(/^[a-zA-Z0-9]{6}-[a-zA-Z0-9]{6}-[a-zA-Z0-9]{6}$/);

    control.generatorOptions = {
      separator: '|',
      charset: 'abcdefghijklmnopqrstuvwxyz0123456789',
      length: 12,
    };

    button.click();
    expect(control.testValue).to.match(/^[a-z0-9]{6}\|[a-z0-9]{6}$/);
  });
});
