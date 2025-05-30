import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { StoreTransactionFolderCard as Card } from './StoreTransactionFolderCard';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { getByKey } from '../../../testgen/getByKey';

async function waitForIdle(element: Card) {
  await waitUntil(
    () => {
      const loaders = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      return [...loaders].every(loader => loader.in('idle'));
    },
    '',
    { timeout: 5000 }
  );
}

describe('StoreTransactionFolderCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('defines foxy-nucleon', () => {
    const localName = 'foxy-nucleon';
    expect(customElements.get(localName)).to.exist;
  });

  it('defines foxy-i18n', () => {
    const localName = 'foxy-i18n';
    expect(customElements.get(localName)).to.exist;
  });

  it('defines itself as foxy-store-transaction-folder-card', () => {
    const localName = 'foxy-store-transaction-folder-card';
    expect(customElements.get(localName)).to.equal(Card);
  });

  it('has a static property "countRefreshInterval"', () => {
    expect(Card).to.have.property('countRefreshInterval', 600000);
  });

  it('extends InternalCard', () => {
    expect(new Card()).to.be.instanceOf(InternalCard);
  });

  it('has a default i18n namespace "store-transaction-folder-card"', () => {
    expect(Card).to.have.property('defaultNS', 'store-transaction-folder-card');
    expect(new Card()).to.have.property('ns', 'store-transaction-folder-card');
  });

  it('has a reactive property "getCountLoaderURL"', async () => {
    const def = { attribute: false };
    expect(Card).to.have.deep.nested.property('properties.getCountLoaderURL', def);

    const layout = html`<foxy-store-transaction-folder-card></foxy-store-transaction-folder-card>`;
    const element = await fixture<Card>(layout);
    expect(element).to.have.deep.property('getCountLoaderURL', null);
  });

  it('renders folder name when loaded', async () => {
    const layout = html`<foxy-store-transaction-folder-card></foxy-store-transaction-folder-card>`;
    const element = await fixture<Card>(layout);

    expect(element.renderRoot).to.not.include.text('Test');

    const folder = await getTestData<Data>('./hapi/transaction_folders/0');
    folder.name = 'Test';
    element.data = folder;
    await element.requestUpdate();

    expect(element.renderRoot).to.include.text('Test');
  });

  it('renders "no name" when folder name is empty', async () => {
    const layout = html`<foxy-store-transaction-folder-card></foxy-store-transaction-folder-card>`;
    const element = await fixture<Card>(layout);

    expect(await getByKey(element, 'no_name')).to.exist;

    const folder = await getTestData<Data>('./hapi/transaction_folders/0');
    folder.name = '';
    element.data = folder;
    await element.requestUpdate();

    expect(await getByKey(element, 'no_name')).to.exist;

    folder.name = 'Test';
    element.data = folder;
    await element.requestUpdate();

    expect(await getByKey(element, 'no_name')).to.not.exist;
  });

  it('renders a total count', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-store-transaction-folder-card
        href="https://demo.api/hapi/transaction_folders/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-store-transaction-folder-card>
    `;

    const element = await fixture<Card>(layout);
    await waitUntil(() => !!element.data);
    await waitForIdle(element);
    await element.requestUpdate();
    expect(element.renderRoot).to.include.text('1');

    element.getCountLoaderURL = (defaultValue: URL) => {
      defaultValue.searchParams.set('is_test', 'false');
      return defaultValue;
    };
    element.requestUpdate();
    await waitForIdle(element);
    expect(element.renderRoot).to.include.text('0');
  });
});
