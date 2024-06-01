import type { UpdatePaymentMethodForm } from './UpdatePaymentMethodForm';
import type { Rels as CustomerRels } from '@foxy.io/sdk/customer';
import type { Rels as BackendRels } from '@foxy.io/sdk/backend';
import type { Renderer } from '../../../mixins/configurable';
import type { Resource } from '@foxy.io/sdk/core';

export type Rel = BackendRels.DefaultPaymentMethod | CustomerRels.DefaultPaymentMethod;
export type Data = Resource<Rel>;
export type Templates = {
  'template-set:before'?: Renderer<UpdatePaymentMethodForm>;
  'template-set:after'?: Renderer<UpdatePaymentMethodForm>;
  'cc-token:before'?: Renderer<UpdatePaymentMethodForm>;
  'cc-token:after'?: Renderer<UpdatePaymentMethodForm>;
};
