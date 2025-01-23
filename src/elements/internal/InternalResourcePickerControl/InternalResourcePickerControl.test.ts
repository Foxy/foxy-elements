import './index';

import { InternalResourcePickerControlForm as Form } from './InternalResourcePickerControlForm';
import { InternalResourcePickerControl as Control } from './InternalResourcePickerControl';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { NucleonElement } from '../../public/NucleonElement/NucleonElement';
import { FetchEvent } from '../../public/NucleonElement/FetchEvent';
import { FormDialog } from '../../public/FormDialog/FormDialog';
import { Type } from '../../public/QueryBuilder/types';
import { stub } from 'sinon';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';

async function waitForIdle(element: Control) {
  await waitUntil(
    () => {
      const loaders = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...loaders].every(loader => loader.in('idle'));
    },
    '',
    { timeout: 5000 }
  );
}

describe('InternalResourcePickerControl', () => {
  it('imports and defines vaadin-button element', () => {
    expect(customElements.get('vaadin-button')).to.exist;
  });

  it('imports and defines foxy-internal-editable-control element', () => {
    expect(customElements.get('foxy-internal-resource-picker-control')).to.exist;
  });

  it('imports and defines foxy-internal-async-list-control element', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-form element', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-copy-to-clipboard element', () => {
    expect(customElements.get('foxy-copy-to-clipboard')).to.exist;
  });

  it('imports and defines foxy-form-dialog element', () => {
    expect(customElements.get('foxy-form-dialog')).to.exist;
  });

  it('imports and defines foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.exist;
  });

  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('defines itself as foxy-internal-resource-picker-control', () => {
    expect(customElements.get('foxy-internal-resource-picker-control')).to.equal(Control);
  });

  it('extends foxy-internal-editable-control', () => {
    expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-editable-control'));
  });

  it('has a reactive property "getDisplayValueOptions"', () => {
    expect(Control).to.have.deep.nested.property('properties.getDisplayValueOptions', {
      attribute: false,
    });

    const resource = { _links: { self: { href: 'https://demo.api/virtual/empty' } } };
    expect(new Control().getDisplayValueOptions(resource)).to.deep.equal({ resource });
  });

  it('has a reactive property "showCopyIdButton"', () => {
    expect(new Control()).to.have.property('showCopyIdButton', false);
    expect(Control).to.have.deep.nested.property('properties.showCopyIdButton', {
      attribute: 'show-copy-id-button',
      type: Boolean,
    });
  });

  it('has a reactive property "virtualHost"', () => {
    expect(Control).to.have.deep.nested.property('properties.virtualHost', {});
    expect(new Control()).to.have.property('virtualHost').that.is.a('string');
  });

  it('has a reactive property "getItemUrl"', () => {
    expect(Control).to.have.deep.nested.property('properties.getItemUrl', { attribute: false });
    expect(new Control()).to.have.property('getItemUrl', null);
  });

  it('has a reactive property "formProps"', () => {
    expect(Control).to.have.deep.nested.property('properties.formProps', { type: Object });
    expect(new Control()).to.have.deep.property('formProps', {});
  });

  it('has a reactive property "filters"', () => {
    expect(Control).to.have.deep.nested.property('properties.filters', { type: Array });
    expect(new Control()).to.have.deep.property('filters', []);
  });

  it('has a reactive property "layout"', () => {
    expect(Control).to.have.deep.nested.property('properties.layout', {});
    expect(new Control()).to.have.deep.property('layout', null);
  });

  it('has a reactive property "first"', () => {
    expect(Control).to.have.deep.nested.property('properties.first', {});
    expect(new Control()).to.have.deep.property('first', null);
  });

  it('has a reactive property "item"', () => {
    expect(Control).to.have.deep.nested.property('properties.item', {});
    expect(new Control()).to.have.deep.property('item', null);
  });

  it('has a reactive property "form"', () => {
    expect(Control).to.have.deep.nested.property('properties.form', {});
    expect(new Control()).to.have.deep.property('form', null);
  });

  it('renders label in standalone layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control></foxy-internal-resource-picker-control>
    `);

    expect(control.renderRoot).to.include.text('label');

    control.label = 'Foo bar';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('label');
    expect(control.renderRoot).to.include.text('Foo bar');
  });

  it('renders label in summary item layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control
        layout="summary-item"
      ></foxy-internal-resource-picker-control>
    `);

    expect(control.renderRoot).to.include.text('label');

    control.label = 'Foo bar';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('label');
    expect(control.renderRoot).to.include.text('Foo bar');
  });

  it('renders helper text in standalone layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control></foxy-internal-resource-picker-control>
    `);

    expect(control.renderRoot).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('helper_text');
    expect(control.renderRoot).to.include.text('Test helper text');
  });

  it('render helper text in summary item layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control
        layout="summary-item"
      ></foxy-internal-resource-picker-control>
    `);

    expect(control.renderRoot).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('helper_text');
    expect(control.renderRoot).to.include.text('Test helper text');
  });

  it('renders error text  in standalone layout if available', async () => {
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

  it('renders error text in summary item layout if available', async () => {
    let control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control
        layout="summary-item"
      ></foxy-internal-resource-picker-control>
    `);

    expect(control.renderRoot).to.not.include.text('Test error message');

    customElements.define(
      'x-test-control-2',
      class extends Control {
        protected get _errorMessage() {
          return 'Test error message';
        }
      }
    );

    control = await fixture<Control>(html`<x-test-control-2></x-test-control-2>`);
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
    expect(dialog).to.have.attribute('header', 'header');
    expect(dialog).to.have.attribute('infer', 'dialog');
    expect(dialog).to.have.property('form', 'foxy-internal-resource-picker-control-form');
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

  it('renders a custom form in form dialog', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control form="my-custom-form">
      </foxy-internal-resource-picker-control>
    `);

    const dialog = control.renderRoot.querySelector('foxy-form-dialog')!;
    expect(dialog).to.have.property('form', 'my-custom-form');
  });

  it('adds custom props to form dialog', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control .formProps=${{ foo: 'bar' }}>
      </foxy-internal-resource-picker-control>
    `);

    const dialog = control.renderRoot.querySelector('foxy-form-dialog')!;
    expect(dialog).to.have.nested.property('props.foo', 'bar');
  });

  it('renders item as a button that opens a dialog on click in standalone layout', async () => {
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

  it('renders a custom button that opens a dialog on click in summary item layout', async () => {
    const router = createRouter();

    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control
        placeholder="Test Placeholder"
        layout="summary-item"
        infer=""
        first="https://demo.api/hapi/customers"
        item="foxy-customer-card"
        .getDisplayValueOptions=${() => ({ foo: 'bar' })}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-resource-picker-control>
    `);

    const selectBtn = control.renderRoot.querySelector<HTMLButtonElement>(
      'button[aria-label="select"]'
    )!;

    const dialog = control.renderRoot.querySelector('foxy-form-dialog') as FormDialog;
    const showMethod = stub(dialog, 'show');

    expect(selectBtn).to.exist;
    expect(selectBtn).to.include.text('Test Placeholder');

    control.getValue = () => 'https://demo.api/hapi/customers/0';
    await control.requestUpdate();
    await waitForIdle(control);
    const label = selectBtn.querySelector('foxy-i18n')!;

    expect(label).to.exist;
    expect(label).to.have.attribute('infer', '');
    expect(label).to.have.attribute('key', 'value');
    expect(label).to.have.deep.property('options', { foo: 'bar' });
    expect(selectBtn).to.not.include.text('Test Placeholder');

    selectBtn.click();
    expect(showMethod).to.have.been.calledOnceWith(selectBtn);
  });

  it('renders a Clear button in summary item layout if value is set', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control
        layout="summary-item"
        infer=""
        first="https://demo.api/hapi/customers"
        item="foxy-customer-card"
      >
      </foxy-internal-resource-picker-control>
    `);

    let clearBtn = control.renderRoot.querySelector<HTMLButtonElement>(
      'button[aria-label="clear"]'
    )!;
    expect(clearBtn).to.have.attribute('hidden');

    control.getValue = () => 'https://demo.api/hapi/customers/0';
    await control.requestUpdate();

    clearBtn = control.renderRoot.querySelector<HTMLButtonElement>('button[aria-label="clear"]')!;
    expect(clearBtn).to.not.have.attribute('hidden');

    const setValueStub = stub();
    control.setValue = setValueStub;
    clearBtn.click();
    expect(setValueStub).to.have.been.calledOnceWith('');
  });

  it('disables button when control is disabled in standalone layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control disabled></foxy-internal-resource-picker-control>
    `);

    const button = control.renderRoot.querySelector('button')!;
    expect(button).to.have.attribute('disabled');
  });

  it('disables buttons when control is disabled in summary item layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control
        layout="summary-item"
        disabled
      ></foxy-internal-resource-picker-control>
    `);

    const buttons = control.renderRoot.querySelectorAll('button');
    buttons.forEach(button => expect(button).to.have.attribute('disabled'));
  });

  it('disables button when control is readonly in standalone layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control readonly></foxy-internal-resource-picker-control>
    `);

    const button = control.renderRoot.querySelector('button')!;
    expect(button).to.have.attribute('disabled');
  });

  it('disables select button and hides clear button when control is readonly in summary item layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control
        layout="summary-item"
        readonly
      ></foxy-internal-resource-picker-control>
    `);

    const selectBtn = control.renderRoot.querySelector<HTMLButtonElement>(
      'button[aria-label="select"]'
    )!;

    const clearBtn = control.renderRoot.querySelector<HTMLButtonElement>(
      'button[aria-label="clear"]'
    )!;

    expect(selectBtn).to.have.attribute('disabled');
    expect(clearBtn).to.have.attribute('hidden');
  });

  it('renders View link in standalone layout when value is set and getItemUrl is defined', async () => {
    const getItemUrl = stub().returns('https://example.com/hapi/customers/0');
    const router = createRouter();
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control
        infer=""
        first="https://demo.api/hapi/customers"
        item="foxy-customer-card"
        .getItemUrl=${getItemUrl}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-resource-picker-control>
    `);

    let linkText = control.renderRoot.querySelector('[key="view"]');
    expect(linkText).to.not.exist;

    control.getValue = () => 'https://demo.api/hapi/customers/0';
    await control.requestUpdate();
    await waitForIdle(control);
    await control.requestUpdate();

    linkText = control.renderRoot.querySelector('[key="view"]');
    expect(linkText).to.exist;
    expect(linkText).to.have.attribute('infer', '');

    const viewLink = linkText?.closest('a');
    expect(viewLink).to.exist;
    expect(viewLink).to.have.attribute('href', 'https://example.com/hapi/customers/0');

    const customer = await getTestData('./hapi/customers/0', router);
    getItemUrl.resetHistory();
    await control.requestUpdate();
    expect(getItemUrl).to.have.been.calledWith('https://demo.api/hapi/customers/0', customer);
  });

  it('renders Copy ID button in standalone layout when value is set and showCopyIdButton is true', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control
        infer=""
        first="https://demo.api/hapi/customers"
        item="foxy-customer-card"
      >
      </foxy-internal-resource-picker-control>
    `);

    const selector = 'foxy-copy-to-clipboard[infer="copy-id"]';
    let copyBtn = control.renderRoot.querySelector(selector);
    expect(copyBtn).to.not.exist;

    control.getValue = () => 'https://demo.api/hapi/customers/0';
    await control.requestUpdate();
    copyBtn = control.renderRoot.querySelector(selector);
    expect(copyBtn).to.not.exist;

    control.showCopyIdButton = true;
    await control.requestUpdate();
    copyBtn = control.renderRoot.querySelector(selector);
    expect(copyBtn).to.exist;
    expect(copyBtn).to.have.attribute('layout', 'text');
    expect(copyBtn).to.have.attribute('theme', 'contrast tertiary-inline');
  });

  it('renders Clear button in standalone layout when value is set', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-resource-picker-control
        infer=""
        first="https://demo.api/hapi/customers"
        item="foxy-customer-card"
      >
      </foxy-internal-resource-picker-control>
    `);

    let btnText = control.renderRoot.querySelector('foxy-i18n[key="clear"]');
    expect(btnText).to.not.exist;

    control.getValue = () => 'https://demo.api/hapi/customers/0';
    await control.requestUpdate();
    btnText = control.renderRoot.querySelector('foxy-i18n[key="clear"]');
    expect(btnText).to.exist;
    expect(btnText).to.have.attribute('infer', '');

    const clearBtn = btnText?.closest('vaadin-button');
    expect(clearBtn).to.exist;
    expect(clearBtn).to.not.have.attribute('disabled');

    const setValueStub = stub();
    control.setValue = setValueStub;
    clearBtn?.click();
    expect(setValueStub).to.have.been.calledOnceWith('');

    control.disabled = true;
    await control.requestUpdate();
    expect(clearBtn).to.have.attribute('disabled');
  });

  describe('InternalResourcePickerControlForm', () => {
    it('defines itself as foxy-internal-resource-picker-control-form', () => {
      expect(customElements.get('foxy-internal-resource-picker-control-form')).to.equal(Form);
    });

    it('has a reactive property "selectionProps"', () => {
      expect(Form).to.have.deep.nested.property('properties.selectionProps', { attribute: false });
      expect(new Form()).to.have.deep.property('selectionProps', {});
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
