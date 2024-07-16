import { expect, fixture, html } from '@open-wc/testing';
import { getTestData } from '../../../testgen/getTestData';
import { InternalAsyncListControl } from '../../internal/InternalAsyncListControl/InternalAsyncListControl';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { InternalRadioGroupControl } from '../../internal/InternalRadioGroupControl/InternalRadioGroupControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { WebhookForm } from './index';
import { Data } from './types';

describe('WebhookForm', () => {
  it('imports and defines foxy-internal-async-list-control element', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-radio-group-control element', () => {
    expect(customElements.get('foxy-internal-radio-group-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control element', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-webhook-status-card element', () => {
    expect(customElements.get('foxy-webhook-status-card')).to.exist;
  });

  it('imports and defines foxy-webhook-log-card element', () => {
    expect(customElements.get('foxy-webhook-log-card')).to.exist;
  });

  it('imports and defines foxy-internal-form element', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines itself as foxy-webhook-form', () => {
    expect(customElements.get('foxy-webhook-form')).to.equal(WebhookForm);
  });

  it('extends InternalForm', () => {
    expect(new WebhookForm()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace of webhook-form', () => {
    expect(WebhookForm).to.have.property('defaultNS', 'webhook-form');
    expect(new WebhookForm()).to.have.property('ns', 'webhook-form');
  });

  it('produces an v8n error if webhook name is missing', () => {
    const form = new WebhookForm();
    expect(WebhookForm.v8n.map(fn => fn({}, form))).to.include('name:v8n_required');
  });

  it('produces an v8n error if webhook name is too long', () => {
    const name = 'A'.repeat(256);
    const form = new WebhookForm();
    expect(WebhookForm.v8n.map(fn => fn({ name }, form))).to.include('name:v8n_too_long');
  });

  it('produces an v8n error if webhook version is missing', () => {
    const form = new WebhookForm();
    expect(WebhookForm.v8n.map(fn => fn({}, form))).to.include('version:v8n_required');
  });

  it('produces an v8n error if webhook format is missing', () => {
    const form = new WebhookForm();
    expect(WebhookForm.v8n.map(fn => fn({}, form))).to.include('format:v8n_required');
  });

  it('produces an v8n error if webhook url is too long', () => {
    const url = 'A'.repeat(1001);
    const form = new WebhookForm();
    expect(WebhookForm.v8n.map(fn => fn({ url }, form))).to.include('url:v8n_too_long');
  });

  it('produces an v8n error if webhook query is too long', () => {
    const query = 'A'.repeat(1001);
    const form = new WebhookForm();
    expect(WebhookForm.v8n.map(fn => fn({ query }, form))).to.include('query:v8n_too_long');
  });

  it('produces an v8n error if webhook encryption-key is too long', () => {
    const encryption_key = 'A'.repeat(1001);
    const form = new WebhookForm();
    const errors = WebhookForm.v8n.map(fn => fn({ encryption_key }, form));
    expect(errors).to.include('encryption-key:v8n_too_long');
  });

  it('renders webhook name as text control', async () => {
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const control = element.renderRoot.querySelector('[infer="name"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders webhook event resource type as radio group control', async () => {
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const control = element.renderRoot.querySelector('[infer="event-resource"]');
    const options = [
      { value: 'subscription', label: 'event_resource_subscription' },
      { value: 'transaction', label: 'event_resource_transaction' },
      { value: 'customer', label: 'event_resource_customer' },
    ];

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalRadioGroupControl);
    expect(control).to.have.deep.property('options', options);
  });

  it('renders webhook query as text control', async () => {
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const control = element.renderRoot.querySelector('[infer="query"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders webhook url as text control', async () => {
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const control = element.renderRoot.querySelector('[infer="url"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders webhook format as radio group control', async () => {
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const control = element.renderRoot.querySelector('[infer="format"]');
    const options = [
      { value: 'json', label: 'JSON' },
      { value: 'webflow', label: 'Webflow' },
      { value: 'zapier', label: 'Zapier' },
    ];

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalRadioGroupControl);
    expect(control).to.have.deep.property('options', options);
  });

  it('renders webhook encryption key as text control', async () => {
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const control = element.renderRoot.querySelector('[infer="encryption-key"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders webhook version as text control', async () => {
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const control = element.renderRoot.querySelector('[infer="version"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders webhook statuses when an existing webhook is loaded', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);

    element.data = webhook;
    await element.requestUpdate();

    const control = element.renderRoot.querySelector('[infer="statuses"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalAsyncListControl);
    expect(control).to.have.property('first', webhook._links['fx:statuses'].href);
    expect(control).to.have.property('item', 'foxy-webhook-status-card');
  });

  it('renders webhook logs when an existing webhook is loaded', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);

    element.data = webhook;
    await element.requestUpdate();

    const control = element.renderRoot.querySelector('[infer="logs"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalAsyncListControl);
    expect(control).to.have.property('first', webhook._links['fx:logs'].href);
    expect(control).to.have.property('item', 'foxy-webhook-log-card');
  });

  it('makes event resource selector readonly when loaded', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);

    expect(element.readonlySelector.matches('event-resource', true)).to.be.false;
    element.data = webhook;
    expect(element.readonlySelector.matches('event-resource', true)).to.be.true;
  });
});
