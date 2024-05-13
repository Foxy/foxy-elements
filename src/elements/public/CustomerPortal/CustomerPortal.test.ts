import './index';

import { expect, fixture, html } from '@open-wc/testing';

import { API } from '@foxy.io/sdk/customer';
import { CustomerApi } from '../CustomerApi';
import { CustomerPortal } from './CustomerPortal';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';
import { InternalCustomerPortalLoggedInView } from './InternalCustomerPortalLoggedInView';
import { InternalCustomerPortalLoggedOutView } from './InternalCustomerPortalLoggedOutView';

describe('CustomerPortal', () => {
  it('extends CustomerApi', () => {
    expect(new CustomerPortal()).to.be.instanceOf(CustomerApi);
  });

  it('registers as foxy-customer-portal', () => {
    expect(customElements.get('foxy-customer-portal')).to.equal(CustomerPortal);
  });

  it('has a reactive property "transactionsTableColumns"', () => {
    expect(CustomerPortal).to.have.deep.nested.property('properties.transactionsTableColumns', {
      attribute: false,
    });

    expect(new CustomerPortal()).to.have.deep.property('transactionsTableColumns', [
      TransactionsTable.priceColumn,
      TransactionsTable.summaryColumn,
      TransactionsTable.statusColumn,
      TransactionsTable.idColumn,
      TransactionsTable.dateColumn,
      TransactionsTable.receiptColumn,
    ]);
  });

  it('has an empty group property by default', () => {
    expect(new CustomerPortal()).to.have.property('group', '');
  });

  it('has an empty lang property by default', () => {
    expect(new CustomerPortal()).to.have.property('lang', '');
  });

  it('sets group property from group attribute', async () => {
    const layout = html`<foxy-customer-portal group="foo"></foxy-customer-portal>`;
    const element = await fixture<CustomerPortal>(layout);
    expect(element).to.have.property('group', 'foo');
  });

  it('sets lang property from lang attribute', async () => {
    const layout = html`<foxy-customer-portal lang="foo"></foxy-customer-portal>`;
    const element = await fixture<CustomerPortal>(layout);
    expect(element).to.have.property('lang', 'foo');
  });

  it('renders foxy-internal-customer-portal-logged-out-view when logged out', async () => {
    localStorage.clear();

    const layout = html`
      <foxy-customer-portal base="https://demo.foxycart.com/s/customer/">
        <template slot="sign-in:header:before">
          <div>Test</div>
        </template>
      </foxy-customer-portal>
    `;

    const element = await fixture<CustomerPortal>(layout);
    const view = element.renderRoot.firstElementChild as InternalCustomerPortalLoggedOutView;

    expect(view).to.be.instanceOf(InternalCustomerPortalLoggedOutView);
    expect(view).to.have.property('localName', 'foxy-internal-customer-portal-logged-out-view');
    expect(view).to.have.attribute('infer', '');
    expect(view).to.have.attribute(
      'href',
      'https://demo.foxycart.com/s/customer/customer_portal_settings'
    );
  });

  it('renders foxy-internal-customer-portal-logged-in-view when logged in', async () => {
    localStorage.setItem(API.SESSION, 'session-stub');

    const transactionsTableColumns = [TransactionsTable.idColumn];

    const layout = html`
      <foxy-customer-portal
        base="https://demo.api/portal/"
        .transactionsTableColumns=${transactionsTableColumns}
      >
        <template slot="sign-in:header:before">
          <div>Test</div>
        </template>
      </foxy-customer-portal>
    `;

    const element = await fixture<CustomerPortal>(layout);
    const view = element.renderRoot.firstElementChild as InternalCustomerPortalLoggedInView;

    expect(view).to.be.instanceOf(InternalCustomerPortalLoggedInView);
    expect(view).to.have.property('localName', 'foxy-internal-customer-portal-logged-in-view');
    expect(view).to.have.property('transactionsTableColumns', transactionsTableColumns);
    expect(view).to.have.attribute('customer', 'https://demo.api/portal/');
    expect(view).to.have.attribute('infer', '');

    localStorage.clear();
  });
});
