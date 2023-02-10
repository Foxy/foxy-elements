import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { AppliedCouponCodeCard } from './index';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';

describe('AppliedCouponCodeCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and registers foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.equal(InternalCard);
  });

  it('imports and registers foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.equal(NucleonElement);
  });

  it('imports and registers itself as foxy-applied-coupon-code-card', () => {
    expect(customElements.get('foxy-applied-coupon-code-card')).to.equal(AppliedCouponCodeCard);
  });

  it('has a default i18n namespace "applied-coupon-code-card"', () => {
    expect(AppliedCouponCodeCard.defaultNS).to.equal('applied-coupon-code-card');
  });

  it('extends InternalCard', () => {
    expect(new AppliedCouponCodeCard()).to.be.instanceOf(InternalCard);
  });

  it('renders coupon code when ready', async () => {
    type Coupon = Resource<Rels.Coupon>;
    type Code = Resource<Rels.AppliedCouponCode>;

    const router = createRouter();
    const codeHref = 'https://demo.api/hapi/applied_coupon_codes/0';
    const code = await getTestData<Code>(codeHref, router);
    const coupon = await getTestData<Coupon>(code._links['fx:coupon'].href, router);

    const element = await fixture<AppliedCouponCodeCard>(html`
      <foxy-applied-coupon-code-card
        href=${codeHref}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-applied-coupon-code-card>
    `);

    await waitUntil(() => element.isBodyReady);

    expect(element.renderRoot).to.contain.text(code.code);
    expect(element.renderRoot).to.contain.text(coupon.name);
  });
});
