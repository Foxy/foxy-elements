import '../../internal/InternalAsyncResourceLinkListControl/index';
import '../../internal/InternalBulkAddActionControl/index';
import '../../internal/InternalEditableListControl/index';
import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalFrequencyControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import '../GenerateCodesForm/index';
import '../GiftCardCodesForm/index';
import '../ItemCategoryCard/index';
import '../GiftCardCodeCard/index';
import '../GiftCardCodeForm/index';
import '../NucleonElement/index';
import '../AttributeCard/index';
import '../AttributeForm/index';

import './internal/InternalGiftCardFormProvisioningControl/index';

import { GiftCardForm } from './GiftCardForm';

customElements.define('foxy-gift-card-form', GiftCardForm);

export { GiftCardForm };
