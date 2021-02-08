import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../Spinner';
import '../I18N';

import { CustomerFormElement } from './CustomerFormElement';

customElements.define('foxy-customer-form', CustomerFormElement);

export { CustomerFormElement };
