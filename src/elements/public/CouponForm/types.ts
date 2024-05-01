import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type TransactionPageHrefGetter = (
  transactionHref: string,
  transaction: Resource<Rels.Transaction, { zoom: 'items' }>
) => string | null;

export type Data = Resource<Rels.Coupon> & {
  // TODO: remove this once SDK is updated
  item_option_restrictions: null | Record<string, string[]>;
  shared_codes_allowed: boolean;
  inclusive_tax_rate: number;
  _links: { 'fx:attributes': { href: string } };
};
