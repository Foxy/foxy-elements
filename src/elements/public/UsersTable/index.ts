import '@vaadin/vaadin-button';
import '../FormDialog/index';
import '../UserForm/index';
import '../Spinner/index';
import '../I18n/index';

import { UsersTable } from './UsersTable';

customElements.define('foxy-users-table', UsersTable);

export { UsersTable };
