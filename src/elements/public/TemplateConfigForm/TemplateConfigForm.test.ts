import './index';

import { Data, TemplateConfigJSON } from './types';
import { expect, fixture, html } from '@open-wc/testing';

import { Choice } from '../../private';
import { ChoiceChangeEvent } from '../../private/events';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { TemplateConfigForm } from './TemplateConfigForm';
import { TextAreaElement } from '@vaadin/vaadin-text-field/vaadin-text-area';
import { TextFieldElement } from '@vaadin/vaadin-text-field/vaadin-text-field';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
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
