import type { PaymentsApiFraudProtectionForm } from './PaymentsApiFraudProtectionForm';
import type { FraudProtection } from '../PaymentsApi/api/types';
import type { Renderer } from '../../../mixins/configurable';

export type Data = FraudProtection;
export type Block = NonNullable<Data['helper']['json']>['blocks'][number];
export type Templates = {
  'description:before'?: Renderer<PaymentsApiFraudProtectionForm>;
  'description:after'?: Renderer<PaymentsApiFraudProtectionForm>;
  'score-threshold-reject:before'?: Renderer<PaymentsApiFraudProtectionForm>;
  'score-threshold-reject:after'?: Renderer<PaymentsApiFraudProtectionForm>;
  'timestamps:before'?: Renderer<PaymentsApiFraudProtectionForm>;
  'timestamps:after'?: Renderer<PaymentsApiFraudProtectionForm>;
  'create:before'?: Renderer<PaymentsApiFraudProtectionForm>;
  'create:after'?: Renderer<PaymentsApiFraudProtectionForm>;
  'delete:before'?: Renderer<PaymentsApiFraudProtectionForm>;
  'delete:after'?: Renderer<PaymentsApiFraudProtectionForm>;

  [key: string]: Renderer<PaymentsApiFraudProtectionForm> | undefined;
};
