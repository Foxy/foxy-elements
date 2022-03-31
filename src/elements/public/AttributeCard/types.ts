import { AttributeCard } from './AttributeCard';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.Attribute>;
export type Templates = {
  'name:before'?: Renderer<AttributeCard>;
  'name:after'?: Renderer<AttributeCard>;
  'value:before'?: Renderer<AttributeCard>;
  'value:after'?: Renderer<AttributeCard>;
};
