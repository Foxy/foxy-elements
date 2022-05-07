import type { InternalConfirmDialog } from '../InternalConfirmDialog/InternalConfirmDialog';
import type { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import type { TemplateResult } from 'lit-element';
import type { ButtonElement } from '@vaadin/vaadin-button';

import { InternalControl } from '../InternalControl/InternalControl';
import { html } from 'lit-element';

export class InternalDeleteControl extends InternalControl {
  infer = 'delete';

  renderControl(): TemplateResult {
    return html`
      <foxy-internal-confirm-dialog
        data-testid="confirm"
        message="delete_prompt"
        confirm="delete"
        cancel="cancel"
        header="delete"
        theme="primary error"
        lang=${this.lang}
        ns=${this.ns}
        id="confirm"
        @hide=${(evt: DialogHideEvent) => !evt.detail.cancelled && this.nucleon?.delete()}
      >
      </foxy-internal-confirm-dialog>

      <vaadin-button
        data-testid="delete"
        theme="primary error"
        class="w-full"
        ?disabled=${this.disabled || this.readonly}
        @click=${(evt: CustomEvent) => {
          const confirm = this.renderRoot.querySelector('#confirm') as InternalConfirmDialog;
          confirm.show(evt.currentTarget as ButtonElement);
        }}
      >
        <foxy-i18n ns=${this.ns} key="delete" lang=${this.lang}></foxy-i18n>
      </vaadin-button>
    `;
  }
}
