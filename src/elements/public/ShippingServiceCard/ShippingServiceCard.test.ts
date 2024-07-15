import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { ShippingServiceCard } from './ShippingServiceCard';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { getByKey } from '../../../testgen/getByKey';
import { html } from 'lit-html';

const router = createRouter();

describe('ShippingServiceCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('extends TwoLineCard', () => {
    expect(new ShippingServiceCard()).to.be.instanceOf(TwoLineCard);
  });

  it('registers as foxy-shipping-service-card', () => {
    expect(customElements.get('foxy-shipping-service-card')).to.equal(ShippingServiceCard);
  });

  it('has a default i18next namespace of "shipping-service-card"', () => {
    expect(new ShippingServiceCard()).to.have.property('ns', 'shipping-service-card');
  });

  it('renders name in the title', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture<ShippingServiceCard>(html`
      <foxy-shipping-service-card @fetch=${handleFetch}></foxy-shipping-service-card>
    `);

    element.href = 'https://demo.api/hapi/shipping_containers/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    const title = await getByTestId(element, 'title');
    expect(title).to.include.text(element.data!.name);
  });

  it('renders code and international-only usage hint in the subtitle', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture<ShippingServiceCard>(html`
      <foxy-shipping-service-card @fetch=${handleFetch}></foxy-shipping-service-card>
    `);

    element.href = 'https://demo.api/hapi/shipping_containers/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    const subtitle = (await getByTestId(element, 'subtitle')) as HTMLElement;
    const text = await getByKey(subtitle, 'subtitle');
    expect(text).to.have.attribute('infer', '');

    element.data = { ...element.data!, is_international: false };
    await element.requestUpdate();
    expect(text).to.have.deep.property('options', { code: element.data!.code, context: '' });

    element.data = { ...element.data!, is_international: true };
    await element.requestUpdate();
    expect(text).to.have.deep.property('options', {
      code: element.data!.code,
      context: 'international_only',
    });
  });
});
