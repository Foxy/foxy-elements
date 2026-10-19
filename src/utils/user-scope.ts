import { COLLECTIONS } from './group-invitation-scopes';

/** `users` is not an invitation collection, but `user_full_access` grants it. */
export type ScopeCollection = (typeof COLLECTIONS)[number] | 'users';

export type UserScope = {
  canRead(collection: ScopeCollection): boolean;
  canWrite(collection: ScopeCollection): boolean;
  canResend(collection: ScopeCollection): boolean;
};

export type ScopeRule = {
  /** Control path (as used by `hiddencontrols` / `readonlycontrols`) this rule applies to. */
  path: string;
  collection: ScopeCollection;
  /** Permission required to show the control. Defaults to `read`. */
  need?: 'read' | 'write' | 'resend';
  /** Show the control, but make it readonly when the user cannot write the collection. */
  readonlyIfNoWrite?: boolean;
};

/**
 * Parses a space-separated API token scope. Returns `null` when the scope does not restrict
 * store collections (no scope, `store_full_access`, or no collection tokens), meaning the UI
 * must stay unchanged.
 */
export function parseUserScope(scope: string | null | undefined): UserScope | null {
  const tokens = new Set((scope ?? '').split(/\s+/).filter(token => token.length > 0));
  if (tokens.has('store_full_access')) return null;

  const isStoreScoped = COLLECTIONS.some(
    c => tokens.has(`${c}_read`) || tokens.has(`${c}_write`) || tokens.has(`${c}_resend`)
  );
  if (!isStoreScoped) return null;

  const canWrite = (c: ScopeCollection) =>
    tokens.has(`${c}_write`) || (c === 'users' && tokens.has('user_full_access'));

  return {
    canWrite,
    // A write scope satisfies a read check in the API.
    canRead: c => canWrite(c) || tokens.has(`${c}_read`),
    canResend: c => tokens.has(`${c}_resend`),
  };
}

/** Turns scope rules into control selectors to hide or make readonly. */
export function getScopeSelectors(
  scope: UserScope | null,
  rules: ScopeRule[],
  own: ScopeCollection | null
): { hidden: string[]; readonly: string[]; readonlyAll: boolean } {
  const result = { hidden: [] as string[], readonly: [] as string[], readonlyAll: false };
  if (!scope) return result;

  const check = { read: scope.canRead, write: scope.canWrite, resend: scope.canResend };

  for (const { path, collection, need = 'read', readonlyIfNoWrite } of rules) {
    if (!check[need](collection)) result.hidden.push(path);
    else if (readonlyIfNoWrite && !scope.canWrite(collection)) result.readonly.push(path);
  }

  // Own collection with no read access is left alone: the API's "Access denied" covers it.
  if (own && scope.canRead(own) && !scope.canWrite(own)) {
    result.readonlyAll = true;
    result.hidden.push('delete', 'create');
  }

  return result;
}
