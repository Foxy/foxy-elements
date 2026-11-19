import '@vaadin/vaadin-text-field/vaadin-text-area';
import '../../../utils/composed-vaadin-input';
import '../InternalEditableControl/index';
import { InternalTextAreaControl as Control } from './InternalTextAreaControl';

customElements.define('foxy-internal-text-area-control', Control);

export { Control as InternalTextAreaControl };
