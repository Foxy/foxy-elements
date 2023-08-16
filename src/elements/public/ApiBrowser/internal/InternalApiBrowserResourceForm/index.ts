import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';

import '../../../../internal/InternalDeleteControl/index';
import '../../../../internal/InternalCreateControl/index';
import '../../../../internal/InternalSourceControl/index';
import '../../../../internal/InternalForm/index';
import '../../../CopyToClipboard/index';
import '../../../SwipeActions/index';
import '../../../I18n/index';

import { InternalApiBrowserResourceForm as Form } from './InternalApiBrowserResourceForm';

customElements.define('foxy-internal-api-browser-resource-form', Form);

export { Form as InternalApiBrowserResourceForm };
