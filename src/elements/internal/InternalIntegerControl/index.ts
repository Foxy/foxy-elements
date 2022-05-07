import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '../InternalEditableControl/index';
import { InternalIntegerControl } from './InternalIntegerControl';

customElements.define('foxy-internal-integer-control', InternalIntegerControl);

export { InternalIntegerControl };
