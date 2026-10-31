import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ProductCard } from './ProductCard';
import { Data } from './types';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';

describe('ProductCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and registers foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.equal(InternalCard);
  });

  it('imports and registers foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.equal(NucleonElement);
  });

  it('imports and registers itself as foxy-product-card', () => {
    expect(customElements.get('foxy-product-card')).to.equal(ProductCard);
  });

  it('has a default i18n namespace "product-card"', () => {
    expect(ProductCard.defaultNS).to.equal('product-card');
  });

  it('extends InternalCard', () => {
    expect(new ProductCard()).to.be.instanceOf(InternalCard);
  });

  describe('rendered content', () => {
    async function renderWith(data: Partial<Data> & { id: number }): Promise<ProductCard> {
      const router = createRouter();
      const href = `https://demo.api/hapi/products/${data.id}`;
      const base = await getTestData<Data>(href, router);
      const merged = {
        ...base,
        ...data,
        definition: { ...(base.definition as Record<string, unknown>), ...(data.definition ?? {}) },
      } as Data;

      const element = await fixture<ProductCard>(html`
        <foxy-product-card .data=${merged} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </foxy-product-card>
      `);
      await waitUntil(() => element.isBodyReady);
      return element;
    }

    it('marks a product that inherits from a template', async () => {
      const element = await renderWith({ id: 0, product_type: 'standalone', inherit_from_id: 4 });
      expect(await getByTestId(element, 'uses-template')).to.exist;
    });

    it('leaves the template mark off a variant, which inherits from its parent', async () => {
      const element = await renderWith({ id: 2, product_type: 'variant', inherit_from_id: 1 });
      expect(await getByTestId(element, 'uses-template')).to.not.exist;
    });

    it('renders the product name from definition.name', async () => {
      const element = await renderWith({ id: 0, definition: { name: 'Acme Widget' } as any });
      expect((await getByTestId(element, 'name'))?.textContent?.trim()).to.equal('Acme Widget');
    });

    it('falls back to SKU when definition.name is missing', async () => {
      const element = await renderWith({
        id: 0,
        sku: 'NO-NAME-SKU',
        definition: { name: undefined } as any,
      });
      expect((await getByTestId(element, 'name'))?.textContent?.trim()).to.equal('NO-NAME-SKU');
    });

    it('renders the SKU', async () => {
      const element = await renderWith({ id: 0, sku: 'WIDGET-001' });
      expect((await getByTestId(element, 'sku'))?.textContent?.trim()).to.equal('WIDGET-001');
    });

    it('renders the product type badge with data-type attribute', async () => {
      const element = await renderWith({ id: 0, product_type: 'parent' });
      const badge = await getByTestId(element, 'type-badge');
      expect(badge).to.have.attribute('data-type', 'parent');
    });

    it('renders a price element when definition.price is set', async () => {
      const element = await renderWith({ id: 0, definition: { price: 19.99 } as any });
      expect(await getByTestId(element, 'price')).to.exist;
    });

    it('omits the price element when definition.price is undefined', async () => {
      const element = await renderWith({ id: 0, definition: { price: undefined } as any });
      expect(await getByTestId(element, 'price')).to.not.exist;
    });
  });

  describe('stock indicator', () => {
    async function getState(stock_level: number | null): Promise<string | null> {
      const router = createRouter();
      const base = await getTestData<Data>('https://demo.api/hapi/products/0', router);
      const data = { ...base, stock_level } as Data;
      const element = await fixture<ProductCard>(html`
        <foxy-product-card .data=${data} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </foxy-product-card>
      `);
      await waitUntil(() => element.isBodyReady);
      return (await getByTestId(element, 'stock-indicator'))?.getAttribute('data-state') ?? null;
    }

    it('is "in_stock" when stock_level > threshold', async () => {
      expect(await getState(42)).to.equal('in_stock');
    });

    it('is "low_stock" when 0 < stock_level <= 5', async () => {
      expect(await getState(3)).to.equal('low_stock');
    });

    it('is "out_of_stock" when stock_level === 0', async () => {
      expect(await getState(0)).to.equal('out_of_stock');
    });

    it('is "untracked" when stock_level is null', async () => {
      expect(await getState(null)).to.equal('untracked');
    });
  });

  describe('variant count', () => {
    async function withVariantCount(product_type: Data['product_type'], variant_count: number) {
      const router = createRouter();
      const base = await getTestData<Data>('https://demo.api/hapi/products/0', router);
      const data = { ...base, product_type, variant_count } as Data;
      const element = await fixture<ProductCard>(html`
        <foxy-product-card .data=${data} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </foxy-product-card>
      `);
      await waitUntil(() => element.isBodyReady);
      return element;
    }

    it('shows the variant count badge for parent with variants', async () => {
      const element = await withVariantCount('parent', 3);
      expect(await getByTestId(element, 'variant-count')).to.exist;
    });

    it('hides the variant count badge for parent with zero variants', async () => {
      const element = await withVariantCount('parent', 0);
      expect(await getByTestId(element, 'variant-count')).to.not.exist;
    });

    it('hides the variant count badge for standalone products', async () => {
      const element = await withVariantCount('standalone', 0);
      expect(await getByTestId(element, 'variant-count')).to.not.exist;
    });
  });
});
