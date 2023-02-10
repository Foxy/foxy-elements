import { Renderer } from '../../../mixins/configurable';
import { PaymentsApiPaymentPresetForm } from './PaymentsApiPaymentPresetForm';

export type { PaymentPreset as Data } from '../PaymentsApi/api/types';

export type Templates = {
  'description:before'?: Renderer<PaymentsApiPaymentPresetForm>;
  'description:after'?: Renderer<PaymentsApiPaymentPresetForm>;
  'is-live:before'?: Renderer<PaymentsApiPaymentPresetForm>;
  'is-live:after'?: Renderer<PaymentsApiPaymentPresetForm>;
  'is-purchase-order-enabled:before'?: Renderer<PaymentsApiPaymentPresetForm>;
  'is-purchase-order-enabled:after'?: Renderer<PaymentsApiPaymentPresetForm>;
  'payment-methods:before'?: Renderer<PaymentsApiPaymentPresetForm>;
  'payment-methods:after'?: Renderer<PaymentsApiPaymentPresetForm>;
  'fraud-protections:before'?: Renderer<PaymentsApiPaymentPresetForm>;
  'fraud-protections:after'?: Renderer<PaymentsApiPaymentPresetForm>;
};
