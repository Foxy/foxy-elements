import '@vaadin/vaadin-checkbox/vaadin-checkbox-group';
import '@vaadin/vaadin-checkbox/vaadin-checkbox';

import '../../internal/InternalRadioGroupControl/index';
import '../../internal/InternalAsyncDetailsControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../WebhookStatusCard/index';
import '../WebhookLogCard/index';

import { WebhookForm } from './WebhookForm';

customElements.define('foxy-webhook-form', WebhookForm);

export { WebhookForm };
