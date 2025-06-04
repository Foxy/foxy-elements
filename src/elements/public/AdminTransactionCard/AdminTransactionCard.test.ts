import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { AdminTransactionCard as Card } from './AdminTransactionCard';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { createRouter } from '../../../server/index';

describe('AdminTransactionCard', () => {
  it('imports dependencies', () => {
    expect(customElements.get('vcf-tooltip')).to.exist;
    expect(customElements.get('foxy-internal-card')).to.exist;
    expect(customElements.get('foxy-nucleon')).to.exist;
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('defines itself as foxy-admin-transaction-card', () => {
    expect(customElements.get('foxy-admin-transaction-card')).to.equal(Card);
  });

  it('extends InternalCard', () => {
    expect(new Card()).to.be.instanceOf(InternalCard);
  });

  it('has a default i18next namespace of "admin-transaction-card"', () => {
    expect(Card.defaultNS).to.equal('admin-transaction-card');
    expect(new Card().ns).to.equal('admin-transaction-card');
  });

  it('renders display_id when available', async () => {
    const router = createRouter();
    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({ display_id: 'TXN-12345' }),
      })
    )?.handlerPromise;

    const card = await fixture<Card>(html`
      <foxy-admin-transaction-card
        href="https://demo.api/hapi/transactions/0?zoom=items,folder"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-transaction-card>
    `);

    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot).to.include.text('TXN-12345');
  });

  it('renders transaction id when display_id is not available', async () => {
    const router = createRouter();
    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({ display_id: null, id: 9587684756 }),
      })
    )?.handlerPromise;

    const card = await fixture<Card>(html`
      <foxy-admin-transaction-card
        href="https://demo.api/hapi/transactions/9587684756?zoom=items,folder"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-transaction-card>
    `);

    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot).to.include.text('9587684756');
  });

  it('renders folder name when folder is available', async () => {
    const router = createRouter();
    const card = await fixture<Card>(html`
      <foxy-admin-transaction-card
        href="https://demo.api/hapi/transactions/0?zoom=items"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-transaction-card>
    `);

    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot).to.not.include.text('Pending');

    card.href = 'https://demo.api/hapi/transactions/0?zoom=items,folder';
    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot).to.include.text('Pending');
  });

  it('renders CIT/MIT label when available', async () => {
    const router = createRouter();
    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({ source: 'cit_ecommerce' }),
      })
    )?.handlerPromise;

    const card = await fixture<Card>(html`
      <foxy-admin-transaction-card
        href="https://demo.api/hapi/transactions/0?zoom=items,folder"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-transaction-card>
    `);

    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot).to.include.text('CIT');

    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({ source: 'mit_uoe' }),
      })
    )?.handlerPromise;

    card.data = null;
    card.href = 'https://demo.api/hapi/transactions/0?zoom=items,folder';
    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot).to.include.text('MIT');
  });

  it('renders Test badge when transaction is a test transaction', async () => {
    const router = createRouter();
    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({ is_test: true }),
      })
    )?.handlerPromise;

    const card = await fixture<Card>(html`
      <foxy-admin-transaction-card
        href="https://demo.api/hapi/transactions/0?zoom=items,folder"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-transaction-card>
    `);

    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot.querySelector('foxy-i18n[infer=""][key="test"]')).to.exist;

    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({ is_test: false }),
      })
    )?.handlerPromise;

    card.data = null;
    card.href = 'https://demo.api/hapi/transactions/0?zoom=items,folder';
    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot.querySelector('foxy-i18n[infer=""][key="test"]')).to.not.exist;
  });

  it('renders Hidden indicator when transaction is hidden', async () => {
    const router = createRouter();
    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({ hide_transaction: true }),
      })
    )?.handlerPromise;

    const card = await fixture<Card>(html`
      <foxy-admin-transaction-card
        href="https://demo.api/hapi/transactions/0?zoom=items,folder"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-transaction-card>
    `);

    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot.querySelector('foxy-i18n[infer=""][key="hidden_hint"]')).to.exist;

    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({ hide_transaction: false }),
      })
    )?.handlerPromise;

    card.data = null;
    card.href = 'https://demo.api/hapi/transactions/0?zoom=items,folder';
    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot.querySelector('foxy-i18n[infer=""][key="hidden_hint"]')).to.not.exist;
  });

  it('renders transaction time', async () => {
    const router = createRouter();
    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({ transaction_date: '2023-10-01T12:00:00Z' }),
      })
    )?.handlerPromise;

    const card = await fixture<Card>(html`
      <foxy-admin-transaction-card
        href="https://demo.api/hapi/transactions/0?zoom=items,folder"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-transaction-card>
    `);

    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    const date = card.renderRoot.querySelector('foxy-i18n[infer=""][key="time"]');
    expect(date).to.exist;
    expect(date).to.have.deep.property('options', { value: '2023-10-01T12:00:00Z' });
  });

  it('renders transaction total unless it is an updateinfo or subscription_cancellation', async () => {
    const router = createRouter();
    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({ type: 'updateinfo' }),
      })
    )?.handlerPromise;

    const card = await fixture<Card>(html`
      <foxy-admin-transaction-card
        href="https://demo.api/hapi/transactions/0?zoom=items,folder"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-transaction-card>
    `);

    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot.querySelector('foxy-i18n[infer=""][key="price"]')).to.not.exist;

    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({ type: 'subscription_cancellation' }),
      })
    )?.handlerPromise;

    card.data = null;
    card.href = 'https://demo.api/hapi/transactions/0?zoom=items,folder';
    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot.querySelector('foxy-i18n[infer=""][key="price"]')).to.not.exist;

    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({ type: '' }),
      })
    )?.handlerPromise;

    card.data = null;
    card.href = 'https://demo.api/hapi/transactions/0?zoom=items,folder';
    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();

    const price = card.renderRoot.querySelector('foxy-i18n[infer=""][key="price"]');
    expect(price).to.exist;
    expect(price).to.have.deep.property('options', { currencyDisplay: 'code', amount: '11.9 USD' });
  });

  it('renders transaction summary when items are available', async () => {
    const router = createRouter();
    const card = await fixture<Card>(html`
      <foxy-admin-transaction-card
        href="https://demo.api/hapi/transactions/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-transaction-card>
    `);

    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot.querySelector('foxy-i18n[infer=""][key="summary"]')).to.not.exist;

    card.data = null;
    card.href = 'https://demo.api/hapi/transactions/0?zoom=items,folder';
    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();

    const summary = card.renderRoot.querySelector('foxy-i18n[infer=""][key="summary"]');
    expect(summary).to.exist;
    expect(summary).to.have.deep.property('options', {
      count_minus_one: 4,
      first_item: (card.data as unknown as Data)._embedded['fx:items'][0],
      context: '',
      count: 5,
    });
  });

  it('renders customer name and email', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({
          customer_first_name: 'John',
          customer_last_name: 'Doe',
          customer_email: 'test@example.com',
        }),
      })
    )?.handlerPromise;

    const card = await fixture<Card>(html`
      <foxy-admin-transaction-card
        href="https://demo.api/hapi/transactions/0?zoom=items,folder"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-transaction-card>
    `);

    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot).to.include.text('John Doe (test@example.com)');
  });

  it('renders transaction status', async () => {
    const router = createRouter();
    await router.handleRequest(
      new Request('https://demo.api/hapi/transactions/0', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'voided' }),
      })
    )?.handlerPromise;

    const card = await fixture<Card>(html`
      <foxy-admin-transaction-card
        href="https://demo.api/hapi/transactions/0?zoom=items,folder"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-transaction-card>
    `);

    await waitUntil(() => card.isBodyReady, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot.querySelector('foxy-i18n[infer=""][key="status_voided"]')).to.exist;
  });
});
