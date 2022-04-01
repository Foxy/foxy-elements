import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-button';

import { CouponCodeForm } from './CouponCodeForm';

customElements.define('foxy-coupon-code-form', CouponCodeForm);

export { CouponCodeForm };
