import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-custom-field';
import '@vaadin/vaadin-combo-box';
import '../InternalEditableControl/index';
import '../../public/I18n/index';
import { InternalFrequencyControl } from './InternalFrequencyControl';

customElements.define('foxy-internal-frequency-control', InternalFrequencyControl);

export { InternalFrequencyControl };
