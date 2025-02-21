import type { InternalNativeIntegrationFormCodeMapControl } from './internal/InternalNativeIntegrationFormCodeMapControl/InternalNativeIntegrationFormCodeMapControl';
import type { InternalPasswordControl } from '../../internal/InternalPasswordControl/InternalPasswordControl';
import type { InternalSwitchControl } from '../../internal/InternalSwitchControl/InternalSwitchControl';
import type { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { NativeIntegrationForm as Form } from './NativeIntegrationForm';
import { InternalEditableListControl } from '../../internal/InternalEditableListControl/InternalEditableListControl';
import { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { I18n } from '../I18n/I18n';
import { stub } from 'sinon';

import * as defaults from './defaults';

async function waitForIdle(element: Form) {
  await waitUntil(
    () => {
      const loaders = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...loaders].every(loader => loader.in('idle'));
    },
    '',
    { timeout: 5000 }
  );
}

describe('NativeIntegrationForm', () => {
  it('imports and defines foxy-internal-editable-list-control element', () => {
    expect(customElements.get('foxy-internal-editable-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-password-control element', () => {
    expect(customElements.get('foxy-internal-password-control')).to.exist;
  });

  it('imports and defines foxy-internal-summary-control element', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-select-control element', () => {
    expect(customElements.get('foxy-internal-select-control')).to.exist;
  });

  it('imports and defines foxy-internal-switch-control element', () => {
    expect(customElements.get('foxy-internal-switch-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control element', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form element', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-internal-native-integration-form-code-map-control element', () => {
    expect(customElements.get('foxy-internal-native-integration-form-code-map-control')).to.exist;
  });

  it('defines itself as foxy-native-integration-form element', () => {
    expect(customElements.get('foxy-native-integration-form')).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(customElements.get('foxy-internal-form'));
  });

  it('has a default i18n namespace "native-integration-form"', () => {
    expect(Form).to.have.property('defaultNS', 'native-integration-form');
    expect(new Form()).to.have.property('ns', 'native-integration-form');
  });

  it('has a reactive property itemCategoryBase', () => {
    const element = new Form();
    expect(element).to.have.property('itemCategoryBase').that.equals(null);
    expect(Form.properties).to.have.deep.property('itemCategoryBase', {
      attribute: 'item-category-base',
    });
  });

  it('produces avalara-service-url:v8n_required error if service url for avalara is missing', () => {
    const element = new Form();
    element.edit({ provider: 'avalara' });
    expect(element.errors).to.include('avalara-service-url:v8n_required');
    element.edit({ config: JSON.stringify({ service_url: 'abc' }) });
    expect(element.errors).to.not.include('avalara-service-url:v8n_required');
  });

  it('produces avalara-service-url:v8n_invalid error if service url for avalara is invalid', () => {
    const element = new Form();
    element.edit({ provider: 'avalara' });
    expect(element.errors).to.not.include('avalara-service-url:v8n_invalid');
    element.edit({ config: JSON.stringify({ service_url: 'abc' }) });
    expect(element.errors).to.include('avalara-service-url:v8n_invalid');
    element.edit({ config: JSON.stringify({ service_url: 'https://example.com' }) });
    expect(element.errors).to.not.include('avalara-service-url:v8n_invalid');
  });

  it('produces avalara-id:v8n_required error if id for avalara is missing', () => {
    const element = new Form();
    element.edit({ provider: 'avalara' });
    expect(element.errors).to.include('avalara-id:v8n_required');
    element.edit({ config: JSON.stringify({ id: 'abc' }) });
    expect(element.errors).to.not.include('avalara-id:v8n_required');
  });

  it('produces avalara-key:v8n_required error if key for avalara is missing', () => {
    const element = new Form();
    element.edit({ provider: 'avalara' });
    expect(element.errors).to.include('avalara-key:v8n_required');
    element.edit({ config: JSON.stringify({ key: 'abc' }) });
    expect(element.errors).to.not.include('avalara-key:v8n_required');
  });

  it('produces avalara-company-code:v8n_required error if company code for avalara is missing', () => {
    const element = new Form();
    element.edit({ provider: 'avalara' });
    expect(element.errors).to.include('avalara-company-code:v8n_required');
    element.edit({ config: JSON.stringify({ company_code: 'abc' }) });
    expect(element.errors).to.not.include('avalara-company-code:v8n_required');
  });

  it('produces taxjar-api-token:v8n_required error if api token for taxjar is missing', () => {
    const element = new Form();
    element.edit({ provider: 'taxjar' });
    expect(element.errors).to.include('taxjar-api-token:v8n_required');
    element.edit({ config: JSON.stringify({ api_token: 'abc' }) });
    expect(element.errors).to.not.include('taxjar-api-token:v8n_required');
  });

  it('produces onesource-service-url:v8n_required error if service url for onesource is missing', () => {
    const element = new Form();
    element.edit({ provider: 'onesource' });
    expect(element.errors).to.include('onesource-service-url:v8n_required');
    element.edit({ config: JSON.stringify({ service_url: 'abc' }) });
    expect(element.errors).to.not.include('onesource-service-url:v8n_required');
  });

  it('produces onesource-service-url:v8n_invalid error if service url for onesource is invalid', () => {
    const element = new Form();
    element.edit({ provider: 'onesource' });
    expect(element.errors).to.not.include('onesource-service-url:v8n_invalid');
    element.edit({ config: JSON.stringify({ service_url: 'abc' }) });
    expect(element.errors).to.include('onesource-service-url:v8n_invalid');
    element.edit({ config: JSON.stringify({ service_url: 'https://example.com' }) });
    expect(element.errors).to.not.include('onesource-service-url:v8n_invalid');
  });

  it('produces onesource-external-company-id:v8n_required error if external company id for onesource is missing', () => {
    const element = new Form();
    element.edit({ provider: 'onesource' });
    expect(element.errors).to.include('onesource-external-company-id:v8n_required');
    element.edit({ config: JSON.stringify({ external_company_id: 'abc' }) });
    expect(element.errors).to.not.include('onesource-external-company-id:v8n_required');
  });

  it('produces onesource-calling-system-number:v8n_required error if calling system number for onesource is missing', () => {
    const element = new Form();
    element.edit({ provider: 'onesource' });
    expect(element.errors).to.include('onesource-calling-system-number:v8n_required');
    element.edit({ config: JSON.stringify({ calling_system_number: 'abc' }) });
    expect(element.errors).to.not.include('onesource-calling-system-number:v8n_required');
  });

  it('produces onesource-from-city:v8n_required error if from city for onesource is missing', () => {
    const element = new Form();
    element.edit({ provider: 'onesource' });
    expect(element.errors).to.include('onesource-from-city:v8n_required');
    element.edit({ config: JSON.stringify({ from_city: 'abc' }) });
    expect(element.errors).to.not.include('onesource-from-city:v8n_required');
  });

  it('produces onesource-host-system:v8n_required error if host system for onesource is missing', () => {
    const element = new Form();
    element.edit({ provider: 'onesource' });
    expect(element.errors).to.include('onesource-host-system:v8n_required');
    element.edit({ config: JSON.stringify({ host_system: 'abc' }) });
    expect(element.errors).to.not.include('onesource-host-system:v8n_required');
  });

  it('produces webhook-json-title:v8n_required error if title for json webhook is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'json' }) });
    expect(element.errors).to.include('webhook-json-title:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'json', title: 'abc' }) });
    expect(element.errors).to.not.include('webhook-json-title:v8n_required');
  });

  it('produces webhook-json-url:v8n_required error if url for json webhook is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'json' }) });
    expect(element.errors).to.include('webhook-json-url:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'json', url: 'abc' }) });
    expect(element.errors).to.not.include('webhook-json-url:v8n_required');
  });

  it('produces webhook-json-url:v8n_invalid error if url for json webhook is invalid', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'json' }) });
    expect(element.errors).to.not.include('webhook-json-url:v8n_invalid');
    element.edit({ config: JSON.stringify({ service: 'json', url: 'abc' }) });
    expect(element.errors).to.include('webhook-json-url:v8n_invalid');
    element.edit({ config: JSON.stringify({ service: 'json', url: 'https://example.com' }) });
    expect(element.errors).to.not.include('webhook-json-url:v8n_invalid');
  });

  it('produces webhook-legacy-xml-title:v8n_required error if title for legacy xml webhook is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'legacy_xml' }) });
    expect(element.errors).to.include('webhook-legacy-xml-title:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'legacy_xml', title: 'abc' }) });
    expect(element.errors).to.not.include('webhook-legacy-xml-title:v8n_required');
  });

  it('produces webhook-legacy-xml-url:v8n_required error if url for legacy xml webhook is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'legacy_xml' }) });
    expect(element.errors).to.include('webhook-legacy-xml-url:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'legacy_xml', url: 'abc' }) });
    expect(element.errors).to.not.include('webhook-legacy-xml-url:v8n_required');
  });

  it('produces webhook-legacy-xml-url:v8n_invalid error if url for legacy xml webhook is invalid', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'legacy_xml' }) });
    expect(element.errors).to.not.include('webhook-legacy-xml-url:v8n_invalid');
    element.edit({ config: JSON.stringify({ service: 'legacy_xml', url: 'abc' }) });
    expect(element.errors).to.include('webhook-legacy-xml-url:v8n_invalid');
    element.edit({ config: JSON.stringify({ service: 'legacy_xml', url: 'https://example.com' }) });
    expect(element.errors).to.not.include('webhook-legacy-xml-url:v8n_invalid');
  });

  it('produces webflow-site-id:v8n_required error if site id for webflow is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webflow', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webflow-site-id:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', site_id: 'abc' }) });
    expect(element.errors).to.not.include('webflow-site-id:v8n_required');
  });

  it('produces webflow-site-name:v8n_required error if site name for webflow is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webflow', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webflow-site-name:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', site_name: 'abc' }) });
    expect(element.errors).to.not.include('webflow-site-name:v8n_required');
  });

  it('produces webflow-collection-id:v8n_required error if collection id for webflow is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webflow', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webflow-collection-id:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', collection_id: 'abc' }) });
    expect(element.errors).to.not.include('webflow-collection-id:v8n_required');
  });

  it('produces webflow-collection-name:v8n_required error if collection name for webflow is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webflow', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webflow-collection-name:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', collection_name: 'abc' }) });
    expect(element.errors).to.not.include('webflow-collection-name:v8n_required');
  });

  it('produces webflow-sku-field-id:v8n_required error if sku field id for webflow is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webflow', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webflow-sku-field-id:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', sku_field_id: 'abc' }) });
    expect(element.errors).to.not.include('webflow-sku-field-id:v8n_required');
  });

  it('produces webflow-sku-field-name:v8n_required error if sku field name for webflow is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webflow', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webflow-sku-field-name:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', sku_field_name: 'abc' }) });
    expect(element.errors).to.not.include('webflow-sku-field-name:v8n_required');
  });

  it('produces webflow-inventory-field-id:v8n_required error if inventory field id for webflow is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webflow', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webflow-inventory-field-id:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', inventory_field_id: 'abc' }) });
    expect(element.errors).to.not.include('webflow-inventory-field-id:v8n_required');
  });

  it('produces webflow-inventory-field-name:v8n_required error if inventory field name for webflow is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webflow', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webflow-inventory-field-name:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', inventory_field_name: 'abc' }) });
    expect(element.errors).to.not.include('webflow-inventory-field-name:v8n_required');
  });

  it('produces webflow-auth:v8n_required error if auth token for webflow is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webflow', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webflow-auth:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', auth: 'abc' }) });
    expect(element.errors).to.not.include('webflow-auth:v8n_required');
  });

  it('makes certain controls readonly when href is defined', () => {
    const element = new Form();

    element.addEventListener('fetch', (evt: Event) => {
      if (evt instanceof FetchEvent) {
        evt.respondWith(Promise.resolve(new Response(null, { status: 500 })));
      }
    });

    expect(element.readonlySelector.matches('zapier-group-one', true)).to.be.false;
    expect(element.readonlySelector.matches('provider-group-one', true)).to.be.false;
    expect(element.readonlySelector.matches('apple-pay-group-one', true)).to.be.false;

    element.href = 'https://demo.api/hapi/native_integrations/0';

    expect(element.readonlySelector.matches('zapier-group-one', true)).to.be.true;
    expect(element.readonlySelector.matches('provider-group-one', true)).to.be.true;
    expect(element.readonlySelector.matches('apple-pay-group-one', true)).to.be.true;
  });

  it('produces error:already_configured when trying to add another config for an already configured integration', async () => {
    const element = await fixture<Form>(html`
      <foxy-native-integration-form
        @fetch=${(evt: FetchEvent) => {
          const message = 'This integration has already been configured.';
          const body = JSON.stringify({ _embedded: { 'fx:errors': [{ message }] } });
          evt.respondWith(Promise.resolve(new Response(body, { status: 500 })));
        }}
      >
      </foxy-native-integration-form>
    `);

    expect(element.errors).to.not.include('error:already_configured');

    element.href = 'https://demo.api/hapi/native_integrations/0';
    await waitUntil(() => element.in('idle'));

    expect(element.errors).to.include('error:already_configured');
  });

  it('renders a form header', () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('uses custom options for form header title', async () => {
    const element = await fixture<Form>(html`
      <foxy-native-integration-form></foxy-native-integration-form>
    `);

    expect(element.headerTitleOptions).to.deep.equal({ context: 'new', id: '' });

    const data = await getTestData<Data>('./hapi/native_integrations/0');
    element.data = data;

    expect(element.headerTitleOptions).to.deep.equal({
      context: `existing_${data.provider}`,
      id: 0,
    });
  });

  it('does not render provider group when href is defined', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-native-integration-form
        href="https://demo.api/hapi/native_integrations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-native-integration-form>
    `);

    await waitUntil(() => element.in('idle'));
    element.edit({ provider: 'webhook', config: defaults.webhookJson });
    await element.requestUpdate();

    const control = element.renderRoot.querySelector('[infer="provider-group-one"]');
    expect(control).to.not.exist;
  });

  it('renders provider group when href is not defined', async () => {
    const element = await fixture<Form>(
      html`<foxy-native-integration-form></foxy-native-integration-form>`
    );

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="provider-group-one"]'
    );

    expect(control).to.exist;
  });

  it('renders provider selector in provider group when href is not defined', async () => {
    const element = await fixture<Form>(
      html`<foxy-native-integration-form></foxy-native-integration-form>`
    );

    const control = element.renderRoot.querySelector(
      '[infer="provider-group-one"] [infer="provider"]'
    ) as InternalSelectControl;

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control.getValue()).to.equal('avalara');
    expect(control).to.have.deep.property('options', [
      { value: 'avalara', label: 'option_avalara' },
      { value: 'onesource', label: 'option_onesource' },
      { value: 'taxjar', label: 'option_taxjar' },
      { value: 'custom_tax', label: 'option_custom_tax' },
    ]);

    control.setValue('taxjar');

    expect(element).to.have.nested.property('form.provider', 'taxjar');
    expect(element).to.have.nested.property('form.config', defaults.taxjar);
    expect(control.getValue()).to.equal('taxjar');
  });

  it('renders a text control for avalara service url in avalara group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.avalara),
      service_url: 'https://example.com',
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="avalara-group-one"] foxy-internal-text-control[infer="avalara-service-url"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.avalara);
    expect(control).to.have.attribute('json-path', 'service_url');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for avalara id in avalara group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({ ...JSON.parse(defaults.avalara), id: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="avalara-group-one"] foxy-internal-text-control[infer="avalara-id"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.avalara);
    expect(control).to.have.attribute('json-path', 'id');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a password control for avalara key in avalara group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({ ...JSON.parse(defaults.avalara), key: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="avalara-group-one"] foxy-internal-password-control[infer="avalara-key"]'
    ) as InternalPasswordControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.avalara);
    expect(control).to.have.attribute('json-path', 'key');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for avalara company code in avalara group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({ ...JSON.parse(defaults.avalara), company_code: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="avalara-group-one"] [infer="avalara-company-code"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.avalara);
    expect(control).to.have.attribute('json-path', 'company_code');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders an internal control for avalara tax code mappings', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    const router = createRouter();

    data.provider = 'avalara';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.avalara),
      category_to_product_tax_code_mappings: { foo: 'bar', bar: 'qux' },
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form
        item-category-base="https://demo.api/hapi/item_categories/"
        store="https://demo.api/hapi/stores/0"
        .data=${data}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-native-integration-form>
    `);

    await waitForIdle(element);
    const control = element.renderRoot.querySelector(
      'foxy-internal-native-integration-form-code-map-control[infer="avalara-category-to-product-tax-code-mappings"]'
    ) as InternalNativeIntegrationFormCodeMapControl;

    expect(control).to.exist;

    expect(control).to.have.attribute(
      'item-category-base',
      'https://demo.api/hapi/item_categories/'
    );

    expect(control).to.have.attribute(
      'item-categories',
      'https://demo.api/hapi/item_categories?store_id=0'
    );

    expect(control).to.have.attribute('json-template', defaults.avalara);
    expect(control).to.have.attribute('json-path', 'category_to_product_tax_code_mappings');
    expect(control).to.have.attribute('property', 'config');
  });

  it('renders a switch control for avalara use_ava_tax in avalara group two', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({ ...JSON.parse(defaults.avalara), use_ava_tax: true });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="avalara-group-two"] foxy-internal-switch-control[infer="avalara-use-ava-tax"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.avalara);
    expect(control).to.have.attribute('json-path', 'use_ava_tax');
    expect(control).to.have.attribute('property', 'config');
  });

  it('renders a switch control for avalara use_address_validation in avalara group two', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({ ...JSON.parse(defaults.avalara), use_address_validation: true });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="avalara-group-two"] foxy-internal-switch-control[infer="avalara-use-address-validation"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.avalara);
    expect(control).to.have.attribute('json-path', 'use_address_validation');
    expect(control).to.have.attribute('property', 'config');
  });

  it('renders an editable list control for avalara address validation countries if address validation is on', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.avalara),
      use_address_validation: true,
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="avalara-group-two"] foxy-internal-editable-list-control[infer="avalara-address-validation-countries"]'
    ) as InternalEditableListControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('json-template', defaults.avalara);
    expect(control).to.have.attribute('json-path', 'address_validation_countries');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.deep.property('options', [{ value: 'US' }, { value: 'CA' }]);
  });

  it('renders a switch control for avalara create_invoice in avalara group two', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({ ...JSON.parse(defaults.avalara), create_invoice: true });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="avalara-group-two"] foxy-internal-switch-control[infer="avalara-create-invoice"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.avalara);
    expect(control).to.have.attribute('json-path', 'create_invoice');
    expect(control).to.have.attribute('property', 'config');
  });

  it('renders a switch control for avalara enable_colorado_delivery_fee in avalara group two', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.avalara),
      enable_colorado_delivery_fee: true,
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="avalara-group-two"] foxy-internal-switch-control[infer="avalara-enable-colorado-delivery-fee"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.avalara);
    expect(control).to.have.attribute('json-path', 'enable_colorado_delivery_fee');
    expect(control).to.have.attribute('property', 'config');
  });

  it('renders a password control for taxjar api token inside taxjar group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'taxjar';
    data.config = JSON.stringify({ ...JSON.parse(defaults.taxjar), api_token: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="taxjar-group-one"] foxy-internal-password-control[infer="taxjar-api-token"]'
    ) as InternalPasswordControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.taxjar);
    expect(control).to.have.attribute('json-path', 'api_token');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a switch control for taxjar create_invoice in taxjar group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'taxjar';
    data.config = JSON.stringify({ ...JSON.parse(defaults.taxjar), create_invoice: true });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="taxjar-group-one"] foxy-internal-switch-control[infer="taxjar-create-invoice"]'
    );

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.taxjar);
    expect(control).to.have.attribute('json-path', 'create_invoice');
    expect(control).to.have.attribute('property', 'config');
  });

  it('renders an internal control for taxjar tax code mappings', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    const router = createRouter();

    data.provider = 'taxjar';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.taxjar),
      category_to_product_tax_code_mappings: { foo: 'bar', bar: 'qux' },
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form
        item-category-base="https://demo.api/hapi/item_categories/"
        store="https://demo.api/hapi/stores/0"
        .data=${data}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-native-integration-form>
    `);

    await waitForIdle(element);
    const control = element.renderRoot.querySelector(
      'foxy-internal-native-integration-form-code-map-control[infer="taxjar-category-to-product-tax-code-mappings"]'
    ) as InternalNativeIntegrationFormCodeMapControl;

    expect(control).to.exist;

    expect(control).to.have.attribute(
      'item-category-base',
      'https://demo.api/hapi/item_categories/'
    );

    expect(control).to.have.attribute(
      'item-categories',
      'https://demo.api/hapi/item_categories?store_id=0'
    );

    expect(control).to.have.attribute('json-template', defaults.taxjar);
    expect(control).to.have.attribute('json-path', 'category_to_product_tax_code_mappings');
    expect(control).to.have.attribute('property', 'config');
  });

  it('renders a text control for onesource service url in onesource group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.onesource),
      service_url: 'https://example.com',
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="onesource-group-one"] foxy-internal-text-control[infer="onesource-service-url"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.onesource);
    expect(control).to.have.attribute('json-path', 'service_url');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for onesource external company id in onesource group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({ ...JSON.parse(defaults.onesource), external_company_id: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="onesource-group-one"] foxy-internal-text-control[infer="onesource-external-company-id"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.onesource);
    expect(control).to.have.attribute('json-path', 'external_company_id');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for onesource from city in onesource group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({ ...JSON.parse(defaults.onesource), from_city: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="onesource-group-one"] foxy-internal-text-control[infer="onesource-from-city"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.onesource);
    expect(control).to.have.attribute('json-path', 'from_city');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for onesource calling system number in onesource group two', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.onesource),
      calling_system_number: 'abc',
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="onesource-group-two"] foxy-internal-text-control[infer="onesource-calling-system-number"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.onesource);
    expect(control).to.have.attribute('json-path', 'calling_system_number');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for onesource host system in onesource group two', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({ ...JSON.parse(defaults.onesource), host_system: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="onesource-group-two"] foxy-internal-text-control[infer="onesource-host-system"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.onesource);
    expect(control).to.have.attribute('json-path', 'host_system');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a select control for onesource company role in onesource group three', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = defaults.onesource;

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="onesource-group-three"] foxy-internal-select-control[infer="onesource-company-role"]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.onesource);
    expect(control).to.have.attribute('json-path', 'company_role');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('options', [
      { value: 'B', label: 'option_buyer' },
      { value: 'M', label: 'option_middleman' },
      { value: 'S', label: 'option_seller' },
    ]);
  });

  it('renders a select control for onesource audit settings in onesource group three', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = defaults.onesource;

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="onesource-group-three"] foxy-internal-select-control[infer="onesource-audit-settings"]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.onesource);
    expect(control).to.have.attribute('json-path', 'audit_settings');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('options', [
      { value: 'capture_only', label: 'option_capture_only' },
      { value: 'auth_and_capture', label: 'option_auth_and_capture' },
      { value: 'never', label: 'option_never' },
    ]);
  });

  it('renders a text control for onesource part number product option in onesource group four', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.onesource),
      part_number_product_option: 'abc',
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="onesource-group-four"] foxy-internal-text-control[infer="onesource-part-number-product-option"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.onesource);
    expect(control).to.have.attribute('json-path', 'part_number_product_option');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders an editable list control for onesource product order priority in onesource group five', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.onesource),
      product_order_priority: 'foo,bar',
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="onesource-group-five"] foxy-internal-editable-list-control[infer="onesource-product-order-priority"]'
    ) as InternalEditableListControl;

    expect(control).to.be.instanceOf(InternalEditableListControl);
    expect(control.getValue()).to.deep.equal([{ value: 'foo' }, { value: 'bar' }]);

    control.setValue([{ value: 'a' }, { value: 'b' }]);
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('product_order_priority', 'a,b');
  });

  it('renders a deprecation warning for json and legacy_xml webhooks', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = defaults.webhookJson;

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    let warning = element.renderRoot.querySelector('[key="warning_text"]');
    expect(warning).to.be.instanceOf(I18n);
    expect(warning).to.have.attribute('infer', 'webhook-warning');

    data.config = defaults.webhookLegacyXml;
    element.data = { ...data };
    await element.requestUpdate();

    warning = element.renderRoot.querySelector('[key="warning_text"]');
    expect(warning).to.be.instanceOf(I18n);
    expect(warning).to.have.attribute('infer', 'webhook-warning');

    data.provider = 'avalara';
    data.config = defaults.avalara;
    element.data = { ...data };
    await element.requestUpdate();

    warning = element.renderRoot.querySelector('[key="warning_text"]');
    expect(warning).to.not.exist;
  });

  it('renders a text control for webhook json title in webhook json group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...JSON.parse(defaults.webhookJson), title: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webhook-json-group-one"] foxy-internal-text-control[infer="webhook-json-title"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webhookJson);
    expect(control).to.have.attribute('json-path', 'title');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for webhook json url in webhook json group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.webhookJson),
      url: 'https://example.com',
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webhook-json-group-one"] foxy-internal-text-control[infer="webhook-json-url"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webhookJson);
    expect(control).to.have.attribute('json-path', 'url');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a select control for webhook service in webhook json group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = defaults.webhookJson;

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webhook-json-group-one"] foxy-internal-select-control[infer="webhook-service"]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webhookJson);
    expect(control).to.have.attribute('json-path', 'service');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('options', [
      { value: 'json', label: 'option_json' },
      { value: 'legacy_xml', label: 'option_legacy_xml' },
    ]);
  });

  it('renders a password control for webhook json encryption key in webhook json group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...JSON.parse(defaults.webhookJson), encryption_key: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webhook-json-group-one"] foxy-internal-password-control[infer="webhook-json-encryption-key"]'
    ) as InternalPasswordControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webhookJson);
    expect(control).to.have.attribute('json-path', 'encryption_key');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a switch control that toggles transaction/created event in webhook json group two', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.webhookJson),
      events: ['transaction/created'],
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webhook-json-group-two"] foxy-internal-switch-control[infer="webhook-json-events-transaction-created"]'
    ) as InternalSwitchControl;

    expect(control).to.exist;
    control.setValue(false);
    expect(control.getValue()).to.be.false;
    expect(JSON.parse(element.form.config as string)).to.have.deep.property('events', []);

    control.setValue(true);
    expect(control.getValue()).to.be.true;
    expect(JSON.parse(element.form.config as string)).to.have.deep.property('events', [
      'transaction/created',
    ]);
  });

  it('renders a switch control that toggles subscription/cancelled event in webhook json group two', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.webhookJson),
      events: ['subscription/cancelled'],
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webhook-json-group-two"] foxy-internal-switch-control[infer="webhook-json-events-subscription-cancelled"]'
    ) as InternalSwitchControl;

    expect(control).to.exist;
    control.setValue(false);
    expect(control.getValue()).to.be.false;
    expect(JSON.parse(element.form.config as string)).to.have.deep.property('events', []);

    control.setValue(true);
    expect(control.getValue()).to.be.true;
    expect(JSON.parse(element.form.config as string)).to.have.deep.property('events', [
      'subscription/cancelled',
    ]);
  });

  it('renders a text control for legacy xml webhook title in webhook legacy xml group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...JSON.parse(defaults.webhookLegacyXml), title: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webhook-legacy-xml-group-one"] foxy-internal-text-control[infer="webhook-legacy-xml-title"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webhookLegacyXml);
    expect(control).to.have.attribute('json-path', 'title');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for legacy xml webhook url in webhook legacy xml group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.webhookLegacyXml),
      url: 'https://example.com',
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webhook-legacy-xml-group-one"] foxy-internal-text-control[infer="webhook-legacy-xml-url"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webhookLegacyXml);
    expect(control).to.have.attribute('json-path', 'url');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a select control for webhook service in webhook legacy xml group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = defaults.webhookLegacyXml;

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webhook-legacy-xml-group-one"] foxy-internal-select-control[infer="webhook-service"]'
    ) as InternalSelectControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webhookLegacyXml);
    expect(control).to.have.attribute('json-path', 'service');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('options', [
      { value: 'json', label: 'option_json' },
      { value: 'legacy_xml', label: 'option_legacy_xml' },
    ]);
  });

  it('renders a text control for webflow site id in webflow group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webflow';
    data.config = JSON.stringify({ ...JSON.parse(defaults.webflow), site_id: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webflow-group-one"] foxy-internal-text-control[infer="webflow-site-id"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webflow);
    expect(control).to.have.attribute('json-path', 'site_id');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for webflow site name in webflow group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webflow';
    data.config = JSON.stringify({ ...JSON.parse(defaults.webflow), site_name: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webflow-group-one"] foxy-internal-text-control[infer="webflow-site-name"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webflow);
    expect(control).to.have.attribute('json-path', 'site_name');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for webflow collection id in webflow group two', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webflow';
    data.config = JSON.stringify({ ...JSON.parse(defaults.webflow), collection_id: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webflow-group-two"] foxy-internal-text-control[infer="webflow-collection-id"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webflow);
    expect(control).to.have.attribute('json-path', 'collection_id');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for webflow collection name in webflow group two', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webflow';
    data.config = JSON.stringify({ ...JSON.parse(defaults.webflow), collection_name: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webflow-group-two"] foxy-internal-text-control[infer="webflow-collection-name"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webflow);
    expect(control).to.have.attribute('json-path', 'collection_name');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for webflow sku field id in webflow group three', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webflow';
    data.config = JSON.stringify({ ...JSON.parse(defaults.webflow), sku_field_id: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webflow-group-three"] foxy-internal-text-control[infer="webflow-sku-field-id"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webflow);
    expect(control).to.have.attribute('json-path', 'sku_field_id');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for webflow sku field name in webflow group three', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webflow';
    data.config = JSON.stringify({ ...JSON.parse(defaults.webflow), sku_field_name: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webflow-group-three"] foxy-internal-text-control[infer="webflow-sku-field-name"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webflow);
    expect(control).to.have.attribute('json-path', 'sku_field_name');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for webflow inventory field id in webflow group four', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webflow';
    data.config = JSON.stringify({ ...JSON.parse(defaults.webflow), inventory_field_id: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webflow-group-four"] foxy-internal-text-control[infer="webflow-inventory-field-id"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webflow);
    expect(control).to.have.attribute('json-path', 'inventory_field_id');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a text control for webflow inventory field name in webflow group four', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webflow';
    data.config = JSON.stringify({ ...JSON.parse(defaults.webflow), inventory_field_name: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="webflow-group-four"] foxy-internal-text-control[infer="webflow-inventory-field-name"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.webflow);
    expect(control).to.have.attribute('json-path', 'inventory_field_name');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a readonly list control for zapier events in zapier group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'zapier';
    data.config = JSON.stringify({ ...JSON.parse(defaults.zapier), events: ['abc'] });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="zapier-group-one"] foxy-internal-editable-list-control[infer="zapier-events"]'
    ) as InternalEditableListControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.zapier);
    expect(control).to.have.attribute('json-path', 'events');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('simple-value');
  });

  it('renders a readonly text control for zapier url in zapier group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'zapier';
    data.config = JSON.stringify({
      ...JSON.parse(defaults.zapier),
      url: 'https://hooks.zapier.com/abc',
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="zapier-group-one"] foxy-internal-text-control[infer="zapier-url"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.zapier);
    expect(control).to.have.attribute('json-path', 'url');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a readonly content warning for zapier', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'zapier';
    data.config = defaults.zapier;

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const warning = element.renderRoot.querySelector('[key="warning_text"]');
    expect(warning).to.be.instanceOf(I18n);
    expect(warning).to.have.attribute('infer', 'zapier-warning');
  });

  it('renders a readonly text control for apple pay merchant ID in apple pay group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'apple_pay';
    data.config = JSON.stringify({ ...JSON.parse(defaults.applePay), merchantID: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="apple-pay-group-one"] foxy-internal-text-control[infer="apple-pay-merchant-id"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.applePay);
    expect(control).to.have.attribute('json-path', 'merchantID');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a readonly content warning for apple pay', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'apple_pay';
    data.config = defaults.applePay;

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const warning = element.renderRoot.querySelector('[key="warning_text"]');

    expect(warning).to.be.instanceOf(I18n);
    expect(warning).to.have.attribute('infer', 'apple-pay-warning');
  });

  it('renders a readonly text control for custom tax url in custom tax group one', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'custom_tax';
    data.config = JSON.stringify({ ...JSON.parse(defaults.customTax), url: 'https://example.com' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      'foxy-internal-summary-control[infer="custom-tax-group-one"] foxy-internal-text-control[infer="custom-tax-url"]'
    ) as InternalTextControl;

    expect(control).to.exist;
    expect(control).to.have.attribute('json-template', defaults.customTax);
    expect(control).to.have.attribute('json-path', 'url');
    expect(control).to.have.attribute('property', 'config');
    expect(control).to.have.attribute('layout', 'summary-item');
  });
});
