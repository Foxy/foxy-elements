import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';

import get from 'lodash-es/get';

import { InternalRadioGroupControl as Control } from './index';
import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { NucleonElement } from '../../public/NucleonElement/index';
import { I18n } from '../../public/I18n/I18n';

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

  testValue = null as null | string;

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

  protected set _value(newValue: null | string) {
    this.testValue = newValue;
    super._value = newValue;
  }
}

customElements.define('test-internal-radio-group-control', TestControl);

describe('InternalRadioGroupControl', () => {
  it('imports and defines vaadin-radio-button', () => {
    expect(customElements.get('vaadin-radio-button')).to.not.be.undefined;
  });

  it('imports and defines vaadin-radio-group', () => {
    expect(customElements.get('vaadin-radio-group')).to.not.be.undefined;
  });

  it('imports and defines foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.equal(InternalEditableControl);
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and defines itself as foxy-internal-radio-group-control', () => {
    expect(customElements.get('foxy-internal-radio-group-control')).to.equal(Control);
  });

  it('extends InternalEditableControl', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('defines a reactive property for "options" (Array)', () => {
    expect(Control).to.have.nested.property('properties.options.type', Array);
    expect(Control).to.not.have.nested.property('properties.options.attribute');
    expect(new Control()).to.have.deep.property('options', []);
  });

  it('defines a reactive property for "theme" (String)', () => {
    expect(Control).to.have.nested.property('properties.theme.type', String);
    expect(Control).to.not.have.nested.property('properties.theme.attribute');
    expect(new Control()).to.have.property('theme', null);
  });

  it('renders vaadin-radio-group element', async () => {
    const layout = html`<test-internal-radio-group-control></test-internal-radio-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-radio-group');

    expect(group).to.not.be.null;
  });

  it('renders vaadin-radio-button elements for each item in "options" array', async () => {
    const layout = html`<test-internal-radio-group-control></test-internal-radio-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-radio-group')!;

    const testOptions = [
      { value: '0', label: 'Foo' },
      { value: '1', label: 'Bar' },
    ];

    control.options = testOptions;
    await control.updateComplete;

    const boxes = group.querySelectorAll('vaadin-radio-button');

    testOptions.forEach((option, index) => {
      const box = boxes[index];
      const label = box.querySelector('foxy-i18n')!;

      expect(box).to.exist;
      expect(box).to.have.property('value', option.value);

      expect(label).to.have.property('infer', '');
      expect(label).to.have.property('key', option.label);
    });
  });

  it('sets "errorMessage" on vaadin-radio-group from "_errorMessage" on itself', async () => {
    const layout = html`<test-internal-radio-group-control></test-internal-radio-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-radio-group')!;

    expect(group).to.have.property('errorMessage', '');

    control.testErrorMessage = 'test error message';
    await control.updateComplete;

    expect(group).to.have.property('errorMessage', 'test error message');
  });

  it('sets "helperText" on vaadin-radio-group from "helperText" on itself', async () => {
    const layout = html`<test-internal-radio-group-control></test-internal-radio-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-radio-group')!;

    expect(group).to.have.property('helperText', 'helper_text');

    control.helperText = 'test helper text';
    await control.updateComplete;

    expect(group).to.have.property('helperText', 'test helper text');
  });

  it('sets "label" on vaadin-radio-group from "label" on itself', async () => {
    const layout = html`<test-internal-radio-group-control></test-internal-radio-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-radio-group')!;

    expect(group).to.have.property('label', 'label');

    control.label = 'test label';
    await control.updateComplete;

    expect(group).to.have.property('label', 'test label');
  });

  it('sets "theme" on vaadin-radio-group from "theme" on itself', async () => {
    const layout = html`<test-internal-radio-group-control></test-internal-radio-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-radio-group')!;

    expect(group).to.have.property('theme', undefined);

    control.theme = 'vertical';
    await control.updateComplete;

    expect(group).to.have.property('theme', 'vertical');
  });

  it('sets "disabled" on vaadin-radio-group from "disabled" on itself', async () => {
    const layout = html`<test-internal-radio-group-control></test-internal-radio-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-radio-group')!;

    control.disabled = true;
    await control.updateComplete;
    expect(group).to.have.property('disabled', true);

    control.disabled = false;
    await control.updateComplete;
    expect(group).to.have.property('disabled', false);
  });

  it('sets "readonly" on vaadin-radio-group from "readonly" on itself', async () => {
    const layout = html`<test-internal-radio-group-control></test-internal-radio-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-radio-group')!;

    control.readonly = true;
    await control.updateComplete;
    expect(group).to.have.property('readonly', true);

    control.readonly = false;
    await control.updateComplete;
    expect(group).to.have.property('readonly', false);
  });

  it('sets "checkValidity" on vaadin-radio-group from "_checkValidity" on itself', async () => {
    const layout = html`<test-internal-radio-group-control></test-internal-radio-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-radio-group')!;

    expect(group).to.have.property('checkValidity', get(control, '_checkValidity'));
  });

  it('sets "value" on vaadin-radio-group from "_value" on itself', async () => {
    const layout = html`<test-internal-radio-group-control></test-internal-radio-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-radio-group')!;

    expect(group).to.have.deep.property('value', null);

    control.testValue = 'test_value';
    await control.updateComplete;

    expect(group).to.have.deep.property('value', 'test_value');
  });

  it('writes to "_value" on change', async () => {
    const layout = html`<test-internal-radio-group-control></test-internal-radio-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-radio-group')!;

    expect(group).to.have.deep.property('value', null);

    group.value = 'test_value';
    group.dispatchEvent(new CustomEvent('change'));

    expect(control).to.have.deep.property('testValue', 'test_value');
  });
});
