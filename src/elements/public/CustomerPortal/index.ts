import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
import '../AccessRecoveryForm';
import '../CustomerApi';
import '../SignInForm';
import '../Customer';
import '../I18n';

import { CustomerPortal } from './CustomerPortal';

customElements.define('foxy-customer-portal', CustomerPortal);

export { CustomerPortal };
