import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import './index';

import { InternalCartFormPaymentMethodCard as Card } from './InternalCartFormPaymentMethodCard';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../../../server';

describe('CartForm', () => {
  describe('InternalCartFormPaymentMethodCard', () => {
    const OriginalResizeObserver = window.ResizeObserver;

    // @ts-expect-error disabling ResizeObserver because it errors in test env
    before(() => (window.ResizeObserver = undefined));
    after(() => (window.ResizeObserver = OriginalResizeObserver));

    it('imports and defines foxy-internal-card', () => {
      expect(customElements.get('foxy-internal-card')).to.exist;
    });

    it('imports and defines foxy-i18n', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('defines itself as foxy-internal-cart-form-payment-method-card', () => {
      expect(customElements.get('foxy-internal-cart-form-payment-method-card')).to.exist;
    });

    it('extends foxy-internal-card', () => {
      expect(new Card()).to.be.an.instanceOf(customElements.get('foxy-internal-card'));
    });

    it('renders payment method title', async () => {
      const router = createRouter();
      const element = await fixture<Card>(html`
        <foxy-internal-cart-form-payment-method-card
          href="https://demo.api/hapi/transactions/0?zoom=payments"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-cart-form-payment-method-card>
      `);

      await waitUntil(() => !!element.data, '', { timeout: 5000 });
      const title = element.renderRoot.querySelector('foxy-i18n[key="title"]');

      expect(title).to.exist;
      expect(title).to.have.attribute('infer', '');
      expect(title).to.have.deep.property('options', {
        last4Digits: '1111',
        context: 'valid',
        month: '01',
        type: 'Visa',
        year: '17',
      });
    });

    it('renders payment method subtitle', async () => {
      const router = createRouter();
      const element = await fixture<Card>(html`
        <foxy-internal-cart-form-payment-method-card
          href="https://demo.api/hapi/transactions/0?zoom=payments"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-cart-form-payment-method-card>
      `);

      await waitUntil(() => !!element.data, '', { timeout: 5000 });
      const subtitle = element.renderRoot.querySelector('foxy-i18n[key="subtitle"]');

      expect(subtitle).to.exist;
      expect(subtitle).to.have.attribute('infer', '');
      expect(subtitle).to.have.deep.property('options', {
        date: '2015-05-21T14:22:09-0700',
        id: 0,
      });
    });
  });
});
