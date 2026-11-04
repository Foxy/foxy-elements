import { COLLECTIONS, RESENDABLE } from './group-invitation-scopes';

/** Access level a single collection can be granted at. */
export type Level = 'none' | 'read' | 'full';

export type Selection = {
  /** `null` means nothing has been chosen yet, which the form's v8n rule rejects. */
  preset: 'store' | 'read' | 'custom' | null;
  /** Level per collection, keyed by the tokens in `COLLECTIONS`. Always fully populated. */
  levels: Record<string, Level>;
  /** Collections with their own `_resend` token. The API includes resend in `full`. */
  resend: string[];
  /**
   * Tokens this UI does not model, carried through untouched. `client_full_access` and
   * `user_full_access` are valid grants the API accepts but the matrix cannot express, so
   * dropping them on a round trip would silently revoke access the invitation already had.
   */
  extra: string[];
};

const tokenize = (scope: string | undefined): Set<string> => {
  return new Set((scope ?? '').split(/\s+/).filter(token => token.length > 0));
};

/** Parses an invitation's space-separated `scope` string into a UI selection. */
export function parseScope(scope: string | undefined): Selection {
  const tokens = tokenize(scope);
  const known = new Set<string>();
  const levels: Record<string, Level> = {};

  COLLECTIONS.forEach(collection => {
    const read = `${collection}_read`;
    const write = `${collection}_write`;

    // A write token means full access whether or not the read token is present. The API
    // treats write as implying read, so a lone write is still full access.
    if (tokens.has(write)) levels[collection] = 'full';
    else if (tokens.has(read)) levels[collection] = 'read';
    else levels[collection] = 'none';

    if (tokens.has(read)) known.add(read);
    if (tokens.has(write)) known.add(write);
  });

  const resend = RESENDABLE.filter(collection => {
    const token = `${collection}_resend`;
    if (!tokens.has(token)) return false;
    known.add(token);
    return true;
  });

  const isStore = tokens.has('store_full_access');
  if (isStore) known.add('store_full_access');

  const extra = [...tokens].filter(token => !known.has(token));

  let preset: Selection['preset'];

  if (isStore) {
    preset = 'store';
  } else if (!tokens.size) {
    preset = null;
  } else if (
    !resend.length &&
    !extra.length &&
    COLLECTIONS.every(collection => levels[collection] === 'read')
  ) {
    preset = 'read';
  } else {
    preset = 'custom';
  }

  return { preset, levels, resend, extra: [...extra] };
}

/** Serializes a UI selection back into a space-separated `scope` string. */
export function serializeScope(selection: Selection): string {
  // The store wildcard does NOT supersede `client_full_access` / `user_full_access`:
  // the API treats all three as distinct, independently-granted
  // always-allowed tokens. Dropping preserved extras here would silently revoke whichever
  // of those the invitation already held.
  if (selection.preset === 'store') return ['store_full_access', ...selection.extra].join(' ');

  const tokens: string[] = [];

  COLLECTIONS.forEach(collection => {
    const level = selection.levels[collection] ?? 'none';

    // Full emits both tokens rather than write alone, so anything that still compares tokens
    // literally, without write covering read, sees read access too.
    if (level === 'full') tokens.push(`${collection}_read`, `${collection}_write`);
    else if (level === 'read') tokens.push(`${collection}_read`);
  });

  RESENDABLE.forEach(collection => {
    if (selection.resend.includes(collection)) tokens.push(`${collection}_resend`);
  });

  return [...tokens, ...selection.extra].join(' ');
}

/** The granter's own scope, prepared for membership checks. */
export type Grantable = { storeFullAccess: boolean; tokens: Set<string> };

/**
 * Prepares the granting user's scope for grantability checks.
 *
 * The server is the enforcement boundary — it rejects any
 * token the granter does not hold. These helpers exist so the UI never offers a grant that
 * would be rejected, not to implement the restriction.
 */
export function getGrantable(granterScope: string | undefined): Grantable {
  const tokens = tokenize(granterScope);
  return { storeFullAccess: tokens.has('store_full_access'), tokens };
}

/** Whether the granter can give `collection` at `level`. */
export function canGrantLevel(grantable: Grantable, collection: string, level: Level): boolean {
  if (level === 'none') return true;
  if (grantable.storeFullAccess) return true;

  const hasWrite = grantable.tokens.has(`${collection}_write`);
  if (level === 'read') return hasWrite || grantable.tokens.has(`${collection}_read`);

  return hasWrite;
}

/** Whether the granter can give `collection` a resend grant. */
export function canGrantResend(grantable: Grantable, collection: string): boolean {
  return (
    grantable.storeFullAccess ||
    grantable.tokens.has(`${collection}_write`) ||
    grantable.tokens.has(`${collection}_resend`)
  );
}

/**
 * Whether the "read-only access to everything" preset can be offered.
 *
 * It is hidden unless the granter can deliver all 20 reads. Silently redefining it as
 * "read-only on whatever I happen to be able to share" would make one preset mean different
 * things to different admins, which is a worse trap than an absent option — `Custom` covers
 * the gap.
 */
export function canGrantReadPreset(grantable: Grantable): boolean {
  return COLLECTIONS.every(collection => canGrantLevel(grantable, collection, 'read'));
}

/**
 * Role presets. They only prefill the Custom matrix and are never saved as a role.
 * `developer` has no `webhooks_resend`: `webhooks_write` already includes it.
 */
export const ROLES = {
  customer_service:
    'transactions_write customers_write subscriptions_write gift_cards_write coupons_read carts_read downloadables_read shipping_settings_read stores_read',
  developer:
    'stores_write templates_write customer_portal_settings_write webhooks_write integrations_write item_categories_write shipping_settings_write shipping_integrations_write taxes_write subscription_settings_write downloadables_read coupons_read gift_cards_read carts_read transactions_read customers_read subscriptions_read reporting_read',
  designer: 'templates_write customer_portal_settings_write stores_read item_categories_read',
  accountant:
    'transactions_read subscriptions_read customers_read reporting_read taxes_read gift_cards_read coupons_read stores_read',
} as const;

export type Role = keyof typeof ROLES;

/**
 * The role whose levels and resend grants exactly match the selection, or `null`. Extra tokens
 * are ignored, and so is a resend token on a Full collection, since Full includes it.
 */
export function getRole(selection: Selection): Role | null {
  if (selection.preset === 'store') return null;

  const resendKey = ({ levels, resend }: Selection) => {
    return resend.filter(collection => levels[collection] !== 'full').join(' ');
  };

  const match = (Object.keys(ROLES) as Role[]).find(role => {
    const roleSelection = parseScope(ROLES[role]);
    return (
      COLLECTIONS.every(c => selection.levels[c] === roleSelection.levels[c]) &&
      resendKey(selection) === resendKey(roleSelection)
    );
  });

  return match ?? null;
}

/** Whether the granter can give every level and resend grant the role contains. */
export function canGrantRole(grantable: Grantable, role: Role): boolean {
  const { levels, resend } = parseScope(ROLES[role]);

  return (
    COLLECTIONS.every(collection => canGrantLevel(grantable, collection, levels[collection])) &&
    resend.every(collection => canGrantResend(grantable, collection))
  );
}
