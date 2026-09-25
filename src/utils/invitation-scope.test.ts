import { expect } from '@open-wc/testing';
import { COLLECTIONS } from './group-invitation-scopes';
import {
  parseScope,
  serializeScope,
  getGrantable,
  canGrantLevel,
  canGrantResend,
  canGrantReadPreset,
} from './invitation-scope';

const allReads = COLLECTIONS.map(collection => `${collection}_read`).join(' ');

describe('utils/invitation-scope', () => {
  describe('parseScope', () => {
    it('treats an absent scope as nothing selected', () => {
      const selection = parseScope(undefined);

      expect(selection.preset).to.be.null;
      expect(selection.resend).to.be.empty;
      expect(selection.extra).to.be.empty;
      expect(Object.values(selection.levels).every(level => level === 'none')).to.be.true;
    });

    it('treats an empty scope as nothing selected', () => {
      expect(parseScope('').preset).to.be.null;
      expect(parseScope('   ').preset).to.be.null;
    });

    it('recognises store_full_access as the store preset', () => {
      expect(parseScope('store_full_access').preset).to.equal('store');
    });

    it('recognises exactly all 20 reads as the read preset', () => {
      expect(parseScope(allReads).preset).to.equal('read');
    });

    it('does not treat all 20 reads plus anything else as the read preset', () => {
      expect(parseScope(`${allReads} transactions_resend`).preset).to.equal('custom');
      expect(parseScope(`${allReads} customers_write`).preset).to.equal('custom');
    });

    it('reads a write token as the full level', () => {
      expect(parseScope('customers_read customers_write').levels.customers).to.equal('full');
    });

    it('reads a write token without a read token as the full level', () => {
      expect(parseScope('customers_write').levels.customers).to.equal('full');
    });

    it('reads a lone read token as the read level', () => {
      expect(parseScope('customers_read').levels.customers).to.equal('read');
    });

    it('collects resend independently of the level', () => {
      expect(parseScope('transactions_resend').resend).to.deep.equal(['transactions']);
      expect(parseScope('transactions_resend').levels.transactions).to.equal('none');
    });

    it('preserves tokens it does not recognise', () => {
      expect(parseScope('customers_read user_full_access').extra).to.deep.equal([
        'user_full_access',
      ]);
    });
  });

  describe('serializeScope', () => {
    it('emits the wildcard for the store preset and ignores everything else', () => {
      const selection = parseScope('customers_read');
      expect(serializeScope({ ...selection, preset: 'store' })).to.equal('store_full_access');
    });

    it('emits both tokens for the full level', () => {
      const selection = parseScope('');
      selection.levels.customers = 'full';
      expect(serializeScope(selection)).to.equal('customers_read customers_write');
    });

    it('emits one token for the read level', () => {
      const selection = parseScope('');
      selection.levels.customers = 'read';
      expect(serializeScope(selection)).to.equal('customers_read');
    });

    it('emits nothing for an all-none selection', () => {
      expect(serializeScope(parseScope(''))).to.equal('');
    });

    it('re-emits preserved unrecognised tokens', () => {
      expect(serializeScope(parseScope('customers_read user_full_access'))).to.contain(
        'user_full_access'
      );
    });

    it('preserves extras like user_full_access when the store preset is chosen', () => {
      // store_full_access, client_full_access and user_full_access are three distinct
      // always-allowed tokens in the API, not one wildcard that
      // subsumes the other two -- so picking the store preset must not drop user_full_access
      // an invitation already held.
      const selection = parseScope('user_full_access');
      const scope = serializeScope({ ...selection, preset: 'store' });

      expect(scope).to.contain('store_full_access');
      expect(scope).to.contain('user_full_access');
      expect(parseScope(scope).extra).to.deep.equal(['user_full_access']);
    });

    it('round-trips every scope the control can produce', () => {
      const scopes = [
        '',
        'store_full_access',
        allReads,
        'customers_read customers_write',
        'customers_read transactions_read transactions_write transactions_resend',
        'webhooks_resend taxes_resend',
        'customers_read user_full_access',
      ];

      scopes.forEach(scope => {
        const once = serializeScope(parseScope(scope));
        const twice = serializeScope(parseScope(once));
        expect(twice, `unstable round trip for "${scope}"`).to.equal(once);
      });
    });
  });

  describe('grantability', () => {
    it('reports store_full_access on the granter', () => {
      expect(getGrantable('store_full_access').storeFullAccess).to.be.true;
      expect(getGrantable('customers_read').storeFullAccess).to.be.false;
      expect(getGrantable(undefined).storeFullAccess).to.be.false;
    });

    it('lets a store_full_access granter grant every level', () => {
      const grantable = getGrantable('store_full_access');

      expect(canGrantLevel(grantable, 'customers', 'read')).to.be.true;
      expect(canGrantLevel(grantable, 'customers', 'full')).to.be.true;
      expect(canGrantResend(grantable, 'transactions')).to.be.true;
      expect(canGrantReadPreset(grantable)).to.be.true;
    });

    it('always allows the none level', () => {
      expect(canGrantLevel(getGrantable(''), 'customers', 'none')).to.be.true;
    });

    it('requires the read token for the read level', () => {
      const grantable = getGrantable('customers_read');

      expect(canGrantLevel(grantable, 'customers', 'read')).to.be.true;
      expect(canGrantLevel(grantable, 'carts', 'read')).to.be.false;
    });

    it('requires both tokens for the full level', () => {
      expect(canGrantLevel(getGrantable('customers_read'), 'customers', 'full')).to.be.false;
      expect(canGrantLevel(getGrantable('customers_write'), 'customers', 'full')).to.be.false;
      expect(canGrantLevel(getGrantable('customers_read customers_write'), 'customers', 'full')).to
        .be.true;
    });

    it('mirrors the API asymmetry: write alone cannot grant read-only', () => {
      // The API treats write as implying read when checking access, but checks
      // literal token membership when validating a grant. Mirroring the API
      // keeps the UI from offering a grant the server will reject.
      const grantable = getGrantable('customers_write');
      expect(canGrantLevel(grantable, 'customers', 'read')).to.be.false;
    });

    it('requires the resend token for resend', () => {
      expect(canGrantResend(getGrantable('transactions_resend'), 'transactions')).to.be.true;
      expect(canGrantResend(getGrantable('transactions_write'), 'transactions')).to.be.false;
    });

    it('offers the read preset only when every collection read is grantable', () => {
      const allReads = COLLECTIONS.map(collection => `${collection}_read`).join(' ');

      expect(canGrantReadPreset(getGrantable(allReads))).to.be.true;
      expect(canGrantReadPreset(getGrantable('customers_read'))).to.be.false;
      expect(canGrantReadPreset(getGrantable(''))).to.be.false;
    });
  });
});
