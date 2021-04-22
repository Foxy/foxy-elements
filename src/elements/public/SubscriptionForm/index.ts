import '@vaadin/vaadin-date-picker';
import '../CollectionPages/index';
import '../ItemsForm/index';
import '../Spinner/index';
import '../Table/index';
import '../I18n/index';

import { SubscriptionForm } from './SubscriptionForm';

customElements.define('foxy-subscription-form', SubscriptionForm);

export { SubscriptionForm };
