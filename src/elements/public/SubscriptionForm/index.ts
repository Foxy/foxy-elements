import '@vaadin-component-factory/vcf-tooltip';
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';

import '../../internal/InternalTimestampsControl/index';
import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalCalendar/index';
import '../../internal/InternalSandbox/index';
import '../../internal/InternalForm/index';

import '../TransactionCard/index';
import '../NucleonElement/index';
import '../AttributeCard/index';
import '../AttributeForm/index';
import '../CustomerCard/index';
import '../ItemCard/index';
import '../I18n/index';

import { SubscriptionForm } from './SubscriptionForm';

customElements.define('foxy-subscription-form', SubscriptionForm);

export { SubscriptionForm };
