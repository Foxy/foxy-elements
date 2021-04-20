import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
import '../AccessRecoveryForm/index';
import '../SignInForm/index';
import '../Customer/index';
import '../I18n/index';

import { CustomerPortal } from './CustomerPortal';

customElements.define('foxy-customer-portal', CustomerPortal);

export { CustomerPortal };
