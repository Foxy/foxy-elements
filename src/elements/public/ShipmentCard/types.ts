import type { Rels } from '@foxy.io/sdk/backend';
import type { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.Shipment> & {
  _embedded: { 'fx:items': Resource<Rels.Item, { zoom: 'item_category' }>[] };
};
