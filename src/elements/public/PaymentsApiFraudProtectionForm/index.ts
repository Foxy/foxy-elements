import '@vaadin/vaadin-button';

import '../../internal/InternalCheckboxGroupControl/index';
import '../../internal/InternalIntegerControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../NucleonElement/index';
import '../I18n/index';

import { PaymentsApiFraudProtectionForm } from './PaymentsApiFraudProtectionForm';

customElements.define('foxy-payments-api-fraud-protection-form', PaymentsApiFraudProtectionForm);

export { PaymentsApiFraudProtectionForm };
