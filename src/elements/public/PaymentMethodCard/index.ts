import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@vaadin/vaadin-button';
import '../I18n/index';
import '../Spinner/index';

import { DialogWindow } from '../../private/Dialog/DialogWindow';
import { PaymentMethodCard } from './PaymentMethodCard';

customElements.define('foxy-payment-method-card', PaymentMethodCard);
customElements.define('foxy-dialog-window', DialogWindow);

export { PaymentMethodCard };
