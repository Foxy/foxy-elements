import '../../internal/InternalPostActionControl/index';
import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalFrequencyControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalDateControl/index';
import '../../internal/InternalForm/index';

import '../AdminTransactionCard/index';
import '../AttributeCard/index';
import '../AttributeForm/index';
import '../Transaction/index';

import './internal/InternalAdminSubscriptionFormStatusAction/index';
import './internal/InternalAdminSubscriptionFormLinkControl/index';
import './internal/InternalAdminSubscriptionFormError/index';

import { AdminSubscriptionForm } from './AdminSubscriptionForm';

customElements.define('foxy-admin-subscription-form', AdminSubscriptionForm);

export { AdminSubscriptionForm };
