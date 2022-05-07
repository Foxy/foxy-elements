import '@vaadin/vaadin-button';
import '@polymer/iron-icons/communication-icons';
import '@polymer/iron-icons';

import '../AttributeCard/index';
import '../AttributeForm/index';
import '../CustomFieldForm/index';
import '../AppliedTaxCard/index';
import '../CustomFieldCard/index';
import '../DiscountCard/index';
import '../ShipmentCard/index';
import '../PaymentCard/index';
import '../ItemForm/index';
import '../I18n/index';

import '../../internal/InternalCollectionCard/index';

import './internal/InternalTransactionCustomerControl/index';
import './internal/InternalTransactionActionsControl/index';
import './internal/InternalTransactionSummaryControl/index';

import { Transaction } from './Transaction';

customElements.define('foxy-transaction', Transaction);

export { Transaction };
