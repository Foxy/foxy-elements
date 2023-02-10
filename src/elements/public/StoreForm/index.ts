import '@vaadin/vaadin-button';

import '../../internal/InternalCheckboxGroupControl/index';
import '../../internal/InternalAsyncComboBoxControl/index';
import '../../internal/InternalEditableListControl/index';
import '../../internal/InternalRadioGroupControl/index';
import '../../internal/InternalFrequencyControl/index';
import '../../internal/InternalPasswordControl/index';
import '../../internal/InternalIntegerControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../NucleonElement/index';
import '../I18n/index';

import { StoreForm } from './StoreForm';

customElements.define('foxy-store-form', StoreForm);

export { StoreForm };
