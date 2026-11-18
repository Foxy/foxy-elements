import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ProductCollectionCard } from './ProductCollectionCard';
import { Data } from './types';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';

describe('ProductCollectionCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and registers itself as foxy-product-collection-card', () => {
    expect(customElements.get('foxy-product-collection-card')).to.equal(ProductCollectionCard);
  });

  it('has a default i18n namespace "product-collection-card"', () => {
    expect(ProductCollectionCard.defaultNS).to.equal('product-collection-card');
  });

  it('extends TwoLineCard', () => {
    expect(new ProductCollectionCard()).to.be.instanceOf(TwoLineCard);
  });

  it('extends NucleonElement', () => {
    expect(new ProductCollectionCard()).to.be.instanceOf(NucleonElement);
  });

  it('renders the collection name and slug', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/product_collections/1';
    const data = await getTestData<Data>(href, router);
    const element = await fixture<ProductCollectionCard>(html`
      <foxy-product-collection-card
        .data=${data}
        @fetch=${(e: FetchEvent) => router.handleEvent(e)}
      ></foxy-product-collection-card>
    `);
    await waitUntil(() => element.isBodyReady);
    // TwoLineCard renders title and subtitle; just check the strings appear.
    expect(element.renderRoot.textContent).to.contain(data.name);
    expect(element.renderRoot.textContent).to.contain(data.slug);
  });

  it('indents a collection by its depth and shows its path', async () => {
    const router = createRouter();
    const data = await getTestData<Data>('https://demo.api/hapi/product_collections/1', router);
    const nested = { ...data, id: 4127, name: 'T-Shirts', path: '/apparel/mens/t-shirts' };
    const element = await fixture<ProductCollectionCard>(html`
      <foxy-product-collection-card
        .data=${nested}
        @fetch=${(e: FetchEvent) => router.handleEvent(e)}
      ></foxy-product-collection-card>
    `);
    await waitUntil(() => element.isBodyReady);
    const tree = element.renderRoot.querySelector('[data-testid="tree"]') as HTMLElement;
    expect(tree.dataset.depth).to.equal('2');
    expect(tree.style.marginLeft).to.equal('2.5rem');
    expect(tree.textContent).to.contain('/apparel/mens/t-shirts');
    expect(element.renderRoot.querySelector('[data-testid="pattern"]')).to.exist;
  });

  it('gives collections different patterns by the id in their link, which is all the API gives', async () => {
    const router = createRouter();
    const data = await getTestData<Data>('https://demo.api/hapi/product_collections/1', router);
    const background = async (id: number) => {
      const collection = {
        ...data,
        id: undefined,
        _links: {
          ...data._links,
          self: { href: `https://demo.api/hapi/product_collections/${id}` },
        },
      } as unknown as Data;
      const element = await fixture<ProductCollectionCard>(html`
        <foxy-product-collection-card
          .data=${collection}
          @fetch=${(e: FetchEvent) => router.handleEvent(e)}
        ></foxy-product-collection-card>
      `);
      await waitUntil(() => element.isBodyReady);
      const pattern = element.renderRoot.querySelector('[data-testid="pattern"]') as HTMLElement;
      expect(pattern.offsetHeight).to.be.greaterThan(0);
      return pattern.style.background;
    };

    const [coffee, apparel] = [await background(4127), await background(4128)];
    expect(coffee).to.contain('gradient');
    expect(apparel).to.contain('gradient');
    expect(coffee).to.not.equal(apparel);
  });
});
