import '../AttributeCard/index';
import '../AttributeForm/index';
import '../CustomFieldForm/index';
import '../CustomFieldCard/index';
import '../AppliedTaxCard/index';
import '../DiscountCard/index';
import '../ShipmentCard/index';
import '../PaymentCard/index';
import '../ItemForm/index';
import '../I18n/index';

import '../../internal/InternalAsyncDetailsControl/index';
import '../../internal/InternalForm/index';

import './internal/InternalTransactionCustomerControl/index';
import './internal/InternalTransactionActionsControl/index';
import './internal/InternalTransactionSummaryControl/index';

import { Transaction } from './Transaction';

customElements.define('foxy-transaction', Transaction);

export { Transaction };
