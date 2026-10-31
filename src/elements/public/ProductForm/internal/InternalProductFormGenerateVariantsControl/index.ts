import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../../../../internal/InternalControl/index';

import { InternalProductFormGenerateVariantsControl } from './InternalProductFormGenerateVariantsControl';

customElements.define(
  'foxy-internal-product-form-generate-variants-control',
  InternalProductFormGenerateVariantsControl
);

export { InternalProductFormGenerateVariantsControl };
