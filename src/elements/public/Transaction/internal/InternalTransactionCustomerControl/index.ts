import '../../../../internal/InternalControl/index';
import '../../../CustomerCard/index';
import '../../../SwipeActions/index';
import '../../../Spinner/index';
import '../../../I18n/index';

import { InternalTransactionCustomerControl as Control } from './InternalTransactionCustomerControl';

customElements.define('foxy-internal-transaction-customer-control', Control);

export { Control as InternalTransactionCustomerControl };
