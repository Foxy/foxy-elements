import '@vaadin/vaadin-button';

import '../InternalControl/index';

import '../../public/FormDialog/index';
import '../../public/I18n/index';

import { InternalBulkAddActionControl } from './InternalBulkAddActionControl';

customElements.define('foxy-internal-bulk-add-action-control', InternalBulkAddActionControl);

export { InternalBulkAddActionControl };
