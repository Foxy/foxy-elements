import '@vaadin/vaadin-date-picker';
import '@vaadin/vaadin-button';
import '../Spinner/index';
import '../I18n/index';

import { SubscriptionFormElement } from './SubscriptionFormElement';

customElements.define('foxy-subscription-form', SubscriptionFormElement);

export { SubscriptionFormElement };
