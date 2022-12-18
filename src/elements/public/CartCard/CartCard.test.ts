import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { getTestData } from '../../../testgen/getTestData';
import { getByKey } from '../../../testgen/getByKey';
import { CartCard } from './CartCard';
import { I18n } from '../I18n/I18n';

describe('CartCard', () => {
  it('imports and registers foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and registers foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.equal(NucleonElement);
  });

  it('imports and registers foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.equal(InternalCard);
  });

  it('imports and registers itself as foxy-cart-card', () => {
    expect(customElements.get('foxy-cart-card')).to.equal(CartCard);
  });

  it('has a default i18n namespace "cart-card"', () => {
    expect(CartCard.defaultNS).to.equal('cart-card');
  });

  it('has a reactive property "localeCodes" (attribute "locale-codes", String, null by default)', () => {
    expect(CartCard).to.have.nested.property('properties.localeCodes');
    expect(CartCard).to.have.nested.property('properties.localeCodes.attribute', 'locale-codes');
    expect(CartCard).to.have.nested.property('properties.localeCodes.type', String);
    expect(new CartCard()).to.have.property('localeCodes', null);
  });

  it('extends InternalCard', () => {
    expect(new CartCard()).to.be.instanceOf(InternalCard);
  });

  it('renders exact item count in line 1 when items are embedded', async () => {
    type Items = Resource<Rels.Items>;
    type Cart = Resource<Rels.Cart, { zoom: 'items' }>;

    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0?zoom=items';
    const data = await getTestData<Cart>(href);
    const items = await getTestData<Items>(data._links['fx:items'].href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    data._embedded['fx:items'] = [items._embedded['fx:items'][0]];
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });

    const line1 = await getByKey(element, 'line_1');

    expect(line1).to.exist;
    expect(line1).to.have.attribute('infer', '');
    expect(line1).to.have.nested.property('options.count', 1);
  });

  it('renders approximate item count in line 1 when exactly 20 items are embedded', async () => {
    type Items = Resource<Rels.Items>;
    type Cart = Resource<Rels.Cart, { zoom: 'items' }>;

    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0?zoom=items';
    const data = await getTestData<Cart>(href);
    const items = await getTestData<Items>(data._links['fx:items'].href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    data._embedded['fx:items'] = new Array(20).fill(items._embedded['fx:items'][0]);
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });

    const line1 = await getByKey(element, 'line_1_approximate');

    expect(line1).to.exist;
    expect(line1).to.have.attribute('infer', '');
    expect(line1).to.have.nested.property('options.count', 20);
  });

  it('uses store-wide currency display settings for line 1 (intl symbol: true)', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0';
    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href=${href}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    await new CartCard.API(element).fetch(element.data!._links['fx:store'].href, {
      method: 'PATCH',
      body: JSON.stringify({ use_international_currency_symbol: true }),
    });

    element.href = '';
    element.href = 'https://demo.api/hapi/carts/0';

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const line1 = await getByKey(element, 'line_1');

    expect(line1).to.exist;
    expect(line1).to.have.attribute('infer', '');
    expect(line1).to.have.nested.property('options.currencyDisplay', 'code');
  });

  it('uses store-wide currency display settings for line 1 (intl symbol: false)', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0';
    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href=${href}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    await new CartCard.API(element).fetch(element.data!._links['fx:store'].href, {
      method: 'PATCH',
      body: JSON.stringify({ use_international_currency_symbol: false }),
    });

    element.href = '';
    element.href = 'https://demo.api/hapi/carts/0';

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const line1 = await getByKey(element, 'line_1');

    expect(line1).to.exist;
    expect(line1).to.have.attribute('infer', '');
    expect(line1).to.have.nested.property('options.currencyDisplay', 'symbol');
  });

  it('renders cart total in line 1', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0';
    const data = await getTestData<Data & { currency_code?: string }>(href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href=${href}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });

    const line1 = (await getByKey(element, 'line_1')) as I18n;

    expect(line1).to.exist;
    expect(line1).to.have.attribute('infer', '');
    expect(line1).to.have.nested.property('options.amount');

    expect(line1.options.amount.split(' ')[0]).to.equal(String(data.total_order));
  });

  it('uses currency code from fx:cart for line 1 when available', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0';
    const data = await getTestData<Resource<Rels.Cart>>(href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    // @ts-expect-error SDK types are incorrect
    data.total_order = 123;
    // @ts-expect-error SDK types are incomplete
    data.currency_code = 'MXN';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const line1 = await getByKey(element, 'line_1');

    expect(line1).to.have.nested.property('options.amount', '123 MXN');
  });

  it('uses currency code from the locale of fx:template_set at template_set_uri for line 1 when available', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0';
    const data = await getTestData<Resource<Rels.Cart>>(href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    await new CartCard.API(element).fetch('https://demo.api/hapi/template_sets/0', {
      method: 'PATCH',
      body: JSON.stringify({ code: 'TEST', locale_code: 'be_BY' }),
    });

    await new CartCard.API(element).fetch('https://demo.api/hapi/property_helpers/7', {
      method: 'PATCH',
      body: JSON.stringify({
        values: { be_BY: 'Belarusian locale for Belarus (Currency: BYN:Br)' },
      }),
    });

    // @ts-expect-error SDK types are incorrect
    data.total_order = 456;
    // @ts-expect-error SDK types are incomplete
    delete data.currency_code;
    data.template_set_uri = 'https://demo.api/hapi/template_sets/0';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const line1 = await getByKey(element, 'line_1');

    expect(line1).to.have.nested.property('options.amount', '456 BYN');
  });

  it('uses currency code from the locale of the default fx:template_set for line 1 when available', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0';
    const data = await getTestData<Resource<Rels.Cart>>(href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    await new CartCard.API(element).fetch('https://demo.api/hapi/template_sets/0', {
      method: 'PATCH',
      body: JSON.stringify({ code: 'DEFAULT', locale_code: 'tr_TR' }),
    });

    await new CartCard.API(element).fetch('https://demo.api/hapi/property_helpers/7', {
      method: 'PATCH',
      body: JSON.stringify({ values: { tr_TR: 'Turkish locale for Türkiye (Currency: TRY:₺)' } }),
    });

    // @ts-expect-error SDK types are incorrect
    data.total_order = 238;
    // @ts-expect-error SDK types are incomplete
    delete data.currency_code;
    data.template_set_uri = '';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const line1 = await getByKey(element, 'line_1');

    expect(line1).to.have.nested.property('options.amount', '238 TRY');
  });

  it('renders cart creation date in status', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0';
    const data = await getTestData<Resource<Rels.Cart>>(href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href=${href}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const status = await getByKey(element, 'status');

    expect(status).to.exist;
    expect(status).to.have.attribute('infer', '');
    expect(status).to.have.nested.property('options.dateCreated', data.date_created);
  });

  it('renders "no items" text in line 2 if items are embedded and the cart is empty', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0?zoom=items';
    const data = await getTestData<Resource<Rels.Cart, { zoom: 'items' }>>(href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    data._embedded['fx:items'] = [];
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const line2 = await getByKey(element, 'line_2_empty');

    expect(line2).to.exist;
    expect(line2).to.have.attribute('infer', '');
  });

  it('renders "no items" text in line 2 if items are not embedded and the cart is empty', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0';
    const data = await getTestData<Resource<Rels.Cart>>(href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    data._links['fx:items'].href = 'https://demo.api/hapi/items?cart_id=-1';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const line2 = await getByKey(element, 'line_2_empty');

    expect(line2).to.exist;
    expect(line2).to.have.attribute('infer', '');
  });

  it('renders item name in line two if items are embedded and the cart has just 1 item', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0?zoom=items';
    const data = await getTestData<Resource<Rels.Cart, { zoom: 'items' }>>(href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    data._embedded['fx:items'] = [data._embedded['fx:items'][0]];
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const line2 = await getByKey(element, 'line_2_one');

    expect(line2).to.exist;
    expect(line2).to.have.attribute('infer', '');
    expect(line2).to.have.deep.property('options', data._embedded['fx:items'][0]);
  });

  it('renders item name in line two if items are not embedded and the cart has just 1 item', async () => {
    const itemsHref = 'https://demo.api/hapi/items?id=0&order=price+desc&limit=1';
    const href = 'https://demo.api/hapi/carts/0';

    const router = createRouter();
    const items = await getTestData<Resource<Rels.Items>>(itemsHref, router);
    const data = await getTestData<Resource<Rels.Cart>>(href, router);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    data._links['fx:items'].href = itemsHref;
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const line2 = await getByKey(element, 'line_2_one');

    expect(line2).to.exist;
    expect(line2).to.have.attribute('infer', '');
    expect(line2).to.have.deep.property('options', items._embedded['fx:items'][0]);
  });

  it('renders first item name + "more" in line two if items are embedded and the cart has more than 1 item', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0?zoom=items';
    const data = await getTestData<Resource<Rels.Cart, { zoom: 'items' }>>(href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    data._embedded['fx:items'] = new Array(3).fill(data._embedded['fx:items'][0]);
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const line2 = await getByKey(element, 'line_2_many');

    expect(line2).to.exist;
    expect(line2).to.have.attribute('infer', '');
    expect(line2).to.have.deep.property('options', data._embedded['fx:items'][0]);
  });

  it('renders first item name + "more" in line two if items are not embedded and the cart has more than 1 item', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0';
    const data = await getTestData<Resource<Rels.Cart>>(href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    await Promise.all(
      ['Test 1', 'Test 2'].map(name => {
        return new CartCard.API(element).fetch('https://demo.api/hapi/items?cart_id=0', {
          method: 'POST',
          body: JSON.stringify({ name }),
        });
      })
    );

    const items = await getTestData<Resource<Rels.Items>>(data._links['fx:items'].href, router);
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const line2 = await getByKey(element, 'line_2_many');

    expect(line2).to.exist;
    expect(line2).to.have.attribute('infer', '');
    expect(line2).to.have.deep.property('options', items._embedded['fx:items'][0]);
  });

  it('renders customer email in line 3 if available', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0';
    const data = await getTestData<Resource<Rels.Cart>>(href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    data.customer_email = 'test@test.com';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    expect(element.renderRoot).to.include.text('test@test.com');
  });

  it('renders "no customer" text in line 3 if cart is not linked to a customer', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/carts/0';
    const data = await getTestData<Resource<Rels.Cart>>(href);

    const element = await fixture<CartCard>(html`
      <foxy-cart-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-cart-card>
    `);

    data.customer_email = '';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const line3 = await getByKey(element, 'no_customer');

    expect(line3).to.exist;
    expect(line3).to.have.attribute('infer', '');
  });
});
