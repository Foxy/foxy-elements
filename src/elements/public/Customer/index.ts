import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@polymer/iron-icons/editor-icons';
import '@vaadin/vaadin-button';
import '../PaymentMethodCard';
// import '../SubscriptionsTable';
import '../FormDialog';
// import '../TransactionsTable';
import '../CollectionPages';
import '../CollectionPage';
import '../AttributeCard';
import '../AddressCard';
import '../Spinner';
import '../I18N';

import { CustomerElement } from './CustomerElement';

customElements.define('foxy-customer', CustomerElement);

export { CustomerElement };
