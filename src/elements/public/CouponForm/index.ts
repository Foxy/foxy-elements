import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-date-picker';
import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
import '../../internal/InternalEditableListControl/index';
import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalSandbox/index';
import '../GenerateCodesForm/index';
import '../CouponCodesForm/index';
import '../CopyToClipboard/index';
import '../DiscountBuilder/index';
import '../CouponCodeForm/index';
import '../QueryBuilder/index';
import '../Pagination/index';
import '../FormDialog/index';
import '../Spinner/index';
import '../Table/index';
import '../I18n/index';

import { CouponForm } from './CouponForm';

customElements.define('foxy-coupon-form', CouponForm);

export { CouponForm };
