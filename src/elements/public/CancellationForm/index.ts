import '@vaadin/vaadin-button';
import '../../internal/InternalCalendar/index';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';

import { CancellationForm } from './CancellationForm';

customElements.define('foxy-cancellation-form', CancellationForm);

export { CancellationForm };
