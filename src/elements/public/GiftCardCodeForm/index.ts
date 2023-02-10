import '@vaadin/vaadin-text-field/vaadin-number-field';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-date-picker';
import '@vaadin/vaadin-button';

import '../../internal/InternalAsyncDetailsControl/index';
import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalSandbox/index';

import '../GiftCardCodeLogCard/index';
import '../Spinner/index';
import '../I18n/index';

import './internal/InternalGiftCardCodeFormItemControl/index';

import { GiftCardCodeForm } from './GiftCardCodeForm';

customElements.define('foxy-gift-card-code-form', GiftCardCodeForm);

export { GiftCardCodeForm };
