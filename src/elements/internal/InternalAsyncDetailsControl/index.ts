import '../../public/CollectionPage/index';
import '../../public/FormDialog/index';
import '../../public/Pagination/index';
import '../../public/I18n/index';

import '../InternalDetails/index';

import { InternalAsyncDetailsControl as Control } from './InternalAsyncDetailsControl';

customElements.define('foxy-internal-async-details-control', Control);

export { Control as InternalAsyncDetailsControl };
