import type { FetchEvent } from '../NucleonElement/FetchEvent';

import '../PaymentsApi/index';
import './index';

import { expect, fixture, waitUntil, html } from '@open-wc/testing';
import { PaymentsApiPaymentPresetCard } from './PaymentsApiPaymentPresetCard';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { createRouter } from '../../../server/index';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { getByKey } from '../../../testgen/getByKey';
import { I18n } from '../I18n/I18n';

describe('PaymentsApiPaymentPresetCard', () => {
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

  it('imports and registers itself as foxy-payments-api-payment-preset-card', () => {
    const constructor = customElements.get('foxy-payments-api-payment-preset-card');
    expect(constructor).to.equal(PaymentsApiPaymentPresetCard);
  });

  it('has a default i18n namespace "payments-api-payment-preset-card"', () => {
    expect(PaymentsApiPaymentPresetCard.defaultNS).to.equal('payments-api-payment-preset-card');
  });

  it('extends TwoLineCard', () => {
    expect(new PaymentsApiPaymentPresetCard()).to.be.instanceOf(TwoLineCard);
  });

  it('renders payment preset description in the title', async () => {
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
          <foxy-payments-api-payment-preset-card
            href="https://foxy-payments-api.element/payment_presets/0"
          >
          </foxy-payments-api-payment-preset-card>
        </foxy-payments-api>
      </div>
    `);

    const element = api.firstElementChild?.firstElementChild as PaymentsApiPaymentPresetCard;
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    expect(await getByTestId(element, 'title')).to.include.text(element.data!.description);
  });

  it('renders Live status in the subtitle for live presets', async () => {
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
          <foxy-payments-api-payment-preset-card
            href="https://foxy-payments-api.element/payment_presets/0"
          >
          </foxy-payments-api-payment-preset-card>
        </foxy-payments-api>
      </div>
    `);

    const element = api.firstElementChild?.firstElementChild as PaymentsApiPaymentPresetCard;
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    element.data = { ...element.data!, is_live: true };
    await element.requestUpdate();

    expect(await getByKey(element, 'status_live')).to.exist;
    expect(await getByKey(element, 'status_live')).to.have.attribute('infer', '');
  });

  it('renders Test status in the subtitle for test presets', async () => {
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
          <foxy-payments-api-payment-preset-card
            href="https://foxy-payments-api.element/payment_presets/0"
          >
          </foxy-payments-api-payment-preset-card>
        </foxy-payments-api>
      </div>
    `);

    const element = api.firstElementChild?.firstElementChild as PaymentsApiPaymentPresetCard;
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    element.data = { ...element.data!, is_live: false };
    await element.requestUpdate();

    expect(await getByKey(element, 'status_test')).to.exist;
    expect(await getByKey(element, 'status_test')).to.have.attribute('infer', '');
  });
});
