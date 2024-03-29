import { GiftCardCodeForm } from './GiftCardCodeForm';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.GiftCardCode>;

export type Templates = {
  'code:before'?: Renderer<GiftCardCodeForm>;
  'code:after'?: Renderer<GiftCardCodeForm>;
  'current-balance:before'?: Renderer<GiftCardCodeForm>;
  'current-balance:after'?: Renderer<GiftCardCodeForm>;
  'end-date:before'?: Renderer<GiftCardCodeForm>;
  'end-date:after'?: Renderer<GiftCardCodeForm>;
  'timestamps:before'?: Renderer<GiftCardCodeForm>;
  'timestamps:after'?: Renderer<GiftCardCodeForm>;
  'delete:before'?: Renderer<GiftCardCodeForm>;
  'delete:after'?: Renderer<GiftCardCodeForm>;
  'create:before'?: Renderer<GiftCardCodeForm>;
  'create:after'?: Renderer<GiftCardCodeForm>;
};
