import type { DiscountBuilder } from '../../../DiscountBuilder';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import '../../../NucleonElement/index';
import './index';

import { InternalExperimentalAddToCartBuilderItemControl as Control } from './InternalExperimentalAddToCartBuilderItemControl';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { getTestData } from '../../../../../testgen/getTestData';
import { html } from 'lit-html';

describe('ExperimentalAddToCartBuilder', () => {
  describe('InternalExperimentalAddToCartBuilderItemControl', () => {
    it('imports dependencies', () => {
      expect(customElements.get('foxy-internal-resource-picker-control')).to.exist;
      expect(customElements.get('foxy-internal-frequency-control')).to.exist;
      expect(customElements.get('foxy-internal-async-list-control')).to.exist;
      expect(customElements.get('foxy-internal-summary-control')).to.exist;
      expect(customElements.get('foxy-internal-switch-control')).to.exist;
      expect(customElements.get('foxy-internal-select-control')).to.exist;
      expect(customElements.get('foxy-internal-number-control')).to.exist;
      expect(customElements.get('foxy-internal-date-control')).to.exist;
      expect(customElements.get('foxy-internal-text-control')).to.exist;
      expect(customElements.get('foxy-internal-control')).to.exist;
      expect(customElements.get('foxy-item-category-card')).to.exist;
      expect(customElements.get('foxy-discount-builder')).to.exist;
      expect(customElements.get('foxy-nucleon')).to.exist;
      expect(customElements.get('foxy-i18n')).to.exist;
      expect(
        customElements.get('foxy-internal-experimental-add-to-cart-builder-custom-option-card')
      ).to.exist;
      expect(customElements.get('foxy-internal-experimental-add-to-cart-builder-item-control')).to
        .exist;
    });

    it('defines itself as foxy-internal-experimental-add-to-cart-builder-item-control', () => {
      const localName = 'foxy-internal-experimental-add-to-cart-builder-item-control';
      expect(customElements.get(localName)).to.equal(Control);
    });

    it('extends foxy-internal-control', () => {
      expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-control'));
    });

    it('has a reactive property "defaultItemCategory" that defaults to null', () => {
      expect(new Control()).to.have.property('defaultItemCategory', null);
      expect(Control).to.have.deep.nested.property('properties.defaultItemCategory', {
        attribute: 'default-item-category',
        type: Object,
      });
    });

    it('has a reactive property "itemCategories" that defaults to null', () => {
      expect(new Control()).to.have.property('itemCategories', null);
      expect(Control).to.have.deep.nested.property('properties.itemCategories', {
        attribute: 'item-categories',
      });
    });

    it('has a reactive property "currencyCode" that defaults to null', () => {
      expect(new Control()).to.have.property('currencyCode', null);
      expect(Control).to.have.deep.nested.property('properties.currencyCode', {
        attribute: 'currency-code',
      });
    });

    it('has a reactive property "index" that defaults to 0', () => {
      expect(new Control()).to.have.property('index', 0);
      expect(Control).to.have.deep.nested.property('properties.index', { type: Number });
    });

    it('renders a summary control for the basics group', async () => {
      const element = await fixture<Control>(
        html`<foxy-internal-experimental-add-to-cart-builder-item-control></foxy-internal-experimental-add-to-cart-builder-item-control>`
      );

      const control = element.renderRoot.querySelector(
        'foxy-internal-summary-control[infer="basics-group"]'
      );

      expect(control).to.exist;
    });

    it('renders a text control for the name property inside of the basics group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control index="3">
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const control = element.renderRoot.querySelector(
        '[infer="basics-group"] foxy-internal-text-control[infer="name"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.3.name');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('renders a resource picker control for the item_category_uri property inside of the basics group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control
            item-categories="https://demo.api/hapi/item_categories?store_id=0"
            index="3"
          >
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const control = element.renderRoot.querySelector(
        '[infer="basics-group"] foxy-internal-resource-picker-control[infer="item-category-uri"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.3.item_category_uri');
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.attribute('item', 'foxy-item-category-card');
      expect(control).to.have.attribute(
        'first',
        'https://demo.api/hapi/item_categories?store_id=0'
      );
    });

    it('renders a summary control for the price group', async () => {
      const element = await fixture<Control>(
        html`<foxy-internal-experimental-add-to-cart-builder-item-control></foxy-internal-experimental-add-to-cart-builder-item-control>`
      );

      const control = element.renderRoot.querySelector(
        'foxy-internal-summary-control[infer="price-group"]'
      );

      expect(control).to.exist;
    });

    it('renders a number control for the price property inside of the price group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control
            currency-code="cad"
            index="3"
          >
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const control = element.renderRoot.querySelector(
        '[infer="price-group"] foxy-internal-number-control[infer="price"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.3.price');
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.attribute('suffix', 'cad');
    });

    it('renders a switch control for the price_configurable property inside of the price group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control index="3">
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const control = element.renderRoot.querySelector(
        '[infer="price-group"] foxy-internal-switch-control[infer="price-configurable"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.3.price_configurable');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('renders a number control for default price if price is configurable inside of the price group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ price_configurable: true }] });
      element.nucleon = nucleon;
      await element.requestUpdate();
      const control = element.renderRoot.querySelector(
        '[infer="price-group"] foxy-internal-number-control[infer="price-default"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.price');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('renders a summary control for the code group', async () => {
      const element = await fixture<Control>(
        html`<foxy-internal-experimental-add-to-cart-builder-item-control></foxy-internal-experimental-add-to-cart-builder-item-control>`
      );

      const control = element.renderRoot.querySelector(
        'foxy-internal-summary-control[infer="code-group"]'
      );

      expect(control).to.exist;
    });

    it('renders a text control for the code property inside of the code group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control index="3">
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const control = element.renderRoot.querySelector(
        '[infer="code-group"] foxy-internal-text-control[infer="code"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.3.code');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('renders a text control for the parent_code property inside of the code group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control index="3">
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const control = element.renderRoot.querySelector(
        '[infer="code-group"] foxy-internal-text-control[infer="parent-code"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.3.parent_code');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('renders a summary control for the appearance group', async () => {
      const element = await fixture<Control>(
        html`<foxy-internal-experimental-add-to-cart-builder-item-control></foxy-internal-experimental-add-to-cart-builder-item-control>`
      );

      const control = element.renderRoot.querySelector(
        'foxy-internal-summary-control[infer="appearance-group"]'
      );

      expect(control).to.exist;
    });

    it('renders a number control for the weight property inside of the appearance group if item category allows it', async () => {
      const itemCategory = await getTestData<Resource<Rels.ItemCategory>>(
        './hapi/item_categories/0'
      );

      itemCategory.item_delivery_type = 'pickup';
      itemCategory.default_weight_unit = 'KGS';
      itemCategory.default_weight = 25;

      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control
            index="3"
            .defaultItemCategory=${itemCategory}
          >
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const control = element.renderRoot.querySelector(
        '[infer="appearance-group"] foxy-internal-number-control[infer="weight"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('placeholder', '25');
      expect(control).to.have.attribute('property', 'items.3.weight');
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.attribute('suffix', 'KGS');
      expect(control).to.have.attribute('min', '0');

      itemCategory.item_delivery_type = 'downloaded';
      await element.requestUpdate();
      expect(element.renderRoot.querySelector('[infer="appearance-group"]')).to.not.exist;

      itemCategory.item_delivery_type = 'notshipped';
      await element.requestUpdate();
      expect(element.renderRoot.querySelector('[infer="appearance-group"]')).to.not.exist;
    });

    it('renders a summary control for the subscriptions group', async () => {
      const element = await fixture<Control>(
        html`<foxy-internal-experimental-add-to-cart-builder-item-control></foxy-internal-experimental-add-to-cart-builder-item-control>`
      );

      const control = element.renderRoot.querySelector(
        'foxy-internal-summary-control[infer="subscriptions-group"]'
      );

      expect(control).to.exist;
    });

    it('renders a switch control for the sub_enabled property inside of the subscriptions group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control index="3">
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const control = element.renderRoot.querySelector(
        '[infer="subscriptions-group"] foxy-internal-switch-control[infer="sub-enabled"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.3.sub_enabled');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('if sub_enabled is true, renders a frequency control for the sub_frequency property inside of the subscriptions group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector =
        '[infer="subscriptions-group"] foxy-internal-frequency-control[infer="sub-frequency"]';
      expect(element.renderRoot.querySelector(selector)).to.not.exist;

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ sub_enabled: true }] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(selector);
      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.sub_frequency');
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.attribute('allow-twice-a-month');
    });

    it('if sub_enabled is true, renders a select control for the sub_startdate_format property inside of the subscriptions group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector =
        '[infer="subscriptions-group"] foxy-internal-select-control[infer="sub-startdate-format"]';
      expect(element.renderRoot.querySelector(selector)).to.not.exist;

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ sub_enabled: true }] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(selector);
      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.sub_startdate_format');
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.deep.property('options', [
        { label: 'option_none', value: 'none' },
        { label: 'option_yyyymmdd', value: 'yyyymmdd' },
        { label: 'option_dd', value: 'dd' },
        { label: 'option_duration', value: 'duration' },
      ]);
    });

    it('if sub_enabled is true and sub_startdate_format is yyyymmdd, renders a date control for the sub_startdate property inside of the subscriptions group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector =
        '[infer="subscriptions-group"] foxy-internal-date-control[infer="sub-startdate-yyyymmdd"]';
      expect(element.renderRoot.querySelector(selector)).to.not.exist;

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ sub_enabled: true, sub_startdate_format: 'yyyymmdd' }] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(selector);
      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.sub_startdate');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('if sub_enabled is true and sub_startdate_format is duration, renders a frequency control for the sub_startdate property inside of the subscriptions group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector =
        '[infer="subscriptions-group"] foxy-internal-frequency-control[infer="sub-startdate-duration"]';
      expect(element.renderRoot.querySelector(selector)).to.not.exist;

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ sub_enabled: true, sub_startdate_format: 'duration' }] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(selector);
      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.sub_startdate');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('if sub_enabled is true and sub_startdate_format is dd, renders a number control for the sub_startdate property inside of the subscriptions group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector =
        '[infer="subscriptions-group"] foxy-internal-number-control[infer="sub-startdate-dd"]';
      expect(element.renderRoot.querySelector(selector)).to.not.exist;

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ sub_enabled: true, sub_startdate_format: 'dd' }] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(selector);
      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.sub_startdate');
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.attribute('step', '1');
      expect(control).to.have.attribute('min', '1');
      expect(control).to.have.attribute('max', '31');
    });

    it('if sub_enabled is true, renders a select control for the sub_enddate_format property inside of the subscriptions group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector =
        '[infer="subscriptions-group"] foxy-internal-select-control[infer="sub-enddate-format"]';
      expect(element.renderRoot.querySelector(selector)).to.not.exist;

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ sub_enabled: true }] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(selector);
      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.sub_enddate_format');
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.deep.property('options', [
        { label: 'option_none', value: 'none' },
        { label: 'option_yyyymmdd', value: 'yyyymmdd' },
        { label: 'option_duration', value: 'duration' },
      ]);
    });

    it('if sub_enabled is true and sub_enddate_format is yyyymmdd, renders a date control for the sub_enddate property inside of the subscriptions group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector =
        '[infer="subscriptions-group"] foxy-internal-date-control[infer="sub-enddate-yyyymmdd"]';
      expect(element.renderRoot.querySelector(selector)).to.not.exist;

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ sub_enabled: true, sub_enddate_format: 'yyyymmdd' }] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(selector);
      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.sub_enddate');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('if sub_enabled is true and sub_enddate_format is duration, renders a frequency control for the sub_enddate property inside of the subscriptions group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector =
        '[infer="subscriptions-group"] foxy-internal-frequency-control[infer="sub-enddate-duration"]';
      expect(element.renderRoot.querySelector(selector)).to.not.exist;

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ sub_enabled: true, sub_enddate_format: 'duration' }] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(selector);
      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.sub_enddate');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('renders a summary control for the quantity group', async () => {
      const element = await fixture<Control>(
        html`<foxy-internal-experimental-add-to-cart-builder-item-control></foxy-internal-experimental-add-to-cart-builder-item-control>`
      );

      const control = element.renderRoot.querySelector(
        'foxy-internal-summary-control[infer="quantity-group"]'
      );

      expect(control).to.exist;
    });

    it('renders a number control for the quantity property inside of the quantity group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control index="3">
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const control = element.renderRoot.querySelector(
        '[infer="quantity-group"] foxy-internal-number-control[infer="quantity"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.3.quantity');
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.attribute('step', '1');
      expect(control).to.have.attribute('min', '1');
    });

    it('renders a number control for the quantity_min property inside of the quantity group unless item expiration format is minutes', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector =
        '[infer="quantity-group"] foxy-internal-number-control[infer="quantity-min"]';
      const control = element.renderRoot.querySelector(selector);
      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.quantity_min');
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.attribute('step', '1');
      expect(control).to.have.attribute('min', '1');

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ expires_format: 'minutes' }] });
      element.nucleon = nucleon;
      await element.requestUpdate();
      expect(element.renderRoot.querySelector(selector)).to.not.exist;
    });

    it('renders a number control for the quantity_max property inside of the quantity group unless item expiration format is minutes', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector =
        '[infer="quantity-group"] foxy-internal-number-control[infer="quantity-max"]';
      const control = element.renderRoot.querySelector(selector);
      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.quantity_max');
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.attribute('step', '1');
      expect(control).to.have.attribute('min', '1');

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ expires_format: 'minutes' }] });
      element.nucleon = nucleon;
      await element.requestUpdate();
      expect(element.renderRoot.querySelector(selector)).to.not.exist;
    });

    it('renders a switch control for the hide_quantity property inside of the quantity group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control index="3">
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const control = element.renderRoot.querySelector(
        '[infer="quantity-group"] foxy-internal-switch-control[infer="hide-quantity"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.3.hide_quantity');
    });

    it('renders a summary control for the advanced group', async () => {
      const element = await fixture<Control>(
        html`<foxy-internal-experimental-add-to-cart-builder-item-control></foxy-internal-experimental-add-to-cart-builder-item-control>`
      );

      const control = element.renderRoot.querySelector(
        'foxy-internal-summary-control[infer="advanced-group"]'
      );

      expect(control).to.exist;
    });

    it('renders a text control for the discount_name property inside of the advanced group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control index="3">
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const control = element.renderRoot.querySelector(
        '[infer="advanced-group"] foxy-internal-text-control[infer="discount-name"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.3.discount_name');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('if discount_name is set, renders a discount builder for the discount_details property inside of the advanced group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector = '[infer="advanced-group"] foxy-discount-builder[infer="discount-builder"]';
      expect(element.renderRoot.querySelector(selector)).to.not.exist;

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ discount_name: 'foo' }] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector<DiscountBuilder>(selector)!;
      expect(control).to.exist;
      expect(control).to.have.deep.property('parsedValue', {
        details: '',
        type: 'quantity_amount',
        name: 'foo',
      });

      control.parsedValue = { details: 'bar', type: 'quantity_percentage', name: 'baz' };
      control.dispatchEvent(new CustomEvent('change'));
      expect(nucleon).to.have.nested.property('form.items.0.discount_details', 'bar');
      expect(nucleon).to.have.nested.property('form.items.0.discount_type', 'quantity_percentage');
    });

    it('renders a text control for the image property inside of the advanced group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control index="3">
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const control = element.renderRoot.querySelector(
        '[infer="advanced-group"] foxy-internal-text-control[infer="image"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.3.image');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('if image is set, renders a text control for the url property inside of the advanced group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector = '[infer="advanced-group"] foxy-internal-text-control[infer="url"]';
      expect(element.renderRoot.querySelector(selector)).to.not.exist;

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ image: 'foo' }] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(selector);
      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.url');
      expect(control).to.have.attribute('layout', 'summary-item');
    });

    it('renders a select control for the expires_format property inside of the advanced group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const control = element.renderRoot.querySelector(
        '[infer="advanced-group"] foxy-internal-select-control[infer="expires-format"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.expires_format');
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.deep.property('options', [
        { label: 'option_none', value: 'none' },
        { label: 'option_minutes', value: 'minutes' },
        { label: 'option_timestamp', value: 'timestamp' },
      ]);
    });

    it('if expires_format is minutes, renders a number control for the expires_value property inside of the advanced group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector =
        '[infer="advanced-group"] foxy-internal-number-control[infer="expires-value-minutes"]';
      expect(element.renderRoot.querySelector(selector)).to.not.exist;

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ expires_format: 'minutes' }] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(selector);
      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.expires_value');
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.attribute('suffix', 'min');
    });

    it('if expires_format is timestamp, renders a date control for the expires_value property inside of the advanced group', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector =
        '[infer="advanced-group"] foxy-internal-date-control[infer="expires-value-timestamp"]';
      expect(element.renderRoot.querySelector(selector)).to.not.exist;

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ expires_format: 'timestamp' }] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(selector);
      expect(control).to.exist;
      expect(control).to.have.attribute('property', 'items.0.expires_value');
      expect(control).to.have.attribute('layout', 'summary-item');
      expect(control).to.have.attribute('format', 'unix');
    });

    it('if itemDeliveryType is notshipped or downloaded, does not render length, width, and height controls inside of the advanced group', async () => {
      const itemCategory = await getTestData<Resource<Rels.ItemCategory>>(
        './hapi/item_categories/0'
      );

      itemCategory.item_delivery_type = 'notshipped';

      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control
            .defaultItemCategory=${itemCategory}
          >
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const $ = (selector: string) => element.renderRoot.querySelector(selector);
      expect($('[infer="advanced-group"] [infer="length"]')).to.not.exist;
      expect($('[infer="advanced-group"] [infer="width"]')).to.not.exist;
      expect($('[infer="advanced-group"] [infer="height"]')).to.not.exist;

      itemCategory.item_delivery_type = 'downloaded';
      await element.requestUpdate();
      expect($('[infer="advanced-group"] [infer="length"]')).to.not.exist;
      expect($('[infer="advanced-group"] [infer="width"]')).to.not.exist;
      expect($('[infer="advanced-group"] [infer="height"]')).to.not.exist;

      itemCategory.item_delivery_type = 'shipped';
      await element.requestUpdate();
      expect($('[infer="advanced-group"] [infer="length"]')).to.exist;
      expect($('[infer="advanced-group"] [infer="width"]')).to.exist;
      expect($('[infer="advanced-group"] [infer="height"]')).to.exist;
    });

    it('if itemDeliveryType is shipped, renders length, width, and height controls inside of the advanced group', async () => {
      const itemCategory = await getTestData<Resource<Rels.ItemCategory>>(
        './hapi/item_categories/0'
      );

      itemCategory.item_delivery_type = 'shipped';
      itemCategory.default_length_unit = 'CM';

      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control
            .defaultItemCategory=${itemCategory}
          >
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const $ = (selector: string) => element.renderRoot.querySelector(selector);
      expect($('[infer="advanced-group"] [infer="length"]')).to.exist;
      expect($('[infer="advanced-group"] [infer="width"]')).to.exist;
      expect($('[infer="advanced-group"] [infer="height"]')).to.exist;
      expect($('[infer="advanced-group"] [infer="length"]')).to.have.attribute('suffix', 'CM');
      expect($('[infer="advanced-group"] [infer="width"]')).to.have.attribute('suffix', 'CM');
      expect($('[infer="advanced-group"] [infer="height"]')).to.have.attribute('suffix', 'CM');
    });

    it('renders an async list control for the custom options', async () => {
      const itemCategory = await getTestData<Resource<Rels.ItemCategory>>(
        './hapi/item_categories/0'
      );

      itemCategory.default_weight_unit = 'KGS';

      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control
            item-categories="https://demo.api/hapi/item_categories?store_id=0"
            currency-code="aud"
            .defaultItemCategory=${itemCategory}
          >
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{ custom_options: [{ name: 'foo', value: 'bar' }] }] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(
        'foxy-internal-async-list-control[infer="custom-options"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('layout', 'details');
      expect(control).to.have.attribute(
        'first',
        `foxy://${element.nucleon?.virtualHost}/form/items/0/custom_options`
      );
      expect(control).to.have.attribute(
        'form',
        'foxy-internal-experimental-add-to-cart-builder-custom-option-form'
      );
      expect(control).to.have.attribute(
        'item',
        'foxy-internal-experimental-add-to-cart-builder-custom-option-card'
      );
      expect(control).to.have.attribute('alert');
      expect(control).to.have.deep.property('formProps', {
        '.defaultWeightUnit': 'KGS',
        '.existingOptions': [{ name: 'foo', value: 'bar' }],
        '.itemCategories': 'https://demo.api/hapi/item_categories?store_id=0',
        '.currencyCode': 'aud',
      });
    });

    it('renders a button to remove the item if there is more than one item', async () => {
      const element = await fixture<Control>(
        html`
          <foxy-internal-experimental-add-to-cart-builder-item-control>
          </foxy-internal-experimental-add-to-cart-builder-item-control>
        `
      );

      const selector = 'foxy-i18n[infer="delete"]';
      expect(element.renderRoot.querySelector(selector)).to.not.exist;

      const nucleon = new NucleonElement<any>();
      nucleon.edit({ items: [{}, {}] });
      element.nucleon = nucleon;
      await element.requestUpdate();

      const caption = element.renderRoot.querySelector(selector);
      expect(caption).to.exist;
      expect(caption).to.have.attribute('key', 'caption');

      const button = caption?.closest('vaadin-button');
      expect(button).to.exist;
      expect(button).to.not.have.attribute('disabled');

      const removeEvent = oneEvent(element, 'remove');
      button!.click();
      expect(await removeEvent).to.be.an.instanceOf(CustomEvent);

      element.disabled = true;
      await element.requestUpdate();
      expect(button).to.have.attribute('disabled');
    });
  });
});
