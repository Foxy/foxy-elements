import type { AttributeForm } from './AttributeForm';
import type { Renderer } from '../../../mixins/configurable';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.Attribute>;
export type Templates = {
  'name:before'?: Renderer<AttributeForm>;
  'name:after'?: Renderer<AttributeForm>;
  'value:before'?: Renderer<AttributeForm>;
  'value:after'?: Renderer<AttributeForm>;
  'visibility:before'?: Renderer<AttributeForm>;
  'visibility:after'?: Renderer<AttributeForm>;
  'timestamps:before'?: Renderer<AttributeForm>;
  'timestamps:after'?: Renderer<AttributeForm>;
  'delete:before'?: Renderer<AttributeForm>;
  'delete:after'?: Renderer<AttributeForm>;
  'create:before'?: Renderer<AttributeForm>;
  'create:after'?: Renderer<AttributeForm>;
};
