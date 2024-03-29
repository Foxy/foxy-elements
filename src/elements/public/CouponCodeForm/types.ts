import type { CouponCodeForm } from './CouponCodeForm';
import type { Renderer } from '../../../mixins/configurable';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type TransactionPageHrefGetter = (
  transactionHref: string,
  transaction: Resource<Rels.Transaction, { zoom: 'items' }>
) => string | null;

export type Data = Resource<Rels.CouponCode>;

export type Templates = {
  'code:before'?: Renderer<CouponCodeForm>;
  'code:after'?: Renderer<CouponCodeForm>;
  'number-of-uses-to-date:before'?: Renderer<CouponCodeForm>;
  'number-of-uses-to-date:after'?: Renderer<CouponCodeForm>;
  'transactions:before'?: Renderer<CouponCodeForm>;
  'transactions:after'?: Renderer<CouponCodeForm>;
  'timestamps:before'?: Renderer<CouponCodeForm>;
  'timestamps:after'?: Renderer<CouponCodeForm>;
  'delete:before'?: Renderer<CouponCodeForm>;
  'delete:after'?: Renderer<CouponCodeForm>;
  'create:before'?: Renderer<CouponCodeForm>;
  'create:after'?: Renderer<CouponCodeForm>;
};
