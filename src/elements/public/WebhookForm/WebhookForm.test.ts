import './index';

import type { Data } from './types';

import { InternalAsyncListControl } from '../../internal/InternalAsyncListControl/InternalAsyncListControl';
import { InternalPasswordControl } from '../../internal/InternalPasswordControl/InternalPasswordControl';
import { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import { InternalSourceControl } from '../../internal/InternalSourceControl/InternalSourceControl';
import { expect, fixture, html } from '@open-wc/testing';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { getTestData } from '../../../testgen/getTestData';
import { WebhookForm } from './WebhookForm';
import { stub } from 'sinon';

describe('WebhookForm', () => {
  it('imports and defines foxy-internal-async-list-control element', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-password-control element', () => {
    expect(customElements.get('foxy-internal-password-control')).to.exist;
  });

  it('imports and defines foxy-internal-select-control element', () => {
    expect(customElements.get('foxy-internal-select-control')).to.exist;
  });

  it('imports and defines foxy-internal-source-control element', () => {
    expect(customElements.get('foxy-internal-source-control')).to.exist;
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

  it('has a reactive property "getStatusPageHref" that defaults to null', () => {
    expect(new WebhookForm()).to.have.property('getStatusPageHref', null);
    expect(WebhookForm).to.have.deep.nested.property('properties.getStatusPageHref', {
      attribute: false,
    });
  });

  it('has a reactive property "getLogPageHref" that defaults to null', () => {
    expect(new WebhookForm()).to.have.property('getLogPageHref', null);
    expect(WebhookForm).to.have.deep.nested.property('properties.getLogPageHref', {
      attribute: false,
    });
  });

  it('has a reactive property "resourceUri" that defaults to null', () => {
    expect(new WebhookForm()).to.have.property('resourceUri', null);
    expect(WebhookForm).to.have.deep.nested.property('properties.resourceUri', {
      attribute: 'resource-uri',
    });
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

  it('produces an v8n error if webhook encryption-key is missing', () => {
    const form = new WebhookForm();
    const errors = WebhookForm.v8n.map(fn => fn({}, form));
    expect(errors).to.include('encryption-key:v8n_required');

    const encryption_key = 'A'.repeat(1000);
    expect(WebhookForm.v8n.map(fn => fn({ encryption_key }, form))).to.not.include(
      'encryption-key:v8n_required'
    );
  });

  it('produces an v8n error if webhook encryption-key is too long', () => {
    const encryption_key = 'A'.repeat(1001);
    const form = new WebhookForm();
    const errors = WebhookForm.v8n.map(fn => fn({ encryption_key }, form));
    expect(errors).to.include('encryption-key:v8n_too_long');
  });

  it('renders a form header', () => {
    const form = new WebhookForm();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('uses event resource as context for header subtitle', async () => {
    const form = new WebhookForm();
    form.data = await getTestData<Data>('./hapi/webhooks/0');
    expect(form.headerSubtitleOptions).to.have.property('context', form.data?.event_resource);
  });

  it('renders a General summary', async () => {
    const form = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const control = form.renderRoot.querySelector('foxy-internal-summary-control[infer="general"]');
    expect(control).to.exist;
  });

  it('renders webhook name as text control inside of the General summary', async () => {
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const control = element.renderRoot.querySelector('[infer="general"] [infer="name"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders webhook event resource type as select control inside of the General summary', async () => {
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const control = element.renderRoot.querySelector('[infer="general"] [infer="event-resource"]');
    const options = [
      { value: 'subscription', label: 'event_resource_subscription' },
      { value: 'transaction', label: 'event_resource_transaction' },
      { value: 'customer', label: 'event_resource_customer' },
    ];

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.deep.property('options', options);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders webhook query as source control', async () => {
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const control = element.renderRoot.querySelector('[infer="query"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSourceControl);
  });

  it('renders webhook url as source control', async () => {
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const control = element.renderRoot.querySelector('[infer="url"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalSourceControl);
  });

  it('renders webhook encryption key as password control inside of the General summary', async () => {
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const control = element.renderRoot.querySelector('[infer="general"] [infer="encryption-key"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalPasswordControl);
    expect(control).to.have.attribute('show-generator');
    expect(control).to.have.deep.property('generatorOptions', { separator: '', length: 512 });
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders webhook statuses when an existing webhook is loaded', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const getPageHref = stub();

    element.getStatusPageHref = getPageHref;
    element.data = webhook;
    await element.requestUpdate();
    const control = element.renderRoot.querySelector('[infer="statuses"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalAsyncListControl);
    expect(control).to.have.property('item', 'foxy-webhook-status-card');
    expect(control).to.have.property('getPageHref', getPageHref);
    expect(control).to.have.property(
      'first',
      'https://demo.api/hapi/webhook_statuses?webhook_id=0&order=date_created+desc'
    );

    expect(control).to.have.deep.property('itemProps', {});
    element.resourceUri = 'https://demo.api/hapi/transactions/0';
    await element.requestUpdate();
    expect(control).to.have.deep.property('itemProps', { layout: 'resource' });
  });

  it('includes only resource-specific statuses when resource uri is set', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const element = await fixture<WebhookForm>(html`
      <foxy-webhook-form resource-uri="https://demo.api/hapi/transactions/0"></foxy-webhook-form>
    `);

    element.data = webhook;
    await element.requestUpdate();
    const control = element.renderRoot.querySelector('[infer="statuses"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalAsyncListControl);
    expect(control).to.have.property('item', 'foxy-webhook-status-card');
    expect(control).to.have.property(
      'first',
      'https://demo.api/hapi/webhook_statuses?webhook_id=0&resource_id=0&order=date_created+desc'
    );
  });

  it('renders webhook logs when an existing webhook is loaded', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    const getPageHref = stub();

    element.getLogPageHref = getPageHref;
    element.data = webhook;
    await element.requestUpdate();
    const control = element.renderRoot.querySelector('[infer="logs"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalAsyncListControl);
    expect(control).to.have.property('item', 'foxy-webhook-log-card');
    expect(control).to.have.property('getPageHref', getPageHref);
    expect(control).to.have.property(
      'first',
      'https://demo.api/hapi/webhook_logs?webhook_id=0&order=date_created+desc'
    );

    expect(control).to.have.deep.property('itemProps', {});
    element.resourceUri = 'https://demo.api/hapi/transactions/0';
    await element.requestUpdate();
    expect(control).to.have.deep.property('itemProps', { layout: 'resource' });
  });

  it('includes only resource-specific logs when resource uri is set', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const element = await fixture<WebhookForm>(html`
      <foxy-webhook-form resource-uri="https://demo.api/hapi/transactions/0"></foxy-webhook-form>
    `);

    element.data = webhook;
    await element.requestUpdate();
    const control = element.renderRoot.querySelector('[infer="logs"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalAsyncListControl);
    expect(control).to.have.property('item', 'foxy-webhook-log-card');
    expect(control).to.have.property(
      'first',
      'https://demo.api/hapi/webhook_logs?webhook_id=0&resource_id=0&order=date_created+desc'
    );
  });

  it('hides event resource selector when loaded', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);
    expect(element.hiddenSelector.matches('general:event-resource', true)).to.be.false;

    element.data = webhook;
    expect(element.hiddenSelector.matches('general:event-resource', true)).to.be.true;
  });

  it('hides logs and statuses in empty state', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const element = await fixture<WebhookForm>(html`<foxy-webhook-form></foxy-webhook-form>`);

    expect(element.hiddenSelector.matches('statuses', true)).to.be.true;
    expect(element.hiddenSelector.matches('logs', true)).to.be.true;

    element.data = webhook;

    expect(element.hiddenSelector.matches('statuses', true)).to.be.false;
    expect(element.hiddenSelector.matches('logs', true)).to.be.false;
  });
});
