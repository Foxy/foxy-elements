import '@vaadin/vaadin-lumo-styles/color.js';
import '@vaadin/vaadin-lumo-styles/sizing.js';
import '@vaadin/vaadin-lumo-styles/spacing.js';
import '@vaadin/vaadin-lumo-styles/style.js';
import '@vaadin/vaadin-lumo-styles/typography.js';

import { InternalButton } from './InternalButton';

customElements.define('foxy-internal-button', InternalButton);

declare global {
  interface HTMLElementTagNameMap {
    'foxy-internal-button': InternalButton;
  }
}

export { InternalButton };
