import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-combo-box';
import '../../../CopyToClipboard/index';
import '../../../../internal/InternalControl/index';

import { InternalProductFormCartLinkControl } from './InternalProductFormCartLinkControl';

customElements.define(
  'foxy-internal-product-form-cart-link-control',
  InternalProductFormCartLinkControl
);

export { InternalProductFormCartLinkControl };
