import '../../../NucleonElement/index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { InternalTransactionSummaryControl } from './index';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { Transaction } from '../../Transaction';
import { html } from 'lit-html';
import { createRouter as createBaseRouter } from '../../../../../server/router/createRouter';
import { createRouter } from '../../../../../server/hapi';
import { defaults } from '../../../../../server/hapi/defaults';
import { links } from '../../../../../server/hapi/links';
import { FetchEvent } from '../../../NucleonElement/FetchEvent';
import { createDataset } from '../../../../../server/hapi/createDataset';

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
      await control.requestUpdate();
      const value = control.renderRoot.querySelector('foxy-i18n[key="price"]');

      expect(value).to.exist;
      expect(value).to.have.deep.property('options', {
        currencyDisplay: 'symbol',
        signDisplay: 'auto',
        amount: '10 USD',
      });
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
      await control.requestUpdate();
      const status = control.renderRoot.querySelector('foxy-i18n[key="status_completed"]');

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
      await control.requestUpdate();
      const label = control.renderRoot.querySelector('foxy-i18n[key="total"]')!;
      const value = label.nextElementSibling!;

      expect(label).to.exist;
      expect(label).to.have.property('infer', '');

      expect(value).to.exist;
      expect(value).to.have.property('infer', '');
      expect(value).to.have.deep.property('options', {
        currencyDisplay: 'symbol',
        signDisplay: 'auto',
        amount: '11.9 USD',
      });
    });

    it('renders total shipping price if shipments are not embedded', async () => {
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
      await control.requestUpdate();
      const label = control.renderRoot.querySelector('foxy-i18n[key="total_shipping"]')!;
      const value = label.parentElement!.nextElementSibling!.firstElementChild;

      expect(label).to.exist;
      expect(label).to.have.property('infer', '');

      expect(value).to.exist;
      expect(value).to.have.property('infer', '');
      expect(value).to.have.deep.property('options', {
        currencyDisplay: 'symbol',
        signDisplay: 'exceptZero',
        amount: '0 USD',
      });
    });

    it('renders total tax if taxes are not embedded', async () => {
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
      await control.requestUpdate();
      const label = control.renderRoot.querySelector('foxy-i18n[key="total_tax"]')!;
      const value = label.parentElement!.nextElementSibling!.firstElementChild;

      expect(label).to.exist;
      expect(label).to.have.property('infer', '');

      expect(value).to.exist;
      expect(value).to.have.property('infer', '');
      expect(value).to.have.deep.property('options', {
        currencyDisplay: 'symbol',
        signDisplay: 'exceptZero',
        amount: '1.9 USD',
      });
    });

    it('renders discounts if embeds include discounts', async () => {
      const router = createBaseRouter({
        defaults,
        dataset: {
          ...createDataset(),
          transactions: [
            {
              id: 0,
              store_id: 0,
              customer_id: 0,
              subscription_id: 0,
              is_test: true,
              is_editable: true,
              hide_transaction: false,
              data_is_fed: true,
              transaction_date: '2013-06-06T17:26:07-05:00',
              locale_code: 'en_US',
              customer_first_name: 'Test',
              customer_last_name: 'User',
              customer_tax_id: '',
              customer_email: 'testing@example.com',
              customer_ip: '10.1.248.210',
              ip_country: '',
              total_item_price: 10,
              total_tax: 1.9,
              total_shipping: 0,
              total_future_shipping: 0,
              total_order: 11.9,
              date_created: '2013-06-06T15:26:07-0700',
              date_modified: '2013-06-06T15:26:07-0700',
              currency_code: 'USD',
              currency_symbol: '$',
              status: 'completed',
            },
          ],
          discounts: [
            {
              id: 0,
              cart_id: 0,
              store_id: 0,
              coupon_id: 0,
              customer_id: 0,
              coupon_code_id: 0,
              transaction_id: 0,
              code: 'Test1',
              amount: -1,
              name: 'Test1',
              display: '-1.00',
              is_taxable: false,
              is_future_discount: false,
              date_created: null,
              date_modified: null,
            },
            {
              id: 1,
              cart_id: 0,
              store_id: 0,
              coupon_id: 0,
              customer_id: 0,
              coupon_code_id: 0,
              transaction_id: 0,
              code: 'Test2',
              amount: -2,
              name: 'Test2',
              display: '-2.00',
              is_taxable: false,
              is_future_discount: false,
              date_created: null,
              date_modified: null,
            },
          ],
        },
        links,
      });

      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-summary-control infer="summary">
          </foxy-internal-transaction-summary-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));

      const control = wrapper.firstElementChild as InternalTransactionSummaryControl;
      await control.requestUpdate();
      const label1 = control.renderRoot.querySelectorAll('[data-testclass="discount"]')[0];
      const value1 = label1.nextElementSibling!.firstElementChild;

      expect(label1).to.exist;
      expect(label1).to.include.text('Test1');

      expect(value1).to.exist;
      expect(value1).to.have.property('key', 'price');
      expect(value1).to.have.property('infer', '');
      expect(value1).to.have.deep.property('options', {
        amount: '-1 USD',
        currencyDisplay: 'symbol',
        signDisplay: 'exceptZero',
      });

      const label2 = control.renderRoot.querySelectorAll('[data-testclass="discount"]')[1];
      const value2 = label2.nextElementSibling!.firstElementChild;

      expect(label2).to.exist;
      expect(label2).to.include.text('Test2');

      expect(value2).to.exist;
      expect(value2).to.have.property('key', 'price');
      expect(value2).to.have.property('infer', '');
      expect(value2).to.have.deep.property('options', {
        amount: '-2 USD',
        currencyDisplay: 'symbol',
        signDisplay: 'exceptZero',
      });
    });
  });
});
