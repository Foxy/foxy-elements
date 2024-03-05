import type { FetchEvent } from '../../public/NucleonElement/FetchEvent';

import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';

import get from 'lodash-es/get';

import { InternalAsyncComboBoxControl as Control } from './index';
import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';

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

customElements.define('test-internal-async-combo-box-control', TestControl);

describe('InternalAsyncComboBoxControl', () => {
  it('imports and defines vaadin-combo-box', () => {
    expect(customElements.get('vaadin-combo-box')).to.not.be.undefined;
  });

  it('imports and defines foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.equal(InternalEditableControl);
  });

  it('imports and defines itself as foxy-internal-async-combo-box-control', () => {
    expect(customElements.get('foxy-internal-async-combo-box-control')).to.equal(Control);
  });

  it('extends InternalEditableControl', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('defines a reactive property for "itemLabelPath" ("item-label-path", String)', () => {
    expect(Control).to.have.nested.property('properties.itemLabelPath.type', String);
    expect(Control).to.have.nested.property(
      'properties.itemLabelPath.attribute',
      'item-label-path'
    );

    expect(new Control()).to.have.property('itemLabelPath', null);
  });

  it('defines a reactive property for "itemValuePath" ("item-value-path", String)', () => {
    expect(Control).to.have.nested.property('properties.itemValuePath.type', String);
    expect(Control).to.have.nested.property(
      'properties.itemValuePath.attribute',
      'item-value-path'
    );

    expect(new Control()).to.have.property('itemValuePath', null);
  });

  it('defines a reactive property for "first" (String)', () => {
    expect(Control).to.have.nested.property('properties.first.type', String);
    expect(Control).to.not.have.nested.property('properties.first.attribute');
    expect(new Control()).to.have.property('first', null);
  });

  it('renders vaadin-combo-box element', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box');

    expect(comboBox).to.not.be.null;
  });

  it('passes "itemValuePath" down to the vaadin-combo-box element', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.empty.property('itemValuePath');

    control.itemValuePath = 'test';
    await control.requestUpdate();

    expect(comboBox).to.have.property('itemValuePath', 'test');
  });

  it('passes "itemLabelPath" down to the vaadin-combo-box element', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.empty.property('itemLabelPath');

    control.itemLabelPath = 'test';
    await control.requestUpdate();

    expect(comboBox).to.have.property('itemLabelPath', 'test');
  });

  it('uses resource URI as item ID for the vaadin-combo-box element', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.property('itemIdPath', '_links.self.href');
  });

  it('sets "errorMessage" on vaadin-combo-box from "_errorMessage" on itself', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.property('errorMessage', '');

    control.testErrorMessage = 'test error message';
    await control.requestUpdate();

    expect(comboBox).to.have.property('errorMessage', 'test error message');
  });

  it('sets "helperText" on vaadin-combo-box from "helperText" on itself', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.property('helperText', 'helper_text');

    control.helperText = 'test helper text';
    await control.requestUpdate();

    expect(comboBox).to.have.property('helperText', 'test helper text');
  });

  it('sets "placeholder" on vaadin-combo-box from "placeholder" on itself', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.property('placeholder', 'placeholder');

    control.placeholder = 'test placeholder';
    await control.requestUpdate();

    expect(comboBox).to.have.property('placeholder', 'test placeholder');
  });

  it('sets "label" on vaadin-combo-box from "label" on itself', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.property('label', 'label');

    control.label = 'test label';
    await control.requestUpdate();

    expect(comboBox).to.have.property('label', 'test label');
  });

  it('sets "disabled" on vaadin-combo-box from "disabled" on itself', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    control.disabled = true;
    await control.requestUpdate();
    expect(comboBox).to.have.property('disabled', true);

    control.disabled = false;
    await control.requestUpdate();
    expect(comboBox).to.have.property('disabled', false);
  });

  it('sets "readonly" on vaadin-combo-box from "readonly" on itself', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    control.readonly = true;
    await control.requestUpdate();
    expect(comboBox).to.have.property('readonly', true);

    control.readonly = false;
    await control.requestUpdate();
    expect(comboBox).to.have.property('readonly', false);
  });

  it('sets "checkValidity" on vaadin-combo-box from "_checkValidity" on itself', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.property('checkValidity', get(control, '_checkValidity'));
  });

  it('loads items from the "first" URL', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;
    const dataProvider = comboBox.dataProvider!;

    control.itemLabelPath = 'foo';
    control.first = 'https://demo.api/test/';
    await control.requestUpdate();

    const testItems = [{ foo: 'bar1' }, { foo: 'bar2' }];
    const testSize = 10;

    control.addEventListener(
      'fetch',
      (evt: Event) => {
        const url = new URL((evt as FetchEvent).request.url);

        expect(url.origin).to.equal('https://demo.api');
        expect(url.pathname).to.equal('/test/');
        expect(url.searchParams.get('offset')).to.equal('2');
        expect(url.searchParams.get('limit')).to.equal('2');
        expect(url.searchParams.get('foo')).to.equal('*3*');

        const body = { total_items: testSize, _embedded: { testItems } };
        const response = new Response(JSON.stringify(body));

        (evt as FetchEvent).respondWith(Promise.resolve(response));
      },
      { once: true }
    );

    await new Promise<void>(resolve => {
      dataProvider({ page: 1, pageSize: 2, filter: '3' }, (items, size) => {
        expect(items).to.deep.equal(testItems);
        expect(size).to.equal(testSize);

        resolve();
      });
    });
  });

  it('sets "value" on vaadin-combo-box from "_value" on itself', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.property('value', '');

    control.testValue = 'test_value';
    await control.requestUpdate();

    expect(comboBox).to.have.property('value', 'test_value');
  });

  it('writes to "_value" on change', async () => {
    const layout = html`<test-internal-async-combo-box-control></test-internal-async-combo-box-control>`;
    const control = await fixture<TestControl>(layout);
    const comboBox = control.renderRoot.querySelector('vaadin-combo-box')!;

    expect(comboBox).to.have.property('value', '');

    comboBox.value = 'test_value';
    comboBox.dispatchEvent(new CustomEvent('change'));

    expect(control).to.have.property('testValue', 'test_value');
  });
});
