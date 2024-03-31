import type { CouponCodesForm } from './CouponCodesForm';
import type { Renderer } from '../../../mixins/configurable';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.CouponCodesImport> & { _links: { self: { href: string } } };

export type Templates = {
  'coupon-codes:before'?: Renderer<CouponCodesForm>;
  'coupon-codes:after'?: Renderer<CouponCodesForm>;
  'create:before'?: Renderer<CouponCodesForm>;
  'create:after'?: Renderer<CouponCodesForm>;
};
