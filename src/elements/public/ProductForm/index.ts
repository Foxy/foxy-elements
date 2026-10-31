import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalArrayMapControl/index';
import '../../internal/InternalRadioGroupControl/index';
import '../../internal/InternalResourcePickerControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import './internal/InternalProductFormDescriptionControl/index';
import './internal/InternalProductFormImagesControl/index';

import '../ProductStockRuleCard/index';
import '../ProductStockRuleForm/index';
import '../CopyToClipboard/index';
import '../ProductTagCard/index';
import '../ProductCard/index';
import '../ProductTagForm/index';
import '../I18n/index';

import { ProductForm } from './ProductForm';

customElements.define('foxy-product-form', ProductForm);

export { ProductForm };
