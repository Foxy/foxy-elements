import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { DiscountCard } from './DiscountCard';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getByKey } from '../../../testgen/getByKey';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-html';
import { createAccessDeniedResponse } from '../../../utils/test-utils';
import { createRouter } from '../../../server/index';

const router = createRouter();

describe('DiscountCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('extends TwoLineCard', () => {
    expect(new DiscountCard()).to.be.instanceOf(TwoLineCard);
  });

  it('registers as foxy-discount-card', () => {
    expect(customElements.get('foxy-discount-card')).to.equal(DiscountCard);
  });

  it('has a default i18next namespace of "discount-card"', () => {
    expect(new DiscountCard()).to.have.property('ns', 'discount-card');
  });

  it('renders discount name and code in the title', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-discount-card @fetch=${handleFetch}></foxy-discount-card>`;
    const element = await fixture<DiscountCard>(layout);

    element.href = 'https://demo.api/hapi/discounts/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const title = await getByTestId(element, 'title');

    expect(title).to.include.text(element.data!.name);
    expect(title).to.include.text(element.data!.code);
  });

  it('renders discount amount in the subtitle', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-discount-card @fetch=${handleFetch}></foxy-discount-card>`;
    const element = await fixture<DiscountCard>(layout);

    element.href = 'https://demo.api/hapi/discounts/0';
    element.lang = 'es';
    element.ns = 'foo';

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const subtitle = (await getByTestId(element, 'subtitle')) as HTMLDivElement;
    const amount = await getByKey(subtitle, 'price');
    const data = element.data!;

    type Transaction = Resource<Rels.Transaction>;
    type Store = Resource<Rels.Store>;

    const store = await getTestData<Store>(data._links['fx:store'].href);
    const transaction = await getTestData<Transaction>(data._links['fx:transaction'].href);
    const options = JSON.stringify({
      currencyDisplay: store.use_international_currency_symbol ? 'code' : 'symbol',
      amount: `${data.amount} ${transaction.currency_code}`,
    });

    expect(amount).to.have.attribute('options', options);
    expect(amount).to.have.attribute('lang', element.lang);
    expect(amount).to.have.attribute('ns', element.ns);
  });

  it('renders the loaded resource when the transaction and store are denied', async () => {
    const router = createRouter();
    const handleFetch = (evt: FetchEvent) => {
      if (/\/(transactions|stores)\//.test(evt.request.url)) {
        evt.preventDefault();
        evt.respondWith(Promise.resolve(createAccessDeniedResponse('read', 'transaction')));
      } else {
        router.handleEvent(evt);
      }
    };

    const element = await fixture<DiscountCard>(html`
      <foxy-discount-card
        href="https://demo.api/hapi/discounts/0"
        @fetch=${handleFetch}
      ></foxy-discount-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    expect(element.in('idle')).to.be.true;

    const title = await getByTestId(element, 'title');
    const subtitle = await getByTestId(element, 'subtitle');

    expect(title).to.include.text(element.data!.name);
    expect(title).to.not.include.text('undefined');
    expect(subtitle).to.not.include.text('undefined');
  });

  describe('current user scope', () => {
    const create = async (links: Record<string, unknown> = {}) => {
      const element = new DiscountCard();
      const data = await getTestData<any>('./hapi/discounts/0');
      element.data = { ...data, _links: { ...data._links, ...links } };
      return element;
    };

    it('keeps selectors unchanged without a scope and with store_full_access', async () => {
      const element = await create();

      [null, 'store_full_access'].forEach(scope => {
        element.currentUserScope = scope;
        expect(element.hiddenSelector.toString()).to.equal('');
        expect(element.readonlySelector.toString()).to.equal('');
      });
    });

    it('uses transactions when it belongs to a transaction', async () => {
      const element = await create();
      element.currentUserScope = 'transactions_read customers_read';
      expect(element.scopeCollection).to.equal('transactions');
      expect(element.readonlySelector.matches('any-control', true)).to.be.true;
      expect(element.hiddenSelector.matches('delete', true)).to.be.true;
    });

    it('uses carts when it belongs to a cart', async () => {
      const element = await create({ 'fx:cart': { href: 'https://demo.api/hapi/carts/0' } });
      element.currentUserScope = 'transactions_read';
      expect(element.scopeCollection).to.equal('carts');
      expect(element.readonlySelector.matches('any-control', true)).to.be.false;

      element.currentUserScope = 'carts_read';
      expect(element.readonlySelector.matches('any-control', true)).to.be.true;
    });
  });
});
