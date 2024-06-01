import '../../../../internal/InternalControl/index';
import '../../../PaymentCardEmbedElement/index';
import '../../../I18n/index';

import '@vaadin/vaadin-button';

import { InternalUpdatePaymentMethodFormCcTokenControl } from './InternalUpdatePaymentMethodFormCcTokenControl';

customElements.define(
  'foxy-internal-update-payment-method-form-cc-token-control',
  InternalUpdatePaymentMethodFormCcTokenControl
);

export { InternalUpdatePaymentMethodFormCcTokenControl };
