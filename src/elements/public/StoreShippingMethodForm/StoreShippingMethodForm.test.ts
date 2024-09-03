import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { InternalAsyncResourceLinkListControl } from '../../internal/InternalAsyncResourceLinkListControl/InternalAsyncResourceLinkListControl';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { StoreShippingMethodForm as Form } from './StoreShippingMethodForm';
import { InternalResourcePickerControl } from '../../internal/InternalResourcePickerControl/InternalResourcePickerControl';
import { InternalPasswordControl } from '../../internal/InternalPasswordControl/InternalPasswordControl';
import { InternalSummaryControl } from '../../internal/InternalSummaryControl/InternalSummaryControl';
import { InternalSwitchControl } from '../../internal/InternalSwitchControl/InternalSwitchControl';
import { InternalSourceControl } from '../../internal/InternalSourceControl/InternalSourceControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';

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

  it('imports and defines foxy-internal-summary-control', () => {
    const element = customElements.get('foxy-internal-summary-control');
    expect(element).to.equal(InternalSummaryControl);
  });

  it('imports and defines foxy-internal-switch-control', () => {
    const element = customElements.get('foxy-internal-switch-control');
    expect(element).to.equal(InternalSwitchControl);
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

  it('produces the shipping-container-uri:v8n_required error on 400 API response', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-store-shipping-method-form
        @fetch=${(evt: FetchEvent) => {
          if (evt.request.method === 'POST') {
            evt.respondWith(
              Promise.resolve(
                new Response(
                  JSON.stringify({
                    _embedded: {
                      'fx:errors': [{ message: 'shipping_container_id must be greater than 0' }],
                    },
                  }),
                  { status: 400 }
                )
              )
            );
          } else {
            router.handleEvent(evt);
          }
        }}
      >
      </foxy-store-shipping-method-form>
    `);

    expect(form.errors).to.not.include('shipping-container-uri:v8n_required');

    form.edit({ shipping_method_uri: 'https://demo.api/hapi/shipping_methods/0' });
    form.submit();
    await waitUntil(() => form.in('idle'));
    expect(form.errors).to.include('shipping-container-uri:v8n_required');

    form.edit({ shipping_container_uri: 'https://demo.api/virtual/stall' });
    expect(form.errors).to.not.include('shipping-container-uri:v8n_required');
  });

  it('produces the shipping-drop-type-uri:v8n_required error on 400 API response', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-store-shipping-method-form
        @fetch=${(evt: FetchEvent) => {
          if (evt.request.method === 'POST') {
            evt.respondWith(
              Promise.resolve(
                new Response(
                  JSON.stringify({
                    _embedded: {
                      'fx:errors': [{ message: 'shipping_drop_type_id must be greater than 0' }],
                    },
                  }),
                  { status: 400 }
                )
              )
            );
          } else {
            router.handleEvent(evt);
          }
        }}
      >
      </foxy-store-shipping-method-form>
    `);

    expect(form.errors).to.not.include('shipping-drop-type-uri:v8n_required');

    form.edit({ shipping_method_uri: 'https://demo.api/hapi/shipping_methods/0' });
    form.submit();
    await waitUntil(() => form.in('idle'));
    expect(form.errors).to.include('shipping-drop-type-uri:v8n_required');

    form.edit({ shipping_drop_type_uri: 'https://demo.api/virtual/stall' });
    expect(form.errors).to.not.include('shipping-drop-type-uri:v8n_required');
  });

  it('shows only relevant controls by default', () => {
    const form = new Form();
    expect(form.hiddenSelector.toString()).to.equal(
      'general:shipping-container-uri general:shipping-drop-type-uri destinations account endpoint custom-code services undo submit delete timestamps'
    );
  });

  it('shows only relevant controls for CUSTOM-ENDPOINT-POST method', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    form.edit({ shipping_method_uri: 'https://demo.api/hapi/shipping_methods/6' });
    await form.requestUpdate();
    await waitUntil(() => {
      const nucleons = form.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...nucleons].every(n => !!n.in('idle'));
    });

    expect(form.hiddenSelector.toString()).to.equal(
      'general destinations account custom-code services undo submit delete timestamps'
    );
  });

  it('shows only relevant controls for CUSTOM-CODE method', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    form.edit({ shipping_method_uri: 'https://demo.api/hapi/shipping_methods/7' });
    await form.requestUpdate();
    await waitUntil(() => {
      const nucleons = form.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...nucleons].every(n => !!n.in('idle'));
    });

    expect(form.hiddenSelector.toString()).to.equal(
      'general destinations account endpoint services undo submit delete timestamps'
    );
  });

  it('shows only relevant controls for CUSTOM method', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    form.edit({ shipping_method_uri: 'https://demo.api/hapi/shipping_methods/3' });
    await form.requestUpdate();
    await waitUntil(() => {
      const nucleons = form.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...nucleons].every(n => !!n.in('idle'));
    });

    expect(form.hiddenSelector.toString()).to.equal(
      'general account endpoint custom-code services undo submit delete timestamps'
    );
  });

  it('shows only relevant controls for FedEx method', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    form.edit({ shipping_method_uri: 'https://demo.api/hapi/shipping_methods/1' });
    await form.requestUpdate();
    await waitUntil(() => {
      const nucleons = form.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...nucleons].every(n => !!n.in('idle'));
    });

    expect(form.hiddenSelector.toString()).to.equal(
      'endpoint custom-code services account:accountid account:password account:authentication-key account:meter-number undo submit delete timestamps'
    );
  });

  it('shows only relevant controls for USPS method', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    form.edit({ shipping_method_uri: 'https://demo.api/hapi/shipping_methods/0' });
    await form.requestUpdate();
    await waitUntil(() => {
      const nucleons = form.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...nucleons].every(n => !!n.in('idle'));
    });

    expect(form.hiddenSelector.toString()).to.equal(
      'account endpoint custom-code services undo submit delete timestamps'
    );
  });

  it('shows only relevant controls for UPS method', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    form.edit({ shipping_method_uri: 'https://demo.api/hapi/shipping_methods/2' });
    await form.requestUpdate();
    await waitUntil(() => {
      const nucleons = form.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...nucleons].every(n => !!n.in('idle'));
    });

    expect(form.hiddenSelector.toString()).to.equal(
      'endpoint custom-code services account:accountid account:password account:authentication-key account:meter-number undo submit delete timestamps'
    );
  });

  it('hides custom account fields by default when they are empty', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    expect(form.hiddenSelector.matches('account:accountid', true)).to.be.true;
    expect(form.hiddenSelector.matches('account:password', true)).to.be.true;
    expect(form.hiddenSelector.matches('account:authentication-key', true)).to.be.true;
    expect(form.hiddenSelector.matches('account:meter-number', true)).to.be.true;

    form.edit({
      shipping_method_uri: 'https://demo.api/hapi/shipping_methods/1',
      authentication_key: '123',
      meter_number: '123',
      accountid: '123',
      password: '123',
    });

    await form.requestUpdate();
    await waitUntil(() => {
      const nucleons = form.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...nucleons].every(n => !!n.in('idle'));
    });

    expect(form.hiddenSelector.matches('account:accountid', true)).to.be.false;
    expect(form.hiddenSelector.matches('account:password', true)).to.be.false;
    expect(form.hiddenSelector.matches('account:authentication-key', true)).to.be.false;
    expect(form.hiddenSelector.matches('account:meter-number', true)).to.be.false;
  });

  it('hides custom account field when they are empty unless use-custom-account is checked', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    form.edit({ shipping_method_uri: 'https://demo.api/hapi/shipping_methods/1' });
    await form.requestUpdate();
    await waitUntil(() => {
      const nucleons = form.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...nucleons].every(n => !!n.in('idle'));
    });

    expect(form.hiddenSelector.matches('account:accountid', true)).to.be.true;
    expect(form.hiddenSelector.matches('account:password', true)).to.be.true;
    expect(form.hiddenSelector.matches('account:authentication-key', true)).to.be.true;
    expect(form.hiddenSelector.matches('account:meter-number', true)).to.be.true;

    const checkbox = form.renderRoot.querySelector(
      '[infer="use-custom-account"]'
    ) as InternalSwitchControl;

    checkbox.setValue(true);

    expect(form.hiddenSelector.matches('account:accountid', true)).to.be.false;
    expect(form.hiddenSelector.matches('account:password', true)).to.be.false;
    expect(form.hiddenSelector.matches('account:authentication-key', true)).to.be.false;
    expect(form.hiddenSelector.matches('account:meter-number', true)).to.be.false;
  });

  it('renders a form header', async () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('uses custom header title options', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-store-shipping-method-form
        href="https://demo.api/hapi/store_shipping_methods/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-shipping-method-form>
    `);

    await waitUntil(() => {
      if (!form.data) return false;
      const nucleons = form.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...nucleons].every(n => !!n.in('idle'));
    });

    expect(form.headerTitleOptions).to.deep.equal({
      ...form.data!,
      context: 'existing',
      provider: 'United States Postal Service',
    });
  });

  it('uses custom header subtitle options', async () => {
    const form = new Form();
    form.data = await getTestData('./hapi/store_shipping_methods/0?zoom=shipping_method');
    expect(form.headerSubtitleOptions).to.deep.equal({ id: form.headerCopyIdValue });
  });

  it('renders summary control for General section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    const control = element.renderRoot.querySelector('[infer="general"]') as InternalSummaryControl;
    expect(control).to.be.instanceOf(InternalSummaryControl);
  });

  it('renders resource picker control for shipping method uri inside of the General section', async () => {
    const router = createRouter();

    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form
        shipping-methods="https://demo.api/hapi/shipping_methods"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-shipping-method-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="general"] [infer="shipping-method-uri"]'
    ) as InternalResourcePickerControl;

    expect(control).to.be.instanceOf(InternalResourcePickerControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('first', 'https://demo.api/hapi/shipping_methods');
    expect(control).to.have.attribute('item', 'foxy-shipping-method-card');
  });

  it('renders resource picker control for shipping container uri inside of the General section', async () => {
    const router = createRouter();

    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form
        shipping-methods="https://demo.api/hapi/shipping_methods"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-shipping-method-form>
    `);

    element.edit({ shipping_method_uri: 'https://demo.api/hapi/shipping_methods/0' });
    await element.requestUpdate();
    await waitUntil(() => {
      const nucleons = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...nucleons].every(n => !!n.in('idle'));
    });

    const control = element.renderRoot.querySelector(
      '[infer="general"] [infer="shipping-container-uri"]'
    ) as InternalResourcePickerControl;

    expect(control).to.be.instanceOf(InternalResourcePickerControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('item', 'foxy-shipping-container-card');
    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/shipping_containers?shipping_method_id=0'
    );
  });

  it('renders resource picker control for shipping drop type uri inside of the General section', async () => {
    const router = createRouter();

    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form
        shipping-methods="https://demo.api/hapi/shipping_methods"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-shipping-method-form>
    `);

    element.edit({ shipping_method_uri: 'https://demo.api/hapi/shipping_methods/0' });
    await element.requestUpdate();
    await waitUntil(() => {
      const nucleons = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...nucleons].every(n => !!n.in('idle'));
    });

    const control = element.renderRoot.querySelector(
      '[infer="general"] [infer="shipping-drop-type-uri"]'
    ) as InternalResourcePickerControl;

    expect(control).to.be.instanceOf(InternalResourcePickerControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('item', 'foxy-shipping-drop-type-card');
    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/shipping_drop_types?shipping_method_id=0'
    );
  });

  it('renders summary control for Destinations section', async () => {
    const router = createRouter();

    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="destinations"]'
    ) as InternalSummaryControl;

    expect(control).to.be.instanceOf(InternalSummaryControl);
  });

  it('renders a switch control for domestic destinations inside of the Destinations section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    expect(
      element.renderRoot.querySelector('[infer="destinations"] [infer="use-for-domestic"]')
    ).to.be.instanceOf(InternalSwitchControl);
  });

  it('renders a switch control for international destinations inside of the Destinations section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    expect(
      element.renderRoot.querySelector('[infer="destinations"] [infer="use-for-international"]')
    ).to.be.instanceOf(InternalSwitchControl);
  });

  it('renders summary control for Account section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    const control = element.renderRoot.querySelector('[infer="account"]') as InternalSummaryControl;
    expect(control).to.be.instanceOf(InternalSummaryControl);
  });

  it('renders text control for authentication key inside of the Account section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="account"] [infer="authentication-key"]'
    );

    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders text control for meter number inside of the Account section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    const control = element.renderRoot.querySelector('[infer="account"] [infer="meter-number"]');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders text control for account id inside of the Account section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    const control = element.renderRoot.querySelector('[infer="account"] [infer="accountid"]');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders password control for password inside of the Account section', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-store-shipping-method-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-store-shipping-method-form>
    `);

    const control = element.renderRoot.querySelector('[infer="account"] [infer="password"]');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.be.instanceOf(InternalPasswordControl);
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

    element.edit({ shipping_method_uri: 'https://demo.api/hapi/shipping_methods/6' });
    await waitUntil(() => {
      const nucleons = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...nucleons].every(n => !!n.in('idle'));
    });

    const control = element.renderRoot.querySelector('[infer="endpoint"]') as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('property', 'accountid');
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
    expect(control).to.have.attribute('limit', '200');
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
