import './index';

import { InternalResourcePickerControlForm as Form } from './InternalResourcePickerControlForm';
import { InternalResourcePickerControl as Control } from './InternalResourcePickerControl';
import { expect, fixture, html } from '@open-wc/testing';
import { FetchEvent } from '../../public/NucleonElement/FetchEvent';
import { Type } from '../../public/QueryBuilder/types';
import { stub } from 'sinon';
import { FormDialog } from '../../public';
import { getByKey } from '../../../testgen/getByKey';

describe('InternalResourcePickerControl', () => {
  it('imports and defines foxy-internal-editable-control element', () => {
    expect(customElements.get('foxy-internal-resource-picker-control')).to.exist;
  });

  it('imports and defines foxy-internal-async-list-control element', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-form element', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-form-dialog element', () => {
    expect(customElements.get('foxy-form-dialog')).to.exist;
  });

  it('defines itself as foxy-internal-resource-picker-control', () => {
    expect(customElements.get('foxy-internal-resource-picker-control')).to.equal(Control);
  });

  it('extends foxy-internal-editable-control', () => {
    expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-editable-control'));
  });

  it('has a reactive property "virtualHost"', () => {
    expect(Control).to.have.deep.nested.property('properties.virtualHost', {});
    expect(new Control()).to.have.property('virtualHost').that.is.a('string');
  });

  it('has a reactive property "filters"', () => {
    expect(Control).to.have.deep.nested.property('properties.filters', { type: Array });
    expect(new Control()).to.have.deep.property('filters', []);
  });

  it('has a reactive property "first"', () => {
    expect(Control).to.have.deep.nested.property('properties.first', {});
    expect(new Control()).to.have.deep.property('first', null);
  });

  it('has a reactive property "item"', () => {
    expect(Control).to.have.deep.nested.property('properties.item', {});
    expect(new Control()).to.have.deep.property('item', null);
  });

  it('renders label', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control></foxy-internal-resource-picker-control>
    `);

    expect(control.renderRoot).to.include.text('label');

    control.label = 'Foo bar';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('label');
    expect(control.renderRoot).to.include.text('Foo bar');
  });

  it('renders helper text', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control></foxy-internal-resource-picker-control>
    `);

    expect(control.renderRoot).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('helper_text');
    expect(control.renderRoot).to.include.text('Test helper text');
  });

  it('renders error text if available', async () => {
    let control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control></foxy-internal-resource-picker-control>
    `);

    expect(control.renderRoot).to.not.include.text('Test error message');

    customElements.define(
      'x-test-control',
      class extends Control {
        protected get _errorMessage() {
          return 'Test error message';
        }
      }
    );

    control = await fixture<Control>(html`<x-test-control></x-test-control>`);
    expect(control.renderRoot).to.include.text('Test error message');
  });

  it('renders a form dialog that sends changes to host Nucleon on submit', async () => {
    let value = '';

    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control
        infer=""
        first="https://demo.api/hapi/customers"
        item="foxy-customer-card"
        .getValue=${() => value}
        .setValue=${(newValue: string) => (value = newValue)}
        .filters=${[{ type: Type.String, path: 'first_name', label: 'first_name_label' }]}
      >
      </foxy-internal-resource-picker-control>
    `);

    const dialog = control.renderRoot.querySelector('foxy-form-dialog')!;

    expect(dialog).to.exist;
    expect(dialog).to.have.attribute('parent', `foxy://${control.virtualHost}/select`);
    expect(dialog).to.have.attribute('infer', 'dialog');
    expect(dialog).to.have.attribute('form', 'foxy-internal-resource-picker-control-form');
    expect(dialog).to.have.attribute('alert');
    expect(dialog).to.have.deep.property('props', {
      '.selectionProps': {
        '.filters': control.filters,
        '.first': control.first,
        '.item': control.item,
      },
    });

    await new Promise<void>((resolve, reject) => {
      dialog.dispatchEvent(
        new FetchEvent('fetch', {
          cancelable: true,
          composed: true,
          bubbles: true,
          request: new Request(`foxy://${control.virtualHost}/select`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ selection: 'https://demo.api/hapi/customers/0' }),
          }),
          resolve: () => resolve(),
          reject: () => reject(),
        })
      );
    });

    expect(value).to.equal('https://demo.api/hapi/customers/0');
  });

  it('renders item as a button that opens a dialog on click', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control
        infer=""
        first="https://demo.api/hapi/customers"
        item="foxy-customer-card"
      >
      </foxy-internal-resource-picker-control>
    `);

    const button = control.renderRoot.querySelector('button')!;
    const dialog = control.renderRoot.querySelector('foxy-form-dialog') as FormDialog;
    const showMethod = stub(dialog, 'show');

    expect(button).to.exist;
    button.click();
    expect(showMethod).to.have.been.calledOnceWith(button);

    const item = button.querySelector('foxy-customer-card')!;

    expect(item).to.exist;
    expect(item).to.have.attribute('related', '[]');
    expect(item).to.have.attribute('parent', '');
    expect(item).to.have.attribute('infer', 'card');
    expect(item).to.have.attribute('href', '');

    control.getValue = () => 'https://demo.api/hapi/customers/0';
    await control.requestUpdate();
    expect(item).to.have.attribute('href', 'https://demo.api/hapi/customers/0');
  });

  it('disables button when control is disabled', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control disabled></foxy-internal-resource-picker-control>
    `);

    const button = control.renderRoot.querySelector('button')!;
    expect(button).to.have.attribute('disabled');
  });

  it('disables button when control is readonly', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control readonly></foxy-internal-resource-picker-control>
    `);

    const button = control.renderRoot.querySelector('button')!;
    expect(button).to.have.attribute('disabled');
  });

  describe('InternalResourcePickerControlForm', () => {
    it('defines itself as foxy-internal-resource-picker-control-form', () => {
      expect(customElements.get('foxy-internal-resource-picker-control-form')).to.equal(Form);
    });

    it('has a reactive property "selectionProps"', () => {
      expect(Form).to.have.deep.nested.property('properties.selectionProps', { attribute: false });
      expect(new Form()).to.have.deep.property('selectionProps', {});
    });

    it('produces v8n error "silent:selection_required" if selection is undefined', () => {
      const form = new Form();
      expect(form.errors).to.include('silent:selection_required');

      form.edit({ selection: 'https://demo.api/hapi/customers/0' });
      expect(form.errors).to.not.include('silent:selection_required');
    });

    it('renders a header', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-resource-picker-control-form></foxy-internal-resource-picker-control-form>`
      );

      const header = await getByKey(form, 'header');
      expect(header).to.exist;
      expect(header).to.have.attribute('infer', '');
    });

    it('renders an async list control for selection', async () => {
      const form = await fixture<Form>(
        html`
          <foxy-internal-resource-picker-control-form .selectionProps=${{ foo: 'bar' }}>
          </foxy-internal-resource-picker-control-form>
        `
      );

      const control = form.renderRoot.querySelector(
        'foxy-internal-async-list-control[infer="selection"]'
      )!;

      expect(control).to.exist;
      expect(control).to.have.attribute('form', 'foxy-null');
      expect(control).to.have.attribute('hide-delete-button');
      expect(control).to.have.attribute('hide-create-button');
      expect(control).to.have.attribute('foo', 'bar');

      const event = new CustomEvent('itemclick', {
        cancelable: true,
        composed: true,
        bubbles: true,
        detail: 'https://demo.api/hapi/customers/0',
      });

      expect(form).to.not.have.deep.nested.property('form.selection');
      const submitMethod = stub(form, 'submit');

      control.dispatchEvent(event);

      expect(event.defaultPrevented).to.be.true;
      expect(submitMethod).to.have.been.calledOnce;
      expect(form).to.have.deep.nested.property(
        'form.selection',
        'https://demo.api/hapi/customers/0'
      );
    });
  });
});
