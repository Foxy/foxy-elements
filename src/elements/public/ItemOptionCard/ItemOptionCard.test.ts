import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter as createBaseRouter } from '../../../server/router/createRouter';
import { defaults } from '../../../server/hapi/defaults';
import { links } from '../../../server/hapi/links';
import { createRouter } from '../../../server/index';
import { getByTestId } from '../../../testgen/getByTestId';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { ItemOptionCard as Card } from './ItemOptionCard';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { Spinner } from '../Spinner/Spinner';

const fromDefaults = (key: string, overrides: Record<PropertyKey, unknown>) => {
  return { ...defaults[key](new URLSearchParams(), {}), ...overrides };
};

describe('ItemOptionCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('extends TwoLineCard', () => {
    expect(new Card()).to.be.instanceOf(TwoLineCard);
  });

  it('imports and defines foxy-internal-sandbox', () => {
    expect(customElements.get('foxy-internal-sandbox')).to.equal(InternalSandbox);
  });

  it('imports and defines foxy-nucleon', () => {
    expect(customElements.get('foxy-nucleon')).to.equal(NucleonElement);
  });

  it('imports and defines foxy-spinner', () => {
    expect(customElements.get('foxy-spinner')).to.equal(Spinner);
  });

  it('imports and defines itself as foxy-item-option-card', () => {
    expect(customElements.get('foxy-item-option-card')).to.equal(Card);
  });

  it('has a default i18next namespace of "item-option-card"', () => {
    expect(new Card()).to.have.property('ns', 'item-option-card');
  });

  it('has a reactive property "localeCodes"', () => {
    const definition = { attribute: 'locale-codes' };
    expect(Card).to.have.deep.nested.property('properties.localeCodes', definition);
    expect(new Card()).to.have.property('localeCodes', null);
  });

  it('renders item option name in the title', async () => {
    const router = createBaseRouter({
      defaults,
      dataset: {
        item_options: [fromDefaults('item_options', { id: 0, cart_id: 0, name: 'Test' })],
        stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: true })],
        carts: [fromDefaults('carts', { id: 0, currency_code: 'MXN' })],
      },
      links: {
        item_options: ({ item_id, store_id, cart_id }) => ({
          'fx:store': { href: `./stores/${store_id}` },
          'fx:item': { href: `./items/${item_id}` },
          'fx:cart': { href: `./carts/${cart_id}` },
        }),
        stores: links.stores,
        carts: links.carts,
      },
    });

    const element = await fixture<Card>(html`
      <foxy-item-option-card
        href="https://demo.api/hapi/item_options/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-option-card>
    `);

    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });
    expect(await getByTestId(element, 'title')).to.include.text('Test');
  });

  it('renders weight modifier in the title', async () => {
    const router = createBaseRouter({
      defaults,
      dataset: {
        item_options: [fromDefaults('item_options', { id: 0, cart_id: 0, weight_mod: 8 })],
        stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: true })],
        carts: [fromDefaults('carts', { id: 0, currency_code: 'MXN' })],
      },
      links: {
        item_options: ({ item_id, store_id, cart_id }) => ({
          'fx:store': { href: `./stores/${store_id}` },
          'fx:item': { href: `./items/${item_id}` },
          'fx:cart': { href: `./carts/${cart_id}` },
        }),
        stores: links.stores,
        carts: links.carts,
      },
    });

    const element = await fixture<Card>(html`
      <foxy-item-option-card
        href="https://demo.api/hapi/item_options/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-option-card>
    `);

    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });
    expect(await getByTestId(element, 'title')).to.include.text('8');
  });

  it('renders price modifier in the title (intl currency symbol: true)', async () => {
    const router = createBaseRouter({
      defaults,
      dataset: {
        item_options: [fromDefaults('item_options', { id: 0, cart_id: 0, price_mod: 4 })],
        stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: true })],
        carts: [fromDefaults('carts', { id: 0, currency_code: 'MXN' })],
      },
      links: {
        item_options: ({ item_id, store_id, cart_id }) => ({
          'fx:store': { href: `./stores/${store_id}` },
          'fx:item': { href: `./items/${item_id}` },
          'fx:cart': { href: `./carts/${cart_id}` },
        }),
        stores: links.stores,
        carts: links.carts,
      },
    });

    const element = await fixture<Card>(html`
      <foxy-item-option-card
        href="https://demo.api/hapi/item_options/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-option-card>
    `);

    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });
    const control = await getByTestId(element, 'title');

    expect(control).to.contain.text('MXN');
    expect(control).to.contain.text('4.00');
  });

  it('renders price modifier in the title (intl currency symbol: false)', async () => {
    const router = createBaseRouter({
      defaults,
      dataset: {
        item_options: [fromDefaults('item_options', { id: 0, cart_id: 0, price_mod: 4 })],
        stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: false })],
        carts: [fromDefaults('carts', { id: 0, currency_code: 'EUR' })],
      },
      links: {
        item_options: ({ item_id, store_id, cart_id }) => ({
          'fx:store': { href: `./stores/${store_id}` },
          'fx:item': { href: `./items/${item_id}` },
          'fx:cart': { href: `./carts/${cart_id}` },
        }),
        stores: links.stores,
        carts: links.carts,
      },
    });

    const element = await fixture<Card>(html`
      <foxy-item-option-card
        href="https://demo.api/hapi/item_options/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-option-card>
    `);

    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });
    const control = await getByTestId(element, 'title');

    expect(control).to.contain.text('€4.00');
  });

  it('renders price modifier in the title (currency comes from cart)', async () => {
    const router = createBaseRouter({
      defaults,
      dataset: {
        item_options: [fromDefaults('item_options', { id: 0, cart_id: 0, price_mod: 4 })],
        stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: true })],
        carts: [fromDefaults('carts', { id: 0, currency_code: 'AUD' })],
      },
      links: {
        item_options: ({ item_id, store_id, cart_id }) => ({
          'fx:store': { href: `./stores/${store_id}` },
          'fx:item': { href: `./items/${item_id}` },
          'fx:cart': { href: `./carts/${cart_id}` },
        }),
        stores: links.stores,
        carts: links.carts,
      },
    });

    const element = await fixture<Card>(html`
      <foxy-item-option-card
        href="https://demo.api/hapi/item_options/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-option-card>
    `);

    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });
    const control = await getByTestId(element, 'title');

    expect(control).to.contain.text('AUD');
  });

  it("renders price modifier in the title (currency comes from cart's default template set)", async () => {
    const router = createBaseRouter({
      defaults,
      dataset: {
        property_helpers: [
          {
            id: 0,
            values: { ka_GE: 'Georgian locale for Georgia (Currency: GEL:₾)' },
            message: '',
          },
        ],
        template_sets: [
          fromDefaults('template_sets', { id: 0, code: 'DEFAULT', locale_code: 'ka_GE' }),
        ],
        item_options: [fromDefaults('item_options', { id: 0, cart_id: 0, price_mod: 4 })],
        stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: true })],
        carts: [fromDefaults('carts', { id: 0 })],
      },
      links: {
        property_helpers: links.property_helpers,
        item_options: ({ item_id, cart_id, store_id }) => ({
          'fx:store': { href: `./stores/${store_id}` },
          'fx:item': { href: `./items/${item_id}` },
          'fx:cart': { href: `./carts/${cart_id}` },
        }),
        stores: links.stores,
        carts: links.carts,
      },
    });

    const element = await fixture<Card>(html`
      <foxy-item-option-card
        locale-codes="https://demo.api/hapi/property_helpers/0"
        href="https://demo.api/hapi/item_options/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-option-card>
    `);

    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });
    const control = await getByTestId(element, 'title');

    expect(control).to.contain.text('GEL');
  });

  it("renders price modifier in the title (currency comes from cart's custom template set)", async () => {
    const router = createBaseRouter({
      defaults,
      dataset: {
        property_helpers: [
          {
            id: 0,
            values: { ar_EG: 'Arabic locale for Egypt (Currency: EGP:E£)' },
            message: '',
          },
        ],
        template_sets: [
          fromDefaults('template_sets', { id: 0, code: 'CUSTOM', locale_code: 'ar_EG' }),
        ],
        item_options: [fromDefaults('item_options', { id: 0, cart_id: 0, price_mod: 4 })],
        stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: true })],
        carts: [
          fromDefaults('carts', {
            id: 0,
            template_set_id: 0,
            template_set_uri: 'https://demo.api/hapi/template_sets/0',
          }),
        ],
      },
      links: {
        property_helpers: links.property_helpers,
        item_options: ({ item_id, cart_id, store_id }) => ({
          'fx:store': { href: `./stores/${store_id}` },
          'fx:cart': { href: `./carts/${cart_id}` },
          'fx:item': { href: `./items/${item_id}` },
        }),
        stores: links.stores,
        carts: links.carts,
      },
    });

    const element = await fixture<Card>(html`
      <foxy-item-option-card
        locale-codes="https://demo.api/hapi/property_helpers/0"
        href="https://demo.api/hapi/item_options/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-option-card>
    `);

    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });
    const control = await getByTestId(element, 'title');

    expect(control).to.contain.text('EGP');
  });

  it('renders price modifier in the title (currency comes from transaction)', async () => {
    const router = createBaseRouter({
      defaults,
      dataset: {
        item_options: [fromDefaults('item_options', { id: 0, transaction_id: 0, price_mod: 4 })],
        transactions: [fromDefaults('transactions', { id: 0, currency_code: 'TRY' })],
        stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: true })],
      },
      links: {
        item_options: ({ item_id, store_id, transaction_id }) => ({
          'fx:transaction': { href: `./transactions/${transaction_id}` },
          'fx:store': { href: `./stores/${store_id}` },
          'fx:item': { href: `./items/${item_id}` },
        }),
        stores: links.stores,
        carts: links.carts,
      },
    });

    const element = await fixture<Card>(html`
      <foxy-item-option-card
        href="https://demo.api/hapi/item_options/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-option-card>
    `);

    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });
    const control = await getByTestId(element, 'title');

    expect(control).to.contain.text('TRY');
  });

  it('renders price modifier in the title (currency comes from transaction template)', async () => {
    const router = createBaseRouter({
      defaults,
      dataset: {
        subscriptions: [fromDefaults('subscriptions', { id: 0, transaction_template_id: 0 })],
        item_options: [fromDefaults('item_options', { id: 0, subscription_id: 0, price_mod: 4 })],
        stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: true })],
        carts: [fromDefaults('carts', { id: 0, currency_code: 'UAH' })],
      },
      links: {
        subscriptions: links.subscriptions,
        item_options: ({ item_id, store_id, subscription_id }) => ({
          'fx:subscription': { href: `./subscriptions/${subscription_id}` },
          'fx:store': { href: `./stores/${store_id}` },
          'fx:item': { href: `./items/${item_id}` },
        }),
        stores: links.stores,
        carts: links.carts,
      },
    });

    const element = await fixture<Card>(html`
      <foxy-item-option-card
        href="https://demo.api/hapi/item_options/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-option-card>
    `);

    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });
    const control = await getByTestId(element, 'title');

    expect(control).to.contain.text('UAH');
  });

  it("renders price modifier in the title (currency comes from transaction template's default template set)", async () => {
    const router = createBaseRouter({
      defaults,
      dataset: {
        property_helpers: [
          {
            id: 0,
            values: { ka_GE: 'Georgian locale for Georgia (Currency: GEL:₾)' },
            message: '',
          },
        ],
        subscriptions: [fromDefaults('subscriptions', { id: 0, transaction_template_id: 0 })],
        template_sets: [
          fromDefaults('template_sets', { id: 0, code: 'DEFAULT', locale_code: 'ka_GE' }),
        ],
        item_options: [fromDefaults('item_options', { id: 0, subscription_id: 0, price_mod: 4 })],
        stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: true })],
        carts: [fromDefaults('carts', { id: 0 })],
      },
      links: {
        property_helpers: links.property_helpers,
        subscriptions: links.subscriptions,
        item_options: ({ item_id, store_id, subscription_id }) => ({
          'fx:subscription': { href: `./subscriptions/${subscription_id}` },
          'fx:store': { href: `./stores/${store_id}` },
          'fx:item': { href: `./items/${item_id}` },
        }),
        stores: links.stores,
        carts: links.carts,
      },
    });

    const element = await fixture<Card>(html`
      <foxy-item-option-card
        locale-codes="https://demo.api/hapi/property_helpers/0"
        href="https://demo.api/hapi/item_options/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-option-card>
    `);

    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });
    const control = await getByTestId(element, 'title');

    expect(control).to.contain.text('GEL');
  });

  it("renders price modifier in the title (currency comes from transaction template's custom template set)", async () => {
    const router = createBaseRouter({
      defaults,
      dataset: {
        property_helpers: [
          {
            id: 0,
            values: { ar_EG: 'Arabic locale for Egypt (Currency: EGP:E£)' },
            message: '',
          },
        ],
        subscriptions: [fromDefaults('subscriptions', { id: 0, transaction_template_id: 0 })],
        template_sets: [
          fromDefaults('template_sets', { id: 0, code: 'CUSTOM', locale_code: 'ar_EG' }),
        ],
        item_options: [fromDefaults('item_options', { id: 0, subscription_id: 0, price_mod: 4 })],
        stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: true })],
        carts: [
          fromDefaults('carts', {
            id: 0,
            template_set_id: 0,
            template_set_uri: 'https://demo.api/hapi/template_sets/0',
          }),
        ],
      },
      links: {
        property_helpers: links.property_helpers,
        subscriptions: links.subscriptions,
        item_options: ({ item_id, store_id, subscription_id }) => ({
          'fx:subscription': { href: `./subscriptions/${subscription_id}` },
          'fx:store': { href: `./stores/${store_id}` },
          'fx:item': { href: `./items/${item_id}` },
        }),
        stores: links.stores,
        carts: links.carts,
      },
    });

    const element = await fixture<Card>(html`
      <foxy-item-option-card
        locale-codes="https://demo.api/hapi/property_helpers/0"
        href="https://demo.api/hapi/item_options/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-item-option-card>
    `);

    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });
    const control = await getByTestId(element, 'title');

    expect(control).to.contain.text('EGP');
  });

  it('renders item option value in the subtitle', async () => {
    const router = createRouter();
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-item-option-card @fetch=${handleFetch}></foxy-item-option-card>`;
    const element = await fixture<Card>(layout);

    element.href = 'https://demo.api/hapi/item_options/0';
    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });
    const title = await getByTestId(element, 'subtitle');

    expect(title).to.include.text(element.data!.value);
  });
});
