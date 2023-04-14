import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalForm/index';
import '../Spinner/index';
import '../I18n/index';

import { UserForm } from './UserForm';

customElements.define('foxy-user-form', UserForm);

export { UserForm };
