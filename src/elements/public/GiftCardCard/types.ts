import { GiftCardCard } from './GiftCardCard';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.GiftCard>;

export type Templates = Partial<{
  'title:before': Renderer<GiftCardCard>;
  'title:after': Renderer<GiftCardCard>;
  'status:before': Renderer<GiftCardCard>;
  'status:after': Renderer<GiftCardCard>;
}>;
