import './index';

import { CouponCodeCard as Card } from './CouponCodeCard';
import { expect, fixture, html } from '@open-wc/testing';
import { getTestData } from '../../../testgen/getTestData';
import { getByKey } from '../../../testgen/getByKey';

describe('CouponCodeCard', () => {
  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('defines itself as foxy-coupon-code-card element', () => {
    expect(customElements.get('foxy-coupon-code-card')).to.equal(Card);
  });

  it('has a default i18next namespace of `coupon-code-card`', () => {
    expect(Card).to.have.property('defaultNS', 'coupon-code-card');
    expect(new Card()).to.have.property('ns', 'coupon-code-card');
  });

  it('extends foxy-internal-card', () => {
    expect(new Card()).to.be.instanceOf(customElements.get('foxy-internal-card'));
  });

  it('renders line 1 with data as content', async () => {
    const element = await fixture<Card>(html`
      <foxy-coupon-code-card .data=${await getTestData('./hapi/coupon_codes/0')}>
      </foxy-coupon-code-card>
    `);

    const line1 = await getByKey(element, 'line_1');

    expect(line1).to.exist;
    expect(line1).to.have.attribute('infer', '');
    expect(line1).to.have.deep.property('options', element.data);
  });

  it('renders uses count', async () => {
    const element = await fixture<Card>(html`
      <foxy-coupon-code-card .data=${await getTestData('./hapi/coupon_codes/0')}>
      </foxy-coupon-code-card>
    `);

    const usesCount = await getByKey(element, 'uses_count');

    expect(usesCount).to.exist;
    expect(usesCount).to.have.attribute('infer', '');
    expect(usesCount).to.have.deep.nested.property(
      'options.count',
      element.data?.number_of_uses_to_date
    );
  });

  it('renders line 2 with data as content', async () => {
    const element = await fixture<Card>(html`
      <foxy-coupon-code-card .data=${await getTestData('./hapi/coupon_codes/0')}>
      </foxy-coupon-code-card>
    `);

    const line2 = await getByKey(element, 'line_2');

    expect(line2).to.exist;
    expect(line2).to.have.attribute('infer', '');
    expect(line2).to.have.deep.property('options', element.data);
  });
});
