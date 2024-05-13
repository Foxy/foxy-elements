import '@vaadin/vaadin-checkbox';

import '../../public/CollectionPage/index';
import '../../public/NucleonElement/index';
import '../../public/Pagination/index';
import '../../public/I18n/index';

import '../InternalEditableControl/index';

import { InternalAsyncResourceLinkListControl } from './InternalAsyncResourceLinkListControl';

customElements.define(
  'foxy-internal-async-resource-link-list-control',
  InternalAsyncResourceLinkListControl
);

export { InternalAsyncResourceLinkListControl };
