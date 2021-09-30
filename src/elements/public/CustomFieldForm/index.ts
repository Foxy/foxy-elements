import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-checkbox';
import '@vaadin/vaadin-button';
import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';

import { CustomFieldForm } from './CustomFieldForm';

customElements.define('foxy-custom-field-form', CustomFieldForm);

export { CustomFieldForm };
