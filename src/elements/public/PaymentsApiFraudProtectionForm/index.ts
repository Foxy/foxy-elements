import '@vaadin/vaadin-tabs';

import '../../internal/InternalAsyncComboBoxControl/index';
import '../../internal/InternalCheckboxGroupControl/index';
import '../../internal/InternalRadioGroupControl/index';
import '../../internal/InternalIntegerControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../I18n/index';

import { PaymentsApiFraudProtectionForm } from './PaymentsApiFraudProtectionForm';

customElements.define('foxy-payments-api-fraud-protection-form', PaymentsApiFraudProtectionForm);

export { PaymentsApiFraudProtectionForm };
