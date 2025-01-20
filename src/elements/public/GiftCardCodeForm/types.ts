import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type TransactionPageHrefGetter = (href: string) => string | null;

export type Data = Resource<Rels.GiftCardCode> & {
  customer_id?: number | string;
};
