import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@vaadin/vaadin-button';
import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';

import { PaymentMethodCard } from './PaymentMethodCard';

customElements.define('foxy-payment-method-card', PaymentMethodCard);

export { PaymentMethodCard };
