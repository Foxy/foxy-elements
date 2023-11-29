import '../../internal/InternalBankCardControl/index';
import '../../internal/InternalForm/index';
import '@vaadin/vaadin-tabs';

import { PaymentMethodForm } from './PaymentMethodForm';

customElements.define('foxy-payment-method-form', PaymentMethodForm);

export { PaymentMethodForm };
