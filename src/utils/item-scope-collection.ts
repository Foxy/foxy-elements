import type { ScopeCollection } from './user-scope';

type Data = { _links: Record<string, unknown> } | null | undefined;

/**
 * Items and their children (options, attributes, discounts, applied taxes, custom fields) follow
 * `carts` while they belong to a cart and `transactions` once they belong to a transaction.
 * Returns `null` when the data says neither, so nothing gets locked by a guess.
 */
export function getItemScopeCollection(data: Data): ScopeCollection | null {
  if (data?._links['fx:cart']) return 'carts';
  if (data?._links['fx:transaction']) return 'transactions';
  return null;
}
