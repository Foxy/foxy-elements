import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-checkbox';
import '@vaadin/vaadin-button';
import '../../../../internal/InternalColorPicker/index';
import '../../../../internal/InternalControl/index';

import { InternalProductFormOptionsControl } from './InternalProductFormOptionsControl';

customElements.define(
  'foxy-internal-product-form-options-control',
  InternalProductFormOptionsControl
);

export { InternalProductFormOptionsControl };
