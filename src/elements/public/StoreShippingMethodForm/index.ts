import '../../internal/InternalAsyncResourceLinkListControl/index';
import '../../internal/InternalResourcePickerControl/index';
import '../../internal/InternalCheckboxGroupControl/index';
import '../../internal/InternalPasswordControl/index';
import '../../internal/InternalSourceControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../ShippingContainerCard/index';
import '../ShippingDropTypeCard/index';
import '../ShippingServiceCard/index';
import '../ShippingMethodCard/index';
import '../NucleonElement/index';

import { StoreShippingMethodForm } from './StoreShippingMethodForm';

customElements.define('foxy-store-shipping-method-form', StoreShippingMethodForm);

export { StoreShippingMethodForm };
