import type { PaymentsApiPaymentMethodForm } from './PaymentsApiPaymentMethodForm';
import type { PaymentMethod } from '../PaymentsApi/api/types';
import type { Renderer } from '../../../mixins/configurable';

export type Data = PaymentMethod;

export type Block = NonNullable<Data['helper']['additional_fields']>['blocks'][number];

export type Templates = {
  'description:before'?: Renderer<PaymentsApiPaymentMethodForm>;
  'description:after'?: Renderer<PaymentsApiPaymentMethodForm>;
  'account-id:before'?: Renderer<PaymentsApiPaymentMethodForm>;
  'account-id:after'?: Renderer<PaymentsApiPaymentMethodForm>;
  'account-key:before'?: Renderer<PaymentsApiPaymentMethodForm>;
  'account-key:after'?: Renderer<PaymentsApiPaymentMethodForm>;
  'third-party-key:before'?: Renderer<PaymentsApiPaymentMethodForm>;
  'third-party-key:after'?: Renderer<PaymentsApiPaymentMethodForm>;
  'test-account-id:before'?: Renderer<PaymentsApiPaymentMethodForm>;
  'test-account-id:after'?: Renderer<PaymentsApiPaymentMethodForm>;
  'test-account-key:before'?: Renderer<PaymentsApiPaymentMethodForm>;
  'test-account-key:after'?: Renderer<PaymentsApiPaymentMethodForm>;
  'test-third-party-key:before'?: Renderer<PaymentsApiPaymentMethodForm>;
  'test-third-party-key:after'?: Renderer<PaymentsApiPaymentMethodForm>;
  'three-d-secure-toggle:before'?: Renderer<PaymentsApiPaymentMethodForm>;
  'three-d-secure-toggle:after'?: Renderer<PaymentsApiPaymentMethodForm>;
  'three-d-secure-response:before'?: Renderer<PaymentsApiPaymentMethodForm>;
  'three-d-secure-response:after'?: Renderer<PaymentsApiPaymentMethodForm>;
  'timestamps:before'?: Renderer<PaymentsApiPaymentMethodForm>;
  'timestamps:after'?: Renderer<PaymentsApiPaymentMethodForm>;
  'create:before'?: Renderer<PaymentsApiPaymentMethodForm>;
  'create:after'?: Renderer<PaymentsApiPaymentMethodForm>;
  'delete:before'?: Renderer<PaymentsApiPaymentMethodForm>;
  'delete:after'?: Renderer<PaymentsApiPaymentMethodForm>;

  [key: string]: Renderer<PaymentsApiPaymentMethodForm> | undefined;
};
