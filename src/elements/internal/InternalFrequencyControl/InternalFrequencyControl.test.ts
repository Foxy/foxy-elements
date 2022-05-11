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

  it('extends InternalEditableControl', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('renders vaadin-custom-field element', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field');

    expect(field).to.not.be.null;
  });

  it('renders vaadin-integer-field element as part of custom field', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field > vaadin-integer-field');

    expect(field).to.not.be.null;
  });

  it('renders vaadin-combo-box element as part of custom field', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field > vaadin-combo-box');

    expect(field).to.not.be.null;
  });

  it('sets "errorMessage" on vaadin-custom-field from "_errorMessage" on itself', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field')!;

    expect(field).to.have.property('errorMessage', '');

    control.testErrorMessage = 'test error message';
    await control.updateComplete;

    expect(field).to.have.property('errorMessage', 'test error message');
  });

  it('sets "helperText" on vaadin-custom-field from "helperText" on itself', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field')!;

    expect(field).to.have.property('helperText', 'helper_text');

    control.helperText = 'test helper text';
    await control.updateComplete;

    expect(field).to.have.property('helperText', 'test helper text');
  });

  it('sets "label" on vaadin-custom-field from "label" on itself', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field')!;

    expect(field).to.have.property('label', 'label');

    control.label = 'test label';
    await control.updateComplete;

    expect(field).to.have.property('label', 'test label');
  });

  it('sets "disabled" on vaadin elements from "disabled" on itself', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const customField = control.renderRoot.querySelector('vaadin-custom-field')!;
    const integerField = control.renderRoot.querySelector('vaadin-integer-field')!;
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    control.disabled = true;
    await control.updateComplete;

    expect(customField).to.have.attribute('disabled');
    expect(integerField).to.have.attribute('disabled');
    expect(comboBox).to.have.attribute('disabled');

    control.disabled = false;
    await control.updateComplete;

    expect(customField).to.not.have.attribute('disabled');
    expect(integerField).to.not.have.attribute('disabled');
    expect(comboBox).to.not.have.attribute('disabled');
  });

  it('sets "readonly" on vaadin elements from "readonly" on itself', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const customField = control.renderRoot.querySelector('vaadin-custom-field')!;
    const integerField = control.renderRoot.querySelector('vaadin-integer-field')!;
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    control.readonly = true;
    await control.updateComplete;

    expect(customField).to.have.attribute('readonly');
    expect(integerField).to.have.attribute('readonly');
    expect(comboBox).to.have.attribute('readonly');

    control.readonly = false;
    await control.updateComplete;

    expect(customField).to.not.have.attribute('readonly');
    expect(integerField).to.not.have.attribute('readonly');
    expect(comboBox).to.not.have.attribute('readonly');
  });

  it('sets "checkValidity" on vaadin-custom-field from "_checkValidity" on itself', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field')!;

    expect(field).to.have.property('checkValidity', get(control, '_checkValidity'));
  });

  it('sets "invalid" on custom field children if "_checkValidity" returns false', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);

    const integerField = control.renderRoot.querySelector('vaadin-integer-field')!;
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    control.testCheckValidity = () => false;
    await control.updateComplete;

    expect(integerField).to.have.attribute('invalid');
    expect(comboBox).to.have.attribute('invalid');

    control.testCheckValidity = () => true;
    await control.updateComplete;

    expect(integerField).to.not.have.attribute('invalid');
    expect(comboBox).to.not.have.attribute('invalid');
  });

  it('sets "value" on vaadin-custom-field from "_value" on itself', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field')!;

    expect(field).to.have.property('value', '');

    control.testValue = '2w';
    await control.updateComplete;

    expect(field).to.have.property('value', '2w');
  });

  it('parses provided frequency to distribute among custom field elements', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector<CustomFieldElement>('vaadin-custom-field')!;

    expect(field.i18n.parseValue('1w')).to.deep.equal(['1', 'w']);
    expect(field.i18n.parseValue('12m')).to.deep.equal(['12', 'm']);
  });

  it('serializes frequency parts provided by custom field elements', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector<CustomFieldElement>('vaadin-custom-field')!;

    expect(field.i18n.formatValue(['1', 'w'])).to.equal('1w');
    expect(field.i18n.formatValue(['12', 'm'])).to.equal('12m');
  });

  it('writes to "_value" on change', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-custom-field')!;

    expect(field).to.have.property('value', '');

    field.value = '2w';
    field.dispatchEvent(new CustomEvent('change'));

    expect(control).to.have.property('testValue', '2w');
  });

  it('submits the host nucleon form on Enter (vaadin-integer-field)', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-integer-field')!;
    const submitMethod = stub(control.nucleon, 'submit');

    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(submitMethod).to.have.been.calledOnce;

    submitMethod.restore();
  });

  it('submits the host nucleon form on Enter (vaadin-combo-box)', async () => {
    const layout = html`<test-internal-frequency-control></test-internal-frequency-control>`;
    const control = await fixture<TestControl>(layout);
    const field = control.renderRoot.querySelector('vaadin-combo-box')!;
    const submitMethod = stub(control.nucleon, 'submit');

    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(submitMethod).to.have.been.calledOnce;

    submitMethod.restore();
  });
});
