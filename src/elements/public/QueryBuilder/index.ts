import '../I18n/index';
import '@polymer/iron-icons';
import '@polymer/iron-icon';

import { QueryBuilder } from './QueryBuilder';
import { QueryBuilderRule } from './QueryBuilderRule';

customElements.define('foxy-query-builder-rule', QueryBuilderRule);
customElements.define('foxy-query-builder', QueryBuilder);

export { QueryBuilder, QueryBuilderRule };
