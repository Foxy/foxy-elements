import '../../internal/InternalEditableListControl/index';
import '../../internal/InternalPasswordControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalSwitchControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../NucleonElement/index';

import './internal/InternalNativeIntegrationFormCodeMapControl/index';

import { NativeIntegrationForm } from './NativeIntegrationForm';

customElements.define('foxy-native-integration-form', NativeIntegrationForm);

export { NativeIntegrationForm };
