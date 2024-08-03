import { InternalSelectControl as Control } from './index';
import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { expect, fixture } from '@open-wc/testing';
import { I18n } from '../../public/I18n/I18n';
import { html } from 'lit-html';

import get from 'lodash-es/get';
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

customElements.define('test-internal-select-control', TestControl);

describe('InternalSelectControl', () => {
  it('imports and defines vaadin-combo-box', () => {
    expect(customElements.get('vaadin-combo-box')).to.not.be.undefined;
  });

  it('imports and defines foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.equal(InternalEditableControl);
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and defines itself as foxy-internal-select-control', () => {
    expect(customElements.get('foxy-internal-select-control')).to.equal(Control);
  });

  it('extends InternalEditableControl', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('defines a reactive property for "options" (Array)', () => {
    expect(Control).to.have.nested.property('properties.options.type', Array);
    expect(Control).to.not.have.nested.property('properties.options.attribute');
    expect(new Control()).to.have.deep.property('options', []);
  });

  it('defines a reactive property for "layout" (String)', () => {
    expect(Control).to.have.deep.nested.property('properties.layout', {});
    expect(new Control()).to.have.property('layout', null);
  });

  it('defines a reactive property for "theme" (String)', () => {
    expect(Control).to.have.nested.property('properties.theme.type', String);
    expect(Control).to.not.have.nested.property('properties.theme.attribute');
    expect(new Control()).to.have.property('theme', null);
  });

  it('renders vaadin-combo-box element in standalone layout', async () => {
    const layout = html`<test-internal-select-control></test-internal-select-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box');

    expect(comboBox).to.not.be.null;
    expect(comboBox).to.have.attribute('item-label-path', 'label');
    expect(comboBox).to.have.attribute('item-value-path', 'value');
    expect(comboBox).to.have.attribute('item-id-path', 'value');
  });

  it('sets "errorMessage" on vaadin-combo-box from "_errorMessage" on itself in standalone layout', async () => {
    const layout = html`<test-internal-select-control></test-internal-select-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.property('errorMessage', '');

    control.testErrorMessage = 'test error message';
    await control.requestUpdate();

    expect(comboBox).to.have.property('errorMessage', 'test error message');
  });

  it('sets "helperText" on vaadin-combo-box from "helperText" on itself in standalone layout', async () => {
    const layout = html`<test-internal-select-control></test-internal-select-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.property('helperText', 'helper_text');

    control.helperText = 'test helper text';
    await control.requestUpdate();

    expect(comboBox).to.have.property('helperText', 'test helper text');
  });

  it('sets "placeholder" on vaadin-combo-box from "placeholder" on itself in standalone layout', async () => {
    const layout = html`<test-internal-select-control></test-internal-select-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.property('placeholder', 'placeholder');

    control.placeholder = 'test placeholder';
    await control.requestUpdate();

    expect(comboBox).to.have.property('placeholder', 'test placeholder');
  });

  it('sets "label" on vaadin-combo-box from "label" on itself in standalone layout', async () => {
    const layout = html`<test-internal-select-control></test-internal-select-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.property('label', 'label');

    control.label = 'test label';
    await control.requestUpdate();

    expect(comboBox).to.have.property('label', 'test label');
  });

  it('sets "theme" on vaadin-combo-box from "theme" on itself in standalone layout', async () => {
    const layout = html`<test-internal-select-control></test-internal-select-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.not.have.attribute('theme');

    control.theme = 'foo bar baz';
    await control.requestUpdate();

    expect(comboBox).to.have.attribute('theme', 'foo bar baz');
  });

  it('sets translated "items" on vaadin-combo-box from "options" on itself in standalone layout', async () => {
    const layout = html`<test-internal-select-control></test-internal-select-control>`;
    const control = await fixture<TestControl>(layout);

    stub(control, 't').callsFake(key => `i18n_${key}`);

    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;
    expect(comboBox).to.have.deep.property('items', []);

    control.options = [{ label: 'test', value: 'test' }];
    await control.requestUpdate();

    expect(comboBox).to.have.deep.property('items', [{ label: 'i18n_test', value: 'test' }]);
  });

  it('sets "items" with raw label text on vaadin-combo-box from "options" on itself in standalone layout', async () => {
    const layout = html`<test-internal-select-control></test-internal-select-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.deep.property('items', []);

    control.options = [{ rawLabel: 'foo bar', value: 'test' }];
    await control.requestUpdate();
    expect(comboBox).to.have.deep.property('items', [{ label: 'foo bar', value: 'test' }]);
  });

  it('sets "disabled" on vaadin-combo-box from "disabled" on itself in standalone layout', async () => {
    const layout = html`<test-internal-select-control></test-internal-select-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    control.disabled = true;
    await control.requestUpdate();
    expect(comboBox).to.have.property('disabled', true);

    control.disabled = false;
    await control.requestUpdate();
    expect(comboBox).to.have.property('disabled', false);
  });

  it('sets "readonly" on vaadin-combo-box from "readonly" on itself in standalone layout', async () => {
    const layout = html`<test-internal-select-control></test-internal-select-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    control.readonly = true;
    await control.requestUpdate();
    expect(comboBox).to.have.property('readonly', true);

    control.readonly = false;
    await control.requestUpdate();
    expect(comboBox).to.have.property('readonly', false);
  });

  it('sets "checkValidity" on vaadin-combo-box from "_checkValidity" on itself in standalone layout', async () => {
    const layout = html`<test-internal-select-control></test-internal-select-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.property('checkValidity', get(control, '_checkValidity'));
  });

  it('sets "value" on vaadin-combo-box from "_value" on itself in standalone layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-select-control .options=${[{ label: 'test', value: 'test_value' }]}>
      </test-internal-select-control>
    `);

    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;
    expect(comboBox).to.have.property('value', '');

    control.testValue = 'test_value';
    await control.requestUpdate();

    expect(comboBox).to.have.property('value', 'test_value');
  });

  it('writes to "_value" on change in standalone layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-select-control .options=${[{ label: 'test', value: 'test_value' }]}>
      </test-internal-select-control>
    `);

    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;
    expect(comboBox).to.have.property('value', '');

    comboBox.value = 'test_value';
    comboBox.dispatchEvent(new CustomEvent('change'));

    expect(control).to.have.property('testValue', 'test_value');
  });

  it('renders label in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-select-control layout="summary-item"></test-internal-select-control>
    `);

    expect(control.renderRoot).to.include.text('label');

    control.label = 'Foo bar';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('label');
    expect(control.renderRoot).to.include.text('Foo bar');
  });

  it('render helper text in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-select-control layout="summary-item"></test-internal-select-control>
    `);

    expect(control.renderRoot).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('helper_text');
    expect(control.renderRoot).to.include.text('Test helper text');
  });

  it('renders error text in summary item layout if available', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-select-control layout="summary-item"></test-internal-select-control>
    `);

    expect(control.renderRoot).to.not.include.text('Test error message');

    control.testErrorMessage = 'Test error message';
    await control.requestUpdate();

    expect(control.renderRoot).to.include.text('Test error message');
  });

  it('renders a select with options in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-select-control
        placeholder="Test Placeholder"
        layout="summary-item"
        .options=${[
          { label: 'test', value: 'test_value_1' },
          { rawLabel: 'foo bar', value: 'test_value_2' },
        ]}
      >
      </test-internal-select-control>
    `);

    const select = control.renderRoot.querySelector('select')!;
    expect(select.options).to.have.length(3);

    expect(select.options[0]).to.have.property('text', 'Test Placeholder');
    expect(select.options[0]).to.have.property('value', '');
    expect(select.options[0].selected).to.be.true;

    expect(select.options[1]).to.have.property('text', 'test');
    expect(select.options[1]).to.have.property('value', 'test_value_1');
    expect(select.options[1].selected).to.be.false;

    expect(select.options[2]).to.have.property('text', 'foo bar');
    expect(select.options[2]).to.have.property('value', 'test_value_2');
    expect(select.options[2].selected).to.be.false;

    control.testValue = 'test_value_2';
    await control.requestUpdate();

    expect(select.options[0].selected).to.be.false;
    expect(select.options[1].selected).to.be.false;
    expect(select.options[2].selected).to.be.true;

    select.options[1].selected = true;
    select.dispatchEvent(new CustomEvent('change'));
    expect(control).to.have.property('testValue', 'test_value_1');
  });

  it('renders the selected value in plain text in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-select-control
        placeholder="Test Placeholder"
        layout="summary-item"
        .options=${[
          { label: 'v1_key', value: 'test_value_1' },
          { rawLabel: 'foo bar', value: 'test_value_2' },
        ]}
      >
      </test-internal-select-control>
    `);

    expect(control.renderRoot).to.include.text('Test Placeholder');

    control.testValue = 'test_value_1';
    await control.requestUpdate();

    expect(control.renderRoot).to.include.text('v1_key');
  });

  it('disables select when control is disabled in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-select-control layout="summary-item" disabled></test-internal-select-control>
    `);

    const select = control.renderRoot.querySelector('select')!;
    expect(select).to.have.property('disabled', true);

    control.disabled = false;
    await control.requestUpdate();

    expect(select).to.have.property('disabled', false);
  });

  it('hides select when control is readonly in summary item layout', async () => {
    const control = await fixture<TestControl>(html`
      <test-internal-select-control layout="summary-item" readonly></test-internal-select-control>
    `);

    const select = control.renderRoot.querySelector('select')!;
    expect(select).to.have.attribute('hidden');

    control.readonly = false;
    await control.requestUpdate();

    expect(select).to.not.have.attribute('hidden');
  });
});
