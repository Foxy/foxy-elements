import '../../internal/InternalIntegerControl/index';
import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../DiscountDetailCard/index';
import '../CouponDetailCard/index';
import '../ItemOptionCard/index';
import '../ItemOptionForm/index';
import '../AttributeCard/index';
import '../AttributeForm/index';
import '../CouponCard/index';

import './internal/InternalItemFormLineItemDiscountControl/index';
import './internal/InternalItemFormSubscriptionControl/index';
import './internal/InternalItemFormInventoryControl/index';
import './internal/InternalItemFormShippingControl/index';
import './internal/InternalItemFormCartControl/index';

import { ItemForm } from './ItemForm';

customElements.define('foxy-item-form', ItemForm);

export { ItemForm };
