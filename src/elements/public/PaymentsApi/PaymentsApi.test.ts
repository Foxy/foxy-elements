import type { NucleonElement } from '../NucleonElement/NucleonElement';

import '../NucleonElement/index';
import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/router/createRouter';
import { getTestData } from '../../../testgen/getTestData';
import { PaymentsApi } from './PaymentsApi';
import { LitElement } from 'lit-element';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { defaults } from '../../../server/hapi/defaults';
import { links } from '../../../server/hapi/links';

describe('PaymentsApi', () => {
  it('imports and defines itself as foxy-payments-api', () => {
    const localName = 'foxy-payments-api';
    const element = customElements.get(localName);
    expect(element).to.equal(PaymentsApi);
  });

  it('extends LitElement', () => {
    expect(new PaymentsApi()).to.be.instanceOf(LitElement);
  });

  it('has a reactive property paymentMethodSetHostedPaymentGatewaysUrl', () => {
    expect(PaymentsApi).to.have.nested.property(
      'properties.paymentMethodSetHostedPaymentGatewaysUrl'
    );

    expect(PaymentsApi).to.have.nested.property(
      'properties.paymentMethodSetHostedPaymentGatewaysUrl.attribute',
      'payment-method-set-hosted-payment-gateways-url'
    );

    expect(PaymentsApi).to.not.have.nested.property(
      'properties.paymentMethodSetHostedPaymentGatewaysUrl.type'
    );

    expect(new PaymentsApi()).to.have.property('paymentMethodSetHostedPaymentGatewaysUrl', null);
  });

  it('has a reactive property hostedPaymentGatewaysHelperUrl', () => {
    expect(PaymentsApi).to.have.nested.property('properties.hostedPaymentGatewaysHelperUrl');
    expect(PaymentsApi).to.have.nested.property(
      'properties.hostedPaymentGatewaysHelperUrl.attribute',
      'hosted-payment-gateways-helper-url'
    );

    expect(PaymentsApi).to.not.have.nested.property(
      'properties.hostedPaymentGatewaysHelperUrl.type'
    );

    expect(new PaymentsApi()).to.have.property('hostedPaymentGatewaysHelperUrl', null);
  });

  it('has a reactive property hostedPaymentGatewaysUrl', () => {
    expect(PaymentsApi).to.have.nested.property('properties.hostedPaymentGatewaysUrl');
    expect(PaymentsApi).to.have.nested.property(
      'properties.hostedPaymentGatewaysUrl.attribute',
      'hosted-payment-gateways-url'
    );

    expect(PaymentsApi).to.not.have.nested.property('properties.hostedPaymentGatewaysUrl.type');
    expect(new PaymentsApi()).to.have.property('hostedPaymentGatewaysUrl', null);
  });

  it('has a reactive property paymentGatewaysHelperUrl', () => {
    expect(PaymentsApi).to.have.nested.property('properties.paymentGatewaysHelperUrl');
    expect(PaymentsApi).to.have.nested.property(
      'properties.paymentGatewaysHelperUrl.attribute',
      'payment-gateways-helper-url'
    );

    expect(PaymentsApi).to.not.have.nested.property('properties.paymentGatewaysHelperUrl.type');
    expect(new PaymentsApi()).to.have.property('paymentGatewaysHelperUrl', null);
  });

  it('has a reactive property paymentMethodSetsUrl', () => {
    expect(PaymentsApi).to.have.nested.property('properties.paymentMethodSetsUrl');
    expect(PaymentsApi).to.have.nested.property(
      'properties.paymentMethodSetsUrl.attribute',
      'payment-method-sets-url'
    );

    expect(PaymentsApi).to.not.have.nested.property('properties.paymentMethodSetsUrl.type');
    expect(new PaymentsApi()).to.have.property('paymentMethodSetsUrl', null);
  });

  it('has a reactive property fraudProtectionsUrl', () => {
    expect(PaymentsApi).to.have.nested.property('properties.fraudProtectionsUrl');
    expect(PaymentsApi).to.have.nested.property(
      'properties.fraudProtectionsUrl.attribute',
      'fraud-protections-url'
    );

    expect(PaymentsApi).to.not.have.nested.property('properties.fraudProtectionsUrl.type');
    expect(new PaymentsApi()).to.have.property('fraudProtectionsUrl', null);
  });

  it('has a reactive property paymentGatewaysUrl', () => {
    expect(PaymentsApi).to.have.nested.property('properties.paymentGatewaysUrl');
    expect(PaymentsApi).to.have.nested.property(
      'properties.paymentGatewaysUrl.attribute',
      'payment-gateways-url'
    );

    expect(PaymentsApi).to.not.have.nested.property('properties.paymentGatewaysUrl.type');
    expect(new PaymentsApi()).to.have.property('paymentGatewaysUrl', null);
  });

  it('has no shadow root', () => {
    expect(new PaymentsApi()).to.have.property('shadowRoot', null);
  });

  it('ignores fetch events that are not an instance of NucleonElement.FetchEvent', async () => {
    const wrapper = await fixture(html`
      <div>
        <foxy-payments-api>
          <div></div>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const eventTarget = api.firstElementChild as Element;
    const event = new CustomEvent('fetch', { bubbles: true, cancelable: true });

    eventTarget.dispatchEvent(event);

    expect(event).to.have.property('defaultPrevented', false);
  });

  it('ignores fetch events where request url does not start with https://foxy-payments-api.element/', async () => {
    const wrapper = await fixture(html`
      <div>
        <foxy-payments-api>
          <div></div>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const eventTarget = api.firstElementChild as Element;
    const event = new FetchEvent('fetch', {
      cancelable: true,
      bubbles: true,
      request: new Request('https://demo.api/hapi/transactions'),
      resolve: response => void response,
      reject: err => void err,
    });

    eventTarget.dispatchEvent(event);

    expect(event).to.have.property('defaultPrevented', false);
  });

  it('handles GET requests to the fx:payment_presets collection', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            payment_gateway_id: 0,
            gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
          {
            id: 1,
            store_id: 0,
            gateway_uri: '',
            description: 'Empty Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon href="https://foxy-payments-api.element/payment_presets"></foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    expect(nucleon).to.have.deep.property('data', {
      _embedded: {
        'fx:payment_presets': [
          {
            _links: {
              'fx:available_fraud_protections': {
                href: 'https://foxy-payments-api.element/payment_presets/0/available_fraud_protections',
              },
              'fx:available_payment_methods': {
                href: 'https://foxy-payments-api.element/payment_presets/0/available_payment_methods',
              },
              'fx:fraud_protections': {
                href: 'https://foxy-payments-api.element/payment_presets/0/fraud_protections',
              },
              'fx:payment_methods': {
                href: 'https://foxy-payments-api.element/payment_presets/0/payment_methods',
              },
              'fx:store': {
                href: 'https://demo.api/hapi/stores/0',
              },
              'self': {
                href: 'https://foxy-payments-api.element/payment_presets/0',
              },
            },
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
            description: 'Default Payment Method Set',
            gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
            id: 0,
            is_live: false,
            is_purchase_order_enabled: true,
            payment_gateway_id: 0,
            store_id: 0,
          },
          {
            _links: {
              'fx:available_fraud_protections': {
                href: 'https://foxy-payments-api.element/payment_presets/1/available_fraud_protections',
              },
              'fx:available_payment_methods': {
                href: 'https://foxy-payments-api.element/payment_presets/1/available_payment_methods',
              },
              'fx:fraud_protections': {
                href: 'https://foxy-payments-api.element/payment_presets/1/fraud_protections',
              },
              'fx:payment_methods': {
                href: 'https://foxy-payments-api.element/payment_presets/1/payment_methods',
              },
              'fx:store': { href: 'https://demo.api/hapi/stores/0' },
              'self': { href: 'https://foxy-payments-api.element/payment_presets/1' },
            },
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
            description: 'Empty Payment Method Set',
            gateway_uri: '',
            id: 1,
            is_live: false,
            is_purchase_order_enabled: true,
            store_id: 0,
          },
        ],
      },
      _links: {
        first: { href: 'https://foxy-payments-api.element/payment_presets?offset=0' },
        last: { href: 'https://foxy-payments-api.element/payment_presets?offset=0' },
        next: { href: 'https://foxy-payments-api.element/payment_presets?offset=2' },
        prev: { href: 'https://foxy-payments-api.element/payment_presets?offset=0' },
        self: { href: 'https://foxy-payments-api.element/payment_presets' },
      },
      limit: 20,
      offset: 0,
      returned_items: 2,
      total_items: 2,
    });
  });

  it('handles POST requests to the fx:payment_presets collection', async () => {
    const router = createRouter({
      defaults,
      dataset: { payment_method_sets: [] },
      links,
    });

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
          <foxy-nucleon
            parent="https://foxy-payments-api.element/payment_presets?store_id=0&payment_gateway_id=0"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;

    nucleon.edit({
      gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
      description: 'Default Payment Method Set',
      is_live: false,
      is_purchase_order_enabled: true,
      date_created: '2012-08-10T11:58:54-0700',
      date_modified: '2012-08-10T11:58:54-0700',
    });

    nucleon.submit();
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    const props = await getTestData('./hapi/payment_method_sets/0', router);
    delete (props as Record<PropertyKey, unknown>)._links;

    expect(props).to.deep.equal({
      date_created: '2012-08-10T11:58:54-0700',
      date_modified: '2012-08-10T11:58:54-0700',
      description: 'Default Payment Method Set',
      gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
      id: 0,
      is_live: false,
      is_purchase_order_enabled: true,
      payment_gateway_id: 0,
      store_id: 0,
    });
  });

  it('handles GET requests to the fx:payment_preset resources', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            payment_gateway_id: 0,
            gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon href="https://foxy-payments-api.element/payment_presets/0"></foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    expect(nucleon).to.have.deep.property('data', {
      _links: {
        'fx:available_fraud_protections': {
          href: 'https://foxy-payments-api.element/payment_presets/0/available_fraud_protections',
        },
        'fx:available_payment_methods': {
          href: 'https://foxy-payments-api.element/payment_presets/0/available_payment_methods',
        },
        'fx:fraud_protections': {
          href: 'https://foxy-payments-api.element/payment_presets/0/fraud_protections',
        },
        'fx:payment_methods': {
          href: 'https://foxy-payments-api.element/payment_presets/0/payment_methods',
        },
        'fx:store': {
          href: 'https://demo.api/hapi/stores/0',
        },
        'self': {
          href: 'https://foxy-payments-api.element/payment_presets/0',
        },
      },
      date_created: '2012-08-10T11:58:54-0700',
      date_modified: '2012-08-10T11:58:54-0700',
      description: 'Default Payment Method Set',
      gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
      id: 0,
      is_live: false,
      is_purchase_order_enabled: true,
      payment_gateway_id: 0,
      store_id: 0,
    });
  });

  it('handles PATCH requests to the fx:payment_preset resources', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            payment_gateway_id: 0,
            gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon href="https://foxy-payments-api.element/payment_presets/0"></foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    nucleon.edit({ description: 'Test' });
    nucleon.submit();
    await waitUntil(() => nucleon.in({ idle: { snapshot: 'clean' } }), '', { timeout: 5000 });

    const resource = await getTestData('./hapi/payment_method_sets/0', router);
    expect(resource).to.have.property('description', 'Test');
  });

  it('handles DELETE requests to the fx:payment_preset resources', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            payment_gateway_id: 0,
            gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon href="https://foxy-payments-api.element/payment_presets/0"></foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    nucleon.delete();
    await waitUntil(() => nucleon.in({ idle: 'template' }), '', { timeout: 5000 });

    expect(await getTestData('./hapi/payment_method_sets/0', router)).to.not.exist;
  });

  it('handles GET requests to the fx:available_fraud_protections helper', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            payment_gateway_id: 0,
            gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            href="https://foxy-payments-api.element/payment_presets/0/available_fraud_protections"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    expect(nucleon).to.have.deep.property('data', {
      _links: {
        self: {
          href: 'https://foxy-payments-api.element/payment_presets/0/available_fraud_protections',
        },
      },
      values: {
        minfraud: {
          name: 'MaxMind minFraud',
          uses_rejection_threshold: true,
          json: null,
        },
        google_recaptcha: {
          name: 'Google reCAPTCHA',
          uses_rejection_threshold: false,
          json: {
            blocks: [
              {
                id: '',
                parent_id: '',
                fields: [
                  {
                    id: 'config',
                    name: 'Configuration',
                    type: 'select',
                    description: 'Determines how reCAPTCHA is configured to operate.',
                    default_value: 'disabled',
                    options: [
                      { name: 'Disabled', value: 'disabled' },
                      { name: 'Always enabled', value: 'enabled_always' },
                      { name: 'Enabled by errors', value: 'enabled_by_errors' },
                    ],
                  },
                  {
                    id: 'private_key',
                    name: 'Private Key',
                    type: 'text',
                    optional: true,
                    description: 'If using a custom subdomain, enter your Private Key here.',
                    default_value: '',
                  },
                  {
                    id: 'site_key',
                    name: 'Site Key',
                    type: 'text',
                    optional: true,
                    description: 'If using a custom subdomain, enter your Site Key here.',
                    default_value: '',
                  },
                ],
              },
            ],
          },
        },
        custom_precheckout_hook: {
          name: 'Pre-Checkout Webhook',
          uses_rejection_threshold: false,
          json: {
            blocks: [
              {
                id: '',
                parent_id: '',
                fields: [
                  {
                    id: 'enabled',
                    name: 'Enabled',
                    type: 'checkbox',
                    default_value: false,
                  },
                  {
                    id: 'url',
                    name: 'URL',
                    type: 'text',
                    description: 'Url of your Pre-Checkout Hook',
                    default_value: '',
                  },
                  {
                    id: 'failure_handling',
                    name: 'Failure handling',
                    type: 'select',
                    description:
                      'Determines what happens to the checkout submission if your webhook fails to respond correctly.',
                    default_value: '',
                    options: [
                      { name: 'Reject', value: 'reject' },
                      { name: 'Approve', value: 'approve' },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    });
  });

  it('handles GET requests to the fx:available_payment_methods helper (no conflicts)', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_hosted_payment_gateways: [],
        hosted_payment_gateways: [],
        payment_gateways: [],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            gateway_uri: '',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        property_helpers: [
          {
            id: 0,
            store_id: 0,
            message: 'fx:payment_gateways property helper',
            values: {
              authorize: {
                name: 'Authorize.net AIM',
                id_description: 'API ID',
                test_id: 'BxFSnPy7',
                key_description: 'Transaction Key',
                test_key: '8SPBTpqs4uf2ZwM8',
                third_party_key_description: '',
                test_third_party_key: '',
                supports_auth_only: true,
                supports_3d_secure: true,
                additional_fields: null,
              },
            },
          },
          {
            id: 1,
            store_id: 0,
            message: 'fx:hosted_payment_gateways property helper',
            values: {
              amazon_mws: {
                name: 'Amazon Pay',
                id_description: 'Seller ID',
                test_id: '',
                key_description: 'MWS Auth Token',
                test_key: '',
                third_party_key_description: 'Client ID',
                test_third_party_key: '',
                supports_auth_only: false,
                supports_3d_secure: false,
                additional_fields: {
                  blocks: [
                    {
                      id: 'amazon_mws_additonal_fields',
                      parent_id: 'gateway_live_amazon_mws',
                      is_live: true,
                      fields: [
                        {
                          id: 'on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                    {
                      id: 'test_amazon_mws_additonal_fields',
                      parent_id: 'gateway_test_amazon_mws',
                      is_live: false,
                      fields: [
                        {
                          id: 'test_on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            href="https://foxy-payments-api.element/payment_presets/0/available_payment_methods"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    expect(nucleon).to.have.deep.property('data', {
      _links: {
        self: {
          href: 'https://foxy-payments-api.element/payment_presets/0/available_payment_methods',
        },
      },
      values: {
        amazon_mws: {
          name: 'Amazon Pay',
          id_description: 'Seller ID',
          test_id: '',
          key_description: 'MWS Auth Token',
          test_key: '',
          third_party_key_description: 'Client ID',
          test_third_party_key: '',
          supports_auth_only: false,
          supports_3d_secure: false,
          additional_fields: {
            blocks: [
              {
                id: 'amazon_mws_additonal_fields',
                parent_id: 'gateway_live_amazon_mws',
                is_live: true,
                fields: [
                  {
                    id: 'on_amazon_mws_auth',
                    name: 'Authorize only (do not capture funds)',
                    type: 'checkbox',
                    default_value: false,
                  },
                ],
              },
              {
                id: 'test_amazon_mws_additonal_fields',
                parent_id: 'gateway_test_amazon_mws',
                is_live: false,
                fields: [
                  {
                    id: 'test_on_amazon_mws_auth',
                    name: 'Authorize only (do not capture funds)',
                    type: 'checkbox',
                    default_value: false,
                  },
                ],
              },
            ],
          },
        },
        authorize: {
          name: 'Authorize.net AIM',
          id_description: 'API ID',
          test_id: 'BxFSnPy7',
          key_description: 'Transaction Key',
          test_key: '8SPBTpqs4uf2ZwM8',
          third_party_key_description: '',
          test_third_party_key: '',
          supports_auth_only: true,
          supports_3d_secure: true,
          additional_fields: null,
        },
      },
    });
  });

  it('handles GET requests to the fx:available_payment_methods helper (with gateway conflict)', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_hosted_payment_gateways: [],
        hosted_payment_gateways: [],
        payment_gateways: [
          {
            id: 0,
            store_id: 0,
            description: 'Default payment gateway',
            type: 'authorize',
            use_auth_only: false,
            account_id: '',
            account_key: '',
            third_party_key: '',
            config_3d_secure: '',
            additional_fields: '',
            test_account_id: 'BxFSnPy7',
            test_account_key: '8SPBTpqs4uf2ZwM8',
            test_third_party_key: '',
            date_created: '2014-07-17T06:46:00-0700',
            date_modified: '2014-07-17T06:46:00-0700',
          },
        ],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            payment_gateway_id: 0,
            gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        property_helpers: [
          {
            id: 0,
            store_id: 0,
            message: 'fx:payment_gateways property helper',
            values: {
              authorize: {
                name: 'Authorize.net AIM',
                id_description: 'API ID',
                test_id: 'BxFSnPy7',
                key_description: 'Transaction Key',
                test_key: '8SPBTpqs4uf2ZwM8',
                third_party_key_description: '',
                test_third_party_key: '',
                supports_auth_only: true,
                supports_3d_secure: true,
                additional_fields: null,
              },
            },
          },
          {
            id: 1,
            store_id: 0,
            message: 'fx:hosted_payment_gateways property helper',
            values: {
              amazon_mws: {
                name: 'Amazon Pay',
                id_description: 'Seller ID',
                test_id: '',
                key_description: 'MWS Auth Token',
                test_key: '',
                third_party_key_description: 'Client ID',
                test_third_party_key: '',
                supports_auth_only: false,
                supports_3d_secure: false,
                additional_fields: {
                  blocks: [
                    {
                      id: 'amazon_mws_additonal_fields',
                      parent_id: 'gateway_live_amazon_mws',
                      is_live: true,
                      fields: [
                        {
                          id: 'on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                    {
                      id: 'test_amazon_mws_additonal_fields',
                      parent_id: 'gateway_test_amazon_mws',
                      is_live: false,
                      fields: [
                        {
                          id: 'test_on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            href="https://foxy-payments-api.element/payment_presets/0/available_payment_methods"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    expect(nucleon).to.have.deep.property('data', {
      _links: {
        self: {
          href: 'https://foxy-payments-api.element/payment_presets/0/available_payment_methods',
        },
      },
      values: {
        amazon_mws: {
          name: 'Amazon Pay',
          id_description: 'Seller ID',
          test_id: '',
          key_description: 'MWS Auth Token',
          test_key: '',
          third_party_key_description: 'Client ID',
          test_third_party_key: '',
          supports_auth_only: false,
          supports_3d_secure: false,
          additional_fields: {
            blocks: [
              {
                id: 'amazon_mws_additonal_fields',
                parent_id: 'gateway_live_amazon_mws',
                is_live: true,
                fields: [
                  {
                    id: 'on_amazon_mws_auth',
                    name: 'Authorize only (do not capture funds)',
                    type: 'checkbox',
                    default_value: false,
                  },
                ],
              },
              {
                id: 'test_amazon_mws_additonal_fields',
                parent_id: 'gateway_test_amazon_mws',
                is_live: false,
                fields: [
                  {
                    id: 'test_on_amazon_mws_auth',
                    name: 'Authorize only (do not capture funds)',
                    type: 'checkbox',
                    default_value: false,
                  },
                ],
              },
            ],
          },
        },
        authorize: {
          name: 'Authorize.net AIM',
          id_description: 'API ID',
          test_id: 'BxFSnPy7',
          key_description: 'Transaction Key',
          test_key: '8SPBTpqs4uf2ZwM8',
          third_party_key_description: '',
          test_third_party_key: '',
          supports_auth_only: true,
          supports_3d_secure: true,
          additional_fields: null,
          conflict: {
            name: 'Default payment gateway',
            type: 'authorize',
          },
        },
      },
    });
  });

  it('handles GET requests to the fx:payment_methods collection', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_hosted_payment_gateways: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            hosted_payment_gateway_id: 0,
            payment_method_set_uri: 'https://demo.api/payment_method_sets/0',
            hosted_payment_gateway_uri: 'https://demo.api/hosted_payment_gateways/0',
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        hosted_payment_gateways: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            description: 'Default hosted payment gateway',
            type: 'amazon_mws',
            use_auth_only: false,
            account_id: '',
            account_key: '',
            third_party_key: '',
            config_3d_secure: '',
            additional_fields: '',
            test_account_id: '',
            test_account_key: '',
            test_third_party_key: '',
            date_created: '2015-05-26T17:49:56-0700',
            date_modified: '2015-05-26T17:49:56-0700',
          },
        ],
        payment_gateways: [
          {
            id: 0,
            store_id: 0,
            description: 'Default payment gateway',
            type: 'authorize',
            use_auth_only: false,
            account_id: '',
            account_key: '',
            third_party_key: '',
            config_3d_secure: '',
            additional_fields: '',
            test_account_id: 'BxFSnPy7',
            test_account_key: '8SPBTpqs4uf2ZwM8',
            test_third_party_key: '',
            date_created: '2014-07-17T06:46:00-0700',
            date_modified: '2014-07-17T06:46:00-0700',
          },
        ],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            payment_gateway_id: 0,
            gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        property_helpers: [
          {
            id: 0,
            store_id: 0,
            message: 'fx:payment_gateways property helper',
            values: {
              authorize: {
                name: 'Authorize.net AIM',
                id_description: 'API ID',
                test_id: 'BxFSnPy7',
                key_description: 'Transaction Key',
                test_key: '8SPBTpqs4uf2ZwM8',
                third_party_key_description: '',
                test_third_party_key: '',
                supports_auth_only: true,
                supports_3d_secure: true,
                additional_fields: null,
              },
            },
          },
          {
            id: 1,
            store_id: 0,
            message: 'fx:hosted_payment_gateways property helper',
            values: {
              amazon_mws: {
                name: 'Amazon Pay',
                id_description: 'Seller ID',
                test_id: '',
                key_description: 'MWS Auth Token',
                test_key: '',
                third_party_key_description: 'Client ID',
                test_third_party_key: '',
                supports_auth_only: false,
                supports_3d_secure: false,
                additional_fields: {
                  blocks: [
                    {
                      id: 'amazon_mws_additonal_fields',
                      parent_id: 'gateway_live_amazon_mws',
                      is_live: true,
                      fields: [
                        {
                          id: 'on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                    {
                      id: 'test_amazon_mws_additonal_fields',
                      parent_id: 'gateway_test_amazon_mws',
                      is_live: false,
                      fields: [
                        {
                          id: 'test_on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon href="https://foxy-payments-api.element/payment_presets/0/payment_methods">
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    expect(nucleon).to.have.deep.property('data', {
      _links: {
        first: {
          href: 'https://foxy-payments-api.element/payment_presets/0/payment_methods?limit=20&offset=0',
        },
        last: {
          href: 'https://foxy-payments-api.element/payment_presets/0/payment_methods?limit=20&offset=0',
        },
        prev: {
          href: 'https://foxy-payments-api.element/payment_presets/0/payment_methods?limit=20&offset=0',
        },
        next: {
          href: 'https://foxy-payments-api.element/payment_presets/0/payment_methods?limit=20&offset=0',
        },
        self: {
          href: 'https://foxy-payments-api.element/payment_presets/0/payment_methods',
        },
      },
      _embedded: {
        'fx:payment_methods': [
          {
            _links: {
              'self': {
                href: 'https://foxy-payments-api.element/payment_presets/0/payment_methods/R0',
              },
              'fx:store': {
                href: 'https://demo.api/hapi/stores/0',
              },
              'fx:payment_preset': {
                href: 'https://foxy-payments-api.element/payment_presets/0',
              },
            },
            id: 0,
            store_id: 0,
            description: 'Default payment gateway',
            type: 'authorize',
            use_auth_only: false,
            account_id: '',
            account_key: '',
            third_party_key: '',
            config_3d_secure: '',
            additional_fields: '',
            test_account_id: 'BxFSnPy7',
            test_account_key: '8SPBTpqs4uf2ZwM8',
            test_third_party_key: '',
            date_created: '2014-07-17T06:46:00-0700',
            date_modified: '2014-07-17T06:46:00-0700',
            helper: {
              name: 'Authorize.net AIM',
              id_description: 'API ID',
              test_id: 'BxFSnPy7',
              key_description: 'Transaction Key',
              test_key: '8SPBTpqs4uf2ZwM8',
              third_party_key_description: '',
              test_third_party_key: '',
              supports_auth_only: true,
              supports_3d_secure: true,
              additional_fields: null,
            },
          },
          {
            _links: {
              'self': {
                href: 'https://foxy-payments-api.element/payment_presets/0/payment_methods/R0',
              },
              'fx:store': {
                href: 'https://demo.api/hapi/stores/0',
              },
              'fx:payment_preset': {
                href: 'https://foxy-payments-api.element/payment_presets/0',
              },
            },
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            description: 'Default hosted payment gateway',
            type: 'amazon_mws',
            use_auth_only: false,
            account_id: '',
            account_key: '',
            third_party_key: '',
            config_3d_secure: '',
            additional_fields: '',
            test_account_id: '',
            test_account_key: '',
            test_third_party_key: '',
            date_created: '2015-05-26T17:49:56-0700',
            date_modified: '2015-05-26T17:49:56-0700',
          },
        ],
      },
      returned_items: 2,
      total_items: 2,
      offset: 0,
      limit: 20,
    });
  });

  it('handles POST requests to the fx:payment_methods collection for regular gateways', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_hosted_payment_gateways: [],
        hosted_payment_gateways: [],
        payment_gateways: [],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            gateway_uri: '',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        property_helpers: [
          {
            id: 0,
            store_id: 0,
            message: 'fx:payment_gateways property helper',
            values: {
              authorize: {
                name: 'Authorize.net AIM',
                id_description: 'API ID',
                test_id: 'BxFSnPy7',
                key_description: 'Transaction Key',
                test_key: '8SPBTpqs4uf2ZwM8',
                third_party_key_description: '',
                test_third_party_key: '',
                supports_auth_only: true,
                supports_3d_secure: true,
                additional_fields: null,
              },
            },
          },
          {
            id: 1,
            store_id: 0,
            message: 'fx:hosted_payment_gateways property helper',
            values: {
              amazon_mws: {
                name: 'Amazon Pay',
                id_description: 'Seller ID',
                test_id: '',
                key_description: 'MWS Auth Token',
                test_key: '',
                third_party_key_description: 'Client ID',
                test_third_party_key: '',
                supports_auth_only: false,
                supports_3d_secure: false,
                additional_fields: {
                  blocks: [
                    {
                      id: 'amazon_mws_additonal_fields',
                      parent_id: 'gateway_live_amazon_mws',
                      is_live: true,
                      fields: [
                        {
                          id: 'on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                    {
                      id: 'test_amazon_mws_additonal_fields',
                      parent_id: 'gateway_test_amazon_mws',
                      is_live: false,
                      fields: [
                        {
                          id: 'test_on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            parent="https://foxy-payments-api.element/payment_presets/0/payment_methods"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;

    nucleon.edit({
      description: 'Auth.NET',
      type: 'authorize',
      use_auth_only: false,
      account_id: '',
      account_key: '',
      third_party_key: '',
      config_3d_secure: '',
      additional_fields: '',
      test_account_id: 'BxFSnPy7',
      test_account_key: '8SPBTpqs4uf2ZwM8',
      test_third_party_key: '',
      date_created: '2014-07-17T06:46:00-0700',
      date_modified: '2014-07-17T06:46:00-0700',
    });

    nucleon.submit();
    await waitUntil(() => nucleon.in({ idle: { snapshot: 'clean' } }), '', { timeout: 5000 });

    const gateway = await getTestData('./hapi/payment_gateways/0', router);
    const set = await getTestData('./hapi/payment_method_sets/0', router);

    delete (gateway as Record<PropertyKey, unknown>)._links;
    delete (set as Record<PropertyKey, unknown>)._links;

    expect(set).to.have.property('gateway_uri', 'https://demo.api/hapi/payment_gateways/0');
    expect(gateway).to.deep.equal({
      id: 0,
      store_id: 0,
      description: 'Auth.NET',
      type: 'authorize',
      use_auth_only: false,
      account_id: '',
      account_key: '',
      third_party_key: '',
      config_3d_secure: '',
      additional_fields: '',
      test_account_id: 'BxFSnPy7',
      test_account_key: '8SPBTpqs4uf2ZwM8',
      test_third_party_key: '',
      date_created: '2014-07-17T06:46:00-0700',
      date_modified: '2014-07-17T06:46:00-0700',
    });
  });

  it('handles POST requests to the fx:payment_methods collection for hosted gateways', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_hosted_payment_gateways: [],
        hosted_payment_gateways: [],
        payment_gateways: [],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            gateway_uri: '',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        property_helpers: [
          {
            id: 0,
            store_id: 0,
            message: 'fx:payment_gateways property helper',
            values: {
              authorize: {
                name: 'Authorize.net AIM',
                id_description: 'API ID',
                test_id: 'BxFSnPy7',
                key_description: 'Transaction Key',
                test_key: '8SPBTpqs4uf2ZwM8',
                third_party_key_description: '',
                test_third_party_key: '',
                supports_auth_only: true,
                supports_3d_secure: true,
                additional_fields: null,
              },
            },
          },
          {
            id: 1,
            store_id: 0,
            message: 'fx:hosted_payment_gateways property helper',
            values: {
              amazon_mws: {
                name: 'Amazon Pay',
                id_description: 'Seller ID',
                test_id: '',
                key_description: 'MWS Auth Token',
                test_key: '',
                third_party_key_description: 'Client ID',
                test_third_party_key: '',
                supports_auth_only: false,
                supports_3d_secure: false,
                additional_fields: {
                  blocks: [
                    {
                      id: 'amazon_mws_additonal_fields',
                      parent_id: 'gateway_live_amazon_mws',
                      is_live: true,
                      fields: [
                        {
                          id: 'on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                    {
                      id: 'test_amazon_mws_additonal_fields',
                      parent_id: 'gateway_test_amazon_mws',
                      is_live: false,
                      fields: [
                        {
                          id: 'test_on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            parent="https://foxy-payments-api.element/payment_presets/0/payment_methods"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;

    nucleon.edit({
      description: 'Amazon Pay',
      type: 'amazon_mws',
      use_auth_only: false,
      account_id: '',
      account_key: '',
      third_party_key: '',
      config_3d_secure: '',
      additional_fields: '',
      test_account_id: 'BxFSnPy7',
      test_account_key: '8SPBTpqs4uf2ZwM8',
      test_third_party_key: '',
      date_created: '2014-07-17T06:46:00-0700',
      date_modified: '2014-07-17T06:46:00-0700',
    });

    nucleon.submit();
    await waitUntil(() => nucleon.in({ idle: { snapshot: 'clean' } }), '', { timeout: 5000 });

    const gateway = await getTestData('./hapi/hosted_payment_gateways/0', router);
    const bridge = await getTestData('./hapi/payment_method_set_hosted_payment_gateways/0', router);

    delete (gateway as Record<PropertyKey, unknown>)._links;
    delete (bridge as Record<PropertyKey, unknown>)._links;
    delete (bridge as Record<PropertyKey, unknown>).date_created;
    delete (bridge as Record<PropertyKey, unknown>).date_modified;

    expect(bridge).to.deep.equal({
      id: 0,
      store_id: 0,
      payment_method_set_id: 0,
      hosted_payment_gateway_id: 0,
      payment_method_set_uri: 'https://demo.api/hapi/payment_method_sets/0',
      hosted_payment_gateway_uri: 'https://demo.api/hapi/hosted_payment_gateways/0',
    });

    expect(gateway).to.deep.equal({
      id: 0,
      store_id: 0,
      description: 'Amazon Pay',
      type: 'amazon_mws',
      use_auth_only: false,
      account_id: '',
      account_key: '',
      third_party_key: '',
      config_3d_secure: '',
      additional_fields: '',
      test_account_id: 'BxFSnPy7',
      test_account_key: '8SPBTpqs4uf2ZwM8',
      test_third_party_key: '',
      date_created: '2014-07-17T06:46:00-0700',
      date_modified: '2014-07-17T06:46:00-0700',
    });
  });

  it('handles GET requests to the fx:payment_method resources for regular gateways', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_hosted_payment_gateways: [],
        hosted_payment_gateways: [],
        payment_gateways: [
          {
            id: 0,
            store_id: 0,
            description: 'Default payment gateway',
            type: 'authorize',
            use_auth_only: false,
            account_id: '',
            account_key: '',
            third_party_key: '',
            config_3d_secure: '',
            additional_fields: '',
            test_account_id: 'BxFSnPy7',
            test_account_key: '8SPBTpqs4uf2ZwM8',
            test_third_party_key: '',
            date_created: '2014-07-17T06:46:00-0700',
            date_modified: '2014-07-17T06:46:00-0700',
          },
        ],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            payment_gateway_id: 0,
            gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        property_helpers: [
          {
            id: 0,
            store_id: 0,
            message: 'fx:payment_gateways property helper',
            values: {
              authorize: {
                name: 'Authorize.net AIM',
                id_description: 'API ID',
                test_id: 'BxFSnPy7',
                key_description: 'Transaction Key',
                test_key: '8SPBTpqs4uf2ZwM8',
                third_party_key_description: '',
                test_third_party_key: '',
                supports_auth_only: true,
                supports_3d_secure: true,
                additional_fields: null,
              },
            },
          },
          {
            id: 1,
            store_id: 0,
            message: 'fx:hosted_payment_gateways property helper',
            values: {
              amazon_mws: {
                name: 'Amazon Pay',
                id_description: 'Seller ID',
                test_id: '',
                key_description: 'MWS Auth Token',
                test_key: '',
                third_party_key_description: 'Client ID',
                test_third_party_key: '',
                supports_auth_only: false,
                supports_3d_secure: false,
                additional_fields: {
                  blocks: [
                    {
                      id: 'amazon_mws_additonal_fields',
                      parent_id: 'gateway_live_amazon_mws',
                      is_live: true,
                      fields: [
                        {
                          id: 'on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                    {
                      id: 'test_amazon_mws_additonal_fields',
                      parent_id: 'gateway_test_amazon_mws',
                      is_live: false,
                      fields: [
                        {
                          id: 'test_on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    expect(nucleon).to.have.deep.property('data', {
      _links: {
        'self': {
          href: 'https://foxy-payments-api.element/payment_presets/0/payment_methods/R0',
        },
        'fx:store': {
          href: 'https://demo.api/hapi/stores/0',
        },
        'fx:payment_preset': {
          href: 'https://foxy-payments-api.element/payment_presets/0',
        },
      },
      id: 0,
      store_id: 0,
      description: 'Default payment gateway',
      type: 'authorize',
      use_auth_only: false,
      account_id: '',
      account_key: '',
      third_party_key: '',
      config_3d_secure: '',
      additional_fields: '',
      test_account_id: 'BxFSnPy7',
      test_account_key: '8SPBTpqs4uf2ZwM8',
      test_third_party_key: '',
      date_created: '2014-07-17T06:46:00-0700',
      date_modified: '2014-07-17T06:46:00-0700',
      helper: {
        name: 'Authorize.net AIM',
        id_description: 'API ID',
        test_id: 'BxFSnPy7',
        key_description: 'Transaction Key',
        test_key: '8SPBTpqs4uf2ZwM8',
        third_party_key_description: '',
        test_third_party_key: '',
        supports_auth_only: true,
        supports_3d_secure: true,
        additional_fields: null,
      },
    });
  });

  it('handles GET requests to the fx:payment_method resources for hosted gateways', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_hosted_payment_gateways: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            hosted_payment_gateway_id: 0,
            payment_method_set_uri: 'https://demo.api/payment_method_sets/0',
            hosted_payment_gateway_uri: 'https://demo.api/hosted_payment_gateways/0',
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        hosted_payment_gateways: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            description: 'Default hosted payment gateway',
            type: 'amazon_mws',
            use_auth_only: false,
            account_id: '',
            account_key: '',
            third_party_key: '',
            config_3d_secure: '',
            additional_fields: '',
            test_account_id: '',
            test_account_key: '',
            test_third_party_key: '',
            date_created: '2015-05-26T17:49:56-0700',
            date_modified: '2015-05-26T17:49:56-0700',
          },
        ],
        payment_gateways: [],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            gateway_uri: '',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        property_helpers: [
          {
            id: 0,
            store_id: 0,
            message: 'fx:payment_gateways property helper',
            values: {
              authorize: {
                name: 'Authorize.net AIM',
                id_description: 'API ID',
                test_id: 'BxFSnPy7',
                key_description: 'Transaction Key',
                test_key: '8SPBTpqs4uf2ZwM8',
                third_party_key_description: '',
                test_third_party_key: '',
                supports_auth_only: true,
                supports_3d_secure: true,
                additional_fields: null,
              },
            },
          },
          {
            id: 1,
            store_id: 0,
            message: 'fx:hosted_payment_gateways property helper',
            values: {
              amazon_mws: {
                name: 'Amazon Pay',
                id_description: 'Seller ID',
                test_id: '',
                key_description: 'MWS Auth Token',
                test_key: '',
                third_party_key_description: 'Client ID',
                test_third_party_key: '',
                supports_auth_only: false,
                supports_3d_secure: false,
                additional_fields: {
                  blocks: [
                    {
                      id: 'amazon_mws_additonal_fields',
                      parent_id: 'gateway_live_amazon_mws',
                      is_live: true,
                      fields: [
                        {
                          id: 'on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                    {
                      id: 'test_amazon_mws_additonal_fields',
                      parent_id: 'gateway_test_amazon_mws',
                      is_live: false,
                      fields: [
                        {
                          id: 'test_on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/H0C0"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    expect(nucleon).to.have.deep.property('data', {
      _links: {
        'self': {
          href: 'https://foxy-payments-api.element/payment_presets/0/payment_methods/H0C0',
        },
        'fx:store': {
          href: 'https://demo.api/hapi/stores/0',
        },
        'fx:payment_preset': {
          href: 'https://foxy-payments-api.element/payment_presets/0',
        },
      },
      id: 0,
      store_id: 0,
      payment_method_set_id: 0,
      description: 'Default hosted payment gateway',
      type: 'amazon_mws',
      use_auth_only: false,
      account_id: '',
      account_key: '',
      third_party_key: '',
      config_3d_secure: '',
      additional_fields: '',
      test_account_id: '',
      test_account_key: '',
      test_third_party_key: '',
      date_created: '2015-05-26T17:49:56-0700',
      date_modified: '2015-05-26T17:49:56-0700',
      helper: {
        name: 'Amazon Pay',
        id_description: 'Seller ID',
        test_id: '',
        key_description: 'MWS Auth Token',
        test_key: '',
        third_party_key_description: 'Client ID',
        test_third_party_key: '',
        supports_auth_only: false,
        supports_3d_secure: false,
        additional_fields: {
          blocks: [
            {
              id: 'amazon_mws_additonal_fields',
              parent_id: 'gateway_live_amazon_mws',
              is_live: true,
              fields: [
                {
                  id: 'on_amazon_mws_auth',
                  name: 'Authorize only (do not capture funds)',
                  type: 'checkbox',
                  default_value: false,
                },
              ],
            },
            {
              id: 'test_amazon_mws_additonal_fields',
              parent_id: 'gateway_test_amazon_mws',
              is_live: false,
              fields: [
                {
                  id: 'test_on_amazon_mws_auth',
                  name: 'Authorize only (do not capture funds)',
                  type: 'checkbox',
                  default_value: false,
                },
              ],
            },
          ],
        },
      },
    });
  });

  it('handles PATCH requests to the fx:payment_method resources for regular gateways', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_hosted_payment_gateways: [],
        hosted_payment_gateways: [],
        payment_gateways: [
          {
            id: 0,
            store_id: 0,
            description: 'Default payment gateway',
            type: 'authorize',
            use_auth_only: false,
            account_id: '',
            account_key: '',
            third_party_key: '',
            config_3d_secure: '',
            additional_fields: '',
            test_account_id: 'BxFSnPy7',
            test_account_key: '8SPBTpqs4uf2ZwM8',
            test_third_party_key: '',
            date_created: '2014-07-17T06:46:00-0700',
            date_modified: '2014-07-17T06:46:00-0700',
          },
        ],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            payment_gateway_id: 0,
            gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        property_helpers: [
          {
            id: 0,
            store_id: 0,
            message: 'fx:payment_gateways property helper',
            values: {
              authorize: {
                name: 'Authorize.net AIM',
                id_description: 'API ID',
                test_id: 'BxFSnPy7',
                key_description: 'Transaction Key',
                test_key: '8SPBTpqs4uf2ZwM8',
                third_party_key_description: '',
                test_third_party_key: '',
                supports_auth_only: true,
                supports_3d_secure: true,
                additional_fields: null,
              },
            },
          },
          {
            id: 1,
            store_id: 0,
            message: 'fx:hosted_payment_gateways property helper',
            values: {
              amazon_mws: {
                name: 'Amazon Pay',
                id_description: 'Seller ID',
                test_id: '',
                key_description: 'MWS Auth Token',
                test_key: '',
                third_party_key_description: 'Client ID',
                test_third_party_key: '',
                supports_auth_only: false,
                supports_3d_secure: false,
                additional_fields: {
                  blocks: [
                    {
                      id: 'amazon_mws_additonal_fields',
                      parent_id: 'gateway_live_amazon_mws',
                      is_live: true,
                      fields: [
                        {
                          id: 'on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                    {
                      id: 'test_amazon_mws_additonal_fields',
                      parent_id: 'gateway_test_amazon_mws',
                      is_live: false,
                      fields: [
                        {
                          id: 'test_on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    nucleon.edit({ description: 'Test' });
    nucleon.submit();
    await waitUntil(() => nucleon.in({ idle: { snapshot: 'clean' } }), '', { timeout: 5000 });

    const gateway = await getTestData('./hapi/payment_gateways/0', router);
    expect(gateway).to.have.property('description', 'Test');
  });

  it('handles PATCH requests to the fx:payment_method resources for hosted gateways', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_hosted_payment_gateways: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            hosted_payment_gateway_id: 0,
            payment_method_set_uri: 'https://demo.api/payment_method_sets/0',
            hosted_payment_gateway_uri: 'https://demo.api/hosted_payment_gateways/0',
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        hosted_payment_gateways: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            description: 'Default hosted payment gateway',
            type: 'amazon_mws',
            use_auth_only: false,
            account_id: '',
            account_key: '',
            third_party_key: '',
            config_3d_secure: '',
            additional_fields: '',
            test_account_id: '',
            test_account_key: '',
            test_third_party_key: '',
            date_created: '2015-05-26T17:49:56-0700',
            date_modified: '2015-05-26T17:49:56-0700',
          },
        ],
        payment_gateways: [],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            gateway_uri: '',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        property_helpers: [
          {
            id: 0,
            store_id: 0,
            message: 'fx:payment_gateways property helper',
            values: {
              authorize: {
                name: 'Authorize.net AIM',
                id_description: 'API ID',
                test_id: 'BxFSnPy7',
                key_description: 'Transaction Key',
                test_key: '8SPBTpqs4uf2ZwM8',
                third_party_key_description: '',
                test_third_party_key: '',
                supports_auth_only: true,
                supports_3d_secure: true,
                additional_fields: null,
              },
            },
          },
          {
            id: 1,
            store_id: 0,
            message: 'fx:hosted_payment_gateways property helper',
            values: {
              amazon_mws: {
                name: 'Amazon Pay',
                id_description: 'Seller ID',
                test_id: '',
                key_description: 'MWS Auth Token',
                test_key: '',
                third_party_key_description: 'Client ID',
                test_third_party_key: '',
                supports_auth_only: false,
                supports_3d_secure: false,
                additional_fields: {
                  blocks: [
                    {
                      id: 'amazon_mws_additonal_fields',
                      parent_id: 'gateway_live_amazon_mws',
                      is_live: true,
                      fields: [
                        {
                          id: 'on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                    {
                      id: 'test_amazon_mws_additonal_fields',
                      parent_id: 'gateway_test_amazon_mws',
                      is_live: false,
                      fields: [
                        {
                          id: 'test_on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/H0C0"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    nucleon.edit({ description: 'Test' });
    nucleon.submit();
    await waitUntil(() => nucleon.in({ idle: { snapshot: 'clean' } }), '', { timeout: 5000 });

    const gateway = await getTestData('./hapi/hosted_payment_gateways/0', router);
    expect(gateway).to.have.property('description', 'Test');
  });

  it('handles DELETE requests to the fx:payment_method resources for regular gateways', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_hosted_payment_gateways: [],
        hosted_payment_gateways: [],
        payment_gateways: [
          {
            id: 0,
            store_id: 0,
            description: 'Default payment gateway',
            type: 'authorize',
            use_auth_only: false,
            account_id: '',
            account_key: '',
            third_party_key: '',
            config_3d_secure: '',
            additional_fields: '',
            test_account_id: 'BxFSnPy7',
            test_account_key: '8SPBTpqs4uf2ZwM8',
            test_third_party_key: '',
            date_created: '2014-07-17T06:46:00-0700',
            date_modified: '2014-07-17T06:46:00-0700',
          },
        ],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            payment_gateway_id: 0,
            gateway_uri: 'https://demo.api/hapi/payment_gateways/0',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        property_helpers: [
          {
            id: 0,
            store_id: 0,
            message: 'fx:payment_gateways property helper',
            values: {
              authorize: {
                name: 'Authorize.net AIM',
                id_description: 'API ID',
                test_id: 'BxFSnPy7',
                key_description: 'Transaction Key',
                test_key: '8SPBTpqs4uf2ZwM8',
                third_party_key_description: '',
                test_third_party_key: '',
                supports_auth_only: true,
                supports_3d_secure: true,
                additional_fields: null,
              },
            },
          },
          {
            id: 1,
            store_id: 0,
            message: 'fx:hosted_payment_gateways property helper',
            values: {
              amazon_mws: {
                name: 'Amazon Pay',
                id_description: 'Seller ID',
                test_id: '',
                key_description: 'MWS Auth Token',
                test_key: '',
                third_party_key_description: 'Client ID',
                test_third_party_key: '',
                supports_auth_only: false,
                supports_3d_secure: false,
                additional_fields: {
                  blocks: [
                    {
                      id: 'amazon_mws_additonal_fields',
                      parent_id: 'gateway_live_amazon_mws',
                      is_live: true,
                      fields: [
                        {
                          id: 'on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                    {
                      id: 'test_amazon_mws_additonal_fields',
                      parent_id: 'gateway_test_amazon_mws',
                      is_live: false,
                      fields: [
                        {
                          id: 'test_on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    nucleon.delete();
    await waitUntil(() => nucleon.in({ idle: 'template' }), '', { timeout: 5000 });

    const gateway = await getTestData('./hapi/payment_gateways/0', router);
    const set = await getTestData('./hapi/payment_method_sets/0', router);

    expect(gateway).to.not.exist;
    expect(set).to.have.property('gateway_uri', '');
  });

  it('handles DELETE requests to the fx:payment_method resources for hosted gateways', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_hosted_payment_gateways: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            hosted_payment_gateway_id: 0,
            payment_method_set_uri: 'https://demo.api/payment_method_sets/0',
            hosted_payment_gateway_uri: 'https://demo.api/hosted_payment_gateways/0',
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        hosted_payment_gateways: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            description: 'Default hosted payment gateway',
            type: 'amazon_mws',
            use_auth_only: false,
            account_id: '',
            account_key: '',
            third_party_key: '',
            config_3d_secure: '',
            additional_fields: '',
            test_account_id: '',
            test_account_key: '',
            test_third_party_key: '',
            date_created: '2015-05-26T17:49:56-0700',
            date_modified: '2015-05-26T17:49:56-0700',
          },
        ],
        payment_gateways: [],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            gateway_uri: '',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        property_helpers: [
          {
            id: 0,
            store_id: 0,
            message: 'fx:payment_gateways property helper',
            values: {
              authorize: {
                name: 'Authorize.net AIM',
                id_description: 'API ID',
                test_id: 'BxFSnPy7',
                key_description: 'Transaction Key',
                test_key: '8SPBTpqs4uf2ZwM8',
                third_party_key_description: '',
                test_third_party_key: '',
                supports_auth_only: true,
                supports_3d_secure: true,
                additional_fields: null,
              },
            },
          },
          {
            id: 1,
            store_id: 0,
            message: 'fx:hosted_payment_gateways property helper',
            values: {
              amazon_mws: {
                name: 'Amazon Pay',
                id_description: 'Seller ID',
                test_id: '',
                key_description: 'MWS Auth Token',
                test_key: '',
                third_party_key_description: 'Client ID',
                test_third_party_key: '',
                supports_auth_only: false,
                supports_3d_secure: false,
                additional_fields: {
                  blocks: [
                    {
                      id: 'amazon_mws_additonal_fields',
                      parent_id: 'gateway_live_amazon_mws',
                      is_live: true,
                      fields: [
                        {
                          id: 'on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                    {
                      id: 'test_amazon_mws_additonal_fields',
                      parent_id: 'gateway_test_amazon_mws',
                      is_live: false,
                      fields: [
                        {
                          id: 'test_on_amazon_mws_auth',
                          name: 'Authorize only (do not capture funds)',
                          type: 'checkbox',
                          default_value: false,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/H0C0"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    nucleon.delete();
    await waitUntil(() => nucleon.in({ idle: 'template' }), '', { timeout: 5000 });

    const gateway = await getTestData('./hapi/hosted_payment_gateways/0', router);
    const bridge = await getTestData('./hapi/payment_method_set_hosted_payment_gateways/0', router);

    expect(gateway).to.not.exist;
    expect(bridge).to.not.exist;
  });

  it('handles GET requests to the fx:fraud_protections collection', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_fraud_protections: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            fraud_protection_id: 0,
            payment_method_set_uri: 'https://demo.api/hapi/payment_method_sets/0',
            fraud_protection_uri: 'https://demo.api/hapi/fraud_protections/0',
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        fraud_protections: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            type: 'google_recaptcha',
            description: 'Default fraud protection',
            json: '{"private_key":"","site_key":"","config":"disabled"}',
            score_threshold_reject: 0,
            date_created: '2015-05-27T08:59:54-0700',
            date_modified: '2015-05-27T08:59:54-0700',
          },
        ],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            gateway_uri: '',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            href="https://foxy-payments-api.element/payment_presets/0/fraud_protections"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    expect(nucleon).to.have.deep.property('data', {
      _links: {
        first: {
          href: 'https://foxy-payments-api.element/payment_presets/0/fraud_protections?payment_method_set_id=0&offset=0&limit=20',
        },
        last: {
          href: 'https://foxy-payments-api.element/payment_presets/0/fraud_protections?payment_method_set_id=0&offset=0&limit=20',
        },
        prev: {
          href: 'https://foxy-payments-api.element/payment_presets/0/fraud_protections?payment_method_set_id=0&offset=0&limit=20',
        },
        next: {
          href: 'https://foxy-payments-api.element/payment_presets/0/fraud_protections?payment_method_set_id=0&offset=1&limit=20',
        },
        self: {
          href: 'https://foxy-payments-api.element/payment_presets/0/fraud_protections?payment_method_set_id=0&offset=0&limit=20',
        },
      },
      _embedded: {
        'fx:fraud_protections': [
          {
            _links: {
              'self': {
                href: 'https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0',
              },
              'fx:store': {
                href: 'https://demo.api/hapi/stores/0',
              },
              'fx:payment_preset': {
                href: 'https://foxy-payments-api.element/payment_presets/0',
              },
            },
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            type: 'google_recaptcha',
            description: 'Default fraud protection',
            json: '{"private_key":"","site_key":"","config":"disabled"}',
            score_threshold_reject: 0,
            date_created: '2015-05-27T08:59:54-0700',
            date_modified: '2015-05-27T08:59:54-0700',
            helper: {
              name: 'Google reCAPTCHA',
              uses_rejection_threshold: false,
              json: {
                blocks: [
                  {
                    id: '',
                    parent_id: '',
                    fields: [
                      {
                        id: 'config',
                        name: 'Configuration',
                        type: 'select',
                        description: 'Determines how reCAPTCHA is configured to operate.',
                        default_value: 'disabled',
                        options: [
                          { name: 'Disabled', value: 'disabled' },
                          { name: 'Always enabled', value: 'enabled_always' },
                          { name: 'Enabled by errors', value: 'enabled_by_errors' },
                        ],
                      },
                      {
                        id: 'private_key',
                        name: 'Private Key',
                        type: 'text',
                        optional: true,
                        description: 'If using a custom subdomain, enter your Private Key here.',
                        default_value: '',
                      },
                      {
                        id: 'site_key',
                        name: 'Site Key',
                        type: 'text',
                        optional: true,
                        description: 'If using a custom subdomain, enter your Site Key here.',
                        default_value: '',
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
      returned_items: 1,
      total_items: 1,
      offset: 0,
      limit: 20,
    });
  });

  it('handles POST requests to the fx:fraud_protections collection', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_fraud_protections: [],
        fraud_protections: [],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            gateway_uri: '',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            parent="https://foxy-payments-api.element/payment_presets/0/fraud_protections"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;

    nucleon.edit({
      type: 'google_recaptcha',
      description: 'Default fraud protection',
      json: '{"private_key":"","site_key":"","config":"disabled"}',
      score_threshold_reject: 0,
      date_created: '2015-05-27T08:59:54-0700',
      date_modified: '2015-05-27T08:59:54-0700',
    });

    nucleon.submit();
    await waitUntil(() => nucleon.in({ idle: 'snapshot' }), '', { timeout: 5000 });

    const protection = await getTestData<any>('./hapi/fraud_protections/0', router);
    const bridge = await getTestData<any>('./hapi/payment_method_set_fraud_protections/0', router);

    delete protection._links;
    delete bridge._links;
    delete bridge.date_created;
    delete bridge.date_modified;

    expect(protection).to.deep.equal({
      id: 0,
      store_id: 0,
      type: 'google_recaptcha',
      description: 'Default fraud protection',
      json: '{"private_key":"","site_key":"","config":"disabled"}',
      score_threshold_reject: 0,
      date_created: '2015-05-27T08:59:54-0700',
      date_modified: '2015-05-27T08:59:54-0700',
    });

    expect(bridge).to.deep.equal({
      id: 0,
      store_id: 0,
      payment_method_set_id: 0,
      fraud_protection_id: 0,
      payment_method_set_uri: 'https://demo.api/hapi/payment_method_sets/0',
      fraud_protection_uri: 'https://demo.api/hapi/fraud_protections/0',
    });
  });

  it('handles GET requests to the fx:fraud_protection resources', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_fraud_protections: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            fraud_protection_id: 0,
            payment_method_set_uri: 'https://demo.api/hapi/payment_method_sets/0',
            fraud_protection_uri: 'https://demo.api/hapi/fraud_protections/0',
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        fraud_protections: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            type: 'google_recaptcha',
            description: 'Default fraud protection',
            json: '{"private_key":"","site_key":"","config":"disabled"}',
            score_threshold_reject: 0,
            date_created: '2015-05-27T08:59:54-0700',
            date_modified: '2015-05-27T08:59:54-0700',
          },
        ],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            gateway_uri: '',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            href="https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    expect(nucleon).to.have.deep.property('data', {
      _links: {
        'self': {
          href: 'https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0',
        },
        'fx:store': {
          href: 'https://demo.api/hapi/stores/0',
        },
        'fx:payment_preset': {
          href: 'https://foxy-payments-api.element/payment_presets/0',
        },
      },
      id: 0,
      store_id: 0,
      payment_method_set_id: 0,
      type: 'google_recaptcha',
      description: 'Default fraud protection',
      json: '{"private_key":"","site_key":"","config":"disabled"}',
      score_threshold_reject: 0,
      date_created: '2015-05-27T08:59:54-0700',
      date_modified: '2015-05-27T08:59:54-0700',
      helper: {
        name: 'Google reCAPTCHA',
        uses_rejection_threshold: false,
        json: {
          blocks: [
            {
              id: '',
              parent_id: '',
              fields: [
                {
                  id: 'config',
                  name: 'Configuration',
                  type: 'select',
                  description: 'Determines how reCAPTCHA is configured to operate.',
                  default_value: 'disabled',
                  options: [
                    { name: 'Disabled', value: 'disabled' },
                    { name: 'Always enabled', value: 'enabled_always' },
                    { name: 'Enabled by errors', value: 'enabled_by_errors' },
                  ],
                },
                {
                  id: 'private_key',
                  name: 'Private Key',
                  type: 'text',
                  optional: true,
                  description: 'If using a custom subdomain, enter your Private Key here.',
                  default_value: '',
                },
                {
                  id: 'site_key',
                  name: 'Site Key',
                  type: 'text',
                  optional: true,
                  description: 'If using a custom subdomain, enter your Site Key here.',
                  default_value: '',
                },
              ],
            },
          ],
        },
      },
    });
  });

  it('handles PATCH requests to the fx:fraud_protection resources', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_fraud_protections: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            fraud_protection_id: 0,
            payment_method_set_uri: 'https://demo.api/hapi/payment_method_sets/0',
            fraud_protection_uri: 'https://demo.api/hapi/fraud_protections/0',
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        fraud_protections: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            type: 'google_recaptcha',
            description: 'Default fraud protection',
            json: '{"private_key":"","site_key":"","config":"disabled"}',
            score_threshold_reject: 0,
            date_created: '2015-05-27T08:59:54-0700',
            date_modified: '2015-05-27T08:59:54-0700',
          },
        ],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            gateway_uri: '',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            href="https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    nucleon.edit({ description: 'Test' });
    nucleon.submit();
    await waitUntil(() => nucleon.in({ idle: { snapshot: 'clean' } }), '', { timeout: 5000 });

    const protection = await getTestData('./hapi/fraud_protections/0', router);
    expect(protection).to.have.property('description', 'Test');
  });

  it('handles DELETE requests to the fx:fraud_protection resources', async () => {
    const router = createRouter({
      defaults,
      dataset: {
        payment_method_set_fraud_protections: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            fraud_protection_id: 0,
            payment_method_set_uri: 'https://demo.api/hapi/payment_method_sets/0',
            fraud_protection_uri: 'https://demo.api/hapi/fraud_protections/0',
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
        fraud_protections: [
          {
            id: 0,
            store_id: 0,
            payment_method_set_id: 0,
            type: 'google_recaptcha',
            description: 'Default fraud protection',
            json: '{"private_key":"","site_key":"","config":"disabled"}',
            score_threshold_reject: 0,
            date_created: '2015-05-27T08:59:54-0700',
            date_modified: '2015-05-27T08:59:54-0700',
          },
        ],
        payment_method_sets: [
          {
            id: 0,
            store_id: 0,
            gateway_uri: '',
            description: 'Default Payment Method Set',
            is_live: false,
            is_purchase_order_enabled: true,
            date_created: '2012-08-10T11:58:54-0700',
            date_modified: '2012-08-10T11:58:54-0700',
          },
        ],
      },
      links,
    });

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
          <foxy-nucleon
            href="https://foxy-payments-api.element/payment_presets/0/fraud_protections/0C0"
          >
          </foxy-nucleon>
        </foxy-payments-api>
      </div>
    `);

    const api = wrapper.firstElementChild as PaymentsApi;
    const nucleon = api.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!nucleon.data, '', { timeout: 5000 });

    nucleon.delete();
    await waitUntil(() => nucleon.in({ idle: 'template' }), '', { timeout: 5000 });

    const protection = await getTestData('./hapi/fraud_protections/0', router);
    const bridge = await getTestData('./hapi/payment_method_set_fraud_protections/0', router);

    expect(protection).to.not.exist;
    expect(bridge).to.not.exist;
  });
});
