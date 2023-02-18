import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, waitUntil, html } from '@open-wc/testing';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { createRouter } from '../../../server/index';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { UserCard } from './UserCard';
import { I18n } from '../I18n/I18n';

describe('UserCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and registers foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and registers foxy-internal-sandbox element', () => {
    expect(customElements.get('foxy-internal-sandbox')).to.equal(InternalSandbox);
  });

  it('imports and registers itself as foxy-user-card', () => {
    expect(customElements.get('foxy-user-card')).to.equal(UserCard);
  });

  it('has a default i18n namespace "user-card"', () => {
    expect(UserCard.defaultNS).to.equal('user-card');
  });

  it('extends TwoLineCard', () => {
    expect(new UserCard()).to.be.instanceOf(TwoLineCard);
  });

  it('renders name in the title', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/users/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<UserCard>(html`
      <foxy-user-card href=${href} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-user-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    expect(await getByTestId(element, 'title')).to.include.text(
      `${data.first_name} ${data.last_name}`
    );
  });

  it('renders "no_name" in the title if there is no name', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/users/0';
    const element = await fixture<UserCard>(html`
      <foxy-user-card href=${href} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-user-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    element.data!.first_name = '';
    element.data!.last_name = '';
    await element.requestUpdate();

    expect(await getByTestId(element, 'title')).to.include.text('no_name');
  });

  it('renders email in the subtitle', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/users/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<UserCard>(html`
      <foxy-user-card href=${href} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-user-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    expect(await getByTestId(element, 'subtitle')).to.include.text(data.email);
  });
});
