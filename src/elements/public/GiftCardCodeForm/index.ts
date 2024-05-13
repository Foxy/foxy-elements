import '../../internal/InternalResourcePickerControl/index';
import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalDateControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../GiftCardCodeLogCard/index';
import '../CustomerCard/index';

import './internal/InternalGiftCardCodeFormItemControl/index';

import { GiftCardCodeForm } from './GiftCardCodeForm';

customElements.define('foxy-gift-card-code-form', GiftCardCodeForm);

export { GiftCardCodeForm };
