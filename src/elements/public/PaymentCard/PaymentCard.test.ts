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

describe('PaymentCard', () => {
  it('imports and defines foxy-internal-card', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('imports and defines foxy-nucleon', () => {
    expect(customElements.get('foxy-nucleon')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('defines itself as foxy-payment-card', () => {
    expect(customElements.get('foxy-payment-card')).to.equal(PaymentCard);
  });

  it('has a default i18next namespace of "payment-card"', () => {
    expect(PaymentCard).to.have.property('defaultNS', 'payment-card');
    expect(new PaymentCard()).to.have.property('ns', 'payment-card');
  });

  it('has a reactive property hostedPaymentGatewaysHelper', () => {
    expect(PaymentCard).to.have.deep.nested.property('properties.hostedPaymentGatewaysHelper', {
      attribute: 'hosted-payment-gateways-helper',
    });
    expect(new PaymentCard()).to.have.property('hostedPaymentGatewaysHelper', null);
  });

  it('has a reactive property paymentGatewaysHelper', () => {
    expect(PaymentCard).to.have.deep.nested.property('properties.paymentGatewaysHelper', {
      attribute: 'payment-gateways-helper',
    });
    expect(new PaymentCard()).to.have.property('paymentGatewaysHelper', null);
  });

  it('renders payment amount once loaded', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-payment-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-payment-card>
    `;

    const element = await fixture<PaymentCard>(layout);
    const data = await getTestData<Data>('./hapi/payments/0');
    const store = await getTestData<Resource<Rels.Store>>(data._links['fx:store'].href);
    const transaction = await getTestData<Resource<Rels.Transaction>>(
      data._links['fx:transaction'].href
    );

    data.amount = 25;
    element.data = data;
    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });

    const line1 = await getByTestId(element, 'line-1');
    const price = await getByKey(line1!, 'price');

    expect(price).to.have.property('infer', '');
    expect(price).to.have.deep.property('options', {
      currencyDisplay: store.use_international_currency_symbol ? 'code' : 'symbol',
      amount: `25 ${transaction.currency_code}`,
    });
  });

  it('renders payment date once loaded', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-payment-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-payment-card>
    `;

    const element = await fixture<PaymentCard>(layout);
    const data = await getTestData<Data>('./hapi/payments/0');

    data.date_created = '2021-09-15T00:00:00Z';
    element.data = data;
    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });

    const line1 = await getByTestId(element, 'line-1');
    const date = await getByKey(line1!, 'date');

    expect(date).to.have.property('infer', '');
    expect(date).to.have.deep.property('options', { value: data.date_created });
  });

  it('renders payment gateway name once loaded', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-payment-card
        hosted-payment-gateways-helper="https://demo.api/hapi/property_helpers/1"
        payment-gateways-helper="https://demo.api/hapi/property_helpers/0"
        href="https://demo.api/hapi/payments/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-payment-card>
    `;

    const element = await fixture<PaymentCard>(layout);
    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });

    expect(element.renderRoot).to.include.text('Authorize.net AIM');
  });

  it('renders processor response if present', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-payment-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-payment-card>
    `;

    const element = await fixture<PaymentCard>(layout);
    const data = await getTestData<Data>('./hapi/payments/0');

    data.processor_response = 'Test processor response';
    element.data = data;
    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });

    const label = await getByKey(element, 'processor_response');

    expect(label).to.exist;
    expect(label).to.have.property('infer', '');
    expect(label).to.have.deep.property('options', data);
  });

  it('renders paypal payer id if present', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-payment-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-payment-card>
    `;

    const element = await fixture<PaymentCard>(layout);
    const data = await getTestData<Data>('./hapi/payments/0');

    data.paypal_payer_id = 'Test paypal payer id';
    element.data = data;
    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });

    const label = await getByKey(element, 'paypal_payer_id');

    expect(label).to.exist;
    expect(label).to.have.property('infer', '');
    expect(label).to.have.deep.property('options', data);
  });

  it('renders third party id if present', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-payment-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-payment-card>
    `;

    const element = await fixture<PaymentCard>(layout);
    const data = await getTestData<Data>('./hapi/payments/0');

    data.third_party_id = 'Test third party id';
    element.data = data;
    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });

    const label = await getByKey(element, 'third_party_id');

    expect(label).to.exist;
    expect(label).to.have.property('infer', '');
    expect(label).to.have.deep.property('options', data);
  });

  it('renders purchase order if present', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-payment-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-payment-card>
    `;

    const element = await fixture<PaymentCard>(layout);
    const data = await getTestData<Data>('./hapi/payments/0');

    data.purchase_order = 'Test purchase order';
    element.data = data;
    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });

    const label = await getByKey(element, 'purchase_order');

    expect(label).to.exist;
    expect(label).to.have.property('infer', '');
    expect(label).to.have.deep.property('options', data);
  });

  it('renders card details once loaded', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-payment-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-payment-card>
    `;

    const element = await fixture<PaymentCard>(layout);
    const data = await getTestData<Data>('./hapi/payments/0');

    data.cc_type = 'Visa';
    data.cc_exp_year = '2024';
    data.cc_exp_month = '12';
    data.cc_number_masked = '************1234';
    element.data = data;
    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });

    expect(element.renderRoot).to.include.text('1234');
    expect(element.renderRoot).to.include.text('12/24');
  });

  it('renders fraud protection score once loaded', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-payment-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-payment-card>
    `;

    const element = await fixture<PaymentCard>(layout);
    const data = await getTestData<Data>('./hapi/payments/0');

    data.fraud_protection_score = 100;
    element.data = data;
    await waitUntil(() => !!element.isBodyReady, undefined, { timeout: 5000 });

    const score = await getByKey(element, 'fraud_risk');

    expect(score).to.exist;
    expect(score).to.have.property('infer', '');
    expect(score).to.have.deep.property('options', { score: 100 });
  });
});
