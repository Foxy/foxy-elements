import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { NucleonElement } from '../NucleonElement/NucleonElement';
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

  it('hides webhook event resource type when resourceUri is set', async () => {
    const webhook = await getTestData<Data>('./hapi/webhooks/0');
    const card = await fixture<WebhookCard>(html`
      <foxy-webhook-card resource-uri="https://demo.api/hapi/transactions/0"> </foxy-webhook-card>
    `);

    card.data = webhook;
    await card.requestUpdate();
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

    await waitUntil(() => card.isBodyReady);
    const status = card.renderRoot.querySelector('foxy-i18n[key^="status_"]') as HTMLElement;
    expect(status).to.have.attribute('infer', '');

    const statusUri = 'https://demo.api/hapi/webhook_statuses/0';
    const statusResource = await getTestData<Resource<Rels.WebhookStatus>>(statusUri, router);
    statusResource.status = 'successful';
    WebhookCard.Rumour('').share({ source: statusUri, data: statusResource });
    await card.requestUpdate();

    expect(status).to.have.attribute('key', 'status_successful');
    expect(status).to.have.deep.property('options', statusResource);

    statusResource.status = 'pending';
    WebhookCard.Rumour('').share({ source: statusUri, data: statusResource });
    await card.requestUpdate();

    expect(status).to.have.attribute('key', 'status_pending');
    expect(status).to.have.deep.property('options', statusResource);
  });
  describe('current user scope', () => {
    const create = async (scope: string | null) => {
      const router = createRouter();
      const data = await getTestData<any>('./hapi/webhooks/0');
      data._links['fx:statuses'] = { href: 'https://demo.api/virtual/denied' };

      const card = await fixture<WebhookCard>(html`
        <foxy-webhook-card
          .currentUserScope=${scope}
          .data=${data}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-webhook-card>
      `);

      await waitUntil(
        () => {
          const loader = card.renderRoot.querySelector<NucleonElement<any>>('#statusesLoader');
          return !!loader && !loader.in('busy');
        },
        '',
        { timeout: 5000 }
      );

      await card.requestUpdate();
      return card;
    };

    it('keeps selectors unchanged without a scope and with store_full_access', async () => {
      const card = await create(null);

      [null, '', 'store_full_access'].forEach(scope => {
        card.currentUserScope = scope;
        expect(card.hiddenSelector.toString()).to.equal('');
        expect(card.readonlySelector.toString()).to.equal('');
      });
    });

    it('is read-only with webhooks_read', async () => {
      const card = await create('webhooks_read reporting_read');
      expect(card.readonlySelector.matches('any-control', true)).to.be.true;
      expect(card.hiddenSelector.matches('delete', true)).to.be.true;

      card.currentUserScope = 'webhooks_write';
      expect(card.readonlySelector.matches('any-control', true)).to.be.false;
    });

    it('waits for statuses without a scope or with webhooks_read', async () => {
      expect((await create(null)).isBodyReady).to.be.false;
      expect((await create('webhooks_read reporting_read')).isBodyReady).to.be.false;
    });

    it('renders without the status when the scope cannot read webhooks', async () => {
      const card = await create('transactions_read');
      const loader = card.renderRoot.querySelector<NucleonElement<any>>('#statusesLoader')!;

      expect(card.isBodyReady).to.be.true;
      expect(loader.href).to.equal('');
      expect(card.renderRoot.querySelector('foxy-i18n[key^="status_"]')).to.not.exist;
      expect(card.renderRoot).to.not.include.text('•');
    });
  });
});
