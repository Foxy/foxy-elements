import { PropertyDeclarations, html, TemplateResult } from 'lit-element';
import { InternalConfirmDialog } from '../../../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { DialogHideEvent } from '../../../../private/Dialog/DialogHideEvent';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { ButtonElement } from '@vaadin/vaadin-button';

export class InternalTransactionPostActionControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __state: { type: String },
      theme: { type: String },
      href: { type: String },
    };
  }

  theme: string | null = null;

  href: string | null = null;

  private __state = 'idle';

  renderControl(): TemplateResult {
    const state = this.__state;
    const theme = state === 'fail' ? 'error' : state === 'idle' ? this.theme : '';

    return html`
      <foxy-internal-confirm-dialog
        header="header"
        infer="confirm"
        id="confirm"
        @hide=${(evt: DialogHideEvent) => !evt.detail.cancelled && this.__submit()}
      >
      </foxy-internal-confirm-dialog>

      <vaadin-button
        class="w-full"
        theme="${theme} tertiary"
        ?disabled=${state === 'busy' || this.disabled}
        @click=${(evt: CustomEvent) => {
          const confirm = this.renderRoot.querySelector('#confirm') as InternalConfirmDialog;
          confirm.show(evt.currentTarget as ButtonElement);
        }}
      >
        <foxy-i18n key=${state} infer=""></foxy-i18n>
      </vaadin-button>
    `;
  }

  private async __submit(): Promise<void> {
    if (this.__state === 'busy') return;

    try {
      this.__state = 'busy';

      const api = new NucleonElement.API(this);
      const response = await api.fetch(this.href ?? '', { method: 'POST' });

      this.__state = response.ok ? 'idle' : 'fail';
      if (response.ok) this.dispatchEvent(new CustomEvent('done'));
    } catch {
      this.__state = 'fail';
    }
  }
}
