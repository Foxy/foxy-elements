import '@vaadin/vaadin-button';

import '../../public/I18n/index';
import '../InternalControl/index';

import { InternalUndoControl } from './InternalUndoControl';

customElements.define('foxy-internal-undo-control', InternalUndoControl);

export { InternalUndoControl };
