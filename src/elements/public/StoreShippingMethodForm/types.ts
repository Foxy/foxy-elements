import type { StoreShippingMethodForm } from './StoreShippingMethodForm';
import type { Renderer } from '../../../mixins/configurable';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<
  Rels.StoreShippingMethod,
  {
    zoom: ['shipping_method', 'shipping_container', 'shipping_drop_type'];
  }
>;

export type Templates = {
  'shipping-method-uri:before'?: Renderer<StoreShippingMethodForm>;
  'shipping-method-uri:after'?: Renderer<StoreShippingMethodForm>;
  'shipping-container-uri:before'?: Renderer<StoreShippingMethodForm>;
  'shipping-container-uri:after'?: Renderer<StoreShippingMethodForm>;
  'shipping-drop-type-uri:before'?: Renderer<StoreShippingMethodForm>;
  'shipping-drop-type-uri:after'?: Renderer<StoreShippingMethodForm>;
  'destinations:before'?: Renderer<StoreShippingMethodForm>;
  'destinations:after'?: Renderer<StoreShippingMethodForm>;
  'authentication-key:before'?: Renderer<StoreShippingMethodForm>;
  'authentication-key:after'?: Renderer<StoreShippingMethodForm>;
  'meter-number:before'?: Renderer<StoreShippingMethodForm>;
  'meter-number:after'?: Renderer<StoreShippingMethodForm>;
  'endpoint:before'?: Renderer<StoreShippingMethodForm>;
  'endpoint:after'?: Renderer<StoreShippingMethodForm>;
  'accountid:before'?: Renderer<StoreShippingMethodForm>;
  'accountid:after'?: Renderer<StoreShippingMethodForm>;
  'password:before'?: Renderer<StoreShippingMethodForm>;
  'password:after'?: Renderer<StoreShippingMethodForm>;
  'custom-code:before'?: Renderer<StoreShippingMethodForm>;
  'custom-code:after'?: Renderer<StoreShippingMethodForm>;
  'services:before'?: Renderer<StoreShippingMethodForm>;
  'services:after'?: Renderer<StoreShippingMethodForm>;
  'timestamps:before'?: Renderer<StoreShippingMethodForm>;
  'timestamps:after'?: Renderer<StoreShippingMethodForm>;
  'create:before'?: Renderer<StoreShippingMethodForm>;
  'create:after'?: Renderer<StoreShippingMethodForm>;
  'delete:before'?: Renderer<StoreShippingMethodForm>;
  'delete:after'?: Renderer<StoreShippingMethodForm>;
};
