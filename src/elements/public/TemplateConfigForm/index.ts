import '../../internal/InternalEditableListControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalSwitchControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalSourceControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../NucleonElement/index';
import '../I18n/index';

import './internal/InternalTemplateConfigFormSupportedCardsControl/index';
import './internal/InternalTemplateConfigFormFilterValuesControl/index';

import { TemplateConfigForm } from './TemplateConfigForm';

customElements.define('foxy-template-config-form', TemplateConfigForm);

export { TemplateConfigForm };
