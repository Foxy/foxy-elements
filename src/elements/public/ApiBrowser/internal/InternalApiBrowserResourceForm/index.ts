import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';

import '../../../../internal/InternalForm/index';
import '../../../CopyToClipboard/index';
import '../../../SwipeActions/index';

import { InternalApiBrowserResourceForm as Form } from './InternalApiBrowserResourceForm';

customElements.define('foxy-internal-api-browser-resource-form', Form);

export { Form as InternalApiBrowserResourceForm };
