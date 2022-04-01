import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';

import { GiftCardCodesForm } from './GiftCardCodesForm';
import { InternalGiftCardCodesFormListItem } from './internal/InternalGiftCardCodesFormListItem';

customElements.define('foxy-gift-card-codes-form', GiftCardCodesForm);
customElements.define(
  'foxy-internal-gift-card-codes-form-list-item',
  InternalGiftCardCodesFormListItem
);

export { GiftCardCodesForm };
