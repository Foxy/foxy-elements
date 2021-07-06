import '@vaadin/vaadin-text-field/vaadin-text-area';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';

import { AttributeForm } from './AttributeForm';

customElements.define('foxy-attribute-form', AttributeForm);

export { AttributeForm };
