import type { TemplateResult, PropertyDeclarations } from 'lit-element';

import { InternalControl } from '../InternalControl/InternalControl';
import { html } from 'lit-element';

/**
 * Internal control displaying a "Create" button that triggers Nucleon form
 * submission on click. The button is disabled if the form is invalid.
 *
 * @since 1.28.0
 * @element foxy-internal-submit-control
 */
export class InternalSubmitControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      theme: { type: String },
    };
  }

  /** Same as the "theme" attribute of the `vaadin-button` element. */
  theme = 'primary';

  renderControl(): TemplateResult {
    return html`
      <vaadin-button
        theme=${this.theme}
        ?disabled=${this.disabled}
        @click=${() => this.nucleon?.submit()}
      >
        <foxy-i18n infer="" key="caption"></foxy-i18n>
      </vaadin-button>
    `;
  }
}
