import '@vaadin/vaadin-button';
import '@vaadin/vaadin-combo-box';
import '../Spinner/index';
import '../I18n/index';

import { AddressForm } from './AddressForm';
import { DialogWindow } from '../../private/Dialog/DialogWindow';

customElements.define('foxy-address-form', AddressForm);
customElements.define('foxy-dialog-window', DialogWindow);

export { AddressForm };
