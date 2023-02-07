import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { ButtonElement } from '@vaadin/vaadin-button';
import { CustomFieldForm } from './CustomFieldForm';
import { Data } from './types';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { NucleonElement } from '../NucleonElement';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTag } from '../../../testgen/getByTag';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-element';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { createRouter } from '../../../server/index';

describe('CustomFieldForm', () => {
  it('extends NucleonElement', () => {
    expect(new CustomFieldForm()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-custom-field-form', () => {
    expect(customElements.get('foxy-custom-field-form')).to.equal(CustomFieldForm);
  });

  it('has a default i18next namespace of "custom-field-form"', () => {
    expect(new CustomFieldForm()).to.have.property('ns', 'custom-field-form');
  });

  describe('name', () => {
    it('has i18n label key "name"', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');

      expect(control).to.have.property('label', 'name');
    });

    it('has value of form.name', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);

      element.edit({ name: 'Telephone' });

      const control = await getByTestId<TextFieldElement>(element, 'name');
      expect(control).to.have.property('value', 'Telephone');
    });

    it('writes to form.name on input', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');

      control!.value = 'Telephone';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.name', 'Telephone');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'name');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ name: 'Telephone' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "name:before" slot by default', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByName(element, 'name:before')).to.have.property('localName', 'slot');
    });

    it('replaces "name:before" slot with template "name:before" if available', async () => {
      const name = 'name:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-custom-field-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "name:after" slot by default', async () => {
      const element = await fixture<CustomFieldForm>(
        html`<foxy-custom-field-form></foxy-custom-field-form>`
      );
      const slot = await getByName<HTMLSlotElement>(element, 'name:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "name:after" slot with template "name:after" if available', async () => {
      const name = 'name:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-custom-field-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'name')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-custom-field-form readonly></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes name', async () => {
      const layout = html`<foxy-custom-field-form
        readonlycontrols="name"
      ></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'name')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-custom-field-form href=${href}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-custom-field-form href=${href}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-custom-field-form disabled></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes name', async () => {
      const layout = html`<foxy-custom-field-form
        disabledcontrols="name"
      ></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'name')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'name')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-custom-field-form hidden></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'name')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes name', async () => {
      const layout = html`<foxy-custom-field-form hiddencontrols="name"></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'name')).to.not.exist;
    });
  });

  describe('value', () => {
    it('has i18n label key "value"', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'value')).to.have.property('label', 'value');
    });

    it('has value of form.value', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);

      element.edit({ value: '+1-202-555-0177' });

      const control = await getByTestId<TextFieldElement>(element, 'value');
      expect(control).to.have.property('value', '+1-202-555-0177');
    });

    it('writes to form.value on input', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'value');

      control!.value = '+1-202-555-0177';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.value', '+1-202-555-0177');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'value');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ value: '+1-202-555-0177' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "value:before" slot by default', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByName(element, 'value:before')).to.have.property('localName', 'slot');
    });

    it('replaces "value:before" slot with template "value:before" if available', async () => {
      const name = 'value:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-custom-field-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "value:after" slot by default', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByName(element, 'value:after')).to.have.property('localName', 'slot');
    });

    it('replaces "value:after" slot with template "value:after" if available', async () => {
      const name = 'value:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-custom-field-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'value')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-custom-field-form readonly></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'value')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes value', async () => {
      const layout = html`<foxy-custom-field-form
        readonlycontrols="value"
      ></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'value')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'value')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-custom-field-form href=${href}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'value')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-custom-field-form href=${href}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'value')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-custom-field-form disabled></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'value')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes value', async () => {
      const layout = html`<foxy-custom-field-form
        disabledcontrols="value"
      ></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'value')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'value')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-custom-field-form hidden></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'value')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes value', async () => {
      const layout = html`<foxy-custom-field-form hiddencontrols="value"></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'value')).to.not.exist;
    });
  });

  describe('visibility', () => {
    it('has foxy-i18n label with key "show_on_receipt"', async () => {
      const layout = html`<foxy-custom-field-form lang="es"></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const visibility = (await getByTestId(element, 'visibility')) as HTMLDivElement;
      const label = await getByKey(visibility, 'show_on_receipt');

      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'custom-field-form');
    });

    it('has value of !form.is_hidden', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);

      element.edit({ is_hidden: false });

      const visibility = (await getByTestId(element, 'visibility')) as HTMLDivElement;
      const checkbox = await getByTag(visibility, 'vaadin-checkbox');

      expect(checkbox).to.have.attribute('checked');

      element.edit({ is_hidden: true });
      await element.updateComplete;

      expect(checkbox).not.to.have.attribute('checked');
    });

    it('writes to form.is_hidden on change', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const visibility = (await getByTestId(element, 'visibility')) as HTMLDivElement;
      const checkbox = (await getByTag(visibility, 'vaadin-checkbox')) as HTMLInputElement;

      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.is_hidden', false);

      checkbox.checked = false;
      checkbox.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.is_hidden', true);
    });

    it('renders "visibility:before" slot by default', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByName(element, 'visibility:before')).to.have.property('localName', 'slot');
    });

    it('replaces "visibility:before" slot with template "visibility:before" if available', async () => {
      const name = 'visibility:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-custom-field-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "visibility:after" slot by default', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByName(element, 'visibility:after')).to.have.property('localName', 'slot');
    });

    it('replaces "visibility:after" slot with template "visibility:after" if available', async () => {
      const name = 'visibility:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-custom-field-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is enabled once loaded', async () => {
      const data = await getTestData('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const visibility = (await getByTestId(element, 'visibility')) as HTMLDivElement;
      const checkbox = await getByTag(visibility, 'vaadin-checkbox');

      expect(checkbox).not.to.have.attribute('disabled');
    });

    it('once loaded, disabled when element is disabled', async () => {
      const data = await getTestData('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data} disabled></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const visibility = (await getByTestId(element, 'visibility')) as HTMLDivElement;
      const checkbox = await getByTag(visibility, 'vaadin-checkbox');

      expect(checkbox).to.have.attribute('disabled');
    });

    it('once loaded, disabled when disabledcontrols includes "visibility"', async () => {
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form
          .data=${await getTestData('./hapi/custom_fields/0')}
          disabledcontrols="visibility"
        >
        </foxy-custom-field-form>
      `);

      const visibility = (await getByTestId(element, 'visibility')) as HTMLDivElement;
      const checkbox = await getByTag(visibility, 'vaadin-checkbox');

      expect(checkbox).to.have.attribute('disabled');
    });

    it('hidden if form is hidden', async () => {
      const layout = html`<foxy-custom-field-form hidden></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'visibility')).not.to.exist;
    });

    it('hidden if hiddencontrols includes "visibility"', async () => {
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form hiddencontrols="visibility"></foxy-custom-field-form>
      `);

      expect(await getByTestId(element, 'visibility')).not.to.exist;
    });
  });

  describe('timestamps', () => {
    it('once form data is loaded, renders a property table with created and modified dates', async () => {
      const data = await getTestData<Data>('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const control = await getByTestId(element, 'timestamps');
      const items = [
        { name: 'date_modified', value: 'date' },
        { name: 'date_created', value: 'date' },
      ];

      expect(control).to.have.deep.property('items', items);
    });

    it('once form data is loaded, renders "timestamps:before" slot', async () => {
      const data = await getTestData<Data>('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:before" slot with template "timestamps:before" if available', async () => {
      const data = await getTestData<Data>('./hapi/custom_fields/0');
      const name = 'timestamps:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-custom-field-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('once form data is loaded, renders "timestamps:after" slot', async () => {
      const data = await getTestData<Data>('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:after" slot with template "timestamps:after" if available', async () => {
      const data = await getTestData<Data>('./hapi/custom_fields/0');
      const name = 'timestamps:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-custom-field-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('create', () => {
    it('if data is empty, renders create button', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'create')).to.exist;
    });

    it('renders with i18n key "create" for caption', async () => {
      const layout = html`<foxy-custom-field-form lang="es"></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const control = await getByTestId(element, 'create');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'create');
      expect(caption).to.have.attribute('ns', 'custom-field-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-custom-field-form disabled></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);

      element.edit({ name: 'Foo', value: 'Bar', is_hidden: true });
      element.submit();

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "create"', async () => {
      const layout = html`<foxy-custom-field-form
        disabledcontrols="create"
      ></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const element = await fixture<CustomFieldForm>(
        html`<foxy-custom-field-form></foxy-custom-field-form>`
      );
      const control = await getByTestId<ButtonElement>(element, 'create');
      const submit = stub(element, 'submit');

      element.edit({ name: 'Foo', value: 'Bar', is_hidden: true });
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-custom-field-form hidden></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "create"', async () => {
      const layout = html`<foxy-custom-field-form
        hiddencontrols="create"
      ></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('renders with "create:before" slot by default', async () => {
      const layout = html`<foxy-custom-field-form></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'create:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:before" slot with template "create:before" if available and rendered', async () => {
      const name = 'create:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-custom-field-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "create:after" slot by default', async () => {
      const element = await fixture<CustomFieldForm>(
        html`<foxy-custom-field-form></foxy-custom-field-form>`
      );
      const slot = await getByName<HTMLSlotElement>(element, 'create:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:after" slot with template "create:after" if available and rendered', async () => {
      const name = 'create:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-custom-field-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('delete', () => {
    it('renders delete button once resource is loaded', async () => {
      const href = 'https://demo.api/hapi/custom_fields/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-custom-field-form .data=${data} disabled></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);

      expect(await getByTestId(element, 'delete')).to.exist;
    });

    it('renders with i18n key "delete" for caption', async () => {
      const data = await getTestData('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form
        .data=${data}
        lang="es"
      ></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const control = await getByTestId(element, 'delete');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'delete');
      expect(caption).to.have.attribute('ns', 'custom-field-form');
    });

    it('renders disabled if form is disabled', async () => {
      const data = await getTestData('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data} disabled></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const data = await getTestData('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);

      element.edit({ name: 'Foo' });
      element.submit();

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "delete"', async () => {
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form
          .data=${await getTestData<Data>('./hapi/custom_fields/0')}
          disabledcontrols="delete"
        >
        </foxy-custom-field-form>
      `);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('shows deletion confirmation dialog on click', async () => {
      const data = await getTestData('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'delete');
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.called;
    });

    it('deletes resource if deletion is confirmed', async () => {
      const data = await getTestData('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(false));

      expect(deleteMethod).to.have.been.called;
    });

    it('keeps resource if deletion is cancelled', async () => {
      const data = await getTestData('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(true));

      expect(deleteMethod).not.to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const data = await getTestData('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data} hidden></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "delete"', async () => {
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form
          .data=${await getTestData<Data>('./hapi/custom_fields/0')}
          hiddencontrols="delete"
        >
        </foxy-custom-field-form>
      `);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('renders with "delete:before" slot by default', async () => {
      const data = await getTestData('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:before" slot with template "delete:before" if available and rendered', async () => {
      const href = 'https://demo.api/hapi/custom_fields/0';
      const name = 'delete:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-custom-field-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "delete:after" slot by default', async () => {
      const data = await getTestData('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:after" slot with template "delete:after" if available and rendered', async () => {
      const href = 'https://demo.api/hapi/custom_fields/0';
      const name = 'delete:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<CustomFieldForm>(html`
        <foxy-custom-field-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-custom-field-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const router = createRouter();
      const layout = html`
        <foxy-custom-field-form
          href="https://demo.api/virtual/stall"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-custom-field-form>
      `;

      const element = await fixture<CustomFieldForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'custom-field-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-custom-field-form href=${href} lang="es"></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'custom-field-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('./hapi/custom_fields/0');
      const layout = html`<foxy-custom-field-form .data=${data}></foxy-custom-field-form>`;
      const element = await fixture<CustomFieldForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
