import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { Data } from './types';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { TransactionCard } from './index';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { createRouter } from '../../../server/index';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { InternalCard } from '../../internal/InternalCard/InternalCard';

const router = createRouter();

describe('TransactionCard', () => {
  it('extends InternalCard', () => {
    expect(new TransactionCard()).to.be.instanceOf(InternalCard);
  });

  it('registers as foxy-transaction-card', () => {
    expect(customElements.get('foxy-transaction-card')).to.equal(TransactionCard);
  });

  it('has property+attribute "lang" initialized with empty string', () => {
    expect(TransactionCard.properties).to.have.deep.property('lang', { type: String });
    expect(new TransactionCard()).to.have.property('lang', '');
  });

  it('has property+attribute "ns" initialized with "transaction-card"', () => {
    expect(TransactionCard.properties).to.have.deep.property('ns', { type: String });
    expect(new TransactionCard()).to.have.property('ns', 'transaction-card');
  });

  describe('total', () => {
    it('renders total once loaded', async () => {
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card
          href="https://demo.api/hapi/transactions/0?zoom=items"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-transaction-card>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });

      const transaction = await getTestData<Data>('./hapi/transactions/0');
      const store = await getTestData<Resource<Rels.Store>>(transaction._links['fx:store'].href);
      const total = await getByKey(element, 'price');

      const amount = `${transaction.total_order} ${transaction.currency_code}`;
      const currencyDisplay = store.use_international_currency_symbol ? 'code' : 'symbol';

      expect(total).to.have.deep.property('options', { amount, currencyDisplay });
    });

    it('renders a special label for test transactions once loaded', async () => {
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card
          href="https://demo.api/hapi/transactions/0?zoom=items"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-transaction-card>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });

      element.data = { ...element.data!, is_test: false };
      await element.requestUpdate();
      expect(element.renderRoot.querySelector('foxy-i18n[key="test"')).to.not.exist;

      element.data = { ...element.data!, is_test: true };
      await element.requestUpdate();
      expect(element.renderRoot.querySelector('foxy-i18n[key="test"')).to.exist;
    });

    it('renders "total:before" slot by default', async () => {
      const layout = html`<foxy-transaction-card></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByName(element, 'total:before')).to.have.property('localName', 'slot');
    });

    it('replaces "total:before" slot with template "total:before" if available', async () => {
      const name = 'total:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-transaction-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "total:after" slot by default', async () => {
      const layout = html`<foxy-transaction-card></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByName(element, 'total:after')).to.have.property('localName', 'slot');
    });

    it('replaces "total:after" slot with template "total:after" if available', async () => {
      const name = 'total:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-transaction-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-transaction-card></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByTestId(element, 'total')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-transaction-card hidden></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByTestId(element, 'total')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "total"', async () => {
      const layout = html`<foxy-transaction-card hiddencontrols="total"></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByTestId(element, 'total')).to.not.exist;
    });
  });

  describe('status', () => {
    it('renders status once loaded', async () => {
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card
          href="https://demo.api/hapi/transactions/0?zoom=items"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-transaction-card>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });

      const transaction = await getTestData<Data>('./hapi/transactions/0');
      const time = await getByKey(element, 'time');
      const tooltip = await getByKey(element, `status_${transaction.status}`);
      const timeOptions = JSON.stringify({ value: transaction.transaction_date });

      expect(time).to.have.attribute('options', timeOptions);
      expect(tooltip).to.exist;
    });

    it('renders a special label for hidden transactions once loaded', async () => {
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card
          href="https://demo.api/hapi/transactions/0?zoom=items"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-transaction-card>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });
      element.data = { ...element.data!, hide_transaction: false };
      await element.requestUpdate();

      expect(element.renderRoot.querySelector('vcf-tooltip[for="hidden"]')).to.not.exist;
      expect(element.renderRoot.querySelector('iron-icon#hidden')).to.not.exist;
      expect(element.renderRoot.querySelector('foxy-i18n[key="hidden_hint"')).to.not.exist;

      element.data = { ...element.data!, hide_transaction: true };
      await element.requestUpdate();

      expect(element.renderRoot.querySelector('vcf-tooltip[for="hidden"]')).to.exist;
      expect(element.renderRoot.querySelector('iron-icon#hidden')).to.exist;
      expect(element.renderRoot.querySelector('foxy-i18n[key="hidden_hint"')).to.exist;
    });

    it('renders "status:before" slot by default', async () => {
      const layout = html`<foxy-transaction-card></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByName(element, 'status:before')).to.have.property('localName', 'slot');
    });

    it('replaces "status:before" slot with template "status:before" if available', async () => {
      const name = 'status:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-transaction-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "status:after" slot by default', async () => {
      const layout = html`<foxy-transaction-card></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByName(element, 'status:after')).to.have.property('localName', 'slot');
    });

    it('replaces "status:after" slot with template "status:after" if available', async () => {
      const name = 'status:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-transaction-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-transaction-card></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByTestId(element, 'status')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-transaction-card hidden></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByTestId(element, 'status')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "status"', async () => {
      const layout = html`<foxy-transaction-card hiddencontrols="status"></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByTestId(element, 'status')).to.not.exist;
    });
  });

  describe('description', () => {
    it('renders description once loaded', async () => {
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card
          href="https://demo.api/hapi/transactions/0?zoom=items"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-transaction-card>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });

      const transaction = await getTestData<Data>('./hapi/transactions/0?zoom=items', router);
      const items = transaction._embedded['fx:items'];
      const summary = await getByKey(element, 'summary');
      const options = {
        count_minus_one: items.length - 1,
        first_item: items[0],
        count: items.length,
      };

      expect(summary).to.have.deep.property('options', options);
    });

    it('renders "description:before" slot by default', async () => {
      const layout = html`<foxy-transaction-card></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByName(element, 'description:before')).to.have.property('localName', 'slot');
    });

    it('replaces "description:before" slot with template "description:before" if available', async () => {
      const name = 'description:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-transaction-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "description:after" slot by default', async () => {
      const layout = html`<foxy-transaction-card></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByName(element, 'description:after')).to.have.property('localName', 'slot');
    });

    it('replaces "description:after" slot with template "description:after" if available', async () => {
      const name = 'description:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-transaction-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-transaction-card></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByTestId(element, 'description')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-transaction-card hidden></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByTestId(element, 'description')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "description"', async () => {
      const layout = html`<foxy-transaction-card
        hiddencontrols="description"
      ></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByTestId(element, 'description')).to.not.exist;
    });
  });

  describe('customer', () => {
    it('renders customer once loaded', async () => {
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card
          href="https://demo.api/hapi/transactions/0?zoom=items"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-transaction-card>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });

      const transaction = await getTestData<Data>('./hapi/transactions/0?zoom=items');
      const customer = await getByTestId(element, 'customer');
      const text = `${transaction.customer_first_name} ${transaction.customer_last_name} (${transaction.customer_email})`;

      expect(customer).to.contain.text(text);
    });

    it('renders "customer:before" slot by default', async () => {
      const layout = html`<foxy-transaction-card></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByName(element, 'customer:before')).to.have.property('localName', 'slot');
    });

    it('replaces "customer:before" slot with template "customer:before" if available', async () => {
      const name = 'customer:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-transaction-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "customer:after" slot by default', async () => {
      const layout = html`<foxy-transaction-card></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByName(element, 'customer:after')).to.have.property('localName', 'slot');
    });

    it('replaces "customer:after" slot with template "customer:after" if available', async () => {
      const name = 'customer:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TransactionCard>(html`
        <foxy-transaction-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-transaction-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-transaction-card></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByTestId(element, 'customer')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-transaction-card hidden></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByTestId(element, 'customer')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "customer"', async () => {
      const layout = html`<foxy-transaction-card
        hiddencontrols="customer"
      ></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      expect(await getByTestId(element, 'customer')).to.not.exist;
    });
  });
});
