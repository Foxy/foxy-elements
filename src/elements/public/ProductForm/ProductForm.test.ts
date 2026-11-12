import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ProductForm } from './ProductForm';
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

    it('binds the SKU control directly (top-level field, no nested property)', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const ctrl = element.renderRoot.querySelector(
        'foxy-internal-text-control[infer="sku"]'
      ) as HTMLElement | null;
      expect(ctrl).to.exist;
      expect(ctrl?.getAttribute('property')).to.be.null;
    });

    it('forwards productCollections attribute to the collection picker first link', async () => {
      const element = await fixture<ProductForm>(html`
        <foxy-product-form
          product-collections="https://demo.api/hapi/product_collections"
        ></foxy-product-form>
      `);
      const picker = element.renderRoot.querySelector(
        'foxy-internal-resource-picker-control[infer="collection"]'
      ) as HTMLElement | null;
      expect(picker?.getAttribute('first')).to.equal('https://demo.api/hapi/product_collections');
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

    it('uploads an image through fx:create_upload_url and a pre-signed PUT', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const createUploadUrl = 'https://demo.api/s/admin/products/1/create_upload_url';
      const uploadUrl =
        'https://bucket.s3.example.test/products/store_1/products/1/01J.png?X-Amz-Signature=abc';
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
            new Response(JSON.stringify({ upload_url: uploadUrl, image_url: imageUrl }))
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
      expect(await apiRequests[0].json()).to.deep.equal({ type: 'image/png' });

      expect(puts).to.have.length(1);
      expect(puts[0].url).to.equal(uploadUrl);
      expect(puts[0].init?.method).to.equal('PUT');
      expect(puts[0].init?.body).to.equal(file);
      expect((puts[0].init?.headers as Record<string, string>)['Content-Type']).to.equal(
        'image/png'
      );
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
    it('moves an image up or down, keeping the rest in order', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const product = await getTestData<Data>('https://demo.api/hapi/products/0', createRouter());
      const front = { src: 'https://images.example.test/tee-front.jpg', alt: 'Black tee, front' };
      const back = { src: 'https://images.example.test/tee-back.jpg', alt: 'Black tee, back' };
      const detail = { src: 'https://images.example.test/tee-hem.jpg', alt: 'Hem stitching' };
      element.data = {
        ...product,
        definition: { ...product.definition, images: [front, back, detail] },
      };
      await element.requestUpdate();

      const control = element.renderRoot.querySelector(
        'foxy-internal-product-form-images-control'
      ) as HTMLElement & { updateComplete: Promise<unknown> };
      await control.updateComplete;
      const buttons = (text: string) =>
        Array.from(control.renderRoot.querySelectorAll('button')).filter(
          b => b.textContent?.trim() === text
        );

      expect(buttons('move_up')).to.have.length(2, 'every image but the first moves up');
      expect(buttons('move_down')).to.have.length(2, 'every image but the last moves down');

      buttons('move_down')[0].click();
      expect(element.form.definition?.images).to.deep.equal([back, front, detail]);

      await control.updateComplete;
      buttons('move_up')[1].click();
      expect(element.form.definition?.images).to.deep.equal([back, detail, front]);
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
      const price = byTestId(options.renderRoot, 'value-price-mod')[1] as HTMLInputElement;
      price.value = ' 2.35 ';
      price.dispatchEvent(new Event('change'));
      await settle(element, options);

      expect(element.form.definition?.options).to.deep.equal([
        { name: 'size', values: [{ value: 'M' }, { value: '2XL', price_mod: '2.35' }] },
      ]);

      buttonsIn(byTestId(options.renderRoot, 'value-actions')[0], 'move_down')[0].click();
      expect(element.form.definition?.options?.[0].values.map(v => v.value)).to.deep.equal([
        '2XL',
        'M',
      ]);
      expect(element.form.definition?.name).to.equal('Organic Cotton Tee');
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
      expect(dialog.querySelector('[role="alertdialog"]')).to.exist;
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
      expect(panel.querySelector('[role="dialog"]')).to.have.attribute('aria-modal', 'true');
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
      buttonsIn(byTestId(root, 'value-actions')[red], 'remove')[0].click();
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
