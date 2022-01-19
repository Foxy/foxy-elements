import './index';

import { Checkbox, Choice } from '../../private';
import { CheckboxChangeEvent, ChoiceChangeEvent } from '../../private/events';
import { Data, TemplateConfigJSON } from './types';
import { expect, fixture, html } from '@open-wc/testing';

import { CountriesList } from './CountriesList';
import { I18n } from '../I18n';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { TemplateConfigForm } from './TemplateConfigForm';
import { TextAreaElement } from '@vaadin/vaadin-text-field/vaadin-text-area';
import { TextFieldElement } from '@vaadin/vaadin-text-field/vaadin-text-field';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('TemplateConfigForm', () => {
  it('extends NucleonElement', () => {
    expect(new TemplateConfigForm()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-template-config-form', () => {
    expect(customElements.get('foxy-template-config-form')).to.equal(TemplateConfigForm);
  });

  it('has a default i18next namespace of "template-config-form"', () => {
    expect(new TemplateConfigForm()).to.have.property('ns', 'template-config-form');
  });

  it('has an empty fx:countries URL by default', () => {
    expect(new TemplateConfigForm()).to.have.property('countries', '');
  });

  it('has an empty fx:regions URL by default', () => {
    expect(new TemplateConfigForm()).to.have.property('regions', '');
  });

  describe('cart-type', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'cart-type')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'cart-type')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes cart-type', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form hiddencontrols="cart-type"></foxy-template-config-form>`
      );

      expect(await getByTestId(element, 'cart-type')).to.not.exist;
    });

    it('renders "cart-type:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'cart-type:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "cart-type:before" slot with template "cart-type:before" if available', async () => {
      const type = 'cart-type:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "cart-type:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'cart-type:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "cart-type:after" slot with template "cart-type:after" if available', async () => {
      const type = 'cart-type:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a group label with i18n key cart_type', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'cart-type')) as HTMLElement;
      const label = await getByKey(control, 'cart_type');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders a choice of cart types', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'cart-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'cart-type-choice')) as Choice;

      expect(choice).to.exist;
      expect(choice).to.have.deep.property('items', ['default', 'fullpage', 'custom']);
    });

    it('reflects the value of cart_type from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.cart_type = 'fullpage';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'cart-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'cart-type-choice')) as Choice;

      expect(choice).to.have.property('value', 'fullpage');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'cart-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'cart-type-choice')) as Choice;

      expect(choice).to.not.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-template-config-form disabled></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'cart-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'cart-type-choice')) as Choice;

      expect(choice).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes cart-type', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form disabledcontrols="cart-type"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'cart-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'cart-type-choice')) as Choice;

      expect(choice).to.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'cart-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'cart-type-choice')) as Choice;

      expect(choice).to.not.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-template-config-form readonly></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'cart-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'cart-type-choice')) as Choice;

      expect(choice).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes cart-type', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form readonlycontrols="cart-type"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'cart-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'cart-type-choice')) as Choice;

      expect(choice).to.have.attribute('readonly');
    });

    it('writes to cart_type property of parsed form.json value on change', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'cart-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'cart-type-choice')) as Choice;

      choice.value = 'fullpage';
      choice.dispatchEvent(new ChoiceChangeEvent('fullpage'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.property('cart_type', 'fullpage');
    });

    ['default', 'fullpage', 'custom'].forEach(type => {
      it(`renders i18n label and explainer for ${type} cart type`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);

        element.lang = 'es';
        element.ns = 'foo';

        const control = (await getByTestId(element, 'cart-type')) as HTMLElement;
        const choice = (await getByTestId(control, 'cart-type-choice')) as Choice;
        const wrapper = choice.querySelector(`[slot="${type}-label"]`) as HTMLElement;
        const label = await getByKey(wrapper, `cart_type_${type}`);
        const explainer = await getByKey(wrapper, `cart_type_${type}_explainer`);

        expect(label).to.exist;
        expect(label).to.have.attribute('lang', 'es');
        expect(label).to.have.attribute('ns', 'foo');

        expect(explainer).to.exist;
        expect(explainer).to.have.attribute('lang', 'es');
        expect(explainer).to.have.attribute('ns', 'foo');
      });
    });
  });

  describe('foxycomplete', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'foxycomplete')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'foxycomplete')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes foxycomplete', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form hiddencontrols="foxycomplete"></foxy-template-config-form>`
      );

      expect(await getByTestId(element, 'foxycomplete')).to.not.exist;
    });

    it('renders "foxycomplete:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'foxycomplete:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "foxycomplete:before" slot with template "foxycomplete:before" if available', async () => {
      const type = 'foxycomplete:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "foxycomplete:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'foxycomplete:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "foxycomplete:after" slot with template "foxycomplete:after" if available', async () => {
      const type = 'foxycomplete:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a group label with i18n key foxycomplete', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
      const label = await getByKey(control, 'foxycomplete');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders a choice of foxycomplete configurations', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
      const choice = (await getByTestId(control, 'foxycomplete-choice')) as Choice;

      expect(choice).to.exist;
      expect(choice).to.have.deep.property('items', ['combobox', 'search', 'disabled']);
    });

    it('selects "disabled" if foxycomplete.usage from parsed form.json is "none"', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.foxycomplete.usage = 'none';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
      const choice = (await getByTestId(control, 'foxycomplete-choice')) as Choice;

      expect(choice).to.have.property('value', 'disabled');
    });

    it('selects "combobox" if foxycomplete.usage from parsed form.json is "required" and foxycomplete.show_combobox is true', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.foxycomplete.usage = 'required';
      json.foxycomplete.show_combobox = true;
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
      const choice = (await getByTestId(control, 'foxycomplete-choice')) as Choice;

      expect(choice).to.have.property('value', 'combobox');
    });

    it('selects "search" if foxycomplete.usage from parsed form.json is "required" and foxycomplete.show_combobox is false', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.foxycomplete.usage = 'required';
      json.foxycomplete.show_combobox = false;
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
      const choice = (await getByTestId(control, 'foxycomplete-choice')) as Choice;

      expect(choice).to.have.property('value', 'search');
    });

    const interactiveControlIds = [
      'foxycomplete-choice',
      'foxycomplete-open-icon',
      'foxycomplete-close-icon',
      'foxycomplete-lookup-check',
      'foxycomplete-flags-check',
    ];

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;

      for (const id of interactiveControlIds) {
        expect(await getByTestId(control, id)).to.not.have.attribute('disabled');
      }
    });

    it('is disabled when form is disabled', async () => {
      const layout = html`<foxy-template-config-form disabled></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;

      for (const id of interactiveControlIds) {
        expect(await getByTestId(control, id)).to.have.attribute('disabled');
      }
    });

    it('is disabled when disabledcontrols includes foxycomplete', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form disabledcontrols="foxycomplete"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;

      for (const id of interactiveControlIds) {
        expect(await getByTestId(control, id)).to.have.attribute('disabled');
      }
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;

      for (const id of interactiveControlIds) {
        expect(await getByTestId(control, id)).to.not.have.attribute('readonly');
      }
    });

    it('is readonly when form is readonly', async () => {
      const layout = html`<foxy-template-config-form readonly></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;

      for (const id of interactiveControlIds) {
        expect(await getByTestId(control, id)).to.have.attribute('readonly');
      }
    });

    it('is readonly when readonlycontrols includes foxycomplete', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form readonlycontrols="foxycomplete"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;

      for (const id of interactiveControlIds) {
        expect(await getByTestId(control, id)).to.have.attribute('readonly');
      }
    });

    it('writes to foxycomplete property of parsed form.json value on change (combobox)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
      const choice = (await getByTestId(control, 'foxycomplete-choice')) as Choice;

      choice.value = 'combobox';
      choice.dispatchEvent(new ChoiceChangeEvent('combobox'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.nested.property('foxycomplete.usage', 'required');
      expect(json).to.have.nested.property('foxycomplete.show_combobox', true);
    });

    it('writes to foxycomplete property of parsed form.json value on change (search)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
      const choice = (await getByTestId(control, 'foxycomplete-choice')) as Choice;

      choice.value = 'search';
      choice.dispatchEvent(new ChoiceChangeEvent('search'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.nested.property('foxycomplete.usage', 'required');
      expect(json).to.have.nested.property('foxycomplete.show_combobox', false);
    });

    it('writes to foxycomplete property of parsed form.json value on change (disabled)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
      const choice = (await getByTestId(control, 'foxycomplete-choice')) as Choice;

      choice.value = 'disabled';
      choice.dispatchEvent(new ChoiceChangeEvent('disabled'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.nested.property('foxycomplete.usage', 'none');
    });

    ['combobox', 'search', 'disabled'].forEach(type => {
      it(`renders i18n label and explainer for ${type} foxycomplete config`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);

        element.lang = 'es';
        element.ns = 'foo';

        const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
        const choice = (await getByTestId(control, 'foxycomplete-choice')) as Choice;
        const wrapper = choice.querySelector(`[slot="${type}-label"]`) as HTMLElement;
        const label = await getByKey(wrapper, `foxycomplete_${type}`);
        const explainer = await getByKey(wrapper, `foxycomplete_${type}_explainer`);

        expect(label).to.exist;
        expect(label).to.have.attribute('lang', 'es');
        expect(label).to.have.attribute('ns', 'foo');

        expect(explainer).to.exist;
        expect(explainer).to.have.attribute('lang', 'es');
        expect(explainer).to.have.attribute('ns', 'foo');
      });
    });

    ['open', 'close'].forEach(action => {
      it(`renders a text field with i18n label ${action}_icon`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
        const field = await getByTestId(control, `foxycomplete-${action}-icon`);

        expect(field).to.have.attribute('label', `${action}_icon`);
      });

      it(`reflects the value of foxycomplete.combobox_${action} of parsed form.json`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const data = await getTestData<Data>('./hapi/template_configs/0');
        const json = JSON.parse(data.json);

        element.data = data;
        json.foxycomplete[`combobox_${action}`] = 'Test';
        element.edit({ json: JSON.stringify(json) });

        const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
        const field = await getByTestId(control, `foxycomplete-${action}-icon`);

        expect(field).to.have.property('value', 'Test');
      });

      it(`writes to foxycomplete.combobox_${action} of parsed form.json on input`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
        const field = (await getByTestId(
          control,
          `foxycomplete-${action}-icon`
        )) as TextFieldElement;

        field.value = 'Test';
        field.dispatchEvent(new CustomEvent('input'));

        const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
        expect(json).to.have.nested.property(`foxycomplete.combobox_${action}`, 'Test');
      });

      it(`submits a valid form on enter (${action} icon field)`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const submit = stub(element, 'submit');

        element.data = await getTestData('./hapi/template_configs/0');

        const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
        const field = (await getByTestId(
          control,
          `foxycomplete-${action}-icon`
        )) as TextFieldElement;

        field.value = 'Test';
        field.dispatchEvent(new CustomEvent('input'));
        field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        expect(submit).to.have.been.called;
      });
    });

    it('renders a checkbox with i18n label show_country_flags', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
      const check = await getByTestId(control, 'foxycomplete-flags-check');

      expect(check).to.exist;
      expect(check).to.be.instanceOf(Checkbox);

      const label = check?.querySelector('foxy-i18n[key="show_country_flags"]');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    [true, false].forEach(state => {
      it(`reflects the value of foxycomplete.show_flags (${state}) of parsed form.json`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const data = await getTestData<Data>('./hapi/template_configs/0');
        const json = JSON.parse(data.json) as TemplateConfigJSON;

        json.foxycomplete.show_flags = state;
        element.edit({ json: JSON.stringify(json) });

        const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
        const check = await getByTestId(control, 'foxycomplete-flags-check');

        expect(check).to.have.property('checked', state);
      });

      it(`writes to foxycomplete.show_flags of parsed form.json (value: ${state})`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
        const check = (await getByTestId(control, 'foxycomplete-flags-check')) as Checkbox;

        check.checked = state;
        check.dispatchEvent(new CheckboxChangeEvent(state));

        const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
        expect(json).to.have.nested.property('foxycomplete.show_flags', state);
      });
    });

    it('renders a checkbox with i18n label enable_postcode_lookup', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
      const check = await getByTestId(control, 'foxycomplete-lookup-check');

      expect(check).to.exist;
      expect(check).to.be.instanceOf(Checkbox);

      const label = check?.querySelector('foxy-i18n[key="enable_postcode_lookup"]');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    [true, false].forEach(state => {
      it(`reflects the value of postal_code_lookup.usage (${state}) of parsed form.json`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const data = await getTestData<Data>('./hapi/template_configs/0');
        const json = JSON.parse(data.json) as TemplateConfigJSON;

        json.postal_code_lookup.usage = state ? 'enabled' : 'none';
        element.edit({ json: JSON.stringify(json) });

        const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
        const check = await getByTestId(control, 'foxycomplete-lookup-check');

        expect(check).to.have.property('checked', state);
      });

      it(`writes to postal_code_lookup.usage of parsed form.json (value: ${state})`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const control = (await getByTestId(element, 'foxycomplete')) as HTMLElement;
        const check = (await getByTestId(control, 'foxycomplete-lookup-check')) as Checkbox;

        check.checked = state;
        check.dispatchEvent(new CheckboxChangeEvent(state));

        const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
        const expectedValue = state ? 'enabled' : 'none';

        expect(json).to.have.nested.property('postal_code_lookup.usage', expectedValue);
      });
    });
  });

  describe('locations', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'locations')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'locations')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes locations', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form hiddencontrols="locations"></foxy-template-config-form>`
      );

      expect(await getByTestId(element, 'locations')).to.not.exist;
    });

    it('renders "locations:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'locations:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "locations:before" slot with template "locations:before" if available', async () => {
      const type = 'locations:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "locations:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'locations:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "locations:after" slot with template "locations:after" if available', async () => {
      const type = 'locations:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    ['location_plural', 'shipping', 'billing'].forEach(key => {
      it(`renders a group label with i18n key ${key}`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);

        element.lang = 'es';
        element.ns = 'foo';

        const control = (await getByTestId(element, 'locations')) as HTMLElement;
        const label = await getByKey(control, key);

        expect(label).to.exist;
        expect(label).to.have.attribute('lang', 'es');
        expect(label).to.have.attribute('ns', 'foo');
      });
    });

    const interactiveControlIds = [
      'locations-shipping-choice',
      'locations-shipping-list',
      'locations-billing-choice',
      'locations-billing-list',
    ];

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'locations')) as HTMLElement;

      for (const id of interactiveControlIds) {
        const node = await getByTestId(control, id);
        expect(node, `${id} must not be disabled`).to.not.have.attribute('disabled');
      }
    });

    it('is disabled when form is disabled', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form disabled></foxy-template-config-form>`
      );

      const control = (await getByTestId(element, 'locations')) as HTMLElement;

      for (const id of interactiveControlIds) {
        const node = await getByTestId(control, id);
        expect(node, `${id} must be disabled`).to.have.attribute('disabled');
      }
    });

    it('is disabled when disabledcontrols includes locations', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form disabledcontrols="locations"></foxy-template-config-form>`
      );

      const control = (await getByTestId(element, 'locations')) as HTMLElement;

      for (const id of interactiveControlIds) {
        const node = await getByTestId(control, id);
        expect(node, `${id} must be disabled`).to.have.attribute('disabled');
      }
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'locations')) as HTMLElement;

      for (const id of interactiveControlIds) {
        const node = await getByTestId(control, id);
        expect(node, `${id} must not be readonly`).to.not.have.attribute('readonly');
      }
    });

    it('is readonly when form is readonly', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form readonly></foxy-template-config-form>`
      );

      const control = (await getByTestId(element, 'locations')) as HTMLElement;

      for (const id of interactiveControlIds) {
        const node = await getByTestId(control, id);
        expect(node, `${id} must be readonly`).to.have.attribute('readonly');
      }
    });

    it('is readonly when readonlycontrols includes locations', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form readonlycontrols="locations"></foxy-template-config-form>`
      );

      const control = (await getByTestId(element, 'locations')) as HTMLElement;

      for (const id of interactiveControlIds) {
        const node = await getByTestId(control, id);
        expect(node, `${id} must be readonly`).to.have.attribute('readonly');
      }
    });

    it('renders a choice of shipping filter configurations', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const choice = (await getByTestId(control, 'locations-shipping-choice')) as Choice;

      expect(choice).to.exist;
      expect(choice).to.have.deep.property('items', ['allow', 'block']);
    });

    [
      ['block', 'blacklist', 'blocklist'],
      ['allow', 'whitelist', 'allowlist'],
    ].forEach(([choiceValue, apiValue, labelKey]) => {
      it(`selects "${choiceValue}" shipping filter configuration if location_filtering.shipping_filter_type of parsed form.json is "${apiValue}"`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const data = await getTestData<Data>('./hapi/template_configs/0');
        const json = JSON.parse(data.json);

        element.data = data;
        json.location_filtering.shipping_filter_type = apiValue;
        element.edit({ json: JSON.stringify(json) });

        const control = (await getByTestId(element, 'locations')) as HTMLElement;
        const choice = (await getByTestId(control, 'locations-shipping-choice')) as Choice;

        expect(choice).to.have.property('value', choiceValue);
      });

      it(`sets location_filtering.shipping_filter_type property of parsed form.json to "${apiValue}" when "${choiceValue}" is selected`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const control = (await getByTestId(element, 'locations')) as HTMLElement;
        const choice = (await getByTestId(control, 'locations-shipping-choice')) as Choice;

        choice.value = choiceValue;
        choice.dispatchEvent(new ChoiceChangeEvent(choiceValue));

        const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
        expect(json).to.have.nested.property('location_filtering.shipping_filter_type', apiValue);
      });

      it(`renders an i18n label for choice option "${choiceValue}" with the "${labelKey}" key`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);

        element.lang = 'es';
        element.ns = 'foo';

        const control = (await getByTestId(element, 'locations')) as HTMLElement;
        const choice = (await getByTestId(control, 'locations-shipping-choice')) as Choice;
        const label = choice.querySelector(`foxy-i18n[slot="${choiceValue}-label"]`);

        expect(label).to.exist;
        expect(label).to.have.attribute('lang', 'es');
        expect(label).to.have.attribute('key', labelKey);
        expect(label).to.have.attribute('ns', 'foo');
      });
    });

    it('renders a CountriesList for shipping filter values', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      json.location_filtering.shipping_filter_values = { US: ['AL', 'TX'], RU: '*' };
      element.edit({ json: JSON.stringify(json) });

      element.countries = 'test://countries';
      element.regions = 'test://regions';
      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const list = await getByTestId(control, 'locations-shipping-list');

      expect(list).to.be.instanceOf(CountriesList);
      expect(list).to.have.attribute('countries', JSON.stringify({ US: ['AL', 'TX'], RU: '*' }));
      expect(list).to.have.attribute('regions', 'test://regions');
      expect(list).to.have.attribute('href', 'test://countries');
      expect(list).to.have.attribute('lang', 'es');
      expect(list).to.have.attribute('ns', 'foo');
    });

    it('sets shipping filter values on change', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const list = (await getByTestId(control, 'locations-shipping-list')) as CountriesList;

      list.countries = { US: ['AL', 'TX'], RU: '*' };
      list.dispatchEvent(new CustomEvent('update:countries'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.deep.nested.property('location_filtering.shipping_filter_values', {
        US: ['AL', 'TX'],
        RU: '*',
      });
    });

    it('renders a choice of billing filter configurations', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const choice = (await getByTestId(control, 'locations-billing-choice')) as Choice;

      expect(choice).to.exist;
      expect(choice).to.have.deep.property('items', ['allow', 'block', 'copy']);
    });

    it('selects "copy" billing filter configuration if location_filtering.usage of parsed form.json is "both"', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json);

      element.data = data;
      json.location_filtering.usage = 'both';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const choice = (await getByTestId(control, 'locations-billing-choice')) as Choice;

      expect(choice).to.have.property('value', 'copy');
    });

    ['none', 'shipping', 'billing', 'independent'].forEach(type => {
      it(`selects "block" billing filter configuration if location_filtering.usage of parsed form.json is "${type}" and location_filtering.billing_filter_type is "blacklist"`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const data = await getTestData<Data>('./hapi/template_configs/0');
        const json = JSON.parse(data.json);

        json.location_filtering.billing_filter_type = 'blacklist';
        json.location_filtering.usage = type;
        element.edit({ json: JSON.stringify(json) });

        const control = (await getByTestId(element, 'locations')) as HTMLElement;
        const choice = (await getByTestId(control, 'locations-billing-choice')) as Choice;

        expect(choice).to.have.property('value', 'block');
      });

      it(`selects "allow" billing filter configuration if location_filtering.usage of parsed form.json is "${type}" and location_filtering.billing_filter_type is "whitelist"`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const data = await getTestData<Data>('./hapi/template_configs/0');
        const json = JSON.parse(data.json);

        json.location_filtering.billing_filter_type = 'whitelist';
        json.location_filtering.usage = type;
        element.edit({ json: JSON.stringify(json) });

        const control = (await getByTestId(element, 'locations')) as HTMLElement;
        const choice = (await getByTestId(control, 'locations-billing-choice')) as Choice;

        expect(choice).to.have.property('value', 'allow');
      });
    });

    it('sets location_filtering.billing_filter_type property of parsed form.json to "blacklist" when "block" is selected', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const choice = (await getByTestId(control, 'locations-billing-choice')) as Choice;

      choice.value = 'block';
      choice.dispatchEvent(new ChoiceChangeEvent('block'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.nested.property('location_filtering.billing_filter_type', 'blacklist');
    });

    it('sets location_filtering.billing_filter_type property of parsed form.json to "whitelist" when "allow" is selected', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const choice = (await getByTestId(control, 'locations-billing-choice')) as Choice;

      choice.value = 'allow';
      choice.dispatchEvent(new ChoiceChangeEvent('allow'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.nested.property('location_filtering.billing_filter_type', 'whitelist');
    });

    it('copies shipping filter config to billing when "copy" is selected', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const choice = (await getByTestId(control, 'locations-billing-choice')) as Choice;

      choice.value = 'copy';
      choice.dispatchEvent(new ChoiceChangeEvent('copy'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;

      expect(json).to.have.nested.property(
        'location_filtering.billing_filter_type',
        json.location_filtering.shipping_filter_type
      );

      expect(json).to.have.nested.property(
        'location_filtering.shipping_filter_values',
        json.location_filtering.shipping_filter_values
      );
    });

    it('renders a CountriesList for billing filter values', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      json.location_filtering.billing_filter_values = { US: ['AL', 'TX'], RU: '*' };
      element.edit({ json: JSON.stringify(json) });

      element.countries = 'test://countries';
      element.regions = 'test://regions';
      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const list = await getByTestId(control, 'locations-billing-list');

      expect(list).to.be.instanceOf(CountriesList);
      expect(list).to.have.attribute('countries', JSON.stringify({ US: ['AL', 'TX'], RU: '*' }));
      expect(list).to.have.attribute('regions', 'test://regions');
      expect(list).to.have.attribute('href', 'test://countries');
      expect(list).to.have.attribute('lang', 'es');
      expect(list).to.have.attribute('ns', 'foo');
    });

    it('sets billing filter values on change', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const list = (await getByTestId(control, 'locations-billing-list')) as CountriesList;

      list.countries = { US: ['AL', 'TX'], RU: '*' };
      list.dispatchEvent(new CustomEvent('update:countries'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.deep.nested.property('location_filtering.billing_filter_values', {
        US: ['AL', 'TX'],
        RU: '*',
      });
    });

    it('switches location_filtering.usage of parsed form.json to "none" on change if there aren\'t any filters', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const shippingList = (await getByTestId(control, 'locations-shipping-list')) as CountriesList;
      const billingList = (await getByTestId(control, 'locations-billing-list')) as CountriesList;

      shippingList.countries = {};
      shippingList.dispatchEvent(new CustomEvent('update:countries'));
      billingList.countries = {};
      billingList.dispatchEvent(new CustomEvent('update:countries'));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('location_filtering.usage', 'none');
    });

    it('switches location_filtering.usage of parsed form.json to "billing" on change if there are only billing filters', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const shippingList = (await getByTestId(control, 'locations-shipping-list')) as CountriesList;
      const billingList = (await getByTestId(control, 'locations-billing-list')) as CountriesList;

      shippingList.countries = {};
      shippingList.dispatchEvent(new CustomEvent('update:countries'));
      billingList.countries = { US: '*' };
      billingList.dispatchEvent(new CustomEvent('update:countries'));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('location_filtering.usage', 'billing');
    });

    it('switches location_filtering.usage of parsed form.json to "shipping" on change if there are only shipping filters', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const shippingList = (await getByTestId(control, 'locations-shipping-list')) as CountriesList;
      const billingList = (await getByTestId(control, 'locations-billing-list')) as CountriesList;

      shippingList.countries = { US: '*' };
      shippingList.dispatchEvent(new CustomEvent('update:countries'));
      billingList.countries = {};
      billingList.dispatchEvent(new CustomEvent('update:countries'));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('location_filtering.usage', 'shipping');
    });

    it('switches location_filtering.usage of parsed form.json to "independent" on change if there are both shipping and billing filters', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      const control = (await getByTestId(element, 'locations')) as HTMLElement;
      const shippingList = (await getByTestId(control, 'locations-shipping-list')) as CountriesList;
      const billingList = (await getByTestId(control, 'locations-billing-list')) as CountriesList;

      shippingList.countries = { US: '*' };
      shippingList.dispatchEvent(new CustomEvent('update:countries'));
      billingList.countries = { AL: '*' };
      billingList.dispatchEvent(new CustomEvent('update:countries'));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('location_filtering.usage', 'independent');
    });
  });

  describe('hidden-fields', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'hidden-fields')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'hidden-fields')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes hidden-fields', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form hiddencontrols="hidden-fields"></foxy-template-config-form>`
      );

      expect(await getByTestId(element, 'hidden-fields')).to.not.exist;
    });

    it('renders "hidden-fields:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'hidden-fields:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "hidden-fields:before" slot with template "hidden-fields:before" if available', async () => {
      const type = 'hidden-fields:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "hidden-fields:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'hidden-fields:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "hidden-fields:after" slot with template "hidden-fields:after" if available', async () => {
      const type = 'hidden-fields:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a group label with i18n key hidden_fields', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;
      const label = await getByKey(control, 'hidden_fields');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    const builtIns = [
      'show_product_weight',
      'show_product_category',
      'show_product_code',
      'show_product_options',
      'show_sub_frequency',
      'show_sub_startdate',
      'show_sub_nextdate',
      'show_sub_enddate',
    ] as const;

    builtIns.forEach(name => {
      it(`reflects the value of cart_display_config from parsed form.json (built-ins, hidden, ${name})`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const data = await getTestData<Data>('./hapi/template_configs/0');
        const json = JSON.parse(data.json) as TemplateConfigJSON;

        json.cart_display_config.usage = 'required';
        json.cart_display_config[name] = false;
        element.edit({ json: JSON.stringify(json) });

        const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;
        const list = (await getByTestId(control, 'hidden-fields-list')) as HTMLElement;
        const item = Array.from(list.children).find(child => {
          return !!child.querySelector(`foxy-i18n[key="${name.substring(5)}"]`);
        });

        expect(item).to.exist;
      });

      it(`reflects the value of cart_display_config from parsed form.json (built-ins, visible, ${name})`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const data = await getTestData<Data>('./hapi/template_configs/0');
        const json = JSON.parse(data.json) as TemplateConfigJSON;

        json.cart_display_config.usage = 'required';
        json.cart_display_config[name] = true;
        element.edit({ json: JSON.stringify(json) });

        const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;
        const list = (await getByTestId(control, 'hidden-fields-list')) as HTMLElement;
        const item = Array.from(list.children).find(child => {
          return !!child.querySelector(`foxy-i18n[key="${name.substring(5)}"]`);
        });

        expect(item).to.not.exist;
      });

      it(`writes to cart_display_config property of parsed form.json on delete (built-ins, ${name})`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const data = await getTestData<Data>('./hapi/template_configs/0');
        const json = JSON.parse(data.json) as TemplateConfigJSON;

        json.cart_display_config.usage = 'required';
        json.cart_display_config[name] = false;
        element.edit({ json: JSON.stringify(json) });

        const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;
        const list = (await getByTestId(control, 'hidden-fields-list')) as HTMLElement;
        const item = Array.from(list.children).find(child => {
          return !!child.querySelector(`foxy-i18n[key="${name.substring(5)}"]`);
        }) as HTMLElement;

        const button = item.querySelector('button[aria-label="delete"]') as HTMLButtonElement;
        button.click();

        const newJSON = JSON.parse(element.form.json as string) as TemplateConfigJSON;
        expect(newJSON).to.have.nested.property(`cart_display_config.${name}`, true);
      });
    });

    it('reflects the value of cart_display_config from parsed form.json (custom)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      json.cart_display_config.usage = 'required';
      json.cart_display_config.hidden_product_options = ['foo_test_field', 'bar_test_field'];
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;
      const list = (await getByTestId(control, 'hidden-fields-list')) as HTMLElement;
      const items = Array.from(list.children);

      json.cart_display_config.hidden_product_options.forEach(name => {
        const item = items.find(child => child.textContent?.includes(name));
        expect(item).to.exist;
      });
    });

    it('writes to cart_display_config property of parsed form.json on delete (custom)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      json.cart_display_config.usage = 'required';
      json.cart_display_config.hidden_product_options = ['foo_test_field', 'bar_test_field'];
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;
      const list = (await getByTestId(control, 'hidden-fields-list')) as HTMLElement;
      const items = Array.from(list.children);

      json.cart_display_config.hidden_product_options.forEach(name => {
        const item = items.find(child => child.textContent?.includes(name)) as HTMLElement;
        const button = item.querySelector('button[aria-label="delete"]') as HTMLButtonElement;
        button.click();

        const newJSON = JSON.parse(element.form.json as string) as TemplateConfigJSON;
        expect(newJSON.cart_display_config.hidden_product_options).to.not.include(name);
      });
    });

    it('writes to cart_display_config property of parsed form.json on add (via button click)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;
      const list = (await getByTestId(control, 'hidden-fields-new')) as HTMLElement;
      const input = list.querySelector('input') as HTMLInputElement;

      input.value = 'foo_test_field';
      input.dispatchEvent(new InputEvent('input'));

      await element.updateComplete;
      list.querySelector('button')!.click();

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;

      expect(json).to.have.nested.property('cart_display_config.usage', 'required');
      expect(json).to.have.nested.property('cart_display_config.hidden_product_options');
      expect(json.cart_display_config.hidden_product_options).to.include('foo_test_field');
    });

    it('writes to cart_display_config property of parsed form.json on add (via enter press)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;
      const list = (await getByTestId(control, 'hidden-fields-new')) as HTMLElement;
      const input = list.querySelector('input') as HTMLInputElement;

      input.value = 'foo_test_field';
      input.dispatchEvent(new InputEvent('input'));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;

      expect(json).to.have.nested.property('cart_display_config.usage', 'required');
      expect(json).to.have.nested.property('cart_display_config.hidden_product_options');
      expect(json.cart_display_config.hidden_product_options).to.include('foo_test_field');
    });

    it('is enabled by default', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form></foxy-template-config-form>`
      );

      const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;

      control.querySelectorAll('input').forEach(input => {
        input.value = 'Foo';
        input.dispatchEvent(new InputEvent('input'));
      });

      await element.updateComplete;

      control.querySelectorAll('button, input').forEach(node => {
        expect(node).to.not.have.attribute('disabled');
      });
    });

    it('disabled Add button when input is empty', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form></foxy-template-config-form>`
      );

      const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;
      const newField = (await getByTestId(control, 'hidden-fields-new')) as HTMLElement;
      const newFieldButton = newField.querySelector('button');

      expect(newFieldButton).to.have.attribute('disabled');
    });

    it('is disabled when the form is disabled', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form disabled></foxy-template-config-form>`
      );

      const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;

      control.querySelectorAll('input').forEach(input => {
        input.value = 'Foo';
        input.dispatchEvent(new InputEvent('input'));
      });

      await element.updateComplete;

      control.querySelectorAll('button, input').forEach(node => {
        expect(node).to.have.attribute('disabled');
      });
    });

    it('is disabled when disabledcontrols include hidden-fields', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form
          disabledcontrols="hidden-fields"
        ></foxy-template-config-form>`
      );

      const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;

      control.querySelectorAll('input').forEach(input => {
        input.value = 'Foo';
        input.dispatchEvent(new InputEvent('input'));
      });

      await element.updateComplete;

      control.querySelectorAll('button, input').forEach(node => {
        expect(node).to.have.attribute('disabled');
      });
    });

    it('is editable by default', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form></foxy-template-config-form>`
      );

      const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;
      control.querySelectorAll('input').forEach(node => {
        expect(node).to.not.have.attribute('readonly');
      });
    });

    it('is readonly when the form is readonly', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form readonly></foxy-template-config-form>`
      );

      const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;
      control.querySelectorAll('input').forEach(node => {
        expect(node).to.have.attribute('readonly');
      });
    });

    it('is readonly when readonlycontrols include hidden-fields', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form
          readonlycontrols="hidden-fields"
        ></foxy-template-config-form>`
      );

      const control = (await getByTestId(element, 'hidden-fields')) as HTMLElement;
      control.querySelectorAll('input').forEach(node => {
        expect(node).to.have.attribute('readonly');
      });
    });
  });

  describe('cards', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'cards')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'cards')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes cards', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form hiddencontrols="cards"></foxy-template-config-form>`
      );

      expect(await getByTestId(element, 'cards')).to.not.exist;
    });

    it('renders "cards:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'cards:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "cards:before" slot with template "cards:before" if available', async () => {
      const type = 'cards:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "cards:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'cards:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "cards:after" slot with template "cards:after" if available', async () => {
      const type = 'cards:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a group label with i18n key supported_cards', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const label = await getByKey(control, 'supported_cards');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    const options: Record<string, string> = {
      amex: 'American Express',
      diners: 'Diners Club',
      discover: 'Discover',
      jcb: 'JCB',
      maestro: 'Maestro',
      mastercard: 'Mastercard',
      unionpay: 'UnionPay',
      visa: 'Visa',
    };

    Object.entries(options).forEach(([type, name]) => {
      it(`renders an option for ${type} (${name})`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const control = (await getByTestId(element, 'cards')) as HTMLElement;
        const labels = control.querySelectorAll('label');
        const label = Array.from(labels).find(label => label.textContent?.includes(name));
        const input = label?.querySelector('input');

        expect(label).to.exist;
        expect(label).to.include.text(name);
        expect(input).to.exist;
        expect(input).to.have.attribute('type', 'checkbox');
      });

      it(`reflects the value of supported_payment_cards from parsed form.json (${type}, excluded)`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const data = await getTestData<Data>('./hapi/template_configs/0');
        const json = JSON.parse(data.json) as TemplateConfigJSON;

        json.supported_payment_cards = [];
        element.edit({ json: JSON.stringify(json) });

        const control = (await getByTestId(element, 'cards')) as HTMLElement;
        const labels = control.querySelectorAll('label');
        const label = Array.from(labels).find(label => label.textContent?.includes(name));
        const input = label?.querySelector('input');

        expect(input).to.not.have.attribute('checked');
      });

      it(`reflects the value of supported_payment_cards from parsed form.json (${type}, included)`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const data = await getTestData<Data>('./hapi/template_configs/0');
        const json = JSON.parse(data.json) as TemplateConfigJSON;

        json.supported_payment_cards = [type] as TemplateConfigJSON['supported_payment_cards'];
        element.edit({ json: JSON.stringify(json) });

        const control = (await getByTestId(element, 'cards')) as HTMLElement;
        const labels = control.querySelectorAll('label');
        const label = Array.from(labels).find(label => label.textContent?.includes(name));
        const input = label?.querySelector('input');

        expect(input).to.have.attribute('checked');
      });

      it(`writes to supported_payment_cards property of parsed form.json value on change (${type}, excluded)`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);

        const control = (await getByTestId(element, 'cards')) as HTMLElement;
        const labels = control.querySelectorAll('label');
        const label = Array.from(labels).find(label => label.textContent?.includes(name))!;
        const input = label.querySelector('input') as HTMLInputElement;

        input.checked = false;
        input.dispatchEvent(new Event('change'));

        const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;

        expect(json).to.have.property('supported_payment_cards');
        expect(json.supported_payment_cards).to.not.include(type);
      });

      it(`writes to supported_payment_cards property of parsed form.json value on change (${type}, included)`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);

        const control = (await getByTestId(element, 'cards')) as HTMLElement;
        const labels = control.querySelectorAll('label');
        const label = Array.from(labels).find(label => label.textContent?.includes(name))!;
        const input = label.querySelector('input') as HTMLInputElement;

        input.checked = true;
        input.dispatchEvent(new Event('change'));

        const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;

        expect(json).to.have.property('supported_payment_cards');
        expect(json.supported_payment_cards).to.include(type);
      });
    });

    it('reflects the value of csc_requirements (all_cards) from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.csc_requirements = 'all_cards';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const savedCheck = await getByTestId(control, 'cards-saved-check');
      const ssoCheck = await getByTestId(control, 'cards-sso-check');

      expect(savedCheck).to.not.have.attribute('checked');
      expect(ssoCheck).to.not.have.attribute('checked');
    });

    it('reflects the value of csc_requirements (sso_only) from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.csc_requirements = 'sso_only';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const savedCheck = await getByTestId(control, 'cards-saved-check');
      const ssoCheck = await getByTestId(control, 'cards-sso-check');

      expect(savedCheck).to.have.attribute('checked');
      expect(ssoCheck).to.not.have.attribute('checked');
    });

    it('reflects the value of csc_requirements (new_cards_only) from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.csc_requirements = 'new_cards_only';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const savedCheck = await getByTestId(control, 'cards-saved-check');
      const ssoCheck = await getByTestId(control, 'cards-sso-check');

      expect(savedCheck).to.have.attribute('disabled');
      expect(savedCheck).to.have.attribute('checked');
      expect(ssoCheck).to.have.attribute('checked');
    });

    it('writes to csc_requirements property of parsed form.json value on change (cards-saved-check, true)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const check = (await getByTestId(control, 'cards-saved-check')) as Checkbox;

      check.checked = true;
      check.dispatchEvent(new CheckboxChangeEvent(true));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('csc_requirements', 'sso_only');
    });

    it('writes to csc_requirements property of parsed form.json value on change (cards-saved-check, false)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const check = (await getByTestId(control, 'cards-saved-check')) as Checkbox;

      check.checked = false;
      check.dispatchEvent(new CheckboxChangeEvent(false));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('csc_requirements', 'all_cards');
    });

    it('writes to csc_requirements property of parsed form.json value on change (cards-sso-check, true)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const check = (await getByTestId(control, 'cards-sso-check')) as Checkbox;

      check.checked = true;
      check.dispatchEvent(new CheckboxChangeEvent(true));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('csc_requirements', 'new_cards_only');
    });

    it('writes to csc_requirements property of parsed form.json value on change (cards-sso-check, false when cards-saved-check is true)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      json.csc_requirements = 'new_cards_only';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const check = (await getByTestId(control, 'cards-sso-check')) as Checkbox;

      check.checked = false;
      check.dispatchEvent(new CheckboxChangeEvent(false));

      const newJSON = JSON.parse(element.form.json as string);
      expect(newJSON).to.have.nested.property('csc_requirements', 'sso_only');
    });

    it('writes to csc_requirements property of parsed form.json value on change (cards-sso-check, false when cards-saved-check is false)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      json.csc_requirements = 'all_cards';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const check = (await getByTestId(control, 'cards-sso-check')) as Checkbox;

      check.checked = false;
      check.dispatchEvent(new CheckboxChangeEvent(false));

      const newJSON = JSON.parse(element.form.json as string);
      expect(newJSON).to.have.nested.property('csc_requirements', 'all_cards');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const inputs = control.querySelectorAll('input');
      const ssoCheck = control.querySelector('[data-testid="cards-sso-check"]');
      const savedCheck = control.querySelector('[data-testid="cards-saved-check"]');

      expect(savedCheck).to.not.have.attribute('disabled');
      expect(ssoCheck).to.not.have.attribute('disabled');
      inputs.forEach(input => expect(input).to.not.have.attribute('disabled'));
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-template-config-form disabled></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const inputs = control.querySelectorAll('input');
      const ssoCheck = control.querySelector('[data-testid="cards-sso-check"]');
      const savedCheck = control.querySelector('[data-testid="cards-saved-check"]');

      expect(savedCheck).to.have.attribute('disabled');
      expect(ssoCheck).to.have.attribute('disabled');
      inputs.forEach(input => expect(input).to.have.attribute('disabled'));
    });

    it('is disabled when disabledcontrols includes cards', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form disabledcontrols="cards"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const inputs = control.querySelectorAll('input');
      const ssoCheck = control.querySelector('[data-testid="cards-sso-check"]');
      const savedCheck = control.querySelector('[data-testid="cards-saved-check"]');

      expect(savedCheck).to.have.attribute('disabled');
      expect(ssoCheck).to.have.attribute('disabled');
      inputs.forEach(input => expect(input).to.have.attribute('disabled'));
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const inputs = control.querySelectorAll('input');
      const ssoCheck = control.querySelector('[data-testid="cards-sso-check"]');
      const savedCheck = control.querySelector('[data-testid="cards-saved-check"]');

      expect(savedCheck).to.not.have.attribute('readonly');
      expect(ssoCheck).to.not.have.attribute('readonly');
      inputs.forEach(input => expect(input).to.not.have.attribute('readonly'));
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-template-config-form readonly></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const inputs = control.querySelectorAll('input');
      const ssoCheck = control.querySelector('[data-testid="cards-sso-check"]');
      const savedCheck = control.querySelector('[data-testid="cards-saved-check"]');

      expect(savedCheck).to.have.attribute('readonly');
      expect(ssoCheck).to.have.attribute('readonly');
      inputs.forEach(input => expect(input).to.have.attribute('readonly'));
    });

    it('is readonly when readonlycontrols includes cards', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form readonlycontrols="cards"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const inputs = control.querySelectorAll('input');
      const ssoCheck = control.querySelector('[data-testid="cards-sso-check"]');
      const savedCheck = control.querySelector('[data-testid="cards-saved-check"]');

      expect(savedCheck).to.have.attribute('readonly');
      expect(ssoCheck).to.have.attribute('readonly');
      inputs.forEach(input => expect(input).to.have.attribute('readonly'));
    });

    it('renders a disclaimer with i18n key supported_cards_disclaimer', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'cards')) as HTMLElement;
      const label = await getByKey(control, 'supported_cards_disclaimer');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });
  });

  describe('checkout-type', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'checkout-type')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'checkout-type')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes checkout-type', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form hiddencontrols="checkout-type"></foxy-template-config-form>`
      );

      expect(await getByTestId(element, 'checkout-type')).to.not.exist;
    });

    it('renders "checkout-type:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'checkout-type:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "checkout-type:before" slot with template "checkout-type:before" if available', async () => {
      const type = 'checkout-type:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "checkout-type:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'checkout-type:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "checkout-type:after" slot with template "checkout-type:after" if available', async () => {
      const type = 'checkout-type:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a group label with i18n key checkout_type', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'checkout-type')) as HTMLElement;
      const label = await getByKey(control, 'checkout_type');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders a helper text with i18n key checkout_type_helper_text', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'checkout-type')) as HTMLElement;
      const text = await getByKey(control, 'checkout_type_helper_text');

      expect(text).to.exist;
      expect(text).to.have.attribute('lang', 'es');
      expect(text).to.have.attribute('ns', 'foo');
    });

    it('renders a choice of checkout types', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'checkout-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'checkout-type-choice')) as Choice;

      expect(choice).to.exist;
      expect(choice).to.have.deep.property('items', [
        'default_account',
        'default_guest',
        'guest_only',
        'account_only',
      ]);
    });

    it('reflects the value of checkout_type from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.checkout_type = 'default_guest';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'checkout-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'checkout-type-choice')) as Choice;

      expect(choice).to.have.property('value', 'default_guest');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'checkout-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'checkout-type-choice')) as Choice;

      expect(choice).to.not.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-template-config-form disabled></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'checkout-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'checkout-type-choice')) as Choice;

      expect(choice).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes checkout-type', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form disabledcontrols="checkout-type"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'checkout-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'checkout-type-choice')) as Choice;

      expect(choice).to.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'checkout-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'checkout-type-choice')) as Choice;

      expect(choice).to.not.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-template-config-form readonly></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'checkout-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'checkout-type-choice')) as Choice;

      expect(choice).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes checkout-type', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form readonlycontrols="checkout-type"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'checkout-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'checkout-type-choice')) as Choice;

      expect(choice).to.have.attribute('readonly');
    });

    it('renders i18n labels for each choice', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'checkout-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'checkout-type-choice')) as Choice;

      expect(choice.getText('default_account')).to.equal('checkout_type_default_account');
      expect(choice.getText('default_guest')).to.equal('checkout_type_default_guest');
      expect(choice.getText('account_only')).to.equal('checkout_type_account_only');
      expect(choice.getText('guest_only')).to.equal('checkout_type_guest_only');
    });

    it('writes to checkout_type property of parsed form.json value on change', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'checkout-type')) as HTMLElement;
      const choice = (await getByTestId(control, 'checkout-type-choice')) as Choice;

      choice.value = 'default_guest';
      choice.dispatchEvent(new ChoiceChangeEvent('default_guest'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.property('checkout_type', 'default_guest');
    });
  });

  describe('consent', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'consent')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'consent')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes consent', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form hiddencontrols="consent"></foxy-template-config-form>
      `);

      expect(await getByTestId(element, 'consent')).to.not.exist;
    });

    it('renders "consent:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'consent:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "consent:before" slot with template "consent:before" if available', async () => {
      const type = 'consent:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "consent:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'consent:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "consent:after" slot with template "consent:after" if available', async () => {
      const type = 'consent:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a label with i18n key consent', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const label = await getByKey(control, 'consent');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders a TOS URL field with i18n label location_url', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-tos-check')) as HTMLElement;
      const field = check.querySelector('[data-testid="consent-tos-field"]') as TextFieldElement;

      expect(field).to.have.attribute('label', 'location_url');
    });

    it('reflects the value of tos_checkbox_settings.usage (required) from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.tos_checkbox_settings.usage = 'required';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const generalCheck = await getByTestId(control, 'consent-tos-check');
      const requireCheck = await getByTestId(control, 'consent-tos-require-check');

      expect(generalCheck).to.have.attribute('checked');
      expect(requireCheck).to.have.attribute('checked');
    });

    it('reflects the value of tos_checkbox_settings.usage (optional) from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.tos_checkbox_settings.usage = 'optional';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const generalCheck = await getByTestId(control, 'consent-tos-check');
      const requireCheck = await getByTestId(control, 'consent-tos-require-check');

      expect(generalCheck).to.have.attribute('checked');
      expect(requireCheck).to.not.have.attribute('checked');
    });

    it('reflects the value of tos_checkbox_settings.usage (none) from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.tos_checkbox_settings.usage = 'none';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const generalCheck = await getByTestId(control, 'consent-tos-check');
      const requireCheck = await getByTestId(control, 'consent-tos-require-check');

      expect(generalCheck).to.not.have.attribute('checked');
      expect(requireCheck).to.not.have.attribute('checked');
    });

    it('reflects the value of tos_checkbox_settings.url from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.tos_checkbox_settings.url = 'Test';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-tos-check')) as HTMLElement;
      const field = check.querySelector('[data-testid="consent-tos-field"]') as TextFieldElement;

      expect(field).to.have.property('value', 'Test');
    });

    it('reflects the value of tos_checkbox_settings.initial_state (checked) from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.tos_checkbox_settings.initial_state = 'checked';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const generalCheck = (await getByTestId(control, 'consent-tos-check')) as Checkbox;
      const stateCheck = generalCheck.querySelector('[data-testid="consent-tos-state-check"]')!;

      expect(stateCheck).to.have.attribute('checked');
    });

    it('reflects the value of tos_checkbox_settings.initial_state (unchecked) from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.tos_checkbox_settings.initial_state = 'unchecked';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const generalCheck = (await getByTestId(control, 'consent-tos-check')) as Checkbox;
      const stateCheck = generalCheck.querySelector('[data-testid="consent-tos-state-check"]')!;

      expect(stateCheck).to.not.have.attribute('checked');
    });

    it('reflects the value of newsletter_subscribe.usage (required) from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.newsletter_subscribe.usage = 'required';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = await getByTestId(control, 'consent-mail-check');

      expect(check).to.have.attribute('checked');
    });

    it('reflects the value of newsletter_subscribe.usage (none) from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.newsletter_subscribe.usage = 'none';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = await getByTestId(control, 'consent-mail-check');

      expect(check).to.not.have.attribute('checked');
    });

    it('reflects the value of eu_secure_data_transfer_consent.usage (required) from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.eu_secure_data_transfer_consent.usage = 'required';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = await getByTestId(control, 'consent-sdta-check');

      expect(check).to.have.attribute('checked');
    });

    it('reflects the value of eu_secure_data_transfer_consent.usage (none) from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.eu_secure_data_transfer_consent.usage = 'none';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = await getByTestId(control, 'consent-sdta-check');

      expect(check).to.not.have.attribute('checked');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const tosCheck = (await getByTestId(control, 'consent-tos-check')) as Checkbox;
      const tosField = tosCheck.querySelector('[data-testid="consent-tos-field"]');
      const tosRequireCheck = tosCheck.querySelector('[data-testid="consent-tos-require-check"]');
      const tosStateCheck = tosCheck.querySelector('[data-testid="consent-tos-state-check"]');
      const mailCheck = await getByTestId(control, 'consent-mail-check');
      const sdtaCheck = await getByTestId(control, 'consent-sdta-check');

      expect(tosCheck).to.not.have.attribute('disabled');
      expect(tosField).to.not.have.attribute('disabled');
      expect(tosRequireCheck).to.not.have.attribute('disabled');
      expect(tosStateCheck).to.not.have.attribute('disabled');
      expect(mailCheck).to.not.have.attribute('disabled');
      expect(sdtaCheck).to.not.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-template-config-form disabled></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const tosCheck = (await getByTestId(control, 'consent-tos-check')) as Checkbox;
      const tosField = tosCheck.querySelector('[data-testid="consent-tos-field"]');
      const tosRequireCheck = tosCheck.querySelector('[data-testid="consent-tos-require-check"]');
      const tosStateCheck = tosCheck.querySelector('[data-testid="consent-tos-state-check"]');
      const mailCheck = await getByTestId(control, 'consent-mail-check');
      const sdtaCheck = await getByTestId(control, 'consent-sdta-check');

      expect(tosCheck).to.have.attribute('disabled');
      expect(tosField).to.have.attribute('disabled');
      expect(tosRequireCheck).to.have.attribute('disabled');
      expect(tosStateCheck).to.have.attribute('disabled');
      expect(mailCheck).to.have.attribute('disabled');
      expect(sdtaCheck).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes consent', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form disabledcontrols="consent"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const tosCheck = (await getByTestId(control, 'consent-tos-check')) as Checkbox;
      const tosField = tosCheck.querySelector('[data-testid="consent-tos-field"]');
      const tosRequireCheck = tosCheck.querySelector('[data-testid="consent-tos-require-check"]');
      const tosStateCheck = tosCheck.querySelector('[data-testid="consent-tos-state-check"]');
      const mailCheck = await getByTestId(control, 'consent-mail-check');
      const sdtaCheck = await getByTestId(control, 'consent-sdta-check');

      expect(tosCheck).to.have.attribute('disabled');
      expect(tosField).to.have.attribute('disabled');
      expect(tosRequireCheck).to.have.attribute('disabled');
      expect(tosStateCheck).to.have.attribute('disabled');
      expect(mailCheck).to.have.attribute('disabled');
      expect(sdtaCheck).to.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const tosCheck = (await getByTestId(control, 'consent-tos-check')) as Checkbox;
      const tosField = tosCheck.querySelector('[data-testid="consent-tos-field"]');
      const tosRequireCheck = tosCheck.querySelector('[data-testid="consent-tos-require-check"]');
      const tosStateCheck = tosCheck.querySelector('[data-testid="consent-tos-state-check"]');
      const mailCheck = await getByTestId(control, 'consent-mail-check');
      const sdtaCheck = await getByTestId(control, 'consent-sdta-check');

      expect(tosCheck).to.not.have.attribute('readonly');
      expect(tosField).to.not.have.attribute('readonly');
      expect(tosRequireCheck).to.not.have.attribute('readonly');
      expect(tosStateCheck).to.not.have.attribute('readonly');
      expect(mailCheck).to.not.have.attribute('readonly');
      expect(sdtaCheck).to.not.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-template-config-form readonly></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const tosCheck = (await getByTestId(control, 'consent-tos-check')) as Checkbox;
      const tosField = tosCheck.querySelector('[data-testid="consent-tos-field"]');
      const tosRequireCheck = tosCheck.querySelector('[data-testid="consent-tos-require-check"]');
      const tosStateCheck = tosCheck.querySelector('[data-testid="consent-tos-state-check"]');
      const mailCheck = await getByTestId(control, 'consent-mail-check');
      const sdtaCheck = await getByTestId(control, 'consent-sdta-check');

      expect(tosCheck).to.have.attribute('readonly');
      expect(tosField).to.have.attribute('readonly');
      expect(tosRequireCheck).to.have.attribute('readonly');
      expect(tosStateCheck).to.have.attribute('readonly');
      expect(mailCheck).to.have.attribute('readonly');
      expect(sdtaCheck).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes consent', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form readonlycontrols="consent"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const tosCheck = (await getByTestId(control, 'consent-tos-check')) as Checkbox;
      const tosField = tosCheck.querySelector('[data-testid="consent-tos-field"]');
      const tosRequireCheck = tosCheck.querySelector('[data-testid="consent-tos-require-check"]');
      const tosStateCheck = tosCheck.querySelector('[data-testid="consent-tos-state-check"]');
      const mailCheck = await getByTestId(control, 'consent-mail-check');
      const sdtaCheck = await getByTestId(control, 'consent-sdta-check');

      expect(tosCheck).to.have.attribute('readonly');
      expect(tosField).to.have.attribute('readonly');
      expect(tosRequireCheck).to.have.attribute('readonly');
      expect(tosStateCheck).to.have.attribute('readonly');
      expect(mailCheck).to.have.attribute('readonly');
      expect(sdtaCheck).to.have.attribute('readonly');
    });

    it('writes to tos_checkbox_settings.usage property of parsed form.json value on change (general, true)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-tos-check')) as Checkbox;

      check.checked = true;
      check.dispatchEvent(new CheckboxChangeEvent(true));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('tos_checkbox_settings.usage', 'required');
    });

    it('writes to tos_checkbox_settings.usage property of parsed form.json value on change (general, false)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-tos-check')) as Checkbox;

      check.checked = false;
      check.dispatchEvent(new CheckboxChangeEvent(false));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('tos_checkbox_settings.usage', 'none');
    });

    it('writes to tos_checkbox_settings.usage property of parsed form.json value on change (require, true)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-tos-require-check')) as Checkbox;

      check.checked = true;
      check.dispatchEvent(new CheckboxChangeEvent(true));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('tos_checkbox_settings.usage', 'required');
    });

    it('writes to tos_checkbox_settings.usage property of parsed form.json value on change (require, false)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-tos-require-check')) as Checkbox;

      check.checked = false;
      check.dispatchEvent(new CheckboxChangeEvent(false));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('tos_checkbox_settings.usage', 'optional');
    });

    it('writes to tos_checkbox_settings.url property of parsed form.json value on change', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-tos-check')) as Checkbox;
      const field = check.querySelector('[data-testid="consent-tos-field"]') as TextFieldElement;

      field.value = 'Test';
      field.dispatchEvent(new CustomEvent('input'));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('tos_checkbox_settings.url', 'Test');
    });

    it('writes to tos_checkbox_settings.initial_state property of parsed form.json value on change (true)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-tos-state-check')) as Checkbox;

      check.checked = true;
      check.dispatchEvent(new CheckboxChangeEvent(true));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('tos_checkbox_settings.initial_state', 'checked');
    });

    it('writes to tos_checkbox_settings.initial_state property of parsed form.json value on change (false)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-tos-state-check')) as Checkbox;

      check.checked = false;
      check.dispatchEvent(new CheckboxChangeEvent(false));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('tos_checkbox_settings.initial_state', 'unchecked');
    });

    it('writes to newsletter_subscribe.usage property of parsed form.json value on change (true)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-mail-check')) as Checkbox;

      check.checked = true;
      check.dispatchEvent(new CheckboxChangeEvent(true));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('newsletter_subscribe.usage', 'required');
    });

    it('writes to newsletter_subscribe.usage property of parsed form.json value on change (false)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-mail-check')) as Checkbox;

      check.checked = false;
      check.dispatchEvent(new CheckboxChangeEvent(false));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('newsletter_subscribe.usage', 'none');
    });

    it('writes to eu_secure_data_transfer_consent.usage property of parsed form.json value on change (true)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-sdta-check')) as Checkbox;

      check.checked = true;
      check.dispatchEvent(new CheckboxChangeEvent(true));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('eu_secure_data_transfer_consent.usage', 'required');
    });

    it('writes to eu_secure_data_transfer_consent.usage property of parsed form.json value on change (false)', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-sdta-check')) as Checkbox;

      check.checked = false;
      check.dispatchEvent(new CheckboxChangeEvent(false));

      const json = JSON.parse(element.form.json as string);
      expect(json).to.have.nested.property('eu_secure_data_transfer_consent.usage', 'none');
    });

    it('renders translatable tos checkbox label and explainer', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-tos-check')) as Checkbox;
      const label = check.querySelector(`foxy-i18n[key="display_tos_link"]`);
      const explainer = check.querySelector(`foxy-i18n[key="display_tos_link_explainer"]`);

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      expect(explainer).to.exist;
      expect(explainer).to.have.attribute('lang', 'es');
      expect(explainer).to.have.attribute('ns', 'foo');
    });

    it('renders translatable "require TOS" checkbox label', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-tos-require-check')) as Checkbox;
      const label = check.querySelector(`foxy-i18n[key="require_consent"]`);

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders translatable "checked by default" checkbox label', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-tos-state-check')) as Checkbox;
      const label = check.querySelector(`foxy-i18n[key="checked_by_default"]`);

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('renders translatable newsletter checkbox label and explainer', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-mail-check')) as Checkbox;
      const label = check.querySelector(`foxy-i18n[key="newsletter_subscribe"]`);
      const explainer = check.querySelector(`foxy-i18n[key="newsletter_subscribe_explainer"]`);

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      expect(explainer).to.exist;
      expect(explainer).to.have.attribute('lang', 'es');
      expect(explainer).to.have.attribute('ns', 'foo');
    });

    it('renders translatable EU SDTA checkbox label and explainer', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'consent')) as HTMLElement;
      const check = (await getByTestId(control, 'consent-sdta-check')) as Checkbox;
      const label = check.querySelector(`foxy-i18n[key="display_sdta"]`);
      const explainer = check.querySelector(`foxy-i18n[key="display_sdta_explainer"]`);

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      expect(explainer).to.exist;
      expect(explainer).to.have.attribute('lang', 'es');
      expect(explainer).to.have.attribute('ns', 'foo');
    });
  });

  describe('fields', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'fields')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'fields')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes fields', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form hiddencontrols="fields"></foxy-template-config-form>`
      );

      expect(await getByTestId(element, 'fields')).to.not.exist;
    });

    it('renders "fields:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'fields:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "fields:before" slot with template "fields:before" if available', async () => {
      const type = 'fields:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "fields:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'fields:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "fields:after" slot with template "fields:after" if available', async () => {
      const type = 'fields:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a group label with i18n key field_plural', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'fields')) as HTMLElement;
      const label = await getByKey(control, 'field_plural');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    const options = {
      cart_controls: ['enabled', 'disabled'],
      coupon_entry: ['enabled', 'disabled'],
      billing_first_name: ['default', 'optional', 'required', 'hidden'],
      billing_last_name: ['default', 'optional', 'required', 'hidden'],
      billing_company: ['default', 'optional', 'required', 'hidden'],
      billing_tax_id: ['default', 'optional', 'required', 'hidden'],
      billing_phone: ['default', 'optional', 'required', 'hidden'],
      billing_address1: ['default', 'optional', 'required', 'hidden'],
      billing_address2: ['default', 'optional', 'required', 'hidden'],
      billing_city: ['default', 'optional', 'required', 'hidden'],
      billing_region: ['default', 'optional', 'required', 'hidden'],
      billing_postal_code: ['default', 'optional', 'required', 'hidden'],
      billing_country: ['default', 'optional', 'required', 'hidden'],
    };

    Object.entries(options).map(([property, values]) => {
      const key = property.replace('billing_', '');

      it(`renders a label with i18n key ${key}`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);

        element.lang = 'es';
        element.ns = 'foo';

        const control = (await getByTestId(element, 'fields')) as HTMLElement;
        const label = control.querySelector(`label foxy-i18n[key="${key}"]`) as I18n;

        expect(label).to.exist;
        expect(label).to.have.attribute('lang', 'es');
        expect(label).to.have.attribute('ns', 'foo');
      });

      it(`renders a select for ${property} field`, async () => {
        const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
        const element = await fixture<TemplateConfigForm>(layout);
        const control = (await getByTestId(element, 'fields')) as HTMLElement;
        const select = (await getByTestId(control, `fields-${property}`)) as HTMLSelectElement;
        const options = Array.from(select.options);

        values.forEach(value => {
          const option = options.find(o => o.value === value);
          expect(option, `must have an option for "${value}" value`).to.exist;
        });
      });

      values.forEach(value => {
        it(`reflects a value of custom_checkout_field_requirements.${property} (${value})`, async () => {
          const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
          const element = await fixture<TemplateConfigForm>(layout);
          const data = await getTestData<Data>('./hapi/template_configs/0');
          const json = JSON.parse(data.json);

          json.custom_checkout_field_requirements[property] = value;
          data.json = JSON.stringify(json);
          element.data = data;

          const control = (await getByTestId(element, 'fields')) as HTMLElement;
          const select = (await getByTestId(control, `fields-${property}`)) as HTMLSelectElement;
          const option = select.options[select.selectedIndex];

          expect(option).to.have.attribute('value', value);
        });

        it(`writes to custom_checkout_field_requirements.${property} on change (${value})`, async () => {
          const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
          const element = await fixture<TemplateConfigForm>(layout);
          const control = (await getByTestId(element, 'fields')) as HTMLElement;
          const select = (await getByTestId(control, `fields-${property}`)) as HTMLSelectElement;
          const option = Array.from(select.options).find(o => o.value === value)!;

          option.selected = true;
          select.dispatchEvent(new Event('change'));

          const json = JSON.parse(element.form.json as string);
          const path = `custom_checkout_field_requirements.${property}`;

          expect(json).to.have.nested.property(path, value);
        });
      });
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'fields')) as HTMLElement;
      const selects = control.querySelectorAll('select');

      selects.forEach(select => expect(select).to.not.have.attribute('disabled'));
    });

    it('is disabled when the form is disabled', async () => {
      const layout = html`<foxy-template-config-form disabled></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'fields')) as HTMLElement;
      const selects = control.querySelectorAll('select');

      selects.forEach(select => expect(select).to.have.attribute('disabled'));
    });

    it('is disabled when disabledcontrols include fields', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form disabledcontrols="fields"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'fields')) as HTMLElement;
      const selects = control.querySelectorAll('select');

      selects.forEach(select => expect(select).to.have.attribute('disabled'));
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'fields')) as HTMLElement;
      const selects = control.querySelectorAll('select');

      selects.forEach(select => expect(select).to.not.have.attribute('readonly'));
    });

    it('is readonly when the form is readonly', async () => {
      const layout = html`<foxy-template-config-form readonly></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'fields')) as HTMLElement;
      const selects = control.querySelectorAll('select');

      selects.forEach(select => expect(select).to.have.attribute('readonly'));
    });

    it('is readonly when readonlycontrols include fields', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form readonlycontrols="fields"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'fields')) as HTMLElement;
      const selects = control.querySelectorAll('select');

      selects.forEach(select => expect(select).to.have.attribute('readonly'));
    });
  });

  describe('google-analytics', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'google-analytics')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'google-analytics')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes google-analytics', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form hiddencontrols="google-analytics"></foxy-template-config-form>
      `);

      expect(await getByTestId(element, 'google-analytics')).to.not.exist;
    });

    it('renders "google-analytics:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'google-analytics:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "google-analytics:before" slot with template "google-analytics:before" if available', async () => {
      const type = 'google-analytics:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "google-analytics:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'google-analytics:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "google-analytics:after" slot with template "google-analytics:after" if available', async () => {
      const type = 'google-analytics:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a field labelled with i18n key ga_account_id', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const field = await getByTestId(control, 'google-analytics-field');

      expect(field).to.have.attribute('label', 'ga_account_id');
    });

    it('renders a field explained with i18n key ga_account_id_explainer', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const field = await getByTestId(control, 'google-analytics-field');

      expect(field).to.have.attribute('helper-text', 'ga_account_id_explainer');
    });

    it('reflects the value of analytics_config.google_analytics.account_id from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.analytics_config.google_analytics.account_id = '123456';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const field = await getByTestId(control, 'google-analytics-field');

      expect(field).to.have.property('value', '123456');
    });

    it('reflects the value of analytics_config.google_analytics.include_on_site from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.analytics_config.google_analytics.include_on_site = true;
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const check = await getByTestId(control, 'google-analytics-check');

      expect(check).to.have.attribute('checked');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const field = await getByTestId(control, 'google-analytics-field');
      const check = await getByTestId(control, 'google-analytics-check');

      expect(field).to.not.have.attribute('disabled');
      expect(check).to.not.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-template-config-form disabled></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const field = await getByTestId(control, 'google-analytics-field');
      const check = await getByTestId(control, 'google-analytics-check');

      expect(field).to.have.attribute('disabled');
      expect(check).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes google-analytics', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form disabledcontrols="google-analytics"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const field = await getByTestId(control, 'google-analytics-field');
      const check = await getByTestId(control, 'google-analytics-check');

      expect(field).to.have.attribute('disabled');
      expect(check).to.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const field = await getByTestId(control, 'google-analytics-field');
      const check = await getByTestId(control, 'google-analytics-check');

      expect(field).to.not.have.attribute('readonly');
      expect(check).to.not.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-template-config-form readonly></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const field = await getByTestId(control, 'google-analytics-field');
      const check = await getByTestId(control, 'google-analytics-check');

      expect(field).to.have.attribute('readonly');
      expect(check).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes google-analytics', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form readonlycontrols="google-analytics"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const field = await getByTestId(control, 'google-analytics-field');
      const check = await getByTestId(control, 'google-analytics-check');

      expect(field).to.have.attribute('readonly');
      expect(check).to.have.attribute('readonly');
    });

    it('writes to analytics_config.google_analytics.account_id property of parsed form.json value on change', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const field = (await getByTestId(control, 'google-analytics-field')) as TextFieldElement;

      field.value = '123456';
      field.dispatchEvent(new CustomEvent('input'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;

      expect(json).to.have.nested.property(
        'analytics_config.google_analytics.account_id',
        '123456'
      );

      expect(json).to.have.nested.property('analytics_config.google_analytics.usage', 'required');
    });

    it('writes to analytics_config.google_analytics.include_on_site property of parsed form.json value on change', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const check = (await getByTestId(control, 'google-analytics-check')) as Checkbox;

      check.checked = true;
      check.dispatchEvent(new CheckboxChangeEvent(true));

      expect(JSON.parse(element.form.json as string)).to.have.nested.property(
        'analytics_config.google_analytics.include_on_site',
        true
      );
    });

    it('switches analytics_config.google_analytics.usage property of parsed form.json to none when empty', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      const data = await getTestData<Data>('./hapi/template_configs/0');
      let json = JSON.parse(data.json) as TemplateConfigJSON;

      json.analytics_config.google_analytics.account_id = '123456';
      json.analytics_config.google_analytics.usage = 'required';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const field = (await getByTestId(control, 'google-analytics-field')) as TextFieldElement;

      field.value = '';
      field.dispatchEvent(new CustomEvent('input'));

      json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.nested.property('analytics_config.google_analytics.account_id', '');
      expect(json).to.have.nested.property('analytics_config.google_analytics.usage', 'none');
    });

    it('renders translatable checkbox label and explainer', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'google-analytics')) as HTMLElement;
      const check = (await getByTestId(control, 'google-analytics-check')) as Checkbox;
      const label = check.querySelector(`foxy-i18n[key="ga_include_on_site"]`);
      const explainer = check.querySelector(`foxy-i18n[key="ga_include_on_site_explainer"]`);

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      expect(explainer).to.exist;
      expect(explainer).to.have.attribute('lang', 'es');
      expect(explainer).to.have.attribute('ns', 'foo');
    });
  });

  describe('segment-io', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'segment-io')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'segment-io')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes segment-io', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form hiddencontrols="segment-io"></foxy-template-config-form>`
      );

      expect(await getByTestId(element, 'segment-io')).to.not.exist;
    });

    it('renders "segment-io:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'segment-io:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "segment-io:before" slot with template "segment-io:before" if available', async () => {
      const type = 'segment-io:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "segment-io:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'segment-io:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "segment-io:after" slot with template "segment-io:after" if available', async () => {
      const type = 'segment-io:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a label with i18n key sio_account_id', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'segment-io')) as HTMLElement;
      const field = await getByTestId(control, 'segment-io-field');

      expect(field).to.have.attribute('label', 'sio_account_id');
    });

    it('renders an explainer with i18n key sio_account_id_explainer', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'segment-io')) as HTMLElement;
      const field = await getByTestId(control, 'segment-io-field');

      expect(field).to.have.attribute('helper-text', 'sio_account_id_explainer');
    });

    it('reflects the value of analytics_config.segment_io.account_id from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.analytics_config.segment_io.account_id = '123456';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'segment-io')) as HTMLElement;
      const field = await getByTestId(control, 'segment-io-field');

      expect(field).to.have.property('value', '123456');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'segment-io')) as HTMLElement;
      const field = await getByTestId(control, 'segment-io-field');

      expect(field).to.not.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-template-config-form disabled></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'segment-io')) as HTMLElement;
      const field = await getByTestId(control, 'segment-io-field');

      expect(field).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes segment-io', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form disabledcontrols="segment-io"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'segment-io')) as HTMLElement;
      const field = await getByTestId(control, 'segment-io-field');

      expect(field).to.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'segment-io')) as HTMLElement;
      const field = await getByTestId(control, 'segment-io-field');

      expect(field).to.not.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-template-config-form readonly></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'segment-io')) as HTMLElement;
      const field = await getByTestId(control, 'segment-io-field');

      expect(field).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes segment-io', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form readonlycontrols="segment-io"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'segment-io')) as HTMLElement;
      const field = await getByTestId(control, 'segment-io-field');

      expect(field).to.have.attribute('readonly');
    });

    it('writes to analytics_config.segment_io.account_id property of parsed form.json value on change', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'segment-io')) as HTMLElement;
      const field = (await getByTestId(control, 'segment-io-field')) as TextFieldElement;

      field.value = '123456';
      field.dispatchEvent(new CustomEvent('input'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.nested.property('analytics_config.segment_io.account_id', '123456');
      expect(json).to.have.nested.property('analytics_config.segment_io.usage', 'required');
    });

    it('switches analytics_config.segment_io.usage property of parsed form.json to none when empty', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      const data = await getTestData<Data>('./hapi/template_configs/0');
      let json = JSON.parse(data.json) as TemplateConfigJSON;

      json.analytics_config.segment_io.account_id = '123456';
      json.analytics_config.segment_io.usage = 'required';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'segment-io')) as HTMLElement;
      const field = (await getByTestId(control, 'segment-io-field')) as TextFieldElement;

      field.value = '';
      field.dispatchEvent(new CustomEvent('input'));

      json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.nested.property('analytics_config.segment_io.account_id', '');
      expect(json).to.have.nested.property('analytics_config.segment_io.usage', 'none');
    });
  });

  describe('troubleshooting', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'troubleshooting')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'troubleshooting')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes troubleshooting', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form hiddencontrols="troubleshooting"></foxy-template-config-form>
      `);

      expect(await getByTestId(element, 'troubleshooting')).to.not.exist;
    });

    it('renders "troubleshooting:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'troubleshooting:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "troubleshooting:before" slot with template "troubleshooting:before" if available', async () => {
      const type = 'troubleshooting:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "troubleshooting:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'troubleshooting:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "troubleshooting:after" slot with template "troubleshooting:after" if available', async () => {
      const type = 'troubleshooting:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a label with i18n key troubleshooting', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'troubleshooting')) as HTMLElement;
      const label = await getByKey(control, 'troubleshooting');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');
    });

    it('reflects the value of debug.usage from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.debug.usage = 'required';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'troubleshooting')) as HTMLElement;
      const check = await getByTestId(control, 'troubleshooting-check');

      expect(check).to.have.attribute('checked');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'troubleshooting')) as HTMLElement;
      const check = await getByTestId(control, 'troubleshooting-check');

      expect(check).to.not.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-template-config-form disabled></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'troubleshooting')) as HTMLElement;
      const check = await getByTestId(control, 'troubleshooting-check');

      expect(check).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes troubleshooting', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form disabledcontrols="troubleshooting"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'troubleshooting')) as HTMLElement;
      const check = await getByTestId(control, 'troubleshooting-check');

      expect(check).to.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'troubleshooting')) as HTMLElement;
      const check = await getByTestId(control, 'troubleshooting-check');

      expect(check).to.not.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-template-config-form readonly></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'troubleshooting')) as HTMLElement;
      const check = await getByTestId(control, 'troubleshooting-check');

      expect(check).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes troubleshooting', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form readonlycontrols="troubleshooting"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'troubleshooting')) as HTMLElement;
      const check = await getByTestId(control, 'troubleshooting-check');

      expect(check).to.have.attribute('readonly');
    });

    it('writes to debug.usage property of parsed form.json value on change', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'troubleshooting')) as HTMLElement;
      const check = (await getByTestId(control, 'troubleshooting-check')) as Checkbox;

      check.checked = true;
      check.dispatchEvent(new CheckboxChangeEvent(true));

      expect(JSON.parse(element.form.json as string)).to.have.nested.property(
        'debug.usage',
        'required'
      );
    });

    it('renders translatable checkbox label and explainer', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);

      element.lang = 'es';
      element.ns = 'foo';

      const control = (await getByTestId(element, 'troubleshooting')) as HTMLElement;
      const check = (await getByTestId(control, 'troubleshooting-check')) as Checkbox;
      const label = check.querySelector(`foxy-i18n[key="troubleshooting_debug"]`);
      const explainer = check.querySelector(`foxy-i18n[key="troubleshooting_debug_explainer"]`);

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'foo');

      expect(explainer).to.exist;
      expect(explainer).to.have.attribute('lang', 'es');
      expect(explainer).to.have.attribute('ns', 'foo');
    });
  });

  describe('custom-config', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'custom-config')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'custom-config')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes custom-config', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form hiddencontrols="custom-config"></foxy-template-config-form>`
      );

      expect(await getByTestId(element, 'custom-config')).to.not.exist;
    });

    it('renders "custom-config:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'custom-config:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "custom-config:before" slot with template "custom-config:before" if available', async () => {
      const type = 'custom-config:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "custom-config:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'custom-config:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "custom-config:after" slot with template "custom-config:after" if available', async () => {
      const type = 'custom-config:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a label with i18n key custom_config', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-config')) as HTMLElement;
      const field = await getByTestId(control, 'custom-config-field');

      expect(field).to.have.attribute('label', 'custom_config');
    });

    it('renders a helper text with i18n key custom_config_helper_text', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-config')) as HTMLElement;
      const field = await getByTestId(control, 'custom-config-field');

      expect(field).to.have.attribute('helper-text', 'custom_config_helper_text');
    });

    it('reflects the value of custom_config from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.custom_config = { foo: 'bar' };
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'custom-config')) as HTMLElement;
      const field = await getByTestId(control, 'custom-config-field');

      expect(field).to.have.property('value', '{\n  "foo": "bar"\n}');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-config')) as HTMLElement;
      const field = await getByTestId(control, 'custom-config-field');

      expect(field).to.not.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-template-config-form disabled></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-config')) as HTMLElement;
      const field = await getByTestId(control, 'custom-config-field');

      expect(field).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes custom-config', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form disabledcontrols="custom-config"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'custom-config')) as HTMLElement;
      const field = await getByTestId(control, 'custom-config-field');

      expect(field).to.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-config')) as HTMLElement;
      const field = await getByTestId(control, 'custom-config-field');

      expect(field).to.not.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-template-config-form readonly></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-config')) as HTMLElement;
      const field = await getByTestId(control, 'custom-config-field');

      expect(field).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes custom-config', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form readonlycontrols="custom-config"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'custom-config')) as HTMLElement;
      const field = await getByTestId(control, 'custom-config-field');

      expect(field).to.have.attribute('readonly');
    });

    it('writes to custom_config property of parsed form.json value on change', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-config')) as HTMLElement;
      const field = (await getByTestId(control, 'custom-config-field')) as TextAreaElement;

      field.value = '{ "foo": "bar" }';
      field.dispatchEvent(new CustomEvent('input'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.deep.property('custom_config', { foo: 'bar' });
    });
  });

  describe('header', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'header')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'header')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes header', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form hiddencontrols="header"></foxy-template-config-form>`
      );

      expect(await getByTestId(element, 'header')).to.not.exist;
    });

    it('renders "header:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'header:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "header:before" slot with template "header:before" if available', async () => {
      const type = 'header:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "header:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'header:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "header:after" slot with template "header:after" if available', async () => {
      const type = 'header:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a label with i18n key custom_header', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'header')) as HTMLElement;
      const field = await getByTestId(control, 'header-field');

      expect(field).to.have.attribute('label', 'custom_header');
    });

    it('renders a helper text with i18n key custom_header_helper_text', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'header')) as HTMLElement;
      const field = await getByTestId(control, 'header-field');

      expect(field).to.have.attribute('helper-text', 'custom_header_helper_text');
    });

    it('reflects the value of custom_script_values.header from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.custom_script_values.header = 'Test';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'header')) as HTMLElement;
      const field = await getByTestId(control, 'header-field');

      expect(field).to.have.property('value', 'Test');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'header')) as HTMLElement;
      const field = await getByTestId(control, 'header-field');

      expect(field).to.not.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-template-config-form disabled></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'header')) as HTMLElement;
      const field = await getByTestId(control, 'header-field');

      expect(field).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes header', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form disabledcontrols="header"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'header')) as HTMLElement;
      const field = await getByTestId(control, 'header-field');

      expect(field).to.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'header')) as HTMLElement;
      const field = await getByTestId(control, 'header-field');

      expect(field).to.not.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-template-config-form readonly></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'header')) as HTMLElement;
      const field = await getByTestId(control, 'header-field');

      expect(field).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes header', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form readonlycontrols="header"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'header')) as HTMLElement;
      const field = await getByTestId(control, 'header-field');

      expect(field).to.have.attribute('readonly');
    });

    it('writes to custom_script_values.header property of parsed form.json value on change', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'header')) as HTMLElement;
      const field = (await getByTestId(control, 'header-field')) as TextAreaElement;

      field.value = 'Test';
      field.dispatchEvent(new CustomEvent('input'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.nested.property('custom_script_values.header', 'Test');
    });
  });

  describe('custom-fields', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'custom-fields')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'custom-fields')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes custom-fields', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form hiddencontrols="custom-fields"></foxy-template-config-form>`
      );

      expect(await getByTestId(element, 'custom-fields')).to.not.exist;
    });

    it('renders "custom-fields:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'custom-fields:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "custom-fields:before" slot with template "custom-fields:before" if available', async () => {
      const type = 'custom-fields:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "custom-fields:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'custom-fields:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "custom-fields:after" slot with template "custom-fields:after" if available', async () => {
      const type = 'custom-fields:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a label with i18n key custom_fields', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-fields')) as HTMLElement;
      const field = await getByTestId(control, 'custom-fields-field');

      expect(field).to.have.attribute('label', 'custom_fields');
    });

    it('renders a helper text with i18n key custom_fields_helper_text', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-fields')) as HTMLElement;
      const field = await getByTestId(control, 'custom-fields-field');

      expect(field).to.have.attribute('helper-text', 'custom_fields_helper_text');
    });

    it('reflects the value of custom_script_values.checkout_fields from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.custom_script_values.checkout_fields = 'Test';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'custom-fields')) as HTMLElement;
      const field = await getByTestId(control, 'custom-fields-field');

      expect(field).to.have.property('value', 'Test');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-fields')) as HTMLElement;
      const field = await getByTestId(control, 'custom-fields-field');

      expect(field).to.not.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-template-config-form disabled></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-fields')) as HTMLElement;
      const field = await getByTestId(control, 'custom-fields-field');

      expect(field).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes custom-fields', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form disabledcontrols="custom-fields"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'custom-fields')) as HTMLElement;
      const field = await getByTestId(control, 'custom-fields-field');

      expect(field).to.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-fields')) as HTMLElement;
      const field = await getByTestId(control, 'custom-fields-field');

      expect(field).to.not.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-template-config-form readonly></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-fields')) as HTMLElement;
      const field = await getByTestId(control, 'custom-fields-field');

      expect(field).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes custom-fields', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form readonlycontrols="custom-fields"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'custom-fields')) as HTMLElement;
      const field = await getByTestId(control, 'custom-fields-field');

      expect(field).to.have.attribute('readonly');
    });

    it('writes to custom_script_values.checkout_fields property of parsed form.json value on change', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'custom-fields')) as HTMLElement;
      const field = (await getByTestId(control, 'custom-fields-field')) as TextAreaElement;

      field.value = 'Test';
      field.dispatchEvent(new CustomEvent('input'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.nested.property('custom_script_values.checkout_fields', 'Test');
    });
  });

  describe('footer', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'footer')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-config-form hidden></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      expect(await getByTestId(element, 'footer')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes footer', async () => {
      const element = await fixture<TemplateConfigForm>(
        html`<foxy-template-config-form hiddencontrols="footer"></foxy-template-config-form>`
      );

      expect(await getByTestId(element, 'footer')).to.not.exist;
    });

    it('renders "footer:before" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'footer:before');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "footer:before" slot with template "footer:before" if available', async () => {
      const type = 'footer:before';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "footer:after" slot by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const slot = await getByName(element, 'footer:after');

      expect(slot).to.be.instanceOf(HTMLSlotElement);
    });

    it('replaces "footer:after" slot with template "footer:after" if available', async () => {
      const type = 'footer:after';
      const value = `<p>Value of the "${type}" template.</p>`;
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form>
          <template slot=${type}>${unsafeHTML(value)}</template>
        </foxy-template-config-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, type);
      const sandbox = (await getByTestId<InternalSandbox>(element, type))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders a label with i18n key custom_footer', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'footer')) as HTMLElement;
      const field = await getByTestId(control, 'footer-field');

      expect(field).to.have.attribute('label', 'custom_footer');
    });

    it('renders a helper text with i18n key custom_footer_helper_text', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'footer')) as HTMLElement;
      const field = await getByTestId(control, 'footer-field');

      expect(field).to.have.attribute('helper-text', 'custom_footer_helper_text');
    });

    it('reflects the value of custom_script_values.footer from parsed form.json', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const data = await getTestData<Data>('./hapi/template_configs/0');
      const json = JSON.parse(data.json) as TemplateConfigJSON;

      element.data = data;
      json.custom_script_values.footer = 'Test';
      element.edit({ json: JSON.stringify(json) });

      const control = (await getByTestId(element, 'footer')) as HTMLElement;
      const field = await getByTestId(control, 'footer-field');

      expect(field).to.have.property('value', 'Test');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'footer')) as HTMLElement;
      const field = await getByTestId(control, 'footer-field');

      expect(field).to.not.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-template-config-form disabled></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'footer')) as HTMLElement;
      const field = await getByTestId(control, 'footer-field');

      expect(field).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes footer', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form disabledcontrols="footer"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'footer')) as HTMLElement;
      const field = await getByTestId(control, 'footer-field');

      expect(field).to.have.attribute('disabled');
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'footer')) as HTMLElement;
      const field = await getByTestId(control, 'footer-field');

      expect(field).to.not.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-template-config-form readonly></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'footer')) as HTMLElement;
      const field = await getByTestId(control, 'footer-field');

      expect(field).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes footer', async () => {
      const element = await fixture<TemplateConfigForm>(html`
        <foxy-template-config-form readonlycontrols="footer"></foxy-template-config-form>
      `);

      const control = (await getByTestId(element, 'footer')) as HTMLElement;
      const field = await getByTestId(control, 'footer-field');

      expect(field).to.have.attribute('readonly');
    });

    it('writes to custom_script_values.footer property of parsed form.json value on change', async () => {
      const layout = html`<foxy-template-config-form></foxy-template-config-form>`;
      const element = await fixture<TemplateConfigForm>(layout);
      const control = (await getByTestId(element, 'footer')) as HTMLElement;
      const field = (await getByTestId(control, 'footer-field')) as TextAreaElement;

      field.value = 'Test';
      field.dispatchEvent(new CustomEvent('input'));

      const json = JSON.parse(element.form.json as string) as TemplateConfigJSON;
      expect(json).to.have.nested.property('custom_script_values.footer', 'Test');
    });
  });
});
