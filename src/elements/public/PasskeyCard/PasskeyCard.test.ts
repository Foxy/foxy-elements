import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../server/index';
import { PasskeyCard } from './PasskeyCard';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { getByKey } from '../../../testgen/getByKey';
import { html } from 'lit-html';

import uainfer from 'uainfer/src/uainfer.js';

const router = createRouter();

describe('PasskeyCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('extends TwoLineCard', () => {
    expect(new PasskeyCard()).to.be.instanceOf(TwoLineCard);
  });

  it('registers as foxy-passkey-card', () => {
    expect(customElements.get('foxy-passkey-card')).to.equal(PasskeyCard);
  });

  it('has a default i18next namespace of "passkey-card"', () => {
    expect(new PasskeyCard()).to.have.property('ns', 'passkey-card');
  });

  it('renders credential id in the title', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-passkey-card @fetch=${handleFetch}></foxy-passkey-card>`;
    const element = await fixture<PasskeyCard>(layout);

    element.href = 'https://demo.api/hapi/passkeys/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    const title = await getByTestId(element, 'title');
    expect(title).to.include.text(element.data!.credential_id);
  });

  it('renders last login date and user agent in the subtitle if present', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-passkey-card @fetch=${handleFetch}></foxy-passkey-card>`;
    const element = await fixture<PasskeyCard>(layout);

    element.href = 'https://demo.api/hapi/passkeys/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    const subtitle = (await getByTestId(element, 'subtitle')) as HTMLDivElement;
    const text = await getByKey(subtitle, 'subtitle');
    const data = element.data!;

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
    expect(text).to.have.deep.property('options', {
      last_login_date: new Date(data.last_login_date!),
      last_login_ua: uainfer.analyze(data.last_login_ua!).toString(),
    });
  });

  it('renders placeholder in the subtitle if no last login and user agent info is present', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-passkey-card @fetch=${handleFetch}></foxy-passkey-card>`;
    const element = await fixture<PasskeyCard>(layout);

    element.href = 'https://demo.api/hapi/passkeys/1';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

    const subtitle = (await getByTestId(element, 'subtitle')) as HTMLDivElement;
    const text = await getByKey(subtitle, 'subtitle_no_data');

    expect(text).to.exist;
    expect(text).to.have.attribute('infer', '');
  });
});
