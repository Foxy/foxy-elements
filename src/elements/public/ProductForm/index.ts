import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalResourcePickerControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../ProductTagCard/index';
import '../ProductTagForm/index';
import '../I18n/index';

import { ProductForm } from './ProductForm';

customElements.define('foxy-product-form', ProductForm);

export { ProductForm };
