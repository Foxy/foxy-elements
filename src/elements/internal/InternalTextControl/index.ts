import '@vaadin/vaadin-text-field/vaadin-text-field';
import '../InternalEditableControl/index';
import { InternalTextControl } from './InternalTextControl';

customElements.define('foxy-internal-text-control', InternalTextControl);

export { InternalTextControl };
