import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/customer';

export type Data = Resource<Rels.CustomerAddress> & {
  /** By default, the country value must be valid according to the store's location_filtering value in the template_config. For instance, if your store is configured to only allow shipping and billing to the US, attempting to set the country to CA (Canada) will error. If true is passed in, the country can be any valid values. For customer_address resources that aren't the default shipping or billing, the validation will assume the shipping restrictions. NOTE: This does not currently take the region filtering into account. Defaults to false. */
  ignore_address_restrictions: boolean;
};
