import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ProductCategoryCard } from './ProductCategoryCard';
import { Data } from './types';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';

describe('ProductCategoryCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and registers itself as foxy-product-category-card', () => {
    expect(customElements.get('foxy-product-category-card')).to.equal(ProductCategoryCard);
  });

  it('has a default i18n namespace "product-category-card"', () => {
    expect(ProductCategoryCard.defaultNS).to.equal('product-category-card');
  });

  it('extends TwoLineCard', () => {
    expect(new ProductCategoryCard()).to.be.instanceOf(TwoLineCard);
  });

  it('extends NucleonElement', () => {
    expect(new ProductCategoryCard()).to.be.instanceOf(NucleonElement);
  });

  it('renders the category name and slug', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/product_categories/1';
    const data = await getTestData<Data>(href, router);
    const element = await fixture<ProductCategoryCard>(html`
      <foxy-product-category-card
        .data=${data}
        @fetch=${(e: FetchEvent) => router.handleEvent(e)}
      ></foxy-product-category-card>
    `);
    await waitUntil(() => element.isBodyReady);
    // TwoLineCard renders title and subtitle; just check the strings appear.
    expect(element.renderRoot.textContent).to.contain(data.name);
    expect(element.renderRoot.textContent).to.contain(data.slug);
  });
});
