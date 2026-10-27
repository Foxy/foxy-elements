import '@vaadin/vaadin-text-field/vaadin-text-area';
import '../../../../internal/InternalEditableControl/index';

import { InternalProductFormDescriptionControl } from './InternalProductFormDescriptionControl';

customElements.define(
  'foxy-internal-product-form-description-control',
  InternalProductFormDescriptionControl
);

export { InternalProductFormDescriptionControl };
