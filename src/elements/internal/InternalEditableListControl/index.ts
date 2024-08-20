import '@vaadin-component-factory/vcf-tooltip';
import '@vaadin/vaadin-icons';
import '@polymer/iron-icon';

import '../InternalEditableControl/index';

import { InternalEditableListControl } from './InternalEditableListControl';

customElements.define('foxy-internal-editable-list-control', InternalEditableListControl);

export { InternalEditableListControl };
