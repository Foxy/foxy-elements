import '../I18n/index';

import { DialogWindow } from '../../private/Dialog/DialogWindow';
import { FormDialog } from './FormDialog';

customElements.define('foxy-form-dialog', FormDialog);
customElements.define('foxy-dialog-window', DialogWindow);

export { FormDialog };
