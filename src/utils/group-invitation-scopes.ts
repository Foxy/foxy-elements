/**
 * Collections an invitation may grant, taken from the API's lists of invitation collections
 * (those with read and write scopes, and those with a write scope only) minus the one that is
 * not a meaningful choice.
 *
 * This list is duplicated from the API. A collection added there will be silently omitted
 * here until it is added to this array (and to `WRITE_ONLY` when the API lists it as
 * write-only) AND given a `scopes.<token>` label in every consuming namespace
 * (`user-invitation-card`, `user-invitation-form`). Rendering an unlabelled raw token among
 * humanized names looks broken, so omission is the deliberate failure mode.
 *
 * Two collections the API models are excluded on purpose -- do not "fix" the omission:
 *
 * - `clients`: a separate top-level resource that the Foxy admin does not manage. The API
 *   never lets an invitation grant `clients_read`/`clients_write`.
 * - `users`: the API treats `user_full_access` as `users_read users_write`,
 *   and every admin sign-in requests `user_full_access`, so a user's access here never
 *   depends on their invitation. A toggle would be inert rather than merely redundant.
 */
export const COLLECTIONS = [
  'carts',
  'coupons',
  'customers',
  'customer_anonymizations',
  'customer_portal_settings',
  'downloadables',
  'gift_cards',
  'integrations',
  'item_categories',
  'payment_settings',
  'reporting',
  'shipping_integrations',
  'shipping_settings',
  'stores',
  'subscriptions',
  'subscription_settings',
  'taxes',
  'templates',
  'transactions',
  'user_invitations',
  'webhooks',
] as const;

/** Collections that additionally support a `_resend` permission. */
export const RESENDABLE = ['transactions', 'webhooks', 'taxes'] as const;

/**
 * Collections with a `_write` permission and no `_read` one. Reading what they act on is
 * covered by another collection, and the API rejects a `_read` token for them as invalid.
 */
export const WRITE_ONLY = ['customer_anonymizations'] as const;

/** `true` for a collection in `WRITE_ONLY`, which has no read level. */
export function isWriteOnly(collection: string): boolean {
  return (WRITE_ONLY as readonly string[]).includes(collection);
}

export type ScopeGroups = {
  /** `store_full_access` was present. All other tokens are ignored and the arrays are empty. */
  storeFullAccess: boolean;
  /** Collections the user can read and write. A `_write` scope implies read, per the API. */
  full: string[];
  /** Collections the user can read but not write. Never includes a `WRITE_ONLY` collection. */
  read: string[];
  /** Collections the user can resend without full access. Full access includes resend. */
  resend: string[];
};

/**
 * Groups an invitation's space-separated `scope` string by permission level.
 *
 * Returns collection tokens rather than display labels: labels are localized, and sorting
 * by them belongs in the element that has a translation function.
 */
export function groupInvitationScopes(scope: string | null | undefined): ScopeGroups {
  const tokens = new Set((scope ?? '').split(/\s+/).filter(token => token.length > 0));

  if (tokens.has('store_full_access')) {
    return { storeFullAccess: true, full: [], read: [], resend: [] };
  }

  const full: string[] = [];
  const read: string[] = [];
  const resend: string[] = [];

  COLLECTIONS.forEach(collection => {
    // A write scope satisfies a read check in the API, so write wins and the collection
    // is never listed as read-only as well.
    const hasWrite = tokens.has(`${collection}_write`);
    if (hasWrite) full.push(collection);
    else if (!isWriteOnly(collection) && tokens.has(`${collection}_read`)) read.push(collection);

    // Write includes resend in the API, so a full collection is not listed again as resend.
    const isResendable = (RESENDABLE as readonly string[]).includes(collection);
    if (isResendable && !hasWrite && tokens.has(`${collection}_resend`)) resend.push(collection);
  });

  return { storeFullAccess: false, full, read, resend };
}
