import '@vaadin/vaadin-button';

import '../../internal/InternalForm/index';

import '../QueryBuilder/index';
import '../I18n/index';

import { FilterAttributeForm } from './FilterAttributeForm';

customElements.define('foxy-filter-attribute-form', FilterAttributeForm);

export { FilterAttributeForm };
