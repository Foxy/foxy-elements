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

      // @ts-expect-error using private property for testing purposes
      await waitUntil(() => !!control.__store);

      expect(value).to.exist;
      expect(value).to.have.deep.property('options', {
        currencyDisplay: 'code',
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

      // @ts-expect-error using private property for testing purposes
      await waitUntil(() => !!control.__store);

      expect(label).to.exist;
      expect(label).to.have.property('infer', '');

      expect(value).to.exist;
      expect(value).to.have.property('infer', '');
      expect(value).to.have.deep.property('options', {
        currencyDisplay: 'code',
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

      // @ts-expect-error using private property for testing purposes
      await waitUntil(() => !!control.__store);

      expect(label).to.exist;
      expect(label).to.have.property('infer', '');

      expect(value).to.exist;
      expect(value).to.have.property('infer', '');
      expect(value).to.have.deep.property('options', {
        currencyDisplay: 'code',
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

      // @ts-expect-error using private property for testing purposes
      await waitUntil(() => !!control.__store);

      expect(label).to.exist;
      expect(label).to.have.property('infer', '');

      expect(value).to.exist;
      expect(value).to.have.property('infer', '');
      expect(value).to.have.deep.property('options', {
        currencyDisplay: 'code',
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
              code: 'CODE1',
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
              code: 'CODE2',
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
          href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,gift_card_code_logs:gift_card,gift_card_code_logs:gift_card_code"
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

      // @ts-expect-error using private property for testing purposes
      await waitUntil(() => !!control.__store);

      expect(label1).to.exist;
      expect(label1).to.include.text('Test1 • CODE1');

      expect(value1).to.exist;
      expect(value1).to.have.property('key', 'price');
      expect(value1).to.have.property('infer', '');
      expect(value1).to.have.deep.property('options', {
        amount: '-1 USD',
        currencyDisplay: 'code',
        signDisplay: 'exceptZero',
      });

      const label2 = control.renderRoot.querySelectorAll('[data-testclass="discount"]')[1];
      const value2 = label2.nextElementSibling!.firstElementChild;

      expect(label2).to.exist;
      expect(label2).to.include.text('Test2 • CODE2');

      expect(value2).to.exist;
      expect(value2).to.have.property('key', 'price');
      expect(value2).to.have.property('infer', '');
      expect(value2).to.have.deep.property('options', {
        amount: '-2 USD',
        currencyDisplay: 'code',
        signDisplay: 'exceptZero',
      });
    });

    it('renders applied gift cards if embeds include gift card code logs', async () => {
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
          gift_card_code_logs: [
            {
              id: 0,
              store_id: 0,
              gift_card_id: 0,
              gift_card_code_id: 0,
              transaction_id: 0,
              external_id: null,
              balance_adjustment: -40.3,
              user_id: null,
              source: null,
              date_created: '2021-11-15T19:30:33-0800',
              date_modified: '2021-11-15T19:30:35-0800',
            },
          ],
          gift_cards: [
            {
              id: 0,
              store_id: 0,
              name: 'Silver Gift Card (US)',
              currency_code: 'USD',
              expires_after: '5y',
              product_code_restrictions: 'abc123,fun_*,*_small,-foobar,-*_example,-test_code',
              date_created: '2014-04-21T13:40:45-0700',
              date_modified: '2015-03-16T12:30:58-0700',
            },
          ],
          gift_card_codes: [
            {
              id: 0,
              item_id: 0,
              store_id: 0,
              gift_card_id: 0,
              code: `GIFTCARD0`,
              end_date: Math.random() > 0.5 ? '2022-02-16T12:30:58-0700' : null,
              current_balance: Math.round(Math.random() * 100),
              date_created: '2014-04-21T13:40:45-0700',
              date_modified: '2022-02-16T12:30:58-0700',
            },
          ],
        },
        links,
      });

      const wrapper = await fixture<Transaction>(html`
        <foxy-nucleon
          href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,gift_card_code_logs:gift_card,gift_card_code_logs:gift_card_code"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <foxy-internal-transaction-summary-control infer="summary">
          </foxy-internal-transaction-summary-control>
        </foxy-nucleon>
      `);

      await waitUntil(() => wrapper.in({ idle: 'snapshot' }));

      const control = wrapper.firstElementChild as InternalTransactionSummaryControl;
      await control.requestUpdate();
      const label = control.renderRoot.querySelectorAll('[data-testclass="gift-card-code"]')[0];
      const value = label.nextElementSibling!.firstElementChild;

      // @ts-expect-error using private property for testing purposes
      await waitUntil(() => !!control.__store);

      expect(label).to.exist;
      expect(label).to.include.text('Silver Gift Card (US) • GIFTCARD0');

      expect(value).to.exist;
      expect(value).to.have.property('key', 'price');
      expect(value).to.have.property('infer', '');
      expect(value).to.have.deep.property('options', {
        amount: '-40.3 USD',
        currencyDisplay: 'code',
        signDisplay: 'exceptZero',
      });
    });
  });
});
