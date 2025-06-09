import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalSourceControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalSwitchControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../I18n/index';

import './internal/InternalEmailTemplateFormAsyncAction/index';

import { EmailTemplateForm } from './EmailTemplateForm';

customElements.define('foxy-email-template-form', EmailTemplateForm);

export { EmailTemplateForm };
