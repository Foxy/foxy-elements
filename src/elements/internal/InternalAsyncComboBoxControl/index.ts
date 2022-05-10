import '@vaadin/vaadin-combo-box';
import '../InternalEditableControl/index';
import { InternalAsyncComboBoxControl as Control } from './InternalAsyncComboBoxControl';

customElements.define('foxy-internal-async-combo-box-control', Control);

export { Control as InternalAsyncComboBoxControl };
