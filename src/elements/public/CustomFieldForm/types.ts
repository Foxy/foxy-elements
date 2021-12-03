import { CustomFieldForm } from './CustomFieldForm';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.CustomField>;
export type TextFieldParams = { field: keyof Data };
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
