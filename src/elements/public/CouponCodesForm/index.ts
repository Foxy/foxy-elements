import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';

import { CouponCodesForm } from './CouponCodesForm';
import { InternalCouponCodesFormListItem } from './internal/InternalCouponCodesFormListItem';

customElements.define('foxy-coupon-codes-form', CouponCodesForm);
customElements.define('foxy-internal-coupon-codes-form-list-item', InternalCouponCodesFormListItem);

export { CouponCodesForm };
