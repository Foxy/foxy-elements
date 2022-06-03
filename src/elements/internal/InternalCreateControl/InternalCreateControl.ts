import type { TemplateResult, PropertyDeclarations } from 'lit-element';

import { InternalControl } from '../InternalControl/InternalControl';
import { html } from 'lit-element';

/**
 * Internal control displaying a "Create" button that triggers Nucleon form
 * submission on click. The button is disabled if the form is invalid.
 *
 * @since 1.17.0
 * @tag foxy-internal-create-control
 */
export class InternalCreateControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      theme: { type: String },
    };
  }

  /** Same as the "theme" attribute of the `vaadin-button` element. */
  theme = 'primary success';

  renderControl(): TemplateResult {
    return html`
      <vaadin-button
        class="w-full"
        theme=${this.theme}
        ?disabled=${this.disabled || this.__isInvalid}
        @click=${() => this.nucleon?.submit()}
      >
        <foxy-i18n infer="" key="create"></foxy-i18n>
      </vaadin-button>
    `;
  }

  private get __isCleanTemplateInvalid() {
    return !!this.nucleon?.in({ idle: { template: { clean: 'invalid' } } });
  }

  private get __isDirtyTemplateInvalid() {
    return !!this.nucleon?.in({ idle: { template: { dirty: 'invalid' } } });
  }

  private get __isCleanSnapshotInvalid() {
    return !!this.nucleon?.in({ idle: { snapshot: { clean: 'invalid' } } });
  }

  private get __isDirtySnapshotInvalid() {
    return !!this.nucleon?.in({ idle: { snapshot: { dirty: 'invalid' } } });
  }

  private get __isTemplateInvalid() {
    return this.__isCleanTemplateInvalid || this.__isDirtyTemplateInvalid;
  }

  private get __isSnapshotInvalid() {
    return this.__isCleanSnapshotInvalid || this.__isDirtySnapshotInvalid;
  }

  private get __isInvalid() {
    return this.__isSnapshotInvalid || this.__isTemplateInvalid;
  }
}
