import '@vaadin/vaadin-text-field/vaadin-text-area';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../Spinner';
import '../I18N';

import { AttributeFormElement } from './AttributeFormElement';

customElements.define('foxy-attribute-form', AttributeFormElement);

export { AttributeFormElement };
