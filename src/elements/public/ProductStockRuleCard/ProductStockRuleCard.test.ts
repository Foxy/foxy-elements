import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ProductStockRuleCard } from './ProductStockRuleCard';
import { Data } from './types';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { I18n } from '../I18n/I18n';

describe('ProductStockRuleCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and registers foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.equal(NucleonElement);
  });

  it('imports and registers foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and registers itself as foxy-product-stock-rule-card', () => {
    expect(customElements.get('foxy-product-stock-rule-card')).to.equal(ProductStockRuleCard);
  });

  it('has a default i18n namespace "product-stock-rule-card"', () => {
    expect(ProductStockRuleCard.defaultNS).to.equal('product-stock-rule-card');
  });

  it('extends TwoLineCard', () => {
    expect(new ProductStockRuleCard()).to.be.instanceOf(TwoLineCard);
  });

  it("renders the target product's name and SKU, and the multiplier", async () => {
    const router = createRouter();
    const data = await getTestData<Data>('https://demo.api/hapi/product_stock_rules/0', router);
    data.multiplier = 6;

    const element = await fixture<ProductStockRuleCard>(html`
      <foxy-product-stock-rule-card
        .data=${data}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-product-stock-rule-card>
    `);

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const title = element.renderRoot.querySelector('[data-testid="title"]');
    const subtitle = element.renderRoot.querySelector('[data-testid="subtitle"]');
    const multiplier = subtitle?.querySelector('foxy-i18n');

    expect(title).to.include.text('Foxy Tee');
    expect(subtitle).to.include.text('TSHIRT');
    expect(multiplier).to.have.attribute('key', 'multiplier');
    expect(multiplier).to.have.deep.property('options', { count: 6 });
  });

  it('says a multiplier of 0 counts against nothing', async () => {
    const router = createRouter();
    const data = await getTestData<Data>('https://demo.api/hapi/product_stock_rules/0', router);
    data.multiplier = 0;

    const element = await fixture<ProductStockRuleCard>(html`
      <foxy-product-stock-rule-card
        .data=${data}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-product-stock-rule-card>
    `);

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const multiplier = element.renderRoot.querySelector('[data-testid="subtitle"] foxy-i18n');
    expect(multiplier).to.have.attribute('key', 'multiplier_zero');
  });
});
