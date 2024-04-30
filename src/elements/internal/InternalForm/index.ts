import '@vaadin/vaadin-button';

import '../InternalTimestampsControl/index';
import '../InternalCreateControl/index';
import '../InternalDeleteControl/index';

import '../../public/CopyToClipboard/index';
import '../../public/Spinner/index';
import '../../public/I18n/index';

import { InternalForm } from './InternalForm';

customElements.define('foxy-internal-form', InternalForm);

export { InternalForm };
