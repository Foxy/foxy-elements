import '../../internal/InternalResourcePickerControl/index';
import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalFrequencyControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalDateControl/index';
import '../../internal/InternalForm/index';

import '../DiscountDetailCard/index';
import '../CouponDetailCard/index';
import '../ItemCategoryCard/index';
import '../DiscountBuilder/index';
import '../ItemOptionCard/index';
import '../ItemOptionForm/index';
import '../NucleonElement/index';
import '../AttributeCard/index';
import '../AttributeForm/index';

import { ItemForm } from './ItemForm';

customElements.define('foxy-item-form', ItemForm);

export { ItemForm };
