import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ProductCollectionForm } from './ProductCollectionForm';
import { Data } from './types';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { createRouter } from '../../../server/index';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { NucleonElement } from '../NucleonElement/NucleonElement';

describe('ProductCollectionForm', () => {
  it('imports and registers foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and registers foxy-internal-number-control', () => {
    expect(customElements.get('foxy-internal-number-control')).to.exist;
  });

  it('imports and registers foxy-internal-resource-picker-control', () => {
    expect(customElements.get('foxy-internal-resource-picker-control')).to.exist;
  });

  it('imports and registers foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and registers foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and registers foxy-internal-product-collection-tree-control', () => {
    expect(customElements.get('foxy-internal-product-collection-tree-control')).to.exist;
  });

  it('imports and registers foxy-product-collection-card', () => {
    expect(customElements.get('foxy-product-collection-card')).to.exist;
  });

  it('imports and registers foxy-item-category-card', () => {
    expect(customElements.get('foxy-item-category-card')).to.exist;
  });

  it('imports and registers itself as foxy-product-collection-form', () => {
    expect(customElements.get('foxy-product-collection-form')).to.equal(ProductCollectionForm);
  });

  it('has a default i18n namespace "product-collection-form"', () => {
    expect(ProductCollectionForm.defaultNS).to.equal('product-collection-form');
  });

  it('extends InternalForm', () => {
    expect(new ProductCollectionForm()).to.be.instanceOf(InternalForm);
  });

  it('extends NucleonElement', () => {
    expect(new ProductCollectionForm()).to.be.instanceOf(NucleonElement);
  });

  describe('v8n', () => {
    function run(form: Partial<Data>): (string | true)[] {
      return ProductCollectionForm.v8n.map(rule => rule(form as Data, {} as Data));
    }

    it('flags missing name', () => {
      expect(run({ slug: 'a' })).to.include('name:v8n_required');
    });

    it('flags overly long name', () => {
      expect(run({ name: 'x'.repeat(256), slug: 'a' })).to.include('name:v8n_too_long');
    });

    it('flags missing slug', () => {
      expect(run({ name: 'X' })).to.include('slug:v8n_required');
    });

    it('flags overly long slug', () => {
      expect(run({ name: 'X', slug: 'x'.repeat(256) })).to.include('slug:v8n_too_long');
    });

    it('flags non-kebab-case slug', () => {
      expect(run({ name: 'X', slug: 'Bad Slug' })).to.include('slug:v8n_invalid');
      expect(run({ name: 'X', slug: 'bad_slug' })).to.include('slug:v8n_invalid');
      expect(run({ name: 'X', slug: '-leading' })).to.include('slug:v8n_invalid');
      expect(run({ name: 'X', slug: 'trailing-' })).to.include('slug:v8n_invalid');
    });

    it('passes for a valid kebab-case slug', () => {
      const errors = run({ name: 'Apparel', slug: 'apparel' }).filter(e => e !== true);
      expect(errors).to.deep.equal([]);
    });

    it('passes for a multi-word kebab-case slug', () => {
      const errors = run({ name: 'Mens Shirts', slug: 'mens-shirts' }).filter(e => e !== true);
      expect(errors).to.deep.equal([]);
    });
  });

  describe('rendered structure', () => {
    it('binds the parent picker to the productCollections collection', async () => {
      const element = await fixture<ProductCollectionForm>(html`
        <foxy-product-collection-form
          product-collections="https://demo.api/hapi/product_collections"
        ></foxy-product-collection-form>
      `);
      const picker = element.renderRoot.querySelector(
        'foxy-internal-resource-picker-control[infer="parent"]'
      ) as HTMLElement | null;
      expect(picker?.getAttribute('first')).to.equal('https://demo.api/hapi/product_collections');
      expect(picker?.getAttribute('property')).to.equal('parent_id');
    });

    it('shows the parent collection, and stores the id of the one picked', async () => {
      const router = createRouter();
      const element = await fixture<ProductCollectionForm>(html`
        <foxy-product-collection-form
          href="https://demo.api/hapi/product_collections/2"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        ></foxy-product-collection-form>
      `);
      await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
      const picker = element.renderRoot.querySelector(
        'foxy-internal-resource-picker-control[infer="parent"]'
      ) as HTMLElement & { getValue: () => unknown; setValue: (href: string) => void };

      expect(picker.getValue()).to.equal('https://demo.api/hapi/product_collections/1');

      picker.setValue('https://demo.api/hapi/product_collections/3');
      expect(element.form.parent_id).to.equal(3);

      picker.setValue('');
      expect(element.form.parent_id).to.be.null;
    });

    describe('item category', () => {
      type Picker = HTMLElement & {
        getValue: () => unknown;
        setValue: (href: string) => void;
        searchFields: string[];
      };

      const categories = 'https://demo.api/hapi/item_categories?store_id=0';

      async function render(href = '') {
        const router = createRouter();
        const element = await fixture<ProductCollectionForm>(html`
          <foxy-product-collection-form
            item-categories=${categories}
            href=${href}
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          ></foxy-product-collection-form>
        `);
        if (href) await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
        const picker = element.renderRoot.querySelector(
          'foxy-internal-resource-picker-control[infer="item-category"]'
        ) as Picker;
        return { element, picker };
      }

      it("picks from the store's item categories, searched by name or code", async () => {
        const { picker } = await render();
        expect(picker.getAttribute('first')).to.equal(categories);
        expect(picker.getAttribute('item')).to.equal('foxy-item-category-card');
        expect(picker.searchFields).to.deep.equal(['name', 'code']);
      });

      it("shows the collection's category", async () => {
        const { element, picker } = await render('https://demo.api/hapi/product_collections/1');
        const category = 'https://demo.api/hapi/item_categories/0';
        expect(element.data?.item_category_uri).to.equal(category);
        expect(element.data?._links['fx:item_category']?.href).to.equal(category);
        expect(picker.getValue()).to.equal(category);
      });

      it('stores the URI of the category picked, and null once cleared', async () => {
        const { element, picker } = await render('https://demo.api/hapi/product_collections/2');
        expect(element.form.item_category_uri).to.be.null;

        picker.setValue('https://demo.api/hapi/item_categories/1');
        expect(element.form.item_category_uri).to.equal('https://demo.api/hapi/item_categories/1');

        picker.setValue('');
        expect(element.form.item_category_uri).to.be.null;
      });

      it('saves the category picked', async () => {
        const { element, picker } = await render('https://demo.api/hapi/product_collections/2');
        picker.setValue('https://demo.api/hapi/item_categories/1');
        element.submit();
        await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });

        expect(element.data?.item_category_uri).to.equal('https://demo.api/hapi/item_categories/1');
        expect(element.data?._links['fx:item_category']?.href).to.equal(
          'https://demo.api/hapi/item_categories/1'
        );
      });
    });

    it('renders the name, slug, and sort-order fields', async () => {
      const element = await fixture<ProductCollectionForm>(html`
        <foxy-product-collection-form></foxy-product-collection-form>
      `);
      expect(element.renderRoot.querySelector('foxy-internal-text-control[infer="name"]')).to.exist;
      expect(element.renderRoot.querySelector('foxy-internal-text-control[infer="slug"]')).to.exist;
      expect(element.renderRoot.querySelector('foxy-internal-number-control[infer="sort-order"]'))
        .to.exist;
    });
  });
});
