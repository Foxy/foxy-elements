import type { GiftCardCodeForm } from './GiftCardCodeForm';
import type { Renderer } from '../../../mixins/configurable';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.GiftCardCode> & {
  customer_id?: number | string;
};

export type Templates = {
  'code:before'?: Renderer<GiftCardCodeForm>;
  'code:after'?: Renderer<GiftCardCodeForm>;
  'current-balance:before'?: Renderer<GiftCardCodeForm>;
  'current-balance:after'?: Renderer<GiftCardCodeForm>;
  'end-date:before'?: Renderer<GiftCardCodeForm>;
  'end-date:after'?: Renderer<GiftCardCodeForm>;
  'customer:before'?: Renderer<GiftCardCodeForm>;
  'customer:after'?: Renderer<GiftCardCodeForm>;
  'logs:before'?: Renderer<GiftCardCodeForm>;
  'logs:after'?: Renderer<GiftCardCodeForm>;
  'timestamps:before'?: Renderer<GiftCardCodeForm>;
  'timestamps:after'?: Renderer<GiftCardCodeForm>;
  'delete:before'?: Renderer<GiftCardCodeForm>;
  'delete:after'?: Renderer<GiftCardCodeForm>;
  'create:before'?: Renderer<GiftCardCodeForm>;
  'create:after'?: Renderer<GiftCardCodeForm>;
};
