import '../../internal/InternalConfirmDialog/index';
import '../Spinner/index';
import '../I18n/index';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-button';

import { TaxForm } from './TaxForm';

customElements.define('foxy-tax-form', TaxForm);

export { TaxForm };
