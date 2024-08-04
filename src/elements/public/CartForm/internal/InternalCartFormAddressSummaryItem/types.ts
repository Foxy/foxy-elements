import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type ZoomedCustomer = Resource<
  Rels.Customer,
  { zoom: ['default_billing_address', 'default_shipping_address'] }
>;

export type AddressEntry = {
  originalValue: string;
  modified: boolean;
  value: string;
  field: string;
};
