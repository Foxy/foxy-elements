import '@vaadin/vaadin-date-picker';
import '@vaadin/vaadin-button';
import '../Spinner';
import '../I18N';

import { SubscriptionFormElement } from './SubscriptionFormElement';

customElements.define('foxy-subscription-form', SubscriptionFormElement);

export { SubscriptionFormElement };
