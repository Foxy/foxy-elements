import '@vaadin/vaadin-button';

import '../../internal/InternalPasswordControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalSwitchControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../NucleonElement/index';
import '../Spinner/index';
import '../I18n/index';

import { PaymentsApiPaymentMethodForm } from './PaymentsApiPaymentMethodForm';

customElements.define('foxy-payments-api-payment-method-form', PaymentsApiPaymentMethodForm);

export { PaymentsApiPaymentMethodForm };
