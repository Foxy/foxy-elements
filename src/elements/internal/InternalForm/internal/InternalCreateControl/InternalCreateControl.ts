import type { TemplateResult } from 'lit-element';

import { InternalControl } from '../../../InternalControl/InternalControl';
import { html } from 'lit-element';

export class InternalCreateControl extends InternalControl {
  infer = 'create';

  renderControl(): TemplateResult {
    return html`
      <vaadin-button
        data-testid="create"
        class="w-full"
        theme="primary success"
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
