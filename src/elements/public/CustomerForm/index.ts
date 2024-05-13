import 'vanilla-hcaptcha';

import '../../internal/InternalRadioGroupControl/index';
import '../../internal/InternalPasswordControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import './internal/InternalCustomerFormLegalNoticeControl/index';

import { CustomerForm } from './CustomerForm';

customElements.define('foxy-customer-form', CustomerForm);

export { CustomerForm };
