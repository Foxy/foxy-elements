import '../../../NucleonElement/index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { InternalTransactionCustomerControl } from './index';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { Transaction } from '../../Transaction';
import { html } from 'lit-html';
import { createRouter } from '../../../../../server/index';
import { FormDialog } from '../../../FormDialog/FormDialog';
import { FetchEvent } from '../../../NucleonElement/FetchEvent';
import { stub } from 'sinon';

describe('Transaction', () => {
  describe('InternalTransactionCustomerControl', () => {
    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines foxy-internal-details', () => {
      expect(customElements.get('foxy-internal-details')).to.exist;
    });

    it('imports and defines foxy-customer-card', () => {
      expect(customElements.get('foxy-customer-card')).to.exist;
    });

    it('imports and defines foxy-form-dialog', () => {
      expect(customElements.get('foxy-form-dialog')).to.exist;
    });

    it('imports and defines foxy-customer', () => {
      expect(customElements.get('foxy-customer')).to.exist;
    });

    it('imports and defines itself as foxy-internal-transaction-customer-control', () => {
      expect(customElements.get('foxy-internal-transaction-customer-control')).to.equal(
        InternalTransactionCustomerControl
      );
    });

    it('extends InternalControl', () => {
      expect(new InternalTransactionCustomerControl()).to.be.instanceOf(InternalControl);
    });

    it('renders details/summary titled "customer"', async () => {
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
      const details = control.renderRoot.querySelector('foxy-internal-details');

      expect(details).to.exist;
      expect(details).to.have.property('summary', 'customer');
      expect(details).to.have.property('infer', '');
      expect(details).to.have.property('open', true);
    });

    it('renders customer form in a dialog', async () => {
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
      const dialog = control.renderRoot.querySelector('foxy-form-dialog');

      expect(dialog).to.exist;
      expect(dialog).to.have.property('header', 'header');
      expect(dialog).to.have.property('infer', 'dialog');
      expect(dialog).to.have.property('form', 'foxy-customer');
      expect(dialog).to.have.property('href', 'https://demo.api/hapi/customers/0');
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
      const card = control.renderRoot.querySelector('foxy-customer-card');

      expect(card).to.exist;
      expect(card).to.have.property('infer', 'card');
      expect(card).to.have.property('href', 'https://demo.api/hapi/customers/0');
    });

    it('opens customer form in a dialog on click', async () => {
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
      const dialog = control.renderRoot.querySelector('foxy-form-dialog') as FormDialog;
      const card = control.renderRoot.querySelector('foxy-customer-card')!;
      const showMethod = stub(dialog, 'show');

      card.dispatchEvent(new CustomEvent('click', { bubbles: true }));
      expect(showMethod).to.have.been.calledOnce;
      showMethod.restore();
    });
  });
});
