import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';
import '@vaadin/vaadin-text-field/vaadin-number-field';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-date-picker';
import '@vaadin/vaadin-button';

import { GiftCardCodeForm } from './GiftCardCodeForm';

customElements.define('foxy-gift-card-code-form', GiftCardCodeForm);

export { GiftCardCodeForm };
