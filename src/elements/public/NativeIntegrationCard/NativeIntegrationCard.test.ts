import type { Data } from './types';

import './index';

import { NativeIntegrationCard as Card } from './NativeIntegrationCard';
import { expect, fixture, html } from '@open-wc/testing';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { getTestData } from '../../../testgen/getTestData';
import { getByKey } from '../../../testgen/getByKey';

import * as defaults from '../NativeIntegrationForm/defaults';

describe('NativeIntegrationCard', () => {
  it('imports and defines foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines itself as foxy-native-integration-card element', () => {
    expect(customElements.get('foxy-native-integration-card')).to.equal(Card);
  });

  it('extends InternalCard', () => {
    expect(new Card()).to.be.instanceOf(InternalCard);
  });

  it('has a default i18n namespace of native-integration-card', () => {
    expect(Card).to.have.property('defaultNS', 'native-integration-card');
    expect(new Card()).to.have.property('ns', 'native-integration-card');
  });

  it('renders line 1 text for avalara when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'avalara';
    data.config = JSON.stringify(defaults.avalara);

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);

    const text = await getByKey(card, 'title_avalara');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', {});
  });

  it('renders line 1 text for taxjar when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'taxjar';
    data.config = JSON.stringify(defaults.taxjar);

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);

    const text = await getByKey(card, 'title_taxjar');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', {});
  });

  it('renders line 1 text for onesource when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'onesource';
    data.config = JSON.stringify(defaults.onesource);

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);

    const text = await getByKey(card, 'title_onesource');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', {});
  });

  it('renders line 1 text for zapier when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'zapier';
    data.config = JSON.stringify(defaults.zapier);

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);

    const text = await getByKey(card, 'title_zapier');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', {});
  });

  it('renders line 1 text for webflow when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'webflow';
    data.config = JSON.stringify(defaults.webflow);

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);

    const text = await getByKey(card, 'title_webflow');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', {});
  });

  it('renders line 1 text for legacy json webhook when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookJson, title: 'ABC' });

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);

    const text = await getByKey(card, 'title_legacy_webhook');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', { title: 'ABC' });
  });

  it('renders line 1 text for legacy xml webhook when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'webhook';
    data.config = JSON.stringify({ ...defaults.webhookLegacyXml, title: 'DEF' });

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);

    const text = await getByKey(card, 'title_legacy_webhook');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', { title: 'DEF' });
  });

  it('renders line 2 text for avalara when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'avalara';
    data.config = JSON.stringify(defaults.avalara);

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);

    const text = await getByKey(card, 'subtitle_avalara');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', defaults.avalara);
  });

  it('renders line 2 text for taxjar when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'taxjar';
    data.config = JSON.stringify(defaults.taxjar);

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);

    const text = await getByKey(card, 'subtitle_taxjar');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', defaults.taxjar);
  });

  it('renders line 2 text for onesource when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'onesource';
    data.config = JSON.stringify(defaults.onesource);

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);

    const text = await getByKey(card, 'subtitle_onesource');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', defaults.onesource);
  });

  it('renders line 2 text for zapier when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'zapier';
    data.config = JSON.stringify(defaults.zapier);

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);
    const text = await getByKey(card, 'subtitle_zapier');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', defaults.zapier);
  });

  it('renders line 2 text for webflow when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'webflow';
    data.config = JSON.stringify(defaults.webflow);

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);
    const text = await getByKey(card, 'subtitle_webflow');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', defaults.webflow);
  });

  it('renders line 2 text for legacy json webhook when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'webhook';
    data.config = JSON.stringify(defaults.webhookJson);

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);
    const text = await getByKey(card, 'subtitle_legacy_webhook');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', defaults.webhookJson);
  });

  it('renders line 2 text for legacy xml webhook when loaded', async () => {
    const data = await getTestData<Data>('./hapi/native_integrations/0');

    data.provider = 'webhook';
    data.config = JSON.stringify(defaults.webhookLegacyXml);

    const card = await fixture<Card>(html`
      <foxy-native-integration-card .data=${data}></foxy-native-integration-card>
    `);
    const text = await getByKey(card, 'subtitle_legacy_webhook');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', defaults.webhookLegacyXml);
  });
});
