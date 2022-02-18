import { CouponCodeForm } from './CouponCodeForm';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.CouponCode>;

export type Templates = {
  'code:before'?: Renderer<CouponCodeForm>;
  'code:after'?: Renderer<CouponCodeForm>;
  'timestamps:before'?: Renderer<CouponCodeForm>;
  'timestamps:after'?: Renderer<CouponCodeForm>;
  'delete:before'?: Renderer<CouponCodeForm>;
  'delete:after'?: Renderer<CouponCodeForm>;
  'create:before'?: Renderer<CouponCodeForm>;
  'create:after'?: Renderer<CouponCodeForm>;
};
