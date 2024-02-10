import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { ItemCard } from './index';
import { Data } from './types';

describe('ItemCard', () => {
  it('imports and defines foxy-internal-card', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines itself as foxy-item-card', () => {
    expect(customElements.get('foxy-item-card')).to.equal(ItemCard);
  });

  it('has a default i18n namespace "item-card"', () => {
    expect(ItemCard).to.have.property('defaultNS', 'item-card');
    expect(new ItemCard()).to.have.property('ns', 'item-card');
  });

  it('renders item image', async () => {
    const router = createRouter();
    const element = await fixture<ItemCard>(html`
      <foxy-item-card
        href="https://demo.api/hapi/items/0?zoom=item_options"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    element.data!.image = 'https://picsum.photos/128';
    element.data = { ...element.data! };
    await element.updateComplete;

    expect(element.renderRoot.querySelector('img[src="https://picsum.photos/128"]')).to.exist;
  });

  it('renders item name', async () => {
    const router = createRouter();
    const element = await fixture<ItemCard>(html`
      <foxy-item-card
        href="https://demo.api/hapi/items/0?zoom=item_options"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    element.data!.name = 'Test Item Name';
    element.data = { ...element.data! };
    await element.updateComplete;

    expect(element.renderRoot).to.include.text('Test Item Name');
  });

  it('renders item name', async () => {
    const router = createRouter();
    const element = await fixture<ItemCard>(html`
      <foxy-item-card
        href="https://demo.api/hapi/items/0?zoom=item_options"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    element.data!.name = 'Test Item Name';
    element.data = { ...element.data! };
    await element.updateComplete;

    expect(element.renderRoot).to.include.text('Test Item Name');
  });

  it('renders price breakdown', async () => {
    const router = createRouter();
    const element = await fixture<ItemCard>(html`
      <foxy-item-card
        href="https://demo.api/hapi/items/0?zoom=item_options"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    element.data!.quantity = 8;
    element.data!.price = 16;
    element.data = { ...element.data! };
    await element.updateComplete;

    const amounts = element.renderRoot.querySelectorAll('foxy-i18n[key="price"]');

    expect(element.renderRoot).to.include.text('8');

    expect(amounts[0]).to.have.property('infer', '');
    expect(amounts[0]).to.have.deep.property('options', {
      amount: '16 USD',
      currencyDisplay: 'code',
    });

    expect(amounts[1]).to.have.property('infer', '');
    expect(amounts[1]).to.have.deep.property('options', {
      amount: '11.98 USD',
      currencyDisplay: 'code',
      signDisplay: 'exceptZero',
    });
  });

  it('when resource has item options embedded in it, renders them also', async () => {
    const router = createRouter();
    const element = await fixture<ItemCard>(html`
      <foxy-item-card
        href="https://demo.api/hapi/items/0?zoom=item_options"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    const data = element.data as Data;
    const options = element.renderRoot.querySelectorAll('[data-testclass="option"]');

    expect(data._embedded['fx:item_options']).to.not.be.empty;
    expect(options).to.have.length(data._embedded['fx:item_options'].length);

    for (let i = 0; i < options.length; ++i) {
      const domOption = options[i];
      const apiOption = data._embedded['fx:item_options'][i];

      expect(domOption).to.include.text(apiOption.name);
      expect(domOption).to.include.text(apiOption.value);

      if (apiOption.price_mod) {
        const domPriceMod = domOption.querySelector('foxy-i18n[key="price"]');

        expect(domPriceMod).to.have.property('infer', '');
        expect(domPriceMod).to.have.deep.property('options', {
          amount: `${apiOption.price_mod} USD`,
          currencyDisplay: 'code',
          signDisplay: 'exceptZero',
        });
      }
    }
  });
});
