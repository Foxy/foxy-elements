import '../../../NucleonElement/index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { InternalTransactionSummaryControl } from './index';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { Transaction } from '../../Transaction';
import { html } from 'lit-html';
import { createRouter } from '../../../../../server/index';
import { FetchEvent } from '../../../NucleonElement/FetchEvent';

describe('Transaction', () => {
  describe('InternalTransactionSummaryControl', () => {
    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines foxy-i18n', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('imports and defines itself as foxy-internal-transaction-summary-control', () => {
      expect(customElements.get('foxy-internal-transaction-summary-control')).to.equal(
        InternalTransactionSummaryControl
      );
    });

    it('extends InternalControl', () => {
      expect(new InternalTransactionSummaryControl()).to.be.instanceOf(InternalControl);
    });

    it('renders total order price', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-summary-control infer="summary">
          </foxy-internal-transaction-summary-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));

      const control = wrapper.firstElementChild as InternalTransactionSummaryControl;
      const value = control.renderRoot.querySelector('foxy-i18n[key="price"]');

      expect(value).to.exist;
      expect(value).to.have.deep.property('options', { amount: '11.9 USD' });
      expect(value).to.have.property('infer', '');
    });

    it('renders status', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-summary-control infer="summary">
          </foxy-internal-transaction-summary-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));

      const control = wrapper.firstElementChild as InternalTransactionSummaryControl;
      const status = control.renderRoot.querySelector('foxy-i18n[key="transaction_completed"]');

      expect(status).to.exist;
      expect(status).to.have.property('infer', '');
    });

    it('renders total item price', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-summary-control infer="summary">
          </foxy-internal-transaction-summary-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));

      const control = wrapper.firstElementChild as InternalTransactionSummaryControl;
      const label = control.renderRoot.querySelector('foxy-i18n[key="total_item_price"]')!;
      const value = label.nextElementSibling!;

      expect(label).to.exist;
      expect(label).to.have.property('infer', '');

      expect(value).to.exist;
      expect(value).to.have.property('infer', '');
      expect(value).to.have.deep.property('options', { amount: '10 USD' });
    });

    it('renders total shipping price', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-summary-control infer="summary">
          </foxy-internal-transaction-summary-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));

      const control = wrapper.firstElementChild as InternalTransactionSummaryControl;
      const label = control.renderRoot.querySelector('foxy-i18n[key="total_shipping"]')!;
      const value = label.nextElementSibling!;

      expect(label).to.exist;
      expect(label).to.have.property('infer', '');

      expect(value).to.exist;
      expect(value).to.have.property('infer', '');
      expect(value).to.have.deep.property('options', { amount: '0 USD' });
    });

    it('renders total tax', async () => {
      const router = createRouter();
      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-summary-control infer="summary">
          </foxy-internal-transaction-summary-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));

      const control = wrapper.firstElementChild as InternalTransactionSummaryControl;
      const label = control.renderRoot.querySelector('foxy-i18n[key="total_tax"]')!;
      const value = label.nextElementSibling!;

      expect(label).to.exist;
      expect(label).to.have.property('infer', '');

      expect(value).to.exist;
      expect(value).to.have.property('infer', '');
      expect(value).to.have.deep.property('options', { amount: '1.9 USD' });
    });
  });
});
