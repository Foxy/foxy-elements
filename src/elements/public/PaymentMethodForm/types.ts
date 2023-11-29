import { Rels as CustomerRels } from '@foxy.io/sdk/customer';
import { Rels as BackendRels } from '@foxy.io/sdk/backend';
import { PaymentMethodForm } from './PaymentMethodForm';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

// TODO remove this after the SDK is updated
export type Rel = (BackendRels.DefaultPaymentMethod | CustomerRels.DefaultPaymentMethod) & {
  links: { 'fx:cc_token_embed_url': {} };
  props: { token?: string };
};

export type Data = Resource<Rel>;

export type Templates = {
  'cc-number:before'?: Renderer<PaymentMethodForm>;
  'cc-number:after'?: Renderer<PaymentMethodForm>;
  'cc-exp:before'?: Renderer<PaymentMethodForm>;
  'cc-exp:after'?: Renderer<PaymentMethodForm>;
  'cc-csc:before'?: Renderer<PaymentMethodForm>;
  'cc-csc:after'?: Renderer<PaymentMethodForm>;
  'cc-token:before'?: Renderer<PaymentMethodForm>;
  'cc-token:after'?: Renderer<PaymentMethodForm>;
  'timestamps:before'?: Renderer<PaymentMethodForm>;
  'timestamps:after'?: Renderer<PaymentMethodForm>;
  'create:before'?: Renderer<PaymentMethodForm>;
  'create:after'?: Renderer<PaymentMethodForm>;
  'delete:before'?: Renderer<PaymentMethodForm>;
  'delete:after'?: Renderer<PaymentMethodForm>;
};
