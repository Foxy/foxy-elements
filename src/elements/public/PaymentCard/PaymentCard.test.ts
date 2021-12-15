import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { Data } from './types';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { PaymentCard } from './PaymentCard';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { createRouter } from '../../../server/index';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

const router = createRouter();

describe('PaymentCard', () => {
  it('extends NucleonElement', () => {
    expect(new PaymentCard()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-payment-card', () => {
    expect(customElements.get('foxy-payment-card')).to.equal(PaymentCard);
  });

  it('has a default i18next namespace of "payment-card"', () => {
    expect(new PaymentCard()).to.have.property('ns', 'payment-card');
  });

  describe('title', () => {
    it('renders gateway name in title once loaded', async () => {
      const data = await getTestData<Data>('./hapi/payments/0');
      const layout = html`<foxy-payment-card lang="es" ns="foo" .data=${data}></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      const title = (await getByTestId(element, 'title')) as HTMLDivElement;
      const name = await getByKey(title, `gateways.${data.gateway_type}`);

      expect(name).to.have.attribute('lang', 'es');
      expect(name).to.have.attribute('ns', 'foo gateways');
    });

    it('renders "title:after" slot by default', async () => {
      const layout = html`<foxy-payment-card></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByName(element, 'title:before')).to.have.property('localName', 'slot');
    });

    it('replaces "title:before" slot with template "title:before" if available', async () => {
      const name = 'title:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentCard>(html`
        <foxy-payment-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-payment-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "title:after" slot by default', async () => {
      const layout = html`<foxy-payment-card></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByName(element, 'title:after')).to.have.property('localName', 'slot');
    });

    it('replaces "title:after" slot with template "title:after" if available', async () => {
      const name = 'title:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentCard>(html`
        <foxy-payment-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-payment-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-payment-card></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByTestId(element, 'title')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-payment-card hidden></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByTestId(element, 'title')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "title"', async () => {
      const layout = html`<foxy-payment-card hiddencontrols="title"></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByTestId(element, 'title')).to.not.exist;
    });
  });

  describe('subtitle', () => {
    it('renders amount and date in subtitle once loaded', async () => {
      const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
      const layout = html`<foxy-payment-card @fetch=${handleFetch}></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);

      element.href = 'https://demo.api/hapi/payments/0';
      element.lang = 'es';
      element.ns = 'foo';

      type Transaction = Resource<Rels.Transaction>;
      type Store = Resource<Rels.Store>;

      await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

      const data = element.data!;
      const store = await getTestData<Store>(data._links['fx:store'].href);
      const transaction = await getTestData<Transaction>(data._links['fx:transaction'].href);

      const subtitle = (await getByTestId(element, 'subtitle')) as HTMLDivElement;
      const amount = await getByKey(subtitle, 'price');
      const amountOptions = JSON.stringify({
        amount: `${data.amount} ${transaction.currency_code}`,
        currencyDisplay: store.use_international_currency_symbol ? 'code' : 'symbol',
      });

      const date = await getByKey(subtitle, 'date');
      const dateOptions = JSON.stringify({ value: data.date_created });

      expect(amount).to.have.attribute('options', amountOptions);
      expect(amount).to.have.attribute('lang', 'es');
      expect(amount).to.have.attribute('ns', 'foo');

      expect(date).to.have.attribute('options', dateOptions);
      expect(date).to.have.attribute('lang', 'es');
      expect(date).to.have.attribute('ns', 'foo');
    });

    it('renders "subtitle:before" slot by default', async () => {
      const layout = html`<foxy-payment-card></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByName(element, 'subtitle:before')).to.have.property('localName', 'slot');
    });

    it('replaces "subtitle:before" slot with template "subtitle:before" if available', async () => {
      const name = 'subtitle:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentCard>(html`
        <foxy-payment-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-payment-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "subtitle:after" slot by default', async () => {
      const layout = html`<foxy-payment-card></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByName(element, 'subtitle:after')).to.have.property('localName', 'slot');
    });

    it('replaces "subtitle:after" slot with template "subtitle:after" if available', async () => {
      const name = 'subtitle:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentCard>(html`
        <foxy-payment-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-payment-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-payment-card></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByTestId(element, 'subtitle')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-payment-card hidden></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByTestId(element, 'subtitle')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "subtitle"', async () => {
      const layout = html`<foxy-payment-card hiddencontrols="subtitle"></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByTestId(element, 'subtitle')).to.not.exist;
    });
  });

  describe('card-info', () => {
    it('renders expiry date and last 4 digits if available', async () => {
      const data = await getTestData<Data>('./hapi/payments/0');

      data.cc_exp_month = '01';
      data.cc_exp_year = '2021';
      data.cc_number_masked = '************1234';

      const layout = html`<foxy-payment-card .data=${data}></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      const info = await getByTestId(element, 'card-info');

      expect(info).to.include.text('01/21');
      expect(info).to.include.text('1234');
    });

    it('renders "card-info:before" slot if card info exists', async () => {
      const data = await getTestData('./hapi/payments/0');
      const layout = html`<foxy-payment-card .data=${data}></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);

      expect(await getByName(element, 'card-info:before')).to.have.property('localName', 'slot');
    });

    it('replaces "card-info:before" slot with template "card-info:before" if available', async () => {
      const data = await getTestData('./hapi/payments/0');
      const name = 'card-info:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentCard>(html`
        <foxy-payment-card .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-payment-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "card-info:after" slot by default', async () => {
      const data = await getTestData('./hapi/payments/0');
      const layout = html`<foxy-payment-card .data=${data}></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByName(element, 'card-info:after')).to.have.property('localName', 'slot');
    });

    it('replaces "card-info:after" slot with template "card-info:after" if available', async () => {
      const data = await getTestData('./hapi/payments/0');
      const name = 'card-info:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentCard>(html`
        <foxy-payment-card .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-payment-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible if card info exists', async () => {
      const data = await getTestData('./hapi/payments/0');
      const layout = html`<foxy-payment-card .data=${data}></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByTestId(element, 'card-info')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const data = await getTestData('./hapi/payments/0');
      const layout = html`<foxy-payment-card .data=${data} hidden></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByTestId(element, 'card-info')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "card-info"', async () => {
      const layout = html`<foxy-payment-card hiddencontrols="card-info"></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      element.data = await getTestData('./hapi/payments/0');

      expect(await getByTestId(element, 'card-info')).to.not.exist;
    });
  });

  describe('fraud-risk', () => {
    it('renders fraud risk score once loaded', async () => {
      const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
      const layout = html`<foxy-payment-card @fetch=${handleFetch}></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);

      element.href = 'https://demo.api/hapi/payments/0';
      element.lang = 'es';
      element.ns = 'foo';

      await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

      const fraudRisk = (await getByTestId(element, 'fraud-risk')) as HTMLDivElement;
      const score = await getByKey(fraudRisk, 'fraud_risk');
      const scoreOptions = JSON.stringify({ score: element.data!.fraud_protection_score });

      expect(score).to.have.attribute('options', scoreOptions);
      expect(score).to.have.attribute('lang', 'es');
      expect(score).to.have.attribute('ns', 'foo');
    });

    it('renders "fraud-risk:before" slot by default', async () => {
      const layout = html`<foxy-payment-card></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByName(element, 'fraud-risk:before')).to.have.property('localName', 'slot');
    });

    it('replaces "fraud-risk:before" slot with template "fraud-risk:before" if available', async () => {
      const name = 'fraud-risk:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentCard>(html`
        <foxy-payment-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-payment-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "fraud-risk:after" slot by default', async () => {
      const layout = html`<foxy-payment-card></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByName(element, 'fraud-risk:after')).to.have.property('localName', 'slot');
    });

    it('replaces "fraud-risk:after" slot with template "fraud-risk:after" if available', async () => {
      const name = 'fraud-risk:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentCard>(html`
        <foxy-payment-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-payment-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-payment-card></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByTestId(element, 'fraud-risk')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-payment-card hidden></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByTestId(element, 'fraud-risk')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "fraud-risk"', async () => {
      const layout = html`<foxy-payment-card hiddencontrols="fraud-risk"></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByTestId(element, 'fraud-risk')).to.not.exist;
    });
  });

  describe('processor-response', () => {
    it('renders processor response once loaded', async () => {
      const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
      const layout = html`<foxy-payment-card @fetch=${handleFetch}></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);

      element.href = 'https://demo.api/hapi/payments/0';
      await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

      const response = (await getByTestId(element, 'processor-response')) as HTMLDivElement;
      expect(response).to.include.text(element.data!.processor_response);
    });

    it('renders "processor-response:before" slot by default', async () => {
      const layout = html`<foxy-payment-card></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      const slot = await getByName(element, 'processor-response:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "processor-response:before" slot with template "processor-response:before" if available', async () => {
      const name = 'processor-response:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentCard>(html`
        <foxy-payment-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-payment-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "processor-response:after" slot by default', async () => {
      const layout = html`<foxy-payment-card></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      const slot = await getByName(element, 'processor-response:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "processor-response:after" slot with template "processor-response:after" if available', async () => {
      const name = 'processor-response:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<PaymentCard>(html`
        <foxy-payment-card>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-payment-card>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-payment-card></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByTestId(element, 'processor-response')).to.exist;
    });

    it('is hidden when card is hidden', async () => {
      const layout = html`<foxy-payment-card hidden></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      expect(await getByTestId(element, 'processor-response')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes "processor-response"', async () => {
      const element = await fixture<PaymentCard>(html`<foxy-payment-card></foxy-payment-card>`);
      element.setAttribute('hiddencontrols', 'processor-response');
      expect(await getByTestId(element, 'processor-response')).to.not.exist;
    });
  });

  describe('spinner', () => {
    it('renders "empty" foxy-spinner by default', async () => {
      const layout = html`<foxy-payment-card lang="es"></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'empty');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'payment-card spinner');
    });

    it('renders "busy" foxy-spinner while loading', async () => {
      const layout = html`<foxy-payment-card href="/" lang="es"></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'payment-card spinner');
    });

    it('renders "error" foxy-spinner if loading fails', async () => {
      const layout = html`<foxy-payment-card href="/" lang="es"></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      const spinner = await getByTestId(element, 'spinner');
      const wrapper = spinner!.parentElement;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(wrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'payment-card spinner');
    });

    it('hides the spinner once loaded', async () => {
      const data = await getTestData('./hapi/payments/0');
      const layout = html`<foxy-payment-card .data=${data}></foxy-payment-card>`;
      const element = await fixture<PaymentCard>(layout);
      const spinner = await getByTestId(element, 'spinner');

      expect(spinner!.parentElement).to.have.class('opacity-0');
    });
  });
});
