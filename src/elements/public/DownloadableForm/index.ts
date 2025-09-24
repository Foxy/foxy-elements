import './internal/InternalDownloadableFormUploadControl/index';
import '../../internal/InternalResourcePickerControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';
import '../ItemCategoryCard/index';

import { DownloadableForm } from './DownloadableForm';

customElements.define('foxy-downloadable-form', DownloadableForm);

export { DownloadableForm };
