import '../../../NucleonElement/index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { InternalTransactionCustomerControl } from './index';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { Transaction } from '../../Transaction';
import { html } from 'lit-html';
import { createRouter } from '../../../../../server/index';
import { FetchEvent } from '../../../NucleonElement/FetchEvent';

describe('Transaction', () => {
  describe('InternalTransactionCustomerControl', () => {
    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines foxy-swipe-actions', () => {
      expect(customElements.get('foxy-swipe-actions')).to.exist;
    });

    it('imports and defines foxy-customer-card', () => {
      expect(customElements.get('foxy-customer-card')).to.exist;
    });

    it('imports and defines foxy-spinner', () => {
      expect(customElements.get('foxy-spinner')).to.exist;
    });

    it('imports and defines foxy-i18n', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('imports and defines itself as foxy-internal-transaction-customer-control', () => {
      expect(customElements.get('foxy-internal-transaction-customer-control')).to.equal(
        InternalTransactionCustomerControl
      );
    });

    it('extends InternalControl', () => {
      expect(new InternalTransactionCustomerControl()).to.be.instanceOf(InternalControl);
    });

    it('renders customer card', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-customer-control infer="customer">
          </foxy-internal-transaction-customer-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));
      const control = wrapper.firstElementChild as InternalTransactionCustomerControl;
      await control.requestUpdate();
      const card = control.renderRoot.querySelector('foxy-customer-card');

      expect(card).to.exist;
      expect(card).to.have.property('infer', '');
      expect(card).to.have.property('href', 'https://demo.api/hapi/customers/0');
    });
  });
});
