import '@vaadin/vaadin-button';

import '../../../../internal/InternalEditableControl/index';
import '../../../../internal/InternalSelectControl/index';
import '../../../../internal/InternalTextControl/index';

import '../../../NucleonElement/index';

import { InternalCartFormAddressSummaryItem } from './InternalCartFormAddressSummaryItem';

customElements.define(
  'foxy-internal-cart-form-address-summary-item',
  InternalCartFormAddressSummaryItem
);

export { InternalCartFormAddressSummaryItem };
