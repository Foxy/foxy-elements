import '../BillingAddressCard/index';
import '../AttributeCard/index';
import '../AttributeForm/index';
import '../CustomFieldForm/index';
import '../CustomFieldCard/index';
import '../CopyToClipboard/index';
import '../ShipmentCard/index';
import '../PaymentCard/index';
import '../ItemCard/index';
import '../ItemForm/index';
import '../I18n/index';

import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalForm/index';

import './internal/InternalTransactionCustomerControl/index';
import './internal/InternalTransactionActionsControl/index';
import './internal/InternalTransactionSummaryControl/index';

import { Transaction } from './Transaction';

customElements.define('foxy-transaction', Transaction);

export { Transaction };
