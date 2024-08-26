import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { WebhookCard } from './index';
import { Data } from './types';

describe('WebhookCard', () => {
  it('imports and defines foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('imports and defines foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.exist;
  });

  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
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

  it('has a reactive property "resourceUri" that defaults to null', () => {
    expect(new WebhookCard()).to.have.property('resourceUri', null);
    expect(WebhookCard).to.have.deep.nested.property('properties.resourceUri', {
      attribute: 'resource-uri',
    });
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

  it('hides webhook format and event resource type when resourceUri is set', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const card = await fixture<WebhookCard>(html`
      <foxy-webhook-card resource-uri="https://demo.api/hapi/transactions/0"> </foxy-webhook-card>
    `);

    card.data = webhook;
    await card.requestUpdate();

    expect(card.renderRoot).not.to.include.text(webhook.format);
    expect(card.renderRoot).not.to.include.text(webhook.event_resource);
  });

  it('loads webhook status when resourceUri is set', async () => {
    const router = createRouter();
    const card = await fixture<WebhookCard>(html`
      <foxy-webhook-card
        resource-uri="https://demo.api/hapi/transactions/0"
        href="https://demo.api/hapi/webhooks/0"
        @fetch=${(evt: FetchEvent) => !evt.defaultPrevented && router.handleEvent(evt)}
      >
      </foxy-webhook-card>
    `);

    let status: HTMLElement | null = null;

    await waitUntil(() => {
      status = card.renderRoot.querySelector('foxy-i18n[key^="status_"]') as HTMLElement;
      return !status.classList.contains('hidden');
    });

    expect(status).to.have.attribute('infer', '');

    const statusUri = 'https://demo.api/hapi/webhook_statuses/0';
    const statusResource = await getTestData<Resource<Rels.WebhookStatus>>(statusUri, router);
    statusResource.status = 'successful';
    WebhookCard.Rumour('').share({ source: statusUri, data: statusResource });
    await card.requestUpdate();

    expect(status).to.have.attribute('key', 'status_successful');

    statusResource.status = 'pending';
    WebhookCard.Rumour('').share({ source: statusUri, data: statusResource });
    await card.requestUpdate();

    expect(status).to.have.attribute('key', 'status_pending');
  });
});
