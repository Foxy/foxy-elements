import './index';

import { InternalSwitchControl as Control } from './InternalSwitchControl';
import { expect, fixture, html } from '@open-wc/testing';
import { stub } from 'sinon';

describe('InternalSwitchControl', () => {
  it('imports and defines foxy-internal-editable-control', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.exist;
  });

  it('imports and defines vcf-tooltip', () => {
    expect(customElements.get('vcf-tooltip')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('defines itself as foxy-internal-switch-control', () => {
    expect(customElements.get('foxy-internal-switch-control')).to.equal(Control);
  });

  it('extends foxy-internal-editable-control', () => {
    expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-editable-control'));
  });

  it('has a reactive property "helperTextAsToolip"', () => {
    expect(new Control()).to.have.property('helperTextAsToolip', false);
    expect(Control).to.have.deep.nested.property('properties.helperTextAsToolip', {
      attribute: 'helper-text-as-tooltip',
      type: Boolean,
    });
  });

  it('has a reactive property "falseAlias"', () => {
    expect(Control).to.have.deep.nested.property('properties.falseAlias', {
      attribute: 'false-alias',
    });
    expect(new Control()).to.have.property('falseAlias', null);
  });

  it('has a reactive property "trueAlias"', () => {
    expect(Control).to.have.deep.nested.property('properties.trueAlias', {
      attribute: 'true-alias',
    });
    expect(new Control()).to.have.property('trueAlias', null);
  });

  it('has a reactive property "invert"', () => {
    expect(Control).to.have.deep.nested.property('properties.invert', { type: Boolean });
    expect(new Control()).to.have.property('invert', false);
  });

  it('renders label', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-switch-control></foxy-internal-switch-control>
    `);

    expect(control.renderRoot).to.include.text('label');

    control.label = 'Foo bar';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('label');
    expect(control.renderRoot).to.include.text('Foo bar');
  });

  it('renders helper text', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-switch-control></foxy-internal-switch-control>
    `);

    expect(control.renderRoot).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('helper_text');
    expect(control.renderRoot).to.include.text('Test helper text');
  });

  it('renders error text if available', async () => {
    let control = await fixture<Control>(html`
      <foxy-internal-switch-control></foxy-internal-switch-control>
    `);

    expect(control.renderRoot).to.not.include.text('Test error message');

    customElements.define(
      'x-test-control-1',
      class extends Control {
        protected get _errorMessage() {
          return 'Test error message';
        }
      }
    );

    control = await fixture<Control>(html`<x-test-control-1></x-test-control-1>`);
    expect(control.renderRoot).to.include.text('Test error message');
  });

  it('renders a checkbox/switch input element', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-switch-control></foxy-internal-switch-control>
    `);

    const input = control.renderRoot.querySelector('input')!;

    expect(input).to.exist;
    expect(input).to.have.attribute('type', 'checkbox');
    expect(input).to.have.attribute('switch');
    expect(input).to.not.have.attribute('checked');

    control.getValue = () => true;
    await control.requestUpdate();
    expect(input).to.have.attribute('checked');

    control.setValue = stub();
    input.checked = false;
    input.dispatchEvent(new Event('change'));
    expect(control.setValue).to.have.been.calledOnceWith(false);
  });

  it('supports inverted selection mode', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-switch-control invert></foxy-internal-switch-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    expect(input).to.exist;
    expect(input).to.have.attribute('checked');

    control.getValue = () => true;
    await control.requestUpdate();
    expect(input).to.not.have.attribute('checked');

    control.setValue = stub();
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    expect(control.setValue).to.have.been.calledOnceWith(false);
  });

  it('disables input when control is disabled', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-switch-control></foxy-internal-switch-control>
    `);

    const input = control.renderRoot.querySelector('input')!;
    expect(input).to.not.have.attribute('disabled');

    control.disabled = true;
    await control.requestUpdate();
    expect(input).to.have.attribute('disabled');
  });

  it('renders checked/unchecked text instead of input when readonly', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-switch-control readonly></foxy-internal-switch-control>
    `);

    expect(control.renderRoot).to.include.text('unchecked');
    expect(control.renderRoot.querySelector('input')).to.not.exist;

    control.getValue = () => true;
    await control.requestUpdate();
    expect(control.renderRoot).to.include.text('checked');
    expect(control.renderRoot.querySelector('input')).to.not.exist;
  });

  it('renders helper text as tooltip when "helperTextAsToolip" is set', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-switch-control helper-text="Foo bar test" helper-text-as-tooltip>
      </foxy-internal-switch-control>
    `);

    const tooltip = control.renderRoot.querySelector('vcf-tooltip')!;
    expect(tooltip).to.exist;
    expect(tooltip).to.include.text('Foo bar test');

    const trigger = control.renderRoot.querySelector(`#${tooltip.getAttribute('for')}`)!;
    expect(trigger).to.exist;

    control.helperTextAsToolip = false;
    await control.requestUpdate();
    expect(control.renderRoot.querySelector('vcf-tooltip')).to.not.exist;
  });

  it('when falseAlias is set, uses the alias instead of false', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-switch-control></foxy-internal-switch-control>
    `);

    control.getValue = () => 'no';
    expect(control).to.have.property('_value', true);

    control.falseAlias = 'no';
    expect(control).to.have.property('_value', false);

    control.setValue = stub();
    // @ts-expect-error using protected method for testing purposes
    control._value = false;
    expect(control.setValue).to.have.been.calledOnceWith('no');

    control.setValue = stub();
    // @ts-expect-error using protected method for testing purposes
    control._value = true;
    expect(control.setValue).to.have.been.calledOnceWith(true);
  });

  it('when trueAlias is set, uses the alias instead of true', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-switch-control></foxy-internal-switch-control>
    `);

    control.getValue = () => 'yes';
    expect(control).to.have.property('_value', true);

    control.trueAlias = 'yes';
    expect(control).to.have.property('_value', true);

    control.setValue = stub();
    // @ts-expect-error using protected method for testing purposes
    control._value = true;
    expect(control.setValue).to.have.been.calledOnceWith('yes');

    control.setValue = stub();
    // @ts-expect-error using protected method for testing purposes
    control._value = false;
    expect(control.setValue).to.have.been.calledOnceWith(false);
  });
});
