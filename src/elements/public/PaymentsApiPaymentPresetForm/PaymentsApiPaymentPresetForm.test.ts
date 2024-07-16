import type { ItemRenderer } from '../CollectionPage/types';
import type { FormRenderer } from '../FormDialog/types';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import '../PaymentsApi/index';
import './index';

import { PaymentsApiPaymentPresetForm as Form } from './PaymentsApiPaymentPresetForm';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { PaymentsApiFraudProtectionCard } from '../PaymentsApiFraudProtectionCard/PaymentsApiFraudProtectionCard';
import { PaymentsApiFraudProtectionForm } from '../PaymentsApiFraudProtectionForm/PaymentsApiFraudProtectionForm';
import { PaymentsApiPaymentMethodCard } from '../PaymentsApiPaymentMethodCard/PaymentsApiPaymentMethodCard';
import { PaymentsApiPaymentMethodForm } from '../PaymentsApiPaymentMethodForm/PaymentsApiPaymentMethodForm';
import { InternalCheckboxGroupControl } from '../../internal/InternalCheckboxGroupControl/InternalCheckboxGroupControl';
import { InternalAsyncListControl } from '../../internal/InternalAsyncListControl/InternalAsyncListControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server/index';
import { FormDialog } from '../FormDialog';
import { spread } from '@open-wc/lit-helpers';
import { fake, stub } from 'sinon';

describe('PaymentsApiPaymentPresetForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-checkbox-group-control', () => {
    const element = customElements.get('foxy-internal-checkbox-group-control');
    expect(element).to.equal(InternalCheckboxGroupControl);
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

  it('renders a text control for description', async () => {
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
    const control = element.renderRoot.querySelector('[infer="description"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a checkbox control for live credentials toggle', async () => {
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
      '[infer="is-live"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [{ label: 'option_live', value: 'live' }]);

    element.edit({ is_live: false });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['test']);

    element.edit({ is_live: true });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['live']);
  });

  it('renders a checkbox control for purchase order toggle', async () => {
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
      '[infer="is-purchase-order-enabled"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [{ label: 'option_true', value: 'true' }]);

    element.edit({ is_purchase_order_enabled: false });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal([]);

    element.edit({ is_purchase_order_enabled: true });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['true']);
  });

  it('renders an async list control for payment methods', async () => {
    const getPaymentMethodImageSrc = fake();
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
            .getPaymentMethodImageSrc=${getPaymentMethodImageSrc}
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

    const handleUpdate = fake();
    const handleFetch = fake();
    const dialog = new FormDialog();

    dialog.parent = 'https://example.com/parent';
    dialog.href = 'https://example.com/href';

    const form = await fixture(
      (control.form as FormRenderer)({ html, spread, dialog, handleFetch, handleUpdate })
    );

    expect(form).to.be.instanceOf(PaymentsApiPaymentMethodForm);
    expect(form).to.have.attribute('parent', 'https://example.com/parent');
    expect(form).to.have.attribute('infer', 'payments-api-payment-method-form');
    expect(form).to.have.attribute('href', 'https://example.com/href');
    expect(form).to.have.property('getImageSrc', getPaymentMethodImageSrc);

    handleUpdate.resetHistory();
    form.dispatchEvent(new CustomEvent('update'));
    expect(handleUpdate).to.have.been.called;

    handleFetch.resetHistory();
    form.dispatchEvent(new CustomEvent('fetch'));
    expect(handleFetch).to.have.been.called;

    const item = await fixture(
      (control.item as ItemRenderer)({
        simplifyNsLoading: false,
        readonlyControls: new BooleanSelector(''),
        disabledControls: new BooleanSelector(''),
        hiddenControls: new BooleanSelector(''),
        templates: {},
        readonly: false,
        disabled: false,
        previous: null,
        related: [],
        hidden: false,
        parent: 'https://example.com/parent',
        spread,
        props: {},
        group: '',
        html,
        lang: 'en',
        href: 'https://example.com/href',
        data: null,
        next: null,
        ns: 'test',
      })
    );

    expect(item).to.be.instanceOf(PaymentsApiPaymentMethodCard);
    expect(item).to.have.attribute('parent', 'https://example.com/parent');
    expect(item).to.have.attribute('infer', 'payments-api-payment-method-card');
    expect(item).to.have.attribute('href', 'https://example.com/href');
    expect(item).to.have.property('getImageSrc', getPaymentMethodImageSrc);
  });

  it('renders an async list control for fraud protections', async () => {
    const getFraudProtectionImageSrc = fake();
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
            .getFraudProtectionImageSrc=${getFraudProtectionImageSrc}
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

    const handleUpdate = fake();
    const handleFetch = fake();
    const dialog = new FormDialog();

    dialog.parent = 'https://example.com/parent';
    dialog.href = 'https://example.com/href';

    const form = await fixture(
      (control.form as FormRenderer)({ html, spread, dialog, handleFetch, handleUpdate })
    );

    expect(form).to.be.instanceOf(PaymentsApiFraudProtectionForm);
    expect(form).to.have.attribute('parent', 'https://example.com/parent');
    expect(form).to.have.attribute('infer', 'payments-api-fraud-protection-form');
    expect(form).to.have.attribute('href', 'https://example.com/href');
    expect(form).to.have.property('getImageSrc', getFraudProtectionImageSrc);

    handleUpdate.resetHistory();
    form.dispatchEvent(new CustomEvent('update'));
    expect(handleUpdate).to.have.been.called;

    handleFetch.resetHistory();
    form.dispatchEvent(new CustomEvent('fetch'));
    expect(handleFetch).to.have.been.called;

    const item = await fixture(
      (control.item as ItemRenderer)({
        simplifyNsLoading: false,
        readonlyControls: new BooleanSelector(''),
        disabledControls: new BooleanSelector(''),
        hiddenControls: new BooleanSelector(''),
        templates: {},
        readonly: false,
        disabled: false,
        previous: null,
        related: [],
        hidden: false,
        parent: 'https://example.com/parent',
        spread,
        props: {},
        group: '',
        html,
        lang: 'en',
        href: 'https://example.com/href',
        data: null,
        next: null,
        ns: 'test',
      })
    );

    expect(item).to.be.instanceOf(PaymentsApiFraudProtectionCard);
    expect(item).to.have.attribute('parent', 'https://example.com/parent');
    expect(item).to.have.attribute('infer', 'payments-api-fraud-protection-card');
    expect(item).to.have.attribute('href', 'https://example.com/href');
    expect(item).to.have.property('getImageSrc', getFraudProtectionImageSrc);
  });
});
