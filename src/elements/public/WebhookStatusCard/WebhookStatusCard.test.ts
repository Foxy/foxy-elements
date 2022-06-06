import { expect, fixture, html } from '@open-wc/testing';
import { getTestData } from '../../../testgen/getTestData';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { WebhookStatusCard } from './index';
import { Data } from './types';

describe('WebhookStatusCard', () => {
  it('imports and defines foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('imports and defines itself as foxy-webhook-status-card', () => {
    expect(customElements.get('foxy-webhook-status-card')).to.equal(WebhookStatusCard);
  });

  it('extends InternalCard', () => {
    expect(new WebhookStatusCard()).to.be.instanceOf(InternalCard);
  });

  it('has a default i18n namespace of webhook-status-card', () => {
    expect(WebhookStatusCard).to.have.property('defaultNS', 'webhook-status-card');
    expect(new WebhookStatusCard()).to.have.property('ns', 'webhook-status-card');
  });

  it('renders status record date when loaded', async () => {
    const whStatus = await getTestData<Data>('./hapi/webhook_statuses/0');
    const layout = html`<foxy-webhook-status-card></foxy-webhook-status-card>`;
    const card = await fixture<WebhookStatusCard>(layout);

    card.data = whStatus;
    await card.updateComplete;

    const date = card.renderRoot.querySelector('foxy-i18n[key="date"]');

    expect(date).to.exist;
    expect(date).to.have.property('infer', '');
    expect(date).to.have.deep.property('options', { value: whStatus.date_created });
  });

  (['failed', 'pending', 'successful'] as const).forEach(status => {
    it(`renders ${status} status description when loaded`, async () => {
      const whStatus = await getTestData<Data>('./hapi/webhook_statuses/0');
      const layout = html`<foxy-webhook-status-card></foxy-webhook-status-card>`;
      const card = await fixture<WebhookStatusCard>(layout);

      whStatus.status = status;
      card.data = whStatus;
      await card.updateComplete;

      const label = card.renderRoot.querySelector(`foxy-i18n[key="status_${status}"]`);

      expect(label).to.exist;
      expect(label).to.have.property('infer', '');
    });
  });
});
