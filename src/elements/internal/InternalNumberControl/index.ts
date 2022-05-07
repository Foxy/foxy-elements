import '@vaadin/vaadin-text-field/vaadin-number-field';
import '../InternalNumberControl/index';
import { InternalNumberControl } from './InternalNumberControl';

customElements.define('foxy-internal-number-control', InternalNumberControl);

export { InternalNumberControl };
