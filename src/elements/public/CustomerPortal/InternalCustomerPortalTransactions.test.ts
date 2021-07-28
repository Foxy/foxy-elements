import './index';

import { expect, fixture, html } from '@open-wc/testing';

import { CollectionPages } from '../CollectionPages';
import { InternalCustomerPortalTransactions } from './InternalCustomerPortalTransactions';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { LitElement } from 'lit-element';
import { getByKey } from '../../../testgen/getByKey';
import { getByTag } from '../../../testgen/getByTag';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';

describe('InternalCustomerPortalTransactions', () => {
  it('extends LitElement', () => {
    expect(new InternalCustomerPortalTransactions()).to.be.instanceOf(LitElement);
  });

  it('registers as foxy-internal-customer-portal-transactions', () => {
    expect(customElements.get('foxy-internal-customer-portal-transactions')).to.equal(
      InternalCustomerPortalTransactions
    );
  });

  describe('header', () => {
    it('renders custom header:before template if present', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const element = await fixture<InternalCustomerPortalTransactions>(html`
        <foxy-internal-customer-portal-transactions
          .templates=${{ 'header:before': () => html`Test` }}
          .customer=${customer}
        >
        </foxy-internal-customer-portal-transactions>
      `);

      const sandbox = (await getByTestId(element, 'header:before'))!;
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });

    it('renders custom header:after template if present', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const element = await fixture<InternalCustomerPortalTransactions>(html`
        <foxy-internal-customer-portal-transactions
          .templates=${{ 'header:after': () => html`Test` }}
          .customer=${customer}
        >
        </foxy-internal-customer-portal-transactions>
      `);

      const sandbox = (await getByTestId(element, 'header:after'))!;
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });

    it('renders custom foxy-i18n header with key "transaction_plural"', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const view = await fixture<InternalCustomerPortalTransactions>(html`
        <foxy-internal-customer-portal-transactions lang="es" .customer=${customer}>
        </foxy-internal-customer-portal-transactions>
      `);

      const transactions = (await getByTestId(view, 'transactions')) as HTMLDivElement;
      const header = await getByKey(transactions, 'transaction_plural');

      expect(header).to.exist;
      expect(header).to.have.attribute('lang', 'es');
      expect(header).to.have.attribute('ns', 'customer-portal');
    });

    it('hides header if hiddencontrols matches "header"', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const view = await fixture<InternalCustomerPortalTransactions>(html`
        <foxy-internal-customer-portal-transactions hiddencontrols="header" .customer=${customer}>
        </foxy-internal-customer-portal-transactions>
      `);

      expect(await getByKey(view, 'transaction_plural')).to.not.exist;
    });
  });

  describe('list', () => {
    it('renders custom list:before template if present', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const view = await fixture<InternalCustomerPortalTransactions>(html`
        <foxy-internal-customer-portal-transactions
          .templates=${{ 'list:before': () => html`Test` }}
          .customer=${customer}
        >
        </foxy-internal-customer-portal-transactions>
      `);

      const sandbox = (await getByTestId(view, 'list:before'))!;
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });

    it('renders custom list:after template if present', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const view = await fixture<InternalCustomerPortalTransactions>(html`
        <foxy-internal-customer-portal-transactions
          .templates=${{ 'list:after': () => html`Test` }}
          .customer=${customer}
        >
        </foxy-internal-customer-portal-transactions>
      `);

      const sandbox = (await getByTestId(view, 'list:after'))!;
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });

    it('renders custom foxy-collection-pages displaying transactions', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const view = await fixture<InternalCustomerPortalTransactions>(html`
        <foxy-internal-customer-portal-transactions
          group="test"
          lang="es"
          .customer=${customer}
          .templates=${{ 'table:default': () => '' }}
        >
        </foxy-internal-customer-portal-transactions>
      `);

      const transactions = (await getByTestId(view, 'transactions')) as HTMLDivElement;
      const pages = (await getByTag(transactions, 'foxy-collection-pages')) as CollectionPages<any>;

      expect(pages).to.have.attribute(
        'first',
        'https://demo.foxycart.com/s/admin/stores/0/transactions?customer_id=0&zoom=items'
      );

      expect(pages).to.have.attribute('group', 'test');
      expect(pages).to.have.attribute('lang', 'es');
      expect(pages).to.have.attribute('page', 'foxy-transactions-table');

      expect(pages).to.have.property('templates');
      expect(pages.templates).to.have.key('default');
    });

    it('hides list if hiddencontrols matches "list"', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const view = await fixture<InternalCustomerPortalTransactions>(html`
        <foxy-internal-customer-portal-transactions hiddencontrols="list" .customer=${customer}>
        </foxy-internal-customer-portal-transactions>
      `);

      const transactions = (await getByTestId(view, 'transactions'))!;
      expect(await getByTag(transactions, 'foxy-collection-pages')).to.not.exist;
    });
  });
});
