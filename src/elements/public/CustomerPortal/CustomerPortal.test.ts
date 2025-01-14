import './index';

import { expect, fixture, html } from '@open-wc/testing';

import { API } from '@foxy.io/sdk/customer';
import { CustomerApi } from '../CustomerApi';
import { CustomerPortal } from './CustomerPortal';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';
import { InternalCustomerPortalLoggedInView } from './InternalCustomerPortalLoggedInView';
import { InternalCustomerPortalLoggedOutView } from './InternalCustomerPortalLoggedOutView';
import { InternalCustomerPortalPasswordResetView } from './InternalCustomerPortalPasswordResetView';

describe('CustomerPortal', () => {
  before(() => localStorage.clear());

  it('extends CustomerApi', () => {
    expect(new CustomerPortal()).to.be.instanceOf(CustomerApi);
  });

  it('imports and defines dependencies', () => {
    expect(customElements.get('iron-icon')).to.exist;
    expect(customElements.get('vaadin-button')).to.exist;
    expect(customElements.get('foxy-internal-password-control')).to.exist;
    expect(customElements.get('foxy-internal-sandbox')).to.exist;
    expect(customElements.get('foxy-internal-form')).to.exist;
    expect(customElements.get('foxy-access-recovery-form')).to.exist;
    expect(customElements.get('foxy-payment-method-card')).to.exist;
    expect(customElements.get('foxy-transactions-table')).to.exist;
    expect(customElements.get('foxy-subscription-card')).to.exist;
    expect(customElements.get('foxy-subscription-form')).to.exist;
    expect(customElements.get('foxy-collection-pages')).to.exist;
    expect(customElements.get('foxy-collection-page')).to.exist;
    expect(customElements.get('foxy-customer-form')).to.exist;
    expect(customElements.get('foxy-sign-in-form')).to.exist;
    expect(customElements.get('foxy-form-dialog')).to.exist;
    expect(customElements.get('foxy-spinner')).to.exist;
    expect(customElements.get('foxy-i18n')).to.exist;
    expect(customElements.get('foxy-customer')).to.exist;
    expect(customElements.get('foxy-internal-customer-portal-logged-in-view')).to.exist;
    expect(customElements.get('foxy-internal-customer-portal-logged-out-view')).to.exist;
    expect(customElements.get('foxy-internal-customer-portal-password-reset-view')).to.exist;
    expect(customElements.get('foxy-internal-customer-portal-subscriptions')).to.exist;
    expect(customElements.get('foxy-internal-customer-portal-transactions')).to.exist;
    expect(customElements.get('foxy-internal-customer-portal-link')).to.exist;
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

  it('has a reactive property "embedUrl"', () => {
    expect(new CustomerPortal()).to.have.property('embedUrl', null);
    expect(CustomerPortal).to.have.deep.nested.property('properties.embedUrl', {
      attribute: 'embed-url',
    });
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
    localStorage.setItem(
      API.SESSION,
      JSON.stringify({
        force_password_reset: false,
        session_token: `dasjhf348tuhrgskjfhw48ourowi4rshajdhf`,
        expires_in: 2419200,
        jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
      })
    );

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

  it('renders foxy-internal-customer-portal-password-reset-view when logged in with temporary password', async () => {
    localStorage.setItem(
      API.SESSION,
      JSON.stringify({
        force_password_reset: true,
        session_token: `dasjhf348tuhrgskjfhw48ourowi4rshajdhf`,
        expires_in: 2419200,
        jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
      })
    );

    const layout = html`
      <foxy-customer-portal base="https://demo.api/portal/"></foxy-customer-portal>
    `;

    const element = await fixture<CustomerPortal>(layout);
    const view = element.renderRoot.firstElementChild as InternalCustomerPortalPasswordResetView;

    expect(view).to.be.instanceOf(InternalCustomerPortalPasswordResetView);
    expect(view).to.have.property('localName', 'foxy-internal-customer-portal-password-reset-view');
    expect(view).to.have.attribute('href', 'https://demo.api/portal/');
    expect(view).to.have.attribute('infer', 'password-reset');

    localStorage.clear();
  });
});
