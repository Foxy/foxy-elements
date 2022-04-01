import { CouponCodesForm } from './CouponCodesForm';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.CouponCodesImport> & { _links: { self: { href: string } } };

export type Templates = {
  'codes:before'?: Renderer<CouponCodesForm>;
  'codes:after'?: Renderer<CouponCodesForm>;
  'import:before'?: Renderer<CouponCodesForm>;
  'import:after'?: Renderer<CouponCodesForm>;
};
