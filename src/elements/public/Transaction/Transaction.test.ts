import type { InternalAsyncListControl } from '../../internal/InternalAsyncListControl/InternalAsyncListControl';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Resource } from '@foxy.io/sdk/core';
import type { InternalControl } from '../../internal/InternalControl/InternalControl';
import type { Rels } from '@foxy.io/sdk/dist/types/backend';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createAccessDeniedResponse } from '../../../utils/test-utils';
import { createRouter } from '../../../server/index';
import { Transaction } from './index';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-html';
import { stub } from 'sinon';

import uainfer from 'uainfer/src/uainfer.js';

describe('Transaction', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-billing-address-card', () => {
    expect(customElements.get('foxy-billing-address-card')).to.exist;
  });

  it('imports and defines foxy-attribute-card', () => {
    expect(customElements.get('foxy-attribute-card')).to.exist;
  });

  it('imports and defines foxy-attribute-form', () => {
    expect(customElements.get('foxy-attribute-form')).to.exist;
  });

  it('imports and defines foxy-custom-field-form', () => {
    expect(customElements.get('foxy-custom-field-form')).to.exist;
  });

  it('imports and defines foxy-custom-field-card', () => {
    expect(customElements.get('foxy-custom-field-card')).to.exist;
  });

  it('imports and defines foxy-copy-to-clipboard', () => {
    expect(customElements.get('foxy-copy-to-clipboard')).to.exist;
  });

  it('imports and defines foxy-shipment-card', () => {
    expect(customElements.get('foxy-shipment-card')).to.exist;
  });

  it('imports and defines foxy-payment-card', () => {
    expect(customElements.get('foxy-payment-card')).to.exist;
  });

  it('imports and defines foxy-address-form', () => {
    expect(customElements.get('foxy-address-form')).to.exist;
  });

  it('imports and defines foxy-item-form', () => {
    expect(customElements.get('foxy-item-form')).to.exist;
  });

  it('imports and defines foxy-item-card', () => {
    expect(customElements.get('foxy-item-card')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines foxy-internal-async-list-control', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-switch-control', () => {
    expect(customElements.get('foxy-internal-switch-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-internal-post-action-control', () => {
    expect(customElements.get('foxy-internal-post-action-control')).to.exist;
  });

  it('imports and defines foxy-internal-transaction-customer-control', () => {
    expect(customElements.get('foxy-internal-transaction-customer-control')).to.exist;
  });

  it('imports and defines foxy-internal-transaction-actions-control', () => {
    expect(customElements.get('foxy-internal-transaction-actions-control')).to.exist;
  });

  it('imports and defines foxy-internal-transaction-summary-control', () => {
    expect(customElements.get('foxy-internal-transaction-summary-control')).to.exist;
  });

  it('imports and defines itself as foxy-transaction', () => {
    expect(customElements.get('foxy-transaction')).to.equal(Transaction);
  });

  it('has a default i18n namespace "transaction"', () => {
    expect(Transaction).to.have.property('defaultNS', 'transaction');
    expect(new Transaction()).to.have.property('ns', 'transaction');
  });

  it('has a reactive property hostedPaymentGatewaysHelper', () => {
    expect(new Transaction()).to.have.property('hostedPaymentGatewaysHelper', null);
    expect(Transaction).to.have.deep.nested.property('properties.hostedPaymentGatewaysHelper', {
      attribute: 'hosted-payment-gateways-helper',
    });
  });

  it('has a reactive property paymentGatewaysHelper', () => {
    expect(new Transaction()).to.have.property('paymentGatewaysHelper', null);
    expect(Transaction).to.have.deep.nested.property('properties.paymentGatewaysHelper', {
      attribute: 'payment-gateways-helper',
    });
  });

  it('has a reactive property getSubscriptionPageHref', () => {
    expect(new Transaction()).to.have.property('getSubscriptionPageHref', null);
    expect(Transaction).to.have.deep.nested.property('properties.getSubscriptionPageHref', {
      attribute: false,
    });
  });

  it('has a reactive property getCustomerPageHref', () => {
    expect(new Transaction()).to.have.property('getCustomerPageHref', null);
    expect(Transaction).to.have.deep.nested.property('properties.getCustomerPageHref', {
      attribute: false,
    });
  });

  it('has a reactive property localeCodes', () => {
    expect(new Transaction()).to.have.property('localeCodes', null);
    expect(Transaction).to.have.deep.nested.property('properties.localeCodes', {
      attribute: 'locale-codes',
    });
  });

  it('extends InternalForm', () => {
    expect(new Transaction()).to.be.instanceOf(InternalForm);
  });

  [
    'webhooks:dialog:header:copy-json',
    'webhooks:dialog:header:copy-id',
    'webhooks:dialog:timestamps',
    'webhooks:dialog:name',
    'webhooks:dialog:query',
    'webhooks:dialog:encryption-key',
    'webhooks:dialog:delete',
  ].forEach(key => {
    it(`always hides ${key}`, () => {
      const element = new Transaction();
      expect(element.hiddenSelector.matches(key, true)).to.be.true;
    });
  });

  it('always keeps data-is-fed control readonly', () => {
    const element = new Transaction();
    expect(element.readonlySelector.matches('datafeed:data-is-fed', true)).to.be.true;
  });

  it("hides XML datafeed controls when store doesn't have XML datafeed enabled", async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0"
        @fetch=${(evt: FetchEvent) => !evt.defaultPrevented && router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(
      () => {
        if (!element.in({ idle: 'snapshot' })) return false;
        const nucleons = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
        return [...nucleons].every(nucleon => nucleon.in({ idle: 'snapshot' }));
      },
      '',
      { timeout: 5000 }
    );

    expect(element.hiddenSelector.matches('datafeed', true)).to.be.true;

    const store = await getTestData<Resource<Rels.Store>>('https://demo.api/hapi/stores/0');
    store.use_webhook = true;
    Transaction.Rumour('').share({
      source: 'https://demo.api/hapi/stores/0',
      data: store,
    });

    await element.requestUpdate();
    expect(element.hiddenSelector.matches('datafeed', true)).to.be.false;
  });

  describe('send-emails action', () => {
    const whenAllLoaded = (element: Transaction) =>
      waitUntil(
        () => {
          if (!element.in({ idle: 'snapshot' })) return false;
          const nucleons = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
          return [...nucleons].every(nucleon => nucleon.in({ idle: 'snapshot' }));
        },
        '',
        { timeout: 5000 }
      );

    const createElement = (edit: (url: URL, json: any) => void = () => void 0) => {
      const router = createRouter();

      return fixture<Transaction>(html`
        <foxy-transaction
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => {
            if (evt.defaultPrevented) return;
            const url = new URL(evt.request.url);
            const result = router.handleRequest(evt.request);
            evt.respondWith(
              result!.handlerPromise.then(async response => {
                const json = await response.json();
                edit(url, json);
                return new Response(JSON.stringify(json));
              })
            );
          }}
        >
        </foxy-transaction>
      `);
    };

    it('hides send-emails action until email template is loaded', () => {
      const element = new Transaction();
      expect(element.hiddenSelector.matches('actions:send-emails', true)).to.be.true;
    });

    it("shows send-emails action when store's DEFAULT template set has email subject", async () => {
      const urls: string[] = [];
      const element = await createElement(url => urls.push(url.toString()));
      await whenAllLoaded(element);

      const templateSetUrl = urls.find(url => url.includes('/template_sets'));
      expect(templateSetUrl).to.include('store_id=0');
      expect(templateSetUrl).to.include('code=DEFAULT');
      expect(templateSetUrl).to.include('zoom=email_template');
      expect(element.hiddenSelector.matches('actions:send-emails', true)).to.be.false;
    });

    it("shows send-emails action when transaction's own template set has email subject", async () => {
      const urls: string[] = [];
      const element = await createElement((url, json) => {
        urls.push(url.toString());
        if (url.pathname === '/hapi/transactions/0') {
          json._links['fx:template_sets'] = { href: 'https://demo.api/hapi/template_sets/1' };
        }
      });

      await whenAllLoaded(element);

      expect(urls).to.include('https://demo.api/hapi/template_sets/1?zoom=email_template');
      expect(element.hiddenSelector.matches('actions:send-emails', true)).to.be.false;
    });

    it("hides send-emails action when transaction's own template set has no email subject", async () => {
      const element = await createElement((url, json) => {
        if (url.pathname === '/hapi/transactions/0') {
          json._links['fx:template_sets'] = { href: 'https://demo.api/hapi/template_sets/1' };
        } else if (url.pathname === '/hapi/template_sets/1') {
          json._embedded['fx:email_template'].subject = '';
        }
      });

      await whenAllLoaded(element);
      expect(element.hiddenSelector.matches('actions:send-emails', true)).to.be.true;
    });

    it("hides send-emails action when store's DEFAULT template set has no email subject", async () => {
      const element = await createElement((url, json) => {
        if (url.pathname === '/hapi/template_sets') {
          json._embedded['fx:template_sets'][0]._embedded['fx:email_template'].subject = '';
        }
      });

      await whenAllLoaded(element);
      expect(element.hiddenSelector.matches('actions:send-emails', true)).to.be.true;
    });
  });

  it('renders a form header', () => {
    const form = new Transaction();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders a special subtitle for payment method changes initiated by customer', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = { ...element.data!, type: 'updateinfo', source: 'cit_ecommerce' };
    await element.requestUpdate();

    expect(element.headerSubtitleOptions).to.have.property(
      'context',
      'customer_changed_payment_method'
    );

    element.data = { ...element.data!, source: 'mit_api' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.not.have.property(
      'context',
      'customer_changed_payment_method'
    );
  });

  it('renders a special subtitle for payment method changes made with UOE password', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = { ...element.data!, type: 'updateinfo', source: 'mit_uoe' };
    await element.requestUpdate();

    expect(element.headerSubtitleOptions).to.have.property(
      'context',
      'admin_changed_payment_method_with_uoe'
    );

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.not.have.property(
      'context',
      'admin_changed_payment_method_with_uoe'
    );
  });

  it('renders a special subtitle for payment method changes initiated by integration', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = { ...element.data!, type: 'updateinfo', source: 'mit_api' };
    await element.requestUpdate();

    expect(element.headerSubtitleOptions).to.have.property(
      'context',
      'integration_changed_payment_method'
    );

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.not.have.property(
      'context',
      'integration_changed_payment_method'
    );
  });

  it('renders a special subtitle for subscription changes initiated by customer', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = { ...element.data!, type: 'subscription_modification', source: 'cit_ecommerce' };
    await element.requestUpdate();

    expect(element.headerSubtitleOptions).to.have.property(
      'context',
      'customer_changed_subscription'
    );

    element.data = { ...element.data!, source: 'mit_api' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.not.have.property(
      'context',
      'customer_changed_subscription'
    );
  });

  it('renders a special subtitle for subscription changes made with UOE password', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = { ...element.data!, type: 'subscription_modification', source: 'mit_uoe' };
    await element.requestUpdate();

    expect(element.headerSubtitleOptions).to.have.property(
      'context',
      'admin_changed_subscription_with_uoe'
    );

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.not.have.property(
      'context',
      'admin_changed_subscription_with_uoe'
    );
  });

  it('renders a special subtitle for subscription changes initiated by integration', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = { ...element.data!, type: 'subscription_modification', source: 'mit_api' };
    await element.requestUpdate();

    expect(element.headerSubtitleOptions).to.have.property(
      'context',
      'integration_changed_subscription'
    );

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.not.have.property(
      'context',
      'integration_changed_subscription'
    );
  });

  it('renders a special subtitle for subscription renewal attempts', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = { ...element.data!, type: 'subscription_renewal', source: 'mit_recurring' };
    await element.requestUpdate();

    expect(element.headerSubtitleOptions).to.have.property(
      'context',
      'subscription_renewal_attempt'
    );

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.not.have.property(
      'context',
      'subscription_renewal_attempt'
    );
  });

  it('renders a special subtitle for automated subscription renewal reattempts', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = {
      ...element.data!,
      type: 'subscription_renewal',
      source: 'mit_recurring_reattempt_automated',
    };
    await element.requestUpdate();

    expect(element.headerSubtitleOptions).to.have.property(
      'context',
      'subscription_renewal_automated_reattempt'
    );

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.not.have.property(
      'context',
      'subscription_renewal_automated_reattempt'
    );
  });

  it('renders a special subtitle for manual subscription renewal reattempts', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = {
      ...element.data!,
      type: 'subscription_renewal',
      source: 'mit_recurring_reattempt_manual',
    };
    await element.requestUpdate();

    expect(element.headerSubtitleOptions).to.have.property(
      'context',
      'subscription_renewal_manual_reattempt'
    );

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.not.have.property(
      'context',
      'subscription_renewal_manual_reattempt'
    );
  });

  it('renders a special subtitle for subscription cancellations initiated by customer', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = {
      ...element.data!,
      type: 'subscription_cancellation',
      source: 'cit_recurring_cancellation',
    };
    await element.requestUpdate();

    expect(element.headerSubtitleOptions).to.have.property(
      'context',
      'customer_canceled_subscription'
    );

    element.data = { ...element.data!, source: 'mit_recurring_cancellation' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.not.have.property(
      'context',
      'customer_canceled_subscription'
    );
  });

  it('renders a special subtitle for subscription cancellations initiated by merchant', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = {
      ...element.data!,
      type: 'subscription_cancellation',
      source: 'mit_recurring_cancellation',
    };
    await element.requestUpdate();

    expect(element.headerSubtitleOptions).to.have.property(
      'context',
      'admin_canceled_subscription'
    );

    element.data = { ...element.data!, source: 'cit_recurring_cancellation' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.not.have.property(
      'context',
      'admin_canceled_subscription'
    );
  });

  it('renders a special subtitle for new subscriptions', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });

    element.data = {
      ...element.data!,
      _links: {
        ...element.data!._links,
        'fx:subscription': { href: 'https://demo.api/hapi/subscriptions/0' },
      },
      source: 'cit_ecommerce',
      type: '',
    };

    await element.requestUpdate();

    expect(element.headerSubtitleOptions).to.have.property('context', 'customer_subscribed');

    element.data = { ...element.data!, source: 'mit_uoe' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.have.property('context', 'admin_subscribed_with_uoe');

    element.data = { ...element.data!, source: 'mit_api' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.have.property('context', 'integration_subscribed');
  });

  it('renders a special subtitle for new orders', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });

    const newData = { ...element.data!, source: 'cit_ecommerce', type: '' } as const;
    // @ts-expect-error SDK doesn't support optional links
    delete newData._links['fx:subscription'];
    element.data = newData;

    await element.requestUpdate();

    expect(element.headerSubtitleOptions).to.have.property('context', 'customer_placed_order');

    element.data = { ...element.data!, source: 'mit_uoe' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.have.property(
      'context',
      'admin_placed_order_with_uoe'
    );

    element.data = { ...element.data!, source: 'mit_api' };
    await element.requestUpdate();
    expect(element.headerSubtitleOptions).to.have.property('context', 'integration_placed_order');
  });

  it('renders "test" badge in subtitle if transaction is a test transaction', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = { ...element.data!, is_test: true };
    expect(element.headerSubtitleBadges).to.deep.include({ key: 'test' });

    element.data = { ...element.data!, is_test: false };
    expect(element.headerSubtitleBadges).to.not.deep.include({ key: 'test' });
  });

  it('renders "archived" badge in subtitle if transaction is archived', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = { ...element.data!, hide_transaction: true };
    expect(element.headerSubtitleBadges).to.deep.include({ key: 'archived' });

    element.data = { ...element.data!, hide_transaction: false };
    expect(element.headerSubtitleBadges).to.not.deep.include({ key: 'archived' });
  });

  it('renders folder badge in subtitle if assigned', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0?zoom=folder,applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    expect(element.headerSubtitleBadges[0]).to.have.property('text', 'Pending');
  });

  it('uses display_id as ID copied by Copy ID button', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    element.data = { ...element.data!, display_id: '123' };

    expect(element.headerCopyIdValue).to.equal('123');
  });

  it('renders transaction actions as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="actions"]');

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-transaction-actions-control');

    // Currency display comes from the store, which loads after the transaction.
    await waitUntil(
      () => (control as unknown as { currencyDisplay: string }).currencyDisplay === 'code',
      '',
      { timeout: 5000 }
    );

    expect(control).to.have.property('currencyDisplay', 'code');
  });

  it('renders a post action control for refeeding XML datafeed', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1"
        @fetch=${(evt: FetchEvent) => !evt.defaultPrevented && router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="datafeed"] [infer="process-webhook"]'
    );

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-post-action-control');
    expect(control).to.have.attribute('href', element.data!._links['fx:process_webhook'].href);
  });

  it('renders customer info as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="customer"]');

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-transaction-customer-control');
  });

  it('renders items as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="items"]');

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-async-list-control');
    expect(control).to.have.deep.property('related', [element.href]);
    expect(control).to.have.property(
      'first',
      'https://demo.api/hapi/items?transaction_id=0&zoom=item_options'
    );

    expect(control).to.have.property('form', 'foxy-item-form');
    expect(control).to.have.property('item', 'foxy-item-card');
    expect(control).to.have.deep.property('itemProps', {
      'locale-codes': 'https://demo.api/hapi/property_helpers/7',
    });

    // the store loads separately from the transaction, so wait for it
    await waitUntil(() => (control as any).formProps?.['item-categories'], '', { timeout: 5000 });

    expect(control).to.have.deep.property('formProps', {
      'item-categories': 'https://demo.api/hapi/item_categories?store_id=0',
      'locale-codes': 'https://demo.api/hapi/property_helpers/7',
      'store': 'https://demo.api/hapi/stores/0',
    });
  });

  it('renders transaction summary as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="summary"]');

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-transaction-summary-control');
  });

  it('renders billing addresses as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="billing-addresses"]');

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-async-list-control');
    expect(control).to.have.property('first', element.data?._links['fx:billing_addresses'].href);
    expect(control).to.have.property('form', 'foxy-address-form');
    expect(control).to.have.property('item', 'foxy-billing-address-card');
    expect(control).to.have.property('hideCreateButton', true);
    expect(control).to.have.property('hideDeleteButton', true);
    expect(control).to.have.property('alert', true);
  });

  it('renders payments as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        hosted-payment-gateways-helper="https://demo.api/property_helpers/1"
        payment-gateways-helper="https://demo.api/property_helpers/0"
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="payments"]');

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-async-list-control');
    expect(control).to.have.property('first', 'https://demo.api/hapi/payments?transaction_id=0');
    expect(control).to.have.property('limit', 20);
    expect(control).to.have.property('form', null);
    expect(control).to.have.property('item', 'foxy-payment-card');
    expect(control).to.have.deep.property('itemProps', {
      'hosted-payment-gateways-helper': 'https://demo.api/property_helpers/1',
      'payment-gateways-helper': 'https://demo.api/property_helpers/0',
    });
  });

  it('renders custom fields as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });

    const control = element.renderRoot.querySelector('[infer="custom-fields"]');

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-async-list-control');
    expect(control).to.have.property('limit', 5);
    expect(control).to.have.property('form', 'foxy-custom-field-form');
    expect(control).to.have.property('item', 'foxy-custom-field-card');
    expect(control).to.have.property(
      'first',
      'https://demo.api/hapi/custom_fields?transaction_id=0'
    );
  });

  it('renders attributes as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });

    const control = element.renderRoot.querySelector('[infer="attributes"]');

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-async-list-control');
    expect(control).to.have.property('limit', 5);
    expect(control).to.have.property('form', 'foxy-attribute-form');
    expect(control).to.have.property('item', 'foxy-attribute-card');
    expect(control).to.have.property(
      'first',
      'https://demo.api/hapi/transaction_attributes?transaction_id=0'
    );
  });

  it('renders transaction metadata when IP and user agent are present', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });

    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
    const analyzeStub = stub(uainfer, 'analyze').returns({ toString: () => 'Stub Agent' });

    try {
      element.data = {
        ...element.data!,
        customer_ip: '203.0.113.10',
        ip_country: 'GB',
        user_agent: userAgent,
      };

      await element.requestUpdate();

      const metadata = element.renderRoot.querySelector('[infer="metadata"]');

      expect(metadata).to.exist;
      expect(metadata).to.have.property('localName', 'foxy-internal-summary-control');
      expect(metadata?.textContent).to.include('203.0.113.10 (GB)');
      expect(metadata?.textContent).to.include('Stub Agent');
      expect(analyzeStub).to.have.been.calledWith(userAgent);
    } finally {
      analyzeStub.restore();
    }
  });

  it('hides transaction metadata when IP or user agent is missing', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });

    element.data = {
      ...element.data!,
      customer_ip: '203.0.113.10',
      user_agent: '',
    };

    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="metadata"]')).to.not.exist;

    element.data = {
      ...element.data!,
      customer_ip: '',
      user_agent: 'Mozilla/5.0',
    };

    await element.requestUpdate();
    expect(element.renderRoot.querySelector('[infer="metadata"]')).to.not.exist;
  });

  it('renders shipments as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });

    const control = element.renderRoot.querySelector('[infer="shipments"]');

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-async-list-control');
    expect(control).to.have.property(
      'first',
      'https://demo.api/hapi/shipments?transaction_id=0&zoom=items%3Aitem_category'
    );
    expect(control).to.have.property('form', null);
    expect(control).to.have.property('item', 'foxy-shipment-card');
  });

  it('links items and shipments without waiting for the store to load', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => {
          if (new URL(evt.request.url).pathname.startsWith('/hapi/stores/')) {
            evt.preventDefault();
            evt.respondWith(new Promise<Response>(() => void 0));
          } else {
            router.handleEvent(evt);
          }
        }}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
    await element.requestUpdate();

    const items = element.renderRoot.querySelector('[infer="items"]');
    const shipments = element.renderRoot.querySelector('[infer="shipments"]');

    expect(items).to.have.property(
      'first',
      'https://demo.api/hapi/items?transaction_id=0&zoom=item_options'
    );

    expect(shipments).to.have.property(
      'first',
      'https://demo.api/hapi/shipments?transaction_id=0&zoom=items%3Aitem_category'
    );
  });

  it('renders webhooks as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0"
        @fetch=${(evt: FetchEvent) => !evt.defaultPrevented && router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(
      () => {
        if (!element.in({ idle: 'snapshot' })) return false;
        const nucleons = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
        return [...nucleons].every(nucleon => nucleon.in({ idle: 'snapshot' }));
      },
      '',
      { timeout: 5000 }
    );

    const control = element.renderRoot.querySelector('[infer="webhooks"]');

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-async-list-control');
    expect(control).to.have.attribute('form', 'foxy-webhook-form');
    expect(control).to.have.attribute('item', 'foxy-webhook-card');
    expect(control).to.have.attribute('hide-create-button');
    expect(control).to.have.attribute('hide-delete-button');
    expect(control).to.have.attribute('alert');
    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/webhooks?store_id=0&event_resource=transaction'
    );

    expect(control).to.have.deep.property('itemProps', {
      'resource-uri': 'https://demo.api/hapi/transactions/0',
    });

    expect(control).to.have.deep.property('formProps', {
      'resource-uri': 'https://demo.api/hapi/transactions/0',
    });
  });

  it('supports refeeding multiple webhooks at once', async () => {
    const requests: Request[] = [];
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0"
        @fetch=${(evt: FetchEvent) => {
          if (evt.defaultPrevented) return;
          requests.push(evt.request.clone());
          router.handleEvent(evt);
        }}
      >
      </foxy-transaction>
    `);

    await waitUntil(
      () => {
        if (!element.in({ idle: 'snapshot' })) return false;
        const nucleons = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
        return [...nucleons].every(nucleon => nucleon.in({ idle: 'snapshot' }));
      },
      '',
      { timeout: 5000 }
    );

    const control =
      element.renderRoot.querySelector<InternalAsyncListControl>('[infer="webhooks"]');

    expect(control).to.have.nested.property('bulkActions.0.name', 'refeed');
    expect(control).to.have.nested.property('bulkActions.0.onClick').that.is.a('function');

    const webhooksCollection = await getTestData<Resource<Rels.Webhooks>>(
      './hapi/webhooks',
      router
    );

    requests.length = 0;
    const webhooksArray = webhooksCollection._embedded['fx:webhooks'] as Resource<Rels.Webhook>[];
    await control?.bulkActions[0].onClick(webhooksArray);

    const refeedRequest = requests.find(req => req.method === 'POST');
    expect(refeedRequest).to.exist;
    expect(refeedRequest?.url).to.equal('https://demo.api/virtual/empty?status=200');
    expect(await refeedRequest?.json()).to.deep.equal({ refeed_hooks: [0], event: 'refeed' });
  });

  it('renders XML datafeed status as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/1"
        @fetch=${(evt: FetchEvent) => !evt.defaultPrevented && router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });

    const summary = element.renderRoot.querySelector('[infer="datafeed"]');
    expect(summary).to.exist;
    expect(summary).to.have.property('localName', 'foxy-internal-summary-control');

    const status = summary?.querySelector('[infer="data-is-fed"');
    expect(status).to.exist;
    expect(status).to.have.property('localName', 'foxy-internal-switch-control');
  });

  describe('current user scope', () => {
    const today = {
      hidden:
        'actions:send-emails datafeed subscription billing-addresses:dialog:delete ' +
        'billing-addresses:dialog:timestamps webhooks:dialog:header:copy-json ' +
        'webhooks:dialog:header:copy-id webhooks:dialog:timestamps webhooks:dialog:name ' +
        'webhooks:dialog:query webhooks:dialog:encryption-key webhooks:dialog:delete ' +
        'undo submit delete timestamps',
      readonly:
        'billing-addresses datafeed:data-is-fed webhooks:dialog:url items attributes custom-fields',
    };

    // `edit` may change the demo JSON in place or return a response to send instead.
    const createElement = (
      scope = '',
      edit: (url: URL, json: any) => Response | void = () => void 0
    ) => {
      const router = createRouter();

      return fixture<Transaction>(html`
        <foxy-transaction
          current-user-scope=${scope}
          href="https://demo.api/hapi/transactions/0"
          @fetch=${(evt: FetchEvent) => {
            if (evt.defaultPrevented) return;
            const url = new URL(evt.request.url);
            const result = router.handleRequest(evt.request)!;
            evt.respondWith(
              result.handlerPromise.then(async response => {
                const json = await response.json();
                const replacement = edit(url, json);
                return replacement ? replacement : new Response(JSON.stringify(json));
              })
            );
          }}
        >
        </foxy-transaction>
      `);
    };

    const withWebhookStore = (url: URL, json: any) => {
      if (url.pathname === '/hapi/stores/0') json.use_webhook = true;
    };

    const whenAllLoaded = (element: Transaction) =>
      waitUntil(
        () => {
          if (!element.in({ idle: 'snapshot' })) return false;
          const nucleons = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
          return [...nucleons].every(n => n.in({ idle: 'snapshot' }) || n.in('fail'));
        },
        '',
        { timeout: 5000 }
      );

    it('keeps selectors unchanged without a scope', () => {
      const element = new Transaction();
      expect(element.hiddenSelector.toString()).to.equal(today.hidden);
      expect(element.readonlySelector.toString()).to.equal(today.readonly);
    });

    it('keeps selectors unchanged with store_full_access', () => {
      const element = new Transaction();
      element.currentUserScope = 'store_full_access';
      expect(element.hiddenSelector.toString()).to.equal(today.hidden);
      expect(element.readonlySelector.toString()).to.equal(today.readonly);
    });

    it('locks own fields and hides write actions with transactions_read', async () => {
      const element = await createElement(
        'transactions_read customers_read stores_read webhooks_read',
        withWebhookStore
      );

      await whenAllLoaded(element);
      expect(element.data?._links).to.have.property('fx:refund');
      expect(element.hiddenSelector.matches('datafeed', true)).to.be.false;
      expect(element.hiddenSelector.matches('actions:send-emails', true)).to.be.true;

      const readonly = element.readonlySelector;
      const hidden = element.hiddenSelector;

      expect(readonly.toString()).to.not.equal(BooleanSelector.True.toString());
      ['items', 'custom-fields', 'attributes'].forEach(path => {
        expect(readonly.matches(path, true), path).to.be.true;
      });

      [
        'actions:capture',
        'actions:void',
        'actions:refund',
        'actions:archive',
        'actions:folder',
        'datafeed:process-webhook',
      ].forEach(path => expect(hidden.matches(path, true), path).to.be.true);

      ['customer', 'webhooks', 'datafeed:data-is-fed'].forEach(path => {
        expect(hidden.matches(path, true), path).to.be.false;
      });
    });

    it('keeps own fields and write actions with transactions_write', async () => {
      const element = await createElement(
        'transactions_write transactions_resend stores_read webhooks_read webhooks_resend',
        withWebhookStore
      );

      await whenAllLoaded(element);
      const readonly = element.readonlySelector;
      const hidden = element.hiddenSelector;

      ['items', 'custom-fields', 'attributes'].forEach(path => {
        expect(readonly.matches(path, true), path).to.be.false;
      });

      [
        'actions:void',
        'actions:refund',
        'actions:send-emails',
        'actions:archive',
        'actions:folder',
        'datafeed:process-webhook',
      ].forEach(path => expect(hidden.matches(path, true), path).to.be.false);
    });

    it('shows send emails when the template set is denied', async () => {
      const element = await createElement('transactions_resend transactions_read', url => {
        if (url.pathname.startsWith('/hapi/template_sets')) {
          return createAccessDeniedResponse('read', 'template_set');
        }
      });

      await whenAllLoaded(element);
      const loader = element.renderRoot.querySelector<NucleonElement<any>>('#templateSetLoader');
      expect(loader?.in('fail')).to.be.true;
      expect(element.hiddenSelector.matches('actions:send-emails', true)).to.be.false;
    });

    it('hides send emails without a scope when the template set fails to load', async () => {
      const element = await createElement('', url => {
        if (url.pathname.startsWith('/hapi/template_sets')) {
          return new Response(null, { status: 500 });
        }
      });

      await whenAllLoaded(element);
      const loader = element.renderRoot.querySelector<NucleonElement<any>>('#templateSetLoader');
      expect(loader?.in('fail')).to.be.true;
      expect(element.hiddenSelector.matches('actions:send-emails', true)).to.be.true;
    });

    [
      'transactions_resend transactions_read',
      'transactions_resend transactions_read templates_read',
    ].forEach(scope => {
      it(`shows send emails with "${scope}" when the store is denied`, async () => {
        const element = await createElement(scope, url => {
          if (url.pathname === '/hapi/stores/0') return createAccessDeniedResponse('read', 'store');
        });

        // The template set loader gets no href here, so it never settles.
        const storeLoader = () =>
          element.renderRoot.querySelector<NucleonElement<any>>('#storeLoader');
        await waitUntil(() => element.in({ idle: 'snapshot' }) && !!storeLoader()?.in('fail'));
        await element.requestUpdate();
        expect(element.data?._links).to.not.have.property('fx:template_sets');
        expect(element.hiddenSelector.matches('actions:send-emails', true)).to.be.false;
      });
    });

    it('hides webhooks and folders without stores_read', async () => {
      const element = new Transaction();
      element.currentUserScope = 'transactions_write webhooks_read';
      expect(element.hiddenSelector.matches('webhooks', true)).to.be.true;
      expect(element.hiddenSelector.matches('actions:folder', true)).to.be.true;

      element.currentUserScope = 'transactions_write webhooks_read stores_read';
      expect(element.hiddenSelector.matches('webhooks', true)).to.be.false;
      expect(element.hiddenSelector.matches('actions:folder', true)).to.be.false;
    });

    it('hides the subscription link without subscriptions_read', () => {
      const element = new Transaction();
      element.currentUserScope = 'transactions_read';
      expect(element.hiddenSelector.matches('actions:subscription', true)).to.be.true;

      element.currentUserScope = 'transactions_read subscriptions_read';
      expect(element.hiddenSelector.matches('actions:subscription', true)).to.be.false;
    });

    it('hides the customer block without customers_read', () => {
      const element = new Transaction();
      element.currentUserScope = 'transactions_write';
      expect(element.hiddenSelector.matches('customer', true)).to.be.true;
    });

    it('hides webhooks without webhooks_read and refeed without webhooks_resend or webhooks_write', async () => {
      const element = await fixture<Transaction>(html`
        <foxy-transaction current-user-scope="transactions_read stores_read webhooks_read">
        </foxy-transaction>
      `);

      const webhooks =
        element.renderRoot.querySelector<InternalAsyncListControl>('[infer="webhooks"]')!;

      expect(element.hiddenSelector.matches('webhooks', true)).to.be.false;
      expect(webhooks.bulkActions).to.be.empty;

      element.currentUserScope = 'transactions_read stores_read webhooks_write';
      await element.requestUpdate();
      expect(webhooks.bulkActions).to.have.length(1);

      element.currentUserScope = 'transactions_read stores_read webhooks_read webhooks_resend';
      await element.requestUpdate();
      expect(webhooks.bulkActions).to.have.length(1);
    });

    it('hides the process webhook action without webhooks_resend or webhooks_write', async () => {
      const element = await createElement(
        'transactions_write stores_read webhooks_read',
        withWebhookStore
      );

      await whenAllLoaded(element);
      await element.requestUpdate();
      const control = element.renderRoot.querySelector<InternalControl>(
        '[infer="datafeed"] [infer="process-webhook"]'
      )!;

      await control.requestUpdate();
      expect(control.hidden).to.be.true;

      element.currentUserScope = 'transactions_write stores_read webhooks_write';
      await element.requestUpdate();
      await control.requestUpdate();
      expect(control.hidden).to.be.false;

      element.currentUserScope = 'transactions_write stores_read webhooks_read';
      await element.requestUpdate();
      await control.requestUpdate();
      expect(control.hidden).to.be.true;

      element.currentUserScope = 'transactions_write stores_read webhooks_read webhooks_resend';
      await element.requestUpdate();
      await control.requestUpdate();
      expect(control.hidden).to.be.false;
    });

    it('hides send emails without transactions_resend or transactions_write', async () => {
      const element = await createElement();
      await whenAllLoaded(element);
      expect(element.hiddenSelector.matches('actions:send-emails', true)).to.be.false;

      element.currentUserScope = 'transactions_read';
      await element.requestUpdate();
      expect(element.hiddenSelector.matches('actions:send-emails', true)).to.be.true;

      element.currentUserScope = 'transactions_write';
      await element.requestUpdate();
      expect(element.hiddenSelector.matches('actions:send-emails', true)).to.be.false;
      expect(element.hiddenSelector.matches('actions:refund', true)).to.be.false;
    });

    it('zooms shipment item categories only when the scope can read them', async () => {
      const zoomFor = async (scope: string) => {
        const element = await createElement(scope);
        await whenAllLoaded(element);
        const control = element.renderRoot.querySelector('[infer="shipments"]')!;
        return new URL(control.getAttribute('first')!).searchParams.get('zoom');
      };

      expect(await zoomFor('transactions_read')).to.equal('items');
      expect(await zoomFor('transactions_read item_categories_read')).to.equal(
        'items:item_category'
      );
      expect(await zoomFor('')).to.equal('items:item_category');
    });

    it('does not lock the customer block when only the transaction is read-only', async () => {
      const scope = 'transactions_read customers_write';
      const element = await createElement(scope);
      await whenAllLoaded(element);

      const control = element.renderRoot.querySelector<InternalControl>('[infer="customer"]')!;
      await control.requestUpdate();
      const card = control.renderRoot.querySelector<NucleonElement<any> & InternalControl>(
        'foxy-customer-card'
      )!;

      await card.requestUpdate();
      expect(element.readonlySelector.matches('items', true)).to.be.true;
      expect(card).to.have.property('currentUserScope', scope);
      expect(card).to.have.property('readonly', false);
    });
  });
});
