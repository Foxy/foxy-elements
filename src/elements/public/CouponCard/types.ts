import { CouponCard } from './CouponCard';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.Coupon>;

export type Templates = Partial<{
  'total:before': Renderer<CouponCard>;
  'total:after': Renderer<CouponCard>;
  'status:before': Renderer<CouponCard>;
  'status:after': Renderer<CouponCard>;
  'description:before': Renderer<CouponCard>;
  'description:after': Renderer<CouponCard>;
  'customer:before': Renderer<CouponCard>;
  'customer:after': Renderer<CouponCard>;
}>;
