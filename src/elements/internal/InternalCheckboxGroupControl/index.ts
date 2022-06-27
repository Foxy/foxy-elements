import '@vaadin/vaadin-checkbox/vaadin-checkbox-group';
import '@vaadin/vaadin-checkbox/vaadin-checkbox';

import '../InternalEditableControl/index';
import '../../public/I18n/index';

import { InternalCheckboxGroupControl as Control } from './InternalCheckboxGroupControl';

customElements.define('foxy-internal-checkbox-group-control', Control);

export { Control as InternalCheckboxGroupControl };
