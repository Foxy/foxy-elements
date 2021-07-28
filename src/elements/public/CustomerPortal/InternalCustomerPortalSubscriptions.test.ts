import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { CollectionPage } from '../CollectionPage';
import { CollectionPages } from '../CollectionPages';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormDialog } from '../FormDialog';
import { InternalCustomerPortalLink } from './InternalCustomerPortalLink';
import { InternalCustomerPortalSubscriptions } from './InternalCustomerPortalSubscriptions';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { LitElement } from 'lit-element';
import { SubscriptionCard } from '../SubscriptionCard';
import { SubscriptionForm } from '../SubscriptionForm';
import { getByKey } from '../../../testgen/getByKey';
import { getByTag } from '../../../testgen/getByTag';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { router } from '../../../server';

describe('InternalCustomerPortalSubscriptions', () => {
  it('extends LitElement', () => {
    expect(new InternalCustomerPortalSubscriptions()).to.be.instanceOf(LitElement);
  });

  it('registers as foxy-internal-customer-portal-subscriptions', () => {
    expect(customElements.get('foxy-internal-customer-portal-subscriptions')).to.equal(
      InternalCustomerPortalSubscriptions
    );
  });

  describe('header', () => {
    it('renders custom header:before template if present', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const settings = await getTestData('./s/customer/customer_portal_settings');
      const element = await fixture<InternalCustomerPortalSubscriptions>(html`
        <foxy-internal-customer-portal-subscriptions
          .templates=${{ 'header:before': () => html`Test` }}
          .customer=${customer}
          .settings=${settings}
        >
        </foxy-internal-customer-portal-subscriptions>
      `);

      const sandbox = (await getByTestId(element, 'header:before'))!;
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });

    it('renders custom header:after template if present', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const settings = await getTestData('./s/customer/customer_portal_settings');
      const element = await fixture<InternalCustomerPortalSubscriptions>(html`
        <foxy-internal-customer-portal-subscriptions
          .templates=${{ 'header:after': () => html`Test` }}
          .customer=${customer}
          .settings=${settings}
        >
        </foxy-internal-customer-portal-subscriptions>
      `);

      const sandbox = (await getByTestId(element, 'header:after'))!;
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });

    it('renders custom foxy-i18n header with key "subscription_plural"', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const settings = await getTestData('./s/customer/customer_portal_settings');
      const element = await fixture<InternalCustomerPortalSubscriptions>(html`
        <foxy-internal-customer-portal-subscriptions
          lang="es"
          ns="customer-portal"
          .customer=${customer}
          .settings=${settings}
        >
        </foxy-internal-customer-portal-subscriptions>
      `);

      const subscriptions = (await getByTestId(element, 'subscriptions')) as HTMLDivElement;
      const header = await getByKey(subscriptions, 'subscription_plural');

      expect(header).to.exist;
      expect(header).to.have.attribute('lang', 'es');
      expect(header).to.have.attribute('ns', 'customer-portal');
    });

    it('hides header if hiddencontrols matches "header"', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const settings = await getTestData('./s/customer/customer_portal_settings');
      const element = await fixture<InternalCustomerPortalSubscriptions>(html`
        <foxy-internal-customer-portal-subscriptions
          hiddencontrols="header"
          .customer=${customer}
          .settings=${settings}
        >
        </foxy-internal-customer-portal-subscriptions>
      `);

      expect(await getByKey(element, 'subscription_plural')).to.not.exist;
    });
  });

  describe('list', () => {
    it('renders custom list:before template if present', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const settings = await getTestData('./s/customer/customer_portal_settings');
      const element = await fixture<InternalCustomerPortalSubscriptions>(html`
        <foxy-internal-customer-portal-subscriptions
          .templates=${{ 'list:before': () => html`Test` }}
          .customer=${customer}
          .settings=${settings}
        >
        </foxy-internal-customer-portal-subscriptions>
      `);

      const sandbox = (await getByTestId(element, 'list:before'))!;
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });

    it('renders custom list:after template if present', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const settings = await getTestData('./s/customer/customer_portal_settings');
      const element = await fixture<InternalCustomerPortalSubscriptions>(html`
        <foxy-internal-customer-portal-subscriptions
          .templates=${{ 'list:after': () => html`Test` }}
          .customer=${customer}
          .settings=${settings}
        >
        </foxy-internal-customer-portal-subscriptions>
      `);

      const sandbox = (await getByTestId(element, 'list:after'))!;
      expect(sandbox).to.be.instanceOf(InternalSandbox);
    });

    it('renders foxy-collection-pages displaying customer subscriptions', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const settings = await getTestData('./s/customer/customer_portal_settings');
      const element = await fixture<InternalCustomerPortalSubscriptions>(html`
        <foxy-internal-customer-portal-subscriptions
          group="foo"
          lang="es"
          .customer=${customer}
          .settings=${settings}
          .templates=${{ 'list:card:default': () => '' }}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-customer-portal-subscriptions>
      `);

      const subscriptions = (await getByTestId(element, 'subscriptions'))!;
      const pages = (await getByTag(subscriptions, 'foxy-collection-pages'))!;

      expect(pages).to.have.attribute(
        'first',
        'https://demo.foxycart.com/s/admin/stores/0/subscriptions?customer_id=0&zoom=last_transaction%2Ctransaction_template%3Aitems'
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

          expect(card).to.have.property('templates');
          expect(card.templates).to.have.key('default');
        }
      }
    });

    it('hides list if hiddencontrols matches "list"', async () => {
      const customer = await getTestData('./s/admin/customers/0');
      const settings = await getTestData('./s/customer/customer_portal_settings');
      const element = await fixture<InternalCustomerPortalSubscriptions>(html`
        <foxy-internal-customer-portal-subscriptions
          hiddencontrols="list"
          .customer=${customer}
          .settings=${settings}
        >
        </foxy-internal-customer-portal-subscriptions>
      `);

      const subscriptions = (await getByTestId(element, 'subscriptions'))!;
      expect(await getByTag(subscriptions, 'foxy-collection-pages')).to.not.exist;
    });

    describe('form', () => {
      it('renders configurable foxy-subscription-form in a foxy-form-dialog', async () => {
        const customer = await getTestData('./s/admin/customers/0');
        const settings = await getTestData('./s/customer/customer_portal_settings');
        const element = await fixture<InternalCustomerPortalSubscriptions>(html`
          <foxy-internal-customer-portal-subscriptions
            disabledcontrols="list:form:end-date"
            readonlycontrols="list:form:frequency"
            hiddencontrols="list:form:header"
            group="foo"
            lang="es"
            .customer=${customer}
            .settings=${settings}
            .templates=${{ 'list:form:frequency:after': () => html`Foo` }}
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </foxy-internal-customer-portal-subscriptions>
        `);

        const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
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
            const customer = await getTestData('./s/admin/customers/0');
            const settings = await getTestData('./s/customer/customer_portal_settings');
            const element = await fixture<InternalCustomerPortalSubscriptions>(html`
              <foxy-internal-customer-portal-subscriptions
                .templates=${{ 'list:form:header:actions:before': () => html`Test` }}
                .customer=${customer}
                .settings=${settings}
              >
              </foxy-internal-customer-portal-subscriptions>
            `);

            const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
            const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

            dialog.open = true;

            const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
            const builtInSandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;
            const customSandbox = await getByTestId(builtInSandbox, 'header:actions:before');

            expect((customSandbox as InternalSandbox).renderRoot).to.have.text('Test');
          });

          it('renders header:actions:after template in the subscription form', async () => {
            const customer = await getTestData('./s/admin/customers/0');
            const settings = await getTestData('./s/customer/customer_portal_settings');
            const element = await fixture<InternalCustomerPortalSubscriptions>(html`
              <foxy-internal-customer-portal-subscriptions
                .templates=${{ 'list:form:header:actions:after': () => html`Test` }}
                .customer=${customer}
                .settings=${settings}
              >
              </foxy-internal-customer-portal-subscriptions>
            `);

            const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
            const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

            dialog.open = true;

            const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
            const builtInSandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;
            const customSandbox = await getByTestId(builtInSandbox, 'header:actions:after');

            expect((customSandbox as InternalSandbox).renderRoot).to.have.text('Test');
          });

          it('hides header:actions if hiddencontrols matches "list:form:header:actions"', async () => {
            const customer = await getTestData('./s/admin/customers/0');
            const settings = await getTestData('./s/customer/customer_portal_settings');
            const element = await fixture<InternalCustomerPortalSubscriptions>(html`
              <foxy-internal-customer-portal-subscriptions
                hiddencontrols="list:form:header:actions"
                .customer=${customer}
                .settings=${settings}
              >
              </foxy-internal-customer-portal-subscriptions>
            `);

            const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
            const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

            dialog.open = true;

            const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
            const sandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;

            expect(await getByTestId(sandbox, 'header:actions')).to.not.exist;
          });

          describe('update', () => {
            it('renders header:actions:update:before template in the subscription form', async () => {
              const customer = await getTestData('./s/admin/customers/0');
              const settings = await getTestData('./s/customer/customer_portal_settings');
              const element = await fixture<InternalCustomerPortalSubscriptions>(html`
                <foxy-internal-customer-portal-subscriptions
                  .templates=${{ 'list:form:header:actions:update:before': () => html`Test` }}
                  .customer=${customer}
                  .settings=${settings}
                >
                </foxy-internal-customer-portal-subscriptions>
              `);

              const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
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
              const customer = await getTestData('./s/admin/customers/0');
              const settings = await getTestData('./s/customer/customer_portal_settings');
              const element = await fixture<InternalCustomerPortalSubscriptions>(html`
                <foxy-internal-customer-portal-subscriptions
                  .templates=${{ 'list:form:header:actions:update:after': () => html`Test` }}
                  .customer=${customer}
                  .settings=${settings}
                >
                </foxy-internal-customer-portal-subscriptions>
              `);

              const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
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
              const customer = await getTestData('./s/admin/customers/0');
              const settings = await getTestData('./s/customer/customer_portal_settings');
              const element = await fixture<InternalCustomerPortalSubscriptions>(html`
                <foxy-internal-customer-portal-subscriptions
                  lang="es"
                  ns="customer-portal"
                  .customer=${customer}
                  .settings=${settings}
                  @fetch=${(evt: FetchEvent) => {
                    const token = `0-${Date.now() + Math.pow(10, 10)}`;
                    evt.request.headers.set('Authorization', `Bearer ${token}`);
                    router.handleEvent(evt);
                  }}
                >
                </foxy-internal-customer-portal-subscriptions>
              `);

              const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
              const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

              dialog.open = true;
              dialog.href =
                'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';

              const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
              await waitUntil(() => form.in({ idle: 'snapshot' }));

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

            it('hides header:actions:update if hiddencontrols matches "list:form:header:actions:update"', async () => {
              const customer = await getTestData('./s/admin/customers/0');
              const settings = await getTestData('./s/customer/customer_portal_settings');
              const element = await fixture<InternalCustomerPortalSubscriptions>(html`
                <foxy-internal-customer-portal-subscriptions
                  hiddencontrols="list:form:header:actions:update"
                  .customer=${customer}
                  .settings=${settings}
                >
                </foxy-internal-customer-portal-subscriptions>
              `);

              const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
              const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

              dialog.open = true;

              const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
              const sandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;

              expect(await getByTestId(sandbox, 'header:actions:update')).to.not.exist;
            });
          });

          describe('end', () => {
            it('renders header:actions:end:before template in the subscription form', async () => {
              const customer = await getTestData('./s/admin/customers/0');
              const settings = await getTestData('./s/customer/customer_portal_settings');
              const element = await fixture<InternalCustomerPortalSubscriptions>(html`
                <foxy-internal-customer-portal-subscriptions
                  .templates=${{ 'list:form:header:actions:end:before': () => html`Test` }}
                  .customer=${customer}
                  .settings=${settings}
                >
                </foxy-internal-customer-portal-subscriptions>
              `);

              const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
              const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

              dialog.open = true;

              const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
              const builtInSandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;
              const customSandbox = await getByTestId(builtInSandbox, 'header:actions:end:before');

              expect((customSandbox as InternalSandbox).renderRoot).to.have.text('Test');
            });

            it('renders header:actions:end:after template in the subscription form', async () => {
              const customer = await getTestData('./s/admin/customers/0');
              const settings = await getTestData('./s/customer/customer_portal_settings');
              const element = await fixture<InternalCustomerPortalSubscriptions>(html`
                <foxy-internal-customer-portal-subscriptions
                  .templates=${{ 'list:form:header:actions:end:after': () => html`Test` }}
                  .customer=${customer}
                  .settings=${settings}
                >
                </foxy-internal-customer-portal-subscriptions>
              `);

              const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
              const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

              dialog.open = true;

              const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
              const builtInSandbox = (await getByTestId(form, 'header:after')) as InternalSandbox;
              const customSandbox = await getByTestId(builtInSandbox, 'header:actions:end:after');

              expect((customSandbox as InternalSandbox).renderRoot).to.have.text('Test');
            });

            it('renders fx:sub_token_url link with ?sub_cancel=true', async () => {
              const customer = await getTestData('./s/admin/customers/0');
              const settings = await getTestData('./s/customer/customer_portal_settings');
              const element = await fixture<InternalCustomerPortalSubscriptions>(html`
                <foxy-internal-customer-portal-subscriptions
                  lang="es"
                  ns="customer-portal"
                  .customer=${customer}
                  .settings=${settings}
                  @fetch=${(evt: FetchEvent) => {
                    const token = `0-${Date.now() + Math.pow(10, 10)}`;
                    evt.request.headers.set('Authorization', `Bearer ${token}`);
                    router.handleEvent(evt);
                  }}
                >
                </foxy-internal-customer-portal-subscriptions>
              `);

              const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
              const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

              dialog.open = true;
              dialog.href =
                'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';

              const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
              await waitUntil(() => form.in({ idle: 'snapshot' }));

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

            it('hides header:actions:end if hiddencontrols matches "list:form:header:actions:end"', async () => {
              const customer = await getTestData('./s/admin/customers/0');
              const settings = await getTestData('./s/customer/customer_portal_settings');
              const element = await fixture<InternalCustomerPortalSubscriptions>(html`
                <foxy-internal-customer-portal-subscriptions
                  hiddencontrols="list:form:header:actions:end"
                  .customer=${customer}
                  .settings=${settings}
                >
                </foxy-internal-customer-portal-subscriptions>
              `);

              const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
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
              const customer = await getTestData('./s/admin/customers/0');
              const settings = await getTestData('./s/customer/customer_portal_settings');
              const element = await fixture<InternalCustomerPortalSubscriptions>(html`
                <foxy-internal-customer-portal-subscriptions
                  .templates=${{ 'list:form:items:actions:update:before': () => html`Test` }}
                  .customer=${customer}
                  .settings=${settings}
                  @fetch=${(evt: FetchEvent) => {
                    const token = `0-${Date.now() + Math.pow(10, 10)}`;
                    evt.request.headers.set('Authorization', `Bearer ${token}`);
                    router.handleEvent(evt);
                  }}
                >
                </foxy-internal-customer-portal-subscriptions>
              `);

              const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
              const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

              dialog.open = true;
              dialog.href =
                'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';

              const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
              await waitUntil(() => form.in({ idle: 'snapshot' }));

              const sandbox1 = (await getByTestId(form, 'items:actions:after'))!;
              const sandbox2 = await getByTestId(sandbox1, 'items:actions:update:before');

              expect((sandbox2 as InternalSandbox).renderRoot).to.have.text('Test');
            });

            it('renders items:actions:update:after template in the subscription form', async () => {
              const customer = await getTestData('./s/admin/customers/0');
              const settings = await getTestData('./s/customer/customer_portal_settings');
              const element = await fixture<InternalCustomerPortalSubscriptions>(html`
                <foxy-internal-customer-portal-subscriptions
                  .templates=${{ 'list:form:items:actions:update:after': () => html`Test` }}
                  .customer=${customer}
                  .settings=${settings}
                  @fetch=${(evt: FetchEvent) => {
                    const token = `0-${Date.now() + Math.pow(10, 10)}`;
                    evt.request.headers.set('Authorization', `Bearer ${token}`);
                    router.handleEvent(evt);
                  }}
                >
                </foxy-internal-customer-portal-subscriptions>
              `);

              const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
              const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

              dialog.open = true;
              dialog.href =
                'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';

              const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
              await waitUntil(() => form.in({ idle: 'snapshot' }));

              const sandbox1 = (await getByTestId(form, 'items:actions:after'))!;
              const sandbox2 = await getByTestId(sandbox1, 'items:actions:update:after');

              expect((sandbox2 as InternalSandbox).renderRoot).to.have.text('Test');
            });

            it('renders fx:sub_modification_url link', async () => {
              const customer = await getTestData('./s/admin/customers/0');
              const settings = await getTestData('./s/customer/customer_portal_settings');
              const element = await fixture<InternalCustomerPortalSubscriptions>(html`
                <foxy-internal-customer-portal-subscriptions
                  lang="es"
                  ns="customer-portal"
                  .customer=${customer}
                  .settings=${settings}
                  @fetch=${(evt: FetchEvent) => {
                    const token = `0-${Date.now() + Math.pow(10, 10)}`;
                    evt.request.headers.set('Authorization', `Bearer ${token}`);
                    router.handleEvent(evt);
                  }}
                >
                </foxy-internal-customer-portal-subscriptions>
              `);

              const subscriptions = (await getByTestId(element, 'subscriptions')) as Element;
              const dialog = (await getByTag(subscriptions, 'foxy-form-dialog')) as FormDialog;

              dialog.open = true;
              dialog.href =
                'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';

              const form = (await getByTag(dialog, 'foxy-subscription-form')) as SubscriptionForm;
              await waitUntil(() => form.in({ idle: 'snapshot' }));

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

            it('hides items:actions:update if hiddencontrols matches "list:form:items:actions:update"', async () => {
              const customer = await getTestData('./s/admin/customers/0');
              const settings = await getTestData('./s/customer/customer_portal_settings');
              const view = await fixture<InternalCustomerPortalSubscriptions>(html`
                <foxy-internal-customer-portal-subscriptions
                  hiddencontrols="list:form:items:actions:update"
                  .customer=${customer}
                  .settings=${settings}
                >
                </foxy-internal-customer-portal-subscriptions>
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
