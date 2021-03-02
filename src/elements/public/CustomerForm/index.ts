import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../Spinner/index';
import '../I18n/index';

import { CustomerForm } from './CustomerForm';
import { DialogWindow } from '../../private/Dialog/DialogWindow';

customElements.define('foxy-customer-form', CustomerForm);
customElements.define('foxy-dialog-window', DialogWindow);

export { CustomerForm };
