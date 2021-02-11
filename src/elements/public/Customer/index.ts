import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@polymer/iron-icons/editor-icons';
import '@vaadin/vaadin-button';
import '../PaymentMethodCard/index';
import '../SubscriptionsTable/index';
import '../FormDialog/index';
import '../TransactionsTable/index';
import '../CollectionPages/index';
import '../CollectionPage/index';
import '../AttributeCard/index';
import '../CustomerForm/index';
import '../AddressCard/index';
import '../Spinner/index';
import '../I18N/index';

import { CustomerElement } from './CustomerElement';

customElements.define('foxy-customer', CustomerElement);

export { CustomerElement };
