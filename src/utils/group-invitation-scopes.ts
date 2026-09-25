/**
 * Collections an invitation may grant, taken from the API's list of invitation collections minus
 * the two that are not meaningful choices.
 *
 * This list is duplicated from the API. A collection added there will be silently omitted
 * here until it is added to this array AND given a `scopes.<token>` label in every consuming
 * namespace (`user-invitation-card`, `user-invitation-form`). Rendering an unlabelled raw
 * token among humanized names looks broken, so omission is the deliberate failure mode.
 *
 * Two of the API's 22 collections are excluded on purpose -- do not "fix" the omission:
 *
 * - `clients`: a separate top-level resource that the Foxy admin does not manage.
 *   Sign-in never issues `clients_read`/`clients_write`, so granting them would have
 *   no effect.
 * - `users`: the API treats `user_full_access` as `users_read users_write`,
 *   and every admin sign-in requests `user_full_access`, so a user's access here never
 *   depends on their invitation. A toggle would be inert rather than merely redundant.
 */
export const COLLECTIONS = [
  'carts',
  'coupons',
  'customers',
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

export type ScopeGroups = {
  /** `store_full_access` was present. All other tokens are ignored and the arrays are empty. */
  storeFullAccess: boolean;
  /** Collections the user can read and write. A `_write` scope implies read, per the API. */
  full: string[];
  /** Collections the user can read but not write. */
  read: string[];
  /** Collections the user can resend. Independent of read/write. */
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
    if (tokens.has(`${collection}_write`)) full.push(collection);
    else if (tokens.has(`${collection}_read`)) read.push(collection);

    const isResendable = (RESENDABLE as readonly string[]).includes(collection);
    if (isResendable && tokens.has(`${collection}_resend`)) resend.push(collection);
  });

  return { storeFullAccess: false, full, read, resend };
}
