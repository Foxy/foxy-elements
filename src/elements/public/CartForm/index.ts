import '../../internal/InternalAsyncComboBoxControl/index';
import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../AppliedCouponCodeCard/index';
import '../AppliedCouponCodeForm/index';
import '../CustomFieldCard/index';
import '../CustomFieldForm/index';
import '../NucleonElement/index';
import '../AttributeCard/index';
import '../AttributeForm/index';
import '../DiscountCard/index';
import '../ItemCard/index';
import '../ItemForm/index';
import '../I18n/index';

import './internal/InternalCartFormViewAsCustomerControl/index';

import { CartForm } from './CartForm';

customElements.define('foxy-cart-form', CartForm);

export { CartForm };
