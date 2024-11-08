import '../../../../internal/InternalEditableControl/index';
import '../../../NucleonElement/index';

import { InternalTemplateConfigFormFilterValuesControlItem } from './InternalTemplateConfigFormFilterValuesControlItem';
import { InternalTemplateConfigFormFilterValuesControl } from './InternalTemplateConfigFormFilterValuesControl';

customElements.define(
  'foxy-internal-template-config-form-filter-values-control-item',
  InternalTemplateConfigFormFilterValuesControlItem
);

customElements.define(
  'foxy-internal-template-config-form-filter-values-control',
  InternalTemplateConfigFormFilterValuesControl
);

export { InternalTemplateConfigFormFilterValuesControl };
