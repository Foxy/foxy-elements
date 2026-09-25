import type { AvailablePaymentMethods } from '../PaymentsApi/api/types';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

import '../PaymentsApi/index';
import './index';

import { PaymentsApiPaymentMethodForm as Form } from './PaymentsApiPaymentMethodForm';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalPasswordControl } from '../../internal/InternalPasswordControl/InternalPasswordControl';
import { InternalSummaryControl } from '../../internal/InternalSummaryControl/InternalSummaryControl';
import { InternalSwitchControl } from '../../internal/InternalSwitchControl/InternalSwitchControl';
import { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import { InternalNumberControl } from '../../internal/InternalNumberControl/InternalNumberControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server/index';
import { createRouter as createHapiRouter } from '../../../server/router/createRouter';
import { createDataset } from '../../../server/hapi/createDataset';
import { defaults } from '../../../server/hapi/defaults';
import { links } from '../../../server/hapi/links';
import { getByTestId } from '../../../testgen/getByTestId';
import { getByKey } from '../../../testgen/getByKey';
import { getByTag } from '../../../testgen/getByTag';
import { I18n } from '../I18n/I18n';
import { stub } from 'sinon';

describe('PaymentsApiPaymentMethodForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines vaadin-button', () => {
    expect(customElements.get('vaadin-button')).to.exist;
  });

  it('imports and defines foxy-internal-password-control', () => {
    const element = customElements.get('foxy-internal-password-control');
    expect(element).to.equal(InternalPasswordControl);
  });

  it('imports and defines foxy-internal-switch-control', () => {
    const element = customElements.get('foxy-internal-switch-control');
    expect(element).to.equal(InternalSwitchControl);
  });

  it('imports and defines foxy-internal-summary-control', () => {
    const element = customElements.get('foxy-internal-summary-control');
    expect(element).to.equal(InternalSummaryControl);
  });

  it('imports and defines foxy-internal-select-control', () => {
    const element = customElements.get('foxy-internal-select-control');
    expect(element).to.equal(InternalSelectControl);
  });

  it('imports and defines foxy-internal-number-control', () => {
    const element = customElements.get('foxy-internal-number-control');
    expect(element).to.equal(InternalNumberControl);
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

  it('imports and defines itself as foxy-payments-api-payment-method-form', () => {
    const element = customElements.get('foxy-payments-api-payment-method-form');
    expect(element).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace "payments-api-payment-method-form"', () => {
    expect(Form).to.have.property('defaultNS', 'payments-api-payment-method-form');
    expect(new Form()).to.have.property('ns', 'payments-api-payment-method-form');
  });

  it('has a reactive property "paymentPreset"', () => {
    expect(new Form()).to.have.property('paymentPreset', null);
    expect(Form).to.have.deep.nested.property('properties.paymentPreset', {
      attribute: 'payment-preset',
    });
  });

  it('has a reactive property "getImageSrc"', () => {
    expect(new Form()).to.have.property('getImageSrc', null);
    expect(Form).to.have.nested.property('properties.getImageSrc');
    expect(Form).to.have.nested.property('properties.getImageSrc.attribute', false);
  });

  it('has a reactive property "store"', () => {
    expect(new Form()).to.have.property('store', null);
    expect(Form).to.have.deep.nested.property('properties.store', {});
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

    form.edit({ type: '' });
    expect(form.errors).to.include('type:v8n_required');

    form.edit({ type: 'Test' });
    expect(form.errors).to.not.include('type:v8n_required');
  });

  it('produces the additional-fields:v8n_invalid error if some of the required additional fields are empty', async () => {
    const availableMethods: AvailablePaymentMethods = {
      _links: {
        self: {
          href: 'https://foxy-payments-api.element/payment_presets/0/available_payment_methods',
        },
      },
      values: {
        foo: {
          name: 'Foo',
          test_id: '',
          test_key: '',
          test_third_party_key: '',
          third_party_key_description: '',
          id_description: '',
          key_description: '',
          supports_3d_secure: 0,
          supports_auth_only: 0,
          is_deprecated: false,
          supports_card_verification: false,
          card_verification: 'disabled',
          card_verification_config: '',
          additional_fields: {
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
    let isAvailableMethodFetchComplete = false;

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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            parent="https://foxy-payments-api.element/payment_presets/0/payment_methods"
            store="https://demo.api/hapi/stores/0"
            @fetch=${(evt: FetchEvent) => {
              if (evt.request.url.endsWith('/payment_presets/0/available_payment_methods')) {
                evt.preventDefault();
                evt.respondWith(Promise.resolve(new Response(JSON.stringify(availableMethods))));
                isAvailableMethodFetchComplete = true;
              }
            }}
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const form = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => isAvailableMethodFetchComplete, '', { timeout: 5000 });

    form.edit({ type: 'foo', helper: availableMethods.values.foo });
    expect(form.errors).to.include('additional-fields:v8n_invalid');

    form.edit({ additional_fields: JSON.stringify({ baz: 'test' }) });
    expect(form.errors).to.not.include('additional-fields:v8n_invalid');
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

    expect(form.headerTitleOptions).to.deep.equal({ context: 'new', name: undefined });

    form.edit({
      type: 'bar_one',
      helper: {
        name: 'Bar One',
        test_id: '',
        test_key: '',
        test_third_party_key: '',
        third_party_key_description: '',
        id_description: '',
        key_description: '',
        supports_3d_secure: 0,
        supports_auth_only: 0,
        is_deprecated: false,
        additional_fields: null,
        supports_card_verification: false,
        card_verification: 'disabled',
        card_verification_config: '',
      },
    });

    expect(form.headerTitleOptions).to.deep.equal({ context: 'selected', name: 'Bar One' });
  });

  it('uses custom options for form header subtitle', () => {
    const form = new Form();
    expect(form.headerSubtitleOptions).to.deep.equal({});

    form.href = 'https://foxy-payments-api.element/payment_presets/0/payment_methods/R0';
    expect(form.headerSubtitleOptions).to.deep.equal({ context: 'regular', id: '0' });

    form.href = 'https://foxy-payments-api.element/payment_presets/0/payment_methods/H1C2';
    expect(form.headerSubtitleOptions).to.deep.equal({ context: 'hosted', id: '1' });
  });

  it('uses custom Copy ID value', () => {
    const form = new Form();
    expect(form.headerCopyIdValue).to.equal('');

    form.href = 'https://foxy-payments-api.element/payment_presets/0/payment_methods/R0';
    expect(form.headerCopyIdValue).to.equal('0');

    form.href = 'https://foxy-payments-api.element/payment_presets/0/payment_methods/H1C2';
    expect(form.headerCopyIdValue).to.equal('1');
  });

  it('renders a payment method selector when "type" is not present in form', async () => {
    const availableMethods: AvailablePaymentMethods = {
      _links: {
        self: { href: '' },
      },
      values: {
        foo_one: {
          name: 'Foo One',
          test_id: '',
          test_key: '',
          test_third_party_key: '',
          third_party_key_description: '',
          id_description: '',
          key_description: '',
          supports_3d_secure: 0,
          supports_auth_only: 0,
          is_deprecated: false,
          additional_fields: null,
          supports_card_verification: false,
          card_verification: 'disabled',
          card_verification_config: '',
        },
        foo_two: {
          name: 'Foo Two',
          test_id: '',
          test_key: '',
          test_third_party_key: '',
          third_party_key_description: '',
          id_description: '',
          key_description: '',
          supports_3d_secure: 0,
          supports_auth_only: 0,
          additional_fields: null,
          is_deprecated: false,
          conflict: { type: 'foo_one', name: 'Foo One' },
          supports_card_verification: false,
          card_verification: 'disabled',
          card_verification_config: '',
        },
        bar_one: {
          name: 'Bar One',
          test_id: '',
          test_key: '',
          test_third_party_key: '',
          third_party_key_description: '',
          id_description: '',
          key_description: '',
          supports_3d_secure: 0,
          supports_auth_only: 0,
          is_deprecated: false,
          additional_fields: null,
          supports_card_verification: false,
          card_verification: 'disabled',
          card_verification_config: '',
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            parent="https://foxy-payments-api.element/payment_presets/0/payment_methods"
            store="https://demo.api/hapi/stores/0"
            .getImageSrc=${(type: string) =>
              `https://static.www.foxycart.com/email/v2/email_header_logo.png?type=${type}`}
            @fetch=${(evt: FetchEvent) => {
              if (evt.request.url.endsWith('/payment_presets/0/available_payment_methods')) {
                evt.preventDefault();
                evt.respondWith(Promise.resolve(new Response(JSON.stringify(availableMethods))));
              }
            }}
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(
      () => !!element.renderRoot.querySelector('[data-testid="select-method-list"]'),
      '',
      { timeout: 5000 }
    );

    const list = (await getByTestId(element, 'select-method-list')) as HTMLElement;
    const groups = list.querySelectorAll('foxy-internal-summary-control');
    const headers = list.querySelectorAll('p');

    expect(list).to.exist;
    expect(groups).to.have.length(2);
    expect(headers).to.have.length(2);

    expect(headers[0]).to.have.text('B');
    expect(headers[1]).to.have.text('F');

    const group0Items = groups[0].querySelectorAll('button');
    const group1Items = groups[1].querySelectorAll('button');

    expect(group0Items).to.have.length(1);
    expect(group1Items).to.have.length(2);

    const group0Item0Button = group0Items[0] as HTMLButtonElement;
    const group1Item0Button = group1Items[0] as HTMLButtonElement;
    const group1Item1Button = group1Items[1] as HTMLButtonElement;

    expect(group0Item0Button).to.exist;
    expect(group0Item0Button).to.not.have.attribute('disabled');
    expect(group0Item0Button).to.include.text('Bar One');
    expect(await getByKey(group0Item0Button, 'conflict_message')).to.not.exist;
    expect(await getByTag(group0Item0Button, 'img')).to.have.attribute(
      'src',
      'https://static.www.foxycart.com/email/v2/email_header_logo.png?type=bar_one'
    );

    expect(group1Item0Button).to.exist;
    expect(group1Item0Button).to.not.have.attribute('disabled');
    expect(group1Item0Button).to.include.text('Foo One');
    expect(group1Item0Button).to.not.include.text('conflict_message');
    expect(await getByTag(group1Item0Button, 'img')).to.have.attribute(
      'src',
      'https://static.www.foxycart.com/email/v2/email_header_logo.png?type=foo_one'
    );

    expect(group1Item1Button).to.exist;
    expect(group1Item1Button).to.have.attribute('disabled');
    expect(group1Item1Button).to.include.text('Foo Two');
    expect(await getByTag(group1Item1Button, 'img')).to.have.attribute(
      'src',
      'https://static.www.foxycart.com/email/v2/email_header_logo.png?type=foo_two'
    );
    expect(group1Item1Button).to.include.text('conflict_message');

    group0Item0Button.click();
    await element.requestUpdate();

    expect(element).to.have.nested.property('form.type', 'bar_one');
    expect(await getByKey(element, 'select_method_title')).to.not.exist;
    expect(await getByTestId(element, 'select-method-list')).to.not.exist;
  });

  it('passes accessDenied from the payment methods loader to the list spinner', async () => {
    const element = await fixture<Form>(
      html`<foxy-payments-api-payment-method-form></foxy-payments-api-payment-method-form>`
    );

    await element.updateComplete;

    const spinner = element.renderRoot.querySelector('foxy-spinner[infer="list-spinner"]');
    expect(spinner, 'list spinner is rendered while the loader has no data').to.exist;
    expect(spinner).to.have.attribute('error-type', 'generic');
  });

  it('passes accessDenied "true" from the payment methods loader to the list spinner on a scope-denied failure, while the host form\'s own accessDenied stays false', async () => {
    const SCOPE_DENIAL_BODY = JSON.stringify({
      total: 1,
      _embedded: {
        'fx:errors': [
          {
            logref: 'id-1',
            message:
              'The current authenticated user does not appear to have read permission for available_payment_methods resource.',
          },
        ],
      },
    });

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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            parent="https://foxy-payments-api.element/payment_presets/0/payment_methods"
            store="https://demo.api/hapi/stores/0"
            @fetch=${(evt: FetchEvent) => {
              if (evt.request.url.endsWith('/available_payment_methods')) {
                evt.preventDefault();
                evt.respondWith(Promise.resolve(new Response(SCOPE_DENIAL_BODY, { status: 401 })));
              }
            }}
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    const loader = element.renderRoot.querySelector(
      '#availablePaymentMethodsLoader'
    ) as InstanceType<typeof NucleonElement>;

    await waitUntil(() => !!loader && loader.in('fail'), '', { timeout: 5000 });
    await element.updateComplete;

    const spinner = element.renderRoot.querySelector('foxy-spinner[infer="list-spinner"]');
    expect(spinner).to.have.attribute('error-type', 'access-denied');
    expect(element.accessDenied, "host form's own request never fails in this test").to.be.false;
  });

  it('hides deprecated payment methods', async () => {
    const availableMethods: AvailablePaymentMethods = {
      _links: {
        self: { href: '' },
      },
      values: {
        foo_one: {
          name: 'Foo One',
          test_id: '',
          test_key: '',
          test_third_party_key: '',
          third_party_key_description: '',
          id_description: '',
          key_description: '',
          supports_3d_secure: 0,
          supports_auth_only: 0,
          is_deprecated: false,
          additional_fields: null,
          supports_card_verification: false,
          card_verification: 'disabled',
          card_verification_config: '',
        },
        foo_two: {
          name: 'Foo Two',
          test_id: '',
          test_key: '',
          test_third_party_key: '',
          third_party_key_description: '',
          id_description: '',
          key_description: '',
          supports_3d_secure: 0,
          supports_auth_only: 0,
          additional_fields: null,
          is_deprecated: true,
          conflict: { type: 'foo_one', name: 'Foo One' },
          supports_card_verification: false,
          card_verification: 'disabled',
          card_verification_config: '',
        },
        bar_one: {
          name: 'Bar One',
          test_id: '',
          test_key: '',
          test_third_party_key: '',
          third_party_key_description: '',
          id_description: '',
          key_description: '',
          supports_3d_secure: 0,
          supports_auth_only: 0,
          is_deprecated: false,
          additional_fields: null,
          supports_card_verification: false,
          card_verification: 'disabled',
          card_verification_config: '',
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            parent="https://foxy-payments-api.element/payment_presets/0/payment_methods"
            store="https://demo.api/hapi/stores/0"
            .getImageSrc=${(type: string) =>
              `https://static.www.foxycart.com/email/v2/email_header_logo.png?type=${type}`}
            @fetch=${(evt: FetchEvent) => {
              if (evt.request.url.endsWith('/payment_presets/0/available_payment_methods')) {
                evt.preventDefault();
                evt.respondWith(Promise.resolve(new Response(JSON.stringify(availableMethods))));
              }
            }}
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(
      () => !!element.renderRoot.querySelector('[data-testid="select-method-list"]'),
      '',
      { timeout: 5000 }
    );

    const list = (await getByTestId(element, 'select-method-list')) as HTMLElement;
    const groups = list.querySelectorAll('foxy-internal-summary-control');
    const headers = list.querySelectorAll('p');

    expect(list).to.exist;
    expect(groups).to.have.length(2);
    expect(headers).to.have.length(2);

    expect(headers[0]).to.have.text('B');
    expect(headers[1]).to.have.text('F');

    const group0Items = groups[0].querySelectorAll('button');
    const group1Items = groups[1].querySelectorAll('button');

    expect(group0Items).to.have.length(1);
    expect(group1Items).to.have.length(1);

    const group0Item0Button = group0Items[0];
    const group1Item0Button = group1Items[0];
    const group1Item1Button = group1Items[1];

    expect(group0Item0Button).to.exist;
    expect(group1Item0Button).to.exist;
    expect(group1Item1Button).to.not.exist;
  });

  it('renders a temporary warning for oauth-based payment gateways', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const oauthGateways = [
      'stripe_connect',
      'stripe_v2',
      'square_up',
      'quickbook_payments',
      'amazon_mws',
    ];

    for (const type of oauthGateways) {
      element.edit({ type });
      await element.requestUpdate();

      const warning = element.renderRoot.querySelector('[key="no_oauth_support_message"]');
      expect(warning).to.exist;
      expect(warning).to.have.property('localName', 'foxy-i18n');
      expect(warning).to.have.attribute('infer', '');
    }

    for (const type of ['paypal_platform', 'any_other_gateway']) {
      element.edit({ type });
      await element.requestUpdate();
      const warning = element.renderRoot.querySelector('[key="no_oauth_support_message"]');
      expect(warning).to.not.exist;
    }
  });

  it('renders a text control for live and test account id if applicable', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.edit({ helper: { ...element.data!.helper, id_description: 'Test ID Description' } });
    await element.requestUpdate();

    for (let index = 0; index < 2; ++index) {
      const type = index === 0 ? 'live' : 'test';
      const prefix = index === 0 ? '' : `${type}-`;
      const tabPanel = element.renderRoot.querySelector(`[infer="${type}-group"]`) as HTMLElement;
      const field = tabPanel.querySelector(`[infer="${prefix}account-id"]`);

      expect(field).to.exist;
      expect(field).to.be.instanceOf(InternalTextControl);
      expect(field).to.have.attribute('placeholder', 'default_additional_field_placeholder');
      expect(field).to.have.attribute('helper-text', '');
      expect(field).to.have.attribute('layout', 'summary-item');
      expect(field).to.have.attribute('label', element.form.helper!.id_description);
    }

    element.edit({ helper: { ...element.data!.helper, id_description: '' } });
    await element.requestUpdate();

    for (let index = 0; index < 2; ++index) {
      const type = index === 0 ? 'live' : 'test';
      const prefix = index === 0 ? '' : `${type}-`;
      const tabPanel = element.renderRoot.querySelector(`[infer="${type}-group"]`) as HTMLElement;
      const field = tabPanel.querySelector(`[infer="${prefix}account-id"]`);

      expect(field).to.not.exist;
    }
  });

  it('renders a password control for live and test 3rd-party key if applicable', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.edit({
      helper: {
        ...element.data!.helper,
        third_party_key_description: 'Test 3rd-party key description',
      },
    });

    await element.requestUpdate();

    for (let index = 0; index < 2; ++index) {
      const type = index === 0 ? 'live' : 'test';
      const prefix = index === 0 ? '' : `${type}-`;
      const tabPanel = element.renderRoot.querySelector(`[infer="${type}-group"]`) as HTMLElement;
      const field = tabPanel.querySelector(`[infer="${prefix}third-party-key"]`);

      expect(field).to.exist;
      expect(field).to.be.instanceOf(InternalPasswordControl);
      expect(field).to.have.attribute('placeholder', 'default_additional_field_placeholder');
      expect(field).to.have.attribute('helper-text', '');
      expect(field).to.have.attribute('layout', 'summary-item');
      expect(field).to.have.attribute('label', element.form.helper!.third_party_key_description);
    }

    element.edit({ helper: { ...element.data!.helper, third_party_key_description: '' } });
    await element.requestUpdate();

    for (let index = 0; index < 2; ++index) {
      const type = index === 0 ? 'live' : 'test';
      const prefix = index === 0 ? '' : `${type}-`;
      const tabPanel = element.renderRoot.querySelector(`[infer="${type}-group"]`) as HTMLElement;
      const field = tabPanel.querySelector(`[infer="${prefix}third-party-key"]`);

      expect(field).to.not.exist;
    }
  });

  it('renders a password control for live and test account key if applicable', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.edit({ helper: { ...element.data!.helper, key_description: 'Test key description' } });
    await element.requestUpdate();

    for (let index = 0; index < 2; ++index) {
      const type = index === 0 ? 'live' : 'test';
      const prefix = index === 0 ? '' : `${type}-`;
      const tabPanel = element.renderRoot.querySelector(`[infer="${type}-group"]`) as HTMLElement;
      const field = tabPanel.querySelector(`[infer="${prefix}account-key"]`);

      expect(field).to.exist;
      expect(field).to.be.instanceOf(InternalPasswordControl);
      expect(field).to.have.attribute('placeholder', 'default_additional_field_placeholder');
      expect(field).to.have.attribute('helper-text', '');
      expect(field).to.have.attribute('layout', 'summary-item');
      expect(field).to.have.attribute('label', element.form.helper!.key_description);
    }

    element.edit({ helper: { ...element.data!.helper, key_description: '' } });
    await element.requestUpdate();

    for (let index = 0; index < 2; ++index) {
      const type = index === 0 ? 'live' : 'test';
      const prefix = index === 0 ? '' : `${type}-`;
      const tabPanel = element.renderRoot.querySelector(`[infer="${type}-group"]`) as HTMLElement;
      const field = tabPanel.querySelector(`[infer="${prefix}account-key"]`);

      expect(field).to.not.exist;
    }
  });

  it('renders a switch control for a live "checkbox" block in additional fields if present', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.additional_fields = {
      blocks: [
        {
          id: 'bar',
          is_live: true,
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

    const tabPanel = element.renderRoot.querySelector('[infer="live-group"]') as HTMLElement;
    const field = tabPanel.querySelector(
      '[infer="additional-fields-baz"]'
    ) as InternalSwitchControl;

    expect(field).to.exist;
    expect(field).to.be.instanceOf(InternalSwitchControl);
    expect(field).to.have.attribute('helper-text', 'Baz Description');
    expect(field).to.have.attribute('label', 'Baz');

    element.edit({ additional_fields: JSON.stringify({ baz: true }) });
    expect(field.getValue()).to.equal(true);

    field.setValue(false);
    expect(JSON.parse(element.form.additional_fields!)).to.have.property('baz', false);
  });

  it('renders a switch control for a test "checkbox" block in additional fields if present', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.additional_fields = {
      blocks: [
        {
          id: 'bar',
          is_live: false,
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

    const tabPanel = element.renderRoot.querySelector('[infer="test-group"]') as HTMLElement;
    const field = tabPanel.querySelector(
      '[infer="additional-fields-baz"]'
    ) as InternalSwitchControl;

    expect(field).to.exist;
    expect(field).to.be.instanceOf(InternalSwitchControl);
    expect(field).to.have.attribute('helper-text', 'Baz Description');
    expect(field).to.have.attribute('label', 'Baz');

    element.edit({ additional_fields: JSON.stringify({ baz: true }) });
    expect(field.getValue()).to.equal(true);

    field.setValue(false);
    expect(JSON.parse(element.form.additional_fields!)).to.have.nested.property('baz', false);
  });

  it('renders a select control for a live "select" block in additional fields if present', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.additional_fields = {
      blocks: [
        {
          id: 'bar',
          is_live: true,
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

    const tabPanel = element.renderRoot.querySelector('[infer="live-group"]') as HTMLElement;
    const field = tabPanel.querySelector(
      '[infer="additional-fields-baz"]'
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

    element.edit({ additional_fields: JSON.stringify({ baz: 'field_1_value' }) });
    expect(field.getValue()).to.deep.equal('field_1_value');

    field.setValue('field_2_value');
    expect(JSON.parse(element.form.additional_fields!)).to.have.property('baz', 'field_2_value');
  });

  it('renders a select control for a test "select" block in additional fields if present', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.additional_fields = {
      blocks: [
        {
          id: 'bar',
          is_live: false,
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

    const tabPanel = element.renderRoot.querySelector('[infer="test-group"]') as HTMLElement;
    const field = tabPanel.querySelector(
      '[infer="additional-fields-baz"]'
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

    element.edit({ additional_fields: JSON.stringify({ baz: 'field_1_value' }) });
    expect(field.getValue()).to.deep.equal('field_1_value');

    field.setValue('field_2_value');
    expect(JSON.parse(element.form.additional_fields!)).to.have.property('baz', 'field_2_value');
  });

  it('does not render a hidden live block in additional fields if present', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.additional_fields = {
      blocks: [
        {
          id: 'bar',
          is_live: true,
          parent_id: 'foo',
          fields: [
            {
              id: 'baz',
              name: 'Baz',
              type: 'hidden',
              description: 'Baz Description',
              default_value: 'baz_default',
            },
          ],
        },
      ],
    };

    element.data = { ...element.data! };
    await element.requestUpdate();

    const tabPanel = element.renderRoot.querySelector('[infer="live-group"]') as HTMLElement;
    const field = tabPanel.querySelector('[infer="additional-fields-baz"]') as InternalTextControl;

    expect(field).to.not.exist;
  });

  it('does not render a hidden test block in additional fields if present', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.additional_fields = {
      blocks: [
        {
          id: 'bar',
          is_live: false,
          parent_id: 'foo',
          fields: [
            {
              id: 'baz',
              name: 'Baz',
              type: 'hidden',
              description: 'Baz Description',
              default_value: 'baz_default',
            },
          ],
        },
      ],
    };

    element.data = { ...element.data! };
    await element.requestUpdate();

    const tabPanel = element.renderRoot.querySelector('[infer="test-group"]') as HTMLElement;
    const field = tabPanel.querySelector('[infer="additional-fields-baz"]') as InternalTextControl;

    expect(field).to.not.exist;
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.additional_fields = {
      blocks: [
        {
          id: 'bar',
          is_live: true,
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

    const tabPanel = element.renderRoot.querySelector('[infer="live-group"]') as HTMLElement;
    const field = tabPanel.querySelector('[infer="additional-fields-baz"]') as InternalTextControl;

    expect(field).to.exist;
    expect(field).to.be.instanceOf(InternalTextControl);
    expect(field).to.have.attribute('placeholder', 'baz_default');
    expect(field).to.have.attribute('helper-text', 'Baz Description');
    expect(field).to.have.attribute('layout', 'summary-item');
    expect(field).to.have.attribute('label', 'Baz');

    element.edit({ additional_fields: JSON.stringify({ baz: 'test_value' }) });
    expect(field.getValue()).to.deep.equal('test_value');

    field.setValue('another_value');
    expect(JSON.parse(element.form.additional_fields!)).to.have.property('baz', 'another_value');
  });

  it('renders a text control for any other test block in additional fields if present', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.additional_fields = {
      blocks: [
        {
          id: 'bar',
          is_live: false,
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

    const tabPanel = element.renderRoot.querySelector('[infer="test-group"]') as HTMLElement;
    const field = tabPanel.querySelector('[infer="additional-fields-baz"]') as InternalTextControl;

    expect(field).to.exist;
    expect(field).to.be.instanceOf(InternalTextControl);
    expect(field).to.have.attribute('placeholder', 'baz_default');
    expect(field).to.have.attribute('helper-text', 'Baz Description');
    expect(field).to.have.attribute('layout', 'summary-item');
    expect(field).to.have.attribute('label', 'Baz');

    element.edit({ additional_fields: JSON.stringify({ baz: 'test_value' }) });
    expect(field.getValue()).to.deep.equal('test_value');

    field.setValue('another_value');
    expect(JSON.parse(element.form.additional_fields!)).to.have.property('baz', 'another_value');
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="description"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a switch control for auth-only transactions if applicable', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.supports_auth_only = 0;
    element.data = { ...element.data! };
    await element.requestUpdate();

    expect(element.renderRoot.querySelector('[infer="use-auth-only"]')).to.not.exist;

    element.data!.helper.supports_auth_only = 1;
    element.data = { ...element.data! };
    await element.requestUpdate();
    const control = element.renderRoot.querySelector(
      '[infer="use-auth-only"]'
    ) as InternalSwitchControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSwitchControl);
  });

  it('renders a select control for toggling 3DS on and off if supported', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.supports_3d_secure = 0;
    element.data = { ...element.data! };
    await element.requestUpdate();

    expect(element.renderRoot.querySelector('[infer="three-d-secure-toggle"]')).to.not.exist;

    element.data!.helper.supports_3d_secure = 1;
    element.data = { ...element.data! };
    await element.requestUpdate();
    const control = element.renderRoot.querySelector(
      '[infer="three-d-secure-toggle"]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', [
      { value: 'off', label: 'option_off' },
      { value: 'all_cards', label: 'option_all_cards' },
      { value: 'maestro_only', label: 'option_maestro_only' },
    ]);

    element.edit({ config_3d_secure: '' });
    expect(control.getValue()).to.equal('off');

    element.edit({ config_3d_secure: 'all_cards' });
    expect(control.getValue()).to.equal('all_cards');

    element.edit({ config_3d_secure: 'all_cards_require_valid_response' });
    expect(control.getValue()).to.equal('all_cards');

    element.edit({ config_3d_secure: 'maestro_only' });
    expect(control.getValue()).to.equal('maestro_only');

    element.edit({ config_3d_secure: 'maestro_only_require_valid_response' });
    expect(control.getValue()).to.equal('maestro_only');

    control.setValue('off');
    expect(element).to.have.nested.property('form.config_3d_secure', '');

    element.edit({ config_3d_secure: 'maestro_only' });
    control.setValue('all_cards');
    expect(element).to.have.nested.property('form.config_3d_secure', 'all_cards');

    element.edit({ config_3d_secure: 'maestro_only_require_valid_response' });
    control.setValue('all_cards');
    expect(element).to.have.nested.property(
      'form.config_3d_secure',
      'all_cards_require_valid_response'
    );

    element.edit({ config_3d_secure: 'all_cards' });
    control.setValue('maestro_only');
    expect(element).to.have.nested.property('form.config_3d_secure', 'maestro_only');

    element.edit({ config_3d_secure: 'all_cards_require_valid_response' });
    control.setValue('maestro_only');
    expect(element).to.have.nested.property(
      'form.config_3d_secure',
      'maestro_only_require_valid_response'
    );
  });

  it('renders a switch control for requiring valid 3DS response if applicable', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.supports_3d_secure = 0;
    element.data!.config_3d_secure = '';
    element.data = { ...element.data! };
    await element.requestUpdate();

    expect(element.renderRoot.querySelector('[infer="three-d-secure-response"]')).to.not.exist;

    element.data!.helper.supports_3d_secure = 1;
    element.data!.config_3d_secure = 'all_cards';
    element.data = { ...element.data! };
    await element.requestUpdate();
    const control = element.renderRoot.querySelector(
      '[infer="three-d-secure-response"]'
    ) as InternalSwitchControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSwitchControl);

    element.edit({ config_3d_secure: 'all_cards' });
    expect(control.getValue()).to.equal(false);

    element.edit({ config_3d_secure: 'all_cards_require_valid_response' });
    expect(control.getValue()).to.equal(true);

    element.edit({ config_3d_secure: 'maestro_only' });
    expect(control.getValue()).to.equal(false);

    element.edit({ config_3d_secure: 'maestro_only_require_valid_response' });
    expect(control.getValue()).to.equal(true);

    element.edit({ config_3d_secure: 'all_cards' });
    control.setValue(true);
    expect(element).to.have.nested.property(
      'form.config_3d_secure',
      'all_cards_require_valid_response'
    );

    element.edit({ config_3d_secure: 'all_cards' });
    control.setValue(false);
    expect(element).to.have.nested.property('form.config_3d_secure', 'all_cards');

    element.edit({ config_3d_secure: 'maestro_only' });
    control.setValue(true);
    expect(element).to.have.nested.property(
      'form.config_3d_secure',
      'maestro_only_require_valid_response'
    );

    element.edit({ config_3d_secure: 'maestro_only' });
    control.setValue(false);
    expect(element).to.have.nested.property('form.config_3d_secure', 'maestro_only');
  });

  it('renders a select control for card verification setting if supported', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data!.helper.supports_card_verification = false;
    await element.requestUpdate();

    expect(element.renderRoot.querySelector('[infer="card-verification"]')).to.not.exist;
    expect(element.renderRoot.querySelector('[infer="test-card-verification"]')).to.not.exist;

    element.data = {
      ...element.data!,
      helper: { ...element.data!.helper, supports_card_verification: true },
      card_verification: 'disabled',
      test_card_verification: 'disabled',
    };

    await element.requestUpdate();

    ['test', 'live'].map(group => {
      const scope = `${group}-group`;
      const inferPrefix = group === 'live' ? '' : 'test-';
      const control = element.renderRoot.querySelector(
        `[infer="${scope}"] [infer="${inferPrefix}card-verification"]`
      ) as InternalSelectControl;

      expect(control).to.exist;
      expect(control).to.be.instanceOf(InternalSelectControl);
      expect(control).to.have.deep.property('options', [
        { value: 'disabled', label: 'option_disabled' },
        { value: 'enabled_automatically', label: 'option_enabled_automatically' },
        { value: 'enabled_override', label: 'option_enabled_override' },
      ]);

      expect(control).to.have.attribute(
        'helper-text',
        `${scope}.${inferPrefix}card-verification.helper_text_disabled`
      );
    });
  });

  it('renders controls for card verification amounts if supported', async () => {
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.data = {
      ...element.data!,
      helper: {
        ...element.data!.helper,
        supports_card_verification: true,
        card_verification_config:
          '{"verification_amounts": {"visa": 1, "mastercard": 1, "american_express": 1, "discover": 1, "default": 1}}',
      },
      card_verification: 'enabled_automatically',
      test_card_verification: 'enabled_automatically',
    };

    await element.requestUpdate();

    ['test', 'live'].map(group => {
      ['visa', 'mastercard', 'american-express', 'discover', 'default'].map(type => {
        const inferPrefix = group === 'live' ? '' : 'test-';
        const control = element.renderRoot.querySelector(
          `[infer="${group}-group"] [infer="${inferPrefix}card-verification-config-verification-amounts-${type}"]`
        );

        expect(control).to.exist;
        expect(control).to.be.instanceOf(InternalNumberControl);
        expect(control).to.have.attribute(
          'json-template',
          element.data?.helper.card_verification_config
        );

        expect(control).to.have.attribute(
          'json-path',
          `verification_amounts.${type.replace(/-/g, '_')}`
        );

        expect(control).to.have.attribute(
          'property',
          `${group === 'live' ? '' : 'test_'}card_verification_config`
        );

        expect(control).to.have.attribute('step', '0.01');
        expect(control).to.have.attribute('min', '0');
      });
    });
  });

  it('renders a Back button clearing "type" on first selection', async () => {
    const availableMethods: AvailablePaymentMethods = {
      _links: {
        self: { href: '' },
      },
      values: {
        foo: {
          name: 'Foo',
          test_id: '',
          test_key: '',
          test_third_party_key: '',
          third_party_key_description: '',
          id_description: '',
          key_description: '',
          supports_3d_secure: 0,
          supports_auth_only: 0,
          is_deprecated: false,
          additional_fields: null,
          supports_card_verification: false,
          card_verification: 'disabled',
          card_verification_config: '',
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            parent="https://foxy-payments-api.element/payment_presets/0/payment_methods"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
            @fetch=${(evt: FetchEvent) => {
              if (evt.request.url.endsWith('/payment_presets/0/available_payment_methods')) {
                evt.preventDefault();
                evt.respondWith(Promise.resolve(new Response(JSON.stringify(availableMethods))));
              }
            }}
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    expect(await getByTestId(element, 'select-another-button')).to.not.exist;

    element.data = null;
    element.edit({ type: 'foo' });
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

  it('renders a warning for live setup if store is inactive', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/stores/0', {
        method: 'PATCH',
        body: JSON.stringify({ is_active: false }),
      })
    )?.handlerPromise;

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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const liveGroup = element.renderRoot.querySelector('[infer="live-group"]') as HTMLElement;
    const message = liveGroup.querySelector('[key="inactive_message"]') as HTMLElement;

    expect(liveGroup.children).to.have.lengthOf(1);
    expect(message).to.exist;
    expect(message).to.be.instanceOf(I18n);
    expect(message).to.have.attribute('infer', '');
  });

  it('renders a hint showing which config is currently active (test is active)', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/payment_method_sets/0', {
        method: 'PATCH',
        body: JSON.stringify({ is_live: false }),
      })
    )?.handlerPromise;

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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            parent="https://foxy-payments-api.element/payment_presets/0/payment_methods"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    await waitUntil(
      () => {
        const nucleons = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
        return [...nucleons].every(nucleon => !!nucleon.data);
      },
      '',
      { timeout: 5000 }
    );

    await element.requestUpdate();
    const liveGroup = element.renderRoot.querySelector('[infer="live-group"]') as HTMLElement;
    const testGroup = element.renderRoot.querySelector('[infer="test-group"]') as HTMLElement;

    expect(liveGroup).to.have.attribute('helper-text', 'live-group.helper_text_inactive');
    expect(testGroup).to.not.have.attribute('helper-text');
  });

  it('renders a hint showing which config is currently active (live is active)', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/payment_method_sets/0', {
        method: 'PATCH',
        body: JSON.stringify({ is_live: true }),
      })
    )?.handlerPromise;

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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            parent="https://foxy-payments-api.element/payment_presets/0/payment_methods"
            store="https://demo.api/hapi/stores/0"
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    await waitUntil(
      () => {
        const nucleons = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
        return [...nucleons].every(nucleon => !!nucleon.data);
      },
      '',
      { timeout: 5000 }
    );

    await element.requestUpdate();
    const liveGroup = element.renderRoot.querySelector('[infer="live-group"]') as HTMLElement;
    const testGroup = element.renderRoot.querySelector('[infer="test-group"]') as HTMLElement;

    expect(testGroup).to.have.attribute('helper-text', 'test-group.helper_text_inactive');
    expect(liveGroup).to.not.have.attribute('helper-text');
  });

  it('renders a search field for searching available payment methods', async () => {
    const availableMethods: AvailablePaymentMethods = {
      _links: {
        self: { href: '' },
      },
      values: {
        foo_one: {
          name: 'Foo One',
          test_id: '',
          test_key: '',
          test_third_party_key: '',
          third_party_key_description: '',
          id_description: '',
          key_description: '',
          supports_3d_secure: 0,
          supports_auth_only: 0,
          is_deprecated: false,
          additional_fields: null,
          supports_card_verification: false,
          card_verification: 'disabled',
          card_verification_config: '',
        },
        foo_two: {
          name: 'Foo Two',
          test_id: '',
          test_key: '',
          test_third_party_key: '',
          third_party_key_description: '',
          id_description: '',
          key_description: '',
          supports_3d_secure: 0,
          supports_auth_only: 0,
          additional_fields: null,
          is_deprecated: false,
          conflict: { type: 'foo_one', name: 'Foo One' },
          supports_card_verification: false,
          card_verification: 'disabled',
          card_verification_config: '',
        },
        bar_one: {
          name: 'Bar One',
          test_id: '',
          test_key: '',
          test_third_party_key: '',
          third_party_key_description: '',
          id_description: '',
          key_description: '',
          supports_3d_secure: 0,
          supports_auth_only: 0,
          is_deprecated: false,
          additional_fields: null,
          supports_card_verification: false,
          card_verification: 'disabled',
          card_verification_config: '',
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
          <foxy-payments-api-payment-method-form
            payment-preset="https://foxy-payments-api.element/payment_presets/0"
            parent="https://foxy-payments-api.element/payment_presets/0/payment_methods"
            store="https://demo.api/hapi/stores/0"
            .getImageSrc=${(type: string) =>
              `https://static.www.foxycart.com/email/v2/email_header_logo.png?type=${type}`}
            @fetch=${(evt: FetchEvent) => {
              if (evt.request.url.endsWith('/payment_presets/0/available_payment_methods')) {
                evt.preventDefault();
                evt.respondWith(Promise.resolve(new Response(JSON.stringify(availableMethods))));
              }
            }}
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(
      () => !!element.renderRoot.querySelector('[data-testid="select-method-list"]'),
      '',
      { timeout: 5000 }
    );

    const list = (await getByTestId(element, 'select-method-list')) as HTMLElement;
    let groups = list.querySelectorAll('foxy-internal-summary-control');
    const searchField = element.renderRoot.querySelector(
      'input[type="search"]'
    ) as HTMLInputElement;

    expect(searchField).to.exist;
    expect(searchField).to.have.attribute('placeholder', 'search_placeholder');
    expect(groups).to.have.lengthOf(2);

    searchField.value = 'Bar';
    searchField.dispatchEvent(new Event('input'));
    await element.requestUpdate();
    groups = list.querySelectorAll('foxy-internal-summary-control');
    expect(groups).to.have.lengthOf(1);

    const group0Items = groups[0].querySelectorAll('button');
    expect(group0Items).to.have.length(1);

    const group0Item0Button = group0Items[0] as HTMLButtonElement;
    expect(group0Item0Button).to.exist;
    expect(group0Item0Button).to.not.have.attribute('disabled');
    expect(group0Item0Button).to.include.text('Bar One');
    expect(await getByKey(group0Item0Button, 'conflict_message')).to.not.exist;
    expect(await getByTag(group0Item0Button, 'img')).to.have.attribute(
      'src',
      'https://static.www.foxycart.com/email/v2/email_header_logo.png?type=bar_one'
    );
  });

  describe('OAuth connections', () => {
    type ConnectResponse = { status: number; body: unknown };

    async function setup(params: {
      gateway?: Record<string, unknown>;
      isLive?: boolean;
      response?: ConnectResponse;
      /** Holds the connect response until `release()` is called. */
      hold?: boolean;
    }) {
      const dataset = createDataset();
      dataset.payment_method_sets[0].is_live = params.isLive ?? false;
      const hostedHelper = dataset.property_helpers[1] as unknown as {
        values: Record<string, unknown>;
      };
      hostedHelper.values.paypal_platform = { name: 'PayPal' };
      if (params.gateway) Object.assign(dataset.hosted_payment_gateways[0], params.gateway);

      const router = createHapiRouter({ defaults, dataset, links });
      const requests: { url: string; body: unknown }[] = [];
      const response = params.response ?? {
        status: 201,
        body: { connection_url: 'https://gateway.test/connect' },
      };

      let release: () => void = () => undefined;
      const gate = params.hold ? new Promise<void>(r => (release = r)) : Promise.resolve();

      const handleFetch = async (evt: FetchEvent) => {
        if (evt.request.url.endsWith('/connect_gateway')) {
          const request = evt.request.clone();
          evt.respondWith(
            request.json().then(async body => {
              requests.push({ url: request.url, body });
              await gate;
              return new Response(JSON.stringify(response.body), { status: response.status });
            })
          );
        } else if (evt.request.url.startsWith('https://demo.api/')) {
          router.handleEvent(evt);
        }
      };

      const wrapper = await fixture(html`
        <div @fetch=${handleFetch}>
          <foxy-payments-api
            payment-method-set-hosted-payment-gateways-url="https://demo.api/hapi/payment_method_set_hosted_payment_gateways"
            hosted-payment-gateways-helper-url="https://demo.api/hapi/property_helpers/1"
            hosted-payment-gateways-url="https://demo.api/hapi/hosted_payment_gateways"
            payment-gateways-helper-url="https://demo.api/hapi/property_helpers/0"
            payment-method-sets-url="https://demo.api/hapi/payment_method_sets"
            fraud-protections-url="https://demo.api/hapi/fraud_protections"
            payment-gateways-url="https://demo.api/hapi/payment_gateways"
          >
            <foxy-payments-api-payment-method-form
              payment-preset="https://foxy-payments-api.element/payment_presets/0"
              store="https://demo.api/hapi/stores/0"
              href=${params.gateway
                ? 'https://foxy-payments-api.element/payment_presets/0/payment_methods/H0C0'
                : ''}
              .getConnectRedirectUrl=${(preset: string) =>
                `https://admin.example.com/return?preset=${encodeURIComponent(preset)}`}
            >
            </foxy-payments-api-payment-method-form>
          </foxy-payments-api>
        </div>
      `);

      const element = wrapper.firstElementChild!.firstElementChild as Form;
      const redirect = stub(element as any, '__redirect');

      if (params.gateway) await waitUntil(() => !!element.data, '', { timeout: 5000 });

      for (const id of ['paymentPresetLoader', 'availablePaymentMethodsLoader']) {
        await waitUntil(
          async () => {
            await element.requestUpdate();
            const loader = element.renderRoot.querySelector<NucleonElement<any>>(`#${id}`);
            return !!loader?.data;
          },
          '',
          { timeout: 5000 }
        );
      }

      await element.requestUpdate();
      return { element, requests, redirect, release };
    }

    it('lists each PayPal product type in the new payment method list with a redirect notice', async () => {
      const { element } = await setup({});
      const list = element.renderRoot.querySelector('[data-testid="select-method-list"]')!;
      const ppcp = list.querySelector('[data-testid="connect-paypal_platform.ppcp"]');
      const express = list.querySelector(
        '[data-testid="connect-paypal_platform.express_checkout"]'
      );

      expect(ppcp).to.include.text('connection.paypal_platform.ppcp.label');
      expect(ppcp).to.include.text('connection.paypal_platform.ppcp.description');
      expect(ppcp).to.include.text('connection.redirect_notice');
      expect(express).to.include.text('connection.paypal_platform.express_checkout.label');
      expect(express).to.include.text('connection.redirect_notice');
    });

    it('posts to the payment preset connect link on click and sends the browser to connection_url', async () => {
      const { element, requests, redirect, release } = await setup({ hold: true });
      const button = element.renderRoot.querySelector<HTMLButtonElement>(
        '[data-testid="connect-paypal_platform.express_checkout"]'
      )!;

      button.click();

      await waitUntil(
        async () => {
          await element.requestUpdate();
          return !!button.querySelector('[data-testid="connect-spinner"]');
        },
        '',
        { timeout: 5000 }
      );

      expect(element.form.type).to.not.exist;
      expect(button).to.have.property('disabled', true);
      expect(redirect).to.not.have.been.called;

      release();
      await waitUntil(() => redirect.called, '', { timeout: 5000 });

      expect(requests).to.deep.equal([
        {
          url: 'https://demo.api/hapi/payment_method_sets/0/connect_gateway',
          body: {
            type: 'paypal_platform',
            final_redirect: `https://admin.example.com/return?preset=${encodeURIComponent(
              'https://foxy-payments-api.element/payment_presets/0'
            )}`,
            options: { paypal_product_type: 'express_checkout' },
          },
        },
      ]);

      expect(redirect).to.have.been.calledOnceWith('https://gateway.test/connect');
    });

    async function clickAndWaitForStatus(element: Form, testId: string) {
      element.renderRoot.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!.click();

      await waitUntil(
        async () => {
          await element.requestUpdate();
          return !!element.status;
        },
        '',
        { timeout: 5000 }
      );
    }

    it('replaces the API country error for ppcp with its own error status', async () => {
      const message =
        "PayPal direct card payments ('ppcp') are not supported in your store's country. Please use 'express_checkout' instead.";

      const { element, redirect } = await setup({
        response: {
          status: 403,
          body: { _embedded: { 'fx:errors': [{ logref: 'id-1', message }] } },
        },
      });

      await clickAndWaitForStatus(element, 'connect-paypal_platform.ppcp');

      expect(element.status).to.deep.equal({
        key: 'connect_error_ppcp_unsupported',
        type: 'error',
      });
      const status = element.renderRoot.querySelector('[data-testid="status"]')!;
      expect(status).to.have.class('bg-error-10');
      expect(status.querySelector('[key="connect_error_ppcp_unsupported"]')).to.exist;
      expect(redirect).to.not.have.been.called;
      expect(element.renderRoot.querySelector('[data-testid="connect-spinner"]')).to.not.exist;
      expect(element.renderRoot.querySelector('[data-testid="select-method-list"]')).to.exist;
    });

    it('shows other API error messages as they are', async () => {
      const message = 'Sorry but we can not generate connection URL for paypal_platform gateway.';
      const { element, redirect } = await setup({
        response: {
          status: 403,
          body: { _embedded: { 'fx:errors': [{ logref: 'id-1', message }] } },
        },
      });

      await clickAndWaitForStatus(element, 'connect-paypal_platform.ppcp');

      expect(element.status).to.deep.equal({
        key: 'connect_error',
        options: { message },
        type: 'error',
      });

      const status = element.renderRoot.querySelector('[data-testid="status"]')!;
      expect(status.querySelector('[key="connect_error"]')).to.have.deep.property('options', {
        message,
      });

      expect(redirect).to.not.have.been.called;
    });

    it('shows a generic error status when the API returns no connection_url', async () => {
      const { element, redirect } = await setup({
        response: { status: 201, body: { connection_url: null } },
      });

      await clickAndWaitForStatus(element, 'connect-paypal_platform.express_checkout');

      expect(element.status).to.deep.equal({ key: 'connect_error_unknown', type: 'error' });
      expect(redirect).to.not.have.been.called;
    });

    it('shows the connected email for the current mode and hides the credential fields', async () => {
      const gateway = {
        type: 'paypal_platform',
        account_id: 'live@example.com',
        test_account_id: 'test@example.com',
      };

      const { element: testElement } = await setup({ gateway, isLive: false });
      const testStatus = testElement.renderRoot.querySelector('[key="status_connected"]');
      expect(testStatus).to.have.deep.property('options', { email: 'test@example.com' });
      expect(testElement.renderRoot.querySelector('[infer="test-account-id"]')).to.not.exist;

      const { element: liveElement } = await setup({ gateway, isLive: true });
      const liveStatus = liveElement.renderRoot.querySelector('[key="status_connected"]');
      expect(liveStatus).to.have.deep.property('options', { email: 'live@example.com' });
    });

    it('offers reconnecting with card payments when the account is connected for PayPal only', async () => {
      const { element, requests, redirect } = await setup({
        gateway: {
          type: 'paypal_platform',
          test_account_id: 'test@example.com',
          test_third_party_key: '',
        },
      });

      const button = element.renderRoot.querySelector<HTMLElement>(
        '[data-testid="connect-paypal_platform.reconnect_with_cards"]'
      );

      expect(button).to.exist;
      expect(element.renderRoot.querySelector('[data-testid="connect-paypal_platform.reconnect"]'))
        .to.not.exist;

      button!.click();
      await waitUntil(() => redirect.called, '', { timeout: 5000 });

      expect(requests[0].url).to.equal(
        'https://demo.api/hapi/hosted_payment_gateways/0/connect_gateway'
      );
      expect(requests[0].body).to.have.deep.property('options', { paypal_product_type: 'ppcp' });
      expect(requests[0].body).to.have.property('type', 'paypal_platform');
    });

    it('hides the reconnect rows but keeps the connected email when read-only', async () => {
      for (const setReadonly of [
        (form: Form) => (form.readonly = true),
        (form: Form) => form.setAttribute('readonlycontrols', 'connection'),
      ]) {
        const { element } = await setup({
          gateway: {
            type: 'paypal_platform',
            test_account_id: 'test@example.com',
            test_third_party_key: '',
          },
        });

        setReadonly(element);
        await element.requestUpdate();

        const root = element.renderRoot;
        expect(root.querySelector('[key="status_connected"]')).to.exist;
        expect(root.querySelector('[key="paypal_platform.reconnect_with_cards.label"]')).to.not
          .exist;
        expect(root.querySelector('[data-testid="connect-paypal_platform.reconnect_with_cards"]'))
          .to.not.exist;
      }
    });

    it('offers a plain reconnect when card payments are already connected', async () => {
      const { element } = await setup({
        gateway: {
          type: 'paypal_platform',
          test_account_id: 'test@example.com',
          test_third_party_key: 'MERCHANT123',
        },
      });

      expect(element.renderRoot.querySelector('[data-testid="connect-paypal_platform.reconnect"]'))
        .to.exist;
      expect(
        element.renderRoot.querySelector(
          '[data-testid="connect-paypal_platform.reconnect_with_cards"]'
        )
      ).to.not.exist;
    });

    it('offers a new connection for an existing gateway that is not connected in the current mode', async () => {
      const { element } = await setup({
        gateway: { type: 'paypal_platform', account_id: 'live@example.com', test_account_id: '' },
        isLive: false,
      });

      expect(element.renderRoot.querySelector('[key="status_connected"]')).to.not.exist;
      expect(element.renderRoot.querySelector('[data-testid="connect-paypal_platform.ppcp"]')).to
        .exist;
    });
  });
});
