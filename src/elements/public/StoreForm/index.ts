import 'vanilla-hcaptcha';

import '../../internal/InternalEditableListControl/index';
import '../../internal/InternalFrequencyControl/index';
import '../../internal/InternalPasswordControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalSwitchControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../NucleonElement/index';
import '../I18n/index';

import { StoreForm } from './StoreForm';

customElements.define('foxy-store-form', StoreForm);

export { StoreForm };
