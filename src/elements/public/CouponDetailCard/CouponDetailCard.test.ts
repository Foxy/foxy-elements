import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createAccessDeniedResponse } from '../../../utils/test-utils';
import { createRouter } from '../../../server/index';
import { getByTestId } from '../../../testgen/getByTestId';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { CouponDetailCard } from './index';
import { getTestData } from '../../../testgen/getTestData';

describe('CouponDetailCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('extends TwoLineCard', () => {
    expect(new CouponDetailCard()).to.be.instanceOf(TwoLineCard);
  });

  it('registers as foxy-coupon-detail-card', () => {
    expect(customElements.get('foxy-coupon-detail-card')).to.equal(CouponDetailCard);
  });

  it('has a default i18next namespace of "coupon-detail-card"', () => {
    expect(new CouponDetailCard()).to.have.property('ns', 'coupon-detail-card');
  });

  it('renders discount name and code in the title', async () => {
    const router = createRouter();
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture<CouponDetailCard>(html`
      <foxy-coupon-detail-card @fetch=${handleFetch}> </foxy-coupon-detail-card>
    `);

    element.href = 'https://demo.api/hapi/coupon_details/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    element.lang = 'en';
    element.data!.name = 'Test';
    element.data!.code = 'FOOBAR-123';
    element.data = { ...element.data! };

    const title = await getByTestId(element, 'title');

    expect(title).to.include.text('Test');
    expect(title).to.include.text('FOOBAR-123');
  });

  it('renders discount amount in the subtitle', async () => {
    const router = createRouter();
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture<CouponDetailCard>(html`
      <foxy-coupon-detail-card @fetch=${handleFetch}> </foxy-coupon-detail-card>
    `);

    element.href = 'https://demo.api/hapi/coupon_details/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    element.lang = 'en';
    element.data!.amount_per = 256;
    element.data = { ...element.data! };

    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('USD');
    expect(subtitle).to.include.text('256.00');
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

    const element = await fixture<CouponDetailCard>(html`
      <foxy-coupon-detail-card
        href="https://demo.api/hapi/coupon_details/0"
        @fetch=${handleFetch}
      ></foxy-coupon-detail-card>
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
      const element = new CouponDetailCard();
      const data = await getTestData<any>('./hapi/coupon_details/0');
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
