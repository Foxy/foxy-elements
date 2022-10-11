import '@vaadin/vaadin-button';
import '@vaadin/vaadin-tabs';

import '../../internal/InternalAsyncComboBoxControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../PaymentsApiPaymentPresetForm/index';
import '../TemplateConfigForm/index';
import '../EmailTemplateCard/index';
import '../EmailTemplateForm/index';
import '../NucleonElement/index';
import '../TemplateCard/index';
import '../TemplateForm/index';

import { TemplateSetForm } from './TemplateSetForm';

customElements.define('foxy-template-set-form', TemplateSetForm);

export { TemplateSetForm };
