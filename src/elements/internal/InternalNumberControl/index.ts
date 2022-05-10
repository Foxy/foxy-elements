import '@vaadin/vaadin-text-field/vaadin-number-field';
import '../InternalEditableControl/index';
import { InternalNumberControl as Control } from './InternalNumberControl';

customElements.define('foxy-internal-number-control', Control);

export { Control as InternalNumberControl };
