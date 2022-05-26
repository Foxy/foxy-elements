import type { TemplateResult, PropertyDeclarations } from 'lit-element';

import { InternalControl } from '../InternalControl/InternalControl';
import { html } from 'lit-element';

export class InternalCreateControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      theme: { type: String },
    };
  }

  infer = 'create';

  theme = 'primary success';

  renderControl(): TemplateResult {
    return html`
      <vaadin-button
        data-testid="create"
        class="w-full"
        theme=${this.theme}
        ?disabled=${this.disabled || this.__isInvalid}
        @click=${() => this.nucleon?.submit()}
      >
        <foxy-i18n ns=${this.ns} key="create" lang=${this.lang}></foxy-i18n>
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
