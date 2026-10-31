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
});
