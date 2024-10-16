import type { FetchEvent } from '../NucleonElement/FetchEvent';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { UserInvitationCard as Card } from './UserInvitationCard';
import { createRouter } from '../../../server/index';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { getByKey } from '../../../testgen/getByKey';

describe('UserInvitationCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-card', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('imports and defines foxy-spinner', () => {
    expect(customElements.get('foxy-spinner')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('defines itself as foxy-user-invitation-card', () => {
    expect(customElements.get('foxy-user-invitation-card')).to.equal(Card);
  });

  it('has a default i18next namespace of user-invitation-card', () => {
    expect(Card.defaultNS).to.equal('user-invitation-card');
    expect(new Card().ns).to.equal('user-invitation-card');
  });

  it('has a reactive property "defaultDomain"', () => {
    expect(new Card()).to.have.property('defaultDomain', null);
    expect(Card).to.have.deep.nested.property('properties.defaultDomain', {
      attribute: 'default-domain',
    });
  });

  it('has a reactive property "layout"', () => {
    expect(new Card()).to.have.property('layout', null);
    expect(Card).to.have.deep.nested.property('properties.layout', {});
  });

  it('extends InternalCard', () => {
    expect(new Card()).to.be.instanceOf(InternalCard);
  });

  it('renders store name as title when layout is user', async () => {
    const router = createRouter();
    const card = await fixture<Card>(html`
      <foxy-user-invitation-card
        default-domain="foxycart.com"
        layout="user"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-card>
    `);

    await waitUntil(() => !!card.data, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot).to.include.text('Example Store');
  });

  it('renders status info as subtitle when layout is user', async () => {
    const router = createRouter();
    const card = await fixture<Card>(html`
      <foxy-user-invitation-card
        default-domain="foxycart.com"
        layout="user"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-card>
    `);

    await waitUntil(() => !!card.data, undefined, { timeout: 5000 });
    await card.requestUpdate();
    const status = await getByKey(card, 'status');

    expect(status).to.exist;
    expect(status).to.have.attribute('infer', '');
    expect(status).to.have.deep.property('options', {
      context: 'user_sent',
      domain: 'example.foxycart.com',
    });
  });

  it('renders store ID when layout is user', async () => {
    const router = createRouter();
    const card = await fixture<Card>(html`
      <foxy-user-invitation-card
        default-domain="foxycart.com"
        layout="user"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-card>
    `);

    await waitUntil(() => !!card.data, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot).to.include.text('ID 0');
  });

  it('renders gravatar when layout is admin', async () => {
    const router = createRouter();
    const card = await fixture<Card>(html`
      <foxy-user-invitation-card
        layout="admin"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-card>
    `);

    await waitUntil(() => !!card.renderRoot.querySelector('img'), undefined, { timeout: 5000 });
    const img = card.renderRoot.querySelector('img') as HTMLImageElement;
    expect(img.src).to.equal(
      'https://www.gravatar.com/avatar/bd78de94bcefac7efde2e44ec8199ba1a484adc08eb6ddad887e10e225266e51?s=256&d=identicon'
    );
  });

  it('renders full name in title when layout is admin', async () => {
    const router = createRouter();
    const card = await fixture<Card>(html`
      <foxy-user-invitation-card
        layout="admin"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-card>
    `);

    await waitUntil(() => !!card.data, undefined, { timeout: 5000 });
    await card.requestUpdate();
    const title = await getByKey(card, 'full_name');

    expect(title).to.exist;
    expect(title).to.have.attribute('infer', '');
    expect(title).to.have.deep.property('options', {
      first_name: 'Sally',
      last_name: 'Sims',
      context: '',
    });
  });

  it('renders No Name in title when layout is admin and there is no name', async () => {
    const router = createRouter();
    const card = await fixture<Card>(html`
      <foxy-user-invitation-card
        layout="admin"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-card>
    `);

    await waitUntil(() => !!card.data, undefined, { timeout: 5000 });
    card.data!.first_name = '';
    card.data!.last_name = '';
    await card.requestUpdate();

    const title = await getByKey(card, 'full_name');
    expect(title).to.exist;
    expect(title).to.have.attribute('infer', '');
    expect(title).to.have.deep.property('options', {
      first_name: '',
      last_name: '',
      context: 'empty',
    });
  });

  it('renders status info as subtitle when layout is admin', async () => {
    const router = createRouter();
    const card = await fixture<Card>(html`
      <foxy-user-invitation-card
        layout="admin"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-card>
    `);

    await waitUntil(() => !!card.data, undefined, { timeout: 5000 });
    await card.requestUpdate();
    const status = await getByKey(card, 'status');

    expect(status).to.exist;
    expect(status).to.have.attribute('infer', '');
    expect(status).to.have.deep.property('options', {
      context: 'admin_sent',
      email: 'sally.sims@example.com',
    });
  });

  it('renders user ID if available when layout is admin', async () => {
    const router = createRouter();
    const card = await fixture<Card>(html`
      <foxy-user-invitation-card
        layout="admin"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-card>
    `);

    await waitUntil(() => !!card.data, undefined, { timeout: 5000 });
    await card.requestUpdate();
    expect(card.renderRoot).to.include.text('ID 0');
  });
});
