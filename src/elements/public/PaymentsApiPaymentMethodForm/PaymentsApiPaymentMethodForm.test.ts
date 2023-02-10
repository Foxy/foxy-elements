import type { FetchEvent } from '../NucleonElement/FetchEvent';

import '../PaymentsApi/index';
import './index';

import { PaymentsApiPaymentMethodForm as Form } from './PaymentsApiPaymentMethodForm';
import { InternalAsyncComboBoxControl } from '../../internal/InternalAsyncComboBoxControl/InternalAsyncComboBoxControl';
import { InternalCheckboxGroupControl } from '../../internal/InternalCheckboxGroupControl/InternalCheckboxGroupControl';
import { InternalRadioGroupControl } from '../../internal/InternalRadioGroupControl/InternalRadioGroupControl';
import { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server/index';
import { getByTestId } from '../../../testgen/getByTestId';
import { getByKey } from '../../../testgen/getByKey';
import { I18n } from '../I18n/I18n';
import { AvailablePaymentMethods } from '../PaymentsApi/api/types';
import { getByTag } from '../../../testgen/getByTag';

describe('PaymentsApiPaymentMethodForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines vaadin-button', () => {
    expect(customElements.get('vaadin-button')).to.exist;
  });

  it('imports and defines vaadin-tabs', () => {
    expect(customElements.get('vaadin-tabs')).to.exist;
  });

  it('imports and defines foxy-internal-async-combo-box-control', () => {
    const element = customElements.get('foxy-internal-async-combo-box-control');
    expect(element).to.equal(InternalAsyncComboBoxControl);
  });

  it('imports and defines foxy-internal-checkbox-group-control', () => {
    const element = customElements.get('foxy-internal-checkbox-group-control');
    expect(element).to.equal(InternalCheckboxGroupControl);
  });

  it('imports and defines foxy-internal-radio-group-control', () => {
    const element = customElements.get('foxy-internal-radio-group-control');
    expect(element).to.equal(InternalRadioGroupControl);
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

    form.edit({ type: '' });
    expect(form.errors).to.include('type:v8n_required');

    form.edit({ type: 'Test' });
    expect(form.errors).to.not.include('type:v8n_required');
  });

  it('produces the additional-fields:v8n_invalid error if some of the required additional fields are empty', async () => {
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
            parent="https://foxy-payments-api.element/payment_presets/0/payment_methods"
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

    form.edit({ additional_fields: JSON.stringify({ foo: { bar: { baz: 'test' } } }) });
    expect(form.errors).to.not.include('additional-fields:v8n_invalid');
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
            parent="https://foxy-payments-api.element/payment_presets/0/payment_methods"
            .getImageSrc=${(type: string) => `https://example.com/${type}.png`}
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
    const title = (await getByKey(element, 'select_method_title')) as I18n;
    const list = (await getByTestId(element, 'select-method-list')) as HTMLElement;

    expect(title).to.exist;
    expect(title).to.have.attribute('infer', '');

    await waitUntil(() => !!list.querySelector('li'), '', { timeout: 5000 });
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
    const group1Item1ButtonConflict = await getByKey(group1Item1Button, 'conflict_message');

    expect(group0Item0Button).to.exist;
    expect(group0Item0Button).to.not.have.attribute('disabled');
    expect(group0Item0Button).to.include.text('Bar One');
    expect(await getByKey(group0Item0Button, 'conflict_message')).to.not.exist;
    expect(await getByTag(group0Item0Button, 'img')).to.have.attribute(
      'src',
      'https://example.com/bar_one.png'
    );

    expect(group1Item0Button).to.exist;
    expect(group1Item0Button).to.not.have.attribute('disabled');
    expect(group1Item0Button).to.include.text('Foo One');
    expect(await getByKey(group1Item0Button, 'conflict_message')).to.not.exist;
    expect(await getByTag(group1Item0Button, 'img')).to.have.attribute(
      'src',
      'https://example.com/foo_one.png'
    );

    expect(group1Item1Button).to.exist;
    expect(group1Item1Button).to.have.attribute('disabled');
    expect(group1Item1Button).to.include.text('Foo Two');
    expect(await getByTag(group1Item1Button, 'img')).to.have.attribute(
      'src',
      'https://example.com/foo_two.png'
    );
    expect(group1Item1ButtonConflict).to.exist;
    expect(group1Item1ButtonConflict).to.have.attribute('infer', '');
    expect(group1Item1ButtonConflict).to.have.deep.property('options', {
      type: 'foo_one',
      name: 'Foo One',
    });

    group0Item0Button.click();
    await element.updateComplete;

    expect(element).to.have.nested.property('form.type', 'bar_one');
    expect(await getByKey(element, 'select_method_title')).to.not.exist;
    expect(await getByTestId(element, 'select-method-list')).to.not.exist;
  });

  it('renders a payment method logo and name when "type" is selected', async () => {
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
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
            .getImageSrc=${(type: string) => `https://example.com/${type}.png`}
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const figure = (await getByTestId(element, 'logo')) as HTMLElement;
    const img = (await getByTag(figure, 'img')) as HTMLImageElement;
    const caption = (await getByTag(figure, 'figcaption')) as HTMLElement;

    expect(img).to.have.attribute('src', `https://example.com/${element.form.type}.png`);
    expect(caption).to.include.text(element.form.helper!.name);
  });

  it('renders tabs for live and test credentials', async () => {
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
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const tabs = (await getByTag(element, 'vaadin-tabs')) as HTMLElement;
    const tab1 = tabs.querySelector('vaadin-tab:nth-of-type(1)') as HTMLElement;
    const tab1Label = tab1.querySelector('foxy-i18n') as HTMLElement;
    const tab2 = tabs.querySelector('vaadin-tab:nth-of-type(2)') as HTMLElement;
    const tab2Label = tab2.querySelector('foxy-i18n') as HTMLElement;
    const tabContent = (await getByTestId(element, 'tab-content')) as HTMLElement;

    expect(tabs.querySelectorAll('vaadin-tab')).to.have.length(2);
    expect(tab1Label).to.have.attribute('infer', '');
    expect(tab1Label).to.have.attribute('key', 'tab_live');
    expect(tab2Label).to.have.attribute('infer', '');
    expect(tab2Label).to.have.attribute('key', 'tab_test');

    tabs.setAttribute('selected', '0');
    tabs.dispatchEvent(new CustomEvent('selected-changed'));
    await element.updateComplete;

    expect(tabContent.style.getPropertyValue('--tw-translate-x').trim()).to.equal('0');

    tabs.setAttribute('selected', '1');
    tabs.dispatchEvent(new CustomEvent('selected-changed'));
    await element.updateComplete;

    expect(tabContent.style.getPropertyValue('--tw-translate-x').trim()).to.equal(
      'calc(-50% - (var(--lumo-space-m) / 2))'
    );
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
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.edit({ helper: { ...element.data!.helper, id_description: 'Test ID Description' } });
    const tabContent = (await getByTestId(element, 'tab-content')) as HTMLElement;

    for (let index = 0; index < 2; ++index) {
      const type = index === 0 ? 'live' : 'test';
      const prefix = index === 0 ? '' : `-${type}`;
      const tabPanel = tabContent.children[index] as HTMLElement;
      const field = tabPanel.querySelector(`[infer="${prefix}account-id"]`);

      expect(field).to.exist;
      expect(field).to.be.instanceOf(InternalTextControl);
      expect(field).to.have.attribute('placeholder', 'default_additional_field_placeholder');
      expect(field).to.have.attribute('helper-text', '');
      expect(field).to.have.attribute('label', element.form.helper!.id_description);
    }

    element.edit({ helper: { ...element.data!.helper, id_description: '' } });
    await element.updateComplete;

    for (let index = 0; index < 2; ++index) {
      const type = index === 0 ? 'live' : 'test';
      const prefix = index === 0 ? '' : `-${type}`;
      const tabPanel = tabContent.children[index] as HTMLElement;
      const field = tabPanel.querySelector(`[infer="${prefix}account-id"]`);

      expect(field).to.not.exist;
    }
  });

  it('renders a text control for live and test 3rd-party key if applicable', async () => {
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

    const tabContent = (await getByTestId(element, 'tab-content')) as HTMLElement;

    for (let index = 0; index < 2; ++index) {
      const type = index === 0 ? 'live' : 'test';
      const prefix = index === 0 ? '' : `-${type}`;
      const tabPanel = tabContent.children[index] as HTMLElement;
      const field = tabPanel.querySelector(`[infer="${prefix}third-party-key"]`);

      expect(field).to.exist;
      expect(field).to.be.instanceOf(InternalTextControl);
      expect(field).to.have.attribute('placeholder', 'default_additional_field_placeholder');
      expect(field).to.have.attribute('helper-text', '');
      expect(field).to.have.attribute('label', element.form.helper!.third_party_key_description);
    }

    element.edit({ helper: { ...element.data!.helper, third_party_key_description: '' } });
    await element.updateComplete;

    for (let index = 0; index < 2; ++index) {
      const type = index === 0 ? 'live' : 'test';
      const prefix = index === 0 ? '' : `-${type}`;
      const tabPanel = tabContent.children[index] as HTMLElement;
      const field = tabPanel.querySelector(`[infer="${prefix}third-party-key"]`);

      expect(field).to.not.exist;
    }
  });

  it('renders a text control for live and test account key if applicable', async () => {
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
            href="https://foxy-payments-api.element/payment_presets/0/payment_methods/R0"
          >
          </foxy-payments-api-payment-method-form>
        </foxy-payments-api>
      </div>
    `);

    const element = wrapper.firstElementChild!.firstElementChild as Form;
    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.edit({ helper: { ...element.data!.helper, key_description: 'Test key description' } });
    const tabContent = (await getByTestId(element, 'tab-content')) as HTMLElement;

    for (let index = 0; index < 2; ++index) {
      const type = index === 0 ? 'live' : 'test';
      const prefix = index === 0 ? '' : `-${type}`;
      const tabPanel = tabContent.children[index] as HTMLElement;
      const field = tabPanel.querySelector(`[infer="${prefix}account-key"]`);

      expect(field).to.exist;
      expect(field).to.be.instanceOf(InternalTextControl);
      expect(field).to.have.attribute('placeholder', 'default_additional_field_placeholder');
      expect(field).to.have.attribute('helper-text', '');
      expect(field).to.have.attribute('label', element.form.helper!.key_description);
    }

    element.edit({ helper: { ...element.data!.helper, key_description: '' } });
    await element.updateComplete;

    for (let index = 0; index < 2; ++index) {
      const type = index === 0 ? 'live' : 'test';
      const prefix = index === 0 ? '' : `-${type}`;
      const tabPanel = tabContent.children[index] as HTMLElement;
      const field = tabPanel.querySelector(`[infer="${prefix}account-key"]`);

      expect(field).to.not.exist;
    }
  });

  it('renders a checkbox control for a live "checkbox" block in additional fields if present', async () => {
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

    const tabContent = (await getByTestId(element, 'tab-content')) as HTMLElement;
    const tabPanel = tabContent.children[0] as HTMLElement;
    const field = tabPanel.querySelector(
      '[infer="additional-fields-foo-bar-baz"]'
    ) as InternalCheckboxGroupControl;

    expect(field).to.exist;
    expect(field).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(field).to.have.attribute('helper-text', 'Baz Description');
    expect(field).to.have.attribute('label', '');
    expect(field).to.have.deep.property('options', [{ label: 'Baz', value: 'checked' }]);

    element.edit({ additional_fields: JSON.stringify({ foo: { bar: { baz: true } } }) });
    expect(field.getValue()).to.deep.equal(['checked']);

    field.setValue([]);
    expect(JSON.parse(element.form.additional_fields!)).to.have.nested.property(
      'foo.bar.baz',
      false
    );
  });

  it('renders a checkbox control for a test "checkbox" block in additional fields if present', async () => {
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

    const tabContent = (await getByTestId(element, 'tab-content')) as HTMLElement;
    const tabPanel = tabContent.children[1] as HTMLElement;
    const field = tabPanel.querySelector(
      '[infer="additional-fields-foo-bar-baz"]'
    ) as InternalCheckboxGroupControl;

    expect(field).to.exist;
    expect(field).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(field).to.have.attribute('helper-text', 'Baz Description');
    expect(field).to.have.attribute('label', '');
    expect(field).to.have.deep.property('options', [{ label: 'Baz', value: 'checked' }]);

    element.edit({ additional_fields: JSON.stringify({ foo: { bar: { baz: true } } }) });
    expect(field.getValue()).to.deep.equal(['checked']);

    field.setValue([]);
    expect(JSON.parse(element.form.additional_fields!)).to.have.nested.property(
      'foo.bar.baz',
      false
    );
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

    const tabContent = (await getByTestId(element, 'tab-content')) as HTMLElement;
    const tabPanel = tabContent.children[0] as HTMLElement;
    const field = tabPanel.querySelector(
      '[infer="additional-fields-foo-bar-baz"]'
    ) as InternalSelectControl;

    expect(field).to.exist;
    expect(field).to.be.instanceOf(InternalSelectControl);
    expect(field).to.have.attribute('helper-text', 'Baz Description');
    expect(field).to.have.attribute('label', 'Baz');
    expect(field).to.have.deep.property('options', [
      { label: 'Field 1', value: 'field_1_value' },
      { label: 'Field 2', value: 'field_2_value' },
    ]);

    element.edit({ additional_fields: JSON.stringify({ foo: { bar: { baz: 'field_1_value' } } }) });
    expect(field.getValue()).to.deep.equal('field_1_value');

    field.setValue('field_2_value');
    expect(JSON.parse(element.form.additional_fields!)).to.have.nested.property(
      'foo.bar.baz',
      'field_2_value'
    );
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

    const tabContent = (await getByTestId(element, 'tab-content')) as HTMLElement;
    const tabPanel = tabContent.children[1] as HTMLElement;
    const field = tabPanel.querySelector(
      '[infer="additional-fields-foo-bar-baz"]'
    ) as InternalSelectControl;

    expect(field).to.exist;
    expect(field).to.be.instanceOf(InternalSelectControl);
    expect(field).to.have.attribute('helper-text', 'Baz Description');
    expect(field).to.have.attribute('label', 'Baz');
    expect(field).to.have.deep.property('options', [
      { label: 'Field 1', value: 'field_1_value' },
      { label: 'Field 2', value: 'field_2_value' },
    ]);

    element.edit({ additional_fields: JSON.stringify({ foo: { bar: { baz: 'field_1_value' } } }) });
    expect(field.getValue()).to.deep.equal('field_1_value');

    field.setValue('field_2_value');
    expect(JSON.parse(element.form.additional_fields!)).to.have.nested.property(
      'foo.bar.baz',
      'field_2_value'
    );
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

    const tabContent = (await getByTestId(element, 'tab-content')) as HTMLElement;
    const tabPanel = tabContent.children[0] as HTMLElement;
    const field = tabPanel.querySelector(
      '[infer="additional-fields-foo-bar-baz"]'
    ) as InternalTextControl;

    expect(field).to.exist;
    expect(field).to.be.instanceOf(InternalTextControl);
    expect(field).to.have.attribute('placeholder', 'baz_default');
    expect(field).to.have.attribute('helper-text', 'Baz Description');
    expect(field).to.have.attribute('label', 'Baz');

    element.edit({ additional_fields: JSON.stringify({ foo: { bar: { baz: 'test_value' } } }) });
    expect(field.getValue()).to.deep.equal('test_value');

    field.setValue('another_value');
    expect(JSON.parse(element.form.additional_fields!)).to.have.nested.property(
      'foo.bar.baz',
      'another_value'
    );
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

    const tabContent = (await getByTestId(element, 'tab-content')) as HTMLElement;
    const tabPanel = tabContent.children[1] as HTMLElement;
    const field = tabPanel.querySelector(
      '[infer="additional-fields-foo-bar-baz"]'
    ) as InternalTextControl;

    expect(field).to.exist;
    expect(field).to.be.instanceOf(InternalTextControl);
    expect(field).to.have.attribute('placeholder', 'baz_default');
    expect(field).to.have.attribute('helper-text', 'Baz Description');
    expect(field).to.have.attribute('label', 'Baz');

    element.edit({ additional_fields: JSON.stringify({ foo: { bar: { baz: 'test_value' } } }) });
    expect(field.getValue()).to.deep.equal('test_value');

    field.setValue('another_value');
    expect(JSON.parse(element.form.additional_fields!)).to.have.nested.property(
      'foo.bar.baz',
      'another_value'
    );
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
  });

  it('renders a radio group control for toggling 3DS on and off if supported', async () => {
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
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[infer="three-d-secure-toggle"]')).to.not.exist;

    element.data!.helper.supports_3d_secure = 1;
    element.data = { ...element.data! };
    await element.updateComplete;
    const control = element.renderRoot.querySelector(
      '[infer="three-d-secure-toggle"]'
    ) as InternalRadioGroupControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalRadioGroupControl);
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

  it('renders a checkbox control for requiring valid 3DS response if applicable', async () => {
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
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[infer="three-d-secure-response"]')).to.not.exist;

    element.data!.helper.supports_3d_secure = 1;
    element.data!.config_3d_secure = 'all_cards';
    element.data = { ...element.data! };
    await element.updateComplete;
    const control = element.renderRoot.querySelector(
      '[infer="three-d-secure-response"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { value: 'valid_only', label: 'option_valid_only' },
    ]);

    element.edit({ config_3d_secure: 'all_cards' });
    expect(control.getValue()).to.deep.equal([]);

    element.edit({ config_3d_secure: 'all_cards_require_valid_response' });
    expect(control.getValue()).to.deep.equal(['valid_only']);

    element.edit({ config_3d_secure: 'maestro_only' });
    expect(control.getValue()).to.deep.equal([]);

    element.edit({ config_3d_secure: 'maestro_only_require_valid_response' });
    expect(control.getValue()).to.deep.equal(['valid_only']);

    element.edit({ config_3d_secure: 'all_cards' });
    control.setValue(['valid_only']);
    expect(element).to.have.nested.property(
      'form.config_3d_secure',
      'all_cards_require_valid_response'
    );

    element.edit({ config_3d_secure: 'all_cards' });
    control.setValue([]);
    expect(element).to.have.nested.property('form.config_3d_secure', 'all_cards');

    element.edit({ config_3d_secure: 'maestro_only' });
    control.setValue(['valid_only']);
    expect(element).to.have.nested.property(
      'form.config_3d_secure',
      'maestro_only_require_valid_response'
    );

    element.edit({ config_3d_secure: 'maestro_only' });
    control.setValue([]);
    expect(element).to.have.nested.property('form.config_3d_secure', 'maestro_only');
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
            parent="https://foxy-payments-api.element/payment_presets/0/payment_methods"
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
    await element.updateComplete;
    const control = (await getByTestId(
      element,
      'select-another-button'
    )) as InternalCheckboxGroupControl;

    expect(control).to.exist;
    expect(control).to.be.instanceOf(customElements.get('vaadin-button'));

    const label = control.querySelector('foxy-i18n');
    expect(label).to.have.attribute('infer', '');
    expect(label).to.have.attribute('key', 'select_another_button_label');

    control.click();
    await element.updateComplete;

    expect(element).to.not.have.nested.property('form.type');
    expect(element.renderRoot.querySelector('[infer="select-another-button"]')).to.not.exist;
  });
});
