import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { getByTestId } from '../../../testgen/getByTestId';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { ItemOptionCard } from './index';

describe('ItemOptionCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('extends TwoLineCard', () => {
    expect(new ItemOptionCard()).to.be.instanceOf(TwoLineCard);
  });

  it('registers as foxy-item-option-card', () => {
    expect(customElements.get('foxy-item-option-card')).to.equal(ItemOptionCard);
  });

  it('has a default i18next namespace of "item-option-card"', () => {
    expect(new ItemOptionCard()).to.have.property('ns', 'item-option-card');
  });

  it('renders item option name, price and weight modifiers in the title', async () => {
    const router = createRouter();
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-item-option-card @fetch=${handleFetch}></foxy-item-option-card>`;
    const element = await fixture<ItemOptionCard>(layout);

    element.href = 'https://demo.api/hapi/item_options/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    element.lang = 'en';
    element.data!.name = 'Test';
    element.data!.price_mod = 4;
    element.data!.weight_mod = 8;
    element.data = { ...element.data! };

    const title = await getByTestId(element, 'title');

    expect(title).to.include.text('Test');
    expect(title).to.include.text('USD');
    expect(title).to.include.text('4.00');
    expect(title).to.include.text('8');
  });

  it('renders item option value in the subtitle', async () => {
    const router = createRouter();
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-item-option-card @fetch=${handleFetch}></foxy-item-option-card>`;
    const element = await fixture<ItemOptionCard>(layout);

    element.href = 'https://demo.api/hapi/item_options/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const title = await getByTestId(element, 'subtitle');

    expect(title).to.include.text(element.data!.value);
  });
});
