import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../Spinner/index';
import '../I18n/index';

import { CustomerFormElement } from './CustomerFormElement';

customElements.define('foxy-customer-form', CustomerFormElement);

export { CustomerFormElement };
