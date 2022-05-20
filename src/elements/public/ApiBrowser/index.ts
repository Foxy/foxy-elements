import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';

import '../CollectionPage/index';
import '../Pagination/index';

import './internal/InternalApiBrowserResourceForm/index';

import { ApiBrowser } from './ApiBrowser';

customElements.define('foxy-api-browser', ApiBrowser);

export { ApiBrowser };
