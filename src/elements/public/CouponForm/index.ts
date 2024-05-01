import '../../internal/InternalAsyncResourceLinkListControl/index';
import '../../internal/InternalCheckboxGroupControl/index';
import '../../internal/InternalEditableListControl/index';
import '../../internal/InternalQueryBuilderControl/index';
import '../../internal/InternalIntegerControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalDateControl/index';
import '../../internal/InternalForm/index';

import '../GenerateCodesForm/index';
import '../ItemCategoryCard/index';
import '../CouponCodesForm/index';
import '../CouponCodeCard/index';
import '../CouponCodeForm/index';
import '../NucleonElement/index';
import '../AttributeForm/index';
import '../AttributeCard/index';

import './internal/InternalCouponFormBulkAddControl/index';
import './internal/InternalCouponFormRulesControl/index';

import { CouponForm } from './CouponForm';

customElements.define('foxy-coupon-form', CouponForm);

export { CouponForm };
