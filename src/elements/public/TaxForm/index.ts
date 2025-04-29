import '../../internal/InternalAsyncResourceLinkListControl/index';
import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalSwitchControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../NativeIntegrationCard/index';
import '../ItemCategoryCard/index';
import '../NucleonElement/index';

import { TaxForm } from './TaxForm';

customElements.define('foxy-tax-form', TaxForm);

export { TaxForm };
