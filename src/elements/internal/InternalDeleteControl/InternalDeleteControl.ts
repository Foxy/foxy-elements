import type { InternalConfirmDialog } from '../InternalConfirmDialog/InternalConfirmDialog';
import type { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { ButtonElement } from '@vaadin/vaadin-button';

import { InternalControl } from '../InternalControl/InternalControl';
import { html } from 'lit-element';

/**
 * Internal control displaying a "Delete" button that triggers resource
 * deletion in Nucleon on click.
 *
 * @since 1.17.0
 * @element foxy-internal-delete-control
 */
export class InternalDeleteControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      theme: { type: String },
    };
  }

  /** Same as the "theme" attribute of the `vaadin-button` element. */
  theme = 'error';

  renderControl(): TemplateResult {
    return html`
      <foxy-internal-confirm-dialog
        message="delete_prompt"
        confirm="delete"
        cancel="cancel"
        header="delete"
        theme="primary error"
        infer=""
        id="confirm"
        @hide=${(evt: DialogHideEvent) => !evt.detail.cancelled && this.nucleon?.delete()}
      >
      </foxy-internal-confirm-dialog>

      <vaadin-button
        data-testid="delete"
        theme=${this.theme}
        class="w-full"
        ?disabled=${this.disabled || this.readonly}
        @click=${(evt: CustomEvent) => {
          const confirm = this.renderRoot.querySelector('#confirm') as InternalConfirmDialog;
          confirm.show(evt.currentTarget as ButtonElement);
        }}
      >
        <foxy-i18n infer="" key="delete"></foxy-i18n>
      </vaadin-button>
    `;
  }
}
