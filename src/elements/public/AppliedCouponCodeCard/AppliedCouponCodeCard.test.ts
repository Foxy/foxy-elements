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

  describe('current user scope', () => {
    const create = async () => {
      const element = new AppliedCouponCodeCard();
      element.data = await getTestData<any>('./hapi/applied_coupon_codes/0');
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

    it('follows carts for a code applied to a cart', async () => {
      const element = await create();
      element.currentUserScope = 'carts_read templates_read';
      expect(element.readonlySelector.matches('any-control', true)).to.be.true;
      expect(element.hiddenSelector.matches('delete', true)).to.be.true;

      element.currentUserScope = 'carts_write';
      expect(element.readonlySelector.matches('any-control', true)).to.be.false;
      expect(element.hiddenSelector.matches('delete', true)).to.be.false;
    });
  });

  describe('helper loaders and current user scope', () => {
    const create = async (scope: string) => {
      const router = createRouter();
      const data = await getTestData<any>('./hapi/applied_coupon_codes/0');
      data._links['fx:coupon'] = { href: 'https://demo.api/virtual/denied' };

      const element = await fixture<AppliedCouponCodeCard>(html`
        <foxy-applied-coupon-code-card
          current-user-scope=${scope}
          .data=${data}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-applied-coupon-code-card>
      `);

      await waitUntil(
        () => {
          const loaders = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
          return [...loaders].every(loader => !loader.in('busy'));
        },
        '',
        { timeout: 5000 }
      );

      await element.requestUpdate();
      return element;
    };

    it('waits for the coupon without a scope or with coupons_read', async () => {
      expect((await create('')).isBodyReady).to.be.false;
      expect((await create('carts_read coupons_read')).isBodyReady).to.be.false;
    });

    it('renders without the coupon when the scope cannot read coupons', async () => {
      const element = await create('carts_read');
      expect(element.isBodyReady).to.be.true;
      expect(element.renderRoot).to.contain.text(element.data!.code);
    });
  });
});
