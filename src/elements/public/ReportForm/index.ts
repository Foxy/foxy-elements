import '@vaadin/vaadin-date-time-picker';
import '@vaadin/vaadin-date-picker';
import '@vaadin/vaadin-checkbox';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-select';
import '../../internal/InternalConfirmDialog/index';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';

import { ReportForm } from './ReportForm';

customElements.define('foxy-report-form', ReportForm);

export { ReportForm };
