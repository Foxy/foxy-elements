import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-custom-field';
import '@vaadin/vaadin-combo-box';

import '../InternalEditableControl/index';

import { InternalFrequencyControl as Control } from './InternalFrequencyControl';

customElements.define('foxy-internal-frequency-control', Control);

export { Control as InternalFrequencyControl };
