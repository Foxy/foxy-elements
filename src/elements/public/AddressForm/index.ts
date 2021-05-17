import '@vaadin/vaadin-button';
import '@vaadin/vaadin-combo-box';
import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';

import { AddressForm } from './AddressForm';

customElements.define('foxy-address-form', AddressForm);

export { AddressForm };
