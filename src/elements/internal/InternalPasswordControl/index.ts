import '@vaadin/vaadin-text-field/vaadin-password-field';
import '../InternalEditableControl/index';
import { InternalPasswordControl as Control } from './InternalPasswordControl';

customElements.define('foxy-internal-password-control', Control);

export { Control as InternalPasswordControl };
