import '../../internal/InternalResourcePickerControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import './internal/InternalProductCollectionTreeControl/index';

import '../ProductCollectionCard/index';
import '../ItemCategoryCard/index';
import '../I18n/index';

import { ProductCollectionForm } from './ProductCollectionForm';

customElements.define('foxy-product-collection-form', ProductCollectionForm);

export { ProductCollectionForm };
