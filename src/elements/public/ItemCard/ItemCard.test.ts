import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/customer';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
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

  it('has a reactive property "settings"', () => {
    expect(new ItemCard()).to.have.property('settings', null);
    expect(ItemCard.properties).to.have.deep.property('settings', { type: Object });
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
    await element.requestUpdate();

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
    await element.requestUpdate();

    expect(element.renderRoot).to.include.text('Test Item Name');
  });

  it('renders item name with html entities', async () => {
    const router = createRouter();
    const element = await fixture<ItemCard>(html`
      <foxy-item-card
        href="https://demo.api/hapi/items/0?zoom=item_options"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    element.data!.name = 'Hot &amp; Sweet';
    element.data = { ...element.data! };
    await element.requestUpdate();

    expect(element.renderRoot).to.include.text('Hot & Sweet');
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
    await element.requestUpdate();

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

  it('renders item code', async () => {
    const router = createRouter();
    const element = await fixture<ItemCard>(html`
      <foxy-item-card
        href="https://demo.api/hapi/items/0?zoom=item_options"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    element.data!.code = 'FOOBAR123';
    element.data = { ...element.data! };
    await element.requestUpdate();

    expect(element.renderRoot).to.include.text('FOOBAR123');
  });

  it('hides item code if cart display config in settings prohibits code display', async () => {
    type Settings = Resource<Rels.CustomerPortalSettings>;
    const settings = await getTestData<Settings>('./portal/customer_portal_settings');
    settings.cart_display_config.show_product_code = false;

    const router = createRouter();
    const element = await fixture<ItemCard>(html`
      <foxy-item-card
        href="https://demo.api/hapi/items/0?zoom=item_options"
        .settings=${settings}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    element.data!.code = 'FOOBAR123';
    element.data = { ...element.data! };
    await element.requestUpdate();

    expect(element.renderRoot).to.not.include.text('FOOBAR123');
  });

  it('renders item frequency', async () => {
    const router = createRouter();
    const element = await fixture<ItemCard>(html`
      <foxy-item-card
        href="https://demo.api/hapi/items/0?zoom=item_options"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    element.data!.subscription_frequency = '2w';
    element.data = { ...element.data! };
    await element.requestUpdate();

    const frequency = element.renderRoot.querySelector('foxy-i18n[key="subinfo_recurring"]');

    expect(frequency).to.exist;
    expect(frequency).to.have.property('infer', '');
    expect(frequency).to.have.deep.property('options', {
      amount: '158.99 USD',
      count: 2,
      currencyDisplay: 'code',
      startDate: '2015-04-15',
      units: 'weekly',
    });
  });

  it('hides item frequency if cart display config in settings prohibits frequency display', async () => {
    type Settings = Resource<Rels.CustomerPortalSettings>;
    const settings = await getTestData<Settings>('./portal/customer_portal_settings');
    settings.cart_display_config.show_sub_frequency = false;

    const router = createRouter();
    const element = await fixture<ItemCard>(html`
      <foxy-item-card
        href="https://demo.api/hapi/items/0?zoom=item_options"
        .settings=${settings}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    element.data!.subscription_frequency = '2w';
    element.data = { ...element.data! };
    await element.requestUpdate();

    const frequency = element.renderRoot.querySelector('foxy-i18n[key="subinfo_recurring"]');
    expect(frequency).to.not.exist;
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

  it("filters out hidden item options when it's specified in settings", async () => {
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
    expect(data._embedded['fx:item_options']).to.not.be.empty;

    type Settings = Resource<Rels.CustomerPortalSettings>;
    const settings = await getTestData<Settings>('./portal/customer_portal_settings');
    settings.cart_display_config.hidden_product_options = [
      data._embedded['fx:item_options'][0].name,
    ];

    element.settings = settings;
    await element.requestUpdate();

    const options = element.renderRoot.querySelectorAll('[data-testclass="option"]');
    expect(options).to.have.length(data._embedded['fx:item_options'].length - 1);

    for (let i = 0; i < options.length - 1; ++i) {
      const domOption = options[i];
      const apiOption = data._embedded['fx:item_options'][i + 1];

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

  it('hides all item options when settings prohibit item option display', async () => {
    type Settings = Resource<Rels.CustomerPortalSettings>;
    const settings = await getTestData<Settings>('./portal/customer_portal_settings');
    settings.cart_display_config.show_product_options = false;

    const router = createRouter();
    const element = await fixture<ItemCard>(html`
      <foxy-item-card
        href="https://demo.api/hapi/items/0?zoom=item_options"
        .settings=${settings}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    const data = element.data as Data;
    const options = element.renderRoot.querySelectorAll('[data-testclass="option"]');

    expect(data._embedded['fx:item_options']).to.not.be.empty;
    expect(options).to.have.length(0);
  });
});
