import type { FetchEvent } from '../NucleonElement/FetchEvent';

import '../PaymentsApi/index';
import './index';

import { expect, fixture, waitUntil, html } from '@open-wc/testing';
import { PaymentsApiPaymentMethodCard as Card } from './PaymentsApiPaymentMethodCard';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { createRouter } from '../../../server/index';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { I18n } from '../I18n/I18n';
import { getByTag } from '../../../testgen/getByTag';

describe('PaymentsApiPaymentMethodCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and registers foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and registers foxy-internal-sandbox element', () => {
    expect(customElements.get('foxy-internal-sandbox')).to.equal(InternalSandbox);
  });

  it('imports and registers itself as foxy-payments-api-payment-method-card', () => {
    const constructor = customElements.get('foxy-payments-api-payment-method-card');
    expect(constructor).to.equal(Card);
  });

  it('has a default i18n namespace "payments-api-payment-method-card"', () => {
    expect(Card.defaultNS).to.equal('payments-api-payment-method-card');
  });

  it('has a reactive property .getImageSrc (null by default)', () => {
    expect(Card).to.have.nested.property('properties.getImageSrc');
    expect(Card).to.have.nested.property('properties.getImageSrc.attribute', false);
    expect(new Card()).to.have.property('getImageSrc', null);
  });

  it('extends TwoLineCard', () => {
    expect(new Card()).to.be.instanceOf(TwoLineCard);
  });

  it('renders payment method name in the title', async () => {
    const router = createRouter();
    const api = await fixture<HTMLDivElement>(html`
      <div @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        <foxy-payments-api
          payment-method-set-hosted-payment-gateways-url="https://demo.api/hapi/payment_method_set_hosted_payment_gateways"
          hosted-payment-gateways-helper-url="https://demo.api/hapi/property_helpers/1"
          hosted-payment-gateways-url="https://demo.api/hapi/hosted_payment_gateways"
          payment-gateways-helper-url="https://demo.api/hapi/property_helpers/0"
          payment-method-sets-url="https://demo.api/hapi/payment_method_sets"
          fraud-protections-url="https://demo.api/hapi/fraud_protections"
          payment-gateways-url="https://demo.api/hapi/payment_gateways"
        >
          <foxy-payments-api-payment-method-card
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-card>
        </foxy-payments-api>
      </div>
    `);

    const element = api.firstElementChild?.firstElementChild as Card;
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    expect(await getByTestId(element, 'title')).to.include.text(element.data!.helper.name);
  });

  it('renders payment method description in the subtitle', async () => {
    const router = createRouter();
    const api = await fixture<HTMLDivElement>(html`
      <div @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        <foxy-payments-api
          payment-method-set-hosted-payment-gateways-url="https://demo.api/hapi/payment_method_set_hosted_payment_gateways"
          hosted-payment-gateways-helper-url="https://demo.api/hapi/property_helpers/1"
          hosted-payment-gateways-url="https://demo.api/hapi/hosted_payment_gateways"
          payment-gateways-helper-url="https://demo.api/hapi/property_helpers/0"
          payment-method-sets-url="https://demo.api/hapi/payment_method_sets"
          fraud-protections-url="https://demo.api/hapi/fraud_protections"
          payment-gateways-url="https://demo.api/hapi/payment_gateways"
        >
          <foxy-payments-api-payment-method-card
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-card>
        </foxy-payments-api>
      </div>
    `);

    const element = api.firstElementChild?.firstElementChild as Card;
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    expect(await getByTestId(element, 'subtitle')).to.include.text(element.data!.description);
  });

  it('renders payment method image/logo if .getImageSrc is set', async () => {
    const router = createRouter();
    const api = await fixture<HTMLDivElement>(html`
      <div @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        <foxy-payments-api
          payment-method-set-hosted-payment-gateways-url="https://demo.api/hapi/payment_method_set_hosted_payment_gateways"
          hosted-payment-gateways-helper-url="https://demo.api/hapi/property_helpers/1"
          hosted-payment-gateways-url="https://demo.api/hapi/hosted_payment_gateways"
          payment-gateways-helper-url="https://demo.api/hapi/property_helpers/0"
          payment-method-sets-url="https://demo.api/hapi/payment_method_sets"
          fraud-protections-url="https://demo.api/hapi/fraud_protections"
          payment-gateways-url="https://demo.api/hapi/payment_gateways"
        >
          <foxy-payments-api-payment-method-card
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
            .getImageSrc=${(type: string) => `https://example.com/${type}.png`}
          >
          </foxy-payments-api-payment-method-card>
        </foxy-payments-api>
      </div>
    `);

    const element = api.firstElementChild?.firstElementChild as Card;
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    const image = await getByTag(element, 'img');
    expect(image).to.have.attribute('src', `https://example.com/${element.data!.type}.png`);
    expect(image).to.have.attribute('alt', 'image_alt');
  });
});
