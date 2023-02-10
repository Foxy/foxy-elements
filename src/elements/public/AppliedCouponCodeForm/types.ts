import type { AppliedCouponCodeForm } from './AppliedCouponCodeForm';
import type { Renderer } from '../../../mixins/configurable';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.AppliedCouponCode>;

export type Templates = {
  'code:before'?: Renderer<AppliedCouponCodeForm>;
  'code:after'?: Renderer<AppliedCouponCodeForm>;
  'ignore-usage-limits:before'?: Renderer<AppliedCouponCodeForm>;
  'ignore-usage-limits:after'?: Renderer<AppliedCouponCodeForm>;
  'create:before'?: Renderer<AppliedCouponCodeForm>;
  'create:after'?: Renderer<AppliedCouponCodeForm>;
  'delete:before'?: Renderer<AppliedCouponCodeForm>;
  'delete:after'?: Renderer<AppliedCouponCodeForm>;
};
