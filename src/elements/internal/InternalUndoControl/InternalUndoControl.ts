import type { TemplateResult, PropertyDeclarations } from 'lit-element';

import { InternalControl } from '../InternalControl/InternalControl';
import { html } from 'lit-element';

/**
 * Internal control displaying an "Undo" button that triggers Nucleon undo()
 * method on click.
 *
 * @since 1.28.0
 * @element foxy-internal-undo-control
 */
export class InternalUndoControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      theme: { type: String },
    };
  }

  /** Same as the "theme" attribute of the `vaadin-button` element. */
  theme = 'secondary';

  renderControl(): TemplateResult {
    return html`
      <vaadin-button
        theme=${this.theme}
        ?disabled=${this.disabled}
        @click=${() => this.nucleon?.undo()}
      >
        <foxy-i18n infer="" key="caption"></foxy-i18n>
      </vaadin-button>
    `;
  }
}
