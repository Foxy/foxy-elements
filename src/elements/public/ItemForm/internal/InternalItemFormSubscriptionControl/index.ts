import '../../../../internal/InternalFrequencyControl/index';
import '../../../../internal/InternalEditableControl/index';
import '../../../../internal/InternalDateControl/index';

import '../../../SubscriptionCard/index';
import '../../../SubscriptionForm/index';
import '../../../FormDialog/index';

import { InternalItemFormSubscriptionControl as Control } from './InternalItemFormSubscriptionControl';

customElements.define('foxy-internal-item-form-subscription-control', Control);

export { Control as InternalItemFormSubscriptionControl };
