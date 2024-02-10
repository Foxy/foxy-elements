import { expect, fixture, waitUntil } from '@open-wc/testing';
import { Transaction } from './index';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';
import { createRouter } from '../../../server/index';
import { FetchEvent } from '../NucleonElement/FetchEvent';

describe('Transaction', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

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

  it('imports and defines foxy-shipment-card', () => {
    expect(customElements.get('foxy-shipment-card')).to.exist;
  });

  it('imports and defines foxy-payment-card', () => {
    expect(customElements.get('foxy-payment-card')).to.exist;
  });

  it('imports and defines foxy-item-form', () => {
    expect(customElements.get('foxy-item-form')).to.exist;
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

  it('extends InternalForm', () => {
    expect(new Transaction()).to.be.instanceOf(InternalForm);
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

  it('renders payments as control', async () => {
    const router = createRouter();
    const element = await fixture<Transaction>(html`
      <foxy-transaction
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
});
