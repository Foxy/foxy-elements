import { ItemOptionCard } from './ItemOptionCard';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.ItemOption>;
export type Templates = {
  'title:before'?: Renderer<ItemOptionCard>;
  'title:after'?: Renderer<ItemOptionCard>;
  'subtitle:before'?: Renderer<ItemOptionCard>;
  'subtitle:after'?: Renderer<ItemOptionCard>;
};
