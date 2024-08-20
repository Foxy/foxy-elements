import '../InternalAsyncListControl/index';
import '../InternalEditableControl/index';
import '../InternalForm/index';

import '../../public/NucleonElement/index';
import '../../public/FormDialog/index';
import '../../public/I18n/index';

import { InternalResourcePickerControlForm } from './InternalResourcePickerControlForm';
import { InternalResourcePickerControl } from './InternalResourcePickerControl';

customElements.define(
  'foxy-internal-resource-picker-control-form',
  InternalResourcePickerControlForm
);

customElements.define('foxy-internal-resource-picker-control', InternalResourcePickerControl);

export { InternalResourcePickerControl };
