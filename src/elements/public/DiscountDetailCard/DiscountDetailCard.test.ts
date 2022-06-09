import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { getByTestId } from '../../../testgen/getByTestId';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { DiscountDetailCard } from './index';

describe('DiscountDetailCard', () => {
  it('extends TwoLineCard', () => {
    expect(new DiscountDetailCard()).to.be.instanceOf(TwoLineCard);
  });

  it('registers as foxy-discount-detail-card', () => {
    expect(customElements.get('foxy-discount-detail-card')).to.equal(DiscountDetailCard);
  });

  it('has a default i18next namespace of "discount-detail-card"', () => {
    expect(new DiscountDetailCard()).to.have.property('ns', 'discount-detail-card');
  });

  it('renders discount name in the title', async () => {
    const router = createRouter();
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture<DiscountDetailCard>(html`
      <foxy-discount-detail-card @fetch=${handleFetch}> </foxy-discount-detail-card>
    `);

    element.href = 'https://demo.api/hapi/discount_details/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    element.lang = 'en';
    element.data!.name = 'Test';
    element.data = { ...element.data! };

    const title = await getByTestId(element, 'title');
    expect(title).to.include.text('Test');
  });

  it('renders discount amount in the subtitle', async () => {
    const router = createRouter();
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const element = await fixture<DiscountDetailCard>(html`
      <foxy-discount-detail-card @fetch=${handleFetch}> </foxy-discount-detail-card>
    `);

    element.href = 'https://demo.api/hapi/discount_details/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    element.lang = 'en';
    element.data!.amount_per = 256;
    element.data = { ...element.data! };

    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('USD');
    expect(subtitle).to.include.text('256.00');
  });
});
