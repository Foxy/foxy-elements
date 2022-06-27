import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalSandbox/index';
import '../GenerateCodesForm/index';
import '../GiftCardCodesForm/index';
import '../GiftCardCodeForm/index';
import '../CopyToClipboard/index';
import '../QueryBuilder/index';
import '../Pagination/index';
import '../FormDialog/index';
import '../Spinner/index';
import '../Table/index';
import '../I18n/index';

import { GiftCardForm } from './GiftCardForm';

customElements.define('foxy-gift-card-form', GiftCardForm);

export { GiftCardForm };
