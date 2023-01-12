import '@vaadin/vaadin-button';
import '@vaadin/vaadin-tabs';

import '../../internal/InternalAsyncComboBoxControl/index';
import '../../internal/InternalCheckboxGroupControl/index';
import '../../internal/InternalRadioGroupControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../NucleonElement/index';
import '../I18n/index';

import { PaymentsApiPaymentMethodForm } from './PaymentsApiPaymentMethodForm';

customElements.define('foxy-payments-api-payment-method-form', PaymentsApiPaymentMethodForm);

export { PaymentsApiPaymentMethodForm };
