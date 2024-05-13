import './index';

import type { Data } from './types';

import { expect, fixture, html } from '@open-wc/testing';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { getTestData } from '../../../testgen/getTestData';
import { ClientCard } from './ClientCard';
import { getByKey } from '../../../testgen/getByKey';
import { getByTag } from '../../../testgen/getByTag';

describe('ClientCard', () => {
  it('imports and defines foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('imports and defines itself as foxy-client-card', () => {
    expect(customElements.get('foxy-client-card')).to.equal(ClientCard);
  });

  it('extends InternalCard', () => {
    expect(new ClientCard()).to.be.instanceOf(InternalCard);
  });

  it('has a default i18n namespace of client-card', () => {
    expect(ClientCard).to.have.property('defaultNS', 'client-card');
    expect(new ClientCard()).to.have.property('ns', 'client-card');
  });

  it('renders project name when loaded', async () => {
    const client = await getTestData<Data>('./hapi/clients/0');
    const layout = html`<foxy-client-card></foxy-client-card>`;
    const card = await fixture<ClientCard>(layout);

    client.project_name = 'Test project';
    card.data = client;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text('Test project');
  });

  it("renders project name placeholder when it's empty", async () => {
    const client = await getTestData<Data>('./hapi/clients/0');
    const layout = html`<foxy-client-card></foxy-client-card>`;
    const card = await fixture<ClientCard>(layout);

    client.project_name = '';
    card.data = client;
    await card.requestUpdate();

    const placeholder = await getByKey(card, 'no_project_name');
    expect(placeholder).to.exist;
    expect(placeholder).to.have.attribute('infer', '');
  });

  it('renders project description when loaded', async () => {
    const client = await getTestData<Data>('./hapi/clients/0');
    const layout = html`<foxy-client-card></foxy-client-card>`;
    const card = await fixture<ClientCard>(layout);

    client.project_description = 'Test description';
    card.data = client;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text('Test description');
  });

  it("renders project description placeholder when it's empty", async () => {
    const client = await getTestData<Data>('./hapi/clients/0');
    const layout = html`<foxy-client-card></foxy-client-card>`;
    const card = await fixture<ClientCard>(layout);

    client.project_description = '';
    card.data = client;
    await card.requestUpdate();

    const placeholder = await getByKey(card, 'no_project_description');
    expect(placeholder).to.exist;
    expect(placeholder).to.have.attribute('infer', '');
  });

  it('renders redirect uri host when loaded', async () => {
    const client = await getTestData<Data>('./hapi/clients/0');
    const layout = html`<foxy-client-card></foxy-client-card>`;
    const card = await fixture<ClientCard>(layout);

    client.redirect_uri = 'https://admin.foxy.io/sign-in';
    card.data = client;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text('admin.foxy.io');
  });

  it('renders company name when loaded', async () => {
    const client = await getTestData<Data>('./hapi/clients/0');
    const layout = html`<foxy-client-card></foxy-client-card>`;
    const card = await fixture<ClientCard>(layout);

    client.company_name = 'Test Company';
    card.data = client;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text('Test Company');
  });

  it("renders company name placeholder when it's empty", async () => {
    const client = await getTestData<Data>('./hapi/clients/0');
    const layout = html`<foxy-client-card></foxy-client-card>`;
    const card = await fixture<ClientCard>(layout);

    client.company_name = '';
    card.data = client;
    await card.requestUpdate();

    const placeholder = await getByKey(card, 'no_company_name');
    expect(placeholder).to.exist;
    expect(placeholder).to.have.attribute('infer', '');
  });

  it('renders company logo when loaded', async () => {
    const client = await getTestData<Data>('./hapi/clients/0');
    const layout = html`<foxy-client-card></foxy-client-card>`;
    const card = await fixture<ClientCard>(layout);

    client.company_logo = 'https://example.com/logo.png';
    card.data = client;
    await card.requestUpdate();

    const img = await getByTag(card, 'img');
    expect(img).to.exist;
    expect(img).to.have.attribute('src', 'https://example.com/logo.png');
  });

  it("renders company logo placeholder when it's empty", async () => {
    const client = await getTestData<Data>('./hapi/clients/0');
    const layout = html`<foxy-client-card></foxy-client-card>`;
    const card = await fixture<ClientCard>(layout);

    client.company_logo = '';
    card.data = client;
    await card.requestUpdate();

    const img = await getByTag(card, 'img');
    expect(img).to.exist;
    expect(img).to.have.attribute('src', ClientCard.defaultImageSrc);
  });
});
