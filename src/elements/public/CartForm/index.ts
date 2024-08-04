import '../../internal/InternalResourcePickerControl/index';
import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalSwitchControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../AppliedCouponCodeCard/index';
import '../AppliedCouponCodeForm/index';
import '../CustomFieldCard/index';
import '../CustomFieldForm/index';
import '../TemplateSetCard/index';
import '../NucleonElement/index';
import '../AttributeCard/index';
import '../AttributeForm/index';
import '../CustomerCard/index';
import '../ItemCard/index';
import '../ItemForm/index';
import '../I18n/index';

import './internal/InternalCartFormCreateSessionAction/index';
import './internal/InternalCartFormAddressSummaryItem/index';
import './internal/InternalCartFormPaymentMethodForm/index';
import './internal/InternalCartFormPaymentMethodCard/index';
import './internal/InternalCartFormTotalsControl/index';

import { CartForm } from './CartForm';

customElements.define('foxy-cart-form', CartForm);

export { CartForm };
