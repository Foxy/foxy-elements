import { expect } from '@open-wc/testing';

import { COLLECTIONS, RESENDABLE, groupInvitationScopes } from './group-invitation-scopes';

describe('groupInvitationScopes', () => {
  it('groups read-only scopes', () => {
    const groups = groupInvitationScopes('transactions_read customers_read');

    // Output order follows the COLLECTIONS array, where `customers` precedes
    // `transactions` — not the input string's order. Task 4 re-sorts by label anyway.
    expect(groups).to.deep.equal({
      storeFullAccess: false,
      full: [],
      read: ['customers', 'transactions'],
      resend: [],
    });
  });

  it('treats write as full access', () => {
    const groups = groupInvitationScopes('coupons_write');

    expect(groups.full).to.deep.equal(['coupons']);
    expect(groups.read, 'write must not also appear as read-only').to.deep.equal([]);
  });

  it('does not double-list a collection that has both read and write', () => {
    const groups = groupInvitationScopes('coupons_read coupons_write');

    expect(groups.full).to.deep.equal(['coupons']);
    expect(groups.read).to.deep.equal([]);
  });

  it('groups resend scopes separately', () => {
    const groups = groupInvitationScopes('transactions_resend webhooks_resend');

    expect(groups.resend).to.deep.equal(['transactions', 'webhooks']);
    expect(groups.full).to.deep.equal([]);
    expect(groups.read).to.deep.equal([]);
  });

  it('keeps a collection in resend as well as its read or write group', () => {
    const groups = groupInvitationScopes('transactions_read transactions_resend');

    expect(groups.read).to.deep.equal(['transactions']);
    expect(groups.resend).to.deep.equal(['transactions']);
  });

  it('short-circuits on store_full_access', () => {
    const groups = groupInvitationScopes('store_full_access transactions_read coupons_write');

    expect(groups).to.deep.equal({
      storeFullAccess: true,
      full: [],
      read: [],
      resend: [],
    });
  });

  it('ignores client_full_access and user_full_access', () => {
    const groups = groupInvitationScopes('client_full_access user_full_access transactions_read');

    expect(groups.storeFullAccess).to.be.false;
    expect(groups.read).to.deep.equal(['transactions']);
    expect(groups.full).to.deep.equal([]);
  });

  it('ignores unrecognized collections', () => {
    const groups = groupInvitationScopes('transactions_read unicorns_read');

    expect(groups.read).to.deep.equal(['transactions']);
  });

  it('ignores malformed tokens', () => {
    const groups = groupInvitationScopes('transactions transactions_ transactions_delete _read');

    expect(groups).to.deep.equal({
      storeFullAccess: false,
      full: [],
      read: [],
      resend: [],
    });
  });

  it('collapses duplicates and tolerates extra whitespace', () => {
    const groups = groupInvitationScopes(
      '  transactions_read   transactions_read\tcustomers_write '
    );

    expect(groups.read).to.deep.equal(['transactions']);
    expect(groups.full).to.deep.equal(['customers']);
  });

  it('returns empty groups for empty input', () => {
    const empty = { storeFullAccess: false, full: [], read: [], resend: [] };

    expect(groupInvitationScopes(null)).to.deep.equal(empty);
    expect(groupInvitationScopes(undefined)).to.deep.equal(empty);
    expect(groupInvitationScopes('')).to.deep.equal(empty);
    expect(groupInvitationScopes('   ')).to.deep.equal(empty);
  });

  it('accepts resend only on collections that support it', () => {
    // Only transactions, webhooks and taxes have a resend permission in the API.
    expect(groupInvitationScopes('customers_resend').resend).to.deep.equal([]);
    expect(groupInvitationScopes('taxes_resend').resend).to.deep.equal(['taxes']);
  });
});

describe('exported collection lists', () => {
  it('exports the 20 collections an invitation may grant', () => {
    expect(COLLECTIONS).to.have.lengthOf(20);
    expect(COLLECTIONS).to.include('transactions');
    expect(COLLECTIONS).to.include('user_invitations');
    expect(COLLECTIONS).to.include('reporting');
    expect(COLLECTIONS).to.include('stores');
  });

  // The API models both, but neither is a meaningful choice on an invitation:
  //   - clients are a separate top-level resource the Foxy admin does not manage;
  //   - the API treats user_full_access as users_read users_write, and every admin token
  //     has user_full_access, so a toggle for `users` would be inert.
  it('omits collections an invitation cannot meaningfully grant', () => {
    expect(COLLECTIONS).to.not.include('clients');
    expect(COLLECTIONS).to.not.include('users');
  });

  it('exports the 3 resendable collections', () => {
    expect([...RESENDABLE]).to.deep.equal(['transactions', 'webhooks', 'taxes']);
  });
});
