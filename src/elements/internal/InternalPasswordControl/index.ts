import '@vaadin/vaadin-text-field/vaadin-password-field';
import '../../public/CopyToClipboard/index';
import '../InternalEditableControl/index';
import './vaadinStyles';

import { InternalPasswordControl as Control } from './InternalPasswordControl';

customElements.define('foxy-internal-password-control', Control);

export { Control as InternalPasswordControl };
