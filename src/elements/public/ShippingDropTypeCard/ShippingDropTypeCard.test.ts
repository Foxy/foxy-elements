import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { ShippingDropTypeCard } from './ShippingDropTypeCard';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { getByKey } from '../../../testgen/getByKey';
import { html } from 'lit-html';

const router = createRouter();

describe('ShippingDropTypeCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('extends TwoLineCard', () => {
    expect(new ShippingDropTypeCard()).to.be.instanceOf(TwoLineCard);
  });

  it('registers as foxy-shipping-drop-type-card', () => {
    expect(customElements.get('foxy-shipping-drop-type-card')).to.equal(ShippingDropTypeCard);
  });

  it('has a default i18next namespace of "shipping-drop-type-card"', () => {
    expect(new ShippingDropTypeCard()).to.have.property('ns', 'shipping-drop-type-card');
  });

  it('renders name in the title', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture<ShippingDropTypeCard>(html`
      <foxy-shipping-drop-type-card @fetch=${handleFetch}></foxy-shipping-drop-type-card>
    `);

    element.href = 'https://demo.api/hapi/shipping_containers/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    const title = await getByTestId(element, 'title');
    expect(title).to.include.text(element.data!.name);
  });

  it('renders code in the subtitle', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture<ShippingDropTypeCard>(html`
      <foxy-shipping-drop-type-card @fetch=${handleFetch}></foxy-shipping-drop-type-card>
    `);

    element.href = 'https://demo.api/hapi/shipping_containers/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    const subtitle = (await getByTestId(element, 'subtitle')) as HTMLElement;
    const text = await getByKey(subtitle, 'subtitle');

    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', { code: element.data!.code });
  });
});
