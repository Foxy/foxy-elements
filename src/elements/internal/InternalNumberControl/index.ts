import '@vaadin/vaadin-text-field/vaadin-number-field';
import '../InternalEditableControl/index';
import { InternalNumberControl } from './InternalNumberControl';

customElements.define('foxy-internal-number-control', InternalNumberControl);

export { InternalNumberControl };
