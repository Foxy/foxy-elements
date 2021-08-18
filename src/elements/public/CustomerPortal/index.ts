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
import { InternalCustomerPortalChangePassword } from './InternalCustomerPortalChangePassword';
import { InternalCustomerPortalLink } from './InternalCustomerPortalLink';
import { InternalCustomerPortalLoggedInView } from './InternalCustomerPortalLoggedInView';
import { InternalCustomerPortalLoggedOutView } from './InternalCustomerPortalLoggedOutView';
import { InternalCustomerPortalSubscriptions } from './InternalCustomerPortalSubscriptions';
import { InternalCustomerPortalTransactions } from './InternalCustomerPortalTransactions';

customElements.define(
  'foxy-internal-customer-portal-logged-in-view',
  InternalCustomerPortalLoggedInView
);

customElements.define(
  'foxy-internal-customer-portal-logged-out-view',
  InternalCustomerPortalLoggedOutView
);

customElements.define(
  'foxy-internal-customer-portal-subscriptions',
  InternalCustomerPortalSubscriptions
);

customElements.define(
  'foxy-internal-customer-portal-transactions',
  InternalCustomerPortalTransactions
);

customElements.define(
  'foxy-internal-customer-portal-change-password',
  InternalCustomerPortalChangePassword
);

customElements.define('foxy-internal-customer-portal-link', InternalCustomerPortalLink);

customElements.define('foxy-customer-portal', CustomerPortal);

export { CustomerPortal };
