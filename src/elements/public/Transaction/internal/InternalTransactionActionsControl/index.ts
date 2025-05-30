import '@vaadin/vaadin-button';

import '../../../../internal/InternalPostActionControl/index';
import '../../../../internal/InternalControl/index';

import '../../../NucleonElement/index';
import '../../../I18n/index';

import { InternalTransactionActionsControl as Control } from './InternalTransactionActionsControl';

customElements.define('foxy-internal-transaction-actions-control', Control);

export { Control as InternalTransactionActionsControl };
