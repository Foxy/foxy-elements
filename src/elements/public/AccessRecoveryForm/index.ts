import '@vaadin/vaadin-text-field/vaadin-email-field';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-lumo-styles/icons';
import '@polymer/iron-icon';
import '../../internal/InternalSandbox/index';
import '../Spinner/index';
import '../I18n/index';

import { AccessRecoveryForm } from './AccessRecoveryForm';

customElements.define('foxy-access-recovery-form', AccessRecoveryForm);

export { AccessRecoveryForm };
