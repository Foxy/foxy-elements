import type { CustomFieldForm } from './CustomFieldForm';
import type { Renderer } from '../../../mixins/configurable';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.CustomField>;
export type Templates = {
  'name:before'?: Renderer<CustomFieldForm>;
  'name:after'?: Renderer<CustomFieldForm>;
  'value:before'?: Renderer<CustomFieldForm>;
  'value:after'?: Renderer<CustomFieldForm>;
  'visibility:before'?: Renderer<CustomFieldForm>;
  'visibility:after'?: Renderer<CustomFieldForm>;
  'timestamps:before'?: Renderer<CustomFieldForm>;
  'timestamps:after'?: Renderer<CustomFieldForm>;
  'delete:before'?: Renderer<CustomFieldForm>;
  'delete:after'?: Renderer<CustomFieldForm>;
  'create:before'?: Renderer<CustomFieldForm>;
  'create:after'?: Renderer<CustomFieldForm>;
};
