import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '../InternalEditableControl/index';
import { InternalIntegerControl as Control } from './InternalIntegerControl';

customElements.define('foxy-internal-integer-control', Control);

export { Control as InternalIntegerControl };
