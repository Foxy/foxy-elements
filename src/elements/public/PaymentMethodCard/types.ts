import * as FoxySDK from '@foxy.io/sdk';
import { Renderer } from '../../../mixins/configurable';
import { PaymentMethodCard } from './PaymentMethodCard';

export type Rel = FoxySDK.Backend.Rels.DefaultPaymentMethod;
export type Data = FoxySDK.Core.Resource<Rel, undefined>;
export type Templates = {
  'actions:before'?: Renderer<PaymentMethodCard>;
  'actions:after'?: Renderer<PaymentMethodCard>;
  'actions:delete:before'?: Renderer<PaymentMethodCard>;
  'actions:delete:after'?: Renderer<PaymentMethodCard>;
};
