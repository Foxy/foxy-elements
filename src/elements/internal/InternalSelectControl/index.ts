import '@vaadin/vaadin-combo-box';

import '../InternalEditableControl/index';
import '../../public/I18n/index';

import { InternalSelectControl as Control } from './InternalSelectControl';

customElements.define('foxy-internal-select-control', Control);

export { Control as InternalSelectControl };
