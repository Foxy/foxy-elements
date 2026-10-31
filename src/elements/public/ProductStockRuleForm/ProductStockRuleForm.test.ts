import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { InternalResourcePickerControl } from '../../internal/InternalResourcePickerControl/InternalResourcePickerControl';
import type { InternalNumberControl } from '../../internal/InternalNumberControl/InternalNumberControl';

import './index';

import { expect, fixture, html } from '@open-wc/testing';
import { ProductStockRuleForm } from './ProductStockRuleForm';
import { Data } from './types';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';

describe('ProductStockRuleForm', () => {
  it('imports and registers foxy-internal-resource-picker-control', () => {
    expect(customElements.get('foxy-internal-resource-picker-control')).to.exist;
  });

  it('imports and registers foxy-internal-number-control', () => {
    expect(customElements.get('foxy-internal-number-control')).to.exist;
  });

  it('imports and registers foxy-product-card', () => {
    expect(customElements.get('foxy-product-card')).to.exist;
  });

  it('imports and registers itself as foxy-product-stock-rule-form', () => {
    expect(customElements.get('foxy-product-stock-rule-form')).to.equal(ProductStockRuleForm);
  });

  it('has a default i18n namespace "product-stock-rule-form"', () => {
    expect(ProductStockRuleForm.defaultNS).to.equal('product-stock-rule-form');
  });

  it('extends InternalForm', () => {
    expect(new ProductStockRuleForm()).to.be.instanceOf(InternalForm);
  });

  it('has a reactive property "products"', () => {
    expect(ProductStockRuleForm).to.have.deep.nested.property('properties.products', {});
    expect(new ProductStockRuleForm()).to.have.property('products', null);
  });

  it('requires a target product', () => {
    const errors = ProductStockRuleForm.v8n.map(rule => rule({} as Data, {} as Data));
    expect(errors).to.include('target:v8n_required');
  });

  it('refuses a negative or fractional multiplier and accepts 0', () => {
    const check = (multiplier: number) =>
      ProductStockRuleForm.v8n.map(rule =>
        rule({ target_product_id: 1, multiplier } as Data, {} as Data)
      );

    expect(check(-1)).to.include('multiplier:v8n_invalid');
    expect(check(1.5)).to.include('multiplier:v8n_invalid');
    expect(check(0).filter(v => v !== true)).to.deep.equal([]);
    expect(check(6).filter(v => v !== true)).to.deep.equal([]);
  });

  it('offers only products that can hold stock in the target picker', async () => {
    const element = await fixture<ProductStockRuleForm>(html`
      <foxy-product-stock-rule-form products="https://demo.api/hapi/products">
      </foxy-product-stock-rule-form>
    `);

    const picker =
      element.renderRoot.querySelector<InternalResourcePickerControl>('[infer="target"]')!;

    const params = new URLSearchParams();
    picker.extendFilter?.(params);

    expect(picker).to.have.attribute('first', 'https://demo.api/hapi/products');
    expect(picker).to.have.attribute('item', 'foxy-product-card');
    expect(params.get('product_type:in')).to.equal('standalone,parent,variant');
  });

  it('stores the picked product as target_product_id', async () => {
    const element = await fixture<ProductStockRuleForm>(html`
      <foxy-product-stock-rule-form products="https://demo.api/hapi/stores/0/products">
      </foxy-product-stock-rule-form>
    `);

    const picker =
      element.renderRoot.querySelector<InternalResourcePickerControl>('[infer="target"]')!;

    picker.setValue('https://demo.api/hapi/products/3');
    expect(element.form.target_product_id).to.equal(3);
    expect(picker.getValue()).to.equal('https://demo.api/hapi/products/3');
  });

  it('defaults the multiplier to 1', async () => {
    const element = await fixture<ProductStockRuleForm>(html`
      <foxy-product-stock-rule-form></foxy-product-stock-rule-form>
    `);

    const control =
      element.renderRoot.querySelector<InternalNumberControl>('[infer="multiplier"]')!;

    expect(control.getValue()).to.equal(1);
    control.setValue(4);
    expect(element.form.multiplier).to.equal(4);
  });

  it('makes a saved rule read-only except for deleting it', async () => {
    const router = createRouter();
    const data = await getTestData<Data>('https://demo.api/hapi/product_stock_rules/0', router);
    const element = await fixture<ProductStockRuleForm>(html`
      <foxy-product-stock-rule-form
        .data=${data}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-product-stock-rule-form>
    `);

    expect(element.readonlySelector.matches('general', true)).to.be.true;
    expect(element.readonlySelector.matches('delete', true)).to.be.false;
    expect(new ProductStockRuleForm().readonlySelector.matches('general', true)).to.be.false;
  });
});
