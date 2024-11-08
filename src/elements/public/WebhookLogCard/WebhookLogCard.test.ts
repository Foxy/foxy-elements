import { expect, fixture, html } from '@open-wc/testing';
import { getTestData } from '../../../testgen/getTestData';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { WebhookLogCard } from './index';
import { Data } from './types';

describe('WebhookLogCard', () => {
  it('imports and defines foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('imports and defines itself as foxy-webhook-log-card', () => {
    expect(customElements.get('foxy-webhook-log-card')).to.equal(WebhookLogCard);
  });

  it('extends InternalCard', () => {
    expect(new WebhookLogCard()).to.be.instanceOf(InternalCard);
  });

  it('has a default i18n namespace of webhook-log-card', () => {
    expect(WebhookLogCard).to.have.property('defaultNS', 'webhook-log-card');
    expect(new WebhookLogCard()).to.have.property('ns', 'webhook-log-card');
  });

  it('has a reactive property "layout"', async () => {
    expect(WebhookLogCard).to.have.deep.nested.property('properties.layout', {});
    expect(new WebhookLogCard()).to.have.property('layout', null);
  });

  it('renders log date when loaded', async () => {
    const webhookLog = await getTestData<Data>('./hapi/webhook_logs/0');
    const layout = html`<foxy-webhook-log-card></foxy-webhook-log-card>`;
    const card = await fixture<WebhookLogCard>(layout);

    card.data = webhookLog;
    await card.requestUpdate();

    const date = card.renderRoot.querySelector('foxy-i18n[key="date"]');

    expect(date).to.exist;
    expect(date).to.have.property('infer', '');
    expect(date).to.have.deep.property('options', { value: webhookLog.date_created });
  });

  it('renders response code when loaded', async () => {
    const webhookLog = await getTestData<Data>('./hapi/webhook_logs/0');
    const layout = html`<foxy-webhook-log-card></foxy-webhook-log-card>`;
    const card = await fixture<WebhookLogCard>(layout);

    card.data = webhookLog;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text(webhookLog.response_code);
  });

  it('renders response body when loaded', async () => {
    const webhookLog = await getTestData<Data>('./hapi/webhook_logs/0');
    const layout = html`<foxy-webhook-log-card></foxy-webhook-log-card>`;
    const card = await fixture<WebhookLogCard>(layout);

    card.data = webhookLog;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text(webhookLog.response_body as string);
  });

  it('renders resource type and id when loaded in default layout', async () => {
    const webhookLog = await getTestData<Data>('./hapi/webhook_logs/0');
    const layout = html`<foxy-webhook-log-card></foxy-webhook-log-card>`;
    const card = await fixture<WebhookLogCard>(layout);

    card.data = { ...webhookLog, resource_id: 123, resource_type: 'customer' };
    await card.requestUpdate();
    expect(card.renderRoot).to.include.text('customer #123');

    card.layout = 'resource';
    await card.requestUpdate();
    expect(card.renderRoot).not.to.include.text('customer #123');
  });
});
