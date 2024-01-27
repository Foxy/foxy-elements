import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { NativeIntegrationForm as Form } from './NativeIntegrationForm';
import { InternalCheckboxGroupControl } from '../../internal/InternalCheckboxGroupControl/InternalCheckboxGroupControl';
import { InternalEditableListControl } from '../../internal/InternalEditableListControl/InternalEditableListControl';
import { InternalRadioGroupControl } from '../../internal/InternalRadioGroupControl/InternalRadioGroupControl';
import { InternalPasswordControl } from '../../internal/InternalPasswordControl/InternalPasswordControl';
import { InternalTextAreaControl } from '../../internal/InternalTextAreaControl/InternalTextAreaControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { I18n } from '../I18n';

import * as defaults from './defaults';

describe('NativeIntegrationForm', () => {
  it('imports and defines foxy-internal-checkbox-group-control element', () => {
    expect(customElements.get('foxy-internal-checkbox-group-control')).to.exist;
  });

  it('imports and defines foxy-internal-editable-list-control element', () => {
    expect(customElements.get('foxy-internal-editable-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-radio-group-control element', () => {
    expect(customElements.get('foxy-internal-radio-group-control')).to.exist;
  });

  it('imports and defines foxy-internal-password-control element', () => {
    expect(customElements.get('foxy-internal-password-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-area-control element', () => {
    expect(customElements.get('foxy-internal-text-area-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control element', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form element', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
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

  it('produces webhook-webflow-site-id:v8n_required error if site id for webflow webhook is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webhook-webflow-site-id:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', site_id: 'abc' }) });
    expect(element.errors).to.not.include('webhook-webflow-site-id:v8n_required');
  });

  it('produces webhook-webflow-site-name:v8n_required error if site name for webflow webhook is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webhook-webflow-site-name:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', site_name: 'abc' }) });
    expect(element.errors).to.not.include('webhook-webflow-site-name:v8n_required');
  });

  it('produces webhook-webflow-collection-id:v8n_required error if collection id for webflow webhook is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webhook-webflow-collection-id:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', collection_id: 'abc' }) });
    expect(element.errors).to.not.include('webhook-webflow-collection-id:v8n_required');
  });

  it('produces webhook-webflow-collection-name:v8n_required error if collection name for webflow webhook is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webhook-webflow-collection-name:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', collection_name: 'abc' }) });
    expect(element.errors).to.not.include('webhook-webflow-collection-name:v8n_required');
  });

  it('produces webhook-webflow-sku-field-id:v8n_required error if sku field id for webflow webhook is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webhook-webflow-sku-field-id:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', sku_field_id: 'abc' }) });
    expect(element.errors).to.not.include('webhook-webflow-sku-field-id:v8n_required');
  });

  it('produces webhook-webflow-sku-field-name:v8n_required error if sku field name for webflow webhook is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webhook-webflow-sku-field-name:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', sku_field_name: 'abc' }) });
    expect(element.errors).to.not.include('webhook-webflow-sku-field-name:v8n_required');
  });

  it('produces webhook-webflow-inventory-field-id:v8n_required error if inventory field id for webflow webhook is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webhook-webflow-inventory-field-id:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', inventory_field_id: 'abc' }) });
    expect(element.errors).to.not.include('webhook-webflow-inventory-field-id:v8n_required');
  });

  it('produces webhook-webflow-inventory-field-name:v8n_required error if inventory field name for webflow webhook is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webhook-webflow-inventory-field-name:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', inventory_field_name: 'abc' }) });
    expect(element.errors).to.not.include('webhook-webflow-inventory-field-name:v8n_required');
  });

  it('produces webhook-webflow-auth:v8n_required error if auth token for webflow webhook is missing', () => {
    const element = new Form();
    element.edit({ provider: 'webhook', config: JSON.stringify({ service: 'webflow' }) });
    expect(element.errors).to.include('webhook-webflow-auth:v8n_required');
    element.edit({ config: JSON.stringify({ service: 'webflow', auth: 'abc' }) });
    expect(element.errors).to.not.include('webhook-webflow-auth:v8n_required');
  });

  it('makes provider, webhook-zapier-event and webhook-zapier-url controls readonly when href is defined', () => {
    const element = new Form();

    element.addEventListener('fetch', (evt: Event) => {
      if (evt instanceof FetchEvent) {
        evt.respondWith(Promise.resolve(new Response(null, { status: 500 })));
      }
    });

    expect(element.readonlySelector.matches('provider', true)).to.be.false;
    expect(element.readonlySelector.matches('webhook-zapier-event', true)).to.be.false;
    expect(element.readonlySelector.matches('webhook-zapier-url', true)).to.be.false;

    element.href = 'https://demo.api/hapi/native_integrations/0';

    expect(element.readonlySelector.matches('provider', true)).to.be.true;
    expect(element.readonlySelector.matches('webhook-zapier-event', true)).to.be.true;
    expect(element.readonlySelector.matches('webhook-zapier-url', true)).to.be.true;
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

  it('does not render provider name for webhooks when href is defined', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-native-integration-form
        href="https://demo.api/hapi/native_integrations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-native-integration-form>
    `);

    await waitUntil(() => element.in('idle'));
    element.edit({ provider: 'webhook', config: JSON.stringify(defaults.webhookJson) });
    await element.requestUpdate();

    const control = element.renderRoot.querySelector('[infer="provider"]');
    expect(control).to.not.exist;
  });

  it('renders non-webhook provider name in text control when href is defined', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-native-integration-form
        href="https://demo.api/hapi/native_integrations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-native-integration-form>
    `);

    await waitUntil(() => element.in('idle'));
    const control = element.renderRoot.querySelector('[infer="provider"]') as InternalTextControl;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders provider selector when href is not defined', async () => {
    const element = await fixture<Form>(
      html`<foxy-native-integration-form></foxy-native-integration-form>`
    );

    const control = element.renderRoot.querySelector(
      '[infer="provider"]'
    ) as InternalRadioGroupControl;

    expect(control).to.be.instanceOf(InternalRadioGroupControl);
    expect(control.getValue()).to.equal('avalara');
    expect(control).to.have.deep.property('options', [
      { value: 'avalara', label: 'option_avalara' },
      { value: 'onesource', label: 'option_onesource' },
      { value: 'taxjar', label: 'option_taxjar' },
      { value: 'webflow', label: 'option_webflow' },
    ]);

    control.setValue('taxjar');

    expect(element).to.have.nested.property('form.provider', 'taxjar');
    expect(element).to.have.nested.property('form.config', JSON.stringify(defaults.taxjar));
    expect(control.getValue()).to.equal('taxjar');
  });

  it('renders a text control for avalara service url', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({ ...defaults.avalara, service_url: 'https://example.com' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="avalara-service-url"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('https://example.com');

    control.setValue('https://foo.example.com/abc');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('service_url', 'https://foo.example.com/abc');
  });

  it('renders a text control for avalara id', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({ ...defaults.avalara, id: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector('[infer="avalara-id"]') as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('id', 'def');
  });

  it('renders a password control for avalara key', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({ ...defaults.avalara, key: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="avalara-key"]'
    ) as InternalPasswordControl;

    expect(control).to.be.instanceOf(InternalPasswordControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('key', 'def');
  });

  it('renders a text control for avalara company code', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({ ...defaults.avalara, company_code: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="avalara-company-code"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('company_code', 'def');
  });

  it('renders an editable list control for avalara tax code mappings', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({
      ...defaults.avalara,
      category_to_product_tax_code_mappings: { foo: 'bar', bar: 'qux' },
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="avalara-category-to-product-tax-code-mappings"]'
    ) as InternalEditableListControl;

    expect(control).to.be.instanceOf(InternalEditableListControl);
    expect(control.getValue()).to.deep.equal([{ value: 'foo:bar' }, { value: 'bar:qux' }]);

    control.setValue([{ value: 'a:b' }]);
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.deep.property('category_to_product_tax_code_mappings', { a: 'b' });
  });

  it('renders a checkbox group control for avalara options', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify(defaults.avalara);

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="avalara-options"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control.getValue()).to.deep.equal([]);
    expect(control).to.have.deep.property('options', [
      {
        value: 'use_ava_tax',
        label: 'option_use_ava_tax',
      },
      {
        value: 'enable_colorado_delivery_fee',
        label: 'option_enable_colorado_delivery_fee',
      },
      {
        value: 'create_invoice',
        label: 'option_create_invoice',
      },
      {
        value: 'use_address_validation',
        label: 'option_use_address_validation',
      },
    ]);

    let config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('enable_colorado_delivery_fee', false);
    expect(config).to.have.property('use_address_validation', false);
    expect(config).to.have.property('create_invoice', false);
    expect(config).to.have.property('use_ava_tax', false);

    control.setValue(['enable_colorado_delivery_fee']);
    config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('enable_colorado_delivery_fee', true);

    control.setValue(['use_address_validation']);
    config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('use_address_validation', true);

    control.setValue(['create_invoice']);
    config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('create_invoice', true);

    control.setValue(['use_ava_tax']);
    config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('use_ava_tax', true);
  });

  it('renders a checkbox group control for address validation countries if address validation is on', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'avalara';
    data.config = JSON.stringify({ ...defaults.avalara, use_address_validation: true });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="avalara-address-validation-countries"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control.getValue()).to.deep.equal([]);
    expect(control).to.have.deep.property('options', [
      { value: 'US', label: 'option_US' },
      { value: 'CA', label: 'option_CA' },
    ]);

    let config = JSON.parse(element.form.config as string);
    expect(config).to.have.deep.property('address_validation_countries', []);

    control.setValue(['US']);
    config = JSON.parse(element.form.config as string);
    expect(config).to.have.deep.property('address_validation_countries', ['US']);

    control.setValue(['CA']);
    config = JSON.parse(element.form.config as string);
    expect(config).to.have.deep.property('address_validation_countries', ['CA']);
  });

  it('renders a password control for taxjar api token', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'taxjar';
    data.config = JSON.stringify({ ...defaults.taxjar, api_token: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="taxjar-api-token"]'
    ) as InternalPasswordControl;

    expect(control).to.be.instanceOf(InternalPasswordControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('api_token', 'def');
  });

  it('renders an editable list control for taxjar product code mappings', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'taxjar';
    data.config = JSON.stringify({
      ...defaults.taxjar,
      category_to_product_tax_code_mappings: { foo: 'bar', bar: 'qux' },
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="taxjar-category-to-product-tax-code-mappings"]'
    ) as InternalEditableListControl;

    expect(control).to.be.instanceOf(InternalEditableListControl);
    expect(control.getValue()).to.deep.equal([{ value: 'foo:bar' }, { value: 'bar:qux' }]);

    control.setValue([{ value: 'a:b' }]);
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.deep.property('category_to_product_tax_code_mappings', { a: 'b' });
  });

  it('renders a checkbox group control for taxjar options', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'taxjar';
    data.config = JSON.stringify(defaults.taxjar);

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);
    const control = element.renderRoot.querySelector(
      '[infer="taxjar-options"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control.getValue()).to.deep.equal([]);
    expect(control).to.have.deep.property('options', [
      {
        value: 'create_invoice',
        label: 'option_create_invoice',
      },
    ]);

    let config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('create_invoice', false);

    control.setValue(['create_invoice']);
    config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('create_invoice', true);
  });

  it('renders a text control for onesource service url', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({ ...defaults.onesource, service_url: 'https://example.com' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="onesource-service-url"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('https://example.com');

    control.setValue('https://foo.example.com/abc');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('service_url', 'https://foo.example.com/abc');
  });

  it('renders a text control for onesource external company id', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({ ...defaults.onesource, external_company_id: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);
    const control = element.renderRoot.querySelector(
      '[infer="onesource-external-company-id"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('external_company_id', 'def');
  });

  it('renders a text control for onesource calling system number', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({ ...defaults.onesource, calling_system_number: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);
    const control = element.renderRoot.querySelector(
      '[infer="onesource-calling-system-number"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('calling_system_number', 'def');
  });

  it('renders a text control for onesource from city', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({ ...defaults.onesource, from_city: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);
    const control = element.renderRoot.querySelector(
      '[infer="onesource-from-city"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('from_city', 'def');
  });

  it('renders a text control for onesource host system', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({ ...defaults.onesource, host_system: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);
    const control = element.renderRoot.querySelector(
      '[infer="onesource-host-system"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('host_system', 'def');
  });

  it('renders a radio group control for onesource company role', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify(defaults.onesource);

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);
    const control = element.renderRoot.querySelector(
      '[infer="onesource-company-role"]'
    ) as InternalRadioGroupControl;

    expect(control).to.be.instanceOf(InternalRadioGroupControl);
    expect(control.getValue()).to.equal('B');
    expect(control).to.have.deep.property('options', [
      { value: 'B', label: 'option_buyer' },
      { value: 'M', label: 'option_middleman' },
      { value: 'S', label: 'option_seller' },
    ]);

    control.setValue('S');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('company_role', 'S');
  });

  it('renders a text control for onesource part number product option', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({ ...defaults.onesource, part_number_product_option: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);
    const control = element.renderRoot.querySelector(
      '[infer="onesource-part-number-product-option"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('part_number_product_option', 'def');
  });

  it('renders an editable list control for onesource product order priority', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify({ ...defaults.onesource, product_order_priority: 'foo,bar' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);
    const control = element.renderRoot.querySelector(
      '[infer="onesource-product-order-priority"]'
    ) as InternalEditableListControl;

    expect(control).to.be.instanceOf(InternalEditableListControl);
    expect(control.getValue()).to.deep.equal([{ value: 'foo' }, { value: 'bar' }]);

    control.setValue([{ value: 'a' }, { value: 'b' }]);
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('product_order_priority', 'a,b');
  });

  it('renders a radio group control for onesource audit settings', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'onesource';
    data.config = JSON.stringify(defaults.onesource);

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);
    const control = element.renderRoot.querySelector(
      '[infer="onesource-audit-settings"]'
    ) as InternalRadioGroupControl;

    expect(control).to.be.instanceOf(InternalRadioGroupControl);
    expect(control.getValue()).to.equal('never');
    expect(control).to.have.deep.property('options', [
      { value: 'capture_only', label: 'option_capture_only' },
      { value: 'auth_and_capture', label: 'option_auth_and_capture' },
      { value: 'never', label: 'option_never' },
    ]);

    control.setValue('auth_and_capture');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('audit_settings', 'auth_and_capture');
  });

  it('renders a deprecation warning for json and legacy_xml webhooks', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify(defaults.webhookJson);

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    let warning = element.renderRoot.querySelector('[key="warning_text"]');
    expect(warning).to.be.instanceOf(I18n);
    expect(warning).to.have.attribute('infer', 'webhook-warning');

    data.config = JSON.stringify(defaults.webhookLegacyXml);
    element.data = { ...data };
    await element.requestUpdate();

    warning = element.renderRoot.querySelector('[key="warning_text"]');
    expect(warning).to.be.instanceOf(I18n);
    expect(warning).to.have.attribute('infer', 'webhook-warning');

    data.provider = 'avalara';
    data.config = JSON.stringify(defaults.avalara);
    element.data = { ...data };
    await element.requestUpdate();

    warning = element.renderRoot.querySelector('[key="warning_text"]');
    expect(warning).to.not.exist;
  });

  it('renders a text control for webhook json title', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookJson, title: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-json-title"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('title', 'def');
  });

  it('renders a text area control for webhook json url', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookJson, url: 'https://example.com' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-json-url"]'
    ) as InternalTextAreaControl;

    expect(control).to.be.instanceOf(InternalTextAreaControl);
    expect(control.getValue()).to.equal('https://example.com');

    control.setValue('https://foo.example.com/abc');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('url', 'https://foo.example.com/abc');
  });

  it('renders a radio group control for json webhook service', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify(defaults.webhookJson);

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-service"]'
    ) as InternalRadioGroupControl;

    expect(control).to.be.instanceOf(InternalRadioGroupControl);
    expect(control.getValue()).to.equal('json');
    expect(control).to.have.deep.property('options', [
      { value: 'json', label: 'option_json' },
      { value: 'legacy_xml', label: 'option_legacy_xml' },
    ]);

    control.setValue('legacy_xml');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('service', 'legacy_xml');
  });

  it('renders a checkbox group control for webhook json events', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify(defaults.webhookJson);

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-json-events"]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control.getValue()).to.deep.equal([]);
    expect(control).to.have.deep.property('options', [
      { value: 'transaction/created', label: 'option_transaction_created' },
      { value: 'subscription/cancelled', label: 'option_subscription_cancelled' },
    ]);

    control.setValue(['transaction/created']);
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.deep.property('events', ['transaction/created']);
  });

  it('renders a password control for webhook json encryption key', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookJson, encryption_key: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-json-encryption-key"]'
    ) as InternalPasswordControl;

    expect(control).to.be.instanceOf(InternalPasswordControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('encryption_key', 'def');
  });

  it('renders a text control for legacy xml webhook title', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookLegacyXml, title: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-legacy-xml-title"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('title', 'def');
  });

  it('renders a text area control for legacy xml webhook url', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookLegacyXml, url: 'https://example.com' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-legacy-xml-url"]'
    ) as InternalTextAreaControl;

    expect(control).to.be.instanceOf(InternalTextAreaControl);
    expect(control.getValue()).to.equal('https://example.com');

    control.setValue('https://foo.example.com/abc');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('url', 'https://foo.example.com/abc');
  });

  it('renders a radio group control for legacy xml webhook service', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify(defaults.webhookLegacyXml);

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-service"]'
    ) as InternalRadioGroupControl;

    expect(control).to.be.instanceOf(InternalRadioGroupControl);
    expect(control.getValue()).to.equal('legacy_xml');
    expect(control).to.have.deep.property('options', [
      { value: 'json', label: 'option_json' },
      { value: 'legacy_xml', label: 'option_legacy_xml' },
    ]);

    control.setValue('json');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('service', 'json');
  });

  it('renders a text control for webflow webhook site id', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookWebflow, site_id: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-webflow-site-id"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('site_id', 'def');
  });

  it('renders a text control for webflow webhook site name', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookWebflow, site_name: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-webflow-site-name"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('site_name', 'def');
  });

  it('renders a text control for webflow webhook collection id', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookWebflow, collection_id: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-webflow-collection-id"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('collection_id', 'def');
  });

  it('renders a text control for webflow webhook collection name', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookWebflow, collection_name: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-webflow-collection-name"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('collection_name', 'def');
  });

  it('renders a text control for webflow webhook sku field id', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookWebflow, sku_field_id: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}> </foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-webflow-sku-field-id"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('sku_field_id', 'def');
  });

  it('renders a text control for webflow webhook sku field name', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookWebflow, sku_field_name: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-webflow-sku-field-name"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');
    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('sku_field_name', 'def');
  });

  it('renders a text control for webflow webhook inventory field id', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookWebflow, inventory_field_id: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);
    const control = element.renderRoot.querySelector(
      '[infer="webhook-webflow-inventory-field-id"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');

    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('inventory_field_id', 'def');
  });

  it('renders a text control for webflow webhook inventory field name', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookWebflow, inventory_field_name: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-webflow-inventory-field-name"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');

    const config = JSON.parse(element.form.config as string);
    expect(config).to.have.property('inventory_field_name', 'def');
  });

  it('renders a password control for webflow webhook auth', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookWebflow, auth: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-webflow-auth"]'
    ) as InternalPasswordControl;

    expect(control).to.be.instanceOf(InternalPasswordControl);
    expect(control.getValue()).to.equal('abc');

    control.setValue('def');

    const newConfig = JSON.parse(element.form.config as string);
    expect(newConfig).to.have.property('auth', 'def');
  });

  it('renders a readonly text control for zapier webhook event', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookZapier, event: 'abc' });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-zapier-event"]'
    ) as InternalTextControl;

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control.getValue()).to.equal('abc');
  });

  it('renders a readonly text area control for zapier webhook url', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify({
      ...defaults.webhookZapier,
      url: 'https://hooks.zapier.com/abc',
    });

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="webhook-zapier-url"]'
    ) as InternalTextAreaControl;

    expect(control).to.be.instanceOf(InternalTextAreaControl);
    expect(control.getValue()).to.equal('https://hooks.zapier.com/abc');
  });

  it('renders a readonly content warning for zapier webhook', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');
    data.provider = 'webhook';
    data.config = JSON.stringify(defaults.webhookZapier);

    const element = await fixture<Form>(html`
      <foxy-native-integration-form .data=${data}></foxy-native-integration-form>
    `);

    const warning = element.renderRoot.querySelector('[key="warning_text"]');
    expect(warning).to.be.instanceOf(I18n);
    expect(warning).to.have.attribute('infer', 'webhook-zapier-warning');
  });
});
