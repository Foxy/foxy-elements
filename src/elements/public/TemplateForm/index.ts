import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalSourceControl/index';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';

import { TemplateForm } from './TemplateForm';

customElements.define('foxy-template-form', TemplateForm);

export { TemplateForm };
