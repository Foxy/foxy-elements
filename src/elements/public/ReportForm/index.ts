import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../../internal/InternalConfirmDialog/index';
import '../Spinner/index';
import '../I18n/index';

import { ReportForm } from './ReportForm';

customElements.define('foxy-report-form', ReportForm);

export { ReportForm };
