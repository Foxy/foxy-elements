import '@polymer/iron-icons/editor-icons';
import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
import '../AccessRecoveryForm/index';
import '../PaymentMethodCard/index';
import '../TransactionsTable/index';
import '../SubscriptionCard/index';
import '../SubscriptionForm/index';
import '../CollectionPages/index';
import '../CollectionPage/index';
import '../CustomerForm/index';
import '../AddressCard/index';
import '../AddressForm/index';
import '../SignInForm/index';
import '../FormDialog/index';
import '../Spinner/index';
import '../I18n/index';

import { Customer } from '../Customer/Customer';
import { CustomerPortal } from './CustomerPortal';

if (!customElements.get('foxy-customer')) customElements.define('foxy-customer', Customer);
customElements.define('foxy-customer-portal', CustomerPortal);

export { CustomerPortal };
