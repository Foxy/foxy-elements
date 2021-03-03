import '@vaadin/vaadin-button';
import '@vaadin/vaadin-combo-box';
import '../Spinner/index';
import '../I18n/index';

import { AddressForm } from './AddressForm';

customElements.define('foxy-address-form', AddressForm);

export { AddressForm };
