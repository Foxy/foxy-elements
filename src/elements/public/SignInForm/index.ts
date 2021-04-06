import '@vaadin/vaadin-text-field/vaadin-email-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-lumo-styles/icons';
import '@polymer/iron-icon';
import '../Spinner';
import '../I18n';

import { SignInForm } from './SignInForm';

customElements.define('foxy-sign-in-form', SignInForm);

export { SignInForm };
