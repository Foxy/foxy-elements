import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.Transaction> & {
  _embedded?: { 'fx:discounts'?: Resource<Rels.Discount>[] };
};
