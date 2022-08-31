import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';

import '../../public/CollectionPage/index';
import '../../public/SwipeActions/index';
import '../../public/FormDialog/index';
import '../../public/Pagination/index';
import '../../public/I18n/index';

import '../InternalConfirmDialog/index';
import '../InternalControl/index';

import { InternalAsyncListControl as Control } from './InternalAsyncListControl';

customElements.define('foxy-internal-async-list-control', Control);

export { Control as InternalAsyncListControl };
