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
            .getImageSrc=${(type: string) => `https://example.com?type=${type}`}
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
    const groups = list.querySelectorAll('ul');
    const headers = list.querySelectorAll('p');

    expect(list).to.exist;
    expect(groups).to.have.length(2);
    expect(headers).to.have.length(2);

    expect(headers[0]).to.have.text('B');
    expect(headers[1]).to.have.text('F');

    const group0Items = groups[0].querySelectorAll('li');
    const group1Items = groups[1].querySelectorAll('li');

    expect(group0Items).to.have.length(1);
    expect(group1Items).to.have.length(2);

    const group0Item0Button = group0Items[0].querySelector('button') as HTMLButtonElement;
    const group1Item0Button = group1Items[0].querySelector('button') as HTMLButtonElement;
    const group1Item1Button = group1Items[1].querySelector('button') as HTMLButtonElement;

    expect(group0Item0Button).to.exist;
    expect(group0Item0Button).to.not.have.attribute('disabled');
    expect(group0Item0Button).to.include.text('Bar One');
    expect(await getByKey(group0Item0Button, 'conflict_message')).to.not.exist;
    expect(await getByTag(group0Item0Button, 'img')).to.have.attribute(
      'src',
      'https://example.com?type=bar_one'
    );

    expect(group1Item0Button).to.exist;
    expect(group1Item0Button).to.not.have.attribute('disabled');
    expect(group1Item0Button).to.include.text('Foo One');
    expect(await getByKey(group1Item0Button, 'conflict_message')).to.not.exist;
    expect(await getByTag(group1Item0Button, 'img')).to.have.attribute(
      'src',
      'https://example.com?type=foo_one'
    );

    expect(group1Item1Button).to.exist;
    expect(group1Item1Button).to.have.attribute('disabled');
    expect(group1Item1Button).to.include.text('Foo Two');
    expect(await getByTag(group1Item1Button, 'img')).to.have.attribute(
      'src',
      'https://example.com?type=foo_two'
    );
    expect(group1Item1Button).to.have.attribute('title', 'conflict_message');

    group0Item0Button.click();
    await element.requestUpdate();

    expect(element).to.have.nested.property('form.type', 'bar_one');
    expect(await getByKey(element, 'select_method_title')).to.not.exist;
    expect(await getByTestId(element, 'select-method-list')).to.not.exist;
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
            .getImageSrc=${(type: string) => `https://example.com?type=${type}`}
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
    const groups = list.querySelectorAll('ul');
    const headers = list.querySelectorAll('p');

    expect(list).to.exist;
    expect(groups).to.have.length(2);
    expect(headers).to.have.length(2);

    expect(headers[0]).to.have.text('B');
    expect(headers[1]).to.have.text('F');

    const group0Items = groups[0].querySelectorAll('li');
    const group1Items = groups[1].querySelectorAll('li');

    expect(group0Items).to.have.length(1);
    expect(group1Items).to.have.length(1);

    const group0Item0Button = group0Items[0]?.querySelector('button');
    const group1Item0Button = group1Items[0]?.querySelector('button');
    const group1Item1Button = group1Items[1]?.querySelector('button');

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
      'square_up',
      'quickbook_payments',
      'amazon_mws',
      'paypal_platform',
    ];

    for (const type of oauthGateways) {
      element.edit({ type });
      await element.requestUpdate();

      const warning = element.renderRoot.querySelector('[key="no_oauth_support_message"]');
      expect(warning).to.exist;
      expect(warning).to.have.property('localName', 'foxy-i18n');
      expect(warning).to.have.attribute('infer', '');
    }

    element.edit({ type: 'any_other_gateway' });
    await element.requestUpdate();
    const warning = element.renderRoot.querySelector('[key="no_oauth_support_message"]');
    expect(warning).to.not.exist;
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

    // @ts-expect-error SDK typings are incomplete
    element.data!.helper.supports_card_verification = false;
    element.data = { ...element.data! };
    await element.requestUpdate();

    expect(element.renderRoot.querySelector('[infer="card-verification"]')).to.not.exist;

    // @ts-expect-error SDK typings are incomplete
    element.data!.helper.supports_card_verification = true;
    element.data = { ...element.data! };
    await element.requestUpdate();
    const control = element.renderRoot.querySelector(
      '[infer="card-verification"]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', [
      { value: 'disabled', label: 'option_disabled' },
      { value: 'enabled_automatically', label: 'option_enabled_automatically' },
      { value: 'enabled_override', label: 'option_enabled_override' },
    ]);
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

    // @ts-expect-error SDK typings are incomplete
    element.data!.helper.supports_card_verification = true;
    // @ts-expect-error SDK typings are incomplete
    element.data!.helper.card_verification_config =
      '{"verification_amounts": {"visa": 1, "mastercard": 1, "american_express": 1, "discover": 1, "default": 1}}';
    element.data = { ...element.data! };
    // @ts-expect-error SDK typings are incomplete
    element.edit({ card_verification: 'enabled_automatically' });
    await element.requestUpdate();

    ['test', 'live'].map(group => {
      ['visa', 'mastercard', 'american-express', 'discover', 'default'].map(type => {
        const control = element.renderRoot.querySelector(
          `[infer="${group}-group"] [infer="card-verification-config-verification-amounts-${type}"]`
        );

        expect(control).to.exist;
        expect(control).to.be.instanceOf(InternalNumberControl);
        expect(control).to.have.attribute(
          'json-template',
          // @ts-expect-error SDK typings are incomplete
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
});
