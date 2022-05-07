import '@vaadin/vaadin-combo-box';
import '../InternalEditableControl/index';
import { InternalAsyncComboBoxControl } from './InternalAsyncComboBoxControl';

customElements.define('foxy-internal-async-combo-box-control', InternalAsyncComboBoxControl);

export { InternalAsyncComboBoxControl };
