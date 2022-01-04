import './index';

import { Data, TemplateConfigJSON } from './types';
import { expect, fixture, html } from '@open-wc/testing';

import { Choice } from '../../private';
import { ChoiceChangeEvent } from '../../private/events';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { TemplateConfigForm } from './TemplateConfigForm';
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
});
