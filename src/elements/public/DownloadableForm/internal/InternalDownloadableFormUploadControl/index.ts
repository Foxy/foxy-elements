import '../../../../internal/InternalControl/index';
import '@vaadin/vaadin-upload';
import '../../../I18n/index';
import './style';

import { InternalDownloadableFormUploadControl } from './InternalDownloadableFormUploadControl';

customElements.define(
  'foxy-internal-downloadable-form-upload-control',
  InternalDownloadableFormUploadControl
);

export { InternalDownloadableFormUploadControl };
