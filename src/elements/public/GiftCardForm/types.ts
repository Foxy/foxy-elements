import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

// TODO simplify once SDK is updated
export type Data = Resource<Rels.GiftCard> & {
  _links: { 'fx:attributes': { href: string } };
};
