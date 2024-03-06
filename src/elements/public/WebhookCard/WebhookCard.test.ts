import { expect, fixture, html } from '@open-wc/testing';
import { getTestData } from '../../../testgen/getTestData';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { WebhookCard } from './index';
import { Data } from './types';

describe('WebhookCard', () => {
  it('imports and defines foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('imports and defines itself as foxy-webhook-card', () => {
    expect(customElements.get('foxy-webhook-card')).to.equal(WebhookCard);
  });

  it('extends InternalCard', () => {
    expect(new WebhookCard()).to.be.instanceOf(InternalCard);
  });

  it('has a default i18n namespace of webhook-card', () => {
    expect(WebhookCard).to.have.property('defaultNS', 'webhook-card');
    expect(new WebhookCard()).to.have.property('ns', 'webhook-card');
  });

  it('renders webhook name when loaded', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const layout = html`<foxy-webhook-card></foxy-webhook-card>`;
    const card = await fixture<WebhookCard>(layout);

    card.data = webhook;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text(webhook.name);
  });

  it('renders webhook format when loaded', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const layout = html`<foxy-webhook-card></foxy-webhook-card>`;
    const card = await fixture<WebhookCard>(layout);

    card.data = webhook;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text(webhook.format);
  });

  it('renders webhook url when loaded', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const layout = html`<foxy-webhook-card></foxy-webhook-card>`;
    const card = await fixture<WebhookCard>(layout);

    card.data = webhook;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text(webhook.url as string);
  });

  it('renders webhook event resource type when loaded', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const layout = html`<foxy-webhook-card></foxy-webhook-card>`;
    const card = await fixture<WebhookCard>(layout);

    card.data = webhook;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text(webhook.event_resource);
  });
});
