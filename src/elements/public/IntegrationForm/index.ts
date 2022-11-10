import '@vaadin/vaadin-button';

import '../../internal/InternalTextAreaControl/index';
import '../../internal/InternalDeleteControl/index';
import '../../internal/InternalCreateControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../CopyToClipboard/index';
import '../I18n/index';

import { IntegrationForm } from './IntegrationForm';

customElements.define('foxy-integration-form', IntegrationForm);

export { IntegrationForm };
