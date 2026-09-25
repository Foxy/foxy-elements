import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { UserInvitationCard as Card } from './UserInvitationCard';
import { createRouter } from '../../../server/index';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { getByKey } from '../../../testgen/getByKey';
import { getTestData } from '../../../testgen/getTestData';
import { I18n } from '../I18n/I18n';

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

  it('serves an invitation scope from the mock server', async () => {
    const data = await getTestData<Data>('./hapi/user_invitations/0');

    expect(data, 'mock invitations must carry a scope so stories render').to.have.property('scope');
    expect(data.scope).to.be.a('string').and.to.have.length.greaterThan(0);
  });

  describe('scope summary', () => {
    // The wtr test environment never loads real i18next resources: the `foxy://i18n/`
    // scheme backend.ts dispatches to is only bridged to `/translations/*.json` by
    // .storybook/preview.js, which doesn't run here. Without this, `this.t('scopes.*')`
    // returns the raw key and every assertion on a resolved label fails. Seed the exact
    // labels from src/static/translations/user-invitation-card/en.json, and remove them
    // afterwards so the bundle doesn't outlive this describe block.
    before(() => {
      I18n.i18next.addResourceBundle(
        'en',
        'user-invitation-card',
        {
          scopes: {
            carts: 'carts',
            coupons: 'coupons',
            customers: 'customers',
            customer_portal_settings: 'customer portal settings',
            downloadables: 'downloadables',
            gift_cards: 'gift cards',
            integrations: 'integrations',
            item_categories: 'item categories',
            payment_settings: 'payment settings',
            reporting: 'reports',
            shipping_integrations: 'shipping integrations',
            shipping_settings: 'shipping settings',
            stores: 'stores',
            subscriptions: 'subscriptions',
            subscription_settings: 'subscription settings',
            taxes: 'taxes',
            templates: 'templates',
            transactions: 'transactions',
            user_invitations: 'user invitations',
            webhooks: 'webhooks',
          },
        },
        true,
        true
      );
    });

    after(() => {
      I18n.i18next.removeResourceBundle('en', 'user-invitation-card');
    });

    const cardWithScope = async (scope: string | undefined) => {
      const data = await getTestData<Data>('./hapi/user_invitations/0');
      const card = await fixture<Card>(html`
        <foxy-user-invitation-card layout="admin"></foxy-user-invitation-card>
      `);

      card.data = { ...data, scope } as Data;
      await card.requestUpdate();

      return card;
    };

    it('renders a full-access line for writable collections', async () => {
      const card = await cardWithScope('customers_write coupons_write');
      const line = await getByKey(card, 'scope_full');

      expect(line).to.exist;
      expect(line).to.have.deep.property('options', {
        names: 'coupons, customers',
        count: 0,
        context: '',
      });
    });

    it('renders a read-only line for readable collections', async () => {
      const card = await cardWithScope('transactions_read item_categories_read');
      const line = await getByKey(card, 'scope_read');

      expect(line).to.exist;
      expect(line).to.have.deep.property('options', {
        names: 'item categories, transactions',
        count: 0,
        context: '',
      });
    });

    it('renders a resend line', async () => {
      const card = await cardWithScope('taxes_resend');
      const line = await getByKey(card, 'scope_resend');

      expect(line).to.exist;
      expect(line).to.have.deep.property('options', { names: 'taxes', count: 0, context: '' });
    });

    it('sorts names by localized label rather than token', async () => {
      // Chosen because collection order and label order disagree here:
      //   collection order: customers, customer_portal_settings -> "customers, customer portal settings"
      //   label order:      "customer portal settings" < "customers" -> "customer portal settings, customers"
      // So this fails if the card stops sorting. It cannot catch sorting by token instead of
      // label: with these English labels, token order and label order agree for every pair.
      const card = await cardWithScope('customers_read customer_portal_settings_read');
      const line = await getByKey(card, 'scope_read');

      expect(line).to.have.nested.property('options.names', 'customer portal settings, customers');
    });

    it('truncates to three names and reports the remainder', async () => {
      // `clients` is no longer a grantable collection (see group-invitation-scopes.ts), so this
      // uses `templates` in its place -- still five recognized reads, still truncated to three
      // with a remainder of two, unchanged from before except which fifth collection is used.
      const card = await cardWithScope(
        'carts_read templates_read coupons_read customers_read taxes_read'
      );

      const line = await getByKey(card, 'scope_read');

      expect(line).to.have.deep.property('options', {
        names: 'carts, coupons, customers',
        count: 2,
        context: 'truncated',
      });
    });

    it('omits lines for empty groups', async () => {
      const card = await cardWithScope('transactions_read');

      expect(await getByKey(card, 'scope_read')).to.exist;
      expect(await getByKey(card, 'scope_full')).to.not.exist;
      expect(await getByKey(card, 'scope_resend')).to.not.exist;
    });

    it('renders a single line for store_full_access', async () => {
      const card = await cardWithScope('store_full_access transactions_read');

      expect(await getByKey(card, 'scope_store_full_access')).to.exist;
      expect(await getByKey(card, 'scope_full')).to.not.exist;
      expect(await getByKey(card, 'scope_read')).to.not.exist;
      expect(await getByKey(card, 'scope_resend')).to.not.exist;
    });

    it('renders no scope lines when scope is absent', async () => {
      const card = await cardWithScope(undefined);

      expect(await getByKey(card, 'scope_full')).to.not.exist;
      expect(await getByKey(card, 'scope_read')).to.not.exist;
      expect(await getByKey(card, 'scope_resend')).to.not.exist;
      expect(await getByKey(card, 'scope_store_full_access')).to.not.exist;
    });

    it('renders no scope lines in the user layout', async () => {
      const data = await getTestData<Data>('./hapi/user_invitations/0');
      const card = await fixture<Card>(html`
        <foxy-user-invitation-card layout="user"></foxy-user-invitation-card>
      `);

      card.data = { ...data, scope: 'store_full_access customers_write' } as Data;
      await card.requestUpdate();

      expect(await getByKey(card, 'scope_store_full_access')).to.not.exist;
      expect(await getByKey(card, 'scope_full')).to.not.exist;
    });
  });
});
