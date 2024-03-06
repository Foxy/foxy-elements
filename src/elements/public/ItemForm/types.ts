import type { Renderer } from '../../../mixins/configurable';
import type { ItemForm } from './ItemForm';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.Item>;

export type Templates = {
  'name:before'?: Renderer<ItemForm>;
  'name:after'?: Renderer<ItemForm>;

  'price:before'?: Renderer<ItemForm>;
  'price:after'?: Renderer<ItemForm>;

  'quantity:before'?: Renderer<ItemForm>;
  'quantity:after'?: Renderer<ItemForm>;

  'subscription-frequency:before'?: Renderer<ItemForm>;
  'subscription:frequency:after'?: Renderer<ItemForm>;

  'subscription-start-date:before'?: Renderer<ItemForm>;
  'subscription:start-date:after'?: Renderer<ItemForm>;

  'subscription-end-date:before'?: Renderer<ItemForm>;
  'subscription:end-date:after'?: Renderer<ItemForm>;

  'discount-name:before'?: Renderer<ItemForm>;
  'discount:name:after'?: Renderer<ItemForm>;

  'discount-builder:before'?: Renderer<ItemForm>;
  'discount:builder:after'?: Renderer<ItemForm>;

  'expires:before'?: Renderer<ItemForm>;
  'expires:after'?: Renderer<ItemForm>;

  'url:before'?: Renderer<ItemForm>;
  'url:after'?: Renderer<ItemForm>;

  'image:before'?: Renderer<ItemForm>;
  'image:after'?: Renderer<ItemForm>;

  'quantity-min:before'?: Renderer<ItemForm>;
  'quantity:min:after'?: Renderer<ItemForm>;

  'quantity-max:before'?: Renderer<ItemForm>;
  'quantity:max:after'?: Renderer<ItemForm>;

  'shipto:before'?: Renderer<ItemForm>;
  'shipto:after'?: Renderer<ItemForm>;

  'width:before'?: Renderer<ItemForm>;
  'width:after'?: Renderer<ItemForm>;

  'height:before'?: Renderer<ItemForm>;
  'height:after'?: Renderer<ItemForm>;

  'length:before'?: Renderer<ItemForm>;
  'length:after'?: Renderer<ItemForm>;

  'weight:before'?: Renderer<ItemForm>;
  'weight:after'?: Renderer<ItemForm>;

  'item-category-uri:before'?: Renderer<ItemForm>;
  'item:category-uri:after'?: Renderer<ItemForm>;

  'code:before'?: Renderer<ItemForm>;
  'code:after'?: Renderer<ItemForm>;

  'parent-code:before'?: Renderer<ItemForm>;
  'parent:code:after'?: Renderer<ItemForm>;

  'discount-details:before'?: Renderer<ItemForm>;
  'discount:details:after'?: Renderer<ItemForm>;

  'coupon-details:before'?: Renderer<ItemForm>;
  'coupon:details:after'?: Renderer<ItemForm>;

  'attributes:before'?: Renderer<ItemForm>;
  'attributes:after'?: Renderer<ItemForm>;

  'item-options:before'?: Renderer<ItemForm>;
  'item:options:after'?: Renderer<ItemForm>;

  'delete:before'?: Renderer<ItemForm>;
  'delete:after'?: Renderer<ItemForm>;

  'create:before'?: Renderer<ItemForm>;
  'create:after'?: Renderer<ItemForm>;

  'timestamps:before'?: Renderer<ItemForm>;
  'timestamps:after'?: Renderer<ItemForm>;
};
