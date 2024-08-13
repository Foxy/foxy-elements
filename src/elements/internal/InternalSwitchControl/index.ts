import '@vaadin-component-factory/vcf-tooltip';
import '../InternalEditableControl/index';
import '../../public/I18n/index';

import { InternalSwitchControl as Control } from './InternalSwitchControl';

customElements.define('foxy-internal-switch-control', Control);

export { Control as InternalSwitchControl };
