import '@polymer/iron-icons/editor-icons';
import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
import '../../internal/InternalPasswordControl/index';
import '../../internal/InternalSandbox/index';
import '../../internal/InternalForm/index';
import '../AccessRecoveryForm/index';
import '../PaymentMethodCard/index';
import '../TransactionsTable/index';
import '../SubscriptionCard/index';
import '../SubscriptionForm/index';
import '../CollectionPages/index';
import '../CollectionPage/index';
import '../CustomerForm/index';
import '../SignInForm/index';
import '../FormDialog/index';
import '../Spinner/index';
import '../I18n/index';
import '../Customer/index';

import { CustomerPortal } from './CustomerPortal';
import { InternalCustomerPortalLink } from './InternalCustomerPortalLink';
import { InternalCustomerPortalLoggedInView } from './InternalCustomerPortalLoggedInView';
import { InternalCustomerPortalLoggedOutView } from './InternalCustomerPortalLoggedOutView';
import { InternalCustomerPortalSubscriptions } from './InternalCustomerPortalSubscriptions';
import { InternalCustomerPortalTransactions } from './InternalCustomerPortalTransactions';
import { InternalCustomerPortalPasswordResetView } from './InternalCustomerPortalPasswordResetView';

customElements.define(
  'foxy-internal-customer-portal-logged-in-view',
  InternalCustomerPortalLoggedInView
);

customElements.define(
  'foxy-internal-customer-portal-logged-out-view',
  InternalCustomerPortalLoggedOutView
);

customElements.define(
  'foxy-internal-customer-portal-password-reset-view',
  InternalCustomerPortalPasswordResetView
);

customElements.define(
  'foxy-internal-customer-portal-subscriptions',
  InternalCustomerPortalSubscriptions
);

customElements.define(
  'foxy-internal-customer-portal-transactions',
  InternalCustomerPortalTransactions
);

customElements.define('foxy-internal-customer-portal-link', InternalCustomerPortalLink);

customElements.define('foxy-customer-portal', CustomerPortal);

export { CustomerPortal };
