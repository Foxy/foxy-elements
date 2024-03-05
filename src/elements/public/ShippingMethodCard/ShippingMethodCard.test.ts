import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { ShippingMethodCard } from './ShippingMethodCard';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { getTestData } from '../../../testgen/getTestData';
import { getByKey } from '../../../testgen/getByKey';
import { getByTag } from '../../../testgen/getByTag';
import { I18n } from '../I18n/I18n';

describe('ShippingMethodCard', () => {
  it('imports and registers foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and registers foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.equal(NucleonElement);
  });

  it('imports and registers foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.equal(InternalCard);
  });

  it('imports and registers itself as foxy-shipping-method-card', () => {
    expect(customElements.get('foxy-shipping-method-card')).to.equal(ShippingMethodCard);
  });

  it('has a default i18n namespace "shipping-method-card"', () => {
    expect(ShippingMethodCard.defaultNS).to.equal('shipping-method-card');
  });

  it('extends InternalCard', () => {
    expect(new ShippingMethodCard()).to.be.instanceOf(InternalCard);
  });

  it('renders shipping method name', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/shipping_methods/0';
    const data = await getTestData<Data>(href, router);
    const element = await fixture<ShippingMethodCard>(html`
      <foxy-shipping-method-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-shipping-method-card>
    `);

    data.name = 'Test shipping method';
    element.data = { ...data };
    await element.requestUpdate();

    expect(element.renderRoot).to.include.text('Test shipping method');
  });

  it('renders Active status if storeShippingMethods URL is set and shipping method is active', async () => {
    const router = createRouter();

    const storeMethodsHref = 'https://demo.api/hapi/store_shipping_methods';
    const methodHref = 'https://demo.api/hapi/shipping_methods/0';

    const element = await fixture<ShippingMethodCard>(html`
      <foxy-shipping-method-card
        store-shipping-methods=${storeMethodsHref}
        href=${methodHref}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-shipping-method-card>
    `);

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });

    // This test assumes that ./store_shipping_methods/0 exists and links to ./shipping_methods/0.
    // Check createDataset() for demo hAPI data if it fails.

    expect(await getByKey(element, 'status_active')).to.exist;
    expect(await getByKey(element, 'status_active')).to.have.attribute('infer', '');
  });

  it('renders shipping method image if provided', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/shipping_methods/0';
    const data = await getTestData<Data>(href, router);
    const element = await fixture<ShippingMethodCard>(html`
      <foxy-shipping-method-card
        href=${href}
        .getImageSrc=${(code: string) => `https://example.com/${code}.png`}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-shipping-method-card>
    `);

    data.code = 'test_method';
    element.data = { ...data };

    await element.requestUpdate();
    const img = await getByTag(element, 'img');

    expect(img).to.exist;
    expect(img).to.have.attribute('src', 'https://example.com/test_method.png');
    expect(img).to.have.attribute('alt', 'image_alt');
  });

  it('renders default shipping method image if not provided', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/shipping_methods/0';
    const element = await fixture<ShippingMethodCard>(html`
      <foxy-shipping-method-card
        href=${href}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-shipping-method-card>
    `);

    const img = await getByTag(element, 'img');

    expect(img).to.exist;
    expect(img).to.have.attribute('src', ShippingMethodCard.defaultImageSrc);
    expect(img).to.have.attribute('alt', 'image_alt');
  });
});
