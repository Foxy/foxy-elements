import type { AvailableFraudProtections } from '../PaymentsApi/api/types';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import '../PaymentsApi/index';
import './index';

import { PaymentsApiFraudProtectionForm as Form } from './PaymentsApiFraudProtectionForm';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalSwitchControl } from '../../internal/InternalSwitchControl/InternalSwitchControl';
import { InternalNumberControl } from '../../internal/InternalNumberControl/InternalNumberControl';
import { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server/index';
import { getByTestId } from '../../../testgen/getByTestId';
import { getByTag } from '../../../testgen/getByTag';
import { getByKey } from '../../../testgen/getByKey';
import { I18n } from '../I18n/I18n';
import { stub } from 'sinon';
import { InternalSummaryControl } from '../../internal/InternalSummaryControl/InternalSummaryControl';

describe('PaymentsApiFraudProtectionForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines vaadin-button', () => {
    expect(customElements.get('vaadin-button')).to.exist;
  });

  it('imports and defines foxy-internal-summary-control', () => {
    const element = customElements.get('foxy-internal-summary-control');
    expect(element).to.equal(InternalSummaryControl);
  });

  it('imports and defines foxy-internal-switch-control', () => {
    const element = customElements.get('foxy-internal-switch-control');
    expect(element).to.equal(InternalSwitchControl);
  });

  it('imports and defines foxy-internal-number-control', () => {
    const element = customElements.get('foxy-internal-number-control');
    expect(element).to.equal(InternalNumberControl);
  });

  it('imports and defines foxy-internal-select-control', () => {
    const element = customElements.get('foxy-internal-select-control');
    expect(element).to.equal(InternalSelectControl);
  });

  it('imports and defines foxy-internal-text-control', () => {
    const element = customElements.get('foxy-internal-text-control');
    expect(element).to.equal(InternalTextControl);
  });

  it('imports and defines foxy-internal-form', () => {
    const element = customElements.get('foxy-internal-form');
    expect(element).to.equal(InternalForm);
  });

  it('imports and defines foxy-nucleon', () => {
    const element = customElements.get('foxy-nucleon');
    expect(element).to.equal(NucleonElement);
  });

  it('imports and defines foxy-i18n', () => {
    const element = customElements.get('foxy-i18n');
    expect(element).to.equal(I18n);
  });

  it('imports and defines itself as foxy-payments-api-fraud-protection-form', () => {
    const element = customElements.get('foxy-payments-api-fraud-protection-form');
    expect(element).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace "payments-api-fraud-protection-form"', () => {
    expect(Form).to.have.property('defaultNS', 'payments-api-fraud-protection-form');
    expect(new Form()).to.have.property('ns', 'payments-api-fraud-protection-form');
  });

  it('has a reactive property "getImageSrc"', () => {
    expect(new Form()).to.have.property('getImageSrc', null);
    expect(Form).to.have.nested.property('properties.getImageSrc');
    expect(Form).to.have.nested.property('properties.getImageSrc.attribute', false);
  });

  it('produces the description:v8n_too_long error if description is longer than 100 characters', () => {
    const form = new Form();

    form.edit({ description: 'A'.repeat(101) });
    expect(form.errors).to.include('description:v8n_too_long');

    form.edit({ description: 'A'.repeat(100) });
    expect(form.errors).to.not.include('description:v8n_too_long');
  });

  it('produces the type:v8n_required error if type is empty', () => {
    const form = new Form();
    expect(form.errors).to.include('type:v8n_required');

    form.edit({ type: 'minfraud' });
    expect(form.errors).to.not.include('type:v8n_required');
  });

  it('produces the json:v8n_invalid error if some of the required additional fields are empty', async () => {
    const availableProtections: AvailableFraudProtections = {
      _links: {
        self: { href: '' },
      },
      values: {
        foo: {
          name: 'Foo',
          uses_rejection_threshold: false,
          json: {
            blocks: [
              {
                id: 'bar',
                is_live: true,
                parent_id: 'foo',
                fields: [
                  {
                    id: 'baz',
                    name: 'Baz',
                    type: 'text',
                    description: 'Baz Description',
                    default_value: 'baz_default',
                    optional: false,
                  },
                ],
              },
            ],
          },
        },
      },
    };

    const router = createRouter();
    let isAvailableProtectionFetchComplete = false;

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
          <foxy-payments-api-fraud-protection-form
            parent="https://foxy-payments-api.element/payment_presets/0/fraud_protections"
            @fetch=${(evt: FetchEvent) => {
              if (evt.request.url.endsWith('/payment_presets/0/available_fraud_protections')) {
                evt.preventDefault();
                evt.respondWith(
                  Promise.resolve(new Response(JSON.stringify(availableProtections)))
                );
                isAvailableProtectionFetchComplete = true;
              }
            }}
          >
          </foxy-payments-api-fraud-protection-form>
        </foxy-payments-api>
      </div>
    `);

    const form = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => isAvailableProtectionFetchComplete, '', { timeout: 5000 });

    form.edit({ type: 'minfraud', helper: availableProtections.values.foo });
    expect(form.errors).to.include('json:v8n_invalid');

    form.edit({ json: JSON.stringify({ foo: { bar: { baz: 'test' } } }) });
    expect(form.errors).to.not.include('json:v8n_invalid');
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

  it('uses custom options for form header title', () => {
    const form = new Form();
    expect(form.headerTitleOptions).to.deep.equal({ context: 'new' });

    form.edit({ type: 'minfraud' });
    expect(form.headerTitleOptions).to.deep.equal({ context: 'minfraud' });
  });

  it('uses custom options for form header subtitle', async () => {
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
          <foxy-payments-api-fraud-protection-form
            href="https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0"
          >
          </foxy-payments-api-fraud-protection-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    expect(element.headerSubtitleOptions).to.deep.equal({ id: element.headerCopyIdValue });
  });

  it('renders a general summary control', async () => {
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
          <foxy-payments-api-fraud-protection-form
            href="https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0"
          >
          </foxy-payments-api-fraud-protection-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    await element.requestUpdate();
    const summary = element.renderRoot.querySelector('[infer="general"]');

    expect(summary).to.exist;
    expect(summary).to.be.instanceOf(InternalSummaryControl);
  });

  it('renders a setup summary control', async () => {
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
          <foxy-payments-api-fraud-protection-form
            href="https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0"
          >
          </foxy-payments-api-fraud-protection-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    await element.requestUpdate();
    const summary = element.renderRoot.querySelector('[infer="setup"]');

    expect(summary).to.exist;
    expect(summary).to.be.instanceOf(InternalSummaryControl);
  });

  it('renders a fraud protection selector when "type" is not present in form', async () => {
    const availableProtections: AvailableFraudProtections = {
      _links: {
        self: { href: '' },
      },
      values: {
        minfraud: {
          name: 'Minfraud',
          uses_rejection_threshold: true,
          json: null,
        },
        google_recaptcha: {
          name: 'Google reCaptcha',
          uses_rejection_threshold: false,
          conflict: { type: 'google_recaptcha', name: 'Google reCaptcha' },
          json: null,
        },
      },
    };

    const router = createRouter();

    const wrapper = await fixture(html`
      <div @fetch=${(evt: FetchEvent) => !evt.defaultPrevented && router.handleEvent(evt)}>
        <foxy-payments-api
          payment-method-set-hosted-payment-gateways-url="https://demo.api/hapi/payment_method_set_hosted_payment_gateways"
          hosted-payment-gateways-helper-url="https://demo.api/hapi/property_helpers/1"
          hosted-payment-gateways-url="https://demo.api/hapi/hosted_payment_gateways"
          payment-gateways-helper-url="https://demo.api/hapi/property_helpers/0"
          payment-method-sets-url="https://demo.api/hapi/payment_method_sets"
          fraud-protections-url="https://demo.api/hapi/fraud_protections"
          payment-gateways-url="https://demo.api/hapi/payment_gateways"
        >
          <foxy-payments-api-fraud-protection-form
            parent="https://foxy-payments-api.element/payment_presets/0/fraud_protections"
            .getImageSrc=${(type: string) => `https://example.com?${type}`}
            @fetch=${(evt: FetchEvent) => {
              if (evt.request.url.endsWith('/payment_presets/0/available_fraud_protections')) {
                evt.preventDefault();
                evt.respondWith(
                  Promise.resolve(new Response(JSON.stringify(availableProtections)))
                );
              }
            }}
          >
          </foxy-payments-api-fraud-protection-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(
      () => !!element.renderRoot.querySelector('[data-testid="select-protection-list"]'),
      '',
      { timeout: 5000 }
    );

    const listWrapper = (await getByTestId(element, 'select-protection-list')) as HTMLElement;
    await waitUntil(() => !!listWrapper.querySelector('button'), '', { timeout: 5000 });
    const items = listWrapper.querySelectorAll('button');

    expect(listWrapper).to.exist;
    expect(items).to.have.length(2);

    const item0Button = items[0] as HTMLButtonElement;
    const item1Button = items[1] as HTMLButtonElement;

    expect(item0Button).to.exist;
    expect(item0Button).to.not.have.attribute('disabled');
    expect(item0Button).to.not.have.attribute('title');
    expect(item0Button).to.include.text('Minfraud');
    expect(await getByTag(item0Button, 'img')).to.have.attribute(
      'src',
      'https://example.com?minfraud'
    );

    expect(item1Button).to.exist;
    expect(item1Button).to.have.attribute('disabled');
    expect(item1Button).to.have.attribute('title', 'conflict_message');
    expect(item1Button).to.include.text('Google reCaptcha');
    expect(await getByTag(item1Button, 'img')).to.have.attribute(
      'src',
      'https://example.com?google_recaptcha'
    );

    item0Button.click();
    await element.requestUpdate();

    expect(element).to.have.nested.property('form.type', 'minfraud');
    expect(await getByKey(element, 'select_method_title')).to.not.exist;
    expect(await getByTestId(element, 'select-method-list')).to.not.exist;
  });

  it('renders a switch control for a "checkbox" block in json if present', async () => {
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
          <foxy-payments-api-fraud-protection-form
            href="https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0"
          >
          </foxy-payments-api-fraud-protection-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.json = {
      blocks: [
        {
          id: 'bar',
          parent_id: 'foo',
          fields: [
            {
              id: 'baz',
              name: 'Baz',
              type: 'checkbox',
              description: 'Baz Description',
              default_value: 'baz_default',
            },
          ],
        },
      ],
    };

    element.data = { ...element.data! };
    await element.requestUpdate();

    const field = element.renderRoot.querySelector(
      '[infer="setup"] [infer="json-foo-bar-baz"]'
    ) as InternalSwitchControl;

    expect(field).to.exist;
    expect(field).to.be.instanceOf(InternalSwitchControl);
    expect(field).to.have.attribute('helper-text', 'Baz Description');
    expect(field).to.have.attribute('label', 'Baz');

    element.edit({ json: JSON.stringify({ foo: { bar: { baz: true } } }) });
    expect(field.getValue()).to.be.true;

    field.setValue(false);
    expect(JSON.parse(element.form.json!)).to.have.nested.property('foo.bar.baz', false);
  });

  it('renders a select control for a "select" block in json if present', async () => {
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
          <foxy-payments-api-fraud-protection-form
            href="https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0"
          >
          </foxy-payments-api-fraud-protection-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.json = {
      blocks: [
        {
          id: 'bar',
          parent_id: 'foo',
          fields: [
            {
              id: 'baz',
              name: 'Baz',
              type: 'select',
              description: 'Baz Description',
              default_value: 'baz_default',
              options: [
                { name: 'Field 1', value: 'field_1_value' },
                { name: 'Field 2', value: 'field_2_value' },
              ],
            },
          ],
        },
      ],
    };

    element.data = { ...element.data! };
    await element.requestUpdate();

    const field = element.renderRoot.querySelector(
      '[infer="setup"] [infer="json-foo-bar-baz"]'
    ) as InternalSelectControl;

    expect(field).to.exist;
    expect(field).to.be.instanceOf(InternalSelectControl);
    expect(field).to.have.attribute('helper-text', 'Baz Description');
    expect(field).to.have.attribute('layout', 'summary-item');
    expect(field).to.have.attribute('label', 'Baz');
    expect(field).to.have.deep.property('options', [
      { label: 'Field 1', value: 'field_1_value' },
      { label: 'Field 2', value: 'field_2_value' },
    ]);

    element.edit({ json: JSON.stringify({ foo: { bar: { baz: 'field_1_value' } } }) });
    expect(field.getValue()).to.deep.equal('field_1_value');

    field.setValue('field_2_value');
    expect(JSON.parse(element.form.json!)).to.have.nested.property('foo.bar.baz', 'field_2_value');
  });

  it('renders a text control for any other live block in additional fields if present', async () => {
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
          <foxy-payments-api-fraud-protection-form
            href="https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0"
          >
          </foxy-payments-api-fraud-protection-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.json = {
      blocks: [
        {
          id: 'bar',
          parent_id: 'foo',
          fields: [
            {
              id: 'baz',
              name: 'Baz',
              type: 'whatever',
              description: 'Baz Description',
              default_value: 'baz_default',
            },
          ],
        },
      ],
    };

    element.data = { ...element.data! };
    await element.requestUpdate();

    const field = element.renderRoot.querySelector(
      '[infer="setup"] [infer="json-foo-bar-baz"]'
    ) as InternalTextControl;

    expect(field).to.exist;
    expect(field).to.be.instanceOf(InternalTextControl);
    expect(field).to.have.attribute('placeholder', 'baz_default');
    expect(field).to.have.attribute('layout', 'summary-item');
    expect(field).to.have.attribute('helper-text', 'Baz Description');
    expect(field).to.have.attribute('label', 'Baz');

    element.edit({ json: JSON.stringify({ foo: { bar: { baz: 'test_value' } } }) });
    expect(field.getValue()).to.deep.equal('test_value');

    field.setValue('another_value');
    expect(JSON.parse(element.form.json!)).to.have.nested.property('foo.bar.baz', 'another_value');
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
          <foxy-payments-api-fraud-protection-form
            href="https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0"
          >
          </foxy-payments-api-fraud-protection-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="general"] [infer="description"]');

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders an integer control for "score-threshold-reject" if fraud protection uses rejection threshold', async () => {
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
          <foxy-payments-api-fraud-protection-form
            href="https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0"
          >
          </foxy-payments-api-fraud-protection-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    const root = element.renderRoot;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    expect(root.querySelector('[infer="score-threshold-reject"]')).to.not.exist;

    element.data!.helper.uses_rejection_threshold = true;
    element.data = { ...element.data! };
    await element.requestUpdate();

    const control = root.querySelector('[infer="score-threshold-reject"]');
    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalNumberControl);
  });

  it('renders a Back button clearing "type" on first selection', async () => {
    const availableProtections: AvailableFraudProtections = {
      _links: {
        self: { href: '' },
      },
      values: {
        foo: {
          name: 'Foo',
          uses_rejection_threshold: false,
          json: null,
        },
      },
    };

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
          <foxy-payments-api-fraud-protection-form
            parent="https://foxy-payments-api.element/payment_presets/0/fraud_protections"
            href="https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0"
            @fetch=${(evt: FetchEvent) => {
              if (evt.request.url.endsWith('/payment_presets/0/available_fraud_protections')) {
                evt.preventDefault();
                evt.respondWith(
                  Promise.resolve(new Response(JSON.stringify(availableProtections)))
                );
              }
            }}
          >
          </foxy-payments-api-fraud-protection-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    expect(await getByTestId(element, 'select-another-button')).to.not.exist;

    element.data = null;
    element.edit({ type: 'minfraud' });
    await element.requestUpdate();
    const control = (await getByTestId(element, 'select-another-button')) as InternalSwitchControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(customElements.get('vaadin-button'));

    const label = control.querySelector('foxy-i18n');
    expect(label).to.have.attribute('infer', '');
    expect(label).to.have.attribute('key', 'select_another_button_label');

    control.click();
    await element.requestUpdate();

    expect(element).to.not.have.nested.property('form.type');
    expect(element.renderRoot.querySelector('[infer="select-another-button"]')).to.not.exist;
  });
});
