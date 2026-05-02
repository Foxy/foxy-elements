import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ProductForm } from './ProductForm';
import { Data } from './types';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';

describe('ProductForm', () => {
  it('imports and registers foxy-internal-async-list-control', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and registers foxy-internal-resource-picker-control', () => {
    expect(customElements.get('foxy-internal-resource-picker-control')).to.exist;
  });

  it('imports and registers foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and registers foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and registers foxy-internal-number-control', () => {
    expect(customElements.get('foxy-internal-number-control')).to.exist;
  });

  it('imports and registers foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and registers itself as foxy-product-form', () => {
    expect(customElements.get('foxy-product-form')).to.equal(ProductForm);
  });

  it('imports and registers foxy-product-tag-card', () => {
    expect(customElements.get('foxy-product-tag-card')).to.exist;
  });

  it('imports and registers foxy-product-tag-form', () => {
    expect(customElements.get('foxy-product-tag-form')).to.exist;
  });

  it('has a default i18n namespace "product-form"', () => {
    expect(ProductForm.defaultNS).to.equal('product-form');
  });

  it('extends InternalForm', () => {
    expect(new ProductForm()).to.be.instanceOf(InternalForm);
  });

  it('extends NucleonElement', () => {
    expect(new ProductForm()).to.be.instanceOf(NucleonElement);
  });

  describe('v8n', () => {
    function run(form: Partial<Data>): (string | true)[] {
      return ProductForm.v8n.map(rule => rule(form as Data, {} as Data));
    }

    it('flags missing SKU', () => {
      expect(run({ definition: { name: 'X', price: 1 } as any })).to.include('sku:v8n_required');
    });

    it('flags overly long SKU', () => {
      expect(run({ sku: 'x'.repeat(256), definition: { name: 'X', price: 1 } as any })).to.include(
        'sku:v8n_too_long'
      );
    });

    it('flags missing definition.name', () => {
      expect(run({ sku: 'X', definition: { price: 1 } as any })).to.include('name:v8n_required');
    });

    it('flags negative definition.price', () => {
      expect(run({ sku: 'X', definition: { name: 'X', price: -5 } as any })).to.include(
        'price:v8n_negative'
      );
    });

    it('passes for a valid product', () => {
      const errors = run({ sku: 'X', definition: { name: 'X', price: 9.99 } as any }).filter(
        e => e !== true
      );
      expect(errors).to.deep.equal([]);
    });

    it('treats null/undefined price as valid (lets users clear price)', () => {
      const errors = run({ sku: 'X', definition: { name: 'X' } as any }).filter(e => e !== true);
      expect(errors).to.deep.equal([]);
    });
  });

  describe('rendered structure', () => {
    // Render the empty/idle template (no .data, no href) — same pattern as
    // ItemForm.test. This exercises the static structure of the template
    // (controls, property bindings, section placeholders) without
    // triggering real sub-collection fetches from the internal async-list
    // and resource-picker controls.

    it('renders the placeholder section divs for variants/advanced/stock-rules/events', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      expect(await getByTestId(element, 'variants-section')).to.exist;
      expect(await getByTestId(element, 'advanced-section')).to.exist;
      expect(await getByTestId(element, 'stock-rules-section')).to.exist;
      expect(await getByTestId(element, 'events-section')).to.exist;
    });

    it('does NOT render the inheritance note when there is no data', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      expect(await getByTestId(element, 'inheritance-note')).to.not.exist;
    });

    it('renders the inheritance note when product_type is "variant"', async () => {
      // Set just the fields we need — `_links: {}` ensures the async-list
      // and other sub-collection controls don't see a real href to fetch.
      const data = {
        product_type: 'variant',
        _links: { self: { href: 'https://demo.api/hapi/products/2' } },
      } as unknown as Data;
      const element = await fixture<ProductForm>(html`
        <foxy-product-form .data=${data}></foxy-product-form>
      `);
      await waitUntil(() => element.in({ idle: 'snapshot' }));
      expect(await getByTestId(element, 'inheritance-note')).to.exist;
    });

    it('binds the name control to definition.name via property attribute', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const ctrl = element.renderRoot.querySelector(
        'foxy-internal-text-control[infer="name"]'
      ) as HTMLElement | null;
      expect(ctrl).to.exist;
      expect(ctrl?.getAttribute('property')).to.equal('definition.name');
    });

    it('binds the price control to definition.price via property attribute', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const ctrl = element.renderRoot.querySelector(
        'foxy-internal-number-control[infer="price"]'
      ) as HTMLElement | null;
      expect(ctrl).to.exist;
      expect(ctrl?.getAttribute('property')).to.equal('definition.price');
    });

    it('binds the SKU control directly (top-level field, no nested property)', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const ctrl = element.renderRoot.querySelector(
        'foxy-internal-text-control[infer="sku"]'
      ) as HTMLElement | null;
      expect(ctrl).to.exist;
      expect(ctrl?.getAttribute('property')).to.be.null;
    });

    it('forwards productCategories attribute to the category picker first link', async () => {
      const element = await fixture<ProductForm>(html`
        <foxy-product-form
          product-categories="https://demo.api/hapi/product_categories"
        ></foxy-product-form>
      `);
      const picker = element.renderRoot.querySelector(
        'foxy-internal-resource-picker-control[infer="category"]'
      ) as HTMLElement | null;
      expect(picker?.getAttribute('first')).to.equal('https://demo.api/hapi/product_categories');
    });

    it('hides the variants section when this product IS a variant', async () => {
      const data = {
        product_type: 'variant',
        _links: { self: { href: 'https://demo.api/hapi/products/2' } },
      } as unknown as Data;
      const element = await fixture<ProductForm>(html`
        <foxy-product-form .data=${data}></foxy-product-form>
      `);
      expect(element.hiddenSelector.matches('variants', true)).to.be.true;
    });

    it('hides tags/events/stock-rules sections on an unsaved product', async () => {
      // No href => unsaved.
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      expect(element.hiddenSelector.matches('tags', true)).to.be.true;
      expect(element.hiddenSelector.matches('events', true)).to.be.true;
      expect(element.hiddenSelector.matches('stock-rules', true)).to.be.true;
      expect(element.hiddenSelector.matches('variants', true)).to.be.true;
    });
  });
});
