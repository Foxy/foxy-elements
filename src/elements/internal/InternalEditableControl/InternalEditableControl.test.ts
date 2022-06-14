import '../../public/NucleonElement/index';
import '../../public/AddressForm/index';

import { expect, fixture, oneEvent } from '@open-wc/testing';
import { html } from 'lit-html';
import { getTestData } from '../../../testgen/getTestData';
import { InternalEditableControl } from './index';
import { InternalControl } from '../InternalControl/InternalControl';
import { AddressForm } from '../../public/AddressForm/AddressForm';

import set from 'lodash-es/set';

describe('InternalEditableControl', () => {
  it('imports and defines foxy-internal-control', () => {
    expect(customElements.get('foxy-internal-control')).to.exist;
  });

  it('imports and defines itself as foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.equal(InternalEditableControl);
  });

  it('extends InternalControl', () => {
    expect(new InternalEditableControl()).to.be.instanceOf(InternalControl);
  });

  it('has a reactive property "placeholder" (String)', () => {
    expect(InternalEditableControl).to.have.nested.property('properties.placeholder.type', String);
  });

  it('has a reactive property "helperText" (String)', () => {
    expect(InternalEditableControl).to.have.nested.property('properties.helperText.type', String);
  });

  it('has a reactive property "v8nPrefix" (String)', () => {
    expect(InternalEditableControl).to.have.nested.property('properties.v8nPrefix.type', String);
  });

  it('has a reactive property "property" (String)', () => {
    expect(InternalEditableControl).to.have.nested.property('properties.property.type', String);
  });

  it('has a reactive property "label" (String)', () => {
    expect(InternalEditableControl).to.have.nested.property('properties.label.type', String);
  });

  it('has a default placeholder', () => {
    expect(new InternalEditableControl()).to.have.property('placeholder', 'placeholder');
  });

  it('can apply a custom placeholder', () => {
    const control = new InternalEditableControl();
    control.placeholder = 'Test placeholder';
    expect(control).to.have.property('placeholder', 'Test placeholder');
  });

  it('can restore the default placeholder', () => {
    const control = new InternalEditableControl();
    control.placeholder = 'Test placeholder';
    control.resetPlaceholder();
    expect(control).to.have.property('placeholder', 'placeholder');
  });

  it('has a default helper text', () => {
    expect(new InternalEditableControl()).to.have.property('helperText', 'helper_text');
  });

  it('can apply a custom helper text', () => {
    const control = new InternalEditableControl();
    control.helperText = 'Test helper text';
    expect(control).to.have.property('helperText', 'Test helper text');
  });

  it('can restore the default helper text', () => {
    const control = new InternalEditableControl();
    control.helperText = 'Test helper text';
    control.resetHelperText();
    expect(control).to.have.property('helperText', 'helper_text');
  });

  it('has an empty v8n prefix when inference is off', () => {
    expect(new InternalEditableControl()).to.have.property('v8nPrefix', '');
  });

  it('computes a default v8n prefix when inference is on', () => {
    const control = new InternalEditableControl();
    control.infer = 'foo';
    expect(control).to.have.property('v8nPrefix', 'foo:');
  });

  it('applies a custom v8n prefix when set', () => {
    const control = new InternalEditableControl();
    control.v8nPrefix = 'test_prefix';
    expect(control).to.have.property('v8nPrefix', 'test_prefix');
  });

  it('can restore the default v8n prefix', () => {
    const control = new InternalEditableControl();

    control.infer = 'foo';
    control.v8nPrefix = 'bar';
    control.resetV8nPrefix();

    expect(control).to.have.property('v8nPrefix', 'foo:');
  });

  it("doesn't compute the target property name when inference is off", () => {
    expect(new InternalEditableControl()).to.have.property('property', '');
  });

  it('computes a target property name using snake_case to kebab-case conversion when inference is on', () => {
    const control = new InternalEditableControl();
    control.infer = 'foo-bar-baz';
    expect(control).to.have.property('property', 'foo_bar_baz');
  });

  it('uses a custom property name if set', () => {
    const control = new InternalEditableControl();
    control.property = 'fooBarBaz';
    expect(control).to.have.property('property', 'fooBarBaz');
  });

  it('can restore the default property name', () => {
    const control = new InternalEditableControl();

    control.infer = 'foo';
    control.property = 'bar';
    control.resetProperty();

    expect(control).to.have.property('property', 'foo');
  });

  it('has a default label', () => {
    expect(new InternalEditableControl()).to.have.property('label', 'label');
  });

  it('can apply a custom label', () => {
    const control = new InternalEditableControl();
    control.label = 'Test label';
    expect(control).to.have.property('label', 'Test label');
  });

  it('can restore the default label', () => {
    const control = new InternalEditableControl();
    control.label = 'Test label';
    control.resetLabel();
    expect(control).to.have.property('label', 'label');
  });

  it("has a protected shortcut for a nucleon form value it's bound to", async () => {
    const testData = await getTestData<any>('./hapi/customer_addresses/0');
    const wrapper = await fixture(html`
      <foxy-nucleon .data=${testData}>
        <foxy-internal-editable-control infer="address-name"></foxy-internal-editable-control>
      </foxy-nucleon>
    `);

    expect(wrapper.firstElementChild).to.have.property('_value', testData.address_name);
  });

  it('sends updates to the parent NucleonElement on value change', async () => {
    const testData = await getTestData<any>('./hapi/customer_addresses/0');
    const wrapper = await fixture(html`
      <foxy-nucleon .data=${testData}>
        <foxy-internal-editable-control infer="address-name"></foxy-internal-editable-control>
      </foxy-nucleon>
    `);

    const whenGotEvent = oneEvent(wrapper.firstElementChild!, 'change');
    set(wrapper.firstElementChild!, '_value', 'Test value');
    const event = await whenGotEvent;

    expect(wrapper.firstElementChild).to.have.property('_value', 'Test value');
    expect(wrapper).to.have.nested.property('form.address_name', 'Test value');
    expect(event).to.have.property('detail', 'Test value');
  });

  it("doesn't send updates to the parent NucleonElement on value change if they're cancelled", async () => {
    const testData = await getTestData<any>('./hapi/customer_addresses/0');
    const wrapper = await fixture(html`
      <foxy-nucleon .data=${testData}>
        <foxy-internal-editable-control
          infer="address-name"
          @change=${(evt: CustomEvent) => evt.preventDefault()}
        >
        </foxy-internal-editable-control>
      </foxy-nucleon>
    `);

    set(wrapper.firstElementChild!, '_value', 'Test value');

    expect(wrapper.firstElementChild).to.have.property('_value', testData.address_name);
    expect(wrapper).to.have.nested.property('form.address_name', testData.address_name);
  });

  it("has a protected shortcut for the first v8n error in a a nucleon form it's associated with", async () => {
    const wrapper = await fixture<AddressForm>(html`
      <foxy-address-form>
        <foxy-internal-editable-control infer="address-name"></foxy-internal-editable-control>
      </foxy-address-form>
    `);

    const control = wrapper.firstElementChild as InternalEditableControl;
    wrapper.edit({ address_name: 'Invalid'.repeat(1024) });
    control.v8nPrefix = 'address_name_';
    expect(control).to.have.property('_error', 'address_name_too_long');

    wrapper.edit({ address_name: 'Valid' });
    expect(control).to.have.property('_error', undefined);
  });

  it('has a protected shortcut for a localized `._error` value', async () => {
    const wrapper = await fixture<AddressForm>(html`
      <foxy-address-form>
        <foxy-internal-editable-control infer="address-name"></foxy-internal-editable-control>
      </foxy-address-form>
    `);

    const control = wrapper.firstElementChild as InternalEditableControl;
    wrapper.edit({ address_name: 'Invalid'.repeat(1024) });
    control.v8nPrefix = 'address_name_';
    expect(control).to.have.property('_errorMessage', 'too_long');

    wrapper.edit({ address_name: 'Valid' });
    expect(control).to.have.property('_error', undefined);
  });

  it('has a protected shortcut for a checkValidity() function', async () => {
    const wrapper = await fixture<AddressForm>(html`
      <foxy-address-form>
        <foxy-internal-editable-control infer="address-name"></foxy-internal-editable-control>
      </foxy-address-form>
    `);

    const control = wrapper.firstElementChild as any;
    wrapper.edit({ address_name: 'Invalid'.repeat(1024) });
    control.v8nPrefix = 'address_name_';

    expect(control).to.have.property('_checkValidity');
    expect(control._checkValidity()).to.equal(false);

    wrapper.edit({ address_name: 'Valid' });

    expect(control).to.have.property('_error', undefined);
    expect(control._checkValidity()).to.equal(true);
  });
});
