import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ProductTagCard } from './ProductTagCard';
import { Data } from './types';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';

describe('ProductTagCard', () => {
  it('imports and registers foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.equal(InternalCard);
  });

  it('imports and registers foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.equal(NucleonElement);
  });

  it('imports and registers itself as foxy-product-tag-card', () => {
    expect(customElements.get('foxy-product-tag-card')).to.equal(ProductTagCard);
  });

  it('has a default i18n namespace "product-tag-card"', () => {
    expect(ProductTagCard.defaultNS).to.equal('product-tag-card');
  });

  it('extends InternalCard', () => {
    expect(new ProductTagCard()).to.be.instanceOf(InternalCard);
  });

  it('renders the tag string', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/product_tags/0';
    const data = await getTestData<Data>(href, router);
    const element = await fixture<ProductTagCard>(html`
      <foxy-product-tag-card .data=${data} @fetch=${(e: FetchEvent) => router.handleEvent(e)}>
      </foxy-product-tag-card>
    `);
    await waitUntil(() => element.isBodyReady);
    expect((await getByTestId(element, 'tag'))?.textContent?.trim()).to.equal(data.tag);
  });
});
