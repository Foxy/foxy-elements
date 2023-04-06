import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';

// TODO: simplify the type below once the SDK is updated

export type Data = Resource<Rels.Coupon> & {
  customer_auto_apply: boolean;
  customer_attribute_restrictions: string;
  customer_subscription_restrictions: string;
};
