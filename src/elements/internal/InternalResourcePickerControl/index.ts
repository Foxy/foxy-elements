import '../InternalAsyncListControl/index';
import '../InternalEditableControl/index';
import '../InternalForm/index';

import '../../public/FormDialog/index';

import { InternalResourcePickerControlForm } from './InternalResourcePickerControlForm';
import { InternalResourcePickerControl } from './InternalResourcePickerControl';

customElements.define(
  'foxy-internal-resource-picker-control-form',
  InternalResourcePickerControlForm
);

customElements.define('foxy-internal-resource-picker-control', InternalResourcePickerControl);

export { InternalResourcePickerControl };
