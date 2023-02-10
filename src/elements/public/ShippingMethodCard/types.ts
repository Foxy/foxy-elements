import type {
  CollectionGraphLinks,
  CollectionGraphProps,
} from '@foxy.io/sdk/dist/types/core/defaults';

import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.ShippingMethod>;

export interface StoreShippingMethods {
  curie: 'fx:store_shipping_methods';
  links: CollectionGraphLinks<StoreShippingMethods>;
  props: CollectionGraphProps;
  child: Rels.StoreShippingMethod;
}
