import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { InternalAsyncResourceLinkListControl } from '../../internal/InternalAsyncResourceLinkListControl/InternalAsyncResourceLinkListControl';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { StoreShippingMethodForm as Form } from './StoreShippingMethodForm';
import { InternalResourcePickerControl } from '../../internal/InternalResourcePickerControl/InternalResourcePickerControl';
import { InternalCheckboxGroupControl } from '../../internal/InternalCheckboxGroupControl/InternalCheckboxGroupControl';
import { InternalPasswordControl } from '../../internal/InternalPasswordControl/InternalPasswordControl';
import { InternalSourceControl } from '../../internal/InternalSourceControl/InternalSourceControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import { Resource } from '@foxy.io/sdk/core';
import { Rels } from '@foxy.io/sdk/backend';

describe('StoreShippingMethodForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-async-resource-link-list-control', () => {
    const element = customElements.get('foxy-internal-async-resource-link-list-control');
    expect(element).to.equal(InternalAsyncResourceLinkListControl);
  });

  it('imports and defines foxy-internal-resource-picker-control', () => {
    const element = customElements.get('foxy-internal-resource-picker-control');
    expect(element).to.equal(InternalResourcePickerControl);
  });

  it('imports and defines foxy-internal-checkbox-group-control', () => {
    const element = customElements.get('foxy-internal-checkbox-group-control');
    expect(element).to.equal(InternalCheckboxGroupControl);
  });

  it('imports and defines foxy-internal-source-control', () => {
    const element = customElements.get('foxy-internal-source-control');
    expect(element).to.equal(InternalSourceControl);
  });

  it('imports and defines foxy-internal-password-control', () => {
    const element = customElements.get('foxy-internal-password-control');
    expect(element).to.equal(InternalPasswordControl);
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

  it('imports and defines itself as foxy-store-shipping-method-form', () => {
    const element = customElements.get('foxy-store-shipping-method-form');
    expect(element).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace "store-shipping-method-form"', () => {
    expect(Form).to.have.property('defaultNS', 'store-shipping-method-form');
    expect(new Form()).to.have.property('ns', 'store-shipping-method-form');
  });

  it('has a reactive property "shippingMethods"', () => {
    expect(new Form()).to.have.property('shippingMethods', null);
    expect(Form).to.have.nested.property('properties.shippingMethods');
    expect(Form).to.not.have.nested.property('properties.shippingMethods.type');
    expect(Form).to.have.nested.property(
      'properties.shippingMethods.attribute',
      'shipping-methods'
    );
  });

  it('produces the shipping-method-uri:v8n_required error if value is empty', () => {
    const form = new Form();

    form.edit({ shipping_method_uri: '' });
    expect(form.errors).to.include('shipping-method-uri:v8n_required');

    form.edit({ shipping_method_uri: 'https://example.com' });
    expect(form.errors).to.not.include('shipping-method-uri:v8n_required');
  });

  it('produces the accountid:v8n_too_long error if value is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ accountid: 'A'.repeat(51) });
    expect(form.errors).to.include('accountid:v8n_too_long');

    form.edit({ accountid: 'A'.repeat(50) });
    expect(form.errors).to.not.include('accountid:v8n_too_long');
  });

  it('produces the password:v8n_too_long error if value is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ password: 'A'.repeat(51) });
    expect(form.errors).to.include('password:v8n_too_long');

    form.edit({ password: 'A'.repeat(50) });
    expect(form.errors).to.not.include('password:v8n_too_long');
  });

  it('produces the meter-number:v8n_too_long error if value is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ meter_number: 'A'.repeat(51) });
    expect(form.errors).to.include('meter-number:v8n_too_long');

    form.edit({ meter_number: 'A'.repeat(50) });
    expect(form.errors).to.not.include('meter-number:v8n_too_long');
  });

  it('produces the authentication-key:v8n_too_long error if value is longer than 50 characters', () => {
    const form = new Form();

    form.edit({ authentication_key: 'A'.repeat(51) });
    expect(form.errors).to.include('authentication-key:v8n_too_long');

    form.edit({ authentication_key: 'A'.repeat(50) });
    expect(form.errors).to.not.include('authentication-key:v8n_too_long');
  });

  it('produces the custom-code:v8n_too_long error if value is larger than 64KB', () => {
    const form = new Form();

    form.edit({ custom_code: 'A'.repeat(65537) });
    expect(form.errors).to.include('custom-code:v8n_too_long');

    form.edit({ custom_code: 'A'.repeat(65536) });
    expect(form.errors).to.not.include('custom-code:v8n_too_long');
  });

  it('produces the endpoint:v8n_required error for CUSTOM-ENDPOINT-POST method if accountid is empty', () => {
    const form = new Form();
    expect(form.errors).to.not.include('endpoint:v8n_required');

    form.edit({
      _embedded: {
        'fx:shipping_method': {
          _links: {
            'self': { href: 'https://demo.api/virtual/stall' },
            'fx:property_helpers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_containers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_drop_types': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_methods': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_services': { href: 'https://demo.api/virtual/stall' },
          },
          name: 'Custom Shipping Code',
          code: 'CUSTOM-ENDPOINT-POST',
          date_created: null,
          date_modified: null,
        },
      } as Data['_embedded'],
    });

    expect(form.errors).to.include('endpoint:v8n_required');

    form.edit({ accountid: 'https://example.com' });
    expect(form.errors).to.not.include('endpoint:v8n_required');
  });

  ['USPS', 'FedEx', 'UPS'].forEach(code => {
    it(`produces the shipping-container-uri:v8n_required error for ${code} method if uri is empty`, () => {
      const form = new Form();
      expect(form.errors).to.not.include('shipping-container-uri:v8n_required');

      form.edit({
        _embedded: {
          'fx:shipping_method': {
            _links: {
              'self': { href: 'https://demo.api/virtual/stall' },
              'fx:property_helpers': { href: 'https://demo.api/virtual/stall' },
              'fx:shipping_containers': { href: 'https://demo.api/virtual/stall' },
              'fx:shipping_drop_types': { href: 'https://demo.api/virtual/stall' },
              'fx:shipping_methods': { href: 'https://demo.api/virtual/stall' },
              'fx:shipping_services': { href: 'https://demo.api/virtual/stall' },
            },
            name: 'Test',
            code: code,
            date_created: null,
            date_modified: null,
          },
        } as Data['_embedded'],
      });

      expect(form.errors).to.include('shipping-container-uri:v8n_required');

      form.edit({ shipping_container_uri: 'https://demo.api/virtual/stall' });
      expect(form.errors).to.not.include('shipping-container-uri:v8n_required');
    });
  });

  ['FedEx', 'UPS'].forEach(code => {
    it(`produces the shipping-drop-type-uri:v8n_required error for ${code} method if uri is empty`, () => {
      const form = new Form();
      expect(form.errors).to.not.include('shipping-drop-type-uri:v8n_required');

      form.edit({
        _embedded: {
          'fx:shipping_method': {
            _links: {
              'self': { href: 'https://demo.api/virtual/stall' },
              'fx:property_helpers': { href: 'https://demo.api/virtual/stall' },
              'fx:shipping_containers': { href: 'https://demo.api/virtual/stall' },
              'fx:shipping_drop_types': { href: 'https://demo.api/virtual/stall' },
              'fx:shipping_methods': { href: 'https://demo.api/virtual/stall' },
              'fx:shipping_services': { href: 'https://demo.api/virtual/stall' },
            },
            name: 'Test',
            code: code,
            date_created: null,
            date_modified: null,
          },
        } as Data['_embedded'],
      });

      expect(form.errors).to.include('shipping-drop-type-uri:v8n_required');

      form.edit({ shipping_drop_type_uri: 'https://demo.api/virtual/stall' });
      expect(form.errors).to.not.include('shipping-drop-type-uri:v8n_required');
    });
  });

  it('hides everything except for shipping method uri, timestamps, create and delete buttons by default', () => {
    const form = new Form();
    expect(form.hiddenSelector.toString()).to.equal(
      'shipping-container-uri shipping-drop-type-uri destinations authentication-key meter-number accountid password endpoint custom-code services undo delete timestamps submit'
    );
  });

  it('hides everything except for shipping method uri, endpoint, timestamps, create and delete buttons for CUSTOM-ENDPOINT-POST method', () => {
    const form = new Form();

    form.edit({
      _embedded: {
        'fx:shipping_method': {
          _links: {
            'self': { href: 'https://demo.api/virtual/stall' },
            'fx:property_helpers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_containers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_drop_types': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_methods': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_services': { href: 'https://demo.api/virtual/stall' },
          },
          name: 'Custom Shipping Code',
          code: 'CUSTOM-ENDPOINT-POST',
          date_created: null,
          date_modified: null,
        },
      } as Data['_embedded'],
    });

    expect(form.hiddenSelector.toString()).to.equal(
      'shipping-container-uri shipping-drop-type-uri destinations authentication-key meter-number accountid password custom-code services undo delete timestamps submit'
    );
  });

  it('hides everything except for shipping method uri, custom code, timestamps, create and delete buttons for CUSTOM-CODE method', () => {
    const form = new Form();

    form.edit({
      _embedded: {
        'fx:shipping_method': {
          _links: {
            'self': { href: 'https://demo.api/virtual/stall' },
            'fx:property_helpers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_containers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_drop_types': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_methods': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_services': { href: 'https://demo.api/virtual/stall' },
          },
          name: 'Custom Code',
          code: 'CUSTOM-CODE',
          date_created: null,
          date_modified: null,
        },
      } as Data['_embedded'],
    });

    expect(form.hiddenSelector.toString()).to.equal(
      'shipping-container-uri shipping-drop-type-uri destinations authentication-key meter-number accountid password endpoint services undo delete timestamps submit'
    );
  });

  it('hides everything except for shipping method uri, destinations, services, timestamps, create and delete buttons for CUSTOM method', () => {
    const form = new Form();

    form.edit({
      _embedded: {
        'fx:shipping_method': {
          _links: {
            'self': { href: 'https://demo.api/virtual/stall' },
            'fx:property_helpers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_containers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_drop_types': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_methods': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_services': { href: 'https://demo.api/virtual/stall' },
          },
          name: 'Custom',
          code: 'CUSTOM',
          date_created: null,
          date_modified: null,
        },
      } as Data['_embedded'],
    });

    expect(form.hiddenSelector.toString()).to.equal(
      'shipping-container-uri shipping-drop-type-uri authentication-key meter-number accountid password endpoint custom-code services undo delete timestamps submit'
    );
  });

  it('hides everything except for shipping method uri, shipping container uri, shipping drop type uri, destinations, authentication key, meter number, accountid, password, services, timestamps, create and delete buttons for FedEx method', () => {
    const form = new Form();

    form.edit({
      _embedded: {
        'fx:shipping_method': {
          _links: {
            'self': { href: 'https://demo.api/virtual/stall' },
            'fx:property_helpers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_containers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_drop_types': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_methods': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_services': { href: 'https://demo.api/virtual/stall' },
          },
          name: 'FedEx',
          code: 'FedEx',
          date_created: null,
          date_modified: null,
        },
      } as Data['_embedded'],
    });

    expect(form.hiddenSelector.toString()).to.equal(
      'endpoint custom-code services undo delete timestamps submit'
    );
  });

  it('hides everything except for shipping method uri, shipping container uri, shipping drop type uri, destinations, services, timestamps, create and delete buttons for USPS method', () => {
    const form = new Form();

    form.edit({
      _embedded: {
        'fx:shipping_method': {
          _links: {
            'self': { href: 'https://demo.api/virtual/stall' },
            'fx:property_helpers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_containers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_drop_types': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_methods': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_services': { href: 'https://demo.api/virtual/stall' },
          },
          name: 'USPS',
          code: 'USPS',
          date_created: null,
          date_modified: null,
        },
      } as Data['_embedded'],
    });

    expect(form.hiddenSelector.toString()).to.equal(
      'authentication-key meter-number accountid password endpoint custom-code services undo delete timestamps submit'
    );
  });

  it('hides everything except for shipping method uri, shipping container uri, shipping drop type uri, destinations, authentication key, meter number, accountid, password, services, timestamps, create and delete buttons for UPS method', () => {
    const form = new Form();

    form.edit({
      _embedded: {
        'fx:shipping_method': {
          _links: {
            'self': { href: 'https://demo.api/virtual/stall' },
            'fx:property_helpers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_containers': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_drop_types': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_methods': { href: 'https://demo.api/virtual/stall' },
            'fx:shipping_services': { href: 'https://demo.api/virtual/stall' },
          },
          name: 'UPS',
          code: 'UPS',
          date_created: null,
          date_modified: null,
        },
      } as Data['_embedded'],
    });

    expect(form.hiddenSelector.toString()).to.equal(
      'endpoint custom-code services undo delete timestamps submit'
    );
  });

  it('renders a form header', async () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('uses custom header title options', async () => {
    const form = new Form();
    form.data = await getTestData('./hapi/store_shipping_methods/0?zoom=shipping_method');
    type Embed = { 'fx:shipping_method': Resource<Rels.ShippingMethod> };
    const shippingMethod = (form.data!._embedded as Embed)['fx:shipping_method'];
    expect(form.headerTitleOptions).to.deep.equal({
      ...form.data!,
      context: 'existing',
      provider: shippingMethod.name,
    });
  });

  it('uses custom header subtitle options', async () => {
    const form = new Form();
    form.data = await getTestData('./hapi/store_shipping_methods/0?zoom=shipping_method');
    expect(form.headerSubtitleOptions).to.deep.equal({ id: form.headerCopyIdValue });
  });

  it('renders resource picker control for shipping method uri', async () => {
    const router = createRouter();

    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form
        shipping-methods="https://demo.api/hapi/shipping_methods"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-shipping-method-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="shipping-method-uri"]'
    ) as InternalResourcePickerControl;

    expect(control).to.be.instanceOf(InternalResourcePickerControl);
    expect(control).to.have.attribute('first', 'https://demo.api/hapi/shipping_methods');
    expect(control).to.have.attribute('item', 'foxy-shipping-method-card');
  });

  it('renders resource picker control for shipping container uri', async () => {
    const router = createRouter();

    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form
        shipping-methods="https://demo.api/hapi/shipping_methods"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-shipping-method-form>
    `);

    element.edit({
      _embedded: {
        'fx:shipping_method': await getTestData('./hapi/shipping_methods/0', router),
      },
    });

    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      '[infer="shipping-container-uri"]'
    ) as InternalResourcePickerControl;

    expect(control).to.be.instanceOf(InternalResourcePickerControl);
    expect(control).to.have.attribute('item', 'foxy-shipping-container-card');
    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/shipping_containers?shipping_method_id=0'
    );
  });

  it('renders resource picker control for shipping drop type uri', async () => {
    const router = createRouter();

    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form
        shipping-methods="https://demo.api/hapi/shipping_methods"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-shipping-method-form>
    `);

    element.edit({
      _embedded: {
        'fx:shipping_method': await getTestData('./hapi/shipping_methods/0', router),
      },
    });

    await element.requestUpdate();

    const control = element.renderRoot.querySelector(
      '[infer="shipping-drop-type-uri"]'
    ) as InternalResourcePickerControl;

    expect(control).to.be.instanceOf(InternalResourcePickerControl);
    expect(control).to.have.attribute('item', 'foxy-shipping-drop-type-card');
    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/shipping_drop_types?shipping_method_id=0'
    );
  });

  it('renders checkbox group control for destinations', async () => {
    const router = createRouter();

    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="destinations"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { value: 'domestic', label: 'domestic' },
      { value: 'international', label: 'international' },
    ]);

    expect(control.getValue()).to.be.empty;

    element.edit({ use_for_domestic: true });
    expect(control.getValue()).to.deep.equal(['domestic']);

    element.edit({ use_for_international: true });
    expect(control.getValue()).to.deep.equal(['domestic', 'international']);

    element.edit({ use_for_domestic: false });
    expect(control.getValue()).to.deep.equal(['international']);

    control.setValue([]);
    expect(element).to.have.nested.property('form.use_for_domestic', false);
    expect(element).to.have.nested.property('form.use_for_international', false);

    control.setValue(['domestic']);
    expect(element).to.have.nested.property('form.use_for_domestic', true);
    expect(element).to.have.nested.property('form.use_for_international', false);

    control.setValue(['domestic', 'international']);
    expect(element).to.have.nested.property('form.use_for_domestic', true);
    expect(element).to.have.nested.property('form.use_for_international', true);
  });

  it('renders text control for authentication key', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    expect(element.renderRoot.querySelector('[infer="authentication-key"]')).to.be.instanceOf(
      InternalTextControl
    );
  });

  it('renders text control for meter number', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    expect(element.renderRoot.querySelector('[infer="meter-number"]')).to.be.instanceOf(
      InternalTextControl
    );
  });

  it('renders text control for endpoint for "CUSTOM-ENDPOINT-POST" shipping method', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/shipping_methods/0', {
        method: 'PATCH',
        body: JSON.stringify({ code: 'CUSTOM-ENDPOINT-POST' }),
      })
    )?.handlerPromise;

    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form
        shipping-methods="https://demo.api/hapi/shipping_methods"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-shipping-method-form>
    `);

    expect(element.renderRoot.querySelector('[infer="endpoint"]')).to.not.exist;
    expect(element.renderRoot.querySelector('[infer="accountid"]')).to.exist;

    element.edit({ shipping_method_uri: 'https://demo.api/hapi/shipping_methods/0' });
    // @ts-expect-error type is not resolved for some reason
    await waitUntil(() => !!element.form._embedded?.['fx:shipping_method'], '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="endpoint"]') as InternalTextControl;

    expect(element.renderRoot.querySelector('[infer="accountid"]')).to.not.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('property', 'accountid');
  });

  it('renders text control for account id', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    expect(element.renderRoot.querySelector('[infer="accountid"]')).to.be.instanceOf(
      InternalTextControl
    );
  });

  it('renders password control for password', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    expect(element.renderRoot.querySelector('[infer="password"]')).to.be.instanceOf(
      InternalPasswordControl
    );
  });

  it('renders source control for custom code', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    expect(element.renderRoot.querySelector('[infer="custom-code"]')).to.be.instanceOf(
      InternalSourceControl
    );
  });

  it('renders resource link list control for services', async () => {
    const router = createRouter();

    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form
        shipping-methods="https://demo.api/hapi/shipping_methods"
        href="https://demo.api/hapi/store_shipping_methods/0?zoom=shipping_method"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-shipping-method-form>
    `);

    await waitUntil(() => !!element.data);

    const control = element.renderRoot.querySelector(
      '[infer="services"]'
    ) as InternalAsyncResourceLinkListControl;

    expect(control).to.be.instanceOf(InternalAsyncResourceLinkListControl);
    expect(control).to.have.attribute('foreign-key-for-uri', 'shipping_service_uri');
    expect(control).to.have.attribute('foreign-key-for-id', 'shipping_service_id');
    expect(control).to.have.attribute('own-key-for-uri', 'shipping_method_uri');
    expect(control).to.have.attribute('embed-key', 'fx:store_shipping_services');
    expect(control).to.have.attribute('infer', 'services');
    expect(control).to.have.attribute('item', 'foxy-shipping-service-card');
    expect(control).to.have.attribute(
      'options-href',
      'https://demo.api/hapi/shipping_services?shipping_method_id=0'
    );
    expect(control).to.have.attribute(
      'links-href',
      'https://demo.api/hapi/store_shipping_services?shipping_method_id=0'
    );
  });
});
