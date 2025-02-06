import '@vaadin/vaadin-button';
import '../../../../internal/InternalControl/index';
import '../../../I18n/index';
import '../InternalTransactionPostActionControl/index';

import { InternalTransactionActionsControl as Control } from './InternalTransactionActionsControl';

customElements.define('foxy-internal-transaction-actions-control', Control);

export { Control as InternalTransactionActionsControl };
