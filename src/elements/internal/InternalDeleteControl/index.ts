import '@vaadin/vaadin-button';

import '../../public/I18n/index';
import '../InternalConfirmDialog/index';
import '../InternalControl/index';

import { InternalDeleteControl } from './InternalDeleteControl';

customElements.define('foxy-internal-delete-control', InternalDeleteControl);

export { InternalDeleteControl };
