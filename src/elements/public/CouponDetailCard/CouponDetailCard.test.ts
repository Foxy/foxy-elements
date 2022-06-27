import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { getByTestId } from '../../../testgen/getByTestId';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { CouponDetailCard } from './index';

describe('CouponDetailCard', () => {
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
});
