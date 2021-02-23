import '@vaadin/vaadin-text-field/vaadin-text-area';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../Spinner/index';
import '../I18n/index';

import { AttributeFormElement } from './AttributeFormElement';

customElements.define('foxy-attribute-form', AttributeFormElement);

export { AttributeFormElement };
