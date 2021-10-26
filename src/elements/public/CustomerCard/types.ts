import { CustomerCard } from './CustomerCard';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.Customer>;

export type Templates = Partial<{
  'name:before': Renderer<CustomerCard>;
  'name:after': Renderer<CustomerCard>;
  'email:before': Renderer<CustomerCard>;
  'email:after': Renderer<CustomerCard>;
}>;
