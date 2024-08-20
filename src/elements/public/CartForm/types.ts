import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

// TODO remove this once SDK is fixed
type OriginalData = Resource<Rels.Cart, { zoom: ['discounts'] }>;
type FixedData = Omit<OriginalData, 'billing_region' | 'shipping_region'> & {
  /** Corresponds to the `region` field in `fx:customer_address`. API quirk. */
  billing_state: string;
  /** Corresponds to the `region` field in `fx:customer_address`. API quirk. */
  shipping_state: string;
};

export type Data = FixedData;
