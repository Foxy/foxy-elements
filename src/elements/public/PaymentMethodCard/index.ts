import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@vaadin/vaadin-button';
import '../I18n/index';
import '../Spinner/index';

import { PaymentMethodCardElement } from './PaymentMethodCardElement';

customElements.define('foxy-payment-method-card', PaymentMethodCardElement);

export { PaymentMethodCardElement };
