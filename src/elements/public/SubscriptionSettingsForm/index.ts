import '../../internal/InternalCheckboxGroupControl/index';
import '../../internal/InternalEditableListControl/index';
import '../../internal/InternalRadioGroupControl/index';
import '../../internal/InternalIntegerControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import './internal/InternalSubscriptionSettingsFormReattemptBypass/index';

import { SubscriptionSettingsForm } from './SubscriptionSettingsForm';

customElements.define('foxy-subscription-settings-form', SubscriptionSettingsForm);

export { SubscriptionSettingsForm };
