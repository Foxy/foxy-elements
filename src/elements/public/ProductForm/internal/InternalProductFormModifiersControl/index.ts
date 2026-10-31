import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-checkbox';
import '@vaadin/vaadin-button';
import '../../../../internal/InternalControl/index';

import { InternalProductFormModifiersControl } from './InternalProductFormModifiersControl';

customElements.define(
  'foxy-internal-product-form-modifiers-control',
  InternalProductFormModifiersControl
);

export { InternalProductFormModifiersControl };
