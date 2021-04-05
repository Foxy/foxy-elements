import '@vaadin/vaadin-text-field/vaadin-email-field';
import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
import '../Spinner';
import '../I18n';

import { AccessRecoveryForm } from './AccessRecoveryForm';

customElements.define('foxy-access-recovery-form', AccessRecoveryForm);

export { AccessRecoveryForm };
