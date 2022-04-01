import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';

import { GenerateCodesForm } from './GenerateCodesForm';

customElements.define('foxy-generate-codes-form', GenerateCodesForm);

export { GenerateCodesForm };
