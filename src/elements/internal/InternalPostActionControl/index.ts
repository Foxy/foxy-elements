import '@vaadin/vaadin-button';

import '../InternalControl/index';

import '../../public/Spinner/index';
import '../../public/I18n/index';

import { InternalPostActionControlDialog } from './InternalPostActionControlDialog';
import { InternalPostActionControl } from './InternalPostActionControl';

customElements.define('foxy-internal-post-action-control', InternalPostActionControl);
customElements.define('foxy-internal-post-action-control-dialog', InternalPostActionControlDialog);

export { InternalPostActionControl };
