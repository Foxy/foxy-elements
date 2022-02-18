import { CouponCodesForm } from './CouponCodesForm';
import { Renderer } from '../../../mixins/configurable';

export type Data = {
  _links: { self: { href: string } };
  coupon_codes: string[];
};

export type Templates = {
  'codes:before'?: Renderer<CouponCodesForm>;
  'codes:after'?: Renderer<CouponCodesForm>;
  'import:before'?: Renderer<CouponCodesForm>;
  'import:after'?: Renderer<CouponCodesForm>;
};
