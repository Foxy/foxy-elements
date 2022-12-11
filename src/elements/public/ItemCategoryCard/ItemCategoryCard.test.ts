import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, waitUntil, html } from '@open-wc/testing';
import { ItemCategoryCard } from './ItemCategoryCard';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { createRouter } from '../../../server/index';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { I18n } from '../I18n/I18n';

describe('ItemCategoryCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and registers foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and registers foxy-internal-sandbox element', () => {
    expect(customElements.get('foxy-internal-sandbox')).to.equal(InternalSandbox);
  });

  it('imports and registers itself as foxy-item-category-card', () => {
    expect(customElements.get('foxy-item-category-card')).to.equal(ItemCategoryCard);
  });

  it('has a default i18n namespace "item-category-card"', () => {
    expect(ItemCategoryCard.defaultNS).to.equal('item-category-card');
  });

  it('extends TwoLineCard', () => {
    expect(new ItemCategoryCard()).to.be.instanceOf(TwoLineCard);
  });

  it('renders item category description in the title', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/item_categories/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<ItemCategoryCard>(html`
      <foxy-item-category-card href=${href} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    expect(await getByTestId(element, 'title')).to.include.text(data.name);
  });

  it('renders item category code in the title', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/item_categories/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<ItemCategoryCard>(html`
      <foxy-item-category-card href=${href} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-item-category-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    expect(await getByTestId(element, 'subtitle')).to.include.text(data.code);
  });
});
