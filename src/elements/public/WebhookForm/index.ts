import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalPasswordControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalSwitchControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../WebhookStatusCard/index';
import '../WebhookLogCard/index';

import { WebhookForm } from './WebhookForm';

customElements.define('foxy-webhook-form', WebhookForm);

export { WebhookForm };
