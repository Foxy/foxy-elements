import { expect, fixture, waitUntil } from '@open-wc/testing';
import { Transaction } from './index';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';
import { createRouter } from '../../../server/index';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { getByKey } from '../../../testgen/getByKey';

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

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
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

  it('extends InternalForm', () => {
    expect(new Transaction()).to.be.instanceOf(InternalForm);
  });

  it('renders translatable title in header', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    await element.requestUpdate();
    const title = await getByKey(element, 'title');

    expect(title).to.exist;
    expect(title).to.have.attribute('infer', 'header');
    expect(title).to.have.property('options', element.data);
  });

  it('renders a copy-to-clipboard button in header', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    await element.requestUpdate();
    const button = element.renderRoot.querySelector('foxy-copy-to-clipboard');

    expect(button).to.exist;
    expect(button).to.have.attribute('infer', 'header');
    expect(button).to.have.attribute('text', String(element.data!.display_id));
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    element.data = { ...element.data!, type: 'updateinfo', source: 'cit_ecommerce' };
    await element.requestUpdate();

    const subtitle = element.renderRoot.querySelectorAll('foxy-i18n[infer="header"]')[1];
    expect(subtitle).to.have.attribute('key', 'subtitle_customer_changed_payment_method');

    element.data = { ...element.data!, source: 'mit_api' };
    await element.requestUpdate();
    expect(subtitle).to.not.have.attribute('key', 'subtitle_customer_changed_payment_method');
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    element.data = { ...element.data!, type: 'updateinfo', source: 'mit_uoe' };
    await element.requestUpdate();

    const subtitle = element.renderRoot.querySelectorAll('foxy-i18n[infer="header"]')[1];
    expect(subtitle).to.have.attribute('key', 'subtitle_admin_changed_payment_method_with_uoe');

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(subtitle).to.not.have.attribute(
      'key',
      'subtitle_customer_changed_payment_method_with_uoe'
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    element.data = { ...element.data!, type: 'updateinfo', source: 'mit_api' };
    await element.requestUpdate();

    const subtitle = element.renderRoot.querySelectorAll('foxy-i18n[infer="header"]')[1];
    expect(subtitle).to.have.attribute('key', 'subtitle_integration_changed_payment_method');

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(subtitle).to.not.have.attribute('key', 'subtitle_integration_changed_payment_method');
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    element.data = { ...element.data!, type: 'subscription_modification', source: 'cit_ecommerce' };
    await element.requestUpdate();

    const subtitle = element.renderRoot.querySelectorAll('foxy-i18n[infer="header"]')[1];
    expect(subtitle).to.have.attribute('key', 'subtitle_customer_changed_subscription');

    element.data = { ...element.data!, source: 'mit_api' };
    await element.requestUpdate();
    expect(subtitle).to.not.have.attribute('key', 'subtitle_customer_changed_subscription');
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    element.data = { ...element.data!, type: 'subscription_modification', source: 'mit_uoe' };
    await element.requestUpdate();

    const subtitle = element.renderRoot.querySelectorAll('foxy-i18n[infer="header"]')[1];
    expect(subtitle).to.have.attribute('key', 'subtitle_admin_changed_subscription_with_uoe');

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(subtitle).to.not.have.attribute(
      'key',
      'subtitle_customer_changed_subscription_with_uoe'
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    element.data = { ...element.data!, type: 'subscription_modification', source: 'mit_api' };
    await element.requestUpdate();

    const subtitle = element.renderRoot.querySelectorAll('foxy-i18n[infer="header"]')[1];
    expect(subtitle).to.have.attribute('key', 'subtitle_integration_changed_subscription');

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(subtitle).to.not.have.attribute('key', 'subtitle_integration_changed_subscription');
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    element.data = { ...element.data!, type: 'subscription_renewal', source: 'mit_recurring' };
    await element.requestUpdate();

    const subtitle = element.renderRoot.querySelectorAll('foxy-i18n[infer="header"]')[1];
    expect(subtitle).to.have.attribute('key', 'subtitle_subscription_renewal_attempt');

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(subtitle).to.not.have.attribute('key', 'subtitle_subscription_renewal_attempt');
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    element.data = {
      ...element.data!,
      type: 'subscription_renewal',
      source: 'mit_recurring_reattempt_automated',
    };
    await element.requestUpdate();

    const subtitle = element.renderRoot.querySelectorAll('foxy-i18n[infer="header"]')[1];
    expect(subtitle).to.have.attribute('key', 'subtitle_subscription_renewal_automated_reattempt');

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(subtitle).to.not.have.attribute(
      'key',
      'subtitle_subscription_renewal_automated_reattempt'
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    element.data = {
      ...element.data!,
      type: 'subscription_renewal',
      source: 'mit_recurring_reattempt_manual',
    };
    await element.requestUpdate();

    const subtitle = element.renderRoot.querySelectorAll('foxy-i18n[infer="header"]')[1];
    expect(subtitle).to.have.attribute('key', 'subtitle_subscription_renewal_manual_reattempt');

    element.data = { ...element.data!, source: 'cit_ecommerce' };
    await element.requestUpdate();
    expect(subtitle).to.not.have.attribute('key', 'subtitle_subscription_renewal_manual_reattempt');
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    element.data = {
      ...element.data!,
      type: 'subscription_cancellation',
      source: 'cit_recurring_cancellation',
    };
    await element.requestUpdate();

    const subtitle = element.renderRoot.querySelectorAll('foxy-i18n[infer="header"]')[1];
    expect(subtitle).to.have.attribute('key', 'subtitle_customer_canceled_subscription');

    element.data = { ...element.data!, source: 'mit_recurring_cancellation' };
    await element.requestUpdate();
    expect(subtitle).to.not.have.attribute('key', 'subtitle_customer_canceled_subscription');
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    element.data = {
      ...element.data!,
      type: 'subscription_cancellation',
      source: 'mit_recurring_cancellation',
    };
    await element.requestUpdate();

    const subtitle = element.renderRoot.querySelectorAll('foxy-i18n[infer="header"]')[1];
    expect(subtitle).to.have.attribute('key', 'subtitle_admin_canceled_subscription');

    element.data = { ...element.data!, source: 'cit_recurring_cancellation' };
    await element.requestUpdate();
    expect(subtitle).to.not.have.attribute('key', 'subtitle_admin_canceled_subscription');
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));

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

    const subtitle = element.renderRoot.querySelectorAll('foxy-i18n[infer="header"]')[1];
    expect(subtitle).to.have.attribute('key', 'subtitle_customer_subscribed');

    element.data = { ...element.data!, source: 'mit_uoe' };
    await element.requestUpdate();
    expect(subtitle).to.have.attribute('key', 'subtitle_admin_subscribed_with_uoe');

    element.data = { ...element.data!, source: 'mit_api' };
    await element.requestUpdate();
    expect(subtitle).to.have.attribute('key', 'subtitle_integration_subscribed');
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));

    const newData = { ...element.data!, source: 'cit_ecommerce', type: '' } as const;
    // @ts-expect-error SDK doesn't support optional links
    delete newData._links['fx:subscription'];
    element.data = newData;

    await element.requestUpdate();

    const subtitle = element.renderRoot.querySelectorAll('foxy-i18n[infer="header"]')[1];
    expect(subtitle).to.have.attribute('key', 'subtitle_customer_placed_order');

    element.data = { ...element.data!, source: 'mit_uoe' };
    await element.requestUpdate();
    expect(subtitle).to.have.attribute('key', 'subtitle_admin_placed_order_with_uoe');

    element.data = { ...element.data!, source: 'mit_api' };
    await element.requestUpdate();
    expect(subtitle).to.have.attribute('key', 'subtitle_integration_placed_order');
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    const control = element.renderRoot.querySelector('[infer="actions"]');

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-transaction-actions-control');
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    const control = element.renderRoot.querySelector('[infer="customer"]');

    expect(control).to.exist;
    expect(control).to.have.property('localName', 'foxy-internal-transaction-customer-control');
  });

  it('renders items as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));
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

    await waitUntil(() => element.in({ idle: 'snapshot' }));

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

    await waitUntil(() => element.in({ idle: 'snapshot' }));

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

  it('renders shipments as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
        href="https://demo.api/hapi/transactions/0?zoom=applied_taxes,discounts,shipments,applied_gift_card_codes:gift_card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-transaction>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));

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
});
