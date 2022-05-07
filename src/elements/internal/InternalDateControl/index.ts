import '@vaadin/vaadin-date-picker';
import '../InternalEditableControl/index';
import { InternalDateControl } from './InternalDateControl';

customElements.define('foxy-internal-date-control', InternalDateControl);

export { InternalDateControl };
