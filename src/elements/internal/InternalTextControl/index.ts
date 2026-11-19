import '@vaadin/vaadin-text-field/vaadin-text-field';
import '../InternalEditableControl/index';
import { InternalTextControl as Control } from './InternalTextControl';

customElements.define('foxy-internal-text-control', Control);

export { Control as InternalTextControl };
