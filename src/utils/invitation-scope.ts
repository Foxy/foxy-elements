import { COLLECTIONS, RESENDABLE, isWriteOnly } from './group-invitation-scopes';

/** Access level a single collection can be granted at. `WRITE_ONLY` collections have no `read`. */
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
    else if (tokens.has(read) && !isWriteOnly(collection)) levels[collection] = 'read';
    else levels[collection] = 'none';

    // A write-only collection's read token is not a grant the API knows, so it is left in
    // `extra` rather than modelled as a level.
    if (tokens.has(read) && !isWriteOnly(collection)) known.add(read);
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
    COLLECTIONS.every(
      collection => levels[collection] === (isWriteOnly(collection) ? 'none' : 'read')
    )
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
    // literally, without write covering read, sees read access too. A write-only collection
    // has no read token to emit, and the API rejects one.
    if (isWriteOnly(collection)) {
      if (level === 'full') tokens.push(`${collection}_write`);
    } else if (level === 'full') {
      tokens.push(`${collection}_read`, `${collection}_write`);
    } else if (level === 'read') {
      tokens.push(`${collection}_read`);
    }
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
  if (level === 'read' && isWriteOnly(collection)) return false;
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
 * Whether the "read-only access to everything" preset can be offered. A `WRITE_ONLY`
 * collection has no read level, so the preset leaves it out.
 *
 * It is hidden unless the granter can deliver every read. Silently redefining it as
 * "read-only on whatever I happen to be able to share" would make one preset mean different
 * things to different admins, which is a worse trap than an absent option — `Custom` covers
 * the gap.
 */
export function canGrantReadPreset(grantable: Grantable): boolean {
  return COLLECTIONS.every(
    collection => isWriteOnly(collection) || canGrantLevel(grantable, collection, 'read')
  );
}
