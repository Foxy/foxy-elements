import { PaymentCard } from './PaymentCard';
import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.Payment>;
export type Templates = {
  'title:before'?: Renderer<PaymentCard>;
  'title:after'?: Renderer<PaymentCard>;
  'subtitle:before'?: Renderer<PaymentCard>;
  'subtitle:after'?: Renderer<PaymentCard>;
  'card-info:before'?: Renderer<PaymentCard>;
  'card-info:after'?: Renderer<PaymentCard>;
  'fraud-risk:before'?: Renderer<PaymentCard>;
  'fraud-risk:after'?: Renderer<PaymentCard>;
  'processor-response:before'?: Renderer<PaymentCard>;
  'processor-response:after'?: Renderer<PaymentCard>;
};
