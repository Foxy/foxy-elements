import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-text-field/vaadin-text-area';
import '@vaadin/vaadin-button';

import '../../internal/InternalSelectControl/index';
import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalSandbox/index';

import '../Spinner/index';
import '../I18n/index';

import { EmailTemplateForm } from './EmailTemplateForm';

customElements.define('foxy-email-template-form', EmailTemplateForm);

export { EmailTemplateForm };
