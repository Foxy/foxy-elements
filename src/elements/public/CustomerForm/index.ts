import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';

import { CustomerForm } from './CustomerForm';

customElements.define('foxy-customer-form', CustomerForm);

export { CustomerForm };
