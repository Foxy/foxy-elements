import { CheckboxElement } from '@vaadin/vaadin-checkbox';
import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';

import get from 'lodash-es/get';

import { InternalCheckboxGroupControl as Control } from './index';
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

  testValue = [] as string[];

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

  protected set _value(newValue: string[]) {
    this.testValue = newValue;
    super._value = newValue;
  }
}

customElements.define('test-internal-checkbox-group-control', TestControl);

describe('InternalCheckboxGroupControl', () => {
  it('imports and defines vaadin-checkbox', () => {
    expect(customElements.get('vaadin-checkbox')).to.not.be.undefined;
  });

  it('imports and defines vaadin-checkbox-group', () => {
    expect(customElements.get('vaadin-checkbox-group')).to.not.be.undefined;
  });

  it('imports and defines foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.equal(InternalEditableControl);
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and defines itself as foxy-internal-checkbox-group-control', () => {
    expect(customElements.get('foxy-internal-checkbox-group-control')).to.equal(Control);
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

  it('renders vaadin-checkbox-group element', async () => {
    const layout = html`<test-internal-checkbox-group-control></test-internal-checkbox-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-checkbox-group');

    expect(group).to.not.be.null;
  });

  it('renders vaadin-checkbox elements for each item in "options" array', async () => {
    const layout = html`<test-internal-checkbox-group-control></test-internal-checkbox-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-checkbox-group')!;

    const testOptions = [
      { value: '0', label: 'Foo' },
      { value: '1', label: 'Bar' },
    ];

    control.options = testOptions;
    await control.requestUpdate();

    const boxes = group.querySelectorAll('vaadin-checkbox');

    testOptions.forEach((option, index) => {
      const box = boxes[index];
      const label = box.querySelector('foxy-i18n')!;

      expect(box).to.exist;
      expect(box).to.have.property('value', option.value);

      expect(label).to.have.property('infer', '');
      expect(label).to.have.property('key', option.label);
    });
  });

  it('sets "errorMessage" on vaadin-checkbox-group from "_errorMessage" on itself', async () => {
    const layout = html`<test-internal-checkbox-group-control></test-internal-checkbox-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-checkbox-group')!;

    expect(group).to.have.property('errorMessage', '');

    control.testErrorMessage = 'test error message';
    await control.requestUpdate();

    expect(group).to.have.property('errorMessage', 'test error message');
  });

  it('sets "helperText" on vaadin-checkbox-group from "helperText" on itself', async () => {
    const layout = html`<test-internal-checkbox-group-control></test-internal-checkbox-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-checkbox-group')!;

    expect(group).to.have.property('helperText', 'helper_text');

    control.helperText = 'test helper text';
    await control.requestUpdate();

    expect(group).to.have.property('helperText', 'test helper text');
  });

  it('sets "label" on vaadin-checkbox-group from "label" on itself', async () => {
    const layout = html`<test-internal-checkbox-group-control></test-internal-checkbox-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-checkbox-group')!;

    expect(group).to.have.property('label', 'label');

    control.label = 'test label';
    await control.requestUpdate();

    expect(group).to.have.property('label', 'test label');
  });

  it('sets "theme" on vaadin-checkbox-group from "theme" on itself', async () => {
    const layout = html`<test-internal-checkbox-group-control></test-internal-checkbox-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-checkbox-group')!;

    expect(group).to.have.property('theme', undefined);

    control.theme = 'vertical';
    await control.requestUpdate();

    expect(group).to.have.property('theme', 'vertical');
  });

  it('sets "disabled" on vaadin-checkbox-group from "disabled" on itself', async () => {
    const layout = html`<test-internal-checkbox-group-control></test-internal-checkbox-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-checkbox-group')!;

    control.disabled = true;
    await control.requestUpdate();
    expect(group).to.have.property('disabled', true);

    control.disabled = false;
    await control.requestUpdate();
    expect(group).to.have.property('disabled', false);
  });

  it('sets "disabled" on vaadin-checkbox-group from "readonly" on itself', async () => {
    const layout = html`<test-internal-checkbox-group-control></test-internal-checkbox-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-checkbox-group')!;

    control.disabled = true;
    await control.requestUpdate();
    expect(group).to.have.property('disabled', true);

    control.disabled = false;
    await control.requestUpdate();
    expect(group).to.have.property('disabled', false);
  });

  it('sets "checkValidity" on vaadin-checkbox-group from "_checkValidity" on itself', async () => {
    const layout = html`<test-internal-checkbox-group-control></test-internal-checkbox-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-checkbox-group')!;

    expect(group).to.have.property('checkValidity', get(control, '_checkValidity'));
  });

  it('sets "value" on vaadin-checkbox-group from "_value" on itself', async () => {
    const layout = html`<test-internal-checkbox-group-control></test-internal-checkbox-group-control>`;
    const control = await fixture<TestControl>(layout);
    const group = control.renderRoot.querySelector('vaadin-checkbox-group')!;

    expect(group).to.have.deep.property('value', []);

    control.testValue = ['test_value'];
    await control.requestUpdate();

    expect(group).to.have.deep.property('value', ['test_value']);
  });

  it('writes to "_value" on change', async () => {
    const layout = html`<test-internal-checkbox-group-control></test-internal-checkbox-group-control>`;
    const control = await fixture<TestControl>(layout);

    control.options = [{ label: 'Test Value', value: 'test_value' }];
    await control.requestUpdate();

    const group = control.renderRoot.querySelector('vaadin-checkbox-group')!;
    const box = group.querySelector<CheckboxElement>('[value="test_value"]')!;

    expect(group).to.have.deep.property('value', []);
    expect(box).to.have.property('checked', false);

    box.checked = true;
    box.dispatchEvent(new CustomEvent('change'));

    expect(control).to.have.deep.property('testValue', ['test_value']);
  });
});
