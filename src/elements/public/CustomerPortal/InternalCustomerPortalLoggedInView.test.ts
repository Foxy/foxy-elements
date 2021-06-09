import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { CollectionPage } from '../CollectionPage';
import { CollectionPages } from '../CollectionPages';
import { Customer } from '../Customer/Customer';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormDialog } from '../FormDialog';
import { InternalCustomerPortalLink } from './InternalCustomerPortalLink';
import { InternalCustomerPortalLoggedInView } from './InternalCustomerPortalLoggedInView';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { NucleonElement } from '../NucleonElement';
import { SubscriptionCard } from '../SubscriptionCard';
import { SubscriptionForm } from '../SubscriptionForm';
import { getByKey } from '../../../testgen/getByKey';
import { getByTag } from '../../../testgen/getByTag';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { router } from '../../../server';

describe('InternalCustomerPortalLoggedInViewTest', () => {
  it('extends NucleonElement', () => {
    expect(new InternalCustomerPortalLoggedInView()).to.be.instanceOf(NucleonElement);
  });

  it('renders configurable foxy-customer by default', async () => {
    const element = await fixture<InternalCustomerPortalLoggedInView>(html`
      <foxy-internal-customer-portal-logged-in-view
        disabledcontrols="sign-in:recover"
        readonlycontrols="customer:header:actions:edit:form"
        hiddencontrols="access-recovery:header"
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
      'header:actions:edit:form:delete',
      'attributes',
      'transactions',
      'subscriptions',
      'addresses:actions:create',
      'payment-methods:list:card',
    ];

    expect(customer).to.be.instanceOf(Customer);
    expect(customer).to.have.attribute('disabledcontrols', '');
    expect(customer).to.have.attribute('readonlycontrols', 'header:actions:edit:form:not=*');
    expect(customer).to.have.attribute('hiddencontrols', hiddenByDefault.join(' '));
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

      customer.data = await getTestData('./s/admin/customers/0');
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
      customer.data = await getTestData('./s/admin/customers/0');

      const templateRenderer = customer.templates['header:actions:after']!;
      const renderedTemplate = await fixture(html`<div>${templateRenderer(html, customer)}</div>`);
      const button = (await getByTestId(renderedTemplate, 'sign-out')) as ButtonElement;

      button.click();
      expect(element).to.have.property('loggingOutState', 'busy');

      await waitUntil(() =>
        fetchEvents.some(({ request }) => {
          const { url, method } = request;
          return url === 'foxy://customer-api/session' && method === 'DELETE';
        })
      );
    });

    it('renders disabled sign_out button in header:actions:after template of foxy-customer while logging out', async () => {
      const element = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view></foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(element, 'customer')) as Customer;

      customer.data = await getTestData('./s/admin/customers/0');
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
    it('renders custom customer:subscriptions:before template in default slot of foxy-customer if present', async () => {
      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          .templates=${{ 'customer:subscriptions:before': () => html`Test` }}
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(view, 'customer')) as Customer;
      const sandbox = (await getByTestId(view, 'customer:subscriptions:before')) as InternalSandbox;

      expect(customer).to.have.descendant(sandbox);
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });

    it('renders custom customer:subscriptions:after template in default slot of foxy-customer if present', async () => {
      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          .templates=${{ 'customer:subscriptions:after': () => html`Test` }}
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(view, 'customer')) as Customer;
      const sandbox = (await getByTestId(view, 'customer:subscriptions:after')) as InternalSandbox;

      expect(customer).to.have.descendant(sandbox);
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });

    it('hides subscriptions if hiddencontrols includes "customer:subscriptions"', async () => {
      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view hiddencontrols="customer:subscriptions">
        </foxy-internal-customer-portal-logged-in-view>
      `);

      expect(await getByTestId(view, 'subscriptions')).to.not.exist;
    });

    describe('header', () => {
      it('renders custom customer:subscriptions:header:before template if present', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view
            .templates=${{ 'customer:subscriptions:header:before': () => html`Test` }}
          >
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const customer = (await getByTestId(view, 'customer')) as Customer;
        const sandbox = (await getByTestId(view, 'customer:subscriptions:header:before'))!;

        expect(customer).to.have.descendant(sandbox);
        expect(sandbox).to.be.instanceOf(InternalSandbox);
      });

      it('renders custom customer:subscriptions:header:after template if present', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view
            .templates=${{ 'customer:subscriptions:header:after': () => html`Test` }}
          >
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const customer = (await getByTestId(view, 'customer')) as Customer;
        const sandbox = (await getByTestId(view, 'customer:subscriptions:header:after'))!;

        expect(customer).to.have.descendant(sandbox);
        expect(sandbox).to.be.instanceOf(InternalSandbox);
      });

      it('renders custom foxy-i18n header with key "subscription_plural"', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view lang="es">
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const subscriptions = (await getByTestId(view, 'subscriptions')) as HTMLDivElement;
        const header = await getByKey(subscriptions, 'subscription_plural');

        expect(header).to.exist;
        expect(header).to.have.attribute('lang', 'es');
        expect(header).to.have.attribute('ns', 'customer-portal');
      });

      it('hides header if hiddencontrols matches "customer:subscriptions:header"', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view
            hiddencontrols="customer:subscriptions:header"
          >
          </foxy-internal-customer-portal-logged-in-view>
        `);

        expect(await getByKey(view, 'subscription_plural')).to.not.exist;
      });
    });

    describe('list', () => {
      it('renders custom customer:subscriptions:list:before template if present', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view
            .templates=${{ 'customer:subscriptions:list:before': () => html`Test` }}
          >
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const customer = (await getByTestId(view, 'customer')) as Customer;
        const sandbox = (await getByTestId(view, 'customer:subscriptions:list:before'))!;

        expect(customer).to.have.descendant(sandbox);
        expect(sandbox).to.be.instanceOf(InternalSandbox);
      });

      it('renders custom customer:subscriptions:list:after template if present', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view
            .templates=${{ 'customer:subscriptions:list:after': () => html`Test` }}
          >
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const customer = (await getByTestId(view, 'customer')) as Customer;
        const sandbox = (await getByTestId(view, 'customer:subscriptions:list:after'))!;

        expect(customer).to.have.descendant(sandbox);
        expect(sandbox).to.be.instanceOf(InternalSandbox);
      });

      it('renders foxy-collection-pages displaying customer subscriptions', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view
            customer="https://demo.foxycart.com/s/admin/customers/0/"
            group="foo"
            lang="es"
            href="https://demo.foxycart.com/s/admin/stores/0/customer_portal_settings"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const customer = (await getByTestId(view, 'customer')) as Customer;
        await waitUntil(() => customer.in({ idle: 'snapshot' }));
        const subscriptions = (await getByTestId(view, 'subscriptions'))!;
        const pages = (await getByTag(subscriptions, 'foxy-collection-pages'))!;

        expect(pages).to.have.attribute(
          'first',
          'https://demo.foxycart.com/s/admin/stores/0/subscriptions?customer_id=0&zoom=last_transaction%2Ctransaction_template%3Aitems&is_active=true'
        );

        await waitUntil(async () => (pages as CollectionPages<any>).in('idle'));
        await waitUntil(async () => {
          const pageNodes = await getByTag(pages, 'foxy-collection-page', true);
          return pageNodes.every(page => (page as CollectionPage<any>).in({ idle: 'snapshot' }));
        });

        const pageNodes = await getByTag<CollectionPage<any>>(pages, 'foxy-collection-page', true);
        const cards = await getByTag<SubscriptionCard>(pages, 'foxy-subscription-card', true);

        for (const page of pageNodes) {
          for (const card of cards) {
            const cardIndex = cards.indexOf(card);
            const subscription = page.data._embedded['fx:subscriptions'][cardIndex];

            expect(card).to.have.attribute('parent', page.href);
            expect(card).to.have.attribute('group', 'foo');
            expect(card).to.have.attribute('lang', 'es');
            expect(card).to.have.attribute('href', subscription._links.self.href);
          }
        }
      });

      it('hides list if hiddencontrols matches "customer:subscriptions:list"', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view
            hiddencontrols="customer:subscriptions:list"
          >
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const subscriptions = (await getByTestId(view, 'subscriptions'))!;
        expect(await getByTag(subscriptions, 'foxy-collection-pages')).to.not.exist;
      });

      describe('form', () => {
        it('renders configurable foxy-subscription-form in a foxy-form-dialog', async () => {
          const view = await fixture<InternalCustomerPortalLoggedInView>(html`
            <foxy-internal-customer-portal-logged-in-view
              disabledcontrols="customer:subscriptions:list:form:end-date"
              readonlycontrols="customer:subscriptions:list:form:frequency"
              hiddencontrols="customer:subscriptions:list:form:header"
              group="foo"
              lang="es"
              href="https://demo.foxycart.com/s/admin/stores/0/customer_portal_settings"
              .templates=${{ 'customer:subscriptions:list:form:frequency:after': () => html`Foo` }}
              @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
            >
            </foxy-internal-customer-portal-logged-in-view>
          `);

          const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
          const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

          dialog.parent = 'https://demo.foxycart.com/s/admin/subscriptions';
          dialog.open = true;
          dialog.href =
            'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';

          const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
          const alwaysHidden = 'end-date';

          expect(form).to.have.attribute('disabledcontrols', 'end-date:not=*');
          expect(form).to.have.attribute('readonlycontrols', 'frequency:not=*');
          expect(form).to.have.attribute('hiddencontrols', `header:not=* ${alwaysHidden}`);
          expect(form).to.have.attribute('parent', dialog.parent);
          expect(form).to.have.attribute('group', 'foo');
          expect(form).to.have.attribute('lang', 'es');
          expect(form).to.have.attribute('href', dialog.href);
          expect(form.templates).to.have.any.keys('frequency:after');
        });

        describe('header', () => {
          describe('actions', () => {
            it('renders header:actions:before template in the subscription form', async () => {
              const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                <foxy-internal-customer-portal-logged-in-view
                  .templates=${{
                    'customer:subscriptions:list:form:header:actions:before': () => html`Test`,
                  }}
                >
                </foxy-internal-customer-portal-logged-in-view>
              `);

              const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
              const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

              dialog.open = true;

              const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
              const builtInSandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;
              const customSandbox = await getByTestId(builtInSandbox, 'header:actions:before');

              expect((customSandbox as InternalSandbox).renderRoot).to.have.text('Test');
            });

            it('renders header:actions:after template in the subscription form', async () => {
              const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                <foxy-internal-customer-portal-logged-in-view
                  .templates=${{
                    'customer:subscriptions:list:form:header:actions:after': () => html`Test`,
                  }}
                >
                </foxy-internal-customer-portal-logged-in-view>
              `);

              const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
              const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

              dialog.open = true;

              const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
              const builtInSandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;
              const customSandbox = await getByTestId(builtInSandbox, 'header:actions:after');

              expect((customSandbox as InternalSandbox).renderRoot).to.have.text('Test');
            });

            it('hides header:actions if hiddencontrols matches "customer:subscriptions:list:form:header:actions"', async () => {
              const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                <foxy-internal-customer-portal-logged-in-view
                  hiddencontrols="customer:subscriptions:list:form:header:actions"
                >
                </foxy-internal-customer-portal-logged-in-view>
              `);

              const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
              const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

              dialog.open = true;

              const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
              const sandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;

              expect(await getByTestId(sandbox, 'header:actions')).to.not.exist;
            });

            describe('update', () => {
              it('renders header:actions:update:before template in the subscription form', async () => {
                const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                  <foxy-internal-customer-portal-logged-in-view
                    .templates=${{
                      'customer:subscriptions:list:form:header:actions:update:before': () =>
                        html`Test`,
                    }}
                  >
                  </foxy-internal-customer-portal-logged-in-view>
                `);

                const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
                const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

                dialog.open = true;

                const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
                const builtInSandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;
                const customSandbox = await getByTestId(
                  builtInSandbox,
                  'header:actions:update:before'
                );

                expect((customSandbox as InternalSandbox).renderRoot).to.have.text('Test');
              });

              it('renders header:actions:update:after template in the subscription form', async () => {
                const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                  <foxy-internal-customer-portal-logged-in-view
                    .templates=${{
                      'customer:subscriptions:list:form:header:actions:update:after': () =>
                        html`Test`,
                    }}
                  >
                  </foxy-internal-customer-portal-logged-in-view>
                `);

                const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
                const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

                dialog.open = true;

                const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
                const builtInSandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;
                const customSandbox = await getByTestId(
                  builtInSandbox,
                  'header:actions:update:after'
                );

                expect((customSandbox as InternalSandbox).renderRoot).to.have.text('Test');
              });

              it('renders fx:sub_token_url link with ?cart=checkout&sub_restart=auto', async () => {
                const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                  <foxy-internal-customer-portal-logged-in-view
                    customer="https://demo.foxycart.com/s/customer/"
                    href="https://demo.foxycart.com/s/customer/customer_portal_settings"
                    lang="es"
                    @fetch=${(evt: FetchEvent) => {
                      const token = `0-${Date.now() + Math.pow(10, 10)}`;
                      evt.request.headers.set('Authorization', `Bearer ${token}`);
                      router.handleEvent(evt);
                    }}
                  >
                  </foxy-internal-customer-portal-logged-in-view>
                `);

                const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
                const customer = (await getByTestId(view, 'customer')) as Customer;
                const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

                dialog.open = true;
                dialog.href =
                  'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';

                const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;

                await waitUntil(() => form.in({ idle: 'snapshot' }));
                await waitUntil(() => customer.in({ idle: 'snapshot' }));

                const sandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;
                const link = await getByTestId(sandbox, 'header:actions:update');
                const text = link!.querySelector('foxy-i18n[key="update_billing"]');
                const url = new URL(form.data!._links['fx:sub_token_url'].href);

                url.searchParams.set('cart', 'checkout');
                url.searchParams.set('sub_restart', 'auto');

                expect(link).to.be.instanceOf(InternalCustomerPortalLink);
                expect(link).to.have.attribute('href', url.toString());

                expect(text).to.have.attribute('lang', 'es');
                expect(text).to.have.attribute('ns', 'customer-portal');
              });

              it('hides header:actions:update if hiddencontrols matches "customer:subscriptions:list:form:header:actions:update"', async () => {
                const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                  <foxy-internal-customer-portal-logged-in-view
                    hiddencontrols="customer:subscriptions:list:form:header:actions:update"
                  >
                  </foxy-internal-customer-portal-logged-in-view>
                `);

                const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
                const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

                dialog.open = true;

                const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
                const sandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;

                expect(await getByTestId(sandbox, 'header:actions:update')).to.not.exist;
              });
            });

            describe('end', () => {
              it('renders header:actions:end:before template in the subscription form', async () => {
                const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                  <foxy-internal-customer-portal-logged-in-view
                    .templates=${{
                      'customer:subscriptions:list:form:header:actions:end:before': () =>
                        html`Test`,
                    }}
                  >
                  </foxy-internal-customer-portal-logged-in-view>
                `);

                const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
                const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

                dialog.open = true;

                const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
                const builtInSandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;
                const customSandbox = await getByTestId(
                  builtInSandbox,
                  'header:actions:end:before'
                );

                expect((customSandbox as InternalSandbox).renderRoot).to.have.text('Test');
              });

              it('renders header:actions:end:after template in the subscription form', async () => {
                const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                  <foxy-internal-customer-portal-logged-in-view
                    .templates=${{
                      'customer:subscriptions:list:form:header:actions:end:after': () => html`Test`,
                    }}
                  >
                  </foxy-internal-customer-portal-logged-in-view>
                `);

                const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
                const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

                dialog.open = true;

                const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
                const builtInSandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;
                const customSandbox = await getByTestId(builtInSandbox, 'header:actions:end:after');

                expect((customSandbox as InternalSandbox).renderRoot).to.have.text('Test');
              });

              it('renders fx:sub_token_url link with ?sub_cancel=true', async () => {
                const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                  <foxy-internal-customer-portal-logged-in-view
                    customer="https://demo.foxycart.com/s/customer/"
                    href="https://demo.foxycart.com/s/customer/customer_portal_settings"
                    lang="es"
                    @fetch=${(evt: FetchEvent) => {
                      const token = `0-${Date.now() + Math.pow(10, 10)}`;
                      evt.request.headers.set('Authorization', `Bearer ${token}`);
                      router.handleEvent(evt);
                    }}
                  >
                  </foxy-internal-customer-portal-logged-in-view>
                `);

                const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
                const customer = (await getByTestId(view, 'customer')) as Customer;
                const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

                dialog.open = true;
                dialog.href =
                  'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';

                const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;

                await waitUntil(() => form.in({ idle: 'snapshot' }));
                await waitUntil(() => customer.in({ idle: 'snapshot' }));

                const sandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;
                const link = await getByTestId(sandbox, 'header:actions:end');
                const text = link!.querySelector('foxy-i18n[key="end_subscription"]');
                const url = new URL(form.data!._links['fx:sub_token_url'].href);

                url.searchParams.set('sub_cancel', 'true');

                expect(link).to.be.instanceOf(InternalCustomerPortalLink);
                expect(link).to.have.attribute('href', url.toString());

                expect(text).to.have.attribute('lang', 'es');
                expect(text).to.have.attribute('ns', 'customer-portal');
              });

              it('hides header:actions:end if hiddencontrols matches "customer:subscriptions:list:form:header:actions:end"', async () => {
                const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                  <foxy-internal-customer-portal-logged-in-view
                    hiddencontrols="customer:subscriptions:list:form:header:actions:end"
                  >
                  </foxy-internal-customer-portal-logged-in-view>
                `);

                const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
                const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

                dialog.open = true;

                const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
                const sandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;

                expect(await getByTestId(sandbox, 'header:actions:end')).to.not.exist;
              });
            });
          });
        });

        describe('items', () => {
          describe('actions', () => {
            describe('update', () => {
              it('renders items:actions:update:before template in the subscription form', async () => {
                const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                  <foxy-internal-customer-portal-logged-in-view
                    customer="https://demo.foxycart.com/s/customer/"
                    href="https://demo.foxycart.com/s/customer/customer_portal_settings"
                    .templates=${{
                      'customer:subscriptions:list:form:items:actions:update:before': () =>
                        html`Test`,
                    }}
                    @fetch=${(evt: FetchEvent) => {
                      const token = `0-${Date.now() + Math.pow(10, 10)}`;
                      evt.request.headers.set('Authorization', `Bearer ${token}`);
                      router.handleEvent(evt);
                    }}
                  >
                  </foxy-internal-customer-portal-logged-in-view>
                `);

                const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
                const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

                dialog.open = true;
                dialog.href =
                  'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';

                const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;

                await waitUntil(() => form.in({ idle: 'snapshot' }));
                await waitUntil(() => view.in({ idle: 'snapshot' }));

                const sandbox1 = (await getByTestId(form, 'items:actions:after'))!;
                const sandbox2 = await getByTestId(sandbox1, 'items:actions:update:before');

                expect((sandbox2 as InternalSandbox).renderRoot).to.have.text('Test');
              });

              it('renders items:actions:update:after template in the subscription form', async () => {
                const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                  <foxy-internal-customer-portal-logged-in-view
                    customer="https://demo.foxycart.com/s/customer/"
                    href="https://demo.foxycart.com/s/customer/customer_portal_settings"
                    .templates=${{
                      'customer:subscriptions:list:form:items:actions:update:after': () =>
                        html`Test`,
                    }}
                    @fetch=${(evt: FetchEvent) => {
                      const token = `0-${Date.now() + Math.pow(10, 10)}`;
                      evt.request.headers.set('Authorization', `Bearer ${token}`);
                      router.handleEvent(evt);
                    }}
                  >
                  </foxy-internal-customer-portal-logged-in-view>
                `);

                const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
                const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

                dialog.open = true;
                dialog.href =
                  'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';

                const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;

                await waitUntil(() => form.in({ idle: 'snapshot' }));
                await waitUntil(() => view.in({ idle: 'snapshot' }));

                const sandbox1 = (await getByTestId(form, 'items:actions:after'))!;
                const sandbox2 = await getByTestId(sandbox1, 'items:actions:update:after');

                expect((sandbox2 as InternalSandbox).renderRoot).to.have.text('Test');
              });

              it('renders fx:sub_modification_url link', async () => {
                const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                  <foxy-internal-customer-portal-logged-in-view
                    customer="https://demo.foxycart.com/s/customer/"
                    href="https://demo.foxycart.com/s/customer/customer_portal_settings"
                    lang="es"
                    @fetch=${(evt: FetchEvent) => {
                      const token = `0-${Date.now() + Math.pow(10, 10)}`;
                      evt.request.headers.set('Authorization', `Bearer ${token}`);
                      router.handleEvent(evt);
                    }}
                  >
                  </foxy-internal-customer-portal-logged-in-view>
                `);

                const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
                const customer = (await getByTestId(view, 'customer')) as Customer;
                const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

                dialog.open = true;
                dialog.href =
                  'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';

                const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;

                await waitUntil(() => form.in({ idle: 'snapshot' }));
                await waitUntil(() => customer.in({ idle: 'snapshot' }));

                const sandbox = (await getByTestId(form, 'items:actions:after')) as InternalSandbox;
                const link = await getByTestId(sandbox, 'items:actions:update');
                const text = link!.querySelector('foxy-i18n[key="update_items"]');

                expect(link).to.be.instanceOf(InternalCustomerPortalLink);
                expect(link).to.have.attribute(
                  'href',
                  // @ts-expect-error SDK types are missing this link
                  form.data!._links['fx:sub_modification_url'].href
                );

                expect(text).to.have.attribute('lang', 'es');
                expect(text).to.have.attribute('ns', 'customer-portal');
              });

              it('hides items:actions:update if hiddencontrols matches "customer:subscriptions:list:form:items:actions:update"', async () => {
                const view = await fixture<InternalCustomerPortalLoggedInView>(html`
                  <foxy-internal-customer-portal-logged-in-view
                    hiddencontrols="customer:subscriptions:list:form:items:actions:update"
                  >
                  </foxy-internal-customer-portal-logged-in-view>
                `);

                const subscriptions = (await getByTestId(view, 'subscriptions')) as Element;
                const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

                dialog.open = true;

                const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
                const sandbox = (await getByTestId(form, 'items:actions:after')) as InternalSandbox;

                expect(await getByTestId(sandbox, 'items:actions:update')).to.not.exist;
              });
            });
          });
        });
      });
    });
  });

  describe('transactions', () => {
    it('renders custom customer:transactions:before template in default slot of foxy-customer if present', async () => {
      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          .templates=${{ 'customer:transactions:before': () => html`Test` }}
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(view, 'customer')) as Customer;
      const sandbox = (await getByTestId(view, 'customer:transactions:before')) as InternalSandbox;

      expect(customer).to.have.descendant(sandbox);
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });

    it('renders custom customer:transactions:after template in default slot of foxy-customer if present', async () => {
      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view
          .templates=${{ 'customer:transactions:after': () => html`Test` }}
        >
        </foxy-internal-customer-portal-logged-in-view>
      `);

      const customer = (await getByTestId(view, 'customer')) as Customer;
      const sandbox = (await getByTestId(view, 'customer:transactions:after')) as InternalSandbox;

      expect(customer).to.have.descendant(sandbox);
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });

    it('hides transactions if hiddencontrols includes "customer:transactions"', async () => {
      const view = await fixture<InternalCustomerPortalLoggedInView>(html`
        <foxy-internal-customer-portal-logged-in-view hiddencontrols="customer:transactions">
        </foxy-internal-customer-portal-logged-in-view>
      `);

      expect(await getByTestId(view, 'transactions')).to.not.exist;
    });

    describe('header', () => {
      it('renders custom customer:transactions:header:before template if present', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view
            .templates=${{ 'customer:transactions:header:before': () => html`Test` }}
          >
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const customer = (await getByTestId(view, 'customer')) as Customer;
        const sandbox = (await getByTestId(view, 'customer:transactions:header:before'))!;

        expect(customer).to.have.descendant(sandbox);
        expect(sandbox).to.be.instanceOf(InternalSandbox);
      });

      it('renders custom customer:transactions:header:after template if present', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view
            .templates=${{ 'customer:transactions:header:after': () => html`Test` }}
          >
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const customer = (await getByTestId(view, 'customer')) as Customer;
        const sandbox = (await getByTestId(view, 'customer:transactions:header:after'))!;

        expect(customer).to.have.descendant(sandbox);
        expect(sandbox).to.be.instanceOf(InternalSandbox);
      });

      it('renders custom foxy-i18n header with key "transaction_plural"', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view lang="es">
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const transactions = (await getByTestId(view, 'transactions')) as HTMLDivElement;
        const header = await getByKey(transactions, 'transaction_plural');

        expect(header).to.exist;
        expect(header).to.have.attribute('lang', 'es');
        expect(header).to.have.attribute('ns', 'customer-portal');
      });

      it('hides header if hiddencontrols matches "customer:transactions:header"', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view
            hiddencontrols="customer:transactions:header"
          >
          </foxy-internal-customer-portal-logged-in-view>
        `);

        expect(await getByKey(view, 'transaction_plural')).to.not.exist;
      });
    });

    describe('list', () => {
      it('renders custom customer:transactions:list:before template if present', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view
            .templates=${{ 'customer:transactions:list:before': () => html`Test` }}
          >
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const customer = (await getByTestId(view, 'customer')) as Customer;
        const sandbox = (await getByTestId(view, 'customer:transactions:list:before'))!;

        expect(customer).to.have.descendant(sandbox);
        expect(sandbox).to.be.instanceOf(InternalSandbox);
      });

      it('renders custom customer:transactions:list:after template if present', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view
            .templates=${{ 'customer:transactions:list:after': () => html`Test` }}
          >
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const customer = (await getByTestId(view, 'customer')) as Customer;
        const sandbox = (await getByTestId(view, 'customer:transactions:list:after'))!;

        expect(customer).to.have.descendant(sandbox);
        expect(sandbox).to.be.instanceOf(InternalSandbox);
      });

      it('renders custom foxy-collection-pages displaying transactions', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view group="test" lang="es">
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const customer = (await getByTestId(view, 'customer')) as Customer;
        customer.data = await getTestData('./s/admin/customers/0');

        const transactions = (await getByTestId(view, 'transactions')) as HTMLDivElement;
        const pages = (await getByTag(transactions, 'foxy-collection-pages'))!;

        expect(pages).to.have.attribute(
          'first',
          'https://demo.foxycart.com/s/admin/stores/0/transactions?customer_id=0&zoom=items'
        );

        expect(pages).to.have.attribute('group', 'test');
        expect(pages).to.have.attribute('lang', 'es');
        expect(pages).to.have.attribute('page', 'foxy-transactions-table');
      });

      it('hides list if hiddencontrols matches "customer:transactions:list"', async () => {
        const view = await fixture<InternalCustomerPortalLoggedInView>(html`
          <foxy-internal-customer-portal-logged-in-view hiddencontrols="customer:transactions:list">
          </foxy-internal-customer-portal-logged-in-view>
        `);

        const transactions = (await getByTestId(view, 'transactions'))!;
        expect(await getByTag(transactions, 'foxy-collection-pages')).to.not.exist;
      });
    });
  });
});
