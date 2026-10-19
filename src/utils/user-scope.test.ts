import { expect } from '@open-wc/testing';

import { canReadCollection, getScopeSelectors, parseUserScope } from './user-scope';

describe('parseUserScope', () => {
  [
    null,
    undefined,
    '',
    'store_full_access store_id_1',
    'user_full_access store_id_1',
    'openid',
  ].forEach(scope => {
    it(`returns null for ${JSON.stringify(scope)}`, () => {
      expect(parseUserScope(scope)).to.be.null;
    });
  });

  it('returns null when store_full_access is mixed with collection tokens', () => {
    expect(parseUserScope('customers_read store_full_access')).to.be.null;
  });

  it('parses read-only access', () => {
    const scope = parseUserScope('customers_read store_id_1')!;
    expect(scope.canRead('customers')).to.be.true;
    expect(scope.canWrite('customers')).to.be.false;
    expect(scope.canRead('transactions')).to.be.false;
  });

  it('treats write as implying read', () => {
    const scope = parseUserScope('customers_write')!;
    expect(scope.canRead('customers')).to.be.true;
    expect(scope.canWrite('customers')).to.be.true;
  });

  it('treats resend as separate from write', () => {
    expect(parseUserScope('transactions_write')!.canResend('transactions')).to.be.false;
    expect(parseUserScope('transactions_resend')!.canResend('transactions')).to.be.true;
  });

  it('grants users access through user_full_access', () => {
    const scope = parseUserScope('user_full_access customers_read')!;
    expect(scope.canRead('users')).to.be.true;
    expect(scope.canWrite('users')).to.be.true;
  });

  it('grants users access through explicit tokens', () => {
    const scope = parseUserScope('users_read customers_read')!;
    expect(scope.canRead('users')).to.be.true;
    expect(scope.canWrite('users')).to.be.false;
  });

  it('denies users without a users token', () => {
    expect(parseUserScope('customers_read')!.canRead('users')).to.be.false;
  });
});

describe('getScopeSelectors', () => {
  const none = { hidden: [], readonly: [], readonlyAll: false };

  it('returns nothing when there is no scope', () => {
    const rules = [{ path: 'customer', collection: 'customers' as const }];
    expect(getScopeSelectors(null, rules, 'transactions')).to.deep.equal(none);
  });

  it('hides paths the scope cannot read', () => {
    const scope = parseUserScope('transactions_read');
    const rules = [{ path: 'customer', collection: 'customers' as const }];
    expect(getScopeSelectors(scope, rules, null).hidden).to.include('customer');
  });

  it('makes the element readonly and hides create/delete when own collection is read-only', () => {
    const result = getScopeSelectors(parseUserScope('transactions_read'), [], 'transactions');
    expect(result.readonlyAll).to.be.true;
    expect(result.hidden).to.include.members(['delete', 'create']);
  });

  it('does nothing when the own collection is writable', () => {
    const result = getScopeSelectors(parseUserScope('transactions_write'), [], 'transactions');
    expect(result).to.deep.equal(none);
  });

  it('does nothing when the own collection is not readable', () => {
    const result = getScopeSelectors(parseUserScope('customers_read'), [], 'transactions');
    expect(result.readonlyAll).to.be.false;
    expect(result.hidden).to.not.include('delete');
  });

  it('marks paths readonly instead of hidden with readonlyIfNoWrite', () => {
    const scope = parseUserScope('transactions_read customers_read');
    const rules = [{ path: 'customer', collection: 'customers' as const, readonlyIfNoWrite: true }];
    const result = getScopeSelectors(scope, rules, null);
    expect(result.readonly).to.include('customer');
    expect(result.hidden).to.not.include('customer');
  });

  it('does not mark paths readonly when the scope can write', () => {
    const scope = parseUserScope('customers_write');
    const rules = [{ path: 'customer', collection: 'customers' as const, readonlyIfNoWrite: true }];
    expect(getScopeSelectors(scope, rules, null)).to.deep.equal(none);
  });

  it('hides need: write paths without write', () => {
    const rules = [{ path: 'x', collection: 'customers' as const, need: 'write' as const }];
    expect(getScopeSelectors(parseUserScope('customers_read'), rules, null).hidden).to.include('x');
    expect(getScopeSelectors(parseUserScope('customers_write'), rules, null).hidden).to.deep.equal(
      []
    );
  });

  it('hides need: resend paths without resend', () => {
    const rules = [{ path: 'x', collection: 'transactions' as const, need: 'resend' as const }];
    expect(getScopeSelectors(parseUserScope('transactions_write'), rules, null).hidden).to.include(
      'x'
    );
    expect(
      getScopeSelectors(parseUserScope('transactions_resend'), rules, null).hidden
    ).to.deep.equal([]);
  });
});

describe('canReadCollection', () => {
  it('returns true when the scope does not restrict store collections', () => {
    [null, undefined, '', 'store_full_access', 'user_full_access'].forEach(scope => {
      expect(canReadCollection(scope, 'stores'), String(scope)).to.be.true;
    });
  });

  it('checks read access for a restricted scope', () => {
    expect(canReadCollection('subscriptions_read', 'stores')).to.be.false;
    expect(canReadCollection('subscriptions_read stores_read', 'stores')).to.be.true;
    expect(canReadCollection('subscriptions_read stores_write', 'stores')).to.be.true;
  });
});
