import type { FetchEvent } from '../NucleonElement/FetchEvent';

import '../PaymentsApi/index';
import './index';

import { PaymentsApiPaymentPresetForm as Form } from './PaymentsApiPaymentPresetForm';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { PaymentsApiFraudProtectionCard } from '../PaymentsApiFraudProtectionCard/PaymentsApiFraudProtectionCard';
import { PaymentsApiFraudProtectionForm } from '../PaymentsApiFraudProtectionForm/PaymentsApiFraudProtectionForm';
import { PaymentsApiPaymentMethodCard } from '../PaymentsApiPaymentMethodCard/PaymentsApiPaymentMethodCard';
import { PaymentsApiPaymentMethodForm } from '../PaymentsApiPaymentMethodForm/PaymentsApiPaymentMethodForm';
import { InternalAsyncListControl } from '../../internal/InternalAsyncListControl/InternalAsyncListControl';
import { InternalSummaryControl } from '../../internal/InternalSummaryControl/InternalSummaryControl';
import { InternalSwitchControl } from '../../internal/InternalSwitchControl/InternalSwitchControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server/index';
import { fake, stub } from 'sinon';

describe('PaymentsApiPaymentPresetForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-switch-control', () => {
    const element = customElements.get('foxy-internal-switch-control');
    expect(element).to.equal(InternalSwitchControl);
  });

  it('imports and defines foxy-internal-summary-control', () => {
    const element = customElements.get('foxy-internal-summary-control');
    expect(element).to.equal(InternalSummaryControl);
  });

  it('imports and defines foxy-internal-async-list-control', () => {
    const element = customElements.get('foxy-internal-async-list-control');
    expect(element).to.equal(InternalAsyncListControl);
  });

  it('imports and defines foxy-internal-text-control', () => {
    const element = customElements.get('foxy-internal-text-control');
    expect(element).to.equal(InternalTextControl);
  });

  it('imports and defines foxy-internal-form', () => {
    const element = customElements.get('foxy-internal-form');
    expect(element).to.equal(InternalForm);
  });

  it('imports and defines foxy-payments-api-fraud-protection-card', () => {
    const element = customElements.get('foxy-payments-api-fraud-protection-card');
    expect(element).to.equal(PaymentsApiFraudProtectionCard);
  });

  it('imports and defines foxy-payments-api-fraud-protection-form', () => {
    const element = customElements.get('foxy-payments-api-fraud-protection-form');
    expect(element).to.equal(PaymentsApiFraudProtectionForm);
  });

  it('imports and defines foxy-payments-api-payment-method-card', () => {
    const element = customElements.get('foxy-payments-api-payment-method-card');
    expect(element).to.equal(PaymentsApiPaymentMethodCard);
  });

  it('imports and defines foxy-payments-api-payment-method-form', () => {
    const element = customElements.get('foxy-payments-api-payment-method-form');
    expect(element).to.equal(PaymentsApiPaymentMethodForm);
  });

  it('imports and defines itself as foxy-payments-api-payment-preset-form', () => {
    const element = customElements.get('foxy-payments-api-payment-preset-form');
    expect(element).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace "payments-api-payment-preset-form"', () => {
    expect(Form).to.have.property('defaultNS', 'payments-api-payment-preset-form');
    expect(new Form()).to.have.property('ns', 'payments-api-payment-preset-form');
  });

  it('has a reactive property "getFraudProtectionImageSrc"', () => {
    expect(new Form()).to.have.property('getFraudProtectionImageSrc', null);
    expect(Form).to.have.nested.property('properties.getFraudProtectionImageSrc');
    expect(Form).to.have.nested.property('properties.getFraudProtectionImageSrc.attribute', false);
  });

  it('has a reactive property "getPaymentMethodImageSrc"', () => {
    expect(new Form()).to.have.property('getPaymentMethodImageSrc', null);
    expect(Form).to.have.nested.property('properties.getPaymentMethodImageSrc');
    expect(Form).to.have.nested.property('properties.getPaymentMethodImageSrc.attribute', false);
  });

  it('produces the description:v8n_required error if description is empty', () => {
    const form = new Form();

    form.edit({ description: '' });
    expect(form.errors).to.include('description:v8n_required');

    form.edit({ description: 'Test' });
    expect(form.errors).to.not.include('description:v8n_required');
  });

  it('produces the description:v8n_too_long error if description is longer than 100 characters', () => {
    const form = new Form();

    form.edit({ description: 'A'.repeat(101) });
    expect(form.errors).to.include('description:v8n_too_long');

    form.edit({ description: 'A'.repeat(100) });
    expect(form.errors).to.not.include('description:v8n_too_long');
  });

  it('renders a form header', async () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('always hides Copy JSON button in the header', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('header:copy-json', true)).to.be.true;
  });

  it('hides Payment Methods and Fraud Protections when there is no data', async () => {
    const router = createRouter();
    const wrapper = await fixture(html`
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
          <foxy-payments-api-payment-preset-form> </foxy-payments-api-payment-preset-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;

    expect(element.hiddenSelector.matches('fraud-protections', true)).to.be.true;
    expect(element.hiddenSelector.matches('payment-methods', true)).to.be.true;

    element.href = 'https://foxy-payments-api.element/payment_presets/0';
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    expect(element.hiddenSelector.matches('fraud-protections', true)).to.be.false;
    expect(element.hiddenSelector.matches('payment-methods', true)).to.be.false;
  });

  it('renders a summary control for general settings', async () => {
    const router = createRouter();
    const wrapper = await fixture(html`
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
          <foxy-payments-api-payment-preset-form
            href="https://foxy-payments-api.element/payment_presets/0"
          >
          </foxy-payments-api-payment-preset-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="general"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSummaryControl);
  });

  it('renders a text control for description inside of the General section', async () => {
    const router = createRouter();
    const wrapper = await fixture(html`
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
          <foxy-payments-api-payment-preset-form
            href="https://foxy-payments-api.element/payment_presets/0"
          >
          </foxy-payments-api-payment-preset-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="general"] [infer="description"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a switch control for live credentials toggle inside of the General section', async () => {
    const router = createRouter();
    const wrapper = await fixture(html`
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
          <foxy-payments-api-payment-preset-form
            href="https://foxy-payments-api.element/payment_presets/0"
          >
          </foxy-payments-api-payment-preset-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const control = element.renderRoot.querySelector(
      '[infer="general"] [infer="is-live"]'
    ) as InternalSwitchControl;
    expect(control).to.be.instanceOf(InternalSwitchControl);
  });

  it('renders a switch control for purchase order toggle inside of the General section', async () => {
    const router = createRouter();
    const wrapper = await fixture(html`
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
          <foxy-payments-api-payment-preset-form
            href="https://foxy-payments-api.element/payment_presets/0"
          >
          </foxy-payments-api-payment-preset-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="general"] [infer="is-purchase-order-enabled"]'
    ) as InternalSwitchControl;

    expect(control).to.be.instanceOf(InternalSwitchControl);
  });

  it('renders an async list control for payment methods', async () => {
    const getImageSrc = fake();
    const router = createRouter();
    const wrapper = await fixture(html`
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
          <foxy-payments-api-payment-preset-form
            href="https://foxy-payments-api.element/payment_presets/0"
            .getPaymentMethodImageSrc=${getImageSrc}
          >
          </foxy-payments-api-payment-preset-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="payment-methods"]'
    ) as InternalAsyncListControl;

    expect(control).to.be.instanceOf(InternalAsyncListControl);
    expect(control).to.have.attribute('first', element.data?._links['fx:payment_methods'].href);
    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('item', 'foxy-payments-api-payment-method-card');
    expect(control).to.have.attribute('form', 'foxy-payments-api-payment-method-form');
    expect(control).to.have.deep.property('itemProps', { '.getImageSrc': getImageSrc });
    expect(control).to.have.deep.property('formProps', { '.getImageSrc': getImageSrc });
  });

  it('renders an async list control for fraud protections', async () => {
    const getImageSrc = fake();
    const router = createRouter();
    const wrapper = await fixture(html`
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
          <foxy-payments-api-payment-preset-form
            href="https://foxy-payments-api.element/payment_presets/0"
            .getFraudProtectionImageSrc=${getImageSrc}
          >
          </foxy-payments-api-payment-preset-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="fraud-protections"]'
    ) as InternalAsyncListControl;

    expect(control).to.be.instanceOf(InternalAsyncListControl);
    expect(control).to.have.attribute('first', element.data?._links['fx:fraud_protections'].href);
    expect(control).to.have.attribute('limit', '5');
    expect(control).to.have.attribute('item', 'foxy-payments-api-fraud-protection-card');
    expect(control).to.have.attribute('form', 'foxy-payments-api-fraud-protection-form');
    expect(control).to.have.deep.property('itemProps', { '.getImageSrc': getImageSrc });
    expect(control).to.have.deep.property('formProps', { '.getImageSrc': getImageSrc });
  });
});
