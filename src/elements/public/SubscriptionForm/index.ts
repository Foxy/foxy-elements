import '@vaadin/vaadin-button';
import '../SubscriptionCancellationForm/index';
import '../SubscriptionCard/index';
import '../CollectionPages/index';
import '../FormDialog/index';
import '../ItemsForm/index';
import '../Calendar/index';
import '../Spinner/index';
import '../Table/index';
import '../I18n/index';

import { SubscriptionForm } from './SubscriptionForm';

customElements.define('foxy-subscription-form', SubscriptionForm);

export { SubscriptionForm };
