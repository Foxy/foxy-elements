import '@vaadin/vaadin-notification';
import '@vaadin/vaadin-button';

import '../InternalConfirmDialog/index';
import '../InternalControl/index';

import '../../public/I18n/index';

import { InternalPostActionControl } from './InternalPostActionControl';

customElements.define('foxy-internal-post-action-control', InternalPostActionControl);

export { InternalPostActionControl };
