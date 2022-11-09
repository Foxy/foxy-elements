import '@polymer/iron-icons/maps-icons';
import '@polymer/iron-icon';

import '../../internal/InternalAsyncComboBoxControl/index';
import '../../internal/InternalCheckboxGroupControl/index';
import '../../internal/InternalTextAreaControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../NucleonElement/index';
import '../I18n/index';

import './internal/InternalStoreShippingMethodFormServicesControl/index';

import { StoreShippingMethodForm } from './StoreShippingMethodForm';

customElements.define('foxy-store-shipping-method-form', StoreShippingMethodForm);

export { StoreShippingMethodForm };
