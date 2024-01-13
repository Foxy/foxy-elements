import type { FilterAttributeForm } from './FilterAttributeForm';
import type { Renderer } from '../../../mixins/configurable';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Templates = {
  'filter-query:before': Renderer<FilterAttributeForm>;
  'filter-query:after': Renderer<FilterAttributeForm>;
  'filter-name:before': Renderer<FilterAttributeForm>;
  'filter-name:after': Renderer<FilterAttributeForm>;
  'action:before': Renderer<FilterAttributeForm>;
  'action:after': Renderer<FilterAttributeForm>;
};

export type Data = Resource<Rels.Attribute>;

export type { Option } from '../QueryBuilder/types';
