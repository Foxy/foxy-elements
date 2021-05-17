import { Rels } from '@foxy.io/sdk/customer';
import { Resource } from '@foxy.io/sdk/core';
import { Renderer } from '../../../mixins/configurable';
import { AttributeCard } from './AttributeCard';

export type Data = Resource<Rels.Attribute>;
export type Templates = {
  'name:before'?: Renderer<AttributeCard>;
  'name:after'?: Renderer<AttributeCard>;
  'value:before'?: Renderer<AttributeCard>;
  'value:after'?: Renderer<AttributeCard>;
};
