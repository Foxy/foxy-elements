import '@polymer/iron-icons';
import '@polymer/iron-icon';

import '../InternalControl/index';
import '../../public/I18n/index';

import { InternalDetails as Control } from './InternalDetails';

customElements.define('foxy-internal-details', Control);

export { Control as InternalDetails };
