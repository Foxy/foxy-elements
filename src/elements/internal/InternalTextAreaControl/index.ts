import '@vaadin/vaadin-text-field/vaadin-text-area';
import '../InternalEditableControl/index';
import { InternalTextAreaControl as Control } from './InternalTextAreaControl';

customElements.define('foxy-internal-text-area-control', Control);

export { Control as InternalTextAreaControl };
