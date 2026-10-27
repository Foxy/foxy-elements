import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ProductForm } from './ProductForm';
import { Data } from './types';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

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

    it('renders the placeholder section divs for advanced/stock-rules/events', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
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

  describe('images', () => {
    it('renders the description and images controls, and a variants list of product cards', async () => {
      const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
      const root = element.renderRoot;

      expect(
        root.querySelector('foxy-internal-product-form-description-control[infer="description"]')
      ).to.exist;
      expect(root.querySelector('foxy-internal-product-form-images-control[infer="images"]')).to
        .exist;

      const variants = root.querySelector('foxy-internal-async-list-control[infer="variants"]');
      expect(variants).to.have.attribute('item', 'foxy-product-card');
      expect(variants).to.have.attribute('form', 'foxy-product-form');
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

  it("offers to copy a variant's SKU from the variants list", async () => {
    const element = await fixture<ProductForm>(html`<foxy-product-form></foxy-product-form>`);
    const variants = element.renderRoot.querySelector(
      'foxy-internal-async-list-control[infer="variants"]'
    ) as HTMLElement & {
      actions: { text: string; onClick: (data: unknown) => Promise<unknown> }[];
    };
    const [copy] = variants.actions;
    expect(copy.text).to.equal('copy_button_text');

    const clipboard = navigator.clipboard;
    const written: string[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text: string) => void written.push(text) },
    });
    try {
      await copy.onClick({ sku: 'TEE-ORG-M-BLK' });
    } finally {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
    }
    expect(written).to.deep.equal(['TEE-ORG-M-BLK']);
  });
});
