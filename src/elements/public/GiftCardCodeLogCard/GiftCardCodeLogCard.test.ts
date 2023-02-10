import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { GiftCardCodeLogCard } from './GiftCardCodeLogCard';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { getTestData } from '../../../testgen/getTestData';
import { getByKey } from '../../../testgen/getByKey';
import { I18n } from '../I18n/I18n';

describe('GiftCardCodeLogCard', () => {
  it('imports and registers foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and registers foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.equal(NucleonElement);
  });

  it('imports and registers foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.equal(InternalCard);
  });

  it('imports and registers itself as foxy-gift-card-code-log-card', () => {
    expect(customElements.get('foxy-gift-card-code-log-card')).to.equal(GiftCardCodeLogCard);
  });

  it('has a default i18n namespace "gift-card-code-log-card"', () => {
    expect(GiftCardCodeLogCard.defaultNS).to.equal('gift-card-code-log-card');
  });

  it('extends InternalCard', () => {
    expect(new GiftCardCodeLogCard()).to.be.instanceOf(InternalCard);
  });

  it('renders "title_used" i18n key if linked to a transaction', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/gift_card_code_logs/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<GiftCardCodeLogCard>(html`
      <foxy-gift-card-code-log-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-gift-card-code-log-card>
    `);

    data.transaction_id = 0;
    element.data = { ...data };

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const title = await getByKey(element, 'title_used');

    expect(title).to.exist;
    expect(title).to.have.attribute('infer', '');
  });

  it('renders "title_updated_via_api" i18n key if not linked to a transaction', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/gift_card_code_logs/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<GiftCardCodeLogCard>(html`
      <foxy-gift-card-code-log-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-gift-card-code-log-card>
    `);

    data.transaction_id = null;
    element.data = { ...data };

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const title = await getByKey(element, 'title_updated_via_api');

    expect(title).to.exist;
    expect(title).to.have.attribute('infer', '');
  });

  it('renders log timestamp', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/gift_card_code_logs/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<GiftCardCodeLogCard>(html`
      <foxy-gift-card-code-log-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-gift-card-code-log-card>
    `);

    data.transaction_id = null;
    element.data = { ...data };

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const date = await getByKey(element, 'date');

    expect(date).to.exist;
    expect(date).to.have.attribute('infer', '');
    expect(date).to.have.nested.property('options.date_created', data.date_created);
  });

  it('renders "subtitle_transaction" i18n key if linked to a transaction', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/gift_card_code_logs/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<GiftCardCodeLogCard>(html`
      <foxy-gift-card-code-log-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-gift-card-code-log-card>
    `);

    data.transaction_id = 0;
    element.data = { ...data };

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const subtitle = await getByKey(element, 'subtitle_transaction');

    expect(subtitle).to.exist;
    expect(subtitle).to.have.attribute('infer', '');
    expect(subtitle).to.have.nested.property('options.transaction_id', data.transaction_id);
  });

  it('renders "subtitle_no_transaction" i18n key if not linked to a transaction', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/gift_card_code_logs/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<GiftCardCodeLogCard>(html`
      <foxy-gift-card-code-log-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-gift-card-code-log-card>
    `);

    data.transaction_id = null;
    element.data = { ...data };

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const subtitle = await getByKey(element, 'subtitle_no_transaction');

    expect(subtitle).to.exist;
    expect(subtitle).to.have.attribute('infer', '');
  });

  it('renders "adjustment" i18n key', async () => {
    type Store = Resource<Rels.Store>;
    type GiftCard = Resource<Rels.GiftCard>;

    const router = createRouter();

    const data = await getTestData<Data>('https://demo.api/hapi/gift_card_code_logs/0');
    const store = await getTestData<Store>(data._links['fx:store'].href);
    const giftCard = await getTestData<GiftCard>(data._links['fx:gift_card'].href);

    const element = await fixture<GiftCardCodeLogCard>(html`
      <foxy-gift-card-code-log-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-gift-card-code-log-card>
    `);

    data.balance_adjustment = -45;
    element.data = { ...data };

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const adjustment = await getByKey(element, 'adjustment');
    const currencyDisplay = store.use_international_currency_symbol ? 'code' : 'symbol';

    expect(adjustment).to.exist;
    expect(adjustment).to.have.attribute('infer', '');
    expect(adjustment).to.have.nested.property('options.amount', `-45 ${giftCard.currency_code}`);
    expect(adjustment).to.have.nested.property('options.signDisplay', 'exceptZero');
    expect(adjustment).to.have.nested.property('options.currencyDisplay', currencyDisplay);
  });
});
