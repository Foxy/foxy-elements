import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, waitUntil, html } from '@open-wc/testing';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { createRouter } from '../../../server/index';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { StoreCard } from './StoreCard';
import { I18n } from '../I18n/I18n';

describe('StoreCard', () => {
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

  it('imports and registers itself as foxy-store-card', () => {
    expect(customElements.get('foxy-store-card')).to.equal(StoreCard);
  });

  it('has a default i18n namespace "store-card"', () => {
    expect(StoreCard.defaultNS).to.equal('store-card');
  });

  it('extends TwoLineCard', () => {
    expect(new StoreCard()).to.be.instanceOf(TwoLineCard);
  });

  it('has a reactive property defaultDomain', () => {
    const definition = { attribute: 'default-domain' };
    expect(StoreCard).to.have.deep.nested.property('properties.defaultDomain', definition);
    expect(new StoreCard()).to.have.property('defaultDomain', null);
  });

  it('renders store name in the title', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/stores/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<StoreCard>(html`
      <foxy-store-card href=${href} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    expect(await getByTestId(element, 'title')).to.include.text(data.store_name);
  });

  it('renders store domain in the subtitle (foxy domain)', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/stores/0';
    const element = await fixture<StoreCard>(html`
      <foxy-store-card
        default-domain="foxy.io"
        href=${href}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    element.data!.store_domain = 'test';
    await element.requestUpdate();

    expect(await getByTestId(element, 'subtitle')).to.include.text('test.foxy.io');
  });

  it('renders store domain in the subtitle (custom domain)', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/stores/0';
    const element = await fixture<StoreCard>(html`
      <foxy-store-card
        default-domain="foxy.io"
        href=${href}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    element.data!.store_domain = 'example.com';
    await element.requestUpdate();

    expect(await getByTestId(element, 'subtitle')).to.include.text('example.com');
  });
});
