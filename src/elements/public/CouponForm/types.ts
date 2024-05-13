import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type TransactionPageHrefGetter = (
  transactionHref: string,
  transaction: Resource<Rels.Transaction, { zoom: 'items' }>
) => string | null;

export type Data = Resource<Rels.Coupon>;
