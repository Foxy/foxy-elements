import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, html } from '@open-wc/testing';
import { IntegrationCard } from './IntegrationCard';
import { createRouter } from '../../../server/index';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { getTestData } from '../../../testgen/getTestData';
import { I18n } from '../I18n/I18n';
import { getByKey } from '../../../testgen/getByKey';

describe('IntegrationCard', () => {
  it('imports and registers foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and registers foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.equal(InternalCard);
  });

  it('imports and registers itself as foxy-integration-card', () => {
    expect(customElements.get('foxy-integration-card')).to.equal(IntegrationCard);
  });

  it('has a default i18n namespace "integration-card"', () => {
    expect(IntegrationCard.defaultNS).to.equal('integration-card');
  });

  it('extends InternalCard', () => {
    expect(new IntegrationCard()).to.be.instanceOf(InternalCard);
  });

  it('renders project name', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/integrations/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<IntegrationCard>(html`
      <foxy-integration-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-integration-card>
    `);

    data.project_name = 'Test project';
    element.data = { ...data };
    await element.requestUpdate();

    expect(element.renderRoot).to.include.text('Test project');
  });

  it('renders project description', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/integrations/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<IntegrationCard>(html`
      <foxy-integration-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-integration-card>
    `);

    data.project_description = 'Description of a test project';
    element.data = { ...data };
    await element.requestUpdate();

    expect(element.renderRoot).to.include.text('Description of a test project');
  });

  it('renders "no description" text if project has no description"', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/integrations/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<IntegrationCard>(html`
      <foxy-integration-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-integration-card>
    `);

    data.project_description = '';
    element.data = { ...data };
    await element.requestUpdate();

    expect(await getByKey(element, 'no_description')).to.exist;
    expect(await getByKey(element, 'no_description')).to.have.attribute('infer', '');
  });

  it('renders client ID', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/integrations/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<IntegrationCard>(html`
      <foxy-integration-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-integration-card>
    `);

    data.client_id = 'client_12345';
    element.data = { ...data };
    await element.requestUpdate();

    expect(element.renderRoot).to.include.text('client_12345');
  });

  it('renders the email of the user who added the integration', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/integrations/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<IntegrationCard>(html`
      <foxy-integration-card @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-integration-card>
    `);

    data.added_by_email = 'test@example.com';
    element.data = { ...data };
    await element.requestUpdate();

    expect(element.renderRoot).to.include.text('test@example.com');
  });
});
