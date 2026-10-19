import type { ScopeCollection } from './user-scope';

import { canReadCollection, parseUserScope } from './user-scope';

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

type Cart = { currency_code?: string; template_set_uri?: string } | null | undefined;

/**
 * Item cards find their currency code on the transaction, on the cart or subscription transaction
 * template, or on its template set. Returns `false` when the scope can read none of the sources
 * that could still give a code, so the card renders amounts without a currency instead of loading
 * forever. Always `true` when the scope does not restrict store collections.
 */
export function canReadItemCurrency(
  scope: string | null | undefined,
  data: Data,
  cart: Cart
): boolean {
  if (!parseUserScope(scope)) return true;

  const can = (collection: ScopeCollection) => canReadCollection(scope, collection);
  const links = data?._links ?? {};
  if (links['fx:transaction'] && can('transactions')) return true;

  const isCartReadable =
    can('carts') && (!!links['fx:cart'] || (!!links['fx:subscription'] && can('subscriptions')));

  if (!isCartReadable) return false;
  if (!cart || cart.currency_code) return true;
  if (!can('templates')) return false;

  // An empty template set URI means the store's default set, found through the store.
  return cart.template_set_uri !== '' || can('stores');
}
