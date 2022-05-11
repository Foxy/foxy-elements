import '../../../../internal/InternalDetailsControl/index';
import '../../../../internal/InternalControl/index';

import '../../../CustomerCard/index';
import '../../../FormDialog/index';
import '../../../Customer/index';

import { InternalTransactionCustomerControl as Control } from './InternalTransactionCustomerControl';

customElements.define('foxy-internal-transaction-customer-control', Control);

export { Control as InternalTransactionCustomerControl };
