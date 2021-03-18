import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@vaadin/vaadin-button';
import '../I18n/index';
import '../Spinner/index';

import { PaymentMethodCard } from './PaymentMethodCard';

customElements.define('foxy-payment-method-card', PaymentMethodCard);

export { PaymentMethodCard };
