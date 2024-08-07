import '@vaadin/vaadin-date-picker';
import '../InternalEditableControl/index';
import './vaadinStyles';

import { InternalDateControl as Control } from './InternalDateControl';

customElements.define('foxy-internal-date-control', Control);

export { Control as InternalDateControl };
