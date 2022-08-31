import '../../internal/InternalCheckboxGroupControl/index';
import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../PaymentsApiFraudProtectionCard/index';
import '../PaymentsApiFraudProtectionForm/index';

import '../PaymentsApiPaymentMethodCard/index';
import '../PaymentsApiPaymentMethodForm/index';

import { PaymentsApiPaymentPresetForm } from './PaymentsApiPaymentPresetForm';

customElements.define('foxy-payments-api-payment-preset-form', PaymentsApiPaymentPresetForm);

export { PaymentsApiPaymentPresetForm };
