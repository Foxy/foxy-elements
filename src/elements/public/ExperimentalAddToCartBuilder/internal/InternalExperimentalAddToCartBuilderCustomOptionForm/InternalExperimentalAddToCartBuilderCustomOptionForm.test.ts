import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import './index';

import { InternalExperimentalAddToCartBuilderCustomOptionForm as Form } from './InternalExperimentalAddToCartBuilderCustomOptionForm';
import { expect, fixture, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../../../server/index';
import { html } from 'lit-html';

async function waitForIdle(element: Form) {
  await waitUntil(
    () => {
      const loaders = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...loaders].every(loader => loader.in('idle'));
    },
    '',
    { timeout: 5000 }
  );
}

describe('ExperimentalAddToCartBuilder', () => {
  describe('InternalExperimentalAddToCartBuilderCustomOptionForm', () => {
    it('imports dependencies', () => {
      expect(customElements.get('foxy-internal-resource-picker-control')).to.exist;
      expect(customElements.get('foxy-internal-summary-control')).to.exist;
      expect(customElements.get('foxy-internal-switch-control')).to.exist;
      expect(customElements.get('foxy-internal-number-control')).to.exist;
      expect(customElements.get('foxy-internal-text-control')).to.exist;
      expect(customElements.get('foxy-internal-form')).to.exist;
      expect(customElements.get('foxy-nucleon')).to.exist;
    });

    it('defines itself as foxy-internal-experimental-add-to-cart-builder-custom-option-form', () => {
      const localName = 'foxy-internal-experimental-add-to-cart-builder-custom-option-form';
      expect(customElements.get(localName)).to.equal(Form);
    });

    it('extends foxy-internal-form', () => {
      expect(new Form()).to.be.instanceOf(customElements.get('foxy-internal-form'));
    });

    it('has a reactive property "defaultWeightUnit" that defaults to null', () => {
      expect(new Form()).to.have.property('defaultWeightUnit', null);
      expect(Form).to.have.deep.nested.property('properties.defaultWeightUnit', {
        attribute: 'default-weight-unit',
      });
    });

    it('has a reactive property "existingOptions" that defaults to an empty array', () => {
      expect(new Form()).to.have.deep.property('existingOptions', []);
      expect(Form).to.have.deep.nested.property('properties.existingOptions', {
        attribute: 'existing-options',
        type: Array,
      });
    });

    it('has a reactive property "itemCategories" that defaults to null', () => {
      expect(new Form()).to.have.property('itemCategories', null);
      expect(Form).to.have.deep.nested.property('properties.itemCategories', {
        attribute: 'item-categories',
      });
    });

    it('has a reactive property "currencyCode" that defaults to null', () => {
      expect(new Form()).to.have.property('currencyCode', null);
      expect(Form).to.have.deep.nested.property('properties.currencyCode', {
        attribute: 'currency-code',
      });
    });

    it('makes configurable value toggle readonly if name matches an existing option', () => {
      const form = new Form();
      expect(form.readonlySelector.matches('basics-group:value-configurable', true)).to.be.false;
      form.existingOptions = [{ name: 'foo', value: 'bar' }];
      form.edit({ name: 'foo' });
      expect(form.readonlySelector.matches('basics-group:value-configurable', true)).to.be.true;
    });

    it('hides price, weight, code and category groups if value is configurable', () => {
      const form = new Form();

      expect(form.hiddenSelector.matches('price-group', true)).to.be.false;
      expect(form.hiddenSelector.matches('weight-group', true)).to.be.false;
      expect(form.hiddenSelector.matches('code-group', true)).to.be.false;
      expect(form.hiddenSelector.matches('category-group', true)).to.be.false;

      form.edit({ value_configurable: true });

      expect(form.hiddenSelector.matches('price-group', true)).to.be.true;
      expect(form.hiddenSelector.matches('weight-group', true)).to.be.true;
      expect(form.hiddenSelector.matches('code-group', true)).to.be.true;
      expect(form.hiddenSelector.matches('category-group', true)).to.be.true;
    });

    it('hides Required switch if value is not configurable', () => {
      const form = new Form();
      expect(form.hiddenSelector.matches('basics-group:required', true)).to.be.true;

      form.edit({ value_configurable: true });
      expect(form.hiddenSelector.matches('basics-group:required', true)).to.be.false;
    });

    it('always hides timestamps', () => {
      const form = new Form();
      expect(form.hiddenSelector.matches('timestamps', true)).to.be.true;
    });

    it('renders a summary control for the basics group', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-form></foxy-internal-experimental-add-to-cart-builder-custom-option-form>`
      );

      const control = form.renderRoot.querySelector(
        'foxy-internal-summary-control[infer="basics-group"]'
      );

      expect(control).to.exist;
    });

    it('renders text control for option name inside of the basics group', async () => {
      const form = await fixture<Form>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-custom-option-form
            .existingOptions=${[
              { name: 'foo', value: 'bar' },
              { name: 'baz', value: 'qux' },
              { name: 'quux', value: 'corge' },
            ]}
          >
          </foxy-internal-experimental-add-to-cart-builder-custom-option-form>
        `
      );

      const control = form.renderRoot.querySelector(
        '[infer="basics-group"] foxy-internal-text-control[infer="name"]'
      );

      expect(control).to.exist;

      control?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(form.form.name).to.equal('quux');

      control?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(form.form.name).to.equal('foo');
    });

    it('renders text control for option value inside of the basics group if value is not configurable', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-form></foxy-internal-experimental-add-to-cart-builder-custom-option-form>`
      );

      const control = form.renderRoot.querySelector(
        '[infer="basics-group"] foxy-internal-text-control[infer="value"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'value');
    });

    it('renders text control for option default value inside of the basics group if value is configurable', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-form></foxy-internal-experimental-add-to-cart-builder-custom-option-form>`
      );

      form.edit({ value_configurable: true });
      await form.requestUpdate();
      const control = form.renderRoot.querySelector(
        '[infer="basics-group"] foxy-internal-text-control[infer="default-value"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'value');
    });

    it('renders switch control for configurable value toggle inside of the basics group', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-form></foxy-internal-experimental-add-to-cart-builder-custom-option-form>`
      );

      const control = form.renderRoot.querySelector(
        '[infer="basics-group"] foxy-internal-switch-control[infer="value-configurable"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('helper-text-as-tooltip');
      expect(control).to.have.attribute('helper-text', '');

      form.edit({ name: 'foo' });
      form.existingOptions = [{ name: 'foo', value: 'bar' }];
      await form.requestUpdate();
      expect(control).to.not.have.attribute('helper-text');
    });

    it('renders switch control for required toggle inside of the basics group', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-form></foxy-internal-experimental-add-to-cart-builder-custom-option-form>`
      );

      const control = form.renderRoot.querySelector(
        '[infer="basics-group"] foxy-internal-switch-control[infer="required"]'
      );

      expect(control).to.exist;
    });

    it('renders summary control for price group', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-form></foxy-internal-experimental-add-to-cart-builder-custom-option-form>`
      );

      const control = form.renderRoot.querySelector(
        'foxy-internal-summary-control[infer="price-group"]'
      );

      expect(control).to.exist;
    });

    it('renders number control for option price inside of the price group', async () => {
      const form = await fixture<Form>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-custom-option-form currency-code="aud">
          </foxy-internal-experimental-add-to-cart-builder-custom-option-form>
        `
      );

      const control = form.renderRoot.querySelector(
        '[infer="price-group"] foxy-internal-number-control[infer="price"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('suffix', 'aud');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('renders switch control for replace price toggle inside of the price group', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-form></foxy-internal-experimental-add-to-cart-builder-custom-option-form>`
      );

      const control = form.renderRoot.querySelector(
        '[infer="price-group"] foxy-internal-switch-control[infer="replace-price"]'
      );

      expect(control).to.exist;
    });

    it('renders summary control for weight group', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-form></foxy-internal-experimental-add-to-cart-builder-custom-option-form>`
      );

      const control = form.renderRoot.querySelector(
        'foxy-internal-summary-control[infer="weight-group"]'
      );

      expect(control).to.exist;
    });

    it('renders number control for option weight inside of the weight group', async () => {
      const router = createRouter();
      const form = await fixture<Form>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-custom-option-form
            default-weight-unit="KG"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </foxy-internal-experimental-add-to-cart-builder-custom-option-form>
        `
      );

      const control = form.renderRoot.querySelector(
        '[infer="weight-group"] foxy-internal-number-control[infer="weight"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('suffix', 'KG');
      expect(control).to.have.attribute('layout', 'summary-item');

      form.edit({ item_category_uri: 'https://demo.api/hapi/item_categories/1' });
      await form.requestUpdate();
      await waitForIdle(form);

      expect(control).to.have.attribute('suffix', 'LBS');
    });

    it('renders switch control for replace weight toggle inside of the weight group', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-form></foxy-internal-experimental-add-to-cart-builder-custom-option-form>`
      );

      const control = form.renderRoot.querySelector(
        '[infer="weight-group"] foxy-internal-switch-control[infer="replace-weight"]'
      );

      expect(control).to.exist;
    });

    it('renders summary control for code group', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-form></foxy-internal-experimental-add-to-cart-builder-custom-option-form>`
      );

      const control = form.renderRoot.querySelector(
        'foxy-internal-summary-control[infer="code-group"]'
      );

      expect(control).to.exist;
    });

    it('renders text control for option code inside of the code group', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-form></foxy-internal-experimental-add-to-cart-builder-custom-option-form>`
      );

      const control = form.renderRoot.querySelector(
        '[infer="code-group"] foxy-internal-text-control[infer="code"]'
      );

      expect(control).to.exist;
    });

    it('renders switch control for replace code toggle inside of the code group', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-form></foxy-internal-experimental-add-to-cart-builder-custom-option-form>`
      );

      const control = form.renderRoot.querySelector(
        '[infer="code-group"] foxy-internal-switch-control[infer="replace-code"]'
      );

      expect(control).to.exist;
    });

    it('renders summary control for category group', async () => {
      const form = await fixture<Form>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-form></foxy-internal-experimental-add-to-cart-builder-custom-option-form>`
      );

      const control = form.renderRoot.querySelector(
        'foxy-internal-summary-control[infer="category-group"]'
      );

      expect(control).to.exist;
    });

    it('renders resource picker control for item category inside of the category group', async () => {
      const form = await fixture<Form>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-custom-option-form
            item-categories="https://demo.api/hapi/item_categories?store_id=0"
          >
          </foxy-internal-experimental-add-to-cart-builder-custom-option-form>
        `
      );

      const control = form.renderRoot.querySelector(
        '[infer="category-group"] foxy-internal-resource-picker-control[infer="item-category-uri"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.attribute('item', 'foxy-item-category-card');
      expect(control).to.have.attribute(
        'first',
        'https://demo.api/hapi/item_categories?store_id=0'
      );
    });

    it('produces error:option_exists_configurable when trying to add an option with the same name as an existing configurable option', async () => {
      const form = await fixture<Form>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-custom-option-form
            parent="https://demo.api/virtual/empty"
            .existingOptions=${[{ name: 'foo', value_configurable: true }]}
          >
          </foxy-internal-experimental-add-to-cart-builder-custom-option-form>
        `
      );

      form.edit({ name: 'foo' });
      form.submit();
      await waitUntil(() => form.errors.length > 0);

      expect(form.errors).to.deep.equal(['error:option_exists_configurable']);
    });

    it('produces error:option_exists when trying to add an option with the same name and value as an existing non-configurable option', async () => {
      const form = await fixture<Form>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-custom-option-form
            parent="https://demo.api/virtual/empty"
            .existingOptions=${[{ name: 'foo', value: 'bar' }]}
          >
          </foxy-internal-experimental-add-to-cart-builder-custom-option-form>
        `
      );

      form.edit({ name: 'foo', value: 'bar' });
      form.submit();
      await waitUntil(() => form.errors.length > 0);

      expect(form.errors).to.deep.equal(['error:option_exists']);
    });
  });
});
