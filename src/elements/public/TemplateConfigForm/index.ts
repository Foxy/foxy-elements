import '@polymer/iron-icons';
import '@polymer/iron-icon';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '../../internal/InternalSourceControl/index';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';

import { TemplateConfigForm } from './TemplateConfigForm';

customElements.define('foxy-template-config-form', TemplateConfigForm);

export { TemplateConfigForm };
