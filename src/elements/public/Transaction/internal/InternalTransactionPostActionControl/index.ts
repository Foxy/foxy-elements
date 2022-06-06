import '@vaadin/vaadin-button';

import '../../../../internal/InternalConfirmDialog/index';
import '../../../../internal/InternalControl/index';
import '../../../I18n/index';

import { InternalTransactionPostActionControl as Control } from './InternalTransactionPostActionControl';

customElements.define('foxy-internal-transaction-post-action-control', Control);

export { Control as InternalTransactionPostActionControl };
