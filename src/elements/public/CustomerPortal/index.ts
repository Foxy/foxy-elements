import '@polymer/iron-icons/editor-icons';
import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
import '../../internal/InternalSandbox/index';
import '../AccessRecoveryForm/index';
import '../PaymentMethodCard/index';
import '../TransactionsTable/index';
import '../SubscriptionCard/index';
import '../SubscriptionForm/index';
import '../CollectionPages/index';
import '../CollectionPage/index';
import '../SignInForm/index';
import '../FormDialog/index';
import '../Spinner/index';
import '../Customer/index';

import { CustomerPortal } from './CustomerPortal';
import { InternalCustomerPortalLoggedInView } from './InternalCustomerPortalLoggedInView';
import { InternalCustomerPortalLoggedOutView } from './InternalCustomerPortalLoggedOutView';

customElements.define(
  'foxy-internal-customer-portal-logged-in-view',
  InternalCustomerPortalLoggedInView
);

customElements.define(
  'foxy-internal-customer-portal-logged-out-view',
  InternalCustomerPortalLoggedOutView
);

customElements.define('foxy-customer-portal', CustomerPortal);

export { CustomerPortal };
