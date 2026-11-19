import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ProductForm } from './ProductForm';
import { ImageTooLargeError } from './catalog';
import { Data } from './types';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { LitElement } from 'lit-element';

import { ifDefined } from 'lit-html/directives/if-defined';

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

  it('imports and registers foxy-product-card', () => {
    expect(customElements.get('foxy-product-card')).to.exist;
  });

  it('imports and registers foxy-internal-product-form-images-control', () => {
    expect(customElements.get('foxy-internal-product-form-images-control')).to.exist;
  });

  it('imports and registers foxy-internal-product-form-description-control', () => {
    expect(customElements.get('foxy-internal-product-form-description-control')).to.exist;
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
      const host = new ProductForm();
      return ProductForm.v8n.map(rule => rule(form as Data, host));
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

    it('takes a product with no name of its own when it inherits one', () => {
      const host = new ProductForm();
      host.parentProduct = { compiled_definition: { name: 'Yamaha Revstar' } } as Data;
      const form = { sku: 'REVSTAR-01-SUNBURST', definition: {} } as Data;
      expect(ProductForm.v8n.map(rule => rule(form, host))).to.not.include('name:v8n_required');

      host.parentProduct = { compiled_definition: {} } as Data;
      expect(ProductForm.v8n.map(rule => rule(form, host))).to.include('name:v8n_required');
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

    it('renders a list of stock rules, giving its form the products to pick from', async () => {
      const element = await fixture<ProductForm>(html`
        <foxy-product-form parent="https://demo.api/hapi/stores/0/products"></foxy-product-form>
      `);
      const list = element.renderRoot.querySelector(
        'foxy-internal-async-list-control[infer="stock-rules"]'
      ) as HTMLElement & { formProps: Record<string, unknown> };

      expect(list).to.have.attribute('item', 'foxy-product-stock-rule-card');
      expect(list).to.have.attribute('form', 'foxy-product-stock-rule-form');
      expect(list.formProps).to.deep.equal({ products: 'https://demo.api/hapi/stores/0/products' });
    });

    it('binds the list price control to definition.list_price', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const ctrl = element.renderRoot.querySelector(
        'foxy-internal-number-control[infer="list-price"]'
      );
      expect(ctrl).to.have.attribute('property', 'definition.list_price');
    });

    it('does NOT render the inheritance note when there is no data', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      expect(await getByTestId(element, 'inheritance-note')).to.not.exist;
    });

    it("names a variant's parent, and shows its values as placeholders", async () => {
      const router = createRouter();
      const element = await fixture<ProductForm>(html`
        <foxy-product-form
          href="https://demo.api/hapi/products/2"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-product-form>
      `);
      await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
      await element.requestUpdate();

      const parent = await getTestData<Data>('https://demo.api/hapi/products/1', router);
      const note = (await getByTestId(element, 'inheritance-note'))?.querySelector('foxy-i18n');
      expect(note).to.have.attribute('key', 'inheritance_note_parent');
      const name = parent.compiled_definition?.name;
      expect(note).to.have.deep.property('options', {
        product: name ? `${name} (${parent.sku})` : parent.sku,
      });

      const price = element.renderRoot.querySelector('foxy-internal-number-control[infer="price"]');
      const inheritedPrice = parent.compiled_definition?.price;
      if (inheritedPrice !== undefined) {
        expect(price).to.have.attribute('placeholder', String(inheritedPrice));
      }
    });

    it('offers a plain add-to-cart link for a product without choices', async () => {
      // A variant whose parent's only modifier it removes.
      const router = createRouter();
      const element = await fixture<ProductForm>(html`
        <foxy-product-form
          href="https://demo.api/hapi/products/3"
          default-domain="foxycart.com"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-product-form>
      `);
      await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
      await element.requestUpdate();

      const store = await getTestData<any>('https://demo.api/hapi/stores/0', router);
      const host = store.use_remote_domain
        ? store.store_domain
        : `${store.store_domain}.foxycart.com`;
      const link = `https://${host}/cart?sku=${encodeURIComponent(element.data!.sku)}`;
      const storefront = element.renderRoot.querySelector(
        'foxy-internal-product-form-storefront-control'
      ) as LitElement;
      await storefront.updateComplete;
      const builder = storefront.renderRoot.querySelector(
        'foxy-internal-product-form-cart-link-control'
      ) as LitElement;
      await builder.updateComplete;
      const copy = builder.renderRoot
        .querySelector('[data-testid="cart-link"]')
        ?.querySelector('foxy-copy-to-clipboard');
      expect(copy).to.have.attribute('text', link);
    });

    it('offers no storefront elements for a template, which is never sold', async () => {
      const router = createRouter();
      const element = await fixture<ProductForm>(html`
        <foxy-product-form
          href="https://demo.api/hapi/products/4"
          default-domain="foxycart.com"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-product-form>
      `);
      await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
      await element.requestUpdate();
      expect(element.renderRoot.querySelector('foxy-internal-product-form-storefront-control')).to
        .not.exist;
    });

    it('leaves the storefront section out altogether when its control is hidden', async () => {
      const router = createRouter();
      const element = await fixture<ProductForm>(html`
        <foxy-product-form
          href="https://demo.api/hapi/products/0"
          default-domain="foxycart.com"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-product-form>
      `);
      await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
      await element.requestUpdate();
      const section = () => element.renderRoot.querySelector('[data-testid="section-storefront"]');
      expect(section()).to.exist;

      element.setAttribute('hiddencontrols', 'storefront');
      await element.requestUpdate();
      expect(section(), 'no heading left over an empty section').to.not.exist;
      expect(element.renderRoot.querySelector('foxy-internal-product-form-storefront-control')).to
        .not.exist;
    });

    it('creates a template when Template is chosen as the kind', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const kind = element.renderRoot.querySelector(
        'foxy-internal-radio-group-control[infer="kind"]'
      ) as HTMLElement & { setValue: (v: string) => void; getValue: () => string };

      expect(kind.getValue()).to.equal('product');
      kind.setValue('template');
      expect(element.form.product_type).to.equal('template');
      expect(kind.getValue()).to.equal('template');
    });

    it('edits properties as lists of values, saving a single value as a string', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      element.edit({ definition: { name: 'Tee', properties: { material: 'Organic cotton' } } });
      const control = element.renderRoot.querySelector(
        'foxy-internal-array-map-control[infer="properties"]'
      ) as HTMLElement & {
        getValue: () => Record<string, string[]>;
        setValue: (v: Record<string, string[]>) => void;
      };

      expect(control.getValue()).to.deep.equal({ material: ['Organic cotton'] });

      control.setValue({ material: ['Organic cotton'], care: ['Machine wash', 'Line dry'] });
      expect(element.form.definition?.properties).to.deep.equal({
        material: 'Organic cotton',
        care: ['Machine wash', 'Line dry'],
      });

      control.setValue({});
      expect(element.form.definition).to.not.have.property('properties');
      expect(element.form.definition?.name).to.equal('Tee');
    });

    it("lists a template's products, filtered by inherit_from_id", async () => {
      // The API doesn't return a resource's id, so the form reads it from the self link.
      const router = createRouter();
      const element = await fixture<ProductForm>(html`
        <foxy-product-form
          href="https://demo.api/hapi/products/4"
          parent="https://demo.api/hapi/stores/0/products"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-product-form>
      `);
      await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
      const template = { ...element.data } as Partial<Data>;
      delete template.id;
      element.data = template as Data;
      await element.requestUpdate();

      const list = element.renderRoot.querySelector(
        'foxy-internal-async-list-control[infer="template-products"]'
      );
      expect(list).to.have.attribute(
        'first',
        'https://demo.api/hapi/stores/0/products?inherit_from_id=4'
      );
      expect(element.hiddenSelector.matches('template-products', true)).to.be.false;
      expect(element.hiddenSelector.matches('stock-rules', true)).to.be.true;
      expect(element.hiddenSelector.matches('variants', true)).to.be.true;
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

    it('lays out the name, then SKU, price, list price and weight in one row', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const basics = (await getByTestId(element, 'basics'))!;
      expect(Array.from(basics.children).map(node => node.getAttribute('infer'))).to.deep.equal([
        'name',
        'sku',
        'price',
        'list-price',
        'weight',
      ]);
      for (const control of Array.from(basics.children)) {
        expect(control, control.getAttribute('infer')!).to.not.have.attribute('layout');
      }
    });

    it('leaves out a price, list price or weight that is emptied, so it inherits again', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      element.edit({
        definition: { name: 'Bourbon Barrel Stout', price: 14.95, list_price: 17.5 },
      });
      const control = (infer: string) =>
        element.renderRoot.querySelector(
          `foxy-internal-number-control[infer="${infer}"]`
        ) as HTMLElement & { setValue: (value: number) => void };

      control('price').setValue(NaN);
      control('list-price').setValue(16.25);
      expect(element.form.definition).to.deep.equal({
        name: 'Bourbon Barrel Stout',
        list_price: 16.25,
      });
    });

    describe('organization', () => {
      type Picker = HTMLElement & { helperText: string; placeholder: string };

      const picker = (element: ProductForm) =>
        element.renderRoot.querySelector(
          'foxy-internal-resource-picker-control[infer="category"]'
        ) as Picker;

      // The inherited category's text, with what it was given, in place of the translation.
      const showOptions = (element: ProductForm) =>
        Object.defineProperty(element, 't', {
          configurable: true,
          value: (key: string, options?: { category?: string }) =>
            options?.category ? `${key}(${options.category})` : key,
        });

      it('lists the category, template, collection and catalog listing as rows of one table', async () => {
        const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
        const group = (await getByTestId(element, 'organization'))!;
        expect(Array.from(group.children).map(child => child.getAttribute('infer'))).to.deep.equal([
          'category',
          'template',
          'collection',
          'hidden',
        ]);
        for (const child of Array.from(group.querySelectorAll('[infer]')).slice(0, 3)) {
          expect(child).to.have.attribute('layout', 'summary-item');
        }
      });

      it('says where an inherited category comes from, on its row and in secondary text', async () => {
        const element = await fixture<ProductForm>(html`
          <foxy-product-form
            item-categories="https://demo.api/hapi/stores/0/item_categories"
          ></foxy-product-form>
        `);
        showOptions(element);
        expect(picker(element)).to.have.class('pd-unset');

        element.parentProduct = {
          product_type: 'template',
          compiled_definition: { category_code: 'TICKETS' },
        } as Data;
        await element.requestUpdate();
        expect(picker(element).placeholder).to.equal('general.category.from_template(TICKETS)');
        expect(picker(element).helperText).to.equal('');
        expect(picker(element)).to.have.class('pd-unset');

        element.parentProduct = {
          product_type: 'parent',
          compiled_definition: { category_code: 'TICKETS' },
        } as Data;
        await element.requestUpdate();
        expect(picker(element).placeholder).to.equal('general.category.from_parent(TICKETS)');

        element.edit({ definition: { category_code: 'VIP-TICKETS' } });
        await element.requestUpdate();
        expect(picker(element).placeholder).to.not.include('TICKETS');
        expect(picker(element)).to.not.have.class('pd-unset');
      });

      it("names an inherited category by the store's item category, or by its code", async () => {
        const router = createRouter();
        const requests: string[] = [];
        const categories = {
          total_items: 2,
          _embedded: {
            'fx:item_categories': [
              { code: 'WHOLE-BEAN', name: 'Whole bean coffee' },
              { code: 'GIFT-WRAP', name: 'Gift wrap' },
            ],
          },
        };
        const element = await fixture<ProductForm>(html`
          <foxy-product-form
            href="https://demo.api/hapi/products/0"
            @fetch=${(evt: FetchEvent) => {
              if (!evt.request.url.includes('/item_categories')) return router.handleEvent(evt);
              requests.push(evt.request.url);
              evt.preventDefault();
              evt.respondWith(Promise.resolve(new Response(JSON.stringify(categories))));
            }}
          ></foxy-product-form>
        `);
        await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
        showOptions(element);
        expect(requests).to.have.length(1);
        expect(requests[0]).to.include('https://demo.api/hapi/stores/0/item_categories?');

        element.parentProduct = {
          product_type: 'template',
          compiled_definition: { category_code: 'WHOLE-BEAN' },
        } as Data;
        await element.requestUpdate();
        expect(picker(element).placeholder).to.equal(
          'general.category.from_template(Whole bean coffee)'
        );

        element.parentProduct = {
          product_type: 'template',
          compiled_definition: { category_code: 'HOLIDAY-GIFTS' },
        } as Data;
        await element.requestUpdate();
        expect(picker(element).placeholder).to.equal(
          'general.category.from_template(HOLIDAY-GIFTS)'
        );
      });

      it("takes a category compiled in that nothing it inherits from sets as its collection's", async () => {
        const router = createRouter();
        const product = await getTestData<Data>('https://demo.api/hapi/products/0', router);
        const element = await fixture<ProductForm>(html`
          <foxy-product-form
            .data=${{
              ...product,
              definition: { ...product.definition, category_code: undefined },
              compiled_definition: { ...product.definition, category_code: 'APPAREL' },
            }}
          ></foxy-product-form>
        `);
        showOptions(element);
        await element.requestUpdate();
        expect(picker(element).placeholder).to.equal('general.category.from_collection(APPAREL)');
      });

      it("shows a collection after its ancestors' names", async () => {
        const router = createRouter();
        const element = await fixture<ProductForm>(html`
          <foxy-product-form
            href="https://demo.api/hapi/products/1"
            product-collections="https://demo.api/hapi/product_collections"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          ></foxy-product-form>
        `);
        await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
        const collections = element.renderRoot.querySelector(
          'foxy-internal-resource-picker-control[infer="collection"]'
        ) as HTMLElement & { getDisplayValueOptions: (c: unknown) => { label: string } };
        const apparel = await getTestData('https://demo.api/hapi/product_collections/1', router);
        expect(collections.getDisplayValueOptions(apparel)).to.deep.equal({
          label: 'All Products › Apparel',
        });
      });
    });

    it('binds the SKU control directly (top-level field, no nested property)', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const ctrl = element.renderRoot.querySelector(
        'foxy-internal-text-control[infer="sku"]'
      ) as HTMLElement | null;
      expect(ctrl).to.exist;
      expect(ctrl?.getAttribute('property')).to.be.null;
    });

    describe('item category', () => {
      type Picker = HTMLElement & {
        getValue: () => string | undefined;
        setValue: (href: string) => Promise<void>;
        getDisplayValueOptions: (resource: unknown) => { label?: string };
        searchFields: string[];
        placeholder: string;
      };

      const categories = 'https://demo.api/hapi/stores/0/item_categories';

      async function render(onFetch: (evt: FetchEvent) => void = () => void 0) {
        const element = await fixture<ProductForm>(html`
          <foxy-product-form item-categories=${categories} @fetch=${onFetch}></foxy-product-form>
        `);
        const picker = element.renderRoot.querySelector(
          'foxy-internal-resource-picker-control[infer="category"]'
        ) as Picker;
        return { element, picker };
      }

      it("picks from the store's item categories, searched by name or code", async () => {
        const { picker } = await render();
        expect(picker.getAttribute('first')).to.equal(categories);
        expect(picker.getAttribute('item')).to.equal('foxy-item-category-card');
        expect(picker.searchFields).to.deep.equal(['name', 'code']);
        expect(customElements.get('foxy-item-category-card')).to.exist;
      });

      it('stores the code of the category picked, and nothing once cleared', async () => {
        const { element, picker } = await render(evt => {
          evt.preventDefault();
          evt.respondWith(Promise.resolve(new Response(JSON.stringify({ code: 'WHOLE-BEAN' }))));
        });
        element.edit({ definition: { name: 'Colombia Huila' } });

        await picker.setValue(`${categories}/5874`);
        expect(element.form.definition).to.deep.equal({
          name: 'Colombia Huila',
          category_code: 'WHOLE-BEAN',
        });
        expect(picker.getValue()).to.equal(`${categories}?code=WHOLE-BEAN&limit=1`);

        await picker.setValue('');
        expect(element.form.definition).to.deep.equal({ name: 'Colombia Huila' });
        expect(picker.getValue()).to.be.undefined;
      });

      it('keeps the category when the one picked fails to load', async () => {
        const { element, picker } = await render(evt => {
          evt.preventDefault();
          evt.respondWith(Promise.resolve(new Response('{}', { status: 500 })));
        });
        element.edit({ definition: { category_code: 'WHOLE-BEAN' } });
        await picker.setValue(`${categories}/5874`);
        expect(element.form.definition?.category_code).to.equal('WHOLE-BEAN');
      });

      it("shows the category's name, or the code when no category has it", async () => {
        const { element, picker } = await render();
        element.edit({ definition: { category_code: 'WHOLE-BEAN' } });
        const found = { _embedded: { 'fx:item_categories': [{ name: 'Whole bean coffee' }] } };
        expect(picker.getDisplayValueOptions(found)).to.deep.equal({ label: 'Whole bean coffee' });
        expect(picker.getDisplayValueOptions({ _embedded: {} })).to.deep.equal({
          label: 'WHOLE-BEAN',
        });
      });

      it('shows the inherited category in place of an empty one', async () => {
        const { element, picker } = await render();
        element.parentProduct = { compiled_definition: { category_code: 'TICKETS' } } as Data;
        await element.requestUpdate();
        expect(picker.placeholder).to.include('from_parent');
      });

      it("falls back to the item categories of the product's store", async () => {
        const router = createRouter();
        const data = await getTestData<Data>('https://demo.api/hapi/products/0', router);
        const element = await fixture<ProductForm>(html`
          <foxy-product-form
            .data=${data}
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          ></foxy-product-form>
        `);
        const picker = element.renderRoot.querySelector(
          'foxy-internal-resource-picker-control[infer="category"]'
        )!;
        expect(picker.getAttribute('first')).to.equal(
          `${data._links['fx:store'].href}/item_categories`
        );
      });
    });

    it('lists the collection picker by path, so each collection follows its parent', async () => {
      const element = await fixture<ProductForm>(html`
        <foxy-product-form
          product-collections="https://demo.api/hapi/product_collections"
        ></foxy-product-form>
      `);
      const picker = element.renderRoot.querySelector(
        'foxy-internal-resource-picker-control[infer="collection"]'
      ) as HTMLElement | null;
      expect(picker?.getAttribute('first')).to.equal(
        'https://demo.api/hapi/product_collections?order=path+asc'
      );
      expect(picker).to.have.deep.property('searchFields', ['name', 'path']);
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
      expect(element.hiddenSelector.matches('stock-rules', true)).to.be.true;
      expect(element.hiddenSelector.matches('template-products', true)).to.be.true;
      expect(element.hiddenSelector.matches('variants', true)).to.be.true;
      expect(element.hiddenSelector.matches('general:kind', true)).to.be.false;
    });

    it('fixes the kind once saved, and keeps templates off variants', async () => {
      const data = {
        product_type: 'variant',
        _links: { self: { href: 'https://demo.api/hapi/products/2' } },
      } as unknown as Data;
      const element = await fixture<ProductForm>(html`
        <foxy-product-form
          href="https://demo.api/hapi/products/2"
          .data=${data}
        ></foxy-product-form>
      `);
      expect(element.hiddenSelector.matches('general:kind', true)).to.be.true;
      expect(element.hiddenSelector.matches('general:template', true)).to.be.true;
    });
  });

  describe('images', () => {
    it('renders the description and images controls', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const root = element.renderRoot;

      expect(
        root.querySelector('foxy-internal-product-form-description-control[infer="description"]')
      ).to.exist;
      expect(root.querySelector('foxy-internal-product-form-images-control[infer="images"]')).to
        .exist;
    });

    it('uploads an image through fx:create_upload_url and a signed form post', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const createUploadUrl = 'https://demo.api/s/admin/products/1/create_upload_url';
      const uploadUrl = 'https://uploads.example.test/';
      const uploadFields = {
        'key': 'products/store_1/products/1/01J.png',
        'Content-Type': 'image/png',
        'Policy': 'eyJleHBpcmF0aW9uIjoiMjAyNi0xMS0xOVQwMDoxNTowMFoifQ==',
        'X-Amz-Signature': '9f2c4e61b7a05d3388c1e4f7a2b6d09c5e7f1a3b',
      };
      const imageUrl = 'https://images.example.test/products/store_1/products/1/01J.png';
      const product = await getTestData<Data>('https://demo.api/hapi/products/0', createRouter());
      element.data = {
        ...product,
        _links: { ...product._links, 'fx:create_upload_url': { href: createUploadUrl } },
      } as Data;

      // The form's tag and variant lists fetch too; only the upload link matters here.
      const apiRequests: Request[] = [];
      element.addEventListener('fetch', (evt: Event) => {
        const fetchEvent = evt as FetchEvent;
        fetchEvent.preventDefault();
        if (fetchEvent.request.url !== createUploadUrl) {
          fetchEvent.respondWith(Promise.resolve(new Response(null, { status: 404 })));
          return;
        }
        apiRequests.push(fetchEvent.request);
        fetchEvent.respondWith(
          Promise.resolve(
            new Response(
              JSON.stringify({
                upload_url: uploadUrl,
                upload_fields: uploadFields,
                max_bytes: 10485760,
                image_url: imageUrl,
              })
            )
          )
        );
      });

      const originalFetch = window.fetch;
      const puts: { url: string; init?: RequestInit }[] = [];
      window.fetch = (async (url: string, init?: RequestInit) => {
        puts.push({ url, init });
        return new Response(null, { status: 200 });
      }) as typeof window.fetch;

      const file = new File(['png'], 'tee-front.png', { type: 'image/png' });
      try {
        expect(await element.uploadImage(file)).to.equal(imageUrl);
      } finally {
        window.fetch = originalFetch;
      }

      expect(apiRequests).to.have.length(1);
      expect(apiRequests[0].url).to.equal(createUploadUrl);
      expect(apiRequests[0].method).to.equal('POST');
      expect(await apiRequests[0].json()).to.deep.equal({ type: 'image/png', size: 3 });

      expect(puts).to.have.length(1);
      expect(puts[0].url).to.equal(uploadUrl);
      expect(puts[0].init?.method).to.equal('POST');
      const sent = Array.from((puts[0].init?.body as FormData).entries());
      expect(
        sent.map(([name]) => name),
        'every field, then the file'
      ).to.deep.equal([...Object.keys(uploadFields), 'file']);
      expect(sent.slice(0, -1).map(([, value]) => value)).to.deep.equal(
        Object.values(uploadFields)
      );
      expect(sent[sent.length - 1][1]).to.be.instanceOf(File);
      expect((sent[sent.length - 1][1] as File).name).to.equal('tee-front.png');
    });

    it('refuses an image over 10 MB before asking for somewhere to put it', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const product = await getTestData<Data>('https://demo.api/hapi/products/0', createRouter());
      element.data = {
        ...product,
        _links: {
          ...product._links,
          'fx:create_upload_url': { href: 'https://demo.api/s/admin/products/0/create_upload_url' },
        },
      } as Data;

      let asked = 0;
      element.addEventListener('fetch', (evt: Event) => {
        const fetchEvent = evt as FetchEvent;
        fetchEvent.preventDefault();
        if (fetchEvent.request.url.endsWith('/create_upload_url')) asked += 1;
        fetchEvent.respondWith(Promise.resolve(new Response(null, { status: 404 })));
      });

      // One byte over the limit.
      const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'tee-poster.png', {
        type: 'image/png',
      });
      let error: unknown = null;
      try {
        await element.uploadImage(file);
      } catch (err) {
        error = err;
      }

      expect(error).to.be.instanceOf(ImageTooLargeError);
      expect((error as Error).message).to.equal('Images can be at most 10 MB.');
      expect(asked).to.equal(0);
    });

    it('says an image is too large when the API answers 413, and uploads nothing', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const product = await getTestData<Data>('https://demo.api/hapi/products/0', createRouter());
      element.data = {
        ...product,
        _links: {
          ...product._links,
          'fx:create_upload_url': { href: 'https://demo.api/s/admin/products/0/create_upload_url' },
        },
      } as Data;
      element.addEventListener('fetch', (evt: Event) => {
        const fetchEvent = evt as FetchEvent;
        fetchEvent.preventDefault();
        const tooLarge = fetchEvent.request.url.endsWith('/create_upload_url');
        fetchEvent.respondWith(
          Promise.resolve(new Response(null, { status: tooLarge ? 413 : 404 }))
        );
      });

      const originalFetch = window.fetch;
      let sent = 0;
      window.fetch = (async () => {
        sent += 1;
        return new Response(null, { status: 204 });
      }) as typeof window.fetch;

      try {
        const control = element.renderRoot.querySelector(
          'foxy-internal-product-form-images-control'
        ) as HTMLElement & { requestUpdate: () => Promise<unknown>; renderRoot: ShadowRoot };
        await element.requestUpdate();
        await control.requestUpdate();
        const input = control.renderRoot.querySelector<HTMLInputElement>('input[type="file"]')!;
        const picked = new DataTransfer();
        picked.items.add(new File(['jpg'], 'tee-flat.jpg', { type: 'image/jpeg' }));
        input.files = picked.files;
        input.dispatchEvent(new Event('change'));

        await waitUntil(() => !!control.renderRoot.querySelector('[role="alert"]'));
        expect(control.renderRoot.querySelector('[role="alert"]')).to.include.text(
          'error_too_large'
        );
      } finally {
        window.fetch = originalFetch;
      }
      expect(sent).to.equal(0);
    });

    it('refuses to upload for a product without fx:create_upload_url', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      element.data = await getTestData<Data>('https://demo.api/hapi/products/0', createRouter());
      let error: unknown = null;

      try {
        await element.uploadImage(new File(['png'], 'tee.png', { type: 'image/png' }));
      } catch (err) {
        error = err;
      }

      expect(error).to.be.instanceOf(Error);
    });

    type ImagesControl = HTMLElement & {
      updateComplete: Promise<unknown>;
      requestUpdate: () => Promise<unknown>;
      renderRoot: ShadowRoot;
    };

    const front = { src: 'https://images.example.test/tee-front.jpg', alt: 'Black tee, front' };
    const back = { src: 'https://images.example.test/tee-back.jpg', alt: 'Black tee, back' };
    const detail = { src: 'https://images.example.test/tee-hem.jpg', alt: 'Hem stitching' };

    async function withImages(uploadLink = false) {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const product = await getTestData<Data>('https://demo.api/hapi/products/0', createRouter());
      element.data = {
        ...product,
        definition: { ...product.definition, images: [front, back, detail] },
        _links: uploadLink
          ? {
              ...product._links,
              'fx:create_upload_url': {
                href: 'https://demo.api/s/admin/products/0/create_upload_url',
              },
            }
          : product._links,
      } as Data;
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(
        'foxy-internal-product-form-images-control'
      ) as ImagesControl;
      await control.updateComplete;
      const all = (testid: string) =>
        Array.from(
          control.renderRoot.querySelectorAll<HTMLButtonElement>(`[data-testid="${testid}"]`)
        );
      const settle = async () => {
        await element.requestUpdate();
        await control.requestUpdate();
      };
      return { element, control, all, settle };
    }

    it('moves an image left or right with buttons named for what they do', async () => {
      const { element, all, settle } = await withImages();

      expect(all('image-move-left').map(b => b.disabled)).to.deep.equal([true, false, false]);
      expect(all('image-move-right').map(b => b.disabled)).to.deep.equal([false, false, true]);
      for (const testid of ['image-move-left', 'image-move-right', 'image-remove']) {
        for (const button of all(testid)) {
          expect(button.getAttribute('aria-label'), testid).to.be.a('string').and.not.be.empty;
          expect(button.textContent!.trim(), 'shows an icon, not words').to.equal('');
        }
      }

      all('image-move-right')[0].click();
      expect(element.form.definition?.images).to.deep.equal([back, front, detail]);

      await settle();
      all('image-move-left')[2].click();
      expect(element.form.definition?.images).to.deep.equal([back, detail, front]);

      await settle();
      all('image-remove')[1].click();
      expect(element.form.definition?.images).to.deep.equal([back, front]);
    });

    it('marks the main image with a pressed star, and makes another one main', async () => {
      const { element, all, settle } = await withImages();

      expect(all('image-main').map(b => b.getAttribute('aria-pressed'))).to.deep.equal([
        'true',
        'false',
        'false',
      ]);
      expect(all('image-main').map(b => b.getAttribute('aria-label'))).to.deep.equal([
        'main',
        'make_main',
        'make_main',
      ]);
      expect(all('image-main')[0].querySelector('svg')).to.have.attribute('fill', 'currentColor');
      expect(all('image-main')[1].querySelector('svg')).to.have.attribute('fill', 'none');

      all('image-main')[2].click();
      expect(element.form.definition?.images).to.deep.equal([detail, front, back]);

      await settle();
      all('image-main')[0].click();
      expect(element.form.definition?.images, 'the main image stays main').to.deep.equal([
        detail,
        front,
        back,
      ]);
    });

    it('reorders images by dragging one onto another', async () => {
      const { element, control, all, settle } = await withImages();
      const cards = () => all('image') as HTMLElement[];
      const drag = (type: string) =>
        new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() });

      cards()[2].querySelector('img')!.dispatchEvent(drag('dragstart'));
      await control.requestUpdate();
      const over = drag('dragover');
      cards()[0].dispatchEvent(over);
      expect(over.defaultPrevented, 'another image takes the drop').to.be.true;
      await control.requestUpdate();
      expect(cards()[0]).to.have.class('pd-drop');

      cards()[0].dispatchEvent(drag('drop'));
      expect(element.form.definition?.images).to.deep.equal([detail, front, back]);
      await settle();
      expect(control.renderRoot.querySelector('.pd-drop, .pd-dragging')).to.not.exist;

      // Something else dragged over the images, such as a file, is not theirs to take.
      const foreign = drag('dragover');
      cards()[1].dispatchEvent(foreign);
      expect(foreign.defaultPrevented).to.be.false;
    });

    it('edits alt text in a field that stays inside its card', async () => {
      const { element, all } = await withImages();
      const alt = all('image-alt')[1] as unknown as HTMLInputElement;
      expect(alt.value).to.equal('Black tee, back');
      expect(alt).to.have.attribute('aria-label', 'alt_label');

      alt.value = 'Black tee, back, on a hanger';
      alt.dispatchEvent(new Event('change'));
      expect(element.form.definition?.images?.[1]).to.deep.equal({
        ...back,
        alt: 'Black tee, back, on a hanger',
      });

      const card = all('image')[1].getBoundingClientRect();
      for (const child of Array.from(all('image')[1].children)) {
        const box = child.getBoundingClientRect();
        expect(box.left, child.tagName).to.be.at.least(card.left);
        expect(box.right, child.tagName).to.be.at.most(card.right);
      }
    });

    it('comes after the name, SKU, price and description', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const general = element.renderRoot.querySelector('#section-general')!;
      const order = Array.from(general.children).map(child => child.getAttribute('infer'));
      expect(order.indexOf('images')).to.be.greaterThan(order.indexOf('general'));
      expect(order.indexOf('images')).to.be.greaterThan(order.indexOf('description'));
    });

    it('asks for a new product to be saved in place of an uploader', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const control = element.renderRoot.querySelector(
        'foxy-internal-product-form-images-control'
      ) as ImagesControl;
      await control.updateComplete;

      const note = control.renderRoot.querySelector('[data-testid="save-first"]');
      expect(note).to.include.text('save_first');
      expect(control.renderRoot.querySelector('input[type="file"]')).to.not.exist;
      expect(control.renderRoot.querySelector('[data-testid="add-images"]')).to.not.exist;
    });

    it('adds the images picked to the end, with a starting alt text', async () => {
      const { element, control, all, settle } = await withImages(true);
      expect(control.renderRoot.querySelector('[data-testid="save-first"]')).to.not.exist;

      const uploaded: File[] = [];
      element.uploadImage = async (file: File) => {
        uploaded.push(file);
        if (file.type === 'text/plain') throw new Error('Not an image.');
        return `https://images.example.test/${file.name}`;
      };

      const input = all('add-images')[0].querySelector('input')!;
      expect(input.accept).to.equal('image/jpeg,image/png,image/gif,image/webp');
      const picked = new DataTransfer();
      picked.items.add(new File(['jpg'], 'tee-flat.jpg', { type: 'image/jpeg' }));
      picked.items.add(new File(['txt'], 'care-notes.txt', { type: 'text/plain' }));
      input.files = picked.files;
      input.dispatchEvent(new Event('change'));

      await waitUntil(() => uploaded.length === 2);
      await settle();
      const name = element.form.definition?.name;
      expect(element.form.definition?.images).to.deep.equal([
        front,
        back,
        detail,
        { src: 'https://images.example.test/tee-flat.jpg', alt: name ? 'alt_default' : '' },
      ]);
      await waitUntil(() => !!control.renderRoot.querySelector('[role="alert"]'));
      expect(control.renderRoot.querySelector('[role="alert"]')).to.include.text('error_upload');
    });

    it('adds an image by its URL, without an upload link', async () => {
      const { element, control, all, settle } = await withImages();
      expect(all('add-images'), 'no upload without the link').to.have.length(0);
      const toggle = all('images-by-url')[0];
      expect(toggle).to.have.attribute('aria-pressed', 'false');
      expect(toggle).to.have.attribute('aria-label', 'by_url');

      toggle.click();
      await control.requestUpdate();
      await control.updateComplete;
      const input = () => all('images-url-input')[0] as unknown as HTMLInputElement;
      expect(all('images-by-url')[0]).to.have.attribute('aria-pressed', 'true');
      expect(control.renderRoot.activeElement, 'focus moves into the field').to.equal(input());

      const enter = (value: string) => {
        input().value = value;
        input().dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
        );
      };

      // The API takes https only, with a host.
      for (const refused of ['http://cdn.example.test/tee.jpg', 'https:///tee.jpg', 'tee.jpg']) {
        enter(refused);
        await control.requestUpdate();
        expect(all('images-url-error')[0], refused).to.include.text('url_invalid');
        expect(element.form.definition?.images).to.have.length(3);
      }

      enter('https://cdn.example.test/products/tee-folded.jpg');
      await settle();
      await control.updateComplete;
      expect(element.form.definition?.images?.[3]).to.deep.equal({
        src: 'https://cdn.example.test/products/tee-folded.jpg',
        alt: element.form.definition?.name ? 'alt_default' : '',
      });
      expect(all('images-url-input')).to.have.length(0);
      expect(control.renderRoot.activeElement, 'focus goes back to the link').to.equal(
        all('images-by-url')[0]
      );
    });

    it('takes an image URL with its Add button, and leaves the field on Escape', async () => {
      const { element, control, all, settle } = await withImages(true);
      all('images-by-url')[0].click();
      await control.requestUpdate();
      expect(all('add-images'), 'uploading stays offered beside the URL field').to.have.length(1);

      const input = all('images-url-input')[0] as unknown as HTMLInputElement;
      input.value = '  https://cdn.example.test/tee-tag.png ';
      all('images-url-add')[0].click();
      await settle();
      expect(element.form.definition?.images?.map(image => image.src)).to.include(
        'https://cdn.example.test/tee-tag.png'
      );

      all('images-by-url')[0].click();
      await control.requestUpdate();
      const escape = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      let reachedOutside = false;
      control.addEventListener('keydown', () => (reachedOutside = true), { once: true });
      all('images-url-input')[0].dispatchEvent(escape);
      await control.requestUpdate();
      await control.updateComplete;
      expect(all('images-url-input')).to.have.length(0);
      expect(reachedOutside, 'a dialog around the form stays open').to.be.false;
      expect(control.renderRoot.activeElement).to.equal(all('images-by-url')[0]);
    });

    it('offers an image URL on a new product, which has nothing to upload to', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const control = element.renderRoot.querySelector(
        'foxy-internal-product-form-images-control'
      ) as ImagesControl;
      await control.updateComplete;
      const toggle = control.renderRoot.querySelector<HTMLButtonElement>(
        '[data-testid="images-by-url"]'
      )!;
      expect(toggle.disabled).to.be.false;
      toggle.click();
      await control.requestUpdate();
      const input = control.renderRoot.querySelector<HTMLInputElement>(
        '[data-testid="images-url-input"]'
      )!;
      input.value = 'https://cdn.example.test/new-tee.jpg';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
      expect(element.form.definition?.images).to.deep.equal([
        { src: 'https://cdn.example.test/new-tee.jpg', alt: '' },
      ]);
    });

    it('shows every preview through getThumbnailUrl, then the image, then a placeholder', async () => {
      const { element, control, all, settle } = await withImages();
      const thumb = (src: string) => `https://img.example.test/80/${encodeURIComponent(src)}`;
      element.getThumbnailUrl = thumb;
      await settle();

      const img = () => all('image')[1].querySelector('img')!;
      expect(img().getAttribute('src')).to.equal(thumb(back.src));

      img().dispatchEvent(new Event('error'));
      expect(img().getAttribute('src'), 'the image itself').to.equal(back.src);
      img().dispatchEvent(new Event('error'));
      expect(img().getAttribute('src')).to.match(/^data:image\/svg\+xml/);
      img().dispatchEvent(new Event('error'));
      expect(img().getAttribute('src'), 'stays on the placeholder').to.match(/^data:image\/svg/);

      element.getThumbnailUrl = null;
      await settle();
      expect(control.renderRoot.querySelectorAll('img')[2].getAttribute('src')).to.equal(
        detail.src
      );
    });
  });

  describe('options, modifiers and links', () => {
    type Control = HTMLElement & {
      updateComplete: Promise<unknown>;
      requestUpdate: () => Promise<unknown>;
      renderRoot: ShadowRoot;
    };

    async function load(
      id: number,
      attrs: { defaultDomain: string; storefrontScript?: string } = {
        defaultDomain: 'foxycart.com',
      }
    ) {
      const router = createRouter();
      const element = await fixture<ProductForm>(html`
        <foxy-product-form
          href="https://demo.api/hapi/products/${id}"
          parent="https://demo.api/hapi/stores/0/products"
          default-domain=${attrs.defaultDomain}
          storefront-script=${ifDefined(attrs.storefrontScript)}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-product-form>
      `);
      await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
      await element.requestUpdate();
      return { element, router };
    }

    // A control re-renders after the form does, so wait for both before querying it again.
    async function settle(element: ProductForm, ctrl: Control) {
      await element.requestUpdate();
      await ctrl.requestUpdate?.();
      await ctrl.updateComplete;
    }

    async function control(element: ProductForm, selector: string) {
      const found = element.renderRoot.querySelector(selector) as Control | null;
      await found?.updateComplete;
      return found;
    }

    const byTestId = (root: ParentNode, id: string) =>
      Array.from(root.querySelectorAll(`[data-testid="${id}"]`)) as HTMLElement[];

    const buttonsIn = (root: ParentNode, text: string) =>
      Array.from(root.querySelectorAll('button')).filter(b => b.textContent?.trim() === text);

    it('offers options on a standalone or parent, and not on a variant or template', async () => {
      const options = 'foxy-internal-product-form-options-control';
      expect((await load(0)).element.renderRoot.querySelector(options)).to.exist;
      expect((await load(1)).element.renderRoot.querySelector(options)).to.exist;
      expect((await load(2)).element.renderRoot.querySelector(options)).to.not.exist;
      expect((await load(4)).element.renderRoot.querySelector(options)).to.not.exist;
    });

    it('adds, edits and reorders options and their values', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      element.edit({ definition: { name: 'Organic Cotton Tee' } });
      const options = (await control(element, 'foxy-internal-product-form-options-control'))!;

      (byTestId(options.renderRoot, 'add-option')[0] as HTMLElement).click();
      await settle(element, options);
      const name = byTestId(options.renderRoot, 'option-name')[0] as HTMLInputElement;
      name.value = 'size';
      name.dispatchEvent(new Event('change'));
      await settle(element, options);

      const value = byTestId(options.renderRoot, 'value-value')[0] as HTMLInputElement;
      value.value = 'M';
      value.dispatchEvent(new Event('change'));
      await settle(element, options);
      byTestId(options.renderRoot, 'add-value')[0].click();
      await settle(element, options);
      const second = byTestId(options.renderRoot, 'value-value')[1] as HTMLInputElement;
      second.value = '2XL';
      second.dispatchEvent(new Event('change'));
      await settle(element, options);
      // Price and weight changes are tucked away until asked for.
      expect(byTestId(options.renderRoot, 'value-price-mod')).to.have.length(0);
      const amounts = byTestId(options.renderRoot, 'value-amounts')[1];
      expect(amounts).to.have.attribute('aria-expanded', 'false');
      expect(amounts.textContent!.trim()).to.equal('amounts_none');
      amounts.click();
      await settle(element, options);
      const price = byTestId(options.renderRoot, 'value-price-mod')[0] as HTMLInputElement;
      price.value = ' 2.35 ';
      price.dispatchEvent(new Event('change'));
      await settle(element, options);
      const weight = byTestId(options.renderRoot, 'value-weight-mod')[0] as HTMLInputElement;
      weight.value = '0.15';
      weight.dispatchEvent(new Event('change'));
      await settle(element, options);
      byTestId(options.renderRoot, 'value-amounts')[1].click();
      await settle(element, options);
      expect(byTestId(options.renderRoot, 'value-price-mod')).to.have.length(0);
      expect(byTestId(options.renderRoot, 'value-amounts')[1].textContent!.trim()).to.equal(
        'amounts_price · amounts_weight'
      );

      expect(element.form.definition?.options).to.deep.equal([
        {
          name: 'size',
          values: [{ value: 'M' }, { value: '2XL', price_mod: '2.35', weight_mod: 0.15 }],
        },
      ]);

      const actions = byTestId(options.renderRoot, 'value-actions')[0];
      expect(
        Array.from(actions.querySelectorAll('button')).map(b => b.getAttribute('aria-label'))
      ).to.deep.equal(['move_up', 'move_down', 'remove']);
      byTestId(actions, 'move-down')[0].click();
      expect(element.form.definition?.options?.[0].values.map(v => v.value)).to.deep.equal([
        '2XL',
        'M',
      ]);
      expect(element.form.definition?.name).to.equal('Organic Cotton Tee');
    });

    it('makes the fields that stopped a save stand out once a save was tried', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      element.edit({ definition: { price: '1999.99' } });
      await element.requestUpdate();
      const row = (infer: string) =>
        element.renderRoot.querySelector(`foxy-internal-summary-control [infer="${infer}"]`)!;
      expect(row('name')).to.not.have.class('pd-invalid');

      element.submit();
      await element.requestUpdate();
      expect(row('name')).to.have.class('pd-invalid');
      expect(row('sku')).to.have.class('pd-invalid');
      expect(row('price')).to.not.have.class('pd-invalid');

      element.edit({ sku: 'REVSTAR-01' });
      await element.requestUpdate();
      expect(row('sku')).to.not.have.class('pd-invalid');
    });

    it("marks a new option's empty fields only once they are left, it is done or a save is tried", async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const options = (await control(element, 'foxy-internal-product-form-options-control'))!;
      const root = options.renderRoot;
      const name = () => byTestId(root, 'option-name')[0] as HTMLElement & { invalid: boolean };
      const marked = () => byTestId(root, 'row-errors').map(node => node.textContent!.trim());

      (byTestId(root, 'add-option')[0] as HTMLElement).click();
      await settle(element, options);
      expect(name().invalid, 'fresh name').to.be.false;
      expect(marked(), 'fresh value').to.deep.equal([]);

      name().dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true }));
      await settle(element, options);
      expect(name().invalid, 'name left empty').to.be.true;
      expect(marked(), 'value not reached yet').to.deep.equal([]);

      // Done shows what is still missing, and stays open to fill it in.
      byTestId(root, 'manage-option')[0].click();
      await settle(element, options);
      expect(byTestId(root, 'option-editor')).to.have.length(1);
      expect(marked()[0]).to.include('v8n_value_required');
    });

    it('marks every missing option and modifier field once a save is tried', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const options = (await control(element, 'foxy-internal-product-form-options-control'))!;
      const modifiers = (await control(element, 'foxy-internal-product-form-modifiers-control'))!;
      (byTestId(options.renderRoot, 'add-option')[0] as HTMLElement).click();
      (byTestId(modifiers.renderRoot, 'add-modifier')[0] as HTMLElement).click();
      await settle(element, options);
      await settle(element, modifiers);

      const invalid = (ctrl: Control, testid: string) =>
        (byTestId(ctrl.renderRoot, testid)[0] as HTMLElement & { invalid: boolean }).invalid;
      expect(invalid(options, 'option-name')).to.be.false;
      expect(invalid(modifiers, 'modifier-name')).to.be.false;

      element.submit();
      await settle(element, options);
      await settle(element, modifiers);
      expect(invalid(options, 'option-name')).to.be.true;
      expect(byTestId(options.renderRoot, 'row-errors')).to.have.length(1);
      expect(invalid(modifiers, 'modifier-name')).to.be.true;
    });

    it('leaves a value added to a saved option unmarked until it is left', async () => {
      const { element, options } = await withSwatches();
      (byTestId(options.renderRoot, 'add-value')[0] as HTMLElement).click();
      await settle(element, options);
      expect(byTestId(options.renderRoot, 'option-value')).to.have.length(3);
      expect(byTestId(options.renderRoot, 'row-errors')).to.have.length(0);

      const added = byTestId(options.renderRoot, 'value-value')[2];
      added.dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true }));
      await settle(element, options);
      expect(added).to.have.attribute('aria-invalid', 'true');
    });

    it('adds a value without losing the one still being typed', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const options = (await control(element, 'foxy-internal-product-form-options-control'))!;
      (byTestId(options.renderRoot, 'add-option')[0] as HTMLElement).click();
      await settle(element, options);

      // Typed but not yet saved: a field saves when focus leaves it.
      const value = byTestId(options.renderRoot, 'value-value')[0] as HTMLInputElement;
      value.focus();
      value.value = 'Natural Sunburst';
      const add = byTestId(options.renderRoot, 'add-value')[0];
      const pressed = new MouseEvent('mousedown', { cancelable: true, bubbles: true });
      add.dispatchEvent(pressed);
      expect(pressed.defaultPrevented).to.be.true;
      value.addEventListener('blur', () => value.dispatchEvent(new Event('change')), {
        once: true,
      });
      add.click();
      await settle(element, options);

      expect(element.form.definition?.options?.[0].values).to.deep.equal([
        { value: 'Natural Sunburst' },
        { value: '' },
      ]);
      const fields = byTestId(options.renderRoot, 'value-value') as HTMLInputElement[];
      expect(fields.map(field => field.value)).to.deep.equal(['Natural Sunburst', '']);
    });

    async function withSwatches(uploadLink = true) {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const product = await getTestData<Data>('https://demo.api/hapi/products/0', createRouter());
      const finish = {
        name: 'finish',
        label: 'Finish',
        values: [
          { value: 'Swift Blue', sku_code: 'SWB', color: '#1f7a8c' },
          { value: 'Hot Merlot', sku_code: 'HML', price_mod: '79.50' },
        ],
      };
      element.data = {
        ...product,
        definition: { ...product.definition, options: [finish] },
        _links: uploadLink
          ? {
              ...product._links,
              'fx:create_upload_url': {
                href: 'https://demo.api/s/admin/products/0/create_upload_url',
              },
            }
          : product._links,
      } as Data;
      await element.requestUpdate();
      const options = (await control(element, 'foxy-internal-product-form-options-control'))!;
      byTestId(options.renderRoot, 'manage-option')[0].click();
      await settle(element, options);
      const values = () => element.form.definition!.options![0].values;
      return { element, options, values };
    }

    it('lays a value out as its main fields, then its swatch, then price and weight', async () => {
      const { options } = await withSwatches();
      const row = byTestId(options.renderRoot, 'option-value')[1];

      const main = row.querySelector('.pd-value-main')!;
      expect(
        Array.from(main.querySelectorAll('input')).map(input => input.dataset.testid)
      ).to.deep.equal(['value-value', 'value-label', 'value-sku-code']);
      for (const input of Array.from(main.querySelectorAll('input'))) {
        expect(input.getAttribute('aria-label')).to.be.a('string').and.not.be.empty;
      }

      const appearance = byTestId(row, 'value-appearance')[0];
      expect(appearance).to.have.attribute('role', 'group');
      expect(byTestId(appearance, 'value-color')).to.have.length(1);
      expect(byTestId(appearance, 'value-image-upload')).to.have.length(1);
      expect(byTestId(row, 'value-image-alt'), 'no alt text without an image').to.have.length(0);

      expect(byTestId(row, 'value-amounts')[0].textContent!.trim()).to.equal('amounts_price');
      expect(byTestId(row, 'value-price-mod'), 'closed until asked for').to.have.length(0);

      // Nothing in a row is wider than the row, so the list never scrolls sideways.
      const box = row.getBoundingClientRect();
      for (const node of Array.from(row.querySelectorAll('input:not(.sr-only), button, label'))) {
        expect(node.getBoundingClientRect().right).to.be.at.most(Math.ceil(box.right));
      }
    });

    it('opens the price and weight fields of a value with a mistake in them', async () => {
      const { element, options, values } = await withSwatches();
      const [blue, merlot] = values();
      element.edit({
        definition: {
          ...element.form.definition,
          options: [{ name: 'finish', values: [blue, { ...merlot, price_mod: 'about 80' }] }],
        },
      });
      await settle(element, options);

      const rows = byTestId(options.renderRoot, 'option-value');
      expect(byTestId(rows[0], 'value-price-mod')).to.have.length(0);
      const price = byTestId(rows[1], 'value-price-mod')[0];
      expect(price).to.have.attribute('aria-invalid', 'true');
      expect(price.closest('label')).to.include.text('v8n_amount_invalid');
    });

    it("picks a value's swatch color in the color picker", async () => {
      const { element, options, values } = await withSwatches();
      const pickers = byTestId(options.renderRoot, 'value-color') as (HTMLElement & {
        value: string;
        label: string;
      })[];
      expect(pickers.map(picker => picker.localName)).to.deep.equal([
        'foxy-internal-color-picker',
        'foxy-internal-color-picker',
      ]);
      expect(pickers.map(picker => picker.value)).to.deep.equal(['#1f7a8c', '']);
      expect(pickers[0].label).to.equal('color_label');

      pickers[1].value = '#6b1f2e';
      pickers[1].dispatchEvent(new Event('change'));
      expect(values()[1]).to.deep.equal({
        value: 'Hot Merlot',
        sku_code: 'HML',
        price_mod: '79.50',
        color: '#6b1f2e',
      });

      await settle(element, options);
      pickers[0].value = '';
      pickers[0].dispatchEvent(new Event('change'));
      expect(values()[0], 'no color leaves the field out').to.deep.equal({
        value: 'Swift Blue',
        sku_code: 'SWB',
      });
    });

    it("uploads a value's swatch image as product images upload, then clears it", async () => {
      const { element, options, values } = await withSwatches();
      const createUploadUrl = element.data!._links['fx:create_upload_url']!.href;
      const uploadUrl = 'https://uploads.example.test/';
      const uploadFields = {
        'key': 'products/store_1/products/0/01K.png',
        'Content-Type': 'image/png',
        'Policy': 'eyJleHBpcmF0aW9uIjoiMjAyNi0xMS0xOVQwMDoxNTowMFoifQ==',
        'X-Amz-Signature': '9f2c4e61b7a05d3388c1e4f7a2b6d09c5e7f1a3b',
      };
      const imageUrl = 'https://images.example.test/products/store_1/products/0/01K.png';
      // A small version that loads, so the swatch keeps it rather than falling back to a placeholder.
      const thumbnail =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      element.getThumbnailUrl = src => (src === imageUrl ? thumbnail : src);

      const posts: Request[] = [];
      element.addEventListener('fetch', (evt: Event) => {
        const fetchEvent = evt as FetchEvent;
        fetchEvent.preventDefault();
        if (fetchEvent.request.url !== createUploadUrl) {
          fetchEvent.respondWith(Promise.resolve(new Response(null, { status: 404 })));
          return;
        }
        posts.push(fetchEvent.request);
        fetchEvent.respondWith(
          Promise.resolve(
            new Response(
              JSON.stringify({
                upload_url: uploadUrl,
                upload_fields: uploadFields,
                max_bytes: 10485760,
                image_url: imageUrl,
              })
            )
          )
        );
      });

      const originalFetch = window.fetch;
      const puts: { url: string; init?: RequestInit }[] = [];
      window.fetch = (async (url: string, init?: RequestInit) => {
        puts.push({ url, init });
        return new Response(null, { status: 200 });
      }) as typeof window.fetch;

      const file = new File(['png'], 'swift-blue.png', { type: 'image/png' });
      try {
        const input = byTestId(options.renderRoot, 'value-image-upload')[0].querySelector('input')!;
        expect(input.type).to.equal('file');
        expect(input.accept).to.equal('image/jpeg,image/png,image/gif,image/webp');
        expect(input.disabled).to.be.false;
        const picked = new DataTransfer();
        picked.items.add(file);
        input.files = picked.files;
        input.dispatchEvent(new Event('change'));
        await waitUntil(() => !!values()[0].image);
      } finally {
        window.fetch = originalFetch;
      }

      expect(posts).to.have.length(1);
      expect(await posts[0].json()).to.deep.equal({ type: 'image/png', size: 3 });
      expect(puts).to.have.length(1);
      expect(puts[0].url).to.equal(uploadUrl);
      expect(puts[0].init?.method).to.equal('POST');
      const sent = puts[0].init?.body as FormData;
      expect(Array.from(sent.keys())).to.deep.equal([...Object.keys(uploadFields), 'file']);
      expect((sent.get('file') as File).name).to.equal(file.name);
      expect(values()[0]).to.deep.equal({
        value: 'Swift Blue',
        sku_code: 'SWB',
        color: '#1f7a8c',
        image: { src: imageUrl },
      });
      expect(element.errors).to.not.include('options:v8n_invalid');

      await settle(element, options);
      const row = byTestId(options.renderRoot, 'option-value')[0];
      expect(row.querySelector('img.pd-swatch-image')).to.have.attribute('src', thumbnail);
      const alt = byTestId(row, 'value-image-alt')[0] as HTMLInputElement;
      alt.value = 'Swift Blue finish, close up';
      alt.dispatchEvent(new Event('change'));
      expect(values()[0].image).to.deep.equal({
        src: imageUrl,
        alt: 'Swift Blue finish, close up',
      });

      await settle(element, options);
      const remove = byTestId(options.renderRoot, 'value-image-remove')[0];
      expect(remove).to.have.attribute('aria-label', 'image_remove');
      remove.click();
      expect(values()[0]).to.deep.equal({
        value: 'Swift Blue',
        sku_code: 'SWB',
        color: '#1f7a8c',
      });
    });

    it("says so when a value's image fails to upload, and keeps the value as it was", async () => {
      const { element, options, values } = await withSwatches();
      element.uploadImage = async () => {
        throw new Error('Image upload failed with 403.');
      };

      const input = byTestId(options.renderRoot, 'value-image-upload')[1].querySelector('input')!;
      const picked = new DataTransfer();
      picked.items.add(new File(['gif'], 'hot-merlot.gif', { type: 'image/gif' }));
      input.files = picked.files;
      input.dispatchEvent(new Event('change'));

      await waitUntil(() => byTestId(options.renderRoot, 'value-image-error').length > 0);
      expect(byTestId(options.renderRoot, 'value-image-error')[0]).to.include.text(
        'image_error_upload'
      );
      expect(values()[1].image).to.be.undefined;
    });

    it("gives a value's swatch an image by URL in place of an upload", async () => {
      const { element, options, values } = await withSwatches(false);
      const row = () => byTestId(options.renderRoot, 'option-value')[1];
      const toggle = byTestId(row(), 'value-image-by-url')[0] as HTMLButtonElement;
      expect(toggle.disabled, 'offered without an upload link').to.be.false;
      expect(toggle).to.have.attribute('aria-label', 'image_by_url');

      toggle.click();
      await settle(element, options);
      expect(byTestId(row(), 'value-image-upload'), 'the URL field takes its place').to.have.length(
        0
      );
      const input = byTestId(row(), 'value-image-url-input')[0] as HTMLInputElement;
      expect(options.renderRoot.activeElement).to.equal(input);

      input.value = 'http://cdn.example.test/merlot.png';
      byTestId(row(), 'value-image-url-add')[0].click();
      await settle(element, options);
      expect(byTestId(row(), 'value-image-url-error')[0]).to.include.text('image_url_invalid');
      expect(values()[1].image).to.be.undefined;

      (byTestId(row(), 'value-image-url-input')[0] as HTMLInputElement).value =
        'https://cdn.example.test/swatches/hot-merlot.png';
      byTestId(row(), 'value-image-url-add')[0].click();
      await settle(element, options);
      expect(values()[1]).to.deep.equal({
        value: 'Hot Merlot',
        sku_code: 'HML',
        price_mod: '79.50',
        image: { src: 'https://cdn.example.test/swatches/hot-merlot.png' },
      });
      expect(element.errors).to.not.include('options:v8n_invalid');
      expect(byTestId(row(), 'value-image-upload')).to.have.length(1);
      expect(options.renderRoot.activeElement).to.equal(byTestId(row(), 'value-image-by-url')[0]);

      element.getThumbnailUrl = src => `https://img.example.test/80/${encodeURIComponent(src)}`;
      await settle(element, options);
      expect(row().querySelector('img.pd-swatch-image')).to.have.attribute(
        'src',
        `https://img.example.test/80/${encodeURIComponent(
          'https://cdn.example.test/swatches/hot-merlot.png'
        )}`
      );

      byTestId(row(), 'value-image-by-url')[0].click();
      await settle(element, options);
      byTestId(row(), 'value-image-url-input')[0].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      );
      await settle(element, options);
      expect(byTestId(row(), 'value-image-url-input')).to.have.length(0);
    });

    it("shows a variant's image through getThumbnailUrl", async () => {
      const { element } = await load(1);
      element.getThumbnailUrl = src => `https://img.example.test/80/${encodeURIComponent(src)}`;
      await element.requestUpdate();
      const variants = (await control(element, 'foxy-internal-product-form-variants-control'))!;
      await settle(element, variants);
      const images = byTestId(variants.renderRoot, 'variant-image');
      expect(images.length).to.be.greaterThan(0);
      for (const image of images) {
        const src = image.getAttribute('src')!;
        expect(
          src.startsWith('https://img.example.test/80/') || src.startsWith('data:image/svg'),
          src
        ).to.be.true;
      }
    });

    it('offers no swatch image upload until the product can take one', async () => {
      const { options } = await withSwatches(false);
      const upload = byTestId(options.renderRoot, 'value-image-upload')[0];
      expect(upload).to.have.attribute('aria-disabled', 'true');
      expect(upload.querySelector('input')!.disabled).to.be.true;
    });

    it('refuses a reserved option name before it reaches the API', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      element.edit({
        sku: 'TEE-ORG',
        definition: { name: 'Tee', options: [{ name: 'quantity', values: [{ value: 'M' }] }] },
      });
      expect(element.errors).to.include('options:v8n_invalid');

      const options = (await control(element, 'foxy-internal-product-form-options-control'))!;
      const name = byTestId(options.renderRoot, 'option-name')[0] as HTMLElement & {
        errorMessage: string;
        invalid: boolean;
      };
      expect(name.invalid).to.be.true;
      expect(name.errorMessage).to.equal('v8n_name_reserved');

      element.edit({
        definition: { name: 'Tee', options: [{ name: 'size', values: [{ value: 'M' }] }] },
      });
      expect(element.errors).to.not.include('options:v8n_invalid');
    });

    it("picks a variant's value for each of its parent's options", async () => {
      const { element } = await load(2);
      const selects = Array.from(
        element.renderRoot.querySelectorAll(
          'foxy-internal-summary-control[infer="option-values"] foxy-internal-select-control'
        )
      ) as (HTMLElement & {
        label: string;
        options: { rawLabel: string; value: string }[];
        getValue: () => string | undefined;
        setValue: (v: string) => void;
      })[];

      expect(selects.map(s => s.label)).to.deep.equal(['Colour', 'Size']);
      expect(selects[0].options.map(o => o.rawLabel)).to.deep.equal([
        'Blue',
        'Red',
        'Natural (undyed)',
      ]);
      expect(selects.map(s => s.getValue())).to.deep.equal(['Blue', 'S']);

      selects[1].setValue('2XL');
      expect(element.form.option_values).to.deep.equal({ color: 'Blue', size: '2XL' });

      element.edit({ option_values: { color: 'blue' } });
      expect(selects[0].getValue(), 'matched case-insensitively').to.equal('Blue');
      expect(element.errors).to.include('option-values:size:v8n_required');
      expect(element.errors).to.not.include('option-values:color:v8n_required');
    });

    it('asks a new variant for option values when given its parent', async () => {
      const parent = await getTestData<Data>('https://demo.api/hapi/products/1', createRouter());
      const element = await fixture<ProductForm>(html`
        <foxy-product-form .parentProduct=${parent}></foxy-product-form>
      `);
      element.edit({ sku: 'TSHIRT-NAT-M' });
      await element.requestUpdate();
      expect(
        element.renderRoot.querySelectorAll(
          'foxy-internal-summary-control[infer="option-values"] foxy-internal-select-control'
        )
      ).to.have.length(2);
      expect(element.renderRoot.querySelector('foxy-internal-product-form-options-control')).to.not
        .exist;
      expect(element.errors).to.include('option-values:color:v8n_required');
    });

    it("gives a new variant's form the parent, for its options", async () => {
      const { element } = await load(1);
      const dialog = element.renderRoot.querySelector('#variant-dialog') as HTMLElement & {
        props: Record<string, unknown>;
      };
      expect(dialog).to.have.attribute('form', 'foxy-product-form');
      expect(dialog).to.have.attribute('parent', element.data!._links['fx:product_variants'].href);
      expect(dialog.props['.parentProduct']).to.equal(element.data);
      expect(dialog.props.ns, "reads this form's text, not a copy of it").to.equal('product-form');
    });

    it('shows inherited modifiers, and removes, restores or overrides one by name', async () => {
      const { element } = await load(2);
      const modifiers = (await control(element, 'foxy-internal-product-form-modifiers-control'))!;
      const root = modifiers.renderRoot;

      const inherited = byTestId(root, 'modifier-inherited');
      expect(inherited.map(row => row.dataset.name)).to.deep.equal(['gift_wrap']);
      expect(byTestId(root, 'modifier').map(row => row.dataset.name)).to.deep.equal(['engraving']);

      byTestId(root, 'remove-inherited')[0].click();
      expect(element.form.definition?.modifiers).to.deep.equal([
        { name: 'engraving', label: 'Engraving', type: 'text', max_length: 20, price_mod: '6.00' },
        { name: 'gift_wrap', remove: true },
      ]);

      await settle(element, modifiers);
      byTestId(root, 'restore')[0].click();
      expect(element.form.definition?.modifiers).to.have.length(1);

      await settle(element, modifiers);
      byTestId(root, 'override')[0].click();
      await settle(element, modifiers);
      const override = byTestId(root, 'modifier-override');
      expect(override.map(row => row.dataset.name)).to.deep.equal(['gift_wrap']);
      const overrideName = override[0].querySelector(
        '[data-testid="modifier-name"]'
      ) as HTMLElement & {
        disabled: boolean;
      };
      expect(overrideName.disabled, 'an override keeps the inherited name').to.be.true;
      expect(element.form.definition?.modifiers?.[1]).to.deep.include({
        name: 'gift_wrap',
        type: 'select',
      });
    });

    it('adds a modifier of its own, and switches it between text and a list', async () => {
      const { element } = await load(0);
      const modifiers = (await control(element, 'foxy-internal-product-form-modifiers-control'))!;
      const root = modifiers.renderRoot;
      expect(byTestId(root, 'modifier-inherited')).to.have.length(0);

      byTestId(root, 'add-modifier')[0].click();
      await settle(element, modifiers);
      const editors = byTestId(root, 'modifier');
      const last = editors[editors.length - 1];
      const name = last.querySelector('[data-testid="modifier-name"]') as HTMLInputElement;
      name.value = 'gift_wrap';
      name.dispatchEvent(new Event('change'));
      await settle(element, modifiers);

      // Saved modifiers stay closed; only the new one's editor is open.
      expect(byTestId(root, 'modifier-editor')).to.have.length(1);
      const type = byTestId(root, 'modifier-type')[0] as HTMLInputElement;
      type.value = 'select';
      type.dispatchEvent(new Event('change'));
      const added = element.form.definition?.modifiers?.[3];
      expect(added).to.deep.equal({ name: 'gift_wrap', type: 'select', values: [{ value: '' }] });
      expect(element.errors).to.include('modifiers:v8n_invalid', 'a value is still empty');

      await settle(element, modifiers);
      buttonsIn(byTestId(root, 'modifier-actions')[0], 'move_up_modifier')[0].click();
      expect(element.form.definition?.modifiers?.map(m => m.name)).to.deep.equal([
        'engraving',
        'recipient',
        'gift_wrap',
        'delivery',
      ]);
    });

    it("gives a modifier's values the rows an option's have, with the rest behind a summary", async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      element.edit({
        sku: 'REVSTAR-01',
        definition: {
          name: 'Yamaha Revstar',
          modifiers: [
            {
              name: 'tailpiece',
              type: 'select',
              values: [
                { value: 'Stop tailpiece' },
                { value: 'Bigsby tremolo', price_mod: '189.95', category_code: 'HARDWARE' },
              ],
            },
          ],
        },
      });
      const modifiers = (await control(element, 'foxy-internal-product-form-modifiers-control'))!;
      await settle(element, modifiers);
      const root = modifiers.renderRoot;
      const rows = byTestId(root, 'modifier-value');
      expect(rows).to.have.length(2);
      expect(rows[0]).to.have.class('pd-value');

      const main = rows[1].querySelector('.pd-value-main')!;
      expect(
        Array.from(main.querySelectorAll('input')).map(input => input.dataset.testid)
      ).to.deep.equal(['value-value', 'value-label']);
      expect(byTestId(rows[1], 'value-actions')[0].querySelectorAll('button')).to.have.length(3);

      expect(byTestId(rows[0], 'value-details')[0].textContent!.trim()).to.equal('details_none');
      const details = byTestId(rows[1], 'value-details')[0];
      expect(details.textContent!.trim()).to.equal('amounts_price · details_category');
      expect(byTestId(rows[1], 'price-mod')).to.have.length(0);

      details.click();
      await settle(element, modifiers);
      const weight = byTestId(root, 'weight-mod')[0] as HTMLInputElement;
      weight.value = '0.45';
      weight.dispatchEvent(new Event('change'));
      const code = byTestId(root, 'value-category-code')[0] as HTMLInputElement;
      expect(code.value).to.equal('HARDWARE');
      expect(element.form.definition?.modifiers?.[0]).to.deep.equal({
        name: 'tailpiece',
        type: 'select',
        values: [
          { value: 'Stop tailpiece' },
          {
            value: 'Bigsby tremolo',
            price_mod: '189.95',
            category_code: 'HARDWARE',
            weight_mod: 0.45,
          },
        ],
      });

      await settle(element, modifiers);
      byTestId(byTestId(root, 'value-actions')[1], 'move-up')[0].click();
      expect(
        (element.form.definition?.modifiers?.[0] as { values: { value: string }[] }).values.map(
          v => v.value
        )
      ).to.deep.equal(['Bigsby tremolo', 'Stop tailpiece']);
    });

    it('generates variants through fx:generate_variants, then reloads the list', async () => {
      const { element, router } = await load(1);
      const generate = (await control(
        element,
        'foxy-internal-product-form-generate-variants-control'
      ))!;
      expect(generate).to.exist;
      const pattern = byTestId(generate.renderRoot, 'sku-pattern')[0];
      expect(pattern).to.have.attribute('placeholder', '{parent}-{color}-{size}');

      // 3 colours by 4 sizes, less the two variants that already exist.
      expect(await element.generateVariants('{parent}-{size}-{color}')).to.equal(10);
      const variants = await getTestData<any>(
        'https://demo.api/hapi/products?inherit_from_id=1&product_type=variant',
        router
      );
      expect(variants.total_items).to.equal(12);
      const skus = variants._embedded['fx:products'].map((p: Data) => p.sku);
      expect(skus).to.include('TSHIRT-2XL-NAT');

      expect(await element.generateVariants(), 'every combination has one now').to.equal(0);
    });

    it('offers no generate action on a product without saved options', async () => {
      const { element } = await load(0);
      expect(
        element.renderRoot.querySelector('foxy-internal-product-form-generate-variants-control')
      ).to.not.exist;
      let error: unknown = null;
      try {
        await element.generateVariants();
      } catch (err) {
        error = err;
      }
      expect(error).to.be.instanceOf(Error);
    });

    it('binds a hidden switch, left off templates', async () => {
      const { element } = await load(3);
      const hidden = element.renderRoot.querySelector(
        'foxy-internal-switch-control[infer="hidden"]'
      ) as HTMLElement & { getValue: () => unknown };
      expect(hidden.getValue()).to.be.true;
      expect(element.hiddenSelector.matches('general:hidden', true)).to.be.false;
      const template = (await load(4)).element;
      expect(template.hiddenSelector.matches('general:hidden', true)).to.be.true;
    });

    it("summarises a template's stock as what its products start with", async () => {
      const { element } = await load(4);
      const summary = () =>
        element.renderRoot
          .querySelector('[data-testid="section-inventory"] [data-testid="section-summary"]')!
          .textContent!.trim();

      element.edit({ stock_level: 10 });
      await element.requestUpdate();
      expect(summary()).to.equal('sections.inventory.starting_stock');

      element.edit({ stock_level: null });
      await element.requestUpdate();
      expect(summary()).to.equal('');
    });

    it('builds a link once every required modifier is filled in', async () => {
      const { element, router } = await load(0);
      const storefront = (await control(element, 'foxy-internal-product-form-storefront-control'))!;
      const builder = storefront.renderRoot.querySelector(
        'foxy-internal-product-form-cart-link-control'
      ) as Control & { link?: string };
      await builder.updateComplete;
      expect(builder.link).to.be.undefined;
      expect(byTestId(builder.renderRoot, 'cart-link-incomplete')).to.have.length(1);

      const recipient = byTestId(builder.renderRoot, 'choice-recipient')[0] as HTMLInputElement;
      recipient.value = 'Sam & Alex';
      recipient.dispatchEvent(new Event('input'));
      const delivery = byTestId(builder.renderRoot, 'choice-delivery')[0] as HTMLInputElement;
      delivery.value = 'Pickup';
      delivery.dispatchEvent(new Event('change'));
      await settle(element, builder);

      const store = await getTestData<any>('https://demo.api/hapi/stores/0', router);
      const host = store.use_remote_domain
        ? store.store_domain
        : `${store.store_domain}.foxycart.com`;
      const link = `https://${host}/cart?sku=WIDGET-001&recipient=Sam%20%26%20Alex&delivery=Pickup`;
      expect(builder.link).to.equal(link);
      const copy = byTestId(builder.renderRoot, 'cart-link')[0].querySelector(
        'foxy-copy-to-clipboard'
      );
      expect(copy).to.have.attribute('text', link);

      const engraving = byTestId(builder.renderRoot, 'choice-engraving')[0] as HTMLInputElement;
      engraving.value = 'J+K';
      engraving.dispatchEvent(new Event('input'));
      expect(builder.link).to.equal(
        `https://${host}/cart?sku=WIDGET-001&engraving=J%2BK&recipient=Sam%20%26%20Alex&delivery=Pickup`
      );
    });

    it("has the merchant pick a variant for a parent's link or button, never the parent", async () => {
      const { element } = await load(1, {
        defaultDomain: 'foxycart.com',
        storefrontScript: 'https://cdn.example/foxy-products.js',
      });
      const storefront = (await control(element, 'foxy-internal-product-form-storefront-control'))!;
      const root = storefront.renderRoot;
      const builder = () =>
        root.querySelector('foxy-internal-product-form-cart-link-control') as
          | (Control & { link?: string; sku: string; modifiers: { name: string }[] })
          | null;

      expect(builder(), 'no link for the parent itself').to.not.exist;
      expect(byTestId(root, 'storefront-pick-variant')).to.have.length(1);

      const select = byTestId(root, 'variant-select')[0] as HTMLSelectElement;
      expect(Array.from(select.options).map(o => o.value)).to.deep.equal([
        '',
        ...element.variants.map(v => v.sku),
      ]);
      select.value = 'TSHIRT-RED-L';
      select.dispatchEvent(new Event('change'));
      await settle(element, storefront);

      expect(builder()!.sku).to.equal('TSHIRT-RED-L');
      // An optional modifier is offered for prefill, and the link doesn't wait for it.
      expect(builder()!.modifiers.map(m => m.name)).to.deep.equal(['gift_wrap']);
      await builder()!.updateComplete;
      expect(builder()!.link).to.match(/\/cart\?sku=TSHIRT-RED-L$/);

      byTestId(root, 'kind-button')[0].click();
      await settle(element, storefront);
      expect(byTestId(root, 'snippet')[0].textContent).to.contain('<foxy-product-link store="');
      expect(byTestId(root, 'snippet')[0].textContent).to.contain('sku="TSHIRT-RED-L"');

      byTestId(root, 'kind-form')[0].click();
      await settle(element, storefront);
      const snippet = byTestId(root, 'snippet')[0].textContent!;
      expect(snippet).to.contain(
        '<script type="module" src="https://cdn.example/foxy-products.js">'
      );
      expect(snippet).to.contain('sku="TSHIRT" show-quantity></foxy-product-form>');
      expect(byTestId(root, 'variant-select')).to.have.length(0);

      byTestId(root, 'kind-page')[0].click();
      await settle(element, storefront);
      expect(byTestId(root, 'snippet')[0].textContent).to.contain('<foxy-product-page ');
    });

    it('opens the prefill for a required modifier with the link, which waits for it', async () => {
      const { element } = await load(0);
      const storefront = (await control(element, 'foxy-internal-product-form-storefront-control'))!;
      const builder = storefront.renderRoot.querySelector(
        'foxy-internal-product-form-cart-link-control'
      ) as Control & { link?: string };
      await builder.updateComplete;
      expect(byTestId(builder.renderRoot, 'choice-recipient')).to.have.length(1);
      expect(builder.link).to.be.undefined;
      // Without the script's URL only the link is offered.
      expect(byTestId(storefront.renderRoot, 'kind-form')).to.have.length(0);
    });

    it('offers the storefront kinds as one group of radio buttons', async () => {
      const { element } = await load(0, {
        defaultDomain: 'foxycart.com',
        storefrontScript: 'https://cdn.example/foxy-products.js',
      });
      const storefront = (await control(element, 'foxy-internal-product-form-storefront-control'))!;
      const root = storefront.renderRoot;
      const inputs = () =>
        Array.from(root.querySelectorAll<HTMLInputElement>('[role="radiogroup"] input'));

      expect(inputs().map(input => input.type)).to.deep.equal(Array(5).fill('radio'));
      expect(new Set(inputs().map(input => input.name)).size).to.equal(1);
      expect(inputs().map(input => input.checked)).to.deep.equal([
        true,
        false,
        false,
        false,
        false,
      ]);
      expect(root.querySelector('[role="radio"]'), 'no button posing as a radio').to.not.exist;

      inputs()[2].click();
      await settle(element, storefront);
      expect(inputs().map(input => input.checked)).to.deep.equal([
        false,
        false,
        true,
        false,
        false,
      ]);
      expect(byTestId(root, 'snippet')[0].textContent).to.contain('<foxy-product-form ');
    });

    it('searches the template picker by SKU', async () => {
      const { element } = await load(0);
      const picker = element.renderRoot.querySelector(
        'foxy-internal-resource-picker-control[infer="template"]'
      ) as HTMLElement & { searchFields: string[] };
      expect(picker.searchFields).to.deep.equal(['sku']);
    });

    it('moves focus into the variant panel, closes it on Escape and gives focus back', async () => {
      const { element } = await load(1);
      const variants = (await control(element, 'foxy-internal-product-form-variants-control'))!;
      const row = variants.renderRoot.querySelector('[data-sku="TSHIRT-BLUE-S"]')!;
      const opener = byTestId(row, 'variant-open')[0];
      const focused = () => (variants.renderRoot as ShadowRoot).activeElement;

      opener.focus();
      opener.click();
      await element.requestUpdate();
      await element.updateComplete;

      const panel = byTestId(element.renderRoot, 'variant-panel')[0];
      expect(panel.matches('dialog:modal')).to.be.true;
      expect(panel).to.have.attribute('aria-labelledby', 'variant-panel-title');
      expect(panel.contains((element.renderRoot as ShadowRoot).activeElement)).to.be.true;
      expect(focused()).to.not.equal(opener);

      // What the browser fires for Escape on a modal dialog.
      panel.dispatchEvent(new Event('cancel', { cancelable: true }));
      await element.requestUpdate();
      await element.updateComplete;
      expect(byTestId(element.renderRoot, 'variant-panel')).to.have.length(0);
      expect(focused()).to.equal(opener);
    });

    it('starts the delete confirmation on its Cancel button and gives focus back when it closes', async () => {
      const { element } = await load(1);
      const [color, size] = element.data!.definition.options!;
      const withoutRed = { ...color, values: color.values.filter(v => v.value !== 'Red') };
      element.edit({ definition: { ...element.form.definition, options: [withoutRed, size] } });
      await element.requestUpdate();

      const save = document.createElement('button');
      document.body.append(save);

      try {
        save.focus();
        element.submit();
        await element.requestUpdate();
        await element.updateComplete;

        const dialog = byTestId(element.renderRoot, 'delete-confirmation')[0];
        expect(dialog.matches('dialog:modal')).to.be.true;
        expect((element.renderRoot as ShadowRoot).activeElement).to.equal(
          byTestId(dialog, 'delete-cancel')[0]
        );

        dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
        await element.requestUpdate();
        await element.updateComplete;
        expect(byTestId(element.renderRoot, 'delete-confirmation')).to.have.length(0);
        expect(document.activeElement).to.equal(save);
      } finally {
        save.remove();
      }
    });

    it('asks before saving a change that deletes the variants using a removed value', async () => {
      const { element, router } = await load(1);
      const saved = element.data!.definition.options!;
      const [color, size] = saved;
      const withoutRed = { ...color, values: color.values.filter(v => v.value !== 'Red') };
      element.edit({ definition: { ...element.form.definition, options: [withoutRed, size] } });
      await element.requestUpdate();

      expect(element.variantsToDelete.map(v => v.sku)).to.deep.equal(['TSHIRT-RED-L']);
      expect(element.errors).to.include('options:v8n_confirm_delete');

      const variants = (await control(element, 'foxy-internal-product-form-variants-control'))!;
      await settle(element, variants);
      const row = variants.renderRoot.querySelector('[data-sku="TSHIRT-RED-L"]')!;
      expect(byTestId(row, 'variant-deleting')).to.have.length(1);

      element.submit();
      await element.requestUpdate();
      expect(element.in({ idle: { snapshot: 'dirty' } }), 'nothing is saved yet').to.be.true;
      const dialog = byTestId(element.renderRoot, 'delete-confirmation')[0];
      expect(dialog).to.have.attribute('role', 'alertdialog');
      expect(dialog.matches('dialog:modal'), 'is a modal dialog').to.be.true;
      expect(
        byTestId(dialog, 'deleting').map(li => li.textContent!.replace(/\s+/g, ' ').trim())
      ).to.have.length(1);
      expect(byTestId(dialog, 'deleting')[0].textContent).to.contain('TSHIRT-RED-L');

      // Going back saves nothing and keeps the edit.
      byTestId(dialog, 'delete-cancel')[0].click();
      await element.requestUpdate();
      expect(byTestId(element.renderRoot, 'delete-confirmation')).to.have.length(0);
      expect(element.errors).to.include('options:v8n_confirm_delete');
      // Removing more lists more.
      element.edit({ definition: { ...element.form.definition, options: [withoutRed] } });
      await element.requestUpdate();
      expect(element.variantsToDelete.map(v => v.sku)).to.deep.equal([
        'TSHIRT-BLUE-S',
        'TSHIRT-RED-L',
      ]);
      // Adding values or changing labels deletes nothing, and saves without asking.
      element.edit({
        definition: {
          ...element.form.definition,
          options: [
            { ...color, label: 'Color', values: [...color.values, { value: 'Black' }] },
            size,
          ],
        },
      });
      await element.requestUpdate();
      expect(element.variantsToDelete).to.have.length(0);
      expect(element.errors).to.not.include('options:v8n_confirm_delete');
      // Agreeing saves.
      element.edit({ definition: { ...element.form.definition, options: [withoutRed, size] } });
      element.submit();
      await element.requestUpdate();
      byTestId(element.renderRoot, 'delete-confirm')[0].click();
      await waitUntil(() => element.in({ idle: { snapshot: 'clean' } }), '', { timeout: 5000 });
      const product = await getTestData<Data>('https://demo.api/hapi/products/1', router);
      expect(product.definition.options![0].values.map(v => v.value)).to.not.include('Red');
    });

    it("edits a variant's price and stock in the table, and saves them with the product", async () => {
      const { element, router } = await load(1);
      const variants = (await control(element, 'foxy-internal-product-form-variants-control'))!;
      const rows = byTestId(variants.renderRoot, 'variant');
      expect(rows.map(row => row.dataset.sku)).to.deep.equal(element.variants.map(v => v.sku));
      expect(element.hasChanges).to.be.false;

      const row = variants.renderRoot.querySelector('[data-sku="TSHIRT-RED-L"]')!;
      const type = (testid: string, value: string) => {
        const input = byTestId(row, testid)[0] as HTMLInputElement;
        input.value = value;
        input.dispatchEvent(new Event('input'));
      };

      type('variant-stock', '-3');
      await settle(element, variants);
      expect(byTestId(row, 'variant-stock')[0]).to.have.attribute('aria-invalid', 'true');
      element.submit();
      await settle(element, variants);
      expect(byTestId(variants.renderRoot, 'variants-error')).to.have.length(1);

      type('variant-stock', '37');
      type('variant-price', '27.45');
      expect(element.hasChanges).to.be.true;
      element.submit();
      await waitUntil(() => !element.hasChanges, '', { timeout: 5000 });

      const href = element.variants.find(v => v.sku === 'TSHIRT-RED-L')!._links.self.href;
      const variant = await getTestData<Data>(href, router);
      expect(variant.stock_level).to.equal(37);
      expect(variant.definition.price).to.equal('27.45');
    });

    it('discards unsaved changes to variants along with the product', async () => {
      const { element } = await load(1);
      const href = element.variants[0]._links.self.href;
      element.editVariant(href, { stock: '5' });
      element.edit({ sku: 'TSHIRT-2' });
      expect(element.hasChanges).to.be.true;
      element.discard();
      expect(element.hasChanges).to.be.false;
      expect(element.form.sku).to.equal('TSHIRT');
    });

    it("edits the rest of a variant in a side panel, and deletes it on save once that's agreed", async () => {
      const { element, router } = await load(1);
      const variants = (await control(element, 'foxy-internal-product-form-variants-control'))!;
      const row = variants.renderRoot.querySelector('[data-sku="TSHIRT-BLUE-S"]')!;
      byTestId(row, 'variant-open')[0].click();
      await element.requestUpdate();

      const panel = byTestId(element.renderRoot, 'variant-panel')[0];
      expect(panel.matches('dialog:modal'), 'is a modal dialog').to.be.true;
      const sku = byTestId(panel, 'panel-sku')[0] as HTMLInputElement;
      expect(sku.value).to.equal('TSHIRT-BLUE-S');
      sku.value = 'TSHIRT-BLU-S';
      sku.dispatchEvent(new Event('input'));
      expect(element.variantEdits[element.variants[0]._links.self.href] ?? {}).to.not.have.property(
        'delete'
      );

      // Cancel puts back what the panel changed.
      byTestId(panel, 'panel-cancel')[0].click();
      await element.requestUpdate();
      expect(element.hasChanges).to.be.false;
      expect(byTestId(element.renderRoot, 'variant-panel')).to.have.length(0);

      byTestId(row, 'variant-more')[0].click();
      await element.requestUpdate();
      byTestId(element.renderRoot, 'panel-delete')[0].click();
      await settle(element, variants);
      expect(element.variantsToDelete.map(v => v.sku)).to.deep.equal(['TSHIRT-BLUE-S']);
      expect(byTestId(row, 'variant-undo')).to.have.length(1);

      element.submit();
      await element.requestUpdate();
      expect(byTestId(element.renderRoot, 'deleting')[0].textContent).to.contain('TSHIRT-BLUE-S');
      byTestId(element.renderRoot, 'delete-confirm')[0].click();
      await waitUntil(() => element.variants.length === 1 && !element.hasChanges, '', {
        timeout: 5000,
      });
      const left = await getTestData<any>(
        'https://demo.api/hapi/products?inherit_from_id=1&product_type=variant',
        router
      );
      expect(left._embedded['fx:products'].map((p: Data) => p.sku)).to.deep.equal(['TSHIRT-RED-L']);
    });

    it("edits a variant's name, images and description in its panel, below its option values", async () => {
      const { element, router } = await load(1);
      // The demo API compiles nothing, so give the parent what its variants inherit.
      element.data = { ...element.data!, compiled_definition: element.data!.definition };
      await element.requestUpdate();
      const href = element.variants.find(v => v.sku === 'TSHIRT-BLUE-S')!._links.self.href;
      element.openVariantPanel(href);
      await element.requestUpdate();

      const panel = byTestId(element.renderRoot, 'variant-panel')[0];
      const body = panel.querySelector('.pd-panel-body')!;
      const order = Array.from(body.children).map(
        child =>
          (child as HTMLElement).dataset.testid ??
          (child.querySelector('[data-testid]') as HTMLElement | null)?.dataset.testid
      );
      expect(order.slice(0, 5)).to.deep.equal([
        'panel-option-values',
        'panel-name',
        'panel-images',
        'panel-description',
        'panel-sku',
      ]);

      const values = byTestId(panel, 'panel-option-values')[0];
      expect(values.querySelectorAll('input, select')).to.have.length(0);
      expect(
        Array.from(values.children).map(row => row.textContent!.replace(/\s+/g, ' ').trim())
      ).to.deep.equal(['Colour Blue', 'Size S']);

      const name = byTestId(panel, 'panel-name')[0] as HTMLInputElement;
      expect(name.value).to.equal('');
      expect(name.placeholder).to.equal('Foxy Tee');
      name.value = 'Foxy Tee in Blue';
      name.dispatchEvent(new Event('input'));

      const images = byTestId(panel, 'panel-images')[0] as Control;
      await images.updateComplete;
      expect(images.renderRoot.textContent, 'says it uses the product images').to.include(
        'inherited'
      );
      (images.renderRoot.querySelector('[data-testid="images-by-url"]') as HTMLElement).click();
      await images.requestUpdate();
      const url = images.renderRoot.querySelector(
        '[data-testid="images-url-input"]'
      ) as HTMLInputElement;
      url.value = 'https://cdn.example.test/products/tee-blue-front.jpg';
      url.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      const description = byTestId(panel, 'panel-description')[0] as Control & {
        placeholder: string;
      };
      await description.updateComplete;
      expect(description.placeholder).to.equal('Soft cotton tee with the Foxy logo.');
      const area = description.renderRoot.querySelector('vaadin-text-area')!;
      area.value = 'Dyed in small batches, so each blue is a little different.';
      area.dispatchEvent(new CustomEvent('input'));

      expect(element.variantEdits[href]).to.deep.equal({
        name: 'Foxy Tee in Blue',
        images: [
          { src: 'https://cdn.example.test/products/tee-blue-front.jpg', alt: 'alt_default' },
        ],
        description: 'Dyed in small batches, so each blue is a little different.',
      });

      element.submit();
      await waitUntil(() => !element.hasChanges, '', { timeout: 5000 });
      let saved = await getTestData<Data>(href, router);
      expect(saved.definition.name).to.equal('Foxy Tee in Blue');
      expect(saved.definition.description).to.equal(
        'Dyed in small batches, so each blue is a little different.'
      );
      expect(saved.definition.images).to.have.length(1);
      expect(saved.definition.modifiers, 'keeps the rest of its definition').to.have.length(1);

      // Emptied, each goes back to the parent's.
      element.editVariant(href, { name: ' ', description: '', images: [] });
      element.submit();
      await waitUntil(() => !element.hasChanges, '', { timeout: 5000 });
      saved = await getTestData<Data>(href, router);
      expect(saved.definition).to.not.have.any.keys('name', 'description', 'images');
    });

    it('lets a product with variants gain values but not options', async () => {
      const options = async (id: number) =>
        (await control((await load(id)).element, 'foxy-internal-product-form-options-control'))!;
      const withVariants = await options(1);
      expect(byTestId(withVariants.renderRoot, 'add-option')[0]).to.have.attribute('disabled');
      expect(byTestId(withVariants.renderRoot, 'options-locked')).to.have.length(1);
      const without = await options(0);
      expect(byTestId(without.renderRoot, 'add-option')[0]).to.not.have.attribute('disabled');
    });

    it('keeps a removed value in sight, with how many variants go with it, until undone', async () => {
      const { element } = await load(1);
      const options = (await control(element, 'foxy-internal-product-form-options-control'))!;
      const root = options.renderRoot;
      expect(byTestId(root, 'option-editor'), 'saved options start closed').to.have.length(0);
      expect(byTestId(root, 'value-chip').length).to.be.greaterThan(2);

      byTestId(root, 'manage-option')[0].click();
      await settle(element, options);
      const used = byTestId(root, 'value-used-by').map(node => node.textContent!.trim());
      expect(used).to.include('used_by');
      expect(used).to.include('used_by_none');

      const color = element.data!.definition.options![0];
      const red = color.values.findIndex(v => v.value === 'Red');
      byTestId(byTestId(root, 'value-actions')[red], 'remove')[0].click();
      await settle(element, options);
      expect(element.variantsToDelete.map(v => v.sku)).to.deep.equal(['TSHIRT-RED-L']);
      expect(byTestId(root, 'removed-value')[0].textContent).to.contain('removed_used');

      byTestId(root, 'undo-value')[0].click();
      await settle(element, options);
      expect(element.form.definition!.options![0].values.map(v => v.value)).to.deep.equal(
        color.values.map(v => v.value)
      );
      expect(element.variantsToDelete).to.have.length(0);
    });

    it('adds variants only to a product with options', async () => {
      const add = (element: ProductForm) => byTestId(element.renderRoot, 'add-variant');
      expect(add((await load(0)).element)).to.have.length(0);
      expect(add((await load(1)).element)).to.have.length(1);
    });

    it('fixes a new variant as a variant: no kind or template to choose', async () => {
      const parent = await getTestData<Data>('https://demo.api/hapi/products/1', createRouter());
      const element = await fixture<ProductForm>(html`
        <foxy-product-form .parentProduct=${parent}></foxy-product-form>
      `);
      expect(element.hiddenSelector.matches('general:kind', true)).to.be.true;
      expect(element.hiddenSelector.matches('general:template', true)).to.be.true;
    });
  });
});
