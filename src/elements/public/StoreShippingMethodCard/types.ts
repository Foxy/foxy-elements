import type { Rels } from '@foxy.io/sdk/backend';
import type { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<
  Rels.StoreShippingMethod,
  { zoom: ['shipping_method', 'shipping_container', 'shipping_drop_type'] }
>;
