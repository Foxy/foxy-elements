import { Rels } from '@foxy.io/sdk/customer';
import { Resource } from '@foxy.io/sdk/core';
import { AddressCard } from './AddressCard';
import { Renderer } from '../../../mixins/configurable';

export type Data = Resource<Rels.CustomerAddress>;
export type Templates = {
  'address-name:before'?: Renderer<AddressCard>;
  'address-name:after'?: Renderer<AddressCard>;
  'full-name:before'?: Renderer<AddressCard>;
  'full-name:after'?: Renderer<AddressCard>;
  'full-address:before'?: Renderer<AddressCard>;
  'full-address:after'?: Renderer<AddressCard>;
  'company:before'?: Renderer<AddressCard>;
  'company:after'?: Renderer<AddressCard>;
  'phone:before'?: Renderer<AddressCard>;
  'phone:after'?: Renderer<AddressCard>;
};
