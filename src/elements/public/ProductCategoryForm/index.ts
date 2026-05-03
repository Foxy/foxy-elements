import '../../internal/InternalResourcePickerControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import './internal/InternalProductCategoryTreeControl/index';

import '../ProductCategoryCard/index';
import '../I18n/index';

import { ProductCategoryForm } from './ProductCategoryForm';

customElements.define('foxy-product-category-form', ProductCategoryForm);

export { ProductCategoryForm };
