import '@vaadin/vaadin-radio-button/vaadin-radio-button';
import '@vaadin/vaadin-radio-button/vaadin-radio-group';

import '../InternalEditableControl/index';
import '../../public/I18n/index';

import { InternalRadioGroupControl as Control } from './InternalRadioGroupControl';

customElements.define('foxy-internal-radio-group-control', Control);

export { Control as InternalRadioGroupControl };
