import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { Data } from './types';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { TransactionCard } from './index';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { router } from '../../../server';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('TransactionCard', () => {
  it('extends NucleonElement', () => {
    expect(new TransactionCard()).to.be.instanceOf(NucleonElement);
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
          href="https://demo.foxycart.com/s/admin/transactions/0?zoom=items"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-transaction-card>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });

      const transaction = await getTestData<Data>('./s/admin/transactions/0');
      const store = await getTestData<Resource<Rels.Store>>(transaction._links['fx:store'].href);
      const total = await getByKey(element, 'price');

      const amount = `${transaction.total_order} ${transaction.currency_code}`;
      const currencyDisplay = store.use_international_currency_symbol ? 'code' : 'symbol';

      expect(total).to.have.attribute('options', JSON.stringify({ amount, currencyDisplay }));
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
          href="https://demo.foxycart.com/s/admin/transactions/0?zoom=items"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-transaction-card>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });

      const transaction = await getTestData<Data>('./s/admin/transactions/0');
      const time = await getByKey(element, 'time');
      const icon = await getByTestId(element, 'status-icon');
      const timeOptions = JSON.stringify({ value: transaction.transaction_date });

      expect(time).to.have.attribute('options', timeOptions);
      expect(icon).to.have.attribute('title', `transaction_${transaction.status}`);
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
          href="https://demo.foxycart.com/s/admin/transactions/0?zoom=items"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-transaction-card>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });

      const transaction = await getTestData<Data>('./s/admin/transactions/0?zoom=items');
      const items = transaction._embedded['fx:items'];
      const summary = await getByKey(element, 'transaction_summary');
      const options = JSON.stringify({
        most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
        count: items.length,
      });

      expect(summary).to.have.attribute('options', options);
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
          href="https://demo.foxycart.com/s/admin/transactions/0?zoom=items"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-transaction-card>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });

      const transaction = await getTestData<Data>('./s/admin/transactions/0?zoom=items');
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

  describe('spinner', () => {
    it('renders "empty" foxy-spinner by default', async () => {
      const layout = html`<foxy-transaction-card lang="es" ns="foo"></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'empty');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'foo spinner');
    });

    it('renders "busy" foxy-spinner while loading', async () => {
      const layout = html`<foxy-transaction-card
        href="/"
        lang="es"
        ns="foo"
      ></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'foo spinner');
    });

    it('renders "error" foxy-spinner if loading fails', async () => {
      const layout = html`<foxy-transaction-card
        href="/"
        lang="es"
        ns="foo"
      ></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'foo spinner');
    });

    it('hides the spinner once loaded', async () => {
      const data = await getTestData<any>('https://demo.foxycart.com/s/admin/customers/0');
      const layout = html`<foxy-transaction-card .data=${data}></foxy-transaction-card>`;
      const element = await fixture<TransactionCard>(layout);
      const spinner = await getByTestId(element, 'spinner');

      expect(spinner!.parentElement).to.have.class('opacity-0');
    });
  });
});
