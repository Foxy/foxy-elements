import '@vaadin/vaadin-button';

import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalNumberControl/index';

import '../I18n/index';

import { Pagination } from './Pagination';

customElements.define('foxy-pagination', Pagination);

export { Pagination };
