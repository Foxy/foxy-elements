import '@vaadin/vaadin-button';

import '../../../../internal/InternalControl/index';

import '../../../FormDialog/index';
import '../../../I18n/index';

import { InternalCouponFormBulkAddControl } from './InternalCouponFormBulkAddControl';

customElements.define(
  'foxy-internal-coupon-form-bulk-add-control',
  InternalCouponFormBulkAddControl
);

export { InternalCouponFormBulkAddControl };
