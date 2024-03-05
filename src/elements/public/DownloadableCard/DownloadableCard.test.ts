import { expect, fixture, html } from '@open-wc/testing';
import { DownloadableCard } from './index';
import { getTestData } from '../../../testgen/getTestData';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { Data } from './types';

describe('DownloadableCard', () => {
  it('imports and defines foxy-internal-sandbox element', () => {
    expect(customElements.get('foxy-internal-sandbox')).to.exist;
  });

  it('imports and defines foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('imports and defines foxy-spinner element', () => {
    expect(customElements.get('foxy-spinner')).to.exist;
  });

  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines itself as foxy-downloadable-card', () => {
    expect(customElements.get('foxy-downloadable-card')).to.equal(DownloadableCard);
  });

  it('extends TwoLineCard', () => {
    expect(new DownloadableCard()).to.be.instanceOf(TwoLineCard);
  });

  it('has a default i18n namespace of downloadable-card', () => {
    expect(DownloadableCard).to.have.property('defaultNS', 'downloadable-card');
    expect(new DownloadableCard()).to.have.property('ns', 'downloadable-card');
  });

  it('renders downloadable name when loaded', async () => {
    const downloadable = await getTestData<Data>('./hapi/downloadables/0');
    const layout = html`<foxy-downloadable-card></foxy-downloadable-card>`;
    const card = await fixture<DownloadableCard>(layout);

    downloadable.code = 'Test Downloadable';
    card.data = downloadable;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text('Test Downloadable');
  });

  it('renders downloadable code when loaded', async () => {
    const downloadable = await getTestData<Data>('./hapi/downloadables/0');
    const layout = html`<foxy-downloadable-card></foxy-downloadable-card>`;
    const card = await fixture<DownloadableCard>(layout);

    downloadable.code = 'TEST123';
    card.data = downloadable;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text('TEST123');
  });

  it('renders downloadable price when loaded', async () => {
    const downloadable = await getTestData<Data>('./hapi/downloadables/0');
    const layout = html`<foxy-downloadable-card></foxy-downloadable-card>`;
    const card = await fixture<DownloadableCard>(layout);

    downloadable.price = 256.1234;
    card.data = downloadable;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text('256.12');
  });

  it('renders downloadable file name when loaded', async () => {
    const downloadable = await getTestData<Data>('./hapi/downloadables/0');
    const layout = html`<foxy-downloadable-card></foxy-downloadable-card>`;
    const card = await fixture<DownloadableCard>(layout);

    downloadable.file_name = 'test_file.gif';
    card.data = downloadable;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text('test_file.gif');
  });

  it('renders downloadable file size when loaded', async () => {
    const downloadable = await getTestData<Data>('./hapi/downloadables/0');
    const layout = html`<foxy-downloadable-card></foxy-downloadable-card>`;
    const card = await fixture<DownloadableCard>(layout);

    downloadable.file_size = 980;
    card.data = downloadable;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text('980 B');

    downloadable.file_size = 3987;
    card.data = downloadable;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text('3.89 KB');

    downloadable.file_size = 24536678;
    card.data = downloadable;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text('23.4 MB');

    downloadable.file_size = 1001801121711;
    card.data = downloadable;
    await card.requestUpdate();

    expect(card.renderRoot).to.include.text('933 GB');
  });
});
