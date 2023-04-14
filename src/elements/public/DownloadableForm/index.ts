import './internal/InternalDownloadableFormUploadControl/index';
import '../../internal/InternalAsyncComboBoxControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';
import '../NucleonElement/index';

import { DownloadableForm } from './DownloadableForm';

customElements.define('foxy-downloadable-form', DownloadableForm);

export { DownloadableForm };
