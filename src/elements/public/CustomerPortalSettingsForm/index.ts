import '../../internal/InternalCheckboxGroupControl/index';
import '../../internal/InternalEditableListControl/index';
import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalFrequencyControl/index';
import '../../internal/InternalPasswordControl/index';
import '../../internal/InternalForm/index';

import './internal/InternalCustomerPortalSettingsFormSubscriptionsAllowFrequencyModificationRuleForm/index';
import './internal/InternalCustomerPortalSettingsFormSubscriptionsAllowFrequencyModificationRuleCard/index';

import './internal/InternalCustomerPortalSettingsFormSubscriptionsAllowNextDateModificationRuleForm/index';
import './internal/InternalCustomerPortalSettingsFormSubscriptionsAllowNextDateModificationRuleCard/index';

import { CustomerPortalSettingsForm } from './CustomerPortalSettingsForm';

customElements.define('foxy-customer-portal-settings-form', CustomerPortalSettingsForm);

export { CustomerPortalSettingsForm };
