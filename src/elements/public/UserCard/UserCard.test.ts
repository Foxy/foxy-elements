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
import { getGravatarUrl } from '../../../utils/get-gravatar-url';
import { NucleonElement } from '../NucleonElement';

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

  it('has a reactive property "showInvitations"', () => {
    expect(new UserCard()).to.have.property('showInvitations', false);
    expect(UserCard).to.have.deep.nested.property('properties.showInvitations', {
      type: Boolean,
      attribute: 'show-invitations',
    });
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

  it('renders gravatar', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/users/0';
    const data = await getTestData<Data>(href);
    const element = await fixture<UserCard>(html`
      <foxy-user-card href=${href} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-user-card>
    `);

    await waitUntil(() => !!element.shadowRoot!.querySelector('img'), undefined, { timeout: 5000 });
    const img = element.shadowRoot!.querySelector('img') as HTMLImageElement;
    expect(img.src).to.equal(await getGravatarUrl(data.email));
  });

  it('displays the number of unanswered invitations when "showInvitations" is true', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/users/0';
    const element = await fixture<UserCard>(html`
      <foxy-user-card href=${href} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-user-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const invitationsCount = await getByTestId(element, 'invitations-count');
    expect(invitationsCount?.textContent?.trim()).to.equal('0');
    expect(invitationsCount?.classList.contains('scale-0')).to.be.true;

    element.showInvitations = true;
    await element.requestUpdate();
    await waitUntil(
      () => {
        const nucleons = element.renderRoot.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
        return [...nucleons].every(nucleon => !!nucleon.data);
      },
      undefined,
      { timeout: 5000 }
    );
    await element.requestUpdate();
    expect(invitationsCount?.textContent?.trim()).to.equal('1');
    expect(invitationsCount?.classList.contains('scale-0')).to.be.false;
  });

  describe('current user scope', () => {
    it('keeps selectors unchanged without a scope and with store_full_access', () => {
      const element = new UserCard();

      [null, 'store_full_access'].forEach(scope => {
        element.currentUserScope = scope;
        expect(element.hiddenSelector.toString()).to.equal('');
        expect(element.readonlySelector.toString()).to.equal('');
      });
    });

    it('is read-only with users_read and not with user_full_access', () => {
      const element = new UserCard();
      element.currentUserScope = 'user_invitations_read users_read';
      expect(element.readonlySelector.matches('any-control', true)).to.be.true;

      element.currentUserScope = 'user_invitations_read user_full_access';
      expect(element.readonlySelector.matches('any-control', true)).to.be.false;
    });

    it('renders the user when the invitations count cannot be loaded', async () => {
      const data = await getTestData<Data>('./hapi/users/0');
      data._links['fx:user_invitations'].href = 'https://demo.api/virtual/denied';

      const element = await fixture<UserCard>(html`
        <foxy-user-card
          current-user-scope="user_invitations_read users_read"
          show-invitations
          .data=${data}
        >
        </foxy-user-card>
      `);

      const loader = element.renderRoot.querySelector<NucleonElement<any>>('#invitationsLoader')!;
      await waitUntil(() => loader.in('fail'), undefined, { timeout: 5000 });
      await element.requestUpdate();

      expect(element.in({ idle: 'snapshot' })).to.be.true;
      expect(element.renderRoot).to.include.text(data.email);
      expect((await getByTestId(element, 'invitations-count'))?.classList.contains('scale-0')).to.be
        .true;
    });
  });
});
