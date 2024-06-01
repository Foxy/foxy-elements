import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { Customer } from '../Customer/Customer';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { InternalCustomerPortalLoggedInView } from './InternalCustomerPortalLoggedInView';
import { InternalCustomerPortalSubscriptions } from './InternalCustomerPortalSubscriptions';
import { InternalCustomerPortalTransactions } from './InternalCustomerPortalTransactions';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { NucleonElement } from '../NucleonElement';
import { createRouter } from '../../../server/index';
import { getByTag } from '../../../testgen/getByTag';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';

const router = createRouter();

describe('InternalCustomerPortalLoggedInViewTest', () => {
  it('extends NucleonElement', () => {
    expect(new InternalCustomerPortalLoggedInView()).to.be.instanceOf(NucleonElement);
  });

  it('has a reactive property "transactionsTableColumns"', () => {
    const definition = { attribute: false };
    const View = InternalCustomerPortalLoggedInView;

    expect(View).to.have.deep.nested.property('properties.transactionsTableColumns', definition);
    expect(new View()).to.have.deep.property('transactionsTableColumns', []);
  });

  it('has a reactive property "embedUrl"', () => {
    const View = InternalCustomerPortalLoggedInView;
    expect(new View()).to.have.property('embedUrl', null);
    expect(View).to.have.deep.nested.property('properties.embedUrl', {
      attribute: 'embed-url',
    });
  });

  it('renders configurable foxy-customer by default', async () => {
    const element = await fixture<InternalCustomerPortalLoggedInView>(html`
      <foxy-internal-customer-portal-logged-in-view
        disabledcontrols="sign-in:recover"
        readonlycontrols="customer:header:actions:edit:form"
        hiddencontrols="access-recovery:header"
        embed-url="https://embed.foxy.io/v1?demo=default"
        customer="https://demo.foxycart.com/s/customer/"
        group="foo"
        href="https://demo.foxycart.com/s/customer/customer_portal_settings"
        lang="es"
        .templates=${{ 'customer:header:before': () => 'Test' }}
      >
      </foxy-internal-customer-portal-logged-in-view>
    `);

    const customer = (await getByTestId(element, 'customer')) as Customer;
    const hiddenByDefault = [
      'attributes',
      'transactions',
      'subscriptions',
      'addresses:actions:create',
      'payment-methods:list:card:actions:update:form:template-set',
      'header:actions:edit:form:is-anonymous',
      'header:actions:edit:form:forgot-password',
      'header:actions:edit:form:create',
      'header:actions:edit:form:delete',
    ];

    expect(customer).to.be.instanceOf(Customer);
    expect(customer).to.have.attribute('disabledcontrols', '');
    expect(customer).to.have.attribute('readonlycontrols', 'header:actions:edit:form');
    expect(customer).to.have.attribute('hiddencontrols', hiddenByDefault.join(' '));
    expect(customer).to.have.attribute('embed-url', 'https://embed.foxy.io/v1?demo=default');
    expect(customer).to.have.attribute('group', 'foo');
    expect(customer).to.have.attribute('lang', 'es');
    expect(customer).to.have.attribute('href', 'https://demo.foxycart.com/s/customer/');
    expect(customer.templates).to.have.any.keys('header:before');
  });

  describe('customer:header:actions:sign-out', () => {
    it('renders disabled sign_out button in header:actions:after template of foxy-customer by default', async () => {
      const element = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view></foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(element, 'customer')) as Customer;
      const templateRenderer = customer.templates['header:actions:after']!;
      const renderedTemplate = await fixture(html`<div>${templateRenderer(html, customer)}</div>`);
      const button = await getByTestId(renderedTemplate, 'sign-out');

      expect(button).to.exist;
      expect(button).to.have.attribute('aria-label', 'sign_out');
      expect(button).to.have.attribute('disabled');
    });

    it('renders disabled sign_out button in header:actions:after template of foxy-customer if disabledcontrols includes "customer:header:actions:sign-out"', async () => {
      const element = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          disabledcontrols="customer:header:actions:sign-out"
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(element, 'customer')) as Customer;

      customer.data = await getTestData('./hapi/customers/0');
      element.loggingOutState = 'idle';

      const templateRenderer = customer.templates['header:actions:after']!;
      const renderedTemplate = await fixture(html`<div>${templateRenderer(html, customer)}</div>`);
      const button = await getByTestId(renderedTemplate, 'sign-out');

      expect(button).to.have.attribute('disabled');
    });

    it('signs out on click by sending a DELETE to foxy://customer-api/session', async () => {
      const fetchEvents: FetchEvent[] = [];
      const element = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          @fetch=${(evt: FetchEvent) => fetchEvents.push(evt)}
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(element, 'customer')) as Customer;
      customer.data = await getTestData('./hapi/customers/0');

      const templateRenderer = customer.templates['header:actions:after']!;
      const renderedTemplate = await fixture(html`<div>${templateRenderer(html, customer)}</div>`);
      const button = (await getByTestId(renderedTemplate, 'sign-out')) as ButtonElement;

      button.click();
      expect(element).to.have.property('loggingOutState', 'busy');

      await waitUntil(
        () =>
          fetchEvents.some(({ request }) => {
            const { url, method } = request;
            return url === 'foxy://customer-api/session' && method === 'DELETE';
          }),
        undefined,
        { timeout: 5000 }
      );
    });

    it('renders disabled sign_out button in header:actions:after template of foxy-customer while logging out', async () => {
      const element = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view></foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(element, 'customer')) as Customer;

      customer.data = await getTestData('./hapi/customers/0');
      element.loggingOutState = 'busy';

      const templateRenderer = customer.templates['header:actions:after']!;
      const renderedTemplate = await fixture(html`<div>${templateRenderer(html, customer)}</div>`);
      const button = await getByTestId(renderedTemplate, 'sign-out');

      expect(button).to.have.attribute('disabled');
    });

    it('hides sign out button if hiddencontrols includes "customer:header:actions:sign-out"', async () => {
      const element = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          hiddencontrols="customer:header:actions:sign-out"
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(element, 'customer')) as Customer;
      const templateRenderer = customer.templates['header:actions:after']!;
      const renderedTemplate = await fixture(html`<div>${templateRenderer(html, customer)}</div>`);
      const button = await getByTestId(renderedTemplate, 'sign-out');

      expect(button).not.to.exist;
    });

    it('renders customer:header:actions:sign-out:before template if present', async () => {
      const element = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          .templates=${{ 'customer:header:actions:sign-out:before': () => html`Test` }}
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(element, 'customer')) as Customer;
      const templateRenderer = customer.templates['header:actions:after']!;
      const renderedTemplate = await fixture(html`<div>${templateRenderer(html, customer)}</div>`);
      const sandbox = await getByTestId(
        renderedTemplate,
        'customer:header:actions:sign-out:before'
      );

      expect(sandbox).to.exist;
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });

    it('renders customer:header:actions:sign-out:after template if present', async () => {
      const element = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          .templates=${{ 'customer:header:actions:sign-out:after': () => html`Test` }}
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(element, 'customer')) as Customer;
      const templateRenderer = customer.templates['header:actions:after']!;
      const renderedTemplate = await fixture(html`<div>${templateRenderer(html, customer)}</div>`);
      const sandbox = await getByTestId(renderedTemplate, 'customer:header:actions:sign-out:after');

      expect(sandbox).to.exist;
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });
  });

  describe('subscriptions', () => {
    it('renders foxy-internal-customer-portal-subscriptions in the default template sandbox of foxy-customer', async () => {
      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          readonlycontrols="customer:subscriptions:foo"
          disabledcontrols="customer:subscriptions:bar"
          hiddencontrols="customer:subscriptions:baz"
          customer="https://demo.api/portal/"
          group="test"
          lang="es"
          href="https://demo.api/portal/customer_portal_settings"
          .templates=${{ 'customer:subscriptions:qux': () => html`Test` }}
          @fetch=${(evt: FetchEvent) => {
            const token = `0-${Date.now() + Math.pow(10, 10)}`;
            evt.request.headers.set('Authorization', `Bearer ${token}`);
            router.handleEvent(evt);
          }}
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      await waitUntil(() => view.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });

      const customer = (await getByTestId(view, 'customer')) as Customer;
      await waitUntil(() => customer.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });

      const tag = 'foxy-internal-customer-portal-subscriptions';
      const sandbox = (await getByTestId(customer, 'default')) as InternalSandbox;
      const element = (await getByTag(sandbox, tag)) as InternalCustomerPortalSubscriptions;

      expect(element).to.exist;

      expect(element).to.have.attribute('readonlycontrols', 'foo');
      expect(element).to.have.attribute('disabledcontrols', 'bar');
      expect(element).to.have.attribute('hiddencontrols', 'baz');
      expect(element).to.have.attribute('group', 'test');
      expect(element).to.have.attribute('lang', 'es');

      expect(element.templates).to.have.key('qux');

      expect(element).to.have.deep.property('customer', customer.data);
      expect(element).to.have.deep.property('settings', view.data);
    });

    it('renders custom customer:subscriptions:before template in the default template sandbox of foxy-customer if present', async () => {
      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          .templates=${{ 'customer:subscriptions:before': () => html`Test` }}
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(view, 'customer')) as Customer;
      const customerSandbox = (await getByTestId(customer, 'default')) as InternalSandbox;
      const templateSandbox = await getByTestId(customerSandbox, 'customer:subscriptions:before');

      expect(templateSandbox).to.be.instanceOf(InternalSandbox);
    });

    it('renders custom customer:subscriptions:after template in the default template sandbox of foxy-customer if present', async () => {
      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          .templates=${{ 'customer:subscriptions:after': () => html`Test` }}
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(view, 'customer')) as Customer;
      const customerSandbox = (await getByTestId(customer, 'default')) as InternalSandbox;
      const templateSandbox = await getByTestId(customerSandbox, 'customer:subscriptions:after');

      expect(templateSandbox).to.be.instanceOf(InternalSandbox);
    });

    it("doesn't render foxy-internal-customer-portal-subscriptions if hiddencontrols matches customer:subscriptions", async () => {
      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view hiddencontrols="customer:subscriptions">
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(view, 'customer')) as Customer;
      const sandbox = (await getByTestId(customer, 'default')) as InternalSandbox;
      const element = await getByTag(sandbox, 'foxy-internal-customer-portal-subscriptions');

      expect(element).to.not.exist;
    });
  });

  describe('transactions', () => {
    it('renders foxy-internal-customer-portal-transactions in the default template sandbox of foxy-customer', async () => {
      const transactionsTableColumns = [TransactionsTable.idColumn];

      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          readonlycontrols="customer:transactions:foo"
          disabledcontrols="customer:transactions:bar"
          hiddencontrols="customer:transactions:baz"
          customer="https://demo.api/portal/"
          group="test"
          lang="es"
          href="https://demo.api/portal/customer_portal_settings"
          .transactionsTableColumns=${transactionsTableColumns}
          .templates=${{ 'customer:transactions:qux': () => html`Test` }}
          @fetch=${(evt: FetchEvent) => {
            const token = `0-${Date.now() + Math.pow(10, 10)}`;
            evt.request.headers.set('Authorization', `Bearer ${token}`);
            router.handleEvent(evt);
          }}
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      await waitUntil(() => view.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });

      const customer = (await getByTestId(view, 'customer')) as Customer;
      await waitUntil(() => customer.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });

      const tag = 'foxy-internal-customer-portal-transactions';
      const sandbox = (await getByTestId(customer, 'default')) as InternalSandbox;
      const element = (await getByTag(sandbox, tag)) as InternalCustomerPortalTransactions;

      expect(element).to.exist;

      expect(element).to.have.attribute('readonlycontrols', 'foo');
      expect(element).to.have.attribute('disabledcontrols', 'bar');
      expect(element).to.have.attribute('hiddencontrols', 'baz');
      expect(element).to.have.attribute('group', 'test');
      expect(element).to.have.attribute('lang', 'es');

      expect(element.templates).to.have.key('qux');

      expect(element).to.have.deep.property('customer', customer.data);
      expect(element).to.have.property('columns', transactionsTableColumns);
    });

    it('renders custom customer:transactions:before template in the default template sandbox of foxy-customer if present', async () => {
      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          .templates=${{ 'customer:transactions:before': () => html`Test` }}
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(view, 'customer')) as Customer;
      const customerSandbox = (await getByTestId(customer, 'default')) as InternalSandbox;
      const templateSandbox = await getByTestId(customerSandbox, 'customer:transactions:before');

      expect(templateSandbox).to.be.instanceOf(InternalSandbox);
    });

    it('renders custom customer:transactions:after template in the default template sandbox of foxy-customer if present', async () => {
      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          .templates=${{ 'customer:transactions:after': () => html`Test` }}
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(view, 'customer')) as Customer;
      const customerSandbox = (await getByTestId(customer, 'default')) as InternalSandbox;
      const templateSandbox = await getByTestId(customerSandbox, 'customer:transactions:after');

      expect(templateSandbox).to.be.instanceOf(InternalSandbox);
    });

    it("doesn't render foxy-internal-customer-portal-transactions if hiddencontrols matches customer:transactions", async () => {
      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view hiddencontrols="customer:transactions">
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(view, 'customer')) as Customer;
      const sandbox = (await getByTestId(customer, 'default')) as InternalSandbox;
      const element = await getByTag(sandbox, 'foxy-internal-customer-portal-transactions');

      expect(element).to.not.exist;
    });
  });
});
