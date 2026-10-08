import '@vaadin/vaadin-text-field';
import '../../internal/InternalButton/index';
import '@polymer/iron-icons';
import '@polymer/iron-icon';

import '../CollectionPage/index';
import '../Pagination/index';
import '../I18n/index';

import './internal/InternalApiBrowserResourceForm/index';

import { ApiBrowser } from './ApiBrowser';

customElements.define('foxy-api-browser', ApiBrowser);

export { ApiBrowser };
