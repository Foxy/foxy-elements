import type { ItemCategoryForm } from './ItemCategoryForm';
import type { Renderer } from '../../../mixins/configurable';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.ItemCategory>;
export type Templates = {
  'name:before'?: Renderer<ItemCategoryForm>;
  'name:after'?: Renderer<ItemCategoryForm>;
  'code:before'?: Renderer<ItemCategoryForm>;
  'code:after'?: Renderer<ItemCategoryForm>;
  'handling-fee-type:before'?: Renderer<ItemCategoryForm>;
  'handling-fee-type:after'?: Renderer<ItemCategoryForm>;
  'handling-fee:before'?: Renderer<ItemCategoryForm>;
  'handling-fee:after'?: Renderer<ItemCategoryForm>;
  'handling-fee-percentage:before'?: Renderer<ItemCategoryForm>;
  'handling-fee-percentage:after'?: Renderer<ItemCategoryForm>;
  'handling-fee-minimum:before'?: Renderer<ItemCategoryForm>;
  'handling-fee-minimum:after'?: Renderer<ItemCategoryForm>;
  'item-delivery-type:before'?: Renderer<ItemCategoryForm>;
  'item-delivery-type:after'?: Renderer<ItemCategoryForm>;
  'max-downloads-per-customer:before'?: Renderer<ItemCategoryForm>;
  'max-downloads-per-customer:after'?: Renderer<ItemCategoryForm>;
  'max-downloads-time-period:before'?: Renderer<ItemCategoryForm>;
  'max-downloads-time-period:after'?: Renderer<ItemCategoryForm>;
  'shipping-flat-rate:before'?: Renderer<ItemCategoryForm>;
  'shipping-flat-rate:after'?: Renderer<ItemCategoryForm>;
  'shipping-flat-rate-type:before'?: Renderer<ItemCategoryForm>;
  'shipping-flat-rate-type:after'?: Renderer<ItemCategoryForm>;
  'default-weight:before'?: Renderer<ItemCategoryForm>;
  'default-weight:after'?: Renderer<ItemCategoryForm>;
  'default-weight-unit:before'?: Renderer<ItemCategoryForm>;
  'default-weight-unit:after'?: Renderer<ItemCategoryForm>;
  'default-length-unit:before'?: Renderer<ItemCategoryForm>;
  'default-length-unit:after'?: Renderer<ItemCategoryForm>;
  'customs-value:before'?: Renderer<ItemCategoryForm>;
  'customs-value:after'?: Renderer<ItemCategoryForm>;
  'discount-name:before'?: Renderer<ItemCategoryForm>;
  'discount-name:after'?: Renderer<ItemCategoryForm>;
  'discount-builder:before'?: Renderer<ItemCategoryForm>;
  'discount-builder:after'?: Renderer<ItemCategoryForm>;
  'admin-email-template-uri:before'?: Renderer<ItemCategoryForm>;
  'admin-email-template-uri:after'?: Renderer<ItemCategoryForm>;
  'customer-email-template-uri:before'?: Renderer<ItemCategoryForm>;
  'customer-email-template-uri:after'?: Renderer<ItemCategoryForm>;
  'gift-recipient-email-template-uri:before'?: Renderer<ItemCategoryForm>;
  'gift-recipient-email-template-uri:after'?: Renderer<ItemCategoryForm>;
  'taxes:before'?: Renderer<ItemCategoryForm>;
  'taxes:after'?: Renderer<ItemCategoryForm>;
  'timestamps:before'?: Renderer<ItemCategoryForm>;
  'timestamps:after'?: Renderer<ItemCategoryForm>;
  'create:before'?: Renderer<ItemCategoryForm>;
  'create:after'?: Renderer<ItemCategoryForm>;
  'delete:before'?: Renderer<ItemCategoryForm>;
  'delete:after'?: Renderer<ItemCategoryForm>;
};