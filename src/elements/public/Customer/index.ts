import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@polymer/iron-icons/editor-icons';
import '@vaadin/vaadin-button';
import '../../internal/InternalSandbox/index';
import '../PaymentMethodCard/index';
import '../SubscriptionsTable/index';
import '../SubscriptionForm/index';
import '../FormDialog/index';
import '../TransactionsTable/index';
import '../CollectionPages/index';
import '../CollectionPage/index';
import '../AttributeCard/index';
import '../AttributeForm/index';
import '../CustomerForm/index';
import '../AddressCard/index';
import '../AddressForm/index';
import '../Spinner/index';
import '../I18n/index';

import { Customer } from './Customer';

customElements.define('foxy-customer', Customer);

export { Customer };
