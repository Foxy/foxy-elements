import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalSourceControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../I18n/index';

import './internal/InternalTemplateFormAsyncAction/index';

import { TemplateForm } from './TemplateForm';

customElements.define('foxy-template-form', TemplateForm);

export { TemplateForm };
